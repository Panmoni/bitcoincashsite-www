// pnpm i18n:check:dist against seeded built sites: each check fails on its
// own fixture and passes on a clean one. Also the pseudo-locale helpers.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";

import { readPages } from "../../src/i18n/alternates.mjs";
import {
	checkDist,
	checkPseudo,
	dataFallbacks,
	visibleText,
} from "../check-i18n-seo.mjs";
import { pseudoize, pseudoTranslator, unpseudoWords } from "./pseudo.mjs";

// English and Spanish live, French draft, plus a pseudo-locale.
const registry = {
	defaultLocale: "en",
	locales: [
		{ code: "en", bcp47: "en", status: "live" },
		{ code: "es", bcp47: "es", status: "live" },
		{ code: "fr", bcp47: "fr", status: "draft" },
		{ code: "en-XA", bcp47: "en-XA", status: "draft" },
	],
};

const SITE = "https://bchworks.com";
const href = (p) => `${SITE}${p === "/" ? "" : p}`;
/** A built page: its path, lang, hreflang set and body. */
const page = (p, lang, { alternates = [], body = "", canonical = p } = {}) =>
	`<!doctype html><html lang="${lang}"><head>` +
	`<link rel="canonical" href="${href(canonical)}">` +
	alternates
		.map(([l, a]) => `<link rel="alternate" hreflang="${l}" href="${href(a)}">`)
		.join("") +
	`<title>T</title></head><body>${body}</body></html>`;

const PAIR = [
	["en", "/about"],
	["es", "/es/about"],
	["x-default", "/about"],
];

async function site(files) {
	const dir = await mkdtemp(path.join(tmpdir(), "check-dist-"));
	for (const [rel, html] of Object.entries(files)) {
		await mkdir(path.dirname(path.join(dir, rel)), { recursive: true });
		await writeFile(path.join(dir, rel), html);
	}
	return dir;
}

const clean = () => ({
	"about.html": page("/about", "en", {
		alternates: PAIR,
		body: '<a href="/contact">c</a><a href="/es/about" data-locale-switch="es">es</a>',
	}),
	"contact.html": page("/contact", "en"),
	"es/about.html": page("/es/about", "es", {
		alternates: PAIR,
		body: '<a href="/es/contact">c</a><a href="/about" data-locale-switch="en">en</a><a href="/pricing">p</a>',
	}),
	"es/contact.html": page("/es/contact", "es"),
	"pricing.html": page("/pricing", "en"),
	"fr/about.html": page("/fr/about", "fr"),
});

describe("checkDist", () => {
	test("a clean site passes", async () => {
		assert.deepEqual(await checkDist(await site(clean()), registry), []);
	});

	test("hreflang that does not link back fails", async () => {
		const files = clean();
		files["es/about.html"] = page("/es/about", "es");
		const errors = await checkDist(await site(files), registry);
		assert.ok(errors.some((e) => e.includes("does not link back")));
	});

	test("a locale page canonical to another URL fails", async () => {
		const files = clean();
		files["es/contact.html"] = page("/es/contact", "es", {
			canonical: "/contact",
		});
		assert.deepEqual(await checkDist(await site(files), registry), [
			"/es/contact: canonical is https://bchworks.com/contact, not itself",
		]);
	});

	test("a live page linking to a draft locale fails", async () => {
		const files = clean();
		files["contact.html"] = page("/contact", "en", {
			body: '<a href="/fr/about">fr</a>',
		});
		assert.deepEqual(await checkDist(await site(files), registry), [
			"/contact: links to draft-locale page /fr/about",
		]);
	});

	test("the switcher of a live page may not link to a draft locale either", async () => {
		const files = clean();
		files["contact.html"] = page("/contact", "en", {
			body: '<a href="/fr" data-locale-switch="fr">fr</a>',
		});
		assert.deepEqual(await checkDist(await site(files), registry), [
			"/contact: links to draft-locale page /fr",
		]);
	});

	test("a draft page may link to its own locale and to English", async () => {
		const files = clean();
		files["fr/about.html"] = page("/fr/about", "fr", {
			body: '<a href="/fr/x">x</a><a href="/pricing">en</a>',
		});
		assert.deepEqual(await checkDist(await site(files), registry), []);
	});

	test("a Spanish page linking to English when /es/ has the page fails", async () => {
		const files = clean();
		files["es/contact.html"] = page("/es/contact", "es", {
			body: '<a href="/about#team">a</a>',
		});
		assert.deepEqual(await checkDist(await site(files), registry), [
			"/es/contact: links to English /about#team, but /es/about exists",
		]);
	});

	test("links inside scripts are not links", async () => {
		const files = clean();
		files["contact.html"] = page("/contact", "en", {
			body: "<script>const a = '<a href=\"/fr/about\">';</script>",
		});
		assert.deepEqual(await checkDist(await site(files), registry), []);
	});
});

describe("pseudo-locale check", () => {
	const pages = async (body) =>
		readPages(
			await site({
				"en-XA/about.html": page("/en-XA/about", "en-XA", { body }),
			}),
			registry,
		);

	test("plain English in a pseudo page fails", async () => {
		const errors = checkPseudo(
			await pages("<p>Hello world</p>"),
			["en-XA"],
			[],
		);
		assert.deepEqual(errors, ['/en-XA/about: un-pseudo\'d "Hello world"']);
	});

	test("pseudo text, terms, code, fragments and translate=no pass", async () => {
		const body = [
			`<p>${pseudoize("Hello world", "en-XA")} BCH</p>`,
			"<code>wallet.send()</code>",
			'<span lang="en" data-l10n-fallback>English</span>',
			'<span translate="no">$ open /earn</span>',
			'<a lang="es" href="/es">Español</a>',
			'<time datetime="2024-01-01">Jan 1, 2024</time>',
			"<p>OP_CHECKSIG https://example.com/path</p>",
		].join("");
		assert.deepEqual(checkPseudo(await pages(body), ["en-XA"], ["BCH"]), []);
	});

	test("an untranslated alt text fails", async () => {
		const errors = checkPseudo(
			await pages('<img alt="A chart" src="x.png">'),
			["en-XA"],
			[],
		);
		assert.equal(errors.length, 1);
	});

	test("dataFallbacks lists embedded English in locale pages only", async () => {
		const dir = await site({
			"about.html": page("/about", "en", {
				body: '<span data-l10n-fallback lang="en">x</span>',
			}),
			"es/about.html": page("/es/about", "es", {
				body: '<span lang="en" data-l10n-fallback>UTXO</span>',
			}),
		});
		assert.deepEqual(dataFallbacks(await readPages(dir, registry), registry), [
			"/es/about: UTXO",
		]);
	});

	test("visibleText reads the title, text and text attributes", () => {
		assert.deepEqual(
			visibleText(
				'<html><head><title>Hi</title><meta content="no"></head><body><p>One</p><img alt="Two"></body></html>',
			),
			["Hi", "One", "Two"],
		);
	});
});

describe("pseudoize", () => {
	test("en-XA accents every letter and grows each word by about 40%", () => {
		const out = pseudoize("Send money", "en-XA");
		assert.equal(/[A-Za-z]/.test(out), false);
		assert.equal(out.split(" ")[0].length, "Send".length + 2);
		assert.equal(out.split(" ")[1].length, "money".length + 2);
	});

	test("ar-XB wraps each word in a right-to-left override", () => {
		assert.equal(pseudoize("Send it", "ar-XB"), "‮Send‬ ‮it‬");
		assert.deepEqual(unpseudoWords(pseudoize("Send it", "ar-XB"), "ar-XB"), []);
	});

	test("tokens and digits survive, so protect.mjs can unmask them", async () => {
		const [out] = await pseudoTranslator.translate({
			locale: "en-XA",
			segments: ["Pay ⟦0⟧ in 10 days"],
		});
		assert.match(out, /⟦0⟧/);
		assert.match(out, /10/);
	});

	test("unpseudoWords flags what was missed, not terms or URLs", () => {
		assert.deepEqual(
			unpseudoWords(
				`${pseudoize("Buy", "en-XA")} BCH now at bchworks.com`,
				"en-XA",
				["BCH"],
			),
			["now", "at"],
		);
	});
});

import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { checkDist } from "../../scripts/check-i18n-seo.mjs";
import {
	injectAlternates,
	parsePage,
	routeLocale,
	servedPath,
} from "./alternates.mjs";

// A registry where Spanish is live and French is draft, so the tests do not
// depend on which locales the real registry has launched.
const registry = {
	defaultLocale: "en",
	locales: [
		{ code: "en", bcp47: "en", og: "en_US", status: "live" },
		{ code: "es", bcp47: "es", og: "es_ES", status: "live" },
		{ code: "fr", bcp47: "fr", og: "fr_FR", status: "draft" },
	],
};

const SITE = "https://bchworks.com";
const page = (p, lang, { canonical = p, noindex = false } = {}) =>
	`<!doctype html><html lang="${lang}"><head>` +
	`<link rel="canonical" href="${SITE}${canonical === "/" ? "" : canonical}">` +
	`<meta name="robots" content="${noindex ? "noindex,nofollow" : "index,follow"}">` +
	`</head><body></body></html>`;

async function fixture(files) {
	const dir = await mkdtemp(path.join(tmpdir(), "alternates-"));
	for (const [rel, html] of Object.entries(files)) {
		await mkdir(path.dirname(path.join(dir, rel)), { recursive: true });
		await writeFile(path.join(dir, rel), html);
	}
	return dir;
}

const read = async (dir, rel) =>
	parsePage(await readFile(path.join(dir, rel), "utf8"));

test("servedPath mirrors build.format file", () => {
	assert.equal(servedPath("index.html"), "/");
	assert.equal(servedPath("about.html"), "/about");
	assert.equal(servedPath("es.html"), "/es");
	assert.equal(servedPath("es/about.html"), "/es/about");
	assert.equal(servedPath("blog/index.html"), "/blog");
	assert.equal(servedPath("es/index.html"), "/es");
});

test("routeLocale reads the first segment only", () => {
	assert.equal(routeLocale("/es/about", registry).code, "es");
	assert.equal(routeLocale("/es", registry).code, "es");
	assert.equal(routeLocale("/estate", registry).code, "en");
	assert.equal(routeLocale("/", registry).code, "en");
});

test("clusters live counterparts, reciprocally, with x-default", async () => {
	const dir = await fixture({
		"index.html": page("/", "en"),
		"es.html": page("/es", "es"),
		"about.html": page("/about", "en"),
		"es/about.html": page("/es/about", "es"),
		"fr/about.html": page("/fr/about", "fr", { noindex: true }),
		"contact.html": page("/contact", "en"),
	});
	try {
		const byPath = await injectAlternates(dir, registry);
		const en = await read(dir, "about.html");
		const es = await read(dir, "es/about.html");
		const want = [
			{ lang: "en", href: `${SITE}/about` },
			{ lang: "es", href: `${SITE}/es/about` },
			{ lang: "x-default", href: `${SITE}/about` },
		];
		assert.deepEqual(en.hreflang, want);
		assert.deepEqual(es.hreflang, want);
		assert.deepEqual(en.ogAlternates, ["es_ES"]);
		assert.deepEqual(es.ogAlternates, ["en_US"]);
		assert.equal((await read(dir, "es.html")).hreflang.length, 3);
		// A draft locale is never an alternate and never gets one.
		assert.equal((await read(dir, "fr/about.html")).hreflang.length, 0);
		// No counterpart, no hreflang.
		assert.equal((await read(dir, "contact.html")).hreflang.length, 0);
		assert.deepEqual([...byPath.keys()].sort(), [
			"/",
			"/about",
			"/es",
			"/es/about",
		]);
		assert.deepEqual(await checkDist(dir, registry), []);
	} finally {
		await rm(dir, { recursive: true });
	}
});

test("noindex and non-self-canonical pages are not alternates", async () => {
	const dir = await fixture({
		"a.html": page("/a", "en"),
		"es/a.html": page("/es/a", "es", { noindex: true }),
		"b.html": page("/b", "en"),
		"es/b.html": page("/es/b", "es", { canonical: "/b" }),
	});
	try {
		assert.equal((await injectAlternates(dir, registry)).size, 0);
		// Each page on its own: the English pages lose their only counterpart.
		for (const rel of ["a.html", "es/a.html", "b.html", "es/b.html"])
			assert.equal((await read(dir, rel)).hreflang.length, 0, rel);
		// The checker flags the Spanish page that is not canonical to itself.
		assert.deepEqual(await checkDist(dir, registry), [
			`/es/b: canonical is ${SITE}/b, not itself`,
		]);
	} finally {
		await rm(dir, { recursive: true });
	}
});

test("checker catches broken sets, draft leaks, sitemap and feed drift", async () => {
	const link = (lang, p) =>
		`<link rel="alternate" hreflang="${lang}" href="${SITE}${p}">`;
	const withLinks = (html, links) => html.replace("</head>", `${links}</head>`);
	const dir = await fixture({
		"a.html": withLinks(
			page("/a", "en"),
			link("en", "/a") + link("es", "/es/a") + link("x-default", "/a"),
		),
		// Links back with a different set.
		"es/a.html": withLinks(page("/es/a", "es"), link("es", "/es/a")),
		"fr/a.html": withLinks(page("/fr/a", "fr"), link("fr", "/fr/a")),
		"sitemap-0.xml": `<urlset><url><loc>${SITE}/fr/a</loc></url></urlset>`,
		"es/rss.xml": `<rss><item><link>${SITE}/es/missing</link></item></rss>`,
	});
	try {
		const errors = await checkDist(dir, registry);
		assert.ok(
			errors.includes(`/a: ${SITE}/es/a does not link back with the same set`),
		);
		assert.ok(errors.includes("/fr/a: draft-locale page has hreflang"));
		assert.ok(
			errors.includes(`sitemap-0.xml: lists draft-locale URL ${SITE}/fr/a`),
		);
		assert.ok(
			errors.includes(
				`es/rss.xml: item links to ${SITE}/es/missing, which was not built`,
			),
		);
	} finally {
		await rm(dir, { recursive: true });
	}
});

test("checker catches a bad x-default, self entry and sitemap drift", async () => {
	const link = (lang, p) =>
		`<link rel="alternate" hreflang="${lang}" href="${SITE}${p}">`;
	const withLinks = (html, links) => html.replace("</head>", `${links}</head>`);
	// x-default points at the Spanish page, on both members, so the sets match.
	const wrongDefault =
		link("en", "/a") + link("es", "/es/a") + link("x-default", "/es/a");
	// The set omits the page itself and repeats a value.
	const noSelf = link("en", "/c") + link("en", "/c");
	const xml = (loc, links) =>
		`<url><loc>${SITE}${loc}</loc>${links
			.map(
				([l, p]) =>
					`<xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${p}"/>`,
			)
			.join("")}</url>`;
	const dir = await fixture({
		"a.html": withLinks(page("/a", "en"), wrongDefault),
		"es/a.html": withLinks(page("/es/a", "es"), wrongDefault),
		"b.html": withLinks(page("/b", "en"), link("es", "/b")),
		"c.html": page("/c", "en"),
		"d.html": withLinks(page("/d", "en"), noSelf),
		"sitemap-0.xml": `<urlset>${xml("/c", [
			["en", "/c"],
			["es", "/es/c"],
		])}</urlset>`,
	});
	try {
		const errors = await checkDist(dir, registry);
		assert.ok(
			errors.includes(`/a: x-default must point to ${SITE}/a`),
			errors.join("\n"),
		);
		assert.ok(errors.includes("/b: self hreflang es ≠ <html lang> en"));
		assert.ok(errors.includes("/d: repeated hreflang value in en, en"));
		assert.ok(errors.includes("/d: hreflang set omits the page itself"));
		assert.ok(
			errors.includes(
				`sitemap-0.xml: ${SITE}/c alternates differ from the page's hreflang`,
			),
		);
	} finally {
		await rm(dir, { recursive: true });
	}
});

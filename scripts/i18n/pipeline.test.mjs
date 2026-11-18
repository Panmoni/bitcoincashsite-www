// The translation pipeline against a fixture site (scripts/i18n/fixtures/site)
// with the Claude API replaced by a fake translator.
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, test } from "node:test";
import { hashSource } from "../../src/utils/localize.mjs";
import {
	draft,
	parseDoc,
	RefusedError,
	rebaseRelative,
	review,
	scan,
} from "./pipeline.mjs";
import { dntPattern, mask, unmask } from "./protect.mjs";

const FIXTURE = new URL("./fixtures/site", import.meta.url).pathname;
const LOCALES = ["es"];

let root;
const rd = (p) => readFileSync(join(root, p), "utf8");
const json = (p) => JSON.parse(rd(p));
const wr = (p, s) => writeFileSync(join(root, p), s);

// Fixture files say FRESH where a hash must match the English as it is now.
const stamp = () => {
	const en = json("messages/en.json");
	wr(
		"messages/meta/es.json",
		rd("messages/meta/es.json").replace(
			"FRESH",
			hashSource(JSON.stringify(en.fresh_key)),
		),
	);
	const post = "src/content/post/es/reviewed.md";
	wr(
		post,
		rd(post).replace("FRESH", hashSource(rd("src/content/post/reviewed.md"))),
	);
	const overlay = "src/data/i18n/es/glossary.json";
	wr(overlay, rd(overlay).replace("FRESH:Fee", hashSource("Fee")));
};

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), "i18n-pipeline-"));
	cpSync(FIXTURE, root, { recursive: true });
	stamp();
});

// Upper-cases every word it is sent and marks it with Ñ. Anything that should
// have been protected but was not comes back changed, uppercase terms such as
// BCH and OP_CAT included, so the byte-identity checks below bite.
const fake = () => {
	const calls = [];
	return {
		calls,
		name: "Fake",
		async translate(req) {
			calls.push(req);
			return req.segments.map((s) =>
				s.replace(/\p{L}+/gu, (w) => `${w.toUpperCase()}Ñ`),
			);
		},
	};
};

const ids = (units) =>
	units.map((u) => `${u.kind}:${u.key ?? u.target}:${u.state}`).sort();

describe("scan", () => {
	test("finds missing and stale units, holds a person's work", () => {
		const { todo, held } = scan({ root, locale: "es", locales: LOCALES });
		assert.deepEqual(ids(todo), [
			"catalog:blocks:missing",
			"catalog:greeting:missing",
			"catalog:stale_key:stale",
			"content:src/content/pages/es/about.yaml:missing",
			"content:src/content/post/es/hello.md:missing",
			"overlay:fee.definition:stale",
			"overlay:paytaca.description:missing",
			"overlay:utxo.definition:missing",
			"overlay:utxo.term:missing",
		]);
		// Reviewed and stale, or no provenance: a person's work.
		assert.deepEqual(ids(held), [
			"catalog:handmade_key:unknown",
			"catalog:reviewed_stale_key:stale",
			"content:src/content/post/es/changed.md:stale",
		]);
	});

	test("skips fresh units and an original written in the locale", () => {
		const { todo, held } = scan({ root, locale: "es", locales: LOCALES });
		const all = [...todo, ...held].map((u) => u.key ?? u.target);
		assert.ok(!all.includes("fresh_key"));
		assert.ok(!all.includes("fee.term"));
		assert.ok(!all.includes("src/content/post/es/reviewed.md"));
		assert.ok(!all.some((t) => t.includes("venezuela")));
	});

	test("--restale moves reviewed stale work into the draft, never unattributed", () => {
		const { todo, held } = scan({
			root,
			locale: "es",
			locales: LOCALES,
			restale: true,
		});
		assert.ok(ids(todo).includes("catalog:reviewed_stale_key:stale"));
		assert.ok(
			ids(todo).includes("content:src/content/post/es/changed.md:stale"),
		);
		assert.deepEqual(ids(held), ["catalog:handmade_key:unknown"]);
	});

	test("--only limits the scan to matching paths", () => {
		const { todo } = scan({
			root,
			locale: "es",
			locales: LOCALES,
			only: "src/content/post/**",
		});
		assert.deepEqual(ids(todo), [
			"content:src/content/post/es/hello.md:missing",
		]);
	});
});

describe("draft", () => {
	const run = async (opts = {}) => {
		const translator = fake();
		const { todo } = scan({ root, locale: "es", locales: LOCALES, ...opts });
		const result = await draft({ root, locale: "es", todo, translator });
		return { ...result, translator };
	};

	test("writes status machine with the current sourceHash", async () => {
		const { failed } = await run();
		assert.deepEqual(failed, []);

		const post = parseDoc(rd("src/content/post/es/hello.md"), "x.md").data;
		assert.deepEqual(post.translation, {
			sourceHash: hashSource(rd("src/content/post/hello.md")),
			status: "machine",
			translator: "Fake",
		});

		const en = json("messages/en.json");
		const meta = json("messages/meta/es.json");
		assert.deepEqual(meta.greeting, {
			sourceHash: hashSource(JSON.stringify(en.greeting)),
			status: "machine",
			translator: "Fake",
		});
		assert.equal(
			meta.stale_key.sourceHash,
			hashSource(JSON.stringify(en.stale_key)),
		);

		const overlay = json("src/data/i18n/es/glossary.json");
		assert.equal(overlay.fee.definition.status, "machine");
		assert.equal(
			overlay.fee.definition.sourceHash,
			hashSource("What a transaction pays miners."),
		);
		assert.equal(
			overlay.fee.definition.text,
			"WHATÑ AÑ TRANSACTIONÑ PAYSÑ MINERSÑ.",
		);
	});

	test("leaves reviewed and unattributed work untouched", async () => {
		const before = {
			reviewed: rd("src/content/post/es/reviewed.md"),
			changed: rd("src/content/post/es/changed.md"),
			es: json("messages/es.json"),
			meta: json("messages/meta/es.json"),
			term: json("src/data/i18n/es/glossary.json").fee.term,
		};
		const { translator } = await run();
		assert.equal(rd("src/content/post/es/reviewed.md"), before.reviewed);
		assert.equal(rd("src/content/post/es/changed.md"), before.changed);
		const es = json("messages/es.json");
		const meta = json("messages/meta/es.json");
		for (const k of ["fresh_key", "reviewed_stale_key", "handmade_key"]) {
			assert.equal(es[k], before.es[k], k);
			assert.deepEqual(meta[k], before.meta[k], k);
		}
		assert.deepEqual(
			json("src/data/i18n/es/glossary.json").fee.term,
			before.term,
		);
		const sent = translator.calls.flatMap((c) => c.segments).join("\n");
		assert.ok(!sent.includes("older English"));
		assert.ok(!sent.includes("rewritten after the review"));
	});

	test("--restale redrafts reviewed stale work as machine", async () => {
		await run({ restale: true });
		const t = parseDoc(rd("src/content/post/es/changed.md"), "x.md").data
			.translation;
		assert.equal(t.status, "machine");
		assert.equal(t.sourceHash, hashSource(rd("src/content/post/changed.md")));
		assert.equal(
			json("messages/meta/es.json").reviewed_stale_key.status,
			"machine",
		);
	});

	test("keeps code blocks, URLs, placeholders and DNT terms byte-identical", async () => {
		await run();
		const out = rd("src/content/post/es/hello.md");
		for (const kept of [
			"```sh\n# Do not translate this comment\nbitcoin-cli getblockcount\n```",
			"(https://cashtokens.org/docs/spec)",
			"(/guides/tokens)", // a relative link target
			"[https://cashtokens.org](https://cashtokens.org)", // a URL as link text
			"<https://example.com/wallet>",
			"`OP_CHECKDATASIG`",
			"{fee}",
			"Paytaca", // a project name from projects.json
			"CashTokens",
			" BCH.", // a DNT term from dnt.txt, uppercase
			" OP_CAT ", // a bare opcode name
		])
			assert.ok(out.includes(kept), `lost: ${kept}`);
		// The words around them were translated (upper-cased by the fake).
		assert.ok(out.includes("## BEFOREÑ YOUÑ STARTÑ"));
		assert.ok(out.includes("### NEXTÑ STEPSÑ"));
		assert.ok(out.includes("[CashTokens SPECÑ]"));
	});

	test("translates frontmatter words only, keeps its keys and data", async () => {
		await run();
		const en = parseDoc(rd("src/content/post/hello.md"), "x.md").data;
		const es = parseDoc(rd("src/content/post/es/hello.md"), "x.md").data;
		assert.deepEqual(
			Object.keys(es).sort(),
			[...Object.keys(en), "translation"].sort(),
		);
		assert.equal(es.title, "SENDINGÑ YOURÑ FIRSTÑ CashTokens");
		assert.equal(es.category, en.category);
		assert.deepEqual(es.tags, en.tags);
		assert.equal(es.image, en.image);
		assert.deepEqual(es.publishDate, en.publishDate);
	});

	test("page copy translates every word but the identifier keys", async () => {
		await run();
		const es = parseDoc(rd("src/content/pages/es/about.yaml"), "x.yaml").data;
		assert.equal(es.heading, "ABOUTÑ USÑ");
		assert.equal(es.items[0].icon, "tabler:code");
		assert.equal(es.items[0].href, "/about#code");
		assert.equal(
			es.items[0].description,
			'EVERYÑ LINEÑ ISÑ ONÑ <a href="https://github.com/Panmoni">GITHUBÑ</a>.',
		);
	});

	test("translates each plural variant and keeps the message structure", async () => {
		await run();
		const es = json("messages/es.json");
		assert.equal(es.greeting, "HELLOÑ {name}, WELCOMEÑ TOÑ BITCOINÑ CASHÑ");
		const en = json("messages/en.json");
		assert.deepEqual(es.blocks[0].declarations, en.blocks[0].declarations);
		assert.deepEqual(es.blocks[0].match, {
			"countPlural=one": "{count} BLOCKÑ",
			"countPlural=*": "{count} BLOCKSÑ",
		});
	});

	test("sends the locale terminology with every request", async () => {
		const { translator } = await run();
		assert.ok(translator.calls.length > 0);
		for (const c of translator.calls)
			assert.deepEqual(c.terminology, { wallet: "billetera", fee: "comisión" });
	});

	test("passes object terminology entries through unchanged", async () => {
		const terms = {
			wallet: { translation: "billetera", note: "Not monedero." },
			fee: "comisión",
		};
		wr("src/i18n/glossary/es.json", JSON.stringify(terms));
		const { translator } = await run();
		assert.ok(translator.calls.length > 0);
		for (const c of translator.calls) assert.deepEqual(c.terminology, terms);
	});

	test("sends the locale style brief with every request when present", async () => {
		wr("src/i18n/glossary/es.style.md", "Usa tú, nunca usted.\n");
		const { translator } = await run();
		assert.ok(translator.calls.length > 0);
		for (const c of translator.calls)
			assert.equal(c.style, "Usa tú, nunca usted.\n");
	});

	test("sends no style brief when the locale has none", async () => {
		const { translator } = await run();
		for (const c of translator.calls) assert.equal(c.style, undefined);
	});

	test("an API failure mid-catalog keeps the batches already drafted", async () => {
		const en = json("messages/en.json");
		for (let i = 0; i < 70; i++) en[`bulk_${i}`] = `Message number ${i}`;
		wr("messages/en.json", JSON.stringify(en));
		let calls = 0;
		const flaky = {
			name: "Flaky",
			async translate({ segments }) {
				if (++calls > 1)
					throw Object.assign(new Error("429"), { name: "TranslatorError" });
				return segments;
			},
		};
		const { todo } = scan({
			root,
			locale: "es",
			locales: LOCALES,
			only: "messages/**",
		});
		await assert.rejects(
			draft({ root, locale: "es", todo, translator: flaky }),
		);
		const meta = json("messages/meta/es.json");
		const drafted = Object.values(meta).filter((m) => m.translator === "Flaky");
		assert.equal(drafted.length, 60, "the first batch of 60 was saved");
	});

	test("a reply that drops a protected token is never written", async () => {
		const dropper = {
			name: "Dropper",
			async translate({ segments }) {
				return segments.map((s) => s.replace(/⟦\d+⟧/g, ""));
			},
		};
		const { todo } = scan({
			root,
			locale: "es",
			locales: LOCALES,
			only: "src/content/post/hello.md",
		});
		const { written, failed } = await draft({
			root,
			locale: "es",
			todo,
			translator: dropper,
		});
		assert.deepEqual(written, []);
		assert.match(failed[0], /protected text changed/);
		assert.throws(() => rd("src/content/post/es/hello.md"));
	});
});

describe("review", () => {
	test("refuses when the English changed since the draft", () => {
		const path = "src/content/post/es/changed.md";
		const before = rd(path);
		assert.throws(
			() => review({ root, locale: "es", path, reviewer: "Luis" }),
			(e) => e instanceof RefusedError && /English changed/.test(e.message),
		);
		assert.equal(rd(path), before);
	});

	test("stamps reviewed, the reviewer and the current hash", async () => {
		const translator = fake();
		const { todo } = scan({ root, locale: "es", locales: LOCALES });
		await draft({ root, locale: "es", todo, translator });
		const path = "src/content/post/es/hello.md";
		const body = rd(path).split("\n---\n")[1];
		assert.equal(review({ root, locale: "es", path, reviewer: "Luis" }), 1);
		const t = parseDoc(rd(path), path).data.translation;
		assert.deepEqual(t, {
			sourceHash: hashSource(rd("src/content/post/hello.md")),
			status: "reviewed",
			translator: "Fake",
			reviewer: "Luis",
		});
		assert.equal(rd(path).split("\n---\n")[1], body, "body untouched");
	});

	test("--rechecked stamps the current English hash on stale work", () => {
		const path = "src/content/post/es/changed.md";
		review({ root, locale: "es", path, reviewer: "Luis", rechecked: true });
		const t = parseDoc(rd(path), path).data.translation;
		assert.equal(t.sourceHash, hashSource(rd("src/content/post/changed.md")));
		assert.equal(t.reviewer, "Luis");
	});

	test("refuses a catalog with any stale message, naming it", () => {
		assert.throws(
			() =>
				review({
					root,
					locale: "es",
					path: "messages/es.json",
					reviewer: "Luis",
				}),
			(e) => e instanceof RefusedError && /stale_key/.test(e.message),
		);
	});

	test("reviews a whole fresh overlay field by field", async () => {
		const translator = fake();
		const { todo } = scan({ root, locale: "es", locales: LOCALES });
		await draft({ root, locale: "es", todo, translator });
		const path = "src/data/i18n/es/glossary.json";
		// fee.term was already reviewed by Ana against this English: kept.
		assert.equal(review({ root, locale: "es", path, reviewer: "Luis" }), 3);
		const o = json(path);
		assert.equal(o.fee.term.reviewer, "Ana");
		assert.equal(o.utxo.definition.status, "reviewed");
		assert.equal(o.utxo.definition.reviewer, "Luis");
		assert.equal(o.utxo.definition.translator, "Fake");
	});

	test("keeps $ sequences and the rest of the frontmatter literal", () => {
		const path = "src/content/post/es/changed.md";
		wr(
			path,
			rd(path).replace("title: ", () => "title: user$'s $& $` "),
		);
		review({ root, locale: "es", path, reviewer: "Luis", rechecked: true });
		const data = parseDoc(rd(path), path).data;
		assert.match(data.title, /^user\$'s \$& \$` /);
		assert.equal(data.translation.reviewer, "Luis");
	});

	test("rewrites a block with a blank line inside it whole", () => {
		const path = "src/content/post/es/changed.md";
		wr(
			path,
			rd(path).replace("  status: reviewed\n", "  status: reviewed\n\n"),
		);
		review({ root, locale: "es", path, reviewer: "Luis", rechecked: true });
		assert.equal(parseDoc(rd(path), path).data.translation.reviewer, "Luis");
	});

	test("refuses a path that is not a translation", () => {
		assert.throws(
			() =>
				review({
					root,
					locale: "es",
					path: "src/content/post/hello.md",
					reviewer: "Luis",
				}),
			RefusedError,
		);
	});
});

describe("protect", () => {
	test("round-trips and rejects a dropped or repeated token", () => {
		const src = "Use `x` at https://a.b/c with {n} BCH";
		const { text, tokens } = mask(src, dntPattern(["BCH"]));
		assert.equal(text, "Use ⟦0⟧ at ⟦1⟧ with ⟦2⟧ ⟦3⟧");
		assert.equal(unmask(text, tokens), src);
		assert.throws(() => unmask("Use ⟦0⟧ ⟦0⟧ ⟦1⟧ ⟦2⟧ ⟦3⟧", tokens));
		assert.throws(() => unmask("Use ⟦0⟧ ⟦1⟧ ⟦2⟧", tokens));
		assert.throws(() => unmask("Use ⟦0⟧ ⟦1⟧ ⟦2⟧ ⟦3⟧ ⟦4⟧", tokens));
	});

	test("never nests one protected run inside another", () => {
		const src =
			"See [Forth](<https://en.wikipedia.org/wiki/Forth_(language)>) and [https://a.b](https://a.b).";
		const { text, tokens } = mask(src, null);
		assert.ok(tokens.every((t) => !t.includes("⟦")));
		assert.equal(unmask(text, tokens), src);
	});

	test("an HTML <code> element is protected whole, text included", () => {
		const src = 'Read with <code class="font-mono">getblock</code> <b>now</b>';
		const { text, tokens } = mask(src, null);
		assert.deepEqual(tokens, [
			'<code class="font-mono">getblock</code>',
			"<b>",
			"</b>",
		]);
		assert.match(text, /now/);
		assert.equal(unmask(text, tokens), src);
	});

	test("DNT matches whole words, case-sensitive, longest first", () => {
		const p = dntPattern(["Bitcoin Cash", "Bitcoin Cash Node", "BCH"]);
		const { tokens } = mask(
			"Bitcoin Cash Node runs Bitcoin Cash; bch, BCHN",
			p,
		);
		assert.deepEqual(tokens, ["Bitcoin Cash Node", "Bitcoin Cash"]);
	});
});

// Bugs the pseudo-locale build found (PAN-383).
describe("pseudo-locale regressions", () => {
	test("an unquoted frontmatter date stays a date", () => {
		const { data } = parseDoc(
			"---\npublishDate: 2023-08-12T00:00:00Z\n---\n",
			"a.md",
		);
		assert.ok(data.publishDate instanceof Date);
	});

	test("relative link and image targets gain one ../", () => {
		assert.equal(
			rebaseRelative(
				'![a](../../x.png) [b](./y.md) <img src="../z.png"> [c](https://e.com/../x)',
			),
			'![a](../../../x.png) [b](../y.md) <img src="../../z.png"> [c](https://e.com/../x)',
		);
	});

	test("a link target with spaces is protected, its title is not", () => {
		const { text, tokens } = mask(
			'![](../a/Screenshot 1 at 3 PM.png "A title")',
		);
		assert.deepEqual(tokens, ["](../a/Screenshot 1 at 3 PM.png"]);
		assert.match(text, /A title/);
	});

	test("a link target with an apostrophe is protected whole", () => {
		const { tokens } = mask("[x](https://e.org/wiki/Hal_Finney's_work)");
		assert.deepEqual(tokens, ["](https://e.org/wiki/Hal_Finney's_work"]);
	});
});

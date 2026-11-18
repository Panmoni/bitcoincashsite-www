// pnpm i18n:check against a small site written fresh for each test: one
// fixture per failure class, plus the live/draft split and the rule that an
// English edit never fails the check.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { beforeEach, describe, test } from "node:test";
import { hashSource } from "../../src/utils/localize.mjs";
import { hardcodedIn, messageMismatch, runCheck } from "./check.mjs";

let root;
const write = (p, body) => {
	mkdirSync(dirname(join(root, p)), { recursive: true });
	writeFileSync(
		join(root, p),
		typeof body === "string" ? body : JSON.stringify(body, null, "\t"),
	);
};
const plural = (one, other, inputs = ["count"]) => [
	{
		declarations: [
			...inputs.map((i) => `input ${i}`),
			"local countPlural = count: plural",
		],
		selectors: ["countPlural"],
		match: { "countPlural=one": one, "countPlural=*": other },
	},
];

const EN = {
	greeting: "Hello {name}",
	items: plural("{count} item", "{count} items"),
};
const ABOUT_EN = "metadata:\n  title: About\nlead: Read {count} posts\n";
const POST_EN = "---\ntitle: Hello\n---\nBody.\n";

/** A site where es is fully translated, reviewed and fresh. */
const cleanSite = () => {
	write("messages/en.json", { $schema: "x", ...EN });
	write("messages/es.json", {
		greeting: "Hola {name}",
		items: plural("{count} cosa", "{count} cosas"),
	});
	const reviewed = (value) => ({
		sourceHash: hashSource(JSON.stringify(value)),
		status: "reviewed",
		translator: "t",
		reviewer: "r",
	});
	write("messages/meta/es.json", {
		greeting: reviewed(EN.greeting),
		items: reviewed(EN.items),
	});
	write("src/content/pages/about.yaml", ABOUT_EN);
	write(
		"src/content/pages/es/about.yaml",
		`metadata:\n  title: Acerca\nlead: Lee {count} entradas\ntranslation:\n  sourceHash: ${hashSource(ABOUT_EN)}\n  status: reviewed\n  translator: t\n  reviewer: r\n`,
	);
	write("src/content/post/hello.md", POST_EN);
	write(
		"src/content/post/es/hello.md",
		`---\ntitle: Hola\ntranslation:\n  sourceHash: ${hashSource(POST_EN)}\n  status: reviewed\n  translator: t\n  reviewer: r\n---\nCuerpo.\n`,
	);
	write("src/data/glossary.json", [
		{ id: "fee", term: "Fee", definition: "What a {unit} costs" },
	]);
	const field = (en, text) => ({
		text,
		sourceHash: hashSource(en),
		status: "reviewed",
		translator: "t",
		reviewer: "r",
	});
	write("src/data/i18n/es/glossary.json", {
		fee: {
			term: field("Fee", "Comisión"),
			definition: field("What a {unit} costs", "Lo que cuesta un {unit}"),
		},
	});
	write(
		"src/components/Uses.astro",
		"---\nimport { m } from 'x';\n---\n<p>{m.greeting({ name })} {m.items({ count })}</p>\n",
	);
	write("src/i18n/hardcoded-allow.txt", "# none\n");
};

const run = (status = "live") =>
	runCheck({
		root,
		locales: [
			{ code: "en", status: "live" },
			{ code: "es", status },
		],
		defaultLocale: "en",
	});
const has = (lines, text) => lines.some((l) => l.includes(text));

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), "i18n-check-"));
	cleanSite();
});

describe("a clean site", () => {
	test("passes with no errors and no warnings", () => {
		const { errors, warnings, summary } = run();
		assert.deepEqual(errors, []);
		assert.deepEqual(warnings, []);
		assert.ok(has(summary, "es (live): 0 missing, 0 placeholder, 0 orphan"));
	});
});

describe("failure classes in a live locale", () => {
	test("a missing catalog key fails", () => {
		write("messages/es.json", { greeting: "Hola {name}" });
		assert.ok(has(run().errors, "es missing: messages/es.json#items"));
	});

	test("a placeholder mismatch in the catalog fails", () => {
		write("messages/es.json", {
			greeting: "Hola {nombre}",
			items: plural("{count} cosa", "{count} cosas"),
		});
		assert.ok(has(run().errors, "es placeholder: messages/es.json#greeting"));
	});

	test("a plural mismatch fails", () => {
		write("messages/es.json", {
			greeting: "Hola {name}",
			items: "{count} cosas",
		});
		assert.ok(has(run().errors, "es placeholder: messages/es.json#items"));
	});

	test("a placeholder mismatch in page copy fails", () => {
		write(
			"src/content/pages/es/about.yaml",
			`metadata:\n  title: Acerca\nlead: Lee entradas\ntranslation:\n  sourceHash: ${hashSource(ABOUT_EN)}\n  status: reviewed\n  translator: t\n  reviewer: r\n`,
		);
		assert.ok(
			has(run().errors, "es placeholder: src/content/pages/es/about.yaml#lead"),
		);
	});

	test("a placeholder mismatch in an overlay fails", () => {
		write("src/data/i18n/es/glossary.json", {
			fee: {
				term: { text: "Comisión", sourceHash: hashSource("Fee") },
				definition: {
					text: "Lo que cuesta",
					sourceHash: hashSource("What a {unit} costs"),
				},
			},
		});
		assert.ok(
			has(
				run().errors,
				"es placeholder: src/data/i18n/es/glossary.json#fee.definition",
			),
		);
	});

	test("an orphaned catalog key fails", () => {
		write("messages/es.json", {
			greeting: "Hola {name}",
			items: plural("{count} cosa", "{count} cosas"),
			gone: "Adiós",
		});
		assert.ok(has(run().errors, "es orphan: messages/es.json#gone"));
	});

	test("an orphaned content translation fails", () => {
		write("src/content/post/es/removed.md", "---\ntitle: X\n---\n");
		assert.ok(has(run().errors, "es orphan: src/content/post/es/removed.md"));
	});

	test("an orphaned overlay entry fails", () => {
		write("src/data/i18n/es/glossary.json", {
			fee: {
				term: { text: "Comisión", sourceHash: hashSource("Fee") },
				definition: {
					text: "Lo que cuesta un {unit}",
					sourceHash: hashSource("What a {unit} costs"),
				},
			},
			gone: { term: { text: "X", sourceHash: "0" } },
		});
		assert.ok(
			has(run().errors, "es orphan: src/data/i18n/es/glossary.json#gone"),
		);
	});

	test("a new hard-coded string fails while a locale is live", () => {
		write("src/components/Bad.astro", "<p>Buy now</p>\n");
		assert.ok(
			has(run().errors, "hardcoded: src/components/Bad.astro: Buy now"),
		);
	});

	test("the allowlist accepts a term and an exact string", () => {
		write("src/components/Bad.astro", "<p>CoinGecko</p><p>Buy now</p>\n");
		write(
			"src/i18n/hardcoded-allow.txt",
			"CoinGecko\nsrc/components/Bad.astro: Buy now\n",
		);
		assert.deepEqual(run().errors, []);
	});
});

describe("warnings never fail", () => {
	test("machine entries warn", () => {
		write("messages/meta/es.json", {
			greeting: {
				sourceHash: hashSource(JSON.stringify(EN.greeting)),
				status: "machine",
			},
			items: {
				sourceHash: hashSource(JSON.stringify(EN.items)),
				status: "machine",
			},
		});
		const { errors, warnings } = run();
		assert.deepEqual(errors, []);
		assert.ok(has(warnings, "es machine: messages/es.json#greeting"));
	});

	test("an English edit makes reviewed units stale and warns only", () => {
		write("messages/en.json", { ...EN, greeting: "Hi there {name}" });
		write("src/content/post/hello.md", "---\ntitle: Hello\n---\nNew body.\n");
		write("src/data/glossary.json", [
			{ id: "fee", term: "Fees", definition: "What a {unit} costs" },
		]);
		const { errors, warnings } = run();
		assert.deepEqual(errors, []);
		assert.ok(has(warnings, "es stale: messages/es.json#greeting"));
		assert.ok(has(warnings, "es stale: src/content/post/es/hello.md"));
		assert.ok(
			has(
				warnings,
				"es fragment: src/data/i18n/es/glossary.json#fee.term (stale",
			),
		);
	});

	test("an untranslated overlay field is an embedded English fragment", () => {
		write("src/data/i18n/es/glossary.json", {});
		const { errors, warnings } = run();
		assert.deepEqual(errors, []);
		assert.ok(
			has(
				warnings,
				"es fragment: src/data/i18n/es/glossary.json#fee.definition (untranslated",
			),
		);
	});

	test("an unused catalog key warns", () => {
		write("src/components/Uses.astro", "<p>{m.greeting({ name })}</p>\n");
		const { warnings } = run();
		assert.ok(has(warnings, "unused catalog key: items"));
		assert.equal(has(warnings, "unused catalog key: greeting"), false);
	});

	test("in a draft locale every class only warns", () => {
		write("messages/es.json", { greeting: "Hola {nombre}", gone: "x" });
		write("src/components/Bad.astro", "<p>Buy now</p>\n");
		const { errors, warnings } = run("draft");
		assert.deepEqual(errors, []);
		assert.ok(has(warnings, "es missing: messages/es.json#items"));
		assert.ok(has(warnings, "es placeholder: messages/es.json#greeting"));
		assert.ok(has(warnings, "es orphan: messages/es.json#gone"));
		assert.ok(has(warnings, "hardcoded: src/components/Bad.astro: Buy now"));
	});
});

describe("hardcodedIn", () => {
	test("skips frontmatter, expressions, scripts, comments and code", () => {
		const src = `---\nconst title = "Not this";\n---\n<!-- nor this -->\n<script>const x = "nor";</script>\n<h1>{copy.title}</h1>\n<pre>const genesis = 1</pre><code>wallet.send</code>\n<p>{items.map((i) => <b>{i}</b>)}</p>\n`;
		assert.deepEqual(hardcodedIn(src, []), []);
	});

	test("finds text nodes and text attributes", () => {
		const src = `<p>Read more</p><img alt="A chart" src="x.png" /><a title={t}>→</a>`;
		assert.deepEqual(hardcodedIn(src, []).sort(), ["A chart", "Read more"]);
	});

	test("an expression with a brace inside a string does not swallow text", () => {
		const src = `<p>{"}"}</p><p>Stay visible</p>`;
		assert.deepEqual(hardcodedIn(src, []), ["Stay visible"]);
	});

	test("JSX inside an expression is checked; its JavaScript is not", () => {
		assert.deepEqual(
			hardcodedIn(
				"<ul>{items.map((i) => <li>Read more {i.name}</li>)}</ul><p>Visible</p>",
				[],
			),
			["Read more", "Visible"],
		);
	});

	test("an apostrophe in JSX text does not hide the rest", () => {
		assert.deepEqual(
			hardcodedIn(
				"<p>{ok && <span>Don't go</span>}</p><p>{/* it's */ z}</p><p>Still seen</p>",
				[],
			),
			["Don't go", "Still seen"],
		);
	});

	test("translate=no hides its whole element, nested ones included", () => {
		assert.deepEqual(
			hardcodedIn(
				'<div translate="no"><div>a</div>Code tail</div><p>Shown</p>',
				[],
			),
			["Shown"],
		);
	});

	test("terms are removed before deciding", () => {
		assert.deepEqual(hardcodedIn("<p>BCH · UTC</p>", ["BCH", "UTC"]), []);
	});
});

describe("messageMismatch", () => {
	test("needs a catch-all variant", () => {
		const tr = [
			{
				declarations: ["input count", "local countPlural = count: plural"],
				selectors: ["countPlural"],
				match: { "countPlural=one": "{count} cosa" },
			},
		];
		assert.equal(messageMismatch(EN.items, tr), "no catch-all (=*) variant");
	});

	test("a placeholder used more than once is fine", () => {
		assert.equal(messageMismatch("{a} and {b}", "{b}, {a}, {a}"), null);
	});
});

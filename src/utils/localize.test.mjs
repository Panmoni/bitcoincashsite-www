// Run: pnpm test (node --test).
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import {
	copyShapeErrors,
	findOrphans,
	hashSource,
	localeId,
	makeGetLocalizedEntry,
	overlayRecord,
} from "./localize.mjs";

const store = {
	chips: { cashtokens: { id: "cashtokens", lang: "en" } },
	chipsL10n: { "es/cashtokens": { id: "es/cashtokens", lang: "es" } },
};
const getLocalizedEntry = makeGetLocalizedEntry({
	getEntry: async (c, id) => store[c]?.[id],
	defaultLocale: "en",
	localizedCollection: (c) => `${c}L10n`,
});

test("getLocalizedEntry returns the entry in the asked locale", async () => {
	assert.equal(
		(await getLocalizedEntry("chips", "cashtokens", "es")).lang,
		"es",
	);
	assert.equal(
		(await getLocalizedEntry("chips", "cashtokens", "en")).lang,
		"en",
	);
});

test("getLocalizedEntry returns null, never the English entry, when the locale has none", async () => {
	store.chips.bigint = { id: "bigint", lang: "en" };
	assert.equal(await getLocalizedEntry("chips", "bigint", "es"), null);
	assert.equal(await getLocalizedEntry("chips", "nope", "en"), null);
});

test("hashSource is stable and changes with the source", () => {
	assert.equal(hashSource("abc"), hashSource("abc"));
	// The first 16 hex chars of the published SHA-256 of "abc".
	assert.equal(hashSource("abc"), "ba7816bf8f01cfea");
	assert.notEqual(hashSource("abc"), hashSource("abd"));
});

const glossary = [
	{ id: "utxo", definition: "Unspent output." },
	{ id: "dsproof", definition: "Double-spend proof." },
];
const overlay = {
	utxo: {
		definition: {
			text: "Salida no gastada.",
			sourceHash: hashSource("Unspent output."),
		},
	},
};
const es = { locale: "es", defaultLocale: "en" };

test("overlayRecord takes translated fields from the overlay", () => {
	assert.deepEqual(overlayRecord(glossary[0], overlay, ["definition"], es), {
		definition: { text: "Salida no gastada.", lang: "es", fallback: false },
	});
});

test("overlayRecord falls back to English, marked, for an id with no overlay", () => {
	assert.deepEqual(overlayRecord(glossary[1], overlay, ["definition"], es), {
		definition: { text: "Double-spend proof.", lang: "en", fallback: true },
	});
	assert.deepEqual(
		overlayRecord(glossary[1], undefined, ["definition"], es).definition
			.fallback,
		true,
	);
});

test("overlayRecord in the default locale is the English record, unmarked", () => {
	assert.deepEqual(
		overlayRecord(glossary[0], overlay, ["definition"], {
			locale: "en",
			defaultLocale: "en",
		}),
		{ definition: { text: "Unspent output.", lang: "en", fallback: false } },
	);
});

test("findOrphans reports translations whose English id is gone", (t) => {
	const root = mkdtempSync(join(tmpdir(), "l10n-"));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	const put = (p, body) => {
		mkdirSync(dirname(join(root, p)), { recursive: true });
		writeFileSync(join(root, p), body);
	};
	put("content/chips/cashtokens.md", "");
	put("content/chips/es/cashtokens.md", "");
	put("content/chips/es/retired-chip.md", "");
	put("data/glossary.json", JSON.stringify(glossary));
	put(
		"data/i18n/es/glossary.json",
		JSON.stringify({ ...overlay, "old-term": overlay.utxo }),
	);

	const orphans = findOrphans({
		contentDir: join(root, "content"),
		dataDir: join(root, "data"),
		overlayDir: join(root, "data/i18n"),
		locales: ["es"],
	});
	assert.deepEqual(orphans, [
		{
			kind: "content",
			locale: "es",
			file: "chips/es/retired-chip.md",
			id: "es/retired-chip",
		},
		{
			kind: "overlay",
			locale: "es",
			file: "es/glossary.json",
			id: "old-term",
		},
	]);
});

test("findOrphans reports every overlay id when the English data file is gone", (t) => {
	const root = mkdtempSync(join(tmpdir(), "l10n-"));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	mkdirSync(join(root, "data/i18n/es"), { recursive: true });
	writeFileSync(
		join(root, "data/i18n/es/retired.json"),
		JSON.stringify({ a: overlay.utxo }),
	);
	assert.deepEqual(
		findOrphans({
			contentDir: join(root, "content"),
			dataDir: join(root, "data"),
			overlayDir: join(root, "data/i18n"),
			locales: ["es"],
		}),
		[{ kind: "overlay", locale: "es", file: "es/retired.json", id: "a" }],
	);
});

test("findOrphans is empty when every translation has its English id", (t) => {
	const root = mkdtempSync(join(tmpdir(), "l10n-"));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	mkdirSync(join(root, "content/chips/es"), { recursive: true });
	writeFileSync(join(root, "content/chips/cashtokens.md"), "");
	writeFileSync(join(root, "content/chips/es/cashtokens.md"), "");
	assert.deepEqual(
		findOrphans({
			contentDir: join(root, "content"),
			dataDir: join(root, "data"),
			overlayDir: join(root, "data/i18n"),
			locales: ["es"],
		}),
		[],
	);
});

test("overlayRecord falls back to English, marked, when the English text changed", () => {
	const changed = { id: "utxo", definition: "Unspent transaction output." };
	assert.deepEqual(overlayRecord(changed, overlay, ["definition"], es), {
		definition: {
			text: "Unspent transaction output.",
			lang: "en",
			fallback: true,
		},
	});
});

const en = {
	hero: { title: "Hi", subtitle: "There" },
	items: [{ title: "One", icon: "tabler:cpu" }],
};

test("copyShapeErrors accepts a translation that changes only words", () => {
	assert.deepEqual(
		copyShapeErrors(en, {
			hero: { title: "Hola", subtitle: "Allí" },
			items: [{ title: "Uno", icon: "tabler:cpu" }],
		}),
		[],
	);
});

test("copyShapeErrors reports dropped keys, list lengths and changed identifiers", () => {
	assert.deepEqual(
		copyShapeErrors(en, {
			hero: { title: "Hola", extra: "x" },
			items: [{ title: "Uno", icon: "tabler:x" }],
		}),
		[
			"hero.subtitle: missing",
			"hero.extra: not in English",
			"items[0].icon: identifier must equal English",
		],
	);
	assert.deepEqual(copyShapeErrors(en, { hero: en.hero, items: [] }), [
		"items: 0 items, English has 1",
	]);
});

test("localeId matches the ids the glob loader makes", () => {
	assert.equal(localeId("es", "about"), "es/about");
	// Lowercased, region code included.
	assert.equal(localeId("en-XA", "about"), "en-xa/about");
	// <locale>/index.yaml loads as id <locale>.
	assert.equal(localeId("es", "index"), "es");
	assert.equal(localeId("es", "guides/index"), "es/guides");
});

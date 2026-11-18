// Run: pnpm test (node --test).
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import {
	findOrphans,
	hashSource,
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
	assert.match(hashSource("abc"), /^[0-9a-f]{16}$/);
	assert.notEqual(hashSource("abc"), hashSource("abd"));
});

const glossary = [
	{ id: "utxo", definition: "Unspent output." },
	{ id: "dsproof", definition: "Double-spend proof." },
];
const overlay = {
	utxo: { definition: { text: "Salida no gastada.", sourceHash: "x" } },
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

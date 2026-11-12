// Run: pnpm test (node --test). Fixed clock throughout.
import assert from "node:assert/strict";
import { test } from "node:test";
import { checkUtxoFreshness, UTXO_STALE_DAYS, utxoAge } from "./utxo-age.mjs";

const NOW = Date.parse("2026-11-12T12:00:00Z");
const daysAgo = (d) => new Date(NOW - d * 86_400_000).toISOString();

test("a fresh snapshot is not stale", () => {
	const age = utxoAge(daysAgo(1), NOW);
	assert.equal(age.stale, false);
	assert.equal(Math.round(age.days), 1);
});

test("exactly the limit is still fresh; just past it is stale", () => {
	assert.equal(utxoAge(daysAgo(UTXO_STALE_DAYS), NOW).stale, false);
	assert.equal(utxoAge(daysAgo(UTXO_STALE_DAYS + 0.01), NOW).stale, true);
});

test("the empty file (generatedAt: null) has no age, so no stale warning", () => {
	assert.equal(utxoAge(null, NOW), null);
	assert.equal(utxoAge(undefined, NOW), null);
	assert.equal(utxoAge("not a date", NOW), null);
});

test("the job check passes on fresh data", () => {
	const r = checkUtxoFreshness({ generatedAt: daysAgo(0.5) }, NOW);
	assert.equal(r.ok, true);
});

test("the job check fails on stale data and names the age", () => {
	const r = checkUtxoFreshness({ generatedAt: daysAgo(4.25) }, NOW);
	assert.equal(r.ok, false);
	assert.match(r.message, /4\.3 days old/);
	assert.match(r.message, /limit 3/);
});

test("the job check passes on the empty file", () => {
	const r = checkUtxoFreshness({ generatedAt: null }, NOW);
	assert.equal(r.ok, true);
	assert.match(r.message, /empty/);
});

test("the job check fails on an unparseable date", () => {
	const r = checkUtxoFreshness({ generatedAt: "yesterday" }, NOW);
	assert.equal(r.ok, false);
});

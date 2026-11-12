// Run: pnpm test (node --test). Fixed clock throughout.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
	checkUtxoFreshness,
	UTXO_STALE_DAYS,
	utxoAge,
	utxoDataAsOf,
} from "./utxo-age.mjs";

const NOW = Date.parse("2026-11-12T12:00:00Z");
const daysAgo = (d) => new Date(NOW - d * 86_400_000).toISOString();
const statsEndingOn = (day, generatedAt = daysAgo(0)) => ({
	generatedAt,
	rows: [
		["2026-01-01", 1],
		[day, 2],
	],
});
const EMPTY = { generatedAt: null, rows: [] };

test("data is as of the end of the newest row's day", () => {
	assert.deepEqual(utxoDataAsOf(statsEndingOn("2026-11-11")), {
		day: "2026-11-11",
		end: "2026-11-12T00:00:00.000Z",
	});
});

test("a fresh snapshot is not stale", () => {
	const age = utxoAge(daysAgo(1), NOW);
	assert.equal(age.stale, false);
	assert.equal(Math.round(age.days), 1);
});

test("exactly the limit is still fresh; just past it is stale", () => {
	assert.equal(utxoAge(daysAgo(UTXO_STALE_DAYS), NOW).stale, false);
	assert.equal(utxoAge(daysAgo(UTXO_STALE_DAYS + 0.01), NOW).stale, true);
});

test("the empty file has no as-of date, so no stale warning", () => {
	assert.equal(utxoDataAsOf(EMPTY), null);
	assert.equal(utxoDataAsOf({ generatedAt: null }), null);
	assert.equal(utxoAge(null, NOW), null);
	assert.equal(utxoAge("not a date", NOW), null);
});

test("the job check passes on fresh data", () => {
	// Normal daily run: yesterday's row closed 12h before NOW.
	const r = checkUtxoFreshness(statsEndingOn("2026-11-11"), NOW);
	assert.equal(r.ok, true);
	assert.match(r.message, /fresh/);
	assert.match(r.message, /0\.5 days ago/);
});

test("the job check fails on stale data and names the age", () => {
	const r = checkUtxoFreshness(statsEndingOn("2026-11-07"), NOW);
	assert.equal(r.ok, false);
	assert.match(r.message, /2026-11-07/);
	assert.match(r.message, /4\.5 days ago/);
	assert.match(r.message, /limit 3/);
});

test("a fresh generatedAt does not hide stale rows", () => {
	// A run that saved mid-catch-up, then failed or ran out of budget.
	const r = checkUtxoFreshness(statsEndingOn("2026-11-01", daysAgo(0)), NOW);
	assert.equal(r.ok, false);
});

test("the job check passes on the empty file", () => {
	const r = checkUtxoFreshness(EMPTY, NOW);
	assert.equal(r.ok, true);
	assert.match(r.message, /no rows yet/);
});

test("the job check fails on an unparseable row date", () => {
	const r = checkUtxoFreshness(statsEndingOn("yesterday"), NOW);
	assert.equal(r.ok, false);
	assert.match(r.message, /no valid date: yesterday/);
});

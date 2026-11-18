import assert from "node:assert/strict";
import { test } from "node:test";

import {
	count,
	formatCurrency,
	formatDate,
	formatNumber,
	formatRelative,
	usd,
} from "./format.ts";

// Intl puts a narrow no-break space in some locales (es "12,3 %"); compare on
// plain spaces so the tests read naturally.
const plain = (s) => s.replace(/[  ]/g, " ");

test("formatDate: en and es, in UTC", () => {
	const d = "2026-01-05T23:30:00Z";
	assert.equal(formatDate(d, "en"), "Jan 5, 2026");
	assert.equal(formatDate(d, "es"), "5 ene 2026");
	assert.equal(formatDate(d, "en", { month: "long" }), "January 5, 2026");
	assert.equal(formatDate(d, "es", { month: "long" }), "5 de enero de 2026");
});

test("formatNumber: en and es grouping and decimals", () => {
	assert.equal(formatNumber(1234567.891, "en"), "1,234,567.891");
	assert.equal(formatNumber(1234567.891, "es"), "1.234.567,891");
	assert.equal(formatNumber(0.123, "en", { style: "percent" }), "12%");
	assert.equal(
		plain(
			formatNumber(0.123, "es", {
				style: "percent",
				minimumFractionDigits: 1,
			}),
		),
		"12,3 %",
	);
});

test("formatCurrency: USD by default", () => {
	assert.equal(formatCurrency(1234.5, "en"), "$1,234.50");
	assert.equal(plain(formatCurrency(1234.5, "es")), "1234,50 US$");
	assert.equal(
		formatCurrency(1.23e9, "en", {
			notation: "compact",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}),
		"$1.23B",
	);
});

test("formatRelative: past and future", () => {
	assert.equal(formatRelative(-3, "day", "en"), "3 days ago");
	assert.equal(formatRelative(-3, "day", "es"), "hace 3 días");
	assert.equal(formatRelative(2, "hour", "en"), "in 2 hours");
	assert.equal(formatRelative(2, "hour", "es"), "dentro de 2 horas");
});

test("locale fallback: unknown code is English, a known Intl tag is kept", () => {
	assert.equal(formatNumber(1234.5, undefined), "1,234.5");
	assert.equal(formatNumber(1234.5, "xx-nope"), "1,234.5");
	assert.equal(formatNumber(12345.5, "pt"), "12.345,5");
});

test("the memo keys on locale and options, so cached formatters never mix", () => {
	assert.equal(formatNumber(12345.5, "en"), "12,345.5");
	assert.equal(formatNumber(12345.5, "es"), "12.345,5");
	assert.equal(formatNumber(12345.5, "en"), "12,345.5");
	assert.equal(
		formatNumber(12345.5, "en", { maximumFractionDigits: 0 }),
		"12,346",
	);
	assert.equal(formatNumber(12345.5, "en"), "12,345.5");
});

test("en-serialized data formats correctly on the es path", () => {
	// What a JSON island and a data-* attribute carry: raw JS numbers.
	const island = JSON.parse(
		JSON.stringify({ supply: [19876543.21], cdd: [1500000] }),
	);
	const attr = String(1234.56); // data-value={1234.56}
	assert.equal(attr, "1234.56");
	const value = Number(attr);
	assert.ok(!Number.isNaN(value));
	assert.equal(formatNumber(value, "es"), "1234,56");
	assert.equal(
		formatNumber(island.supply[0], "es", { maximumFractionDigits: 0 }),
		"19.876.543",
	);
	assert.equal(
		plain(
			formatNumber(island.cdd[0], "es", {
				notation: "compact",
				maximumFractionDigits: 1,
			}),
		),
		"1,5 M",
	);
	// Re-parsing a localized string is the bug this rules out: es "1.234,56"
	// read as a JS number is wrong by 1000x or NaN.
	assert.ok(Number.isNaN(Number(formatNumber(1234567.5, "es"))));
});

test("usd: English matches the pre-i18n output exactly", () => {
	// The old formatter, verbatim: toFixed for B/M, en toLocaleString above $1.
	const old = (n) => {
		if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
		if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
		if (n >= 1)
			return `$${n.toLocaleString("en", { maximumFractionDigits: 2 })}`;
		if (n === 0) return "$0";
		return `$${n.toPrecision(2)}`;
	};
	for (const n of [
		0, 0.000123, 0.0012, 0.05, 0.5, 1, 1.5, 999.999, 1234.5, 12345.678, 999999,
		1e6, 4.56e7, 1e9, 1.23e9, 12.3e9, 1.2757e12,
	]) {
		assert.equal(usd(n, "en"), old(n), String(n));
	}
	assert.equal(usd(1.2757e12, "en"), "$1275.70B");
	assert.equal(usd(null, "en"), "n/a");
});

test("usd: es keeps the suffix on the digits and localizes the rest", () => {
	assert.equal(plain(usd(1.2757e12, "es")), "1275,70B US$");
	assert.equal(plain(usd(4.56e7, "es")), "45,6M US$");
	assert.equal(plain(usd(12345.5, "es")), "12.345,5 US$");
	assert.equal(plain(usd(0.0012, "es")), "0,0012 US$");
});

test("count: grouped per locale, n/a when missing", () => {
	assert.equal(count(950123, "en"), "950,123");
	assert.equal(count(950123, "es"), "950.123");
	assert.equal(count(undefined, "es"), "n/a");
});

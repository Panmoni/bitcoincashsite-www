import assert from "node:assert/strict";
import { test } from "node:test";

import {
	astroI18n,
	DEFAULT_LOCALE,
	draftLocaleCodes,
	getLocale,
	htmlAttrs,
	LOCALES,
} from "./locales.ts";

test("every locale carries the full set of fields", () => {
	for (const l of LOCALES) {
		for (const key of ["code", "bcp47", "endonym", "intl", "og"]) {
			assert.ok(l[key], `${l.code}.${key}`);
		}
		assert.match(l.dir, /^(ltr|rtl)$/);
		assert.match(l.status, /^(draft|live)$/);
	}
	assert.equal(new Set(LOCALES.map((l) => l.code)).size, LOCALES.length);
});

test("the default locale is live English", () => {
	assert.equal(DEFAULT_LOCALE, "en");
	assert.equal(getLocale(DEFAULT_LOCALE).status, "live");
});

test("unknown or missing codes fall back to the default locale", () => {
	assert.equal(getLocale(undefined).code, "en");
	assert.equal(getLocale("xx").code, "en");
});

test("htmlAttrs renders an rtl locale as dir=rtl", () => {
	const ar = {
		code: "ar",
		bcp47: "ar",
		endonym: "العربية",
		dir: "rtl",
		intl: "ar",
		og: "ar_AR",
		status: "draft",
	};
	assert.deepEqual(htmlAttrs(ar), { lang: "ar", dir: "rtl" });
	assert.deepEqual(htmlAttrs(getLocale("es")), { lang: "es", dir: "ltr" });
});

test("Spanish is draft, and the astro i18n block keeps English unprefixed", () => {
	assert.deepEqual(draftLocaleCodes(), ["es"]);
	assert.deepEqual(astroI18n(), {
		defaultLocale: "en",
		locales: ["en", "es"],
		routing: { prefixDefaultLocale: false },
	});
});

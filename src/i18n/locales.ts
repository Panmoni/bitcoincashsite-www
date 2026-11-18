// The one list of languages the site knows, and how each is routed.
// astro.config.mjs builds its `i18n` block from it; the layout reads
// `lang`, `dir` and robots from it. Add a language here first.
//
// Routing: English stays unprefixed (/about); every other locale lives
// under /<code>/. No `fallback` is configured on purpose: a locale route
// exists only where a translated page exists, so English copy is never
// emitted under /es/.

export type LocaleStatus = "draft" | "live";

export interface Locale {
	/** URL segment and Astro locale code, e.g. "es". */
	code: string;
	/** BCP-47 tag for `<html lang>` and hreflang, e.g. "es". */
	bcp47: string;
	/** The language's name in itself, for the switcher. */
	endonym: string;
	dir: "ltr" | "rtl";
	/** Locale passed to Intl formatters. */
	intl: string;
	/** og:locale value, e.g. "es_ES". */
	og: string;
	/** A draft locale builds but is noindex and stays out of the sitemap. */
	status: LocaleStatus;
}

const REAL_LOCALES = [
	{
		code: "en",
		bcp47: "en",
		endonym: "English",
		dir: "ltr",
		intl: "en",
		og: "en_US",
		status: "live",
	},
	{
		code: "es",
		bcp47: "es",
		endonym: "Español",
		dir: "ltr",
		intl: "es",
		og: "es_ES",
		status: "draft",
	},
] as const satisfies readonly Locale[];

// Pseudo-locales (PAN-383): generated from English by `pnpm i18n:pseudo` and
// built only in CI, with I18N_PSEUDO=1, to prove every page survives longer
// text and a right-to-left layout. Never committed as content.
export const PSEUDO_LOCALES = [
	{
		code: "en-XA",
		bcp47: "en-XA",
		endonym: "Ëñĝļîšĥ (pseudo)",
		dir: "ltr",
		intl: "en",
		og: "en_XA",
		status: "draft",
	},
	{
		code: "ar-XB",
		bcp47: "ar-XB",
		endonym: "Pseudo RTL",
		dir: "rtl",
		intl: "ar",
		og: "ar_XB",
		status: "draft",
	},
] as const satisfies readonly Locale[];

/** Codes of the pseudo-locales, whether or not this build includes them. */
export const PSEUDO_CODES: readonly string[] = PSEUDO_LOCALES.map(
	(l) => l.code,
);

type RegistryEntry =
	| (typeof REAL_LOCALES)[number]
	| (typeof PSEUDO_LOCALES)[number];

// globalThis: this module also runs in the browser, where `process` is absent.
const pseudoBuild = Boolean(
	(globalThis as { process?: { env: Record<string, string | undefined> } })
		.process?.env.I18N_PSEUDO,
);

export const LOCALES: readonly RegistryEntry[] = pseudoBuild
	? [...REAL_LOCALES, ...PSEUDO_LOCALES]
	: REAL_LOCALES;

export type LocaleCode = RegistryEntry["code"];

export const DEFAULT_LOCALE = "en" satisfies LocaleCode;

// Looked up by code, so reordering LOCALES cannot change the default.
export const defaultLocale: Locale = LOCALES.find(
	(l) => l.code === DEFAULT_LOCALE,
) as Locale;

/** The registry entry for a code; the default locale for an unknown one. */
export const getLocale = (code?: string): Locale =>
	LOCALES.find((l) => l.code === code) ?? defaultLocale;

/** The attributes `<html>` carries for a locale. */
export const htmlAttrs = (locale: Locale) => ({
	lang: locale.bcp47,
	dir: locale.dir,
});

/** Locales whose pages must not be indexed yet. */
export const draftLocaleCodes = (): string[] =>
	LOCALES.filter((l) => l.status === "draft").map((l) => l.code);

/** The `i18n` block for astro.config.mjs. */
export const astroI18n = () => ({
	defaultLocale: DEFAULT_LOCALE,
	locales: LOCALES.map((l) => l.code),
	routing: { prefixDefaultLocale: false },
});

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

export const LOCALES = [
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

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE = "en" satisfies LocaleCode;

export const defaultLocale: Locale = LOCALES[0];

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

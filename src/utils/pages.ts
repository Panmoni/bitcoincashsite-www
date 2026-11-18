// Page copy: the prose of a src/pages/*.astro file lives in the `pages`
// collection (src/content/pages/<id>.yaml or .md), so it translates the same
// way articles do. A page file reads it here and keeps only layout.
import { DEFAULT_LOCALE, type LocaleCode } from "~/i18n/locales";
import { getLocalizedEntry } from "./l10n";

/**
 * The copy for page `id` in `locale`. A missing English entry is a build
 * error. A missing locale entry returns `null`: that page has no locale route.
 */
export async function getPageEntry(id: string, locale: LocaleCode) {
	const entry = await getLocalizedEntry("pages", id, locale);
	if (!entry && locale === DEFAULT_LOCALE)
		throw new Error(`No page copy for "${id}" in src/content/pages/`);
	return entry;
}

/** The copy for an English page. Throws if src/content/pages/<id> is missing. */
export async function getPageCopy(id: string) {
	// biome-ignore lint/style/noNonNullAssertion: getPageEntry throws for English
	return (await getPageEntry(id, DEFAULT_LOCALE))!.data;
}

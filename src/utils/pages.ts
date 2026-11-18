// Page copy: the prose of a src/pages/*.astro file lives in the `pages`
// collection (src/content/pages/<id>.yaml or .md), so it translates the same
// way articles do. A page file reads it here and keeps only layout.
import { DEFAULT_LOCALE, type LocaleCode } from "~/i18n/locales";
import type { MetaData } from "~/types";
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

// Page copy is free-form YAML: the schema checks only `metadata`, so each
// page reads its own keys untyped. A list a page destructures in .map()
// is cast to CopyList so its fields are typed `any` explicitly.
export type PageCopy = {
	metadata: MetaData & { title: string; description: string };
	// biome-ignore lint/suspicious/noExplicitAny: free-form YAML, see above
	[key: string]: any;
};
// biome-ignore lint/suspicious/noExplicitAny: free-form YAML, see above
export type CopyList = Record<string, any>[];

/** The copy for an English page. Throws if src/content/pages/<id> is missing. */
export async function getPageCopy(id: string): Promise<PageCopy> {
	// biome-ignore lint/style/noNonNullAssertion: getPageEntry throws for English
	return (await getPageEntry(id, DEFAULT_LOCALE))!.data as PageCopy;
}

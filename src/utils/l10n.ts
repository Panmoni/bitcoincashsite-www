// Localized content lookups for pages and components (PAN-378). The logic
// lives in localize.mjs so `pnpm test` covers it; this file binds it to
// astro:content and the locale registry. Policy: docs/i18n.md.
import {
	type CollectionEntry,
	type CollectionKey,
	getEntry,
} from "astro:content";
import { readFileSync } from "node:fs";
import { z } from "astro/zod";
import { DEFAULT_LOCALE, type LocaleCode } from "~/i18n/locales";
import {
	hashSource,
	makeGetLocalizedEntry,
	overlayRecord,
} from "./localize.mjs";

/** English collections that have a `<name>L10n` twin in content.config.ts. */
export type LocalizedCollection =
	| "post"
	| "pages"
	| "upgrades"
	| "chips"
	| "compare"
	| "guides"
	| "reference"
	| "reports";

type L10nOf<C extends LocalizedCollection> = Extract<CollectionKey, `${C}L10n`>;

export type LocalizedEntry<C extends LocalizedCollection> =
	| CollectionEntry<C>
	| CollectionEntry<L10nOf<C>>;

const lookup = makeGetLocalizedEntry({
	getEntry: (collection: string, id: string) =>
		// biome-ignore lint/suspicious/noExplicitAny: collection is chosen at runtime
		getEntry(collection as any, id),
	defaultLocale: DEFAULT_LOCALE,
	localizedCollection: (c: string) => `${c}L10n`,
});

/**
 * The entry for `slug` in `locale`, or `null` when that locale has none.
 * It never substitutes English; a page with no locale entry gets no
 * locale route.
 */
export const getLocalizedEntry = <C extends LocalizedCollection>(
	collection: C,
	slug: string,
	locale: LocaleCode,
): Promise<LocalizedEntry<C> | null> => lookup(collection, slug, locale);

export interface TranslationState {
	status: "machine" | "reviewed";
	/** The English changed since this translation was made or reviewed. */
	stale: boolean;
	translator: string;
	reviewer?: string;
}

/**
 * Where the translation of `slug` in `locale` stands, for
 * `<TranslationNotice>`: `null` on an English page or when there is no
 * translation. Stale means the English file's hash no longer matches the
 * `sourceHash` the translation records.
 */
export const getTranslationState = async (
	collection: LocalizedCollection,
	slug: string,
	locale: LocaleCode,
): Promise<TranslationState | null> => {
	if (locale === DEFAULT_LOCALE) return null;
	const entry = await getLocalizedEntry(collection, slug, locale);
	const english = await getLocalizedEntry(collection, slug, DEFAULT_LOCALE);
	if (!entry || !english?.filePath) return null;
	const { sourceHash, status, translator, reviewer } = (
		entry.data as {
			translation: Omit<TranslationState, "stale"> & { sourceHash: string };
		}
	).translation;
	const source = hashSource(readFileSync(english.filePath, "utf8"));
	return { status, translator, reviewer, stale: sourceHash !== source };
};

// src/data/i18n/<locale>/<file>.json: id → translatable field → text plus
// the hash of the English text it was made from. Nothing else lives there,
// so the daily data refresh never touches it.
const overlaySchema = z.record(
	z.string(),
	z.record(
		z.string(),
		z.object({
			text: z.string(),
			sourceHash: z.string().regex(/^[0-9a-f]{16}$/),
			// Written by `pnpm i18n:draft` / `i18n:review` (docs/i18n.md).
			status: z.enum(["machine", "reviewed"]).optional(),
			translator: z.string().optional(),
			reviewer: z.string().optional(),
		}),
	),
);
export type Overlay = z.infer<typeof overlaySchema>;

const overlayFiles = import.meta.glob<Overlay>("/src/data/i18n/*/*.json", {
	eager: true,
	import: "default",
});

const parsed = new Map<string, Overlay>();

/** The overlay for one data file in one locale; `{}` when there is none. */
export const getOverlay = (file: string, locale: LocaleCode): Overlay => {
	const path = `/src/data/i18n/${locale}/${file}.json`;
	if (!(path in overlayFiles)) return {};
	let overlay = parsed.get(path);
	if (!overlay) {
		overlay = overlaySchema.parse(overlayFiles[path]);
		parsed.set(path, overlay);
	}
	return overlay;
};

export interface LocalizedText {
	text: string;
	/** Language the text is actually in. */
	lang: LocaleCode;
	/** English shown on a non-English page; render it inside `lang="en"`. */
	fallback: boolean;
}

/**
 * The translatable `fields` of a JSON record (glossary, opcodes, projects)
 * in `locale`, each falling back to English, marked, when the overlay lacks
 * it. Render the result with `<LocalizedText>`.
 */
export const localizeRecord = <F extends string>(
	record: { id: string } & Record<F, string>,
	file: string,
	fields: readonly F[],
	locale: LocaleCode,
): Record<F, LocalizedText> =>
	overlayRecord(record, getOverlay(file, locale), fields, {
		locale,
		defaultLocale: DEFAULT_LOCALE,
	}) as Record<F, LocalizedText>;

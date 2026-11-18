// Localized content: the parts that need no Astro runtime, so `pnpm test`
// can cover them. src/utils/l10n.ts binds them to astro:content.
// The policy these functions enforce is written up in docs/i18n.md.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

/** Sixteen hex chars of the SHA-256 of a translation's English source. */
export const hashSource = (text) =>
	createHash("sha256").update(text, "utf8").digest("hex").slice(0, 16);

/**
 * The id a locale entry gets: `<locale>/<slug>`, as the glob loader makes it:
 * lowercased (a region code such as en-XA too), and with a trailing `index`
 * dropped, so `<locale>/index.yaml` is just `<locale>` (PAN-383).
 */
export const localeId = (locale, slug) =>
	`${locale.toLowerCase()}/${slug}`.replace(/\/index$/, "");

/**
 * Binds the lookup to a `getEntry(collection, id)` function. The returned
 * `getLocalizedEntry(collection, slug, locale)` gives the entry in that
 * locale, or `null`. It never falls back to English: the caller decides.
 */
export const makeGetLocalizedEntry =
	({ getEntry, defaultLocale, localizedCollection }) =>
	async (collection, slug, locale) => {
		const entry =
			locale === defaultLocale
				? await getEntry(collection, slug)
				: await getEntry(
						localizedCollection(collection),
						localeId(locale, slug),
					);
		return entry ?? null;
	};

/**
 * Translatable fields of one JSON record, each with the language it is in.
 * A field the overlay lacks, or whose `sourceHash` no longer matches the
 * English text (stale), keeps its English value and `lang` set to the
 * default locale, so the page can mark it as a fallback fragment.
 */
export const overlayRecord = (
	record,
	overlay,
	fields,
	{ locale, defaultLocale },
) => {
	const row = overlay?.[record.id];
	return Object.fromEntries(
		fields.map((f) => {
			const t = row?.[f];
			const fresh = t && t.sourceHash === hashSource(String(record[f]));
			return [
				f,
				locale !== defaultLocale && fresh
					? { text: t.text, lang: locale, fallback: false }
					: {
							text: record[f],
							lang: defaultLocale,
							fallback: locale !== defaultLocale,
						},
			];
		}),
	);
};

/** Keys whose values are identifiers the page code reads, never words. */
export const IDENTIFIER_KEYS = new Set([
	"id",
	"icon",
	"href",
	"url",
	"src",
	"tone",
	"size",
	"collection",
	"verdict",
	"best",
	"pct",
	"txid",
	"random",
	"target",
	"variant",
]);

/**
 * How a translated page copy differs in structure from the English one:
 * every key, list length and identifier value must match, so a translation
 * can change words but never what the page code reads. Returns the paths
 * that differ, empty when the shapes agree.
 */
export const copyShapeErrors = (en, tr, path = "") => {
	if (Array.isArray(en)) {
		if (!Array.isArray(tr)) return [`${path}: expected a list`];
		if (tr.length !== en.length)
			return [`${path}: ${tr.length} items, English has ${en.length}`];
		return en.flatMap((v, i) => copyShapeErrors(v, tr[i], `${path}[${i}]`));
	}
	if (en && typeof en === "object" && !(en instanceof Date)) {
		if (!tr || typeof tr !== "object" || Array.isArray(tr))
			return [`${path}: expected a block`];
		const keys = new Set([...Object.keys(en), ...Object.keys(tr)]);
		return [...keys].flatMap((k) => {
			const at = path ? `${path}.${k}` : k;
			if (!(k in tr)) return [`${at}: missing`];
			if (!(k in en)) return [`${at}: not in English`];
			if (
				IDENTIFIER_KEYS.has(k) &&
				JSON.stringify(en[k]) !== JSON.stringify(tr[k])
			)
				return [`${at}: identifier must equal English`];
			return copyShapeErrors(en[k], tr[k], at);
		});
	}
	return typeof tr === typeof en ? [] : [`${path}: expected ${typeof en}`];
};

const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const stem = (name) => name.slice(0, name.length - extname(name).length);
const filesUnder = (dir) =>
	readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		return isDir(p) ? filesUnder(p) : [p];
	});

/**
 * Translations whose English original no longer exists. Each would otherwise
 * attach to whatever later reuses that id.
 *
 * - content: `<contentDir>/<collection>/<locale>/<slug>.<ext>` with no
 *   `<contentDir>/<collection>/<slug>.<ext>`.
 * - overlays: an id in `<overlayDir>/<locale>/<file>.json` that is not an `id`
 *   in `<dataDir>/<file>.json`.
 *
 * Returns `[{ kind, locale, file, id }]`, empty when nothing is orphaned.
 */
export const findOrphans = ({ contentDir, dataDir, overlayDir, locales }) => {
	const orphans = [];
	for (const collection of isDir(contentDir) ? readdirSync(contentDir) : []) {
		const base = join(contentDir, collection);
		if (!isDir(base)) continue;
		const english = new Set(
			filesUnder(base)
				.map((p) => relative(base, p))
				.filter((r) => !locales.includes(r.split("/")[0]))
				.map(stem),
		);
		for (const locale of locales) {
			const dir = join(base, locale);
			if (!isDir(dir)) continue;
			for (const p of filesUnder(dir)) {
				const slug = stem(relative(dir, p));
				if (!english.has(slug))
					orphans.push({
						kind: "content",
						locale,
						file: relative(contentDir, p),
						id: localeId(locale, slug),
					});
			}
		}
	}
	for (const locale of locales) {
		const dir = join(overlayDir, locale);
		if (!isDir(dir)) continue;
		for (const name of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
			const source = join(dataDir, name);
			const ids = existsSync(source)
				? new Set(JSON.parse(readFileSync(source, "utf8")).map((r) => r.id))
				: new Set();
			const overlay = JSON.parse(readFileSync(join(dir, name), "utf8"));
			for (const id of Object.keys(overlay))
				if (!ids.has(id))
					orphans.push({
						kind: "overlay",
						locale,
						file: `${locale}/${name}`,
						id,
					});
		}
	}
	return orphans;
};

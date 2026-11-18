// pnpm i18n:check:dist: checks the i18n signals in a built site (PAN-380,
// PAN-383):
//   - draft-locale pages carry no hreflang and appear in no alternate set,
//   - every hreflang target exists, is indexable, and links back with the
//     same set (reciprocity), x-default pointing at the English page,
//   - every page under a locale prefix has a self-referencing canonical,
//   - the sitemap holds no draft-locale URL and its xhtml:link alternates
//     match the page's hreflang,
//   - every RSS item links to a page that was built,
//   - no page in a live locale links to a draft locale,
//   - no locale page links to an English page whose counterpart in its own
//     locale was built (the language switcher excepted),
//   - in a pseudo-locale page, no visible text is left un-pseudo'd.
// It also lists every embedded English fragment (data-l10n-fallback), which
// the policy allows, so a reviewer can see them.
// Usage: node scripts/check-i18n-seo.mjs [dist]. Exits 1 on any problem.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPages, routeLocale, urlPath } from "../src/i18n/alternates.mjs";
import { DEFAULT_LOCALE, LOCALES, PSEUDO_CODES } from "../src/i18n/locales.ts";
import { dropElements, loadAllowlist } from "./i18n/check.mjs";
import { unpseudoWords } from "./i18n/pseudo.mjs";

const signature = (links) =>
	links
		.map((l) => `${l.lang} ${urlPath(l.href)}`)
		.sort()
		.join("\n");

/** Every problem found under `dir`, one string each. `pages` skips re-reading `dir`. */
export async function checkDist(
	dir,
	registry = { locales: LOCALES, defaultLocale: DEFAULT_LOCALE },
	pages = null,
) {
	const errors = [];
	pages ??= await readPages(dir, registry);
	const byPath = new Map(pages.map((p) => [p.path, p]));
	const isDefault = (locale) => locale.code === registry.defaultLocale;

	for (const page of pages) {
		const where = page.path;
		if (page.locale.status === "draft") {
			if (page.hreflang.length)
				errors.push(`${where}: draft-locale page has hreflang`);
			if (page.ogAlternates.length)
				errors.push(`${where}: draft-locale page has og:locale:alternate`);
		}
		if (!isDefault(page.locale) && urlPath(page.canonical ?? "") !== where)
			errors.push(`${where}: canonical is ${page.canonical}, not itself`);
		if (!page.hreflang.length) continue;

		const langs = page.hreflang.map((l) => l.lang);
		if (new Set(langs).size !== langs.length)
			errors.push(`${where}: repeated hreflang value in ${langs.join(", ")}`);
		const self = page.hreflang.find((l) => urlPath(l.href) === where);
		if (!self) errors.push(`${where}: hreflang set omits the page itself`);
		else if (self.lang !== page.htmlLang)
			errors.push(
				`${where}: self hreflang ${self.lang} ≠ <html lang> ${page.htmlLang}`,
			);

		const mine = signature(page.hreflang);
		const targets = page.hreflang.filter((l) => l.lang !== "x-default");
		for (const link of targets) {
			const target = byPath.get(urlPath(link.href));
			if (!target) {
				errors.push(`${where}: hreflang ${link.lang} → ${link.href} not built`);
				continue;
			}
			if (target.locale.status !== "live" || target.noindex)
				errors.push(
					`${where}: hreflang ${link.lang} → ${link.href} is not live and indexable`,
				);
			if (signature(target.hreflang) !== mine)
				errors.push(
					`${where}: ${link.href} does not link back with the same set`,
				);
		}
		const english = targets.find((l) =>
			isDefault(routeLocale(urlPath(l.href), registry)),
		);
		const xDefault = page.hreflang.find((l) => l.lang === "x-default");
		if (english && urlPath(xDefault?.href ?? "") !== urlPath(english.href))
			errors.push(`${where}: x-default must point to ${english.href}`);
	}

	errors.push(...(await checkSitemaps(dir, byPath, registry)));
	errors.push(...(await checkFeeds(dir, byPath)));
	errors.push(...checkLinks(pages, byPath, registry));
	return errors;
}

// Script, style and comment blocks: never links, never visible text.
const INERT = /<(script|style)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->/gi;
const A_TAG = /<a\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;

/** Where internal links point in the wrong locale. */
export function checkLinks(pages, byPath, registry) {
	const errors = [];
	const isDefault = (l) => l.code === registry.defaultLocale;
	for (const page of pages) {
		const html = page.html.replace(INERT, "");
		for (const [tag] of html.matchAll(A_TAG)) {
			const href = tag.match(/\shref="([^"]*)"/)?.[1];
			if (!href?.startsWith("/") || href.startsWith("//")) continue;
			const target = urlPath(href);
			const locale = routeLocale(target, registry);
			if (page.locale.status === "live" && locale.status === "draft")
				errors.push(`${page.path}: links to draft-locale page ${href}`);
			if (
				isDefault(page.locale) ||
				!isDefault(locale) ||
				/\sdata-locale-switch=/.test(tag)
			)
				continue;
			const own =
				target === "/"
					? `/${page.locale.code}`
					: `/${page.locale.code}${target}`;
			if (byPath.has(own))
				errors.push(
					`${page.path}: links to English ${href}, but ${own} exists`,
				);
		}
	}
	return errors;
}

/** The visible text of a page: text nodes, <title> and text attributes. */
export function visibleText(html) {
	const body = html
		.replace(INERT, " ")
		// Code stays as written. <time> holds Intl output, which has no
		// pseudo-locale data; src/i18n/format.test.mjs covers it.
		.replace(/<(pre|code|svg|time)\b[\s\S]*?<\/\1>/gi, " ");
	// Declared English fragments are allowed (dataFallbacks lists them), and
	// so is any element that names its own language, such as a language
	// switcher's endonyms, or says translate="no".
	const shown = dropElements(body, /data-l10n-fallback\b|lang=|translate="no"/);
	const attrs = [
		...shown.matchAll(/\s(?:alt|title|aria-label|placeholder)="([^"]*)"/gi),
	].map((m) => m[1]);
	const nodes = shown
		.replace(
			/<head\b[\s\S]*?<\/head>/i,
			(head) => (head.match(/<title>[\s\S]*?<\/title>/i) ?? [""])[0],
		)
		.replace(/<(?:[^>"']|"[^"]*"|'[^']*')*>/g, "\n")
		.split("\n");
	return [...nodes, ...attrs]
		.map((t) =>
			t
				.replace(/&nbsp;|&#160;/g, " ")
				.replace(/&[a-z]+;|&#x?[\da-f]+;/gi, "")
				.replace(/\s+/g, " ")
				.trim(),
		)
		.filter(Boolean);
}

/** Visible text in pseudo-locale pages that is still plain English. */
export function checkPseudo(pages, pseudoCodes, terms) {
	const errors = [];
	for (const page of pages) {
		if (!pseudoCodes.includes(page.locale.code)) continue;
		for (const text of new Set(visibleText(page.html))) {
			const words = unpseudoWords(text, page.locale.code, terms);
			if (words.length)
				errors.push(`${page.path}: un-pseudo'd "${text.slice(0, 80)}"`);
		}
	}
	return errors;
}

/** Every embedded English fragment in a locale page, as `path: text`. */
export function dataFallbacks(pages, registry) {
	return pages
		.filter((p) => p.locale.code !== registry.defaultLocale)
		.flatMap((p) =>
			[
				...p.html.matchAll(
					/<(\w+)\b[^>]*\sdata-l10n-fallback\b[^>]*>([\s\S]*?)<\/\1>/gi,
				),
			].map(
				(m) =>
					`${p.path}: ${m[2]
						.replace(/<[^>]*>/g, "")
						.trim()
						.slice(0, 80)}`,
			),
		);
}

async function checkSitemaps(dir, byPath, registry) {
	const errors = [];
	const files = (await readdir(dir)).filter(
		(f) => /^sitemap-.*\.xml$/.test(f) && f !== "sitemap-index.xml",
	);
	for (const file of files) {
		const xml = await readFile(path.join(dir, file), "utf8");
		for (const [, body] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
			const loc = body.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "";
			const p = urlPath(loc);
			if (routeLocale(p, registry).status === "draft")
				errors.push(`${file}: lists draft-locale URL ${loc}`);
			const links = [...body.matchAll(/<xhtml:link\b[^>]*\/?>/g)].map(
				([tag]) => ({
					lang: tag.match(/hreflang="([^"]+)"/)?.[1],
					href: tag.match(/href="([^"]+)"/)?.[1] ?? "",
				}),
			);
			const page = byPath.get(p);
			if (page && signature(links) !== signature(page.hreflang))
				errors.push(
					`${file}: ${loc} alternates differ from the page's hreflang`,
				);
		}
	}
	return errors;
}

async function checkFeeds(dir, byPath) {
	const errors = [];
	const entries = await readdir(dir, { recursive: true, withFileTypes: true });
	for (const e of entries.filter((x) => x.isFile() && x.name === "rss.xml")) {
		const file = path.relative(dir, path.join(e.parentPath, e.name));
		const xml = await readFile(path.join(dir, file), "utf8");
		for (const [, body] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
			const link = body.match(/<link>([^<]+)<\/link>/)?.[1] ?? "";
			if (!byPath.has(urlPath(link)))
				errors.push(`${file}: item links to ${link}, which was not built`);
		}
	}
	return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const dir = path.resolve(process.argv[2] ?? "dist");
	const registry = { locales: LOCALES, defaultLocale: DEFAULT_LOCALE };
	const pages = await readPages(dir, registry);
	const errors = await checkDist(dir, registry, pages);
	const pseudo = LOCALES.map((l) => l.code).filter((c) =>
		PSEUDO_CODES.includes(c),
	);
	if (pseudo.length) {
		const pseudoErrors = checkPseudo(
			pages,
			pseudo,
			loadAllowlist(process.cwd()).terms,
		);
		errors.push(...pseudoErrors);
		const count = pages.filter((p) => pseudo.includes(p.locale.code)).length;
		console.log(
			`pseudo-locales: ${count} page(s) in ${pseudo.join(", ")}, ${pseudoErrors.length} un-pseudo'd string(s)`,
		);
	}
	const fallbacks = dataFallbacks(pages, registry);
	for (const f of fallbacks) console.log(`fragment ${f}`);
	console.log(`${fallbacks.length} embedded English fragment(s)`);
	for (const e of errors) console.error(e);
	console.log(
		errors.length
			? `i18n:check:dist: ${errors.length} problem(s) in ${dir}`
			: `i18n:check:dist: ok (${dir})`,
	);
	process.exit(errors.length ? 1 : 0);
}

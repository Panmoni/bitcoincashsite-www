// Checks the i18n SEO signals in a built site (PAN-380):
//   - draft-locale pages carry no hreflang and appear in no alternate set,
//   - every hreflang target exists, is indexable, and links back with the
//     same set (reciprocity), x-default pointing at the English page,
//   - every page under a locale prefix has a self-referencing canonical,
//   - the sitemap holds no draft-locale URL and its xhtml:link alternates
//     match the page's hreflang,
//   - every RSS item links to a page that was built.
// Usage: node scripts/check-i18n-seo.mjs [dist]. Exits 1 on any problem.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPages, routeLocale, urlPath } from "../src/i18n/alternates.mjs";
import { DEFAULT_LOCALE, LOCALES } from "../src/i18n/locales.ts";

const signature = (links) =>
	links
		.map((l) => `${l.lang} ${urlPath(l.href)}`)
		.sort()
		.join("\n");

/** Every problem found under `dir`, one string each. */
export async function checkDist(
	dir,
	registry = { locales: LOCALES, defaultLocale: DEFAULT_LOCALE },
) {
	const errors = [];
	const pages = await readPages(dir, registry);
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
	return errors;
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
	const errors = await checkDist(dir);
	for (const e of errors) console.error(e);
	console.log(
		errors.length
			? `check-i18n-seo: ${errors.length} problem(s) in ${dir}`
			: `check-i18n-seo: ok (${dir})`,
	);
	process.exit(errors.length ? 1 : 0);
}

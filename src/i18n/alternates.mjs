// hreflang and og:locale:alternate for translated pages (PAN-380).
//
// A page cannot know at render time which other locales built a counterpart,
// so this runs after the build, over dist. It groups every indexable page in
// a live locale by its path without the locale prefix (/about, /es/about),
// then writes the cluster into each member's <head>. The sitemap reads the
// same clusters, so the HTML and the sitemap cannot disagree.
// scripts/check-i18n-seo.mjs checks the result. Policy: docs/i18n.md.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_LOCALE, LOCALES } from "./locales.ts";

const REGISTRY = { locales: LOCALES, defaultLocale: DEFAULT_LOCALE };

/** Every .html file under `dir`, as paths relative to it. */
export async function listHtml(dir) {
	const entries = await readdir(dir, { recursive: true, withFileTypes: true });
	return entries
		.filter((e) => e.isFile() && e.name.endsWith(".html"))
		.map((e) => path.relative(dir, path.join(e.parentPath, e.name)));
}

/** The URL path a built file is served at: about.html → /about, index.html → /. */
export const servedPath = (rel) => {
	const p = rel
		.split(path.sep)
		.join("/")
		.replace(/\.html$/, "")
		.replace(/(^|\/)index$/, "");
	return `/${p}`.replace(/(.)\/$/, "$1");
};

/** A URL's path in the same form as servedPath: no trailing slash. */
export const urlPath = (url) =>
	new URL(url, "https://x.invalid").pathname.replace(/(.)\/$/, "$1");

/** The locale a URL path is routed under: its first segment, or the default. */
export const routeLocale = (p, { locales, defaultLocale } = REGISTRY) => {
	const seg = p.split("/")[1];
	return (
		locales.find((l) => l.code === seg && l.code !== defaultLocale) ??
		locales.find((l) => l.code === defaultLocale)
	);
};

/** The path with its locale prefix removed: /es/about → /about. */
const clusterKey = (p, locale, defaultLocale) =>
	locale.code === defaultLocale ? p : p.slice(locale.code.length + 1) || "/";

const attr = (tag, name) =>
	tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1];

/** The <head> facts this module and the checker read from a built page. */
export function parsePage(html) {
	const links = html.match(/<link\b[^>]*>/gi) ?? [];
	const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
	const robots = metas.find((t) => attr(t, "name") === "robots");
	return {
		htmlLang: html.match(/<html\b[^>]*\slang="([^"]+)"/i)?.[1],
		canonical: attr(
			links.find((t) => attr(t, "rel") === "canonical") ?? "",
			"href",
		),
		noindex: /noindex/i.test(attr(robots ?? "", "content") ?? ""),
		hreflang: links
			.filter((t) => attr(t, "rel") === "alternate" && attr(t, "hreflang"))
			.map((t) => ({ lang: attr(t, "hreflang"), href: attr(t, "href") })),
		ogAlternates: metas
			.filter((t) => attr(t, "property") === "og:locale:alternate")
			.map((t) => attr(t, "content")),
	};
}

/** Every built page with its path, route locale and parsed head. */
export async function readPages(dir, registry = REGISTRY) {
	const files = await listHtml(dir);
	return Promise.all(
		files.map(async (file) => {
			const html = await readFile(path.join(dir, file), "utf8");
			const p = servedPath(file);
			return {
				file,
				path: p,
				locale: routeLocale(p, registry),
				html,
				...parsePage(html),
			};
		}),
	);
}

/**
 * Groups the pages that may be alternates: a live locale, indexable, and
 * canonical to themselves. Returns only the groups with two or more members;
 * a page with no translation gets no hreflang.
 */
export function buildClusters(pages, { defaultLocale } = REGISTRY) {
	const groups = new Map();
	for (const page of pages) {
		if (page.locale.status !== "live" || page.noindex || !page.canonical)
			continue;
		if (urlPath(page.canonical) !== page.path) continue;
		const key = clusterKey(page.path, page.locale, defaultLocale);
		groups.set(key, [...(groups.get(key) ?? []), page]);
	}
	return [...groups.values()].filter((g) => g.length > 1);
}

/** The hreflang entries a cluster's members all carry, x-default included. */
export function clusterLinks(cluster, { defaultLocale } = REGISTRY) {
	const links = cluster.map((m) => ({ lang: m.htmlLang, url: m.canonical }));
	const english = cluster.find((m) => m.locale.code === defaultLocale);
	if (english) links.push({ lang: "x-default", url: english.canonical });
	return links;
}

const escape = (s) => s.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

/**
 * Writes the hreflang links and og:locale:alternate into every clustered
 * page under `dir`. Returns path → links for the sitemap.
 */
export async function injectAlternates(dir, registry = REGISTRY) {
	const pages = await readPages(dir, registry);
	const byPath = new Map();
	for (const cluster of buildClusters(pages, registry)) {
		const links = clusterLinks(cluster, registry);
		for (const page of cluster) {
			byPath.set(page.path, links);
			const tags = [
				...links.map(
					(l) =>
						`<link rel="alternate" hreflang="${escape(l.lang)}" href="${escape(l.url)}">`,
				),
				...cluster
					.filter((m) => m !== page)
					.map(
						(m) =>
							`<meta property="og:locale:alternate" content="${escape(m.locale.og)}">`,
					),
			].join("");
			const at = page.html.indexOf("</head>");
			if (at < 0) throw new Error(`${page.file}: no </head>`);
			await writeFile(
				path.join(dir, page.file),
				page.html.slice(0, at) + tags + page.html.slice(at),
			);
		}
	}
	return byPath;
}

/**
 * The integration that runs injectAlternates, and a `serialize` for
 * @astrojs/sitemap that adds the same links as xhtml:link. List the
 * integration before sitemap(): Astro runs build:done hooks in order.
 */
export function i18nAlternates() {
	let byPath = new Map();
	return {
		integration: {
			name: "bchworks:i18n-alternates",
			hooks: {
				"astro:build:done": async ({ dir, logger }) => {
					byPath = await injectAlternates(fileURLToPath(dir));
					logger.info(`hreflang written to ${byPath.size} pages`);
				},
			},
		},
		serialize: (item) => {
			const links = byPath.get(urlPath(item.url));
			return links ? { ...item, links } : item;
		},
	};
}

// Locale-aware internal links (PAN-381). Pure functions over a route set, so
// `pnpm test` covers them; src/i18n/links-integration.mjs applies them to every
// <a href> in dist once the build knows which pages exist in which locale.
//
// A "route" is a served path with no locale prefix, no trailing slash and no
// .html: "/", "/about", "/blog/foo". A route set maps each locale code to the
// routes built for it.
import { DEFAULT_LOCALE, LOCALES } from "./locales.ts";

const CODES = new Set(LOCALES.map((l) => l.code));

/** The served path for `route` in `locale`: English unprefixed, others under /<code>. */
export const localePath = (route, locale) => {
	if (locale === DEFAULT_LOCALE) return route;
	return route === "/" ? `/${locale}` : `/${locale}${route}`;
};

/**
 * Split a served path into its locale and route. "/es/about" → es + "/about";
 * "/about" → en + "/about". Trailing slashes and .html are dropped.
 */
export const splitLocale = (pathname) => {
	let p = pathname.replace(/(\/index)?\.html$/, "").replace(/\/+$/, "");
	if (!p.startsWith("/")) p = `/${p}`;
	const seg = p.split("/")[1];
	if (seg && seg !== DEFAULT_LOCALE && CODES.has(seg)) {
		return { locale: seg, route: p.slice(seg.length + 1) || "/" };
	}
	return { locale: DEFAULT_LOCALE, route: p || "/" };
};

/** The route set for a list of built HTML files, relative to the out dir. */
export const routesFromFiles = (files) => {
	const routes = new Map(LOCALES.map((l) => [l.code, new Set()]));
	for (const file of files) {
		if (!file.endsWith(".html")) continue;
		const { locale, route } = splitLocale(`/${file}`);
		routes.get(locale).add(route);
	}
	return routes;
};

const has = (routes, locale, route) => routes.get(locale)?.has(route) ?? false;

// "/about?x=1#y" → ["/about", "?x=1#y"]
const splitSuffix = (href) => {
	const i = href.search(/[?#]/);
	return i === -1 ? [href, ""] : [href.slice(0, i), href.slice(i)];
};

/**
 * The href a page in `locale` should use for internal link `href`: the
 * `locale` counterpart when that page exists, else the English page. An href
 * that names no built page (an asset, a feed, an external URL) comes back
 * unchanged.
 */
export const localizeHref = (href, locale, routes) => {
	if (!href.startsWith("/") || href.startsWith("//")) return href;
	const [path, suffix] = splitSuffix(href);
	const { route } = splitLocale(path);
	if (has(routes, locale, route)) return localePath(route, locale) + suffix;
	if (has(routes, DEFAULT_LOCALE, route)) return route + suffix;
	return href;
};

/**
 * The switcher's link to `target` from the page at `route`: its counterpart,
 * else `target`'s home, else null (the locale has no pages at all).
 */
export const switchHref = (route, target, routes) => {
	if (has(routes, target, route)) return localePath(route, target);
	if (has(routes, target, "/")) return localePath("/", target);
	return null;
};

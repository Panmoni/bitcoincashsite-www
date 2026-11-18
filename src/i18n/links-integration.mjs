// Rewrites every internal <a href> in dist so links keep the reader's locale
// (PAN-381). It runs after the build because only then is it known which
// pages exist in which locale: a Spanish page links to /es/x when /es/x was
// built, else to the English /x. It covers layouts, components and content
// alike, set:html strings included.
//
// Switcher links (<a data-locale-switch="<code>">) go to the current page's
// counterpart in that locale, else to its home.
//
// The build fails if a page in a live locale still links to a draft locale.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
	localizeHref,
	routesFromFiles,
	splitLocale,
	switchHref,
} from "./links.mjs";
import { DEFAULT_LOCALE, draftLocaleCodes } from "./locales.ts";

// An <a> tag, or a whole <script>/<style> block, which is left as is: the
// CSP pins inline scripts and styles by hash, so changing one breaks it.
const A_TAG = /<(script|style)\b[\s\S]*?<\/\1>|<a\b[^>]*>/g;
const HREF = /(\shref=")([^"]*)(")/;
const SWITCH = /\sdata-locale-switch="([^"]*)"/;

const htmlFiles = (dir, base = dir) =>
	fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		const full = path.join(dir, e.name);
		if (e.isDirectory()) return htmlFiles(full, base);
		return e.name.endsWith(".html") ? [path.relative(base, full)] : [];
	});

/**
 * Rewrite one page's HTML. Returns the new HTML and any links from a live
 * page to a draft locale.
 */
export const rewritePage = (
	html,
	file,
	routes,
	drafts = draftLocaleCodes(),
) => {
	const { locale, route } = splitLocale(`/${file}`);
	const live = !drafts.includes(locale);
	const leaks = [];
	const out = html.replace(A_TAG, (tag, block) => {
		if (block) return tag;
		const href = tag.match(HREF);
		if (!href) return tag;
		const target = tag.match(SWITCH)?.[1];
		let next;
		if (target) {
			next = switchHref(route, target, routes);
			if (next === null) {
				throw new Error(
					`${file}: switcher links to "${target}", which has no pages`,
				);
			}
		} else {
			next = localizeHref(href[2], locale, routes);
		}
		if (live && next.startsWith("/")) {
			const to = splitLocale(next.split(/[?#]/)[0]).locale;
			if (to !== DEFAULT_LOCALE && drafts.includes(to)) leaks.push(next);
		}
		return next === href[2] ? tag : tag.replace(HREF, `$1${next}$3`);
	});
	return { html: out, leaks };
};

export default function localizeLinks() {
	return {
		name: "bchworks:localize-links",
		hooks: {
			"astro:build:done": ({ dir, logger }) => {
				const outDir = fileURLToPath(dir);
				const files = htmlFiles(outDir);
				const routes = routesFromFiles(files);
				const leaks = [];
				let changed = 0;
				for (const file of files) {
					const full = path.join(outDir, file);
					const html = fs.readFileSync(full, "utf8");
					const res = rewritePage(html, file, routes);
					for (const href of res.leaks) leaks.push(`${file} → ${href}`);
					if (res.html !== html) {
						fs.writeFileSync(full, res.html);
						changed++;
					}
				}
				if (leaks.length) {
					throw new Error(
						`Live pages link to a draft locale:\n  ${leaks.join("\n  ")}`,
					);
				}
				logger.info(`localized links in ${changed} of ${files.length} pages`);
			},
		},
	};
}

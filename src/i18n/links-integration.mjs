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

// An <a> tag (a ">" inside a quoted attribute does not end it), or a whole
// <script>/<style> block, which is left as is: the
// CSP pins inline scripts and styles by hash, so changing one breaks it.
const A_TAG =
	/<(script|style)\b[\s\S]*?<\/\1>|<a\b(?:[^>"']|"[^"]*"|'[^']*')*>/g;
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
 * page to a draft locale, counting absolute links to `origin` (the site).
 */
export const rewritePage = (
	html,
	file,
	routes,
	drafts = draftLocaleCodes(),
	origin = "",
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
					`${file}: switcher links to "${target}", which has neither this page nor a home page`,
				);
			}
		} else {
			next = localizeHref(href[2], locale, routes);
		}
		const local =
			origin && next.startsWith(`${origin}/`)
				? next.slice(origin.length)
				: next;
		if (live && local.startsWith("/") && !local.startsWith("//")) {
			const to = splitLocale(local.split(/[?#]/)[0]).locale;
			if (to !== DEFAULT_LOCALE && drafts.includes(to)) leaks.push(next);
		}
		// A function replacement, so a "$" in the URL stays literal.
		return next === href[2]
			? tag
			: tag.replace(HREF, (_, a, _h, z) => a + next + z);
	});
	return { html: out, leaks };
};

export default function localizeLinks() {
	let origin = "";
	return {
		name: "bchworks:localize-links",
		hooks: {
			"astro:config:done": ({ config }) => {
				origin = config.site ? new URL(config.site).origin : "";
			},
			"astro:build:done": ({ dir, logger }) => {
				const outDir = fileURLToPath(dir);
				const files = htmlFiles(outDir);
				const routes = routesFromFiles(files);
				const leaks = [];
				const writes = [];
				// Check every page before writing any, so a failed build leaves
				// dist as Astro wrote it.
				for (const file of files) {
					const full = path.join(outDir, file);
					const html = fs.readFileSync(full, "utf8");
					const res = rewritePage(html, file, routes, undefined, origin);
					for (const href of res.leaks) leaks.push(`${file} → ${href}`);
					if (res.html !== html) writes.push([full, res.html]);
				}
				if (leaks.length) {
					throw new Error(
						`Live pages link to a draft locale:\n  ${leaks.join("\n  ")}`,
					);
				}
				for (const [full, html] of writes) fs.writeFileSync(full, html);
				logger.info(
					`localized links in ${writes.length} of ${files.length} pages`,
				);
			},
		},
	};
}

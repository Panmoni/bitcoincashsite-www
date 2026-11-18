// /<code>/rss.xml: one feed per live locale that has translated posts
// (PAN-380). English keeps /rss.xml. An item is a translation in
// src/content/post/<code>/ whose English original is published; it links to
// the post under /<code>/, which src/pages/[locale]/[...blog].astro builds
// (PAN-391).
import { getCollection } from "astro:content";
import { getAbsoluteLocaleUrl } from "astro:i18n";
import { getRssString } from "@astrojs/rss";
import type { APIRoute, GetStaticPaths } from "astro";
import {
	DEFAULT_LOCALE,
	LOCALES,
	type Locale,
	type LocaleCode,
} from "~/i18n/locales";
import { m, msg } from "~/i18n/messages";
import { fetchPosts } from "~/utils/blog";
import { APP_BLOG, METADATA, SITE } from "~/utils/config";
import { getPageEntry, type PageCopy } from "~/utils/pages";

const feedItems = async (code: string) => {
	const english = new Map((await fetchPosts()).map((p) => [p.id, p]));
	const translations = await getCollection(
		"postL10n",
		(e) => e.id.startsWith(`${code}/`) && !e.data.draft,
	);
	return translations
		.flatMap((t) => {
			const original = english.get(t.id.slice(code.length + 1));
			return original ? [{ t, original }] : [];
		})
		.sort(
			(a, b) =>
				b.original.publishDate.valueOf() - a.original.publishDate.valueOf(),
		)
		.map(({ t, original }) => ({
			// Puts the locale after SITE.base, not before it.
			link: getAbsoluteLocaleUrl(code, original.permalink),
			title: t.data.title,
			description: t.data.excerpt,
			pubDate: original.publishDate,
		}));
};

export const getStaticPaths = (async () => {
	if (!APP_BLOG.isEnabled) return [];
	// Widened: today no other locale is live, and TS would narrow this to never.
	const live = (LOCALES as readonly Locale[]).filter(
		(l) => l.status === "live" && l.code !== DEFAULT_LOCALE,
	);
	const paths = await Promise.all(
		live.map(async (l) => ({
			params: { locale: l.code },
			props: { ...l, items: await feedItems(l.code) },
		})),
	);
	return paths.filter((p) => p.props.items.length);
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	// The translated home page's description, else the English one.
	const home = (await getPageEntry("index", props.code as LocaleCode))?.data as
		| PageCopy
		| undefined;
	const rss = await getRssString({
		title: `${SITE.name} · ${m.nav_blog({}, msg(props.code))}`,
		description: home?.metadata.description || METADATA?.description || "",
		site: getAbsoluteLocaleUrl(props.code),
		items: props.items,
		customData: `<language>${props.bcp47}</language>`,
		trailingSlash: SITE.trailingSlash,
	});
	return new Response(rss, {
		headers: { "Content-Type": "application/xml" },
	});
};

// /<code>/rss.xml: one feed per live locale that has translated posts
// (PAN-380). English keeps /rss.xml. An item is a translation in
// src/content/post/<code>/ whose English original is published; it links to
// the post under /<code>/, and scripts/check-i18n-seo.mjs fails the build
// check if that page was not built.
import { getCollection } from "astro:content";
import { getRssString } from "@astrojs/rss";
import type { APIRoute, GetStaticPaths } from "astro";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "~/i18n/locales";
import { fetchPosts } from "~/utils/blog";
import { APP_BLOG, METADATA, SITE } from "~/utils/config";
import { getPermalink } from "~/utils/permalinks";

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
			link: `/${code}${getPermalink(original.permalink, "post")}`,
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
			props: { bcp47: l.bcp47, items: await feedItems(l.code) },
		})),
	);
	return paths.filter((p) => p.props.items.length);
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	const rss = await getRssString({
		title: `${SITE.name}’s Blog`,
		description: METADATA?.description || "",
		site: import.meta.env.SITE,
		items: props.items,
		customData: `<language>${props.bcp47}</language>`,
		trailingSlash: SITE.trailingSlash,
	});
	return new Response(rss, {
		headers: { "Content-Type": "application/xml" },
	});
};

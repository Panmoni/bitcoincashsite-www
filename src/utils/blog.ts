import type { CollectionEntry } from "astro:content";
import { getCollection, render } from "astro:content";
import type { PaginateFunction } from "astro";
import merge from "lodash.merge";
import { DEFAULT_LOCALE, LOCALES } from "~/i18n/locales";
import type { MetaData, Post } from "~/types";
import { APP_BLOG } from "~/utils/config";
import { getLocalizedEntry, getTranslationState } from "~/utils/l10n";
import {
	BLOG_BASE,
	CATEGORY_BASE,
	cleanSlug,
	POST_PERMALINK_PATTERN,
	TAG_BASE,
	trimSlash,
} from "./permalinks";

const generatePermalink = async ({
	id,
	slug,
	publishDate,
	category,
}: {
	id: string;
	slug: string;
	publishDate: Date;
	category: string | undefined;
}) => {
	const year = String(publishDate.getFullYear()).padStart(4, "0");
	const month = String(publishDate.getMonth() + 1).padStart(2, "0");
	const day = String(publishDate.getDate()).padStart(2, "0");
	const hour = String(publishDate.getHours()).padStart(2, "0");
	const minute = String(publishDate.getMinutes()).padStart(2, "0");
	const second = String(publishDate.getSeconds()).padStart(2, "0");

	const permalink = POST_PERMALINK_PATTERN.replace("%slug%", slug)
		.replace("%id%", id)
		.replace("%category%", category || "")
		.replace("%year%", year)
		.replace("%month%", month)
		.replace("%day%", day)
		.replace("%hour%", hour)
		.replace("%minute%", minute)
		.replace("%second%", second);

	return permalink
		.split("/")
		.map((el) => trimSlash(el))
		.filter((el) => !!el)
		.join("/");
};

const getNormalizedPost = async (
	post: CollectionEntry<"post">,
): Promise<Post> => {
	const { id, data } = post;
	const rawSlug = id;
	const { Content, remarkPluginFrontmatter } = await render(post);

	const {
		publishDate: rawPublishDate = new Date(),
		updateDate: rawUpdateDate,
		title,
		excerpt,
		image,
		tags: rawTags = [],
		category: rawCategory,
		author,
		draft = false,
		metadata = {},
	} = data;

	const slug = cleanSlug(rawSlug); // cleanSlug(rawSlug.split('/').pop());
	const publishDate = new Date(rawPublishDate);
	const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;
	const category = rawCategory ? cleanSlug(rawCategory) : undefined;
	const tags = rawTags.map((tag: string) => cleanSlug(tag));

	return {
		id: id,
		slug: slug,
		permalink: await generatePermalink({ id, slug, publishDate, category }),

		publishDate: publishDate,
		updateDate: updateDate,

		title: title,
		excerpt: excerpt,
		image: image,

		category: category,
		tags: tags,
		author: author,

		draft: draft,

		metadata,

		Content: Content,
		// or 'content' in case you consume from API

		readingTime: remarkPluginFrontmatter?.readingTime,
	};
};

const load = async function (): Promise<Array<Post>> {
	const posts = await getCollection("post");
	const normalizedPosts = posts.map(
		async (post) => await getNormalizedPost(post),
	);

	const results = (await Promise.all(normalizedPosts))
		.sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
		// Drafts show in `astro dev` for review and never in a build.
		.filter((post) => import.meta.env.DEV || !post.draft);

	return results;
};

let _posts: Array<Post>;

/** */
export const isBlogEnabled = APP_BLOG.isEnabled;
export const isBlogListRouteEnabled = APP_BLOG.list.isEnabled;
export const isBlogPostRouteEnabled = APP_BLOG.post.isEnabled;
export const isBlogCategoryRouteEnabled = APP_BLOG.category.isEnabled;
export const isBlogTagRouteEnabled = APP_BLOG.tag.isEnabled;

export const blogListRobots = APP_BLOG.list.robots;
export const blogPostRobots = APP_BLOG.post.robots;
export const blogCategoryRobots = APP_BLOG.category.robots;
export const blogTagRobots = APP_BLOG.tag.robots;

export const blogPostsPerPage = APP_BLOG?.postsPerPage;

/** */
export const fetchPosts = async (): Promise<Array<Post>> => {
	if (!_posts) {
		_posts = await load();
	}

	return _posts;
};

/** */
export const findPostsBySlugs = async (
	slugs: Array<string>,
): Promise<Array<Post>> => {
	if (!Array.isArray(slugs)) return [];

	const posts = await fetchPosts();

	return slugs.reduce(function (r: Array<Post>, slug: string) {
		posts.some(function (post: Post) {
			return slug === post.slug && r.push(post);
		});
		return r;
	}, []);
};

/** */
export const findPostsByIds = async (
	ids: Array<string>,
): Promise<Array<Post>> => {
	if (!Array.isArray(ids)) return [];

	const posts = await fetchPosts();

	return ids.reduce(function (r: Array<Post>, id: string) {
		posts.some(function (post: Post) {
			return id === post.id && r.push(post);
		});
		return r;
	}, []);
};

/** */
export const findLatestPosts = async ({
	count,
	category,
	tag,
	locale,
}: {
	count?: number;
	category?: string;
	tag?: string;
	/** Only posts translated into this locale, translated (PAN-383). */
	locale?: string;
} = {}): Promise<Array<Post>> => {
	const _count = count || 4;
	const posts = await fetchLocalizedPosts(locale);
	if (!posts) return [];

	const filtered = posts.filter((p) => {
		if (category && cleanSlug(category) !== p.category) return false;
		if (tag && !(p.tags || []).includes(cleanSlug(tag))) return false;
		return true;
	});

	return filtered.slice(0, _count);
};

/** */
export const getStaticPathsBlogList = async ({
	paginate,
}: {
	paginate: PaginateFunction;
}) => {
	if (!isBlogEnabled || !isBlogListRouteEnabled) return [];
	return paginate(await fetchPosts(), {
		params: { blog: BLOG_BASE || undefined },
		pageSize: blogPostsPerPage,
	});
};

/** */
export const getStaticPathsBlogPost = async () => {
	if (!isBlogEnabled || !isBlogPostRouteEnabled) return [];
	return (await fetchPosts()).flatMap((post) => ({
		params: {
			blog: post.permalink,
		},
		props: { post },
	}));
};

/**
 * The English post's metadata that is data, not words: robots and OG images.
 * Its title and description are English, so a translation never inherits
 * them.
 */
const inheritedMetadata = ({ metadata }: Post): MetaData => ({
	...(metadata?.robots ? { robots: metadata.robots } : {}),
	...(metadata?.openGraph?.images
		? { openGraph: { images: metadata.openGraph.images } }
		: {}),
});

/**
 * Translated posts under /<code>/ (PAN-391): one path per translation in
 * src/content/post/<code>/ of a published English post, at the English
 * permalink. The words come from the translation; dates, image, category,
 * tags and author are data and stay the English post's, as do its robots and
 * OG images (see inheritedMetadata). Any canonical is dropped so the page is
 * canonical to itself.
 */
export const getStaticPathsLocalizedBlogPost = async () => {
	if (!isBlogEnabled || !isBlogPostRouteEnabled) return [];
	const posts = await fetchPosts();
	const codes = LOCALES.map((l) => l.code).filter((c) => c !== DEFAULT_LOCALE);
	const paths = await Promise.all(
		codes.flatMap((locale) =>
			posts.map(async (post) => {
				const entry = await getLocalizedEntry("post", post.id, locale);
				if (!entry) return [];
				// getLocalizedEntry's union leaves data untyped; it is a post's.
				const data = entry.data as CollectionEntry<"post">["data"];
				// Same rule as English: drafts show in `astro dev` only.
				if (data.draft && !import.meta.env.DEV) return [];
				const { Content, remarkPluginFrontmatter } = await render(entry);
				const localized: Post = {
					...post,
					title: data.title,
					excerpt: data.excerpt,
					metadata: {
						...merge({}, inheritedMetadata(post), data.metadata),
						canonical: undefined,
					},
					Content,
					readingTime: remarkPluginFrontmatter?.readingTime,
				};
				return [
					{
						params: { locale, blog: post.permalink },
						props: {
							post: localized,
							translation: await getTranslationState("post", post.id, locale),
						},
					},
				];
			}),
		),
	);
	return paths.flat();
};

let _localized: Promise<Map<string, Array<Post>>> | undefined;

/**
 * The posts translated into `locale`, as the /<code>/ post routes build
 * them; English posts for the default locale. A post with no translation is
 * left out: it has no locale route (docs/i18n.md).
 */
export const fetchLocalizedPosts = async (
	locale: string | undefined,
): Promise<Array<Post>> => {
	if (!locale || locale === DEFAULT_LOCALE) return fetchPosts();
	_localized ??= getStaticPathsLocalizedBlogPost().then((paths) =>
		Map.groupBy(
			paths.map((p) => p.props.post),
			(_, i) => paths[i].params.locale,
		),
	);
	return (await _localized).get(locale) ?? [];
};

/** */
export const getStaticPathsBlogCategory = async ({
	paginate,
}: {
	paginate: PaginateFunction;
}) => {
	if (!isBlogEnabled || !isBlogCategoryRouteEnabled) return [];

	const posts = await fetchPosts();
	const categories = new Set<string>();
	posts.map((post) => {
		typeof post.category === "string" &&
			categories.add(post.category.toLowerCase());
	});

	return Array.from(categories).flatMap((category) =>
		paginate(
			posts.filter(
				(post) =>
					typeof post.category === "string" &&
					category === post.category.toLowerCase(),
			),
			{
				params: { category: category, blog: CATEGORY_BASE || undefined },
				pageSize: blogPostsPerPage,
				props: { category },
			},
		),
	);
};

/** */
export const getStaticPathsBlogTag = async ({
	paginate,
}: {
	paginate: PaginateFunction;
}) => {
	if (!isBlogEnabled || !isBlogTagRouteEnabled) return [];

	const posts = await fetchPosts();
	const tags = new Set<string>();
	posts.map((post) => {
		Array.isArray(post.tags) &&
			post.tags.map((tag) => tags.add(tag.toLowerCase()));
	});

	return Array.from(tags).flatMap((tag) =>
		paginate(
			posts.filter(
				(post) =>
					Array.isArray(post.tags) &&
					post.tags.find((elem) => elem.toLowerCase() === tag),
			),
			{
				params: { tag: tag, blog: TAG_BASE || undefined },
				pageSize: blogPostsPerPage,
				props: { tag },
			},
		),
	);
};

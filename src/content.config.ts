import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";
import type { ZodObject } from "astro/zod";
import { DEFAULT_LOCALE, LOCALES } from "./i18n/locales";

// Localized content (PAN-378, policy in docs/i18n.md). English sits at a
// collection's root; a translation sits at <collection>/<locale>/<slug>.md
// and loads into a parallel `<name>L10n` collection, id `<locale>/<slug>`.
// The English loaders skip the locale dirs, so English ids never change.
const LOCALE_DIRS: string[] = LOCALES.map((l) => l.code).filter(
	(c) => c !== DEFAULT_LOCALE,
);

const englishGlob = (base: string, pattern: string) =>
	glob({ base, pattern: [pattern, ...LOCALE_DIRS.map((c) => `!${c}/**`)] });

// No locale dirs yet means a pattern that matches nothing.
const localizedGlob = (base: string, pattern: string) =>
	glob({
		base,
		pattern: LOCALE_DIRS.length
			? LOCALE_DIRS.map((c) => `${c}/${pattern}`)
			: "!**",
	});

// Every translated entry says what it was translated from and who did it,
// under one `translation` key so it cannot clash with an entry's own fields
// (chips and upgrades have their own `status`). A translation never sets
// `lang`: its language is its locale dir.
const translationMeta = z
	.object({
		sourceHash: z.string().regex(/^[0-9a-f]{16}$/),
		status: z.enum(["machine", "reviewed"]),
		translator: z.string().min(1),
		reviewer: z.string().min(1).optional(),
	})
	.refine((t) => t.status !== "reviewed" || Boolean(t.reviewer), {
		message: "a reviewed translation names its reviewer",
		path: ["reviewer"],
	});

const localized = <T extends ZodObject>(schema: T) =>
	schema.extend({
		translation: translationMeta,
		lang: z
			.never({ error: "a translation's language is its locale dir" })
			.optional(),
	});

const metadataDefinition = () =>
	z
		.object({
			title: z.string().optional(),
			ignoreTitleTemplate: z.boolean().optional(),

			canonical: z.string().url().optional(),

			robots: z
				.object({
					index: z.boolean().optional(),
					follow: z.boolean().optional(),
				})
				.optional(),

			description: z.string().optional(),

			openGraph: z
				.object({
					url: z.string().optional(),
					siteName: z.string().optional(),
					images: z
						.array(
							z.object({
								url: z.string(),
								width: z.number().optional(),
								height: z.number().optional(),
							}),
						)
						.optional(),
					locale: z.string().optional(),
					type: z.string().optional(),
				})
				.optional(),

			twitter: z
				.object({
					handle: z.string().optional(),
					site: z.string().optional(),
					cardType: z.string().optional(),
				})
				.optional(),
		})
		.optional();

const postSchema = z.object({
	publishDate: z.date().optional(),
	updateDate: z.date().optional(),
	draft: z.boolean().optional(),

	title: z.string(),
	excerpt: z.string().optional(),
	image: z.string().optional(),

	category: z.string().optional(),
	tags: z.array(z.string()).optional(),
	author: z.string().optional(),

	metadata: metadataDefinition(),
});

const POST = "./src/content/post";
const postCollection = defineCollection({
	loader: englishGlob(POST, "**/*.{md,mdx}"),
	schema: postSchema,
});
const postL10n = defineCollection({
	loader: localizedGlob(POST, "**/*.{md,mdx}"),
	schema: localized(postSchema),
});

// Prose that used to sit in src/pages/*.astro. A page file reads its copy
// from here (src/utils/pages.ts), so it holds layout and components only.
// Copy is YAML (structured props) or Markdown (long prose like the legal
// pages). Fields are page-specific, so only `metadata` is checked.
const pageSchema = z
	.object({
		title: z.string().optional(),
		description: z.string().optional(),
		metadata: metadataDefinition(),
	})
	.catchall(z.any());

const PAGES = "./src/content/pages";
const pageCollection = defineCollection({
	loader: englishGlob(PAGES, "**/*.{yaml,md}"),
	schema: pageSchema,
});
const pageL10n = defineCollection({
	loader: localizedGlob(PAGES, "**/*.{yaml,md}"),
	schema: localized(pageSchema),
});

export const PROJECT_CATEGORIES = [
	"wallet",
	"wallet:hardware",
	"wallet:cashtokens",
	"buy",
	"buy:swap",
	"buy:atm",
	"spend",
	"earn:social",
	"earn:defi",
	"earn:gaming",
	"accept",
	"accept:gateway",
	"build:library",
	"build:docs",
	"build:community",
	"build:api",
	"build:contracts",
	"build:protocol",
	"build:explorer",
	"build:network",
	"build:utility",
	"build:fullnode",
	"build:dapp",
	"build:mentor",
	"cashtokens:devtool",
	"cashtokens:nft",
	"cashtokens:fungible",
	"cashtokens:faucet",
	"cashtokens:explorer",
	"cashtokens:bcmr",
	"cashtokens:reference",
	"cashtokens:wallet",
	"support:discussion",
	"support:media",
	"support:podcast",
	"support:general",
	"support:utility",
	"support:financial",
	"support:paper",
	"mining",
	"governance",
] as const;

const URL_OR_RELATIVE = /^(https?:\/\/|\/)/;
const HTTPS_URL = /^https?:\/\//;
const GITHUB_REPO = /^[\w.-]+\/[\w.-]+$/;

// Every reference entry carries `verified`: the date a person last checked it
// against its sources. The Freshness badge ages the entry from that date.
const sources = z
	.array(z.object({ title: z.string(), url: z.string().regex(HTTPS_URL) }))
	.default([]);

const projectCollection = defineCollection({
	loader: file("src/data/projects.json"),
	schema: z.object({
		title: z.string().min(1),
		description: z.string().optional(),
		icon: z.string().regex(HTTPS_URL).optional(),
		url: z.string().regex(URL_OR_RELATIVE).optional(),
		categories: z.array(z.enum(PROJECT_CATEGORIES)).min(1),
		tags: z.array(z.string()).optional(),
		status: z.enum(["active", "verify", "deprecated"]).default("active"),
		verified: z.coerce.date().optional(),
		// Where this entry sits in a category's list, whatever its health state.
		placement: z
			.partialRecord(z.enum(PROJECT_CATEGORIES), z.enum(["first", "last"]))
			.optional(),
		github: z.string().regex(GITHUB_REPO).optional(),
		// Wallet chooser matrix. Only on entries in a wallet category.
		wallet: z
			.object({
				platforms: z.array(
					z.enum(["ios", "android", "desktop", "web", "extension", "hardware"]),
				),
				custody: z.enum(["non-custodial", "custodial", "hybrid"]),
				cashtokens: z.enum(["full", "partial", "none"]),
				walletconnect: z.boolean(),
				openSource: z.boolean(),
				notes: z.string().optional(),
			})
			.optional(),
	}),
});

// Machine-written by scripts/health-check.mjs. Never edit by hand.
const healthCollection = defineCollection({
	loader: file("src/data/health.json"),
	schema: z.object({
		checkedAt: z.coerce.date(),
		httpStatus: z.number().nullable(),
		error: z.string().nullable(),
		failures: z.number().int().default(0),
		lastCommit: z.coerce.date().nullable(),
		lastRelease: z.coerce.date().nullable().default(null),
		archived: z.boolean().default(false),
		state: z.enum(["alive", "stale", "dead", "unknown"]),
	}),
});

const upgradeSchema = z.object({
	title: z.string(),
	// Activation time (UTC). A future date renders the countdown.
	date: z.coerce.date(),
	status: z.enum(["activated", "locked-in", "proposed"]),
	height: z.number().optional(),
	summary: z.string(),
	keywords: z.array(z.string()).default([]),
	chips: z.array(z.string()).default([]),
	verified: z.coerce.date(),
	sources,
});

const upgradeCollection = defineCollection({
	loader: englishGlob("./src/content/upgrades", "**/*.md"),
	schema: upgradeSchema,
});
const upgradeL10n = defineCollection({
	loader: localizedGlob("./src/content/upgrades", "**/*.md"),
	schema: localized(upgradeSchema),
});

const chipSchema = z.object({
	title: z.string(),
	code: z.string(),
	owners: z.array(z.string()).default([]),
	status: z.enum([
		"draft",
		"proposed",
		"locked-in",
		"activated",
		"withdrawn",
		"superseded",
	]),
	upgrade: z.string().optional(),
	summary: z.string(),
	spec: z.string().regex(HTTPS_URL),
	discussion: z.string().regex(HTTPS_URL).optional(),
	stakeholders: z
		.array(
			z.object({
				name: z.string(),
				position: z.enum(["support", "neutral", "oppose", "unknown"]),
				source: z.string().regex(HTTPS_URL).optional(),
			}),
		)
		.default([]),
	verified: z.coerce.date(),
	sources,
});

const chipCollection = defineCollection({
	loader: englishGlob("./src/content/chips", "**/*.md"),
	schema: chipSchema,
});
const chipL10n = defineCollection({
	loader: localizedGlob("./src/content/chips", "**/*.md"),
	schema: localized(chipSchema),
});

const opcodeCollection = defineCollection({
	loader: file("src/data/opcodes.json"),
	schema: z.object({
		name: z.string(),
		code: z.number().int().min(0).max(255),
		codeEnd: z.number().int().min(0).max(255).optional(),
		aliases: z.array(z.string()).default([]),
		group: z.enum([
			"push",
			"control",
			"stack",
			"splice",
			"bitwise",
			"arithmetic",
			"crypto",
			"locktime",
			"introspection",
			"token",
			"function",
			"reserved",
		]),
		status: z.enum(["enabled", "disabled", "reserved", "nop"]),
		since: z.string().optional(),
		sinceNote: z.string().optional(),
		stackIn: z.string(),
		stackOut: z.string(),
		description: z.string(),
		cost: z.string().optional(),
		example: z.string().optional(),
		btc: z.enum([
			"same",
			"disabled-in-btc",
			"not-in-btc",
			"proposed-for-btc",
			"different",
		]),
		btcNote: z.string().optional(),
		verified: z.coerce.date(),
		sources,
	}),
});

const glossaryCollection = defineCollection({
	loader: file("src/data/glossary.json"),
	schema: z.object({
		term: z.string(),
		aka: z.array(z.string()).default([]),
		definition: z.string(),
		related: z.array(z.string()).default([]),
		link: z.string().regex(URL_OR_RELATIVE).optional(),
		verified: z.coerce.date(),
	}),
});

// Long-form reference pages: comparisons, country guides, risks, reports.
// `lang` on an entry at the collection root is the language it was written
// in, not a site locale: the Venezuela guide is written in Spanish and served
// at /guides/venezuela. It may name a language the registry lacks (pt).
const LANG_TAG = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
const articleSchema = z.object({
	title: z.string(),
	description: z.string(),
	lang: z.string().regex(LANG_TAG).default(DEFAULT_LOCALE),
	verified: z.coerce.date(),
	faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
	sources,
});

const compareSchema = articleSchema.extend({
	rival: z.string(),
	ticker: z.string(),
});
const compareCollection = defineCollection({
	loader: englishGlob("./src/content/compare", "**/*.md"),
	schema: compareSchema,
});
const compareL10n = defineCollection({
	loader: localizedGlob("./src/content/compare", "**/*.md"),
	schema: localized(compareSchema),
});

const guideSchema = articleSchema.extend({
	country: z.string(),
	flag: z.string(),
});
const guideCollection = defineCollection({
	loader: englishGlob("./src/content/guides", "**/*.md"),
	schema: guideSchema,
});
const guideL10n = defineCollection({
	loader: localizedGlob("./src/content/guides", "**/*.md"),
	schema: localized(guideSchema),
});

const referenceCollection = defineCollection({
	loader: englishGlob("./src/content/reference", "**/*.md"),
	schema: articleSchema,
});
const referenceL10n = defineCollection({
	loader: localizedGlob("./src/content/reference", "**/*.md"),
	schema: localized(articleSchema),
});

const reportSchema = articleSchema.extend({
	month: z.string().regex(/^\d{4}-\d{2}$/),
});
const reportCollection = defineCollection({
	loader: englishGlob("./src/content/reports", "**/*.md"),
	schema: reportSchema,
});
const reportL10n = defineCollection({
	loader: localizedGlob("./src/content/reports", "**/*.md"),
	schema: localized(reportSchema),
});

export const collections = {
	post: postCollection,
	postL10n,
	pages: pageCollection,
	pagesL10n: pageL10n,
	projects: projectCollection,
	health: healthCollection,
	upgrades: upgradeCollection,
	upgradesL10n: upgradeL10n,
	chips: chipCollection,
	chipsL10n: chipL10n,
	opcodes: opcodeCollection,
	glossary: glossaryCollection,
	compare: compareCollection,
	compareL10n,
	guides: guideCollection,
	guidesL10n: guideL10n,
	reference: referenceCollection,
	referenceL10n,
	reports: reportCollection,
	reportsL10n: reportL10n,
};

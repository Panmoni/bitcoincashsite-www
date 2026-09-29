import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

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

const postCollection = defineCollection({
	loader: glob({ base: "./src/content/post", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
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
	}),
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

const upgradeCollection = defineCollection({
	loader: glob({ base: "./src/content/upgrades", pattern: "**/*.md" }),
	schema: z.object({
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
	}),
});

const chipCollection = defineCollection({
	loader: glob({ base: "./src/content/chips", pattern: "**/*.md" }),
	schema: z.object({
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
	}),
});

const opcodeCollection = defineCollection({
	loader: file("src/data/opcodes.json"),
	schema: z.object({
		name: z.string(),
		code: z.number().int().min(0).max(255),
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
const articleSchema = z.object({
	title: z.string(),
	description: z.string(),
	lang: z.enum(["en", "es", "pt"]).default("en"),
	verified: z.coerce.date(),
	faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
	sources,
});

const compareCollection = defineCollection({
	loader: glob({ base: "./src/content/compare", pattern: "**/*.md" }),
	schema: articleSchema.extend({ rival: z.string(), ticker: z.string() }),
});

const guideCollection = defineCollection({
	loader: glob({ base: "./src/content/guides", pattern: "**/*.md" }),
	schema: articleSchema.extend({ country: z.string(), flag: z.string() }),
});

const referenceCollection = defineCollection({
	loader: glob({ base: "./src/content/reference", pattern: "**/*.md" }),
	schema: articleSchema,
});

const reportCollection = defineCollection({
	loader: glob({ base: "./src/content/reports", pattern: "**/*.md" }),
	schema: articleSchema.extend({ month: z.string().regex(/^\d{4}-\d{2}$/) }),
});

export const collections = {
	post: postCollection,
	projects: projectCollection,
	health: healthCollection,
	upgrades: upgradeCollection,
	chips: chipCollection,
	opcodes: opcodeCollection,
	glossary: glossaryCollection,
	compare: compareCollection,
	guides: guideCollection,
	reference: referenceCollection,
	reports: reportCollection,
};

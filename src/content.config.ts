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
	}),
});

export const collections = {
	post: postCollection,
	projects: projectCollection,
};

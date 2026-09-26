import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import compress from "astro-compress";
import icon from "astro-icon";
import path from "path";
import { fileURLToPath } from "url";
import { ANALYTICS, SITE } from "./src/utils/config.ts";

import {
	lazyImagesRehypePlugin,
	readingTimeRemarkPlugin,
	responsiveTablesRehypePlugin,
} from "./src/utils/frontmatter.mjs";
import tasks from "./src/utils/tasks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const whenExternalScripts = (items = []) =>
	ANALYTICS.vendors.googleAnalytics.id &&
	ANALYTICS.vendors.googleAnalytics.partytown
		? Array.isArray(items)
			? items.map((item) => item())
			: [items()]
		: [];

export default defineConfig({
	site: SITE.site || "https://bchworks.com",
	base: SITE.base,
	trailingSlash: SITE.trailingSlash ? "always" : "never",

	output: "static",
	// Emit /page.html, not /page/index.html: the host then serves /page with no
	// redirect to /page/, so canonicals and sitemap URLs resolve directly.
	build: { format: "file" },
	// Astro 7 defaults to "jsx", which strips spaces between inline elements.
	compressHTML: true,

	integrations: [
		...(SITE.site
			? [
					sitemap({
						// Tag, category and paged blog archives are noindex; keep them out.
						filter: (page) => !/\/(tag|category)\/|\/blog\/\d+$/.test(page),
					}),
				]
			: []),
		mdx(),
		icon({
			include: {
				tabler: ["*"],
				"flat-color-icons": [
					"template",
					"gallery",
					"approval",
					"document",
					"advertising",
					"currency-exchange",
					"voice-presentation",
					"business-contact",
					"database",
				],
			},
		}),

		...whenExternalScripts(() =>
			partytown({
				config: { forward: ["dataLayer.push"] },
			}),
		),

		compress({
			CSS: true,
			HTML: {
				"html-minifier-terser": {
					removeAttributeQuotes: false,
				},
			},
			Image: false,
			JavaScript: true,
			SVG: false,
			Logger: 1,
		}),

		tasks(),
	],

	image: {
		domains: ["cdn.pixabay.com"],
	},

	markdown: {
		processor: unified({
			remarkPlugins: [readingTimeRemarkPlugin],
			rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
		}),
	},

	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"~": path.resolve(__dirname, "./src"),
			},
		},
	},
});

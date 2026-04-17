import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
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

	integrations: [
		tailwind({
			applyBaseStyles: false,
		}),
		...(SITE.site ? [sitemap()] : []),
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
		remarkPlugins: [readingTimeRemarkPlugin],
		rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
	},

	vite: {
		resolve: {
			alias: {
				"~": path.resolve(__dirname, "./src"),
			},
		},
	},
});

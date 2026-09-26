import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
import path from "path";
import { fileURLToPath } from "url";
import { SITE } from "./src/utils/config.ts";

import {
	lazyImagesPlugin,
	readingTimePlugin,
	responsiveTablesPlugin,
} from "./src/utils/frontmatter.mjs";
import tasks from "./src/utils/tasks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

	// Static output: Astro writes this as a <meta> CSP with hashes for every
	// script it renders. Inline scripts go through common/InlineScript.astro.
	security: {
		csp: {
			directives: [
				"default-src 'self'",
				"img-src 'self' data: https://static.panmoni.com https://img.youtube.com https://*.google-analytics.com https://*.googletagmanager.com",
				"connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
				"frame-src https://www.youtube.com https://www.youtube-nocookie.com",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			],
			scriptDirective: {
				resources: ["'self'", "https://www.googletagmanager.com"],
			},
			styleDirective: {
				// Shiki code blocks and a few components set style="" attributes.
				resources: [
					"'self'",
					{ resource: "'unsafe-inline'", kind: "attribute" },
				],
			},
		},
	},

	prefetch: {
		prefetchAll: true,
		defaultStrategy: "hover",
	},

	fonts: [
		{
			provider: fontProviders.google(),
			name: "Bricolage Grotesque",
			cssVariable: "--aw-font-sans",
			weights: ["200 800"],
			styles: ["normal"],
			subsets: ["latin", "latin-ext", "vietnamese"],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--aw-font-mono",
			weights: ["100 800"],
			styles: ["normal"],
			subsets: [
				"latin",
				"latin-ext",
				"cyrillic",
				"cyrillic-ext",
				"greek",
				"vietnamese",
			],
			fallbacks: ["monospace"],
		},
	],

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

		tasks(),
	],

	image: {
		layout: "constrained",
		responsiveStyles: true,
	},

	markdown: {
		processor: satteri({
			mdastPlugins: [readingTimePlugin],
			hastPlugins: [responsiveTablesPlugin, lazyImagesPlugin],
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

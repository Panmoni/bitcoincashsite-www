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
				// Any HTTPS image: the directory hotlinks project logos from its daily data.
				"img-src 'self' data: https:",
				// The wss:// hosts are the UTXO Machine's Fulcrum servers; keep them in
				// step with SERVERS in src/components/utxo/electrum.ts.
				"connect-src 'self' wss://bch.imaginary.cash:50004 wss://electrum.imaginary.cash:50004 wss://bch.loping.net:50004 wss://fulcrum.jettscythe.xyz:50004 wss://blackie.c3-soft.com:50004",
				"frame-src https://www.youtube.com https://www.youtube-nocookie.com",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			],
			// Google Analytics runs through Cloudflare Zaraz, which adds its own
			// nonce to script-src at the edge. 'inline-speculation-rules' lets the
			// client prerender below add its <script type="speculationrules">.
			scriptDirective: {
				resources: ["'self'", "'inline-speculation-rules'"],
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
	// Chromium prerenders a hovered link in full; other browsers keep the prefetch.
	experimental: { clientPrerender: true },

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
		// Directory logos: fetched and resized at build. Other hosts pass through.
		remotePatterns: [
			{
				protocol: "https",
				hostname: "static.panmoni.com",
				pathname: "/bitcoincashsite/**",
			},
		],
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

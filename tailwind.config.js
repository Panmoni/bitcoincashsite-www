import typographyPlugin from "@tailwindcss/typography";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

export default {
	content: ["./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			colors: {
				bchgreen: "#0ac18e",
				primary: "var(--aw-color-primary)",
				secondary: "var(--aw-color-secondary)",
				accent: "var(--aw-color-accent)",
				default: "var(--aw-color-text-default)",
				muted: "var(--aw-color-text-muted)",
				page: "rgb(var(--wb-bg) / <alpha-value>)",
				surface: "rgb(var(--wb-surface) / <alpha-value>)",
				ink: "rgb(var(--wb-ink) / <alpha-value>)",
				line: "rgb(var(--wb-line) / <alpha-value>)",
				soft: "rgb(var(--wb-soft) / <alpha-value>)",
				"on-accent": "rgb(var(--wb-on-accent) / <alpha-value>)",
				wb: {
					green: "rgb(var(--wb-green) / <alpha-value>)",
					blue: "rgb(var(--wb-blue) / <alpha-value>)",
					pink: "rgb(var(--wb-pink) / <alpha-value>)",
					yellow: "rgb(var(--wb-yellow) / <alpha-value>)",
				},
			},
			boxShadow: {
				hard: "4px 4px 0 rgb(var(--wb-line))",
				"hard-sm": "2px 2px 0 rgb(var(--wb-line))",
				"hard-lg": "8px 8px 0 rgb(var(--wb-line))",
			},
			borderRadius: {
				wb: "14px",
			},
			fontFamily: {
				sans: [
					"var(--aw-font-sans, ui-sans-serif)",
					...defaultTheme.fontFamily.sans,
				],
				serif: [
					"var(--aw-font-serif, ui-serif)",
					...defaultTheme.fontFamily.serif,
				],
				mono: [
					"var(--aw-font-mono, ui-monospace)",
					...defaultTheme.fontFamily.mono,
				],
				heading: [
					"var(--aw-font-heading, ui-sans-serif)",
					...defaultTheme.fontFamily.sans,
				],
			},

			animation: {
				fade: "fadeInUp 1s both",
			},

			keyframes: {
				fadeInUp: {
					"0%": { opacity: 0, transform: "translateY(2rem)" },
					"100%": { opacity: 1, transform: "translateY(0)" },
				},
			},
		},
	},
	plugins: [
		typographyPlugin,
		plugin(({ addVariant }) => {
			addVariant("intersect", "&:not([no-intersect])");
		}),
	],
	darkMode: "class",
};

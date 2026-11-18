#!/usr/bin/env node
// Writes project.inlang/settings.json from src/i18n/locales.ts, then compiles
// messages/*.json into src/paraglide/. Runs before dev, build and check, so the
// inlang locale list can never drift from the site's.
import { writeFile } from "node:fs/promises";
import { compile } from "@inlang/paraglide-js";
import { DEFAULT_LOCALE, LOCALES } from "../src/i18n/locales.ts";
import { paraglideOptions } from "../src/i18n/paraglide.mjs";

const settings = {
	$schema: "https://inlang.com/schema/project-settings",
	baseLocale: DEFAULT_LOCALE,
	locales: LOCALES.map((l) => l.code),
	// Same plugin versions as TokenStork. The inlang SDK fetches them from
	// jsdelivr on each fresh checkout, so a build needs network access.
	modules: [
		"https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@4.4.0/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@2.2.6/dist/index.js",
	],
	"plugin.inlang.messageFormat": {
		pathPattern: "./messages/{locale}.json",
	},
};

await writeFile(
	new URL("../project.inlang/settings.json", import.meta.url),
	`${JSON.stringify(settings, null, "\t")}\n`,
);
await compile(paraglideOptions);

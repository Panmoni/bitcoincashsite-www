#!/usr/bin/env node
// pnpm i18n:review <locale> <path> --reviewer "<name>" [--rechecked]
//
// Marks a translation reviewed and credits the reviewer. Refuses when the
// English changed since the draft; --rechecked says you compared it with
// the current English. Workflow: docs/i18n.md.
import { parseArgs } from "node:util";
import { DEFAULT_LOCALE, LOCALES } from "../../src/i18n/locales.ts";
import { RefusedError, review } from "./pipeline.mjs";

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		reviewer: { type: "string" },
		rechecked: { type: "boolean", default: false },
	},
});

const others = LOCALES.map((l) => l.code).filter((c) => c !== DEFAULT_LOCALE);
const [locale, path] = positionals;
if (!others.includes(locale) || !path || !values.reviewer) {
	console.error(
		`usage: pnpm i18n:review <${others.join("|")}> <path> --reviewer "<name>" [--rechecked]`,
	);
	process.exit(2);
}

try {
	const n = review({
		root: new URL("../..", import.meta.url).pathname,
		locale,
		path,
		reviewer: values.reviewer,
		rechecked: values.rechecked,
	});
	console.log(`reviewed ${n} in ${path}, credited to ${values.reviewer}`);
} catch (e) {
	if (!(e instanceof RefusedError)) throw e;
	console.error(`refused: ${e.message}`);
	process.exit(1);
}

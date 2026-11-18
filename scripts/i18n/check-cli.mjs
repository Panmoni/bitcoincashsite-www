#!/usr/bin/env node
// pnpm i18n:check: the source-side i18n check (scripts/i18n/check.mjs).
// Prints a per-locale summary, the warnings, then the errors. Exits 1 only on
// an error. --quiet prints the summary and errors without the warnings.
import { DEFAULT_LOCALE, LOCALES } from "../../src/i18n/locales.ts";
import { runCheck } from "./check.mjs";

const quiet = process.argv.includes("--quiet");
const { errors, warnings, summary } = runCheck({
	root: process.cwd(),
	locales: LOCALES,
	defaultLocale: DEFAULT_LOCALE,
});

if (!quiet) for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`FAIL  ${e}`);
for (const s of summary) console.log(s);
console.log(
	errors.length
		? `i18n:check: ${errors.length} error(s), ${warnings.length} warning(s)`
		: `i18n:check: ok, ${warnings.length} warning(s)`,
);
process.exit(errors.length ? 1 : 0);

#!/usr/bin/env node
// pnpm i18n:pseudo [--clean]
//
// Writes the pseudo-locales en-XA and ar-XB from English
// (scripts/i18n/pseudo.mjs) into the same places a real translation lives.
// --clean removes them. Build with I18N_PSEUDO=1 so the registry includes
// them. CI does both; nothing it writes is committed (.gitignore).
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
	DEFAULT_LOCALE,
	LOCALES,
	PSEUDO_CODES,
} from "../../src/i18n/locales.ts";
import { draft, PATHS, scan } from "./pipeline.mjs";
import { pseudoTranslator } from "./pseudo.mjs";

const root = new URL("../..", import.meta.url).pathname;

/** Every path the generator writes for `code`. */
const outputs = (code) => [
	`${PATHS.messages}/${code}.json`,
	`${PATHS.messages}/meta/${code}.json`,
	`${PATHS.overlays}/${code}`,
	...readdirSync(join(root, PATHS.content)).map(
		(c) => `${PATHS.content}/${c}/${code}`,
	),
];

for (const code of PSEUDO_CODES)
	for (const p of outputs(code))
		if (existsSync(join(root, p))) rmSync(join(root, p), { recursive: true });
if (process.argv.includes("--clean")) {
	console.log(`i18n:pseudo: removed ${PSEUDO_CODES.join(", ")}`);
	process.exit(0);
}

const locales = [
	...new Set([
		...LOCALES.map((l) => l.code).filter((c) => c !== DEFAULT_LOCALE),
		...PSEUDO_CODES,
	]),
];
let failures = 0;
for (const locale of PSEUDO_CODES) {
	const { todo } = scan({ root, locale, locales });
	const { written, failed } = await draft({
		root,
		locale,
		todo,
		translator: pseudoTranslator,
	});
	for (const f of failed) console.error(`FAILED  ${f}`);
	failures += failed.length;
	console.log(
		`i18n:pseudo: ${locale} ${written.length} written, ${failed.length} failed`,
	);
}
process.exit(failures ? 1 : 0);

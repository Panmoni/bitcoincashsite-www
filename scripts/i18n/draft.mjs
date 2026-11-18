#!/usr/bin/env node
// pnpm i18n:draft <locale> [--only <path-glob>] [--restale] [--dry-run]
//
// Machine-drafts what <locale> is missing or has stale. Never touches a
// reviewed translation unless --restale, and then only a stale one.
// Workflow: docs/i18n.md.
import { parseArgs } from "node:util";
import {
	DEFAULT_LOCALE,
	LOCALES,
	PSEUDO_CODES,
} from "../../src/i18n/locales.ts";
import { claudeTranslator } from "./claude.mjs";
import { draft, scan } from "./pipeline.mjs";

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		only: { type: "string" },
		restale: { type: "boolean", default: false },
		"dry-run": { type: "boolean", default: false },
	},
});

const others = LOCALES.map((l) => l.code).filter((c) => c !== DEFAULT_LOCALE);
const [locale] = positionals;
if (!others.includes(locale)) {
	console.error(
		`usage: pnpm i18n:draft <${others.join("|")}> [--only <glob>] [--restale] [--dry-run]`,
	);
	process.exit(2);
}

const root = new URL("../..", import.meta.url).pathname;
const { todo, held } = scan({
	root,
	locale,
	// Generated pseudo-locale dirs are never English sources.
	locales: [...new Set([...others, ...PSEUDO_CODES])],
	only: values.only,
	restale: values.restale,
});

const label = (u) =>
	`${u.state.padEnd(7)} ${u.target}${u.key ? ` ${u.key}` : ""}`;
for (const u of held)
	console.log(
		`held    ${u.target}${u.key ? ` ${u.key}` : ""} (${u.state}; a person's work, use --restale to redraft)`,
	);
console.log(`${todo.length} to draft, ${held.length} held`);
if (values["dry-run"]) {
	for (const u of todo) console.log(label(u));
	process.exit(0);
}
if (!todo.length) process.exit(0);

try {
	const { written, failed } = await draft({
		root,
		locale,
		todo,
		translator: claudeTranslator(),
	});
	for (const w of written) console.log(`drafted ${w}`);
	for (const f of failed) console.error(`FAILED  ${f}`);
	console.log(`${written.length} drafted, ${failed.length} failed`);
	process.exit(failed.length ? 1 : 0);
} catch (e) {
	console.error(e.message);
	process.exit(1);
}

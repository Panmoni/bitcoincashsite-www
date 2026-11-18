// The translation loop (PAN-382, workflow in docs/i18n.md): find what a
// locale is missing or has stale, machine-draft it, let a person review it.
// Three kinds of source, one rule set:
//
//   catalog  messages/en.json             → messages/<locale>.json, with
//            provenance in messages/meta/<locale>.json (the inlang format has
//            no room for it)
//   content  src/content/<c>/<slug>.<ext> → src/content/<c>/<locale>/<slug>.<ext>,
//            provenance in its `translation` block
//   overlay  src/data/<file>.json         → src/data/i18n/<locale>/<file>.json,
//            provenance on each field
//
// Every translated unit carries the sourceHash of the English it came from.
// A unit is missing, stale (hash differs) or fresh. A `reviewed` unit, or one
// with no provenance at all, is a person's work: a draft never overwrites it
// unless `restale` is set, and then only when it is stale.
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, extname, join, matchesGlob, relative } from "node:path";
import { dump, load } from "js-yaml";
import { hashSource, IDENTIFIER_KEYS } from "../../src/utils/localize.mjs";
import {
	dntPattern,
	mask,
	nothingToTranslate,
	outline,
	unmask,
} from "./protect.mjs";

/** Translatable fields of each JSON data file that has overlays. */
export const OVERLAY_FIELDS = {
	glossary: ["term", "definition"],
	opcodes: ["description"],
	projects: ["description"],
};

// Collection frontmatter mixes words with data (dates, statuses, codes), so
// only these keys are translated. Page copy (`pages`) is all words except
// the identifier keys the page code reads.
const FRONTMATTER_KEYS = new Set([
	"title",
	"description",
	"summary",
	"excerpt",
	"notes",
	"position",
	"question",
	"answer",
	"sinceNote",
	"btcNote",
	"heading",
	"text",
	"label",
]);
const NEVER_KEYS = new Set(["translation", "lang", "slug", "canonical"]);

export const PATHS = {
	messages: "messages",
	content: "src/content",
	data: "src/data",
	overlays: "src/data/i18n",
	glossary: "src/i18n/glossary",
};

const read = (root, p) => readFileSync(join(root, p), "utf8");
const readJson = (root, p, fallback) =>
	existsSync(join(root, p)) ? JSON.parse(read(root, p)) : fallback;
const write = (root, p, text) => {
	mkdirSync(dirname(join(root, p)), { recursive: true });
	writeFileSync(join(root, p), text);
};
const writeJson = (root, p, data) =>
	write(root, p, `${JSON.stringify(data, null, "\t")}\n`);
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const filesUnder = (dir) =>
	readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		return isDir(p) ? filesUnder(p) : [p];
	});

// ---------------------------------------------------------------- documents

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** `{ data, body, yamlFile }` of a content file (.md, .mdx or .yaml). */
export const parseDoc = (text, path) => {
	if (extname(path) === ".yaml")
		return { data: load(text) ?? {}, body: null, yamlFile: true };
	const m = text.match(FRONTMATTER);
	return {
		data: m ? (load(m[1]) ?? {}) : {},
		body: m ? text.slice(m[0].length) : text,
		yamlFile: false,
	};
};

const yaml = (data) => dump(data, { lineWidth: -1, noRefs: true });

const renderDoc = ({ data, body, yamlFile }) =>
	yamlFile ? yaml(data) : `---\n${yaml(data)}---\n${body}`;

/** Paths (key lists) of the string leaves a draft translates. */
const docLeaves = (data, collection) => {
	const out = [];
	const walk = (v, path, key) => {
		if (typeof v === "string") {
			const words =
				collection === "pages"
					? !IDENTIFIER_KEYS.has(key)
					: FRONTMATTER_KEYS.has(key);
			if (words) out.push(path);
		} else if (Array.isArray(v))
			v.forEach((x, i) => walk(x, [...path, i], key));
		else if (v && typeof v === "object" && !(v instanceof Date))
			for (const [k, x] of Object.entries(v))
				if (!NEVER_KEYS.has(k)) walk(x, [...path, k], k);
	};
	walk(data, [], "");
	return out;
};

const getAt = (obj, path) => path.reduce((o, k) => o[k], obj);
const setAt = (obj, path, value) => {
	getAt(obj, path.slice(0, -1))[path.at(-1)] = value;
};

// ------------------------------------------------------------------ catalog

/** The string leaves of one inlang message: a string, or variant matches. */
const messageLeaves = (value) =>
	typeof value === "string"
		? [[]]
		: value.flatMap((variant, i) =>
				Object.keys(variant.match ?? {}).map((k) => [i, "match", k]),
			);

const catalogPath = (locale) => `${PATHS.messages}/${locale}.json`;
const catalogMetaPath = (locale) => `${PATHS.messages}/meta/${locale}.json`;
const englishCatalog = (root) => {
	const { $schema: _, ...en } = readJson(root, catalogPath("en"), {});
	return en;
};

// ------------------------------------------------------------------- scan

const freshness = (meta, hash) => {
	if (!meta?.sourceHash || !meta?.status) return "unknown";
	return meta.sourceHash === hash ? "fresh" : "stale";
};

/**
 * Every unit `locale` lacks or has stale. Returns `{ todo, held }`: `todo`
 * is what a draft will write; `held` is stale or unattributed work a person
 * owns, which only `restale` moves into `todo`.
 *
 * A unit: `{ kind, source, target, key?, state, hash }`, where `state` is
 * `missing`, `stale` or `unknown` and `hash` the English sourceHash now.
 */
export const scan = ({ root, locale, locales, only, restale = false }) => {
	const todo = [];
	const held = [];
	const wanted = (u) =>
		!only || matchesGlob(u.source, only) || matchesGlob(u.target, only);
	const sort = (u, meta) => {
		if (!wanted(u)) return;
		if (u.state === "missing") return todo.push(u);
		const owned = u.state === "unknown" || meta?.status === "reviewed";
		(owned && !(restale && u.state === "stale") ? held : todo).push(u);
	};

	// Catalog: one unit per message key.
	const en = englishCatalog(root);
	const tr = readJson(root, catalogPath(locale), {});
	const meta = readJson(root, catalogMetaPath(locale), {});
	for (const [key, value] of Object.entries(en)) {
		const hash = hashSource(JSON.stringify(value));
		const base = {
			kind: "catalog",
			source: catalogPath("en"),
			target: catalogPath(locale),
			key,
			hash,
		};
		if (!(key in tr)) sort({ ...base, state: "missing" });
		else {
			const state = freshness(meta[key], hash);
			if (state !== "fresh") sort({ ...base, state }, meta[key]);
		}
	}

	// Content: one unit per file.
	const contentRoot = join(root, PATHS.content);
	for (const collection of isDir(contentRoot) ? readdirSync(contentRoot) : []) {
		const base = join(contentRoot, collection);
		if (!isDir(base)) continue;
		for (const abs of filesUnder(base)) {
			const rel = relative(base, abs);
			if (locales.includes(rel.split("/")[0])) continue;
			if (!/\.(md|mdx|yaml)$/.test(rel)) continue;
			const source = relative(root, abs);
			const text = readFileSync(abs, "utf8");
			// An original written in this locale (a Spanish guide at the
			// English root) is its own translation.
			if (parseDoc(text, source).data.lang === locale) continue;
			const target = join(PATHS.content, collection, locale, rel);
			const unit = {
				kind: "content",
				collection,
				source,
				target,
				hash: hashSource(text),
			};
			if (!existsSync(join(root, target))) {
				sort({ ...unit, state: "missing" });
				continue;
			}
			const t = parseDoc(read(root, target), target).data.translation;
			const state = freshness(t, unit.hash);
			if (state !== "fresh") sort({ ...unit, state }, t);
		}
	}

	// Overlays: one unit per record field.
	for (const [file, fields] of Object.entries(OVERLAY_FIELDS)) {
		const source = `${PATHS.data}/${file}.json`;
		if (!existsSync(join(root, source))) continue;
		const target = `${PATHS.overlays}/${locale}/${file}.json`;
		const overlay = readJson(root, target, {});
		for (const record of readJson(root, source, []))
			for (const field of fields) {
				const value = record[field];
				if (typeof value !== "string" || !value.trim()) continue;
				const hash = hashSource(value);
				const t = overlay[record.id]?.[field];
				const unit = {
					kind: "overlay",
					source,
					target,
					key: `${record.id}.${field}`,
					id: record.id,
					field,
					hash,
				};
				if (!t) sort({ ...unit, state: "missing" });
				else {
					const state = freshness(t, hash);
					if (state !== "fresh") sort({ ...unit, state }, t);
				}
			}
	}
	return { todo, held };
};

// ------------------------------------------------------------------- draft

/** Do-not-translate terms: dnt.txt plus every project name in the directory. */
export const loadDnt = (root) => {
	const file = `${PATHS.glossary}/dnt.txt`;
	const listed = existsSync(join(root, file))
		? read(root, file)
				.split("\n")
				.map((l) => l.trim())
				.filter((l) => l && !l.startsWith("#"))
		: [];
	const projects = readJson(root, `${PATHS.data}/projects.json`, []).map(
		(p) => p.title,
	);
	return [...listed, ...projects];
};

/** The locale's terminology: English term → required translation. */
export const loadTerminology = (root, locale) =>
	readJson(root, `${PATHS.glossary}/${locale}.json`, {});

/**
 * Translates a list of plain strings through `translator`, protecting what
 * must not change. Leading and trailing whitespace is kept as it was. Throws
 * if any reply breaks a protected run or the Markdown outline.
 */
const translateAll = async (texts, ctx) => {
	const jobs = texts.map((t) => {
		const [, lead, core, trail] = t.match(/^(\s*)([\s\S]*?)(\s*)$/);
		const masked = mask(core, ctx.dnt);
		return { t, lead, core, trail, masked };
	});
	const send = jobs.filter((j) => !nothingToTranslate(j.masked.text));
	if (send.length) {
		const out = await ctx.translator.translate({
			locale: ctx.locale,
			from: ctx.from ?? "en",
			segments: send.map((j) => j.masked.text),
			terminology: ctx.terminology,
		});
		if (out.length !== send.length)
			throw new Error(`sent ${send.length} segments, got ${out.length} back`);
		send.forEach((j, i) => {
			const text = unmask(out[i].trim(), j.masked.tokens);
			if (outline(text) !== outline(j.core))
				throw new Error("Markdown headings changed");
			j.result = text;
		});
	}
	return jobs.map((j) =>
		j.result === undefined ? j.t : j.lead + j.result + j.trail,
	);
};

// A failed check is usually a one-off slip by the model; one retry, then give up.
const withRetry = async (fn) => {
	try {
		return await fn();
	} catch (e) {
		// An API failure, or a reply that cannot succeed on a resend.
		if (e.name === "TranslatorError" || e.noRetry) throw e;
		return await fn();
	}
};

const chunk = (list, n) =>
	Array.from({ length: Math.ceil(list.length / n) }, (_, i) =>
		list.slice(i * n, i * n + n),
	);

const machineMeta = (hash, translator) => ({
	sourceHash: hash,
	status: "machine",
	translator: translator.name,
});

const draftContent = async (root, unit, ctx) => {
	const doc = parseDoc(read(root, unit.source), unit.source);
	const leaves = docLeaves(doc.data, unit.collection);
	const texts = leaves.map((p) => getAt(doc.data, p));
	if (doc.body !== null) texts.push(doc.body);
	const from = doc.data.lang ?? "en";
	const out = await withRetry(() => translateAll(texts, { ...ctx, from }));
	const data = structuredClone(doc.data);
	leaves.forEach((p, i) => setAt(data, p, out[i]));
	delete data.lang;
	delete data.slug;
	data.translation = machineMeta(unit.hash, ctx.translator);
	write(
		root,
		unit.target,
		renderDoc({ ...doc, data, body: doc.body === null ? null : out.at(-1) }),
	);
};

const BATCH = 60;

const draftCatalog = async (root, units, ctx) => {
	const en = englishCatalog(root);
	const locale = ctx.locale;
	const tr = readJson(root, catalogPath(locale), {
		$schema: "https://inlang.com/schema/inlang-message-format",
	});
	const meta = readJson(root, catalogMetaPath(locale), {});
	// Saved after every batch, so an API failure mid-run keeps the paid work.
	const save = () => {
		// Keep the English key order so a diff of the two catalogs lines up.
		const ordered = { $schema: tr.$schema };
		for (const k of Object.keys(en)) if (k in tr) ordered[k] = tr[k];
		for (const k of Object.keys(tr)) if (!(k in ordered)) ordered[k] = tr[k];
		writeJson(root, catalogPath(locale), ordered);
		writeJson(root, catalogMetaPath(locale), meta);
	};
	const failed = [];
	for (const batch of chunk(units, BATCH)) {
		const items = batch.map((u) => {
			const value = structuredClone(en[u.key]);
			const leaves = messageLeaves(value);
			return { u, value, leaves };
		});
		const texts = items.flatMap(({ value, leaves }) =>
			leaves.map((p) => (p.length ? getAt(value, p) : value)),
		);
		let out;
		try {
			out = await withRetry(() => translateAll(texts, ctx));
		} catch (e) {
			if (e.name === "TranslatorError") throw e;
			failed.push(...batch.map((u) => `${u.key}: ${e.message}`));
			continue;
		}
		let i = 0;
		for (const { u, leaves, value: draft } of items) {
			let value = draft;
			for (const p of leaves) {
				if (p.length) setAt(value, p, out[i]);
				else value = out[i];
				i++;
			}
			tr[u.key] = value;
			meta[u.key] = machineMeta(u.hash, ctx.translator);
		}
		save();
	}
	return failed;
};

const draftOverlay = async (root, target, units, ctx) => {
	const records = new Map(
		readJson(root, units[0].source, []).map((r) => [r.id, r]),
	);
	const overlay = readJson(root, target, {});
	const failed = [];
	for (const batch of chunk(units, BATCH)) {
		let out;
		try {
			out = await withRetry(() =>
				translateAll(
					batch.map((u) => records.get(u.id)[u.field]),
					ctx,
				),
			);
		} catch (e) {
			if (e.name === "TranslatorError") throw e;
			failed.push(...batch.map((u) => `${u.key}: ${e.message}`));
			continue;
		}
		batch.forEach((u, i) => {
			overlay[u.id] ??= {};
			overlay[u.id][u.field] = {
				text: out[i],
				...machineMeta(u.hash, ctx.translator),
			};
		});
		// Saved after every batch, so an API failure mid-run keeps the paid work.
		writeJson(root, target, overlay);
	}
	return failed;
};

/**
 * Machine-drafts every unit in `todo` through `translator`
 * (`{ name, translate({ locale, from, segments, terminology }) → string[] }`).
 * Returns `{ written, failed }`, lists of `<target>[ key]` strings. A unit
 * whose reply fails a check is not written and lands in `failed`.
 */
export const draft = async ({ root, locale, todo, translator }) => {
	const ctx = {
		locale,
		translator,
		dnt: dntPattern(loadDnt(root)),
		terminology: loadTerminology(root, locale),
	};
	const written = [];
	const failed = [];
	const byKind = (k) => todo.filter((u) => u.kind === k);
	// Catalog and overlay drafts return their failures as `<key>: <why>`.
	const record = (target, units, bad) => {
		failed.push(...bad.map((b) => `${target} ${b}`));
		written.push(
			...units
				.filter((u) => !bad.some((b) => b.startsWith(`${u.key}:`)))
				.map((u) => `${target} ${u.key}`),
		);
	};

	const catalog = byKind("catalog");
	if (catalog.length) {
		record(catalog[0].target, catalog, await draftCatalog(root, catalog, ctx));
	}
	for (const u of byKind("content")) {
		try {
			await draftContent(root, u, ctx);
			written.push(u.target);
		} catch (e) {
			if (e.name === "TranslatorError") throw e;
			failed.push(`${u.target}: ${e.message}`);
		}
	}
	const overlays = Map.groupBy(byKind("overlay"), (u) => u.target);
	for (const [target, units] of overlays) {
		record(target, units, await draftOverlay(root, target, units, ctx));
	}
	return { written, failed };
};

// ------------------------------------------------------------------ review

export class RefusedError extends Error {
	name = "RefusedError";
}

const refuseStale = (what, stale) => {
	const shown = stale.slice(0, 10).join(", ");
	const more = stale.length > 10 ? ` and ${stale.length - 10} more` : "";
	throw new RefusedError(
		`${what}: the English changed since it was drafted (${shown}${more}). ` +
			"Compare it with the current English and fix it first, then re-run " +
			"with --rechecked; or redraft it with `pnpm i18n:draft <locale> " +
			"--only <path> --restale`.",
	);
};

const reviewedFresh = (meta, hash) =>
	meta?.status === "reviewed" && meta.sourceHash === hash;

const reviewedMeta = (old, hash, reviewer) => ({
	sourceHash: hash,
	status: "reviewed",
	translator: old?.translator ?? reviewer,
	reviewer,
});

/**
 * Marks a translation reviewed by `reviewer` and stamps the current English
 * sourceHash. Refuses (RefusedError) when the English changed since the
 * draft, unless `rechecked`: the reviewer says they compared it with the
 * current English. `path` is the translation file: a content translation,
 * messages/<locale>.json or an overlay. Every unit in it is reviewed except
 * one already reviewed against the current English, which keeps its
 * reviewer. Returns the number of units stamped.
 */
export const review = ({ root, locale, path, reviewer, rechecked = false }) => {
	if (!reviewer?.trim()) throw new RefusedError("a review names its reviewer");
	const p = relative(root, join(root, path));

	if (p === catalogPath(locale)) {
		const en = englishCatalog(root);
		const tr = readJson(root, p, {});
		const meta = readJson(root, catalogMetaPath(locale), {});
		const hash = (k) => hashSource(JSON.stringify(en[k]));
		const keys = Object.keys(tr).filter(
			(k) => k in en && !reviewedFresh(meta[k], hash(k)),
		);
		const stale = keys.filter((k) => meta[k]?.sourceHash !== hash(k));
		if (stale.length && !rechecked) refuseStale(p, stale);
		for (const k of keys) meta[k] = reviewedMeta(meta[k], hash(k), reviewer);
		writeJson(root, catalogMetaPath(locale), meta);
		return keys.length;
	}

	const overlayDir = `${PATHS.overlays}/${locale}/`;
	if (p.startsWith(overlayDir)) {
		const file = p.slice(overlayDir.length).replace(/\.json$/, "");
		const records = new Map(
			readJson(root, `${PATHS.data}/${file}.json`, []).map((r) => [r.id, r]),
		);
		const overlay = readJson(root, p, null);
		if (!overlay) throw new RefusedError(`${p} does not exist`);
		const units = Object.entries(overlay).flatMap(([id, fields]) =>
			Object.keys(fields)
				.filter((f) => typeof records.get(id)?.[f] === "string")
				.map((f) => ({ id, f, hash: hashSource(records.get(id)[f]) }))
				.filter((u) => !reviewedFresh(fields[u.f], u.hash)),
		);
		const stale = units
			.filter((u) => overlay[u.id][u.f].sourceHash !== u.hash)
			.map((u) => `${u.id}.${u.f}`);
		if (stale.length && !rechecked) refuseStale(p, stale);
		for (const u of units)
			overlay[u.id][u.f] = {
				text: overlay[u.id][u.f].text,
				...reviewedMeta(overlay[u.id][u.f], u.hash, reviewer),
			};
		writeJson(root, p, overlay);
		return units.length;
	}

	// Content: src/content/<collection>/<locale>/<slug>.<ext>
	const parts = p.split("/");
	const at = parts.indexOf(locale);
	if (!p.startsWith(`${PATHS.content}/`) || at !== 3)
		throw new RefusedError(
			`${p} is not a ${locale} translation: expected ${catalogPath(locale)}, ` +
				`${overlayDir}<file>.json or ${PATHS.content}/<collection>/${locale}/…`,
		);
	if (!existsSync(join(root, p))) throw new RefusedError(`${p} does not exist`);
	const source = [...parts.slice(0, at), ...parts.slice(at + 1)].join("/");
	if (!existsSync(join(root, source)))
		throw new RefusedError(`${p} has no English original at ${source}`);
	const hash = hashSource(read(root, source));
	const text = read(root, p);
	const old = parseDoc(text, p).data.translation;
	if (old?.sourceHash !== hash && !rechecked) refuseStale(p, [source]);
	write(
		root,
		p,
		replaceTranslationBlock(text, p, reviewedMeta(old, hash, reviewer)),
	);
	return 1;
};

// Rewrites only the `translation:` block, so a reviewer's own formatting of
// the rest of the file survives.
// The block runs to the next unindented line; a blank line inside it counts
// only when more of the block follows.
const BLOCK =
	/^translation:[ \t]*\r?\n(?:[ \t]+\S.*(?:\r?\n|$)|[ \t]*\r?\n(?=[ \t]+\S))*/m;
const replaceTranslationBlock = (text, path, meta) => {
	const yamlFile = extname(path) === ".yaml";
	const fm = yamlFile ? text : text.match(FRONTMATTER)?.[1];
	if (fm === undefined || !BLOCK.test(fm))
		throw new RefusedError(`${path} has no translation block to update`);
	// Function replacers: a `$'` or `$&` in the text must stay literal.
	const next = fm.replace(BLOCK, () => yaml({ translation: meta }));
	return yamlFile ? next : text.replace(fm, () => next.replace(/\n$/, ""));
};

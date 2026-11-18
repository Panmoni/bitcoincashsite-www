// The source-side i18n check (PAN-383, docs/i18n.md § Checks). Per locale it
// reports:
//
//   missing     catalog keys English has and the locale lacks
//   unused      catalog keys no source file names (English, all locales)
//   placeholder a translation whose {placeholders}, plural inputs or
//               selectors differ from the English
//   machine     units still in machine draft
//   stale       reviewed units whose English changed since review
//   orphan      translations whose English id is gone (catalog key, content
//               file, overlay id)
//   fragment    overlay fields that render as embedded English
//   hardcoded   text nodes in src/**/*.astro that bypass the catalog and copy
//
// A `live` locale fails on missing, placeholder and orphan. While any locale
// besides English is live, a hard-coded string not in the allowlist fails
// too. Everything else warns, so an English edit (which only makes units
// stale) can never turn the check red.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import {
	findOrphans,
	hashSource,
	IDENTIFIER_KEYS,
} from "../../src/utils/localize.mjs";
import { loadDnt, OVERLAY_FIELDS, PATHS, parseDoc } from "./pipeline.mjs";

export const ALLOWLIST = "src/i18n/hardcoded-allow.txt";

const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const filesUnder = (dir) =>
	isDir(dir)
		? readdirSync(dir).flatMap((n) => {
				const p = join(dir, n);
				return isDir(p) ? filesUnder(p) : [p];
			})
		: [];
const readJson = (root, p, fallback) =>
	existsSync(join(root, p))
		? JSON.parse(readFileSync(join(root, p), "utf8"))
		: fallback;
const catalog = (root, locale) => {
	const { $schema: _, ...messages } = readJson(
		root,
		`${PATHS.messages}/${locale}.json`,
		{},
	);
	return messages;
};

// ------------------------------------------------------------ placeholders

const PLACEHOLDER = /\{([A-Za-z_][\w.]*)\}/g;
const names = (text) =>
	new Set([...String(text).matchAll(PLACEHOLDER)].map((m) => m[1]));
const same = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
const list = (s) => [...s].sort().join(", ") || "none";

/** The parts of one inlang message a translation must keep. */
const messageShape = (value) => {
	if (typeof value === "string")
		return { plural: false, placeholders: names(value) };
	const variant = value[0] ?? {};
	const inputs = new Set(
		(variant.declarations ?? [])
			.map((d) => d.match(/^input\s+(\S+)/)?.[1])
			.filter(Boolean),
	);
	const placeholders = new Set(
		Object.values(variant.match ?? {}).flatMap((t) => [...names(t)]),
	);
	return {
		plural: true,
		inputs,
		selectors: new Set(variant.selectors ?? []),
		placeholders,
		keys: Object.keys(variant.match ?? {}),
	};
};

/** How a translated message differs from English in what code passes it. */
export const messageMismatch = (en, tr) => {
	const a = messageShape(en);
	const b = messageShape(tr);
	if (a.plural !== b.plural)
		return a.plural
			? "English is plural, translation is not"
			: "translation is plural, English is not";
	if (!a.plural)
		return same(a.placeholders, b.placeholders)
			? null
			: `placeholders ${list(b.placeholders)}, English ${list(a.placeholders)}`;
	if (!same(a.inputs, b.inputs))
		return `inputs ${list(b.inputs)}, English ${list(a.inputs)}`;
	if (!same(a.selectors, b.selectors))
		return `selectors ${list(b.selectors)}, English ${list(a.selectors)}`;
	const unknown = [...b.placeholders].filter(
		(p) => !a.placeholders.has(p) && !a.inputs.has(p),
	);
	if (unknown.length) return `unknown placeholder ${unknown.join(", ")}`;
	if (!b.keys.some((k) => k.split(",").every((part) => part.endsWith("=*"))))
		return "no catch-all (=*) variant";
	return null;
};

/** String leaves of a page copy that are words, with their paths. */
const copyLeaves = (data, path = "", key = "") => {
	if (typeof data === "string")
		return IDENTIFIER_KEYS.has(key) ? [] : [[path, data]];
	if (Array.isArray(data))
		return data.flatMap((v, i) => copyLeaves(v, `${path}[${i}]`, key));
	if (data && typeof data === "object" && !(data instanceof Date))
		return Object.entries(data).flatMap(([k, v]) =>
			k === "translation" ? [] : copyLeaves(v, path ? `${path}.${k}` : k, k),
		);
	return [];
};

// ------------------------------------------------------------- per locale

const status = (meta, hash) => {
	if (!meta?.status) return null;
	if (meta.status === "machine") return "machine";
	return meta.sourceHash === hash ? null : "stale";
};

/** Every finding for one non-default locale: `[{ kind, where, detail }]`. */
export const checkLocale = ({ root, locale, locales, orphans }) => {
	const out = [];
	const add = (kind, where, detail = "") => out.push({ kind, where, detail });

	// Catalog.
	const en = catalog(root, "en");
	const tr = catalog(root, locale);
	const meta = readJson(root, `${PATHS.messages}/meta/${locale}.json`, {});
	const file = `${PATHS.messages}/${locale}.json`;
	for (const [key, value] of Object.entries(en)) {
		if (!(key in tr)) {
			add("missing", `${file}#${key}`);
			continue;
		}
		const problem = messageMismatch(value, tr[key]);
		if (problem) add("placeholder", `${file}#${key}`, problem);
		const s = status(meta[key], hashSource(JSON.stringify(value)));
		if (s) add(s, `${file}#${key}`);
	}
	for (const key of Object.keys(tr))
		if (!(key in en)) add("orphan", `${file}#${key}`, "no English key");

	// Content: provenance, and page copy placeholders.
	const contentRoot = join(root, PATHS.content);
	for (const collection of isDir(contentRoot) ? readdirSync(contentRoot) : []) {
		const dir = join(contentRoot, collection, locale);
		for (const abs of filesUnder(dir)) {
			if (!/\.(md|mdx|yaml)$/.test(abs)) continue;
			const target = relative(root, abs);
			const source = join(PATHS.content, collection, relative(dir, abs));
			if (!existsSync(join(root, source))) continue; // an orphan, below
			const englishText = readFileSync(join(root, source), "utf8");
			const doc = parseDoc(readFileSync(abs, "utf8"), target);
			const s = status(doc.data.translation, hashSource(englishText));
			if (s) add(s, target);
			if (collection === "pages") {
				const english = new Map(copyLeaves(parseDoc(englishText, source).data));
				for (const [path, text] of copyLeaves(doc.data)) {
					const want = names(english.get(path) ?? "");
					const got = names(text);
					if (!same(want, got))
						add(
							"placeholder",
							`${target}#${path}`,
							`placeholders ${list(got)}, English ${list(want)}`,
						);
				}
			}
		}
	}

	// Overlays: provenance, placeholders, and the fields that fall back.
	for (const [name, fields] of Object.entries(OVERLAY_FIELDS)) {
		const source = `${PATHS.data}/${name}.json`;
		if (!existsSync(join(root, source))) continue;
		const target = `${PATHS.overlays}/${locale}/${name}.json`;
		const overlay = readJson(root, target, {});
		for (const record of readJson(root, source, []))
			for (const field of fields) {
				const value = record[field];
				if (typeof value !== "string" || !value.trim()) continue;
				const t = overlay[record.id]?.[field];
				const where = `${target}#${record.id}.${field}`;
				const hash = hashSource(value);
				if (!t || t.sourceHash !== hash) {
					add(
						"fragment",
						where,
						t ? "stale, shows English" : "untranslated, shows English",
					);
				}
				if (!t) continue;
				const s = status(t, hash);
				if (s) add(s, where);
				if (!same(names(value), names(t.text)))
					add(
						"placeholder",
						where,
						`placeholders ${list(names(t.text))}, English ${list(names(value))}`,
					);
			}
	}

	for (const o of orphans ?? findOrphansIn(root, locales))
		if (o.locale === locale)
			add(
				"orphan",
				o.kind === "content"
					? join(PATHS.content, o.file)
					: `${PATHS.overlays}/${o.file}#${o.id}`,
				"no English original",
			);
	return out;
};

const findOrphansIn = (root, locales) =>
	findOrphans({
		contentDir: join(root, PATHS.content),
		dataDir: join(root, PATHS.data),
		overlayDir: join(root, PATHS.overlays),
		locales,
	});

// ------------------------------------------------------------------ unused

/** Catalog keys that no file under src/ or scripts/ names. */
export const unusedKeys = (root) => {
	const sources = ["src", "scripts"]
		.flatMap((d) => filesUnder(join(root, d)))
		.filter(
			(p) =>
				/\.(astro|ts|tsx|js|mjs)$/.test(p) &&
				!p.includes(`${join("src", "paraglide")}`) &&
				!p.includes(`${join("i18n", "fixtures")}`),
		)
		.map((p) => readFileSync(p, "utf8"))
		.join("\n");
	const words = new Set(sources.match(/[\w$]+/g));
	return Object.keys(catalog(root, "en")).filter((key) => !words.has(key));
};

// --------------------------------------------------------------- hardcoded

/** Allowlist: bare lines are terms removed anywhere; `path: text` accepts one node. */
export const loadAllowlist = (root) => {
	const terms = [...loadDnt(root)];
	const nodes = new Set();
	const file = join(root, ALLOWLIST);
	if (existsSync(file))
		for (const raw of readFileSync(file, "utf8").split("\n")) {
			const line = raw.trim();
			if (!line || line.startsWith("#")) continue;
			const m = line.match(/^(src\/\S+\.astro):\s+(.+)$/);
			if (m) nodes.add(`${m[1]}: ${m[2]}`);
			else terms.push(line);
		}
	return { terms, nodes };
};

/**
 * Removes every element whose opening tag matches `attr`, counting nested
 * elements of the same name so an inner close does not end it early.
 */
export const dropElements = (html, attr) => {
	const open = new RegExp(`<(\\w+)\\b[^>]*\\s(?:${attr.source})[^>]*>`, "gi");
	let out = "";
	let from = 0;
	for (let m = open.exec(html); m; m = open.exec(html)) {
		if (m.index < from) continue;
		if (/^(?:html|body|head)$/i.test(m[1])) continue;
		out += html.slice(from, m.index);
		const tag = new RegExp(`<(/?)${m[1]}\\b[^>]*?(/?)>`, "gi");
		tag.lastIndex = m.index + m[0].length;
		let depth = m[0].endsWith("/>") ? 0 : 1;
		let end = tag.lastIndex;
		while (depth > 0) {
			const t = tag.exec(html);
			if (!t) {
				end = html.length;
				break;
			}
			if (t[1]) depth--;
			else if (!t[2]) depth++;
			end = tag.lastIndex;
		}
		out += " ";
		from = end;
		open.lastIndex = end;
	}
	return out + html.slice(from);
};

// Where a `<` in JS starts JSX rather than a comparison.
const JSX_AFTER = /[(,=?:&|>[{]$|^$|\breturn$/;

/**
 * The markup of an .astro template with the JavaScript taken out: `{…}`
 * expressions are dropped, but JSX inside them (`{items.map((i) => <li>…</li>)}`)
 * is kept as markup, so its text is checked too. Attribute expressions
 * (`href={…}`) are dropped. Quotes are strings only in JavaScript, so an
 * apostrophe in text never swallows the rest of the template.
 */
export const templateMarkup = (src) => {
	let out = "";
	// Frames: markup (root, or JSX opened inside an expression) and js.
	const stack = [{ mode: "markup", depth: 0, root: true }];
	let i = 0;
	const skipString = (q) => {
		for (i++; i < src.length && src[i] !== q; i++) if (src[i] === "\\") i++;
	};
	while (i < src.length) {
		const frame = stack.at(-1);
		const c = src[i];
		if (frame.mode === "js") {
			if (c === '"' || c === "'" || c === "`") skipString(c);
			else if (src.startsWith("//", i)) {
				const nl = src.indexOf("\n", i);
				i = nl === -1 ? src.length : nl - 1;
			} else if (src.startsWith("/*", i)) {
				const close = src.indexOf("*/", i);
				i = close === -1 ? src.length : close + 1;
			} else if (c === "{") frame.depth++;
			else if (c === "}") {
				if (frame.depth-- === 0) {
					stack.pop();
					out += "\n";
				}
			} else if (
				c === "<" &&
				/[A-Za-z>]/.test(src[i + 1] ?? "") &&
				JSX_AFTER.test(src.slice(0, i).trimEnd().slice(-6))
			) {
				stack.push({ mode: "markup", depth: 0 });
				continue;
			}
			i++;
			continue;
		}
		if (c === "{") {
			stack.push({ mode: "js", depth: 0 });
			out += "\n";
			i++;
			continue;
		}
		if (c !== "<") {
			out += c;
			i++;
			continue;
		}
		// A tag: copy it, dropping attribute expressions.
		let tag = "";
		for (; i < src.length && src[i] !== ">"; i++) {
			const t = src[i];
			if (t === '"' || t === "'") {
				const q = t;
				const startQ = i;
				skipString(q);
				tag += src.slice(startQ, i + 1);
			} else if (t === "{") {
				let d = 1;
				for (i++; i < src.length && d; i++) {
					if (src[i] === "{") d++;
					else if (src[i] === "}") d--;
				}
				i--;
			} else tag += t;
		}
		tag += ">";
		i++;
		out += tag;
		if (frame.root) continue;
		if (tag.startsWith("</")) frame.depth--;
		else if (!tag.endsWith("/>")) frame.depth++;
		if (frame.depth <= 0) stack.pop();
	}
	return out;
};

const TEXT_ATTRS = /\s(alt|title|aria-label|placeholder|label)="([^"{]*)"/g;
const decode = (s) =>
	s
		.replace(/&nbsp;|&#160;/g, " ")
		.replace(/&[a-z]+;|&#\d+;/gi, "")
		.replace(/\s+/g, " ")
		.trim();

/**
 * The visible English one .astro template writes literally: text between
 * tags (JSX inside expressions included) and the text attributes, once
 * JavaScript, comments, elements marked translate="no" and script, style,
 * pre and code blocks are removed. Returns the strings that still hold a
 * word once allowlisted terms are taken out.
 */
export const hardcodedIn = (source, terms) => {
	const template = source
		.replace(/^\s*---[\s\S]*?\n---/, "")
		.replace(/<(script|style|pre|code)\b[\s\S]*?<\/\1>/gi, "")
		.replace(/<!--[\s\S]*?-->/g, "");
	const body = dropElements(templateMarkup(template), /translate="no"/);
	const found = [];
	for (const [, , value] of body.matchAll(TEXT_ATTRS)) found.push(value);
	const textOnly = body.replace(/<(?:[^>"']|"[^"]*"|'[^']*')*>/g, "\n");
	found.push(...textOnly.split("\n"));
	const strip = (t) =>
		[...terms]
			.sort((a, b) => b.length - a.length)
			.reduce((acc, term) => acc.split(term).join(" "), t);
	return [
		...new Set(found.map(decode).filter((t) => /[A-Za-z]{2,}/.test(strip(t)))),
	];
};

/** Every hard-coded string under src/, as `path: text`, minus the allowlist. */
export const hardcodedStrings = (root, localeCodes = []) => {
	const { terms, nodes } = loadAllowlist(root);
	// A page under src/pages/<locale>/ is written in that locale.
	const own = localeCodes.map((c) => join(root, "src", "pages", c) + sep);
	return filesUnder(join(root, "src"))
		.filter((p) => extname(p) === ".astro" && !own.some((d) => p.startsWith(d)))
		.sort()
		.flatMap((p) => {
			const rel = relative(root, p).split("\\").join("/");
			return hardcodedIn(readFileSync(p, "utf8"), terms)
				.map((t) => `${rel}: ${t}`)
				.filter((entry) => !nodes.has(entry));
		});
};

// -------------------------------------------------------------------- run

const FAILS_LIVE = new Set(["missing", "placeholder", "orphan"]);

/**
 * The whole check. `locales` is the registry (`{ code, status }[]`).
 * Returns `{ errors, warnings, summary }`, each a list of lines.
 */
export const runCheck = ({ root, locales, defaultLocale }) => {
	const errors = [];
	const warnings = [];
	const summary = [];
	const others = locales.filter((l) => l.code !== defaultLocale);
	const codes = others.map((l) => l.code);
	const orphans = findOrphansIn(root, codes);
	for (const locale of others) {
		const findings = checkLocale({
			root,
			locale: locale.code,
			locales: codes,
			orphans,
		});
		const counts = {};
		for (const f of findings) {
			counts[f.kind] = (counts[f.kind] ?? 0) + 1;
			const line = `${locale.code} ${f.kind}: ${f.where}${f.detail ? ` (${f.detail})` : ""}`;
			(locale.status === "live" && FAILS_LIVE.has(f.kind)
				? errors
				: warnings
			).push(line);
		}
		const kinds = [
			"missing",
			"placeholder",
			"orphan",
			"machine",
			"stale",
			"fragment",
		];
		summary.push(
			`${locale.code} (${locale.status}): ${kinds.map((k) => `${counts[k] ?? 0} ${k}`).join(", ")}`,
		);
	}
	const unused = unusedKeys(root);
	for (const key of unused) warnings.push(`unused catalog key: ${key}`);
	const hard = hardcodedStrings(root, codes);
	const anyLive = others.some((l) => l.status === "live");
	for (const h of hard) (anyLive ? errors : warnings).push(`hardcoded: ${h}`);
	summary.push(
		`catalog: ${unused.length} unused key(s); templates: ${hard.length} hard-coded string(s)`,
	);
	return { errors, warnings, summary };
};

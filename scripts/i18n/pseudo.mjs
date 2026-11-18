// Pseudo-locales (PAN-383, docs/i18n.md § Pseudo-locales). Two fake
// languages made from English by rule, so CI can prove the foundation holds
// for any real one:
//
//   en-XA  every letter accented and each word about 40% longer, so
//          hard-coded English and layouts that cannot grow stand out
//   ar-XB  every word wrapped in a right-to-left override inside an
//          rtl page, so mirrored layout breaks stand out
//
// They go through the same scan and draft as a real language, with this
// translator in place of the model, so placeholders, code, links and
// do-not-translate terms are protected exactly as for a real draft. The
// output is never committed (.gitignore) and only CI builds it.

const UPPER = "ÅƁÇÐÉƑĜĤÎĴĶĻṀÑÖÞǪŔŠŢÛṼŴẊÝŽ";
const LOWER = "áƀçðéƒĝĥîĵķļɱñöþǫŕšţûṽŵẋýž";
const ACCENT = Object.fromEntries([
	..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, UPPER[i]]),
	..."abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, LOWER[i]]),
]);
const VOWEL = /[aeiouyAEIOUY]/;

// U+202E RIGHT-TO-LEFT OVERRIDE … U+202C POP DIRECTIONAL FORMATTING.
const RLO = "‮";
const PDF = "‬";

/** One ASCII word, accented and padded to about 140% of its length. */
const expand = (word) => {
	let extra = Math.ceil(word.length * 0.4);
	let out = "";
	for (const c of word) {
		out += ACCENT[c];
		if (extra > 0 && VOWEL.test(c)) {
			out += ACCENT[c];
			extra--;
		}
	}
	return out + (ACCENT[word.at(-1)] ?? "").repeat(extra);
};

// Letters only: the ⟦n⟧ tokens protect.mjs leaves hold digits, never letters.
const WORD = /[A-Za-z]+/g;

/** The pseudo text of `text` in `locale`. */
export const pseudoize = (text, locale) =>
	locale === "ar-XB"
		? text.replace(WORD, (w) => `${RLO}${w}${PDF}`)
		: text.replace(WORD, expand);

/** A translator for scripts/i18n/pipeline.mjs `draft()`. */
export const pseudoTranslator = {
	name: "pseudo-locale generator",
	translate: async ({ locale, segments }) =>
		segments.map((s) => pseudoize(s, locale)),
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The words in `text` a pseudo build should have changed and did not: ASCII
 * words of two letters or more, once `terms` (do-not-translate and allowed
 * terms, kept as written in every language), URLs, e-mail addresses and, in
 * ar-XB, the overridden runs are removed.
 */
export const unpseudoWords = (text, locale, terms = []) => {
	let t = text.replace(
		/https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.]+|\b[\w-]+\.(?:com|org|net|io|cash)\b/g,
		" ",
	);
	if (locale === "ar-XB")
		t = t.replace(new RegExp(`${RLO}[^${PDF}]*${PDF}`, "g"), " ");
	// Opcode names stay as written, as protect.mjs keeps them.
	t = t.replace(/\bOP_[A-Z0-9_]+\b/g, " ");
	const list = [...terms].sort((a, b) => b.length - a.length);
	if (list.length)
		t = t.replace(
			new RegExp(
				`(?<![\\p{L}\\p{N}_])(?:${list.map(escape).join("|")})(?![\\p{L}\\p{N}_])`,
				"gu",
			),
			" ",
		);
	return t.match(/(?<![\p{L}])[A-Za-z]{2,}(?![\p{L}])/gu) ?? [];
};

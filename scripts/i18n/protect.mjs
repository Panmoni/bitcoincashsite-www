// Protects the parts of a text a translation must not change. Each one is
// swapped for a token (⟦0⟧, ⟦1⟧, …) before the text goes to the model and
// swapped back after, so code, URLs, placeholders and do-not-translate terms
// come back byte-identical whatever the model does. A reply that drops,
// repeats or invents a token is rejected, never written.

// One pass over all of them: at each position the first pattern that matches
// wins and the scan moves past it, so no pattern can ever take part of a run
// another one took, or a token it left (a link target holding an <autolink>).
// Listed first wins a tie: a fenced block before the inline code inside it.
const PATTERNS = [
	/^(?<fence>```|~~~)[^\n]*\n[\s\S]*?\n\k<fence>[ \t]*$/, // fenced code block
	/`[^`\n]+`/, // inline code
	/<[^>\n]+>/, // HTML tag or <autolink>
	// Markdown link target, spaces included: an image path such as
	// "Screenshot 2023-12-28 at 3.48.11 PM.png" was translated. It stops at
	// a quote, so an image title ("Success dialog") is translated (PAN-383).
	/\]\([^)"'\n]+/,
	/https?:\/\/[^\s)>\]"'`]+/, // bare URL
	/\{[A-Za-z_][\w.]*\}/, // message placeholder: {count}
	/\bOP_[A-Z0-9_]+\b/, // opcode name
];

const combined = (dnt) =>
	new RegExp(
		[...PATTERNS, ...(dnt ? [dnt] : [])].map((p) => p.source).join("|"),
		"gmu",
	);

const TOKEN = /⟦(\d+)⟧/g;
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A matcher for the do-not-translate terms: whole words only, longest term
 * first so "Bitcoin Cash Node" wins over "Bitcoin Cash", case-sensitive so
 * the ticker "BCH" never catches an unrelated "bch".
 */
export const dntPattern = (terms) => {
	const list = [...new Set(terms.filter(Boolean))].sort(
		(a, b) => b.length - a.length,
	);
	if (!list.length) return null;
	return new RegExp(
		`(?<![\\p{L}\\p{N}_])(?:${list.map(escape).join("|")})(?![\\p{L}\\p{N}_])`,
		"gu",
	);
};

/** `{ text, tokens }`: `text` with every protected run swapped for a token. */
export const mask = (input, dnt) => {
	const tokens = [];
	const swap = (m) => {
		tokens.push(m);
		return `⟦${tokens.length - 1}⟧`;
	};
	return { text: input.replace(combined(dnt), swap), tokens };
};

/**
 * Puts the protected runs back. Throws when the model dropped, repeated or
 * invented a token: the draft is unusable and must not be written.
 */
export const unmask = (text, tokens) => {
	const seen = new Map();
	for (const [, n] of text.matchAll(TOKEN))
		seen.set(Number(n), (seen.get(Number(n)) ?? 0) + 1);
	const problems = [];
	tokens.forEach((_, i) => {
		const n = seen.get(i) ?? 0;
		if (n !== 1) problems.push(`⟦${i}⟧ appears ${n} times`);
	});
	for (const i of seen.keys())
		if (i >= tokens.length) problems.push(`⟦${i}⟧ is not a token we sent`);
	if (problems.length)
		throw new Error(`protected text changed: ${problems.join("; ")}`);
	return text.replace(TOKEN, (_, n) => tokens[Number(n)]);
};

/** True when nothing but tokens and punctuation is left to translate. */
export const nothingToTranslate = (masked) =>
	!/\p{L}/u.test(masked.replace(TOKEN, ""));

/** The `#`-heading levels of a Markdown text, in order: its outline. */
export const outline = (md) =>
	[...md.matchAll(/^(#{1,6})[ \t]/gm)].map((m) => m[1].length).join(",");

// The translator `pnpm i18n:draft` uses: the Claude API, key from
// ANTHROPIC_API_KEY. Tests pass their own translator instead, so nothing
// here runs under `pnpm test`.
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";

// Kept byte-stable across requests so the API can cache it.
const SYSTEM = `You translate copy for bchworks.com, a website about Bitcoin Cash for a general audience.

You receive JSON: the source and target language, a terminology list, and a list of segments. Return one translation per segment, in the same order, in the "translations" array.

Rules:
- Tokens such as ⟦3⟧ stand for code, URLs, HTML tags, placeholders and names that must not change. Copy every token exactly once, unchanged, and put it where it belongs in the translated sentence.
- Keep the Markdown structure: the same headings and heading levels, lists, tables, emphasis and blank lines.
- When a terminology entry's source term appears, use its given translation. An entry may be an object: use its "translation", and follow its "note". A note may ask for a short gloss on first use: add it once, at the term's first occurrence in the page body (a multi-paragraph Markdown segment), never in a title, description, heading or short label. If no segment is a page body, add no gloss. That gloss is the only addition allowed.
- When the JSON carries a "style" brief for the target language, follow it: register, vocabulary, punctuation, number format and capitalisation.
- Translate the meaning in a clear, natural register. Add nothing, drop nothing, and add no notes.
- A short label stays a short label.`;

const SCHEMA = {
	type: "object",
	properties: { translations: { type: "array", items: { type: "string" } } },
	required: ["translations"],
	additionalProperties: false,
};

// A failure of the API itself (auth, quota, refusal): stops the whole run,
// unlike a reply that fails a check, which skips one unit.
export class TranslatorError extends Error {
	name = "TranslatorError";
}

const languageName = (code) =>
	new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;

/**
 * The Messages API request for one batch. The system prompt is the same for
 * every locale; the locale's terminology and style brief ride in the user turn.
 */
export const buildRequest = ({
	locale,
	from,
	segments,
	terminology,
	style,
}) => ({
	model: MODEL,
	max_tokens: 64000,
	betas: ["server-side-fallback-2026-07-01"],
	// Fallbacks: if this model declines, the API re-runs the request on
	// another one instead of failing.
	fallbacks: "default",
	output_config: {
		effort: "medium",
		format: { type: "json_schema", schema: SCHEMA },
	},
	system: SYSTEM,
	messages: [
		{
			role: "user",
			content: JSON.stringify({
				source: languageName(from),
				target: languageName(locale),
				terminology,
				...(style ? { style } : {}),
				segments,
			}),
		},
	],
});

export const claudeTranslator = () => {
	if (!process.env.ANTHROPIC_API_KEY)
		throw new TranslatorError("ANTHROPIC_API_KEY is not set");
	const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
	return {
		// Not the model id: a server-side fallback may serve the reply.
		name: "Claude",
		async translate(batch) {
			let message;
			try {
				message = await client.beta.messages
					.stream(buildRequest(batch))
					.finalMessage();
			} catch (e) {
				throw new TranslatorError(`Claude API: ${e.message}`);
			}
			if (message.stop_reason === "refusal")
				throw new TranslatorError(
					`Claude declined (${message.stop_details?.category ?? "no category"})`,
				);
			if (message.stop_reason === "max_tokens")
				// Not a TranslatorError: one oversized unit, the rest can go on.
				// A resend would hit the same limit, so it is not retried.
				throw Object.assign(
					new Error("reply hit max_tokens; split the source file"),
					{ noRetry: true },
				);
			const text = message.content.find((b) => b.type === "text")?.text;
			return JSON.parse(text ?? "{}").translations ?? [];
		},
	};
};

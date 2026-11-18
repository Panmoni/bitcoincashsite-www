// The request `pnpm i18n:draft` sends to Claude. Built here without a key or a
// network call.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { buildRequest } from "./claude.mjs";

const payload = (req) => JSON.parse(req.messages[0].content);
const base = {
	locale: "es",
	from: "en",
	segments: ["Get a wallet"],
	terminology: { wallet: "billetera" },
};

describe("buildRequest", () => {
	test("carries the locale style brief when there is one", () => {
		const req = buildRequest({ ...base, style: "Usa tú, nunca usted." });
		assert.equal(payload(req).style, "Usa tú, nunca usted.");
		assert.match(req.system, /"style" brief/);
	});

	test("leaves the style key out when there is none", () => {
		assert.equal("style" in payload(buildRequest(base)), false);
	});

	test("names the languages and sends terminology and segments", () => {
		const p = payload(buildRequest(base));
		assert.equal(p.source, "English");
		assert.equal(p.target, "Spanish");
		assert.deepEqual(p.terminology, { wallet: "billetera" });
		assert.deepEqual(p.segments, ["Get a wallet"]);
	});

	test("keeps the system prompt byte-stable across locales", () => {
		const es = buildRequest({ ...base, style: "a" });
		const pt = buildRequest({ ...base, locale: "pt", style: "b" });
		assert.equal(es.system, pt.system);
	});
});

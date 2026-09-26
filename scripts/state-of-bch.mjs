#!/usr/bin/env node
// Drafts the monthly "State of BCH" report from the data snapshots:
//   node scripts/state-of-bch.mjs [YYYY-MM]
// Writes src/content/reports/<month>.md with the numbers frozen in place.
// A report is a point-in-time record, so it never reads live data at build.
// Refuses to overwrite an existing report; the prose is written by a person.
import { access, readFile, writeFile } from "node:fs/promises";

const month = process.argv[2] ?? new Date().toISOString().slice(0, 7);
if (!/^\d{4}-\d{2}$/.test(month)) throw new Error(`bad month "${month}"`);
const out = `src/content/reports/${month}.md`;
if (
	await access(out).then(
		() => true,
		() => false,
	)
) {
	throw new Error(`${out} exists; edit it by hand or delete it first`);
}

const metrics = JSON.parse(await readFile("src/data/metrics.json", "utf8"));
const health = JSON.parse(await readFile("src/data/health.json", "utf8"));
const bch = metrics.chains.bch;
const today = new Date().toISOString().slice(0, 10);

const fmt = (n, digits = 0) =>
	n == null ? "n/a" : n.toLocaleString("en", { maximumFractionDigits: digits });
const usd = (n) =>
	n == null ? "n/a" : n >= 1 ? `$${fmt(n, 2)}` : `$${n.toPrecision(2)}`;

// Count listed projects only; deprecated ones sit in the directory graveyard.
const projects = JSON.parse(await readFile("src/data/projects.json", "utf8"));
const stateOf = new Map(health.map((h) => [h.id, h.state]));
const listed = projects.filter((p) => p.status !== "deprecated");
const states = listed.reduce((t, p) => {
	const s = stateOf.get(p.id) ?? "unknown";
	return { ...t, [s]: (t[s] ?? 0) + 1 };
}, {});

const rows = Object.entries(metrics.chains)
	.map(
		([id, c]) =>
			`| ${c.name} | ${usd(c.medianFeeUsd)} | ${fmt(c.tx24h)} | ${c.blockTime} |${id === "bch" ? " ← |" : " |"}`,
	)
	.join("\n");

const monthName = new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en", {
	month: "long",
	year: "numeric",
	timeZone: "UTC",
});

const body = `---
title: "State of BCH: ${monthName}"
description: "Bitcoin Cash by the numbers for ${monthName}: activity, fees, hashrate, ecosystem health and the upgrade calendar."
month: "${month}"
verified: ${today}
sources:
  - title: "Blockchair Bitcoin Cash stats"
    url: "https://blockchair.com/bitcoin-cash"
  - title: "CoinGecko"
    url: "https://www.coingecko.com/en/coins/bitcoin-cash"
  - title: "BCH Works directory health checks"
    url: "https://bchworks.com/directory"
---

<!-- DRAFT generated ${today} by scripts/state-of-bch.mjs. Write the summary and
     the "What happened" section, check every number, then delete this comment. -->

## Summary

_TODO: three sentences. What moved this month, and why it matters._

## The chain

Snapshot taken ${metrics.generatedAt.slice(0, 10)} (UTC).

| Metric | Value |
|---|---|
| Block height | ${fmt(bch.height)} |
| Transactions, 24h | ${fmt(bch.tx24h)} |
| Median fee | ${usd(bch.medianFeeUsd)} |
| Blocks, 24h | ${fmt(bch.blocks24h)} |
| Hashrate | ${bch.hashrate ? `${(bch.hashrate / 1e18).toFixed(2)} EH/s` : "n/a"} |
| Reachable nodes | ${fmt(bch.nodes)} |
| Price | ${usd(bch.priceUsd)} |
| Market cap | ${usd(bch.marketCapUsd)} |

## Next to other chains

| Chain | Median fee | Tx / 24h | Block time | |
|---|---|---|---|---|
${rows}

## The ecosystem

Of ${listed.length} listed projects in the [directory](/directory): ${states.alive ?? 0} alive, ${states.stale ?? 0} stale, ${states.dead ?? 0} dead, ${states.unknown ?? 0} unknown.

_TODO: notable launches, shutdowns, releases. Token activity: link the TokenStork briefing._

## What happened

_TODO: upgrades and CHIP news, exchange listings, events._

## What's next

See the [upgrade timeline](/upgrades) for the countdown to the next network upgrade.
`;

await writeFile(out, body);
console.log(`wrote ${out}`);

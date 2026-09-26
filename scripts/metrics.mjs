#!/usr/bin/env node
// Snapshots chain metrics into src/data/metrics.json for the "Real Numbers"
// panel and the freshness badges. Run daily by .github/workflows/refresh-data.yml.
// Sources: Blockchair (chain stats) and CoinGecko (price, market cap).
// A chain Blockchair does not cover keeps null stats; the page shows "n/a".
// On a failed fetch the previous snapshot's values survive with their old asOf.
import { readFile, writeFile } from "node:fs/promises";

const OUT = "src/data/metrics.json";

const CHAINS = [
	{
		id: "bch",
		name: "Bitcoin Cash",
		blockchair: "bitcoin-cash",
		gecko: "bitcoin-cash",
		blockTime: "10 min",
	},
	{
		id: "btc",
		name: "Bitcoin",
		blockchair: "bitcoin",
		gecko: "bitcoin",
		blockTime: "10 min",
	},
	{
		id: "ltc",
		name: "Litecoin",
		blockchair: "litecoin",
		gecko: "litecoin",
		blockTime: "2.5 min",
	},
	{
		id: "bsv",
		name: "Bitcoin SV",
		blockchair: null,
		gecko: "bitcoin-cash-sv",
		blockTime: "10 min",
	},
	{
		id: "eth",
		name: "Ethereum",
		blockchair: "ethereum",
		gecko: "ethereum",
		blockTime: "12 s",
	},
	{
		id: "sol",
		name: "Solana",
		blockchair: null,
		gecko: "solana",
		blockTime: "~0.4 s",
	},
	{
		id: "kas",
		name: "Kaspa",
		blockchair: null,
		gecko: "kaspa",
		blockTime: "~0.1 s",
	},
	{
		id: "ada",
		name: "Cardano",
		blockchair: "cardano",
		gecko: "cardano",
		blockTime: "20 s",
	},
];

const previous = JSON.parse(await readFile(OUT, "utf8").catch(() => "{}"));
const now = new Date().toISOString();

async function getJson(url) {
	const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
	if (!res.ok) throw new Error(`${url} → ${res.status}`);
	return res.json();
}

const prices = await getJson(
	`https://api.coingecko.com/api/v3/simple/price?ids=${CHAINS.map((c) => c.gecko).join(",")}&vs_currencies=usd&include_market_cap=true`,
).catch((err) => {
	console.warn(`coingecko: ${err.message}`);
	return null;
});

const chains = {};
for (const chain of CHAINS) {
	const prev = previous.chains?.[chain.id];
	const out = {
		name: chain.name,
		blockTime: chain.blockTime,
		priceUsd: prev?.priceUsd ?? null,
		marketCapUsd: prev?.marketCapUsd ?? null,
		priceAsOf: prev?.priceAsOf ?? null,
		tx24h: prev?.tx24h ?? null,
		medianFeeUsd: prev?.medianFeeUsd ?? null,
		statsAsOf: prev?.statsAsOf ?? null,
	};
	const price = prices?.[chain.gecko];
	if (price?.usd) {
		out.priceUsd = price.usd;
		out.marketCapUsd = Math.round(price.usd_market_cap);
		out.priceAsOf = now;
	}
	if (chain.blockchair) {
		try {
			const { data } = await getJson(
				`https://api.blockchair.com/${chain.blockchair}/stats`,
			);
			out.tx24h = data.transactions_24h ?? null;
			out.medianFeeUsd = data.median_transaction_fee_usd_24h ?? null;
			out.statsAsOf = now;
			if (chain.id === "bch") {
				out.height = data.best_block_height;
				out.blocks24h = data.blocks_24h;
				out.hashrate = Number(data.hashrate_24h);
				out.nodes = data.nodes;
				out.mempoolTx = data.mempool_transactions;
				out.chainSizeBytes = data.blockchain_size;
			}
		} catch (err) {
			console.warn(`blockchair ${chain.id}: ${err.message}`);
		}
	}
	chains[chain.id] = out;
}

// The snapshot badge reads generatedAt, so never stamp a new time on stale
// BCH numbers. Other chains may lag; each keeps its own asOf.
if (chains.bch.statsAsOf !== now) {
	console.error("metrics: BCH stats did not refresh; not writing", OUT);
	process.exit(1);
}

await writeFile(
	OUT,
	`${JSON.stringify({ generatedAt: now, sources: ["https://blockchair.com", "https://www.coingecko.com"], chains }, null, "\t")}\n`,
);
console.log(
	`metrics: ${Object.keys(chains).length} chains, bch height ${chains.bch.height}`,
);

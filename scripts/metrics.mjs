#!/usr/bin/env node
// Snapshots chain metrics into src/data/metrics.json for the "Real Numbers"
// panel and the freshness badges. Run daily by .github/workflows/refresh-data.yml.
// Sources: Blockchair (chain stats), CoinGecko (price, market cap), and for
// the chains Blockchair misses: the Solana public RPC, api.kaspa.org and Koios.
// A number no source gives stays null; the page shows "n/a".
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
		name: "Bitcoin Core",
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

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const median = (xs) => {
	const s = [...xs].sort((a, b) => a - b);
	const m = s.length >> 1;
	return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

async function solanaRpc(method, params) {
	const res = await fetch("https://api.mainnet-beta.solana.com", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
		signal: AbortSignal.timeout(60_000),
	});
	if (!res.ok) throw new Error(`solana ${method} → ${res.status}`);
	const body = await res.json();
	if (body.error) throw new Error(`solana ${method}: ${body.error.message}`);
	return body.result;
}

// Solana: user (non-vote) transactions over the RPC's last ~12 h of 60 s
// performance samples, scaled to 24 h. Fee: median of the non-vote fees in
// the latest finalized block.
async function solanaStats(priceUsd) {
	const samples = await solanaRpc("getRecentPerformanceSamples", [720]);
	const secs = sum(samples.map((s) => s.samplePeriodSecs));
	const tx = sum(samples.map((s) => s.numNonVoteTransactions));
	const tip = await solanaRpc("getSlot", [{ commitment: "finalized" }]);
	// Leaders skip slots; take the newest slot that produced a block.
	const slot = (await solanaRpc("getBlocks", [tip - 20, tip])).at(-1);
	const block = await solanaRpc("getBlock", [
		slot,
		{
			transactionDetails: "accounts",
			rewards: false,
			maxSupportedTransactionVersion: 1,
		},
	]);
	const VOTE = "Vote111111111111111111111111111111111111111";
	const fees = block.transactions
		.filter((t) => !t.transaction.accountKeys.some((k) => k.pubkey === VOTE))
		.map((t) => t.meta.fee);
	return {
		tx24h: Math.round((tx * 86_400) / secs),
		medianFeeUsd: (median(fees) / 1e9) * priceUsd,
	};
}

// Kaspa: accepted non-coinbase transactions over the last full UTC day. Fee:
// median of inputs minus outputs across recent virtual-chain transactions.
async function kaspaStats(priceUsd) {
	const API = "https://api.kaspa.org";
	const day = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
	const hours = await getJson(`${API}/transactions/count/${day}`);
	if (hours.length !== 24) throw new Error(`kaspa: ${hours.length}/24 hours`);
	const { blueScore } = await getJson(`${API}/info/virtual-chain-blue-score`);
	const fees = [];
	// The API pages by 100 blue scores (~10 s); walk back until 50 samples.
	let from = Math.floor(blueScore / 100) * 100 - 100;
	for (let page = 0; page < 30 && fees.length < 50; page++, from -= 100) {
		const blocks = await getJson(
			`${API}/virtual-chain?blueScoreGte=${from}&limit=100&resolveInputs=true&includeCoinbase=false`,
		);
		for (const tx of blocks.flatMap((b) => b.transactions)) {
			const ins = tx.inputs.map((i) => i.previous_outpoint_amount);
			if (!tx.is_accepted || ins.some((a) => a == null)) continue;
			fees.push(sum(ins) - sum(tx.outputs.map((o) => o.amount)));
		}
	}
	if (fees.length < 10) throw new Error(`kaspa: ${fees.length} fee samples`);
	return {
		tx24h: sum(hours.map((h) => h.regular)),
		medianFeeUsd: (median(fees) / 1e8) * priceUsd,
	};
}

// Cardano: Blockchair has no fee figure, and no free source gives a median.
// Koios gives total fees and transactions for the last full epoch (5 days).
async function cardanoFee(priceUsd) {
	const [tip] = await getJson("https://api.koios.rest/api/v1/tip");
	const [epoch] = await getJson(
		`https://api.koios.rest/api/v1/epoch_info?_epoch_no=${tip.epoch_no - 1}&_include_next_epoch=false`,
	);
	return {
		medianFeeUsd: (Number(epoch.fees) / epoch.tx_count / 1e6) * priceUsd,
		feeBasis: "average",
	};
}

// Stats for chains Blockchair misses, or misses a number for.
const EXTRA_STATS = { sol: solanaStats, kas: kaspaStats, ada: cardanoFee };

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
		feeBasis: "median",
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
	const extra = EXTRA_STATS[chain.id];
	if (extra && out.priceUsd) {
		try {
			Object.assign(out, await extra(out.priceUsd));
			out.statsAsOf = now;
		} catch (err) {
			console.warn(`${chain.id} stats: ${err.message}`);
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
	`${JSON.stringify({ generatedAt: now, sources: ["https://blockchair.com", "https://www.coingecko.com", "https://solana.com/docs/rpc", "https://api.kaspa.org", "https://koios.rest"], chains }, null, "\t")}\n`,
);
console.log(
	`metrics: ${Object.keys(chains).length} chains, bch height ${chains.bch.height}`,
);

#!/usr/bin/env node
// Builds src/data/utxo-stats.json for /what-is-a-utxo: coin-days destroyed,
// supply by coin age (HODL waves) and dormant-coin awakenings, per UTC day.
//
// Source: your own Bitcoin Cash Node (BCHN >= 29), nothing else.
//   - getblock verbosity 3 gives every input's prevout height and value.
//   - gettxoutsetinfo with -coinstatsindex gives the node's own UTXO-set total
//     at any height. The script checks its own coin accounting against it every
//     day, so the charts are reproducible from any unpruned node.
//
// Node flags: -coinstatsindex=1 and no pruning (verbosity 3 needs undo data).
// Env: BCH_RPC_URL, e.g. http://user:pass@127.0.0.1:8332
//
// Incremental: the output file carries its own cursor and state, so a run
// processes only the blocks since the last run. The first backfill from
// genesis reads ~1M blocks: run it on the node's host, not in CI.
//   BCH_RPC_URL=... node scripts/utxo-stats.mjs [--budget-minutes 50]
import { readFile, writeFile } from "node:fs/promises";

const OUT = "src/data/utxo-stats.json";
const CONFIRMATIONS = 6; // never process the last 6 blocks, so no reorg reaches us
const SAT = 1e8;
const DAY = 86400;
const YEAR_DAYS = 365.25;
// Age bands, in days, for the supply-by-age chart. Upper bounds; last is open.
const BANDS = [
	{ id: "lt1m", label: "< 1 month", max: 30 },
	{ id: "1m1y", label: "1 month – 1 year", max: 365 },
	{ id: "1y3y", label: "1 – 3 years", max: 3 * 365 },
	{ id: "3y7y", label: "3 – 7 years", max: 7 * 365 },
	{ id: "gt7y", label: "7+ years", max: Number.POSITIVE_INFINITY },
];
// An awakening: one transaction spends >= 10 BCH of coins aged >= 3 years.
const AWAKE_MIN_AGE_DAYS = Math.round(3 * YEAR_DAYS);
const AWAKE_MIN_SATS = 10 * SAT;
const AWAKE_KEEP = 300;
// BIP30: these two coinbases re-used earlier coinbase txids and overwrote
// them, so 2 × 50 BCH left the UTXO set for good. The node counts it; so do we.
const BIP30 = { 91842: 91812, 91880: 91722 };

const args = process.argv.slice(2);
const budgetArg = args.indexOf("--budget-minutes");
const budgetMs =
	budgetArg >= 0
		? Number(args[budgetArg + 1]) * 60_000
		: Number.POSITIVE_INFINITY;
const started = Date.now();

const rpcUrl = process.env.BCH_RPC_URL;
if (!rpcUrl) {
	console.error(
		"utxo-stats: BCH_RPC_URL is not set (http://user:pass@host:8332).",
	);
	process.exit(1);
}
const url = new URL(rpcUrl);
const auth = `Basic ${Buffer.from(`${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`).toString("base64")}`;
url.username = "";
url.password = "";

let rpcId = 0;
async function rpc(method, params = []) {
	const res = await fetch(url, {
		method: "POST",
		headers: { "content-type": "application/json", authorization: auth },
		body: JSON.stringify({ jsonrpc: "1.0", id: ++rpcId, method, params }),
		signal: AbortSignal.timeout(300_000),
	});
	const body = await res.json().catch(() => null);
	if (!body) throw new Error(`${method}: HTTP ${res.status}`);
	if (body.error) throw new Error(`${method}: ${body.error.message}`);
	return body.result;
}

const sats = (bch) => Math.round(bch * SAT);
const isoDay = (dayIndex) =>
	new Date((genesisDay + dayIndex) * DAY * 1000).toISOString().slice(0, 10);
// OP_RETURN and oversized scripts never enter the UTXO set.
const unspendable = (spk) =>
	spk.hex.startsWith("6a") || spk.hex.length > 20_000;

const previous = JSON.parse(await readFile(OUT, "utf8").catch(() => "null"));
const genesis = await rpc("getblockheader", [await rpc("getblockhash", [0])]);
const genesisDay = Math.floor(genesis.mediantime / DAY);

// State. dayStart[k] = first height whose median-time day is >= k (median
// time never decreases, so this is sorted). supplyByDay[k] = sats still
// unspent that were created on day k.
const fresh = !previous?.cursor;
const state = fresh ? { dayStart: [0], supplyByDay: [0] } : previous.state;
const rows = fresh ? [] : previous.rows;
let awakenings = fresh ? [] : previous.awakenings;
let cursor = fresh ? { height: 0, hash: genesis.hash } : previous.cursor;

if ((await rpc("getblockhash", [cursor.height])) !== cursor.hash) {
	console.error(
		`utxo-stats: block ${cursor.height} is no longer ${cursor.hash}. A reorg deeper than ${CONFIRMATIONS} blocks; delete ${OUT} and rebuild.`,
	);
	process.exit(1);
}

function dayOf(height) {
	const ds = state.dayStart;
	let lo = 0;
	let hi = ds.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (ds[mid] <= height) lo = mid;
		else hi = mid - 1;
	}
	return lo;
}

// The day being accumulated (not yet emitted as a row).
let openDay = state.dayStart.length - 1;
let acc = previous?.open ?? { cdd: 0, revived: 0 };

function bandsAt(day) {
	const out = BANDS.map(() => 0);
	const s = state.supplyByDay;
	for (let k = 0; k <= day && k < s.length; k++) {
		if (!s[k]) continue;
		const age = day - k;
		out[BANDS.findIndex((b) => age < b.max)] += s[k];
	}
	return out;
}

async function closeDay(lastHeight) {
	const bands = bandsAt(openDay);
	const tracked = bands.reduce((a, b) => a + b, 0);
	const info = await rpc("gettxoutsetinfo", ["none", lastHeight, true]);
	const nodeSupply = sats(info.total_amount);
	if (nodeSupply !== tracked) {
		throw new Error(
			`supply check failed at height ${lastHeight}: tracked ${tracked} sats, coinstatsindex ${nodeSupply} sats`,
		);
	}
	// [date, height, supplySats, coinDaysDestroyed, revivedSats(>=3y), ...bandSats]
	rows.push([
		isoDay(openDay),
		lastHeight,
		nodeSupply,
		Math.round(acc.cdd),
		acc.revived,
		...bands,
	]);
	acc = { cdd: 0, revived: 0 };
}

async function save(tipHeight) {
	const node = await rpc("getnetworkinfo");
	const last = rows.at(-1);
	const out = {
		generatedAt: new Date().toISOString(),
		source: {
			node: node.subversion,
			method: "getblock verbosity 3 + gettxoutsetinfo (coinstatsindex)",
			confirmations: CONFIRMATIONS,
		},
		bands: BANDS.map(({ id, label }) => ({ id, label })),
		columns: [
			"date",
			"height",
			"supply",
			"cdd",
			"revived3y",
			...BANDS.map((b) => b.id),
		],
		verified: last
			? { height: last[1], supplySats: last[2], matchesCoinstatsindex: true }
			: null,
		tip: tipHeight,
		rows,
		awakenings,
		cursor,
		open: acc,
		state,
	};
	await writeFile(OUT, `${JSON.stringify(out)}\n`);
	console.log(
		`utxo-stats: height ${cursor.height}, ${rows.length} days, ${awakenings.length} awakenings → ${OUT}`,
	);
}

function processBlock(block) {
	const day = Math.floor(block.mediantime / DAY) - genesisDay;
	while (state.dayStart.length <= day) {
		state.dayStart.push(block.height);
		state.supplyByDay.push(0);
	}
	const s = state.supplyByDay;
	for (const tx of block.tx) {
		let oldSats = 0;
		let oldestDay = day;
		for (const vin of tx.vin) {
			if (!vin.prevout) {
				if (vin.coinbase !== undefined) continue;
				throw new Error(
					`block ${block.height}: input without prevout (pruned node?)`,
				);
			}
			const v = sats(vin.prevout.value);
			const born = dayOf(vin.prevout.height);
			s[born] -= v;
			const age = day - born;
			acc.cdd += (v / SAT) * age;
			if (age >= AWAKE_MIN_AGE_DAYS) {
				oldSats += v;
				oldestDay = Math.min(oldestDay, born);
			}
		}
		acc.revived += oldSats;
		if (oldSats >= AWAKE_MIN_SATS) {
			awakenings.push({
				txid: tx.txid,
				height: block.height,
				date: isoDay(day),
				sats: oldSats,
				since: isoDay(oldestDay),
				years: Math.round(((day - oldestDay) / YEAR_DAYS) * 10) / 10,
			});
		}
		for (const vout of tx.vout) {
			if (!unspendable(vout.scriptPubKey)) s[day] += sats(vout.value);
		}
	}
	const overwritten = BIP30[block.height];
	if (overwritten !== undefined) s[dayOf(overwritten)] -= 50 * SAT;
	return day;
}

const tip = await rpc("getblockcount");
const target = tip - CONFIRMATIONS;
const AHEAD = 4;
const queue = new Map();
const fetchBlock = (h) =>
	rpc("getblockhash", [h]).then((hash) => rpc("getblock", [hash, 3]));
let nextFetch = cursor.height + 1;
let lastSave = Date.now();

while (cursor.height < target) {
	if (Date.now() - started > budgetMs) {
		console.log("utxo-stats: time budget spent; the next run continues.");
		break;
	}
	while (nextFetch <= target && queue.size < AHEAD) {
		queue.set(nextFetch, fetchBlock(nextFetch));
		nextFetch++;
	}
	const h = cursor.height + 1;
	const block = await queue.get(h);
	queue.delete(h);
	if (block.previousblockhash !== cursor.hash) {
		throw new Error(`block ${h} does not extend ${cursor.hash}`);
	}
	const day = Math.floor(block.mediantime / DAY) - genesisDay;
	// A later day starts: emit every day up to it (days without blocks repeat).
	while (openDay < day) {
		await closeDay(cursor.height);
		openDay++;
	}
	processBlock(block);
	cursor = { height: block.height, hash: block.hash };
	if (Date.now() - lastSave > 120_000) {
		await save(tip);
		lastSave = Date.now();
	}
}

awakenings = awakenings.slice(-AWAKE_KEEP);
await save(tip);

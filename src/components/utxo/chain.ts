// Turns raw Fulcrum transactions into coins: what a transaction consumed,
// what it minted, and where each coin came from.
import { Electrum } from "./electrum";

export const SAT = 100_000_000;
// Last block before the August 2017 split: coins born at or before it exist
// on both the BCH and BTC ledgers.
export const SPLIT_HEIGHT = 478_558;
export const SPLIT_TIME = 1_501_593_374; // 2017-08-01 13:16 UTC (block 478558)

type RawVin = { txid?: string; vout?: number; coinbase?: string };
type RawVout = {
	n: number;
	value: number;
	scriptPubKey: { hex: string; type?: string; addresses?: string[] };
	tokenData?: {
		category: string;
		amount: string;
		nft?: { capability: string; commitment: string };
	};
};
type RawTx = {
	txid: string;
	size: number;
	time?: number;
	blocktime?: number;
	confirmations?: number;
	vin: RawVin[];
	vout: RawVout[];
};

export type Kind = "address" | "script" | "data";
export type Coin = {
	txid: string;
	n: number;
	sats: number;
	address: string | null;
	kind: Kind;
	token: { category: string; amount: string; nft: boolean } | null;
	born: number | null; // unix seconds of the block that created it
	height: number | null;
};
export type Status = "unspent" | "spent" | "unspendable" | "unknown";
export type TxView = {
	txid: string;
	time: number | null;
	height: number | null;
	size: number;
	coinbase: boolean;
	inputs: Coin[];
	outputs: Array<Coin & { status: Status }>;
	inSats: number | null;
	outSats: number;
	feeSats: number | null;
	missingInputs: number;
};
export type Hop = {
	coin: Coin; // the coin at this step of the trail
	spentAt: number | null; // when the next step spent it (null: unspent or unknown)
	coinbase: boolean; // coin was minted as a block reward
	parents: Coin[]; // inputs of the transaction that created it, largest first
	parentCount: number; // all inputs, including ones not loaded
};

const MAX_INPUTS = 150;
const MAX_PARENTS = 40;
const MAX_STATUS = 60;

export const client = new Electrum();
const txCache = new Map<string, Promise<RawTx>>();
let tip: Promise<number> | null = null;

export const isTxid = (s: string) => /^[0-9a-f]{64}$/i.test(s);
export const findTxid = (s: string) =>
	s.match(/[0-9a-f]{64}/i)?.[0].toLowerCase() ?? null;

function tipHeight() {
	tip ??= client
		.request<{ height: number }>("blockchain.headers.get_tip")
		.then((h) => h.height)
		.catch((e) => {
			tip = null;
			throw e;
		});
	return tip;
}

export function getTx(txid: string): Promise<RawTx> {
	let p = txCache.get(txid);
	if (!p) {
		p = client.request<RawTx>("blockchain.transaction.get", [txid, true]);
		p.catch(() => txCache.delete(txid));
		txCache.set(txid, p);
	}
	return p;
}

async function mapLimit<T, R>(
	items: T[],
	limit: number,
	fn: (t: T) => Promise<R>,
): Promise<R[]> {
	const out: R[] = new Array(items.length);
	let i = 0;
	const worker = async () => {
		while (i < items.length) {
			const k = i++;
			out[k] = await fn(items[k]);
		}
	};
	await Promise.all(
		Array.from({ length: Math.min(limit, items.length) }, worker),
	);
	return out;
}

const sats = (bch: number) => Math.round(bch * SAT);

async function heightOf(tx: RawTx): Promise<number | null> {
	if (!tx.confirmations) return null;
	return (await tipHeight()) - tx.confirmations + 1;
}

async function coinOf(tx: RawTx, n: number): Promise<Coin> {
	const o = tx.vout[n];
	if (!o) throw new Error(`${tx.txid} has no output ${n}`);
	const hex = o.scriptPubKey.hex;
	const kind: Kind = hex.startsWith("6a")
		? "data"
		: o.scriptPubKey.addresses?.length
			? "address"
			: "script";
	return {
		txid: tx.txid,
		n,
		sats: sats(o.value),
		address: o.scriptPubKey.addresses?.[0] ?? null,
		kind,
		token: o.tokenData
			? {
					category: o.tokenData.category,
					amount: o.tokenData.amount,
					nft: Boolean(o.tokenData.nft),
				}
			: null,
		born: tx.blocktime ?? null,
		height: await heightOf(tx),
	};
}

export async function getCoin(txid: string, n: number): Promise<Coin> {
	return coinOf(await getTx(txid), n);
}

async function inputsOf(tx: RawTx, cap: number) {
	const vins = tx.vin.filter((v) => v.txid);
	const coins = await mapLimit(vins.slice(0, cap), 8, (v) =>
		getCoin(v.txid as string, v.vout as number),
	);
	return { coins, total: vins.length };
}

async function statusOf(coin: Coin, confirmed: boolean): Promise<Status> {
	if (coin.kind === "data") return "unspendable";
	try {
		const info = await client.request<unknown>("blockchain.utxo.get_info", [
			coin.txid,
			coin.n,
		]);
		// For a transaction we know exists, a missing UTXO means it was spent.
		return info ? "unspent" : confirmed ? "spent" : "unknown";
	} catch {
		return "unknown";
	}
}

export async function loadTx(txid: string): Promise<TxView> {
	const tx = await getTx(txid);
	const coinbase = Boolean(tx.vin[0]?.coinbase);
	const { coins: inputs, total } = await inputsOf(tx, MAX_INPUTS);
	const outs = await Promise.all(tx.vout.map((o) => coinOf(tx, o.n)));
	const statuses = await mapLimit(outs.slice(0, MAX_STATUS), 8, (c) =>
		statusOf(c, Boolean(tx.confirmations)),
	);
	const outputs = outs.map((c, i) => ({
		...c,
		status: statuses[i] ?? ("unknown" as Status),
	}));
	const outSats = outputs.reduce((a, c) => a + c.sats, 0);
	const complete = inputs.length === total;
	const inSats = complete ? inputs.reduce((a, c) => a + c.sats, 0) : null;
	return {
		txid: tx.txid,
		time: tx.blocktime ?? null,
		height: await heightOf(tx),
		size: tx.size,
		coinbase,
		inputs,
		outputs,
		inSats,
		outSats,
		feeSats: coinbase || inSats === null ? null : inSats - outSats,
		missingInputs: total - inputs.length,
	};
}

export async function randomRecentTxid(): Promise<string> {
	const h = await tipHeight();
	for (let back = 0; back < 6; back++) {
		// Position 0 is the coinbase; take a random ordinary transaction.
		const pos = 1 + Math.floor(Math.random() * 8);
		try {
			const id = await client.request<string>(
				"blockchain.transaction.id_from_pos",
				[h - back, pos],
			);
			if (id) return id;
		} catch {
			// Block has fewer transactions than pos; try an older one.
		}
	}
	return client.request<string>("blockchain.transaction.id_from_pos", [h, 0]);
}

// Walks a coin's ancestry back through history. At each step it follows the
// largest input of the transaction that created the coin; to take another
// branch, start a new trace from that parent. Yields hops as they load.
export async function* trace(
	start: Coin,
	spentAt: number | null,
	maxHops = 25,
): AsyncGenerator<Hop> {
	let coin = start;
	let when = spentAt;
	for (let i = 0; i < maxHops; i++) {
		const tx = await getTx(coin.txid);
		const coinbase = Boolean(tx.vin[0]?.coinbase);
		const { coins, total } = coinbase
			? { coins: [], total: 0 }
			: await inputsOf(tx, MAX_PARENTS);
		const parents = [...coins].sort((a, b) => b.sats - a.sats);
		yield {
			coin,
			spentAt: when,
			coinbase,
			parents,
			parentCount: total,
		};
		if (coinbase || parents.length === 0) return;
		when = coin.born;
		coin = parents[0];
	}
}

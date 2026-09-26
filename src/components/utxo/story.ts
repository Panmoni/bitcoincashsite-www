// Turns a coin's trail into plain sentences. Pure functions, no DOM.
import { type Coin, type Hop, SAT, SPLIT_HEIGHT, type Status } from "./chain";

const YEAR = 365.25 * 86400;
const MONTH = YEAR / 12;

export const bch = (sats: number) => {
	const v = sats / SAT;
	if (v === 0) return "0 BCH";
	if (v >= 100)
		return `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })} BCH`;
	if (v >= 0.001)
		return `${Number(v.toPrecision(6)).toLocaleString("en-US", { maximumFractionDigits: 8 })} BCH`;
	return `${sats.toLocaleString("en-US")} sats`;
};

export const date = (t: number | null) =>
	t === null
		? "in the mempool"
		: new Date(t * 1000).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
				timeZone: "UTC",
			});

export const year = (t: number) => new Date(t * 1000).getUTCFullYear();

export function span(seconds: number): string {
	const s = Math.max(0, seconds);
	if (s < 90) return "under two minutes";
	const unit = (n: number, u: string) => `${n} ${u}${n === 1 ? "" : "s"}`;
	if (s < 3600) return unit(Math.round(s / 60), "minute");
	if (s < 2 * 86400) return unit(Math.round(s / 3600), "hour");
	if (s < 2 * MONTH) return unit(Math.round(s / 86400), "day");
	if (s < YEAR) return unit(Math.round(s / MONTH), "month");
	const y = Math.floor(s / YEAR);
	const m = Math.floor((s - y * YEAR) / MONTH);
	const ys = `${y} year${y === 1 ? "" : "s"}`;
	return m ? `${ys}, ${m} month${m === 1 ? "" : "s"}` : ys;
}

export const short = (txid: string) => `${txid.slice(0, 8)}…${txid.slice(-4)}`;

const now = () => Date.now() / 1000;
const preSplit = (c: Coin) => c.height !== null && c.height <= SPLIT_HEIGHT;

// One line that sums up a coin, for its card.
export function headline(
	coin: Coin,
	status: Status | "input",
	spentAt: number | null,
): string {
	if (coin.born === null) return "Born in the mempool, seconds ago.";
	if (status === "input" && spentAt !== null) {
		const nap = spentAt - coin.born;
		if (nap >= YEAR)
			return `Dormant since ${year(coin.born)}. This transaction woke it up after ${span(nap)}.`;
		return `Created ${span(nap)} before this transaction spent it.`;
	}
	if (status === "unspent") {
		const age = now() - coin.born;
		if (age >= YEAR) return `Dormant since ${year(coin.born)}. Still unspent.`;
		return "Unspent: it sits in the UTXO set right now.";
	}
	if (status === "spent") return "Spent since. It no longer exists.";
	if (status === "unspendable")
		return "Data, not money. No one can ever spend it.";
	return "";
}

export type Line = { text: string; tone?: "wake" | "origin" | "split" };

// The whole trail as a story, newest first, ending at the oldest hop loaded.
export function story(hops: Hop[], startStatus: Status | "input"): Line[] {
	if (!hops.length) return [];
	const lines: Line[] = [];
	const first = hops[0];
	const c0 = first.coin;
	lines.push({
		text: `This coin holds ${bch(c0.sats)}. It was created ${c0.born ? `on ${date(c0.born)}` : "moments ago"}${c0.height ? `, in block ${c0.height.toLocaleString("en-US")}` : ""}.`,
	});
	if (startStatus === "unspent" && c0.born) {
		const age = now() - c0.born;
		lines.push({
			text:
				age >= YEAR
					? `It has not moved in ${span(age)}. It is still sitting in the UTXO set, waiting for its owner's key.`
					: "Nobody has spent it yet. It is part of the UTXO set today.",
			tone: age >= YEAR ? "wake" : undefined,
		});
	} else if (startStatus === "input" && first.spentAt && c0.born) {
		const nap = first.spentAt - c0.born;
		lines.push({
			text:
				nap >= YEAR
					? `It had been dormant since ${year(c0.born)}. Then, on ${date(first.spentAt)}, someone woke it up: ${span(nap)} after it was made.`
					: `It was spent ${span(nap)} later, in the transaction you are looking at.`,
			tone: nap >= YEAR ? "wake" : undefined,
		});
	}

	let splitTold = preSplit(c0);
	if (splitTold) lines.push(splitLine());
	for (let i = 0; i < hops.length; i++) {
		const hop = hops[i];
		if (hop.coinbase) {
			lines.push({
				text: `The trail ends in block ${hop.coin.height?.toLocaleString("en-US") ?? "?"}, mined on ${date(hop.coin.born)}. It is a coinbase: new money, paid to the miner as the block reward. Before that, nothing.`,
				tone: "origin",
			});
			break;
		}
		const parent = hops[i + 1]?.coin;
		if (!parent) {
			if (hop.parentCount)
				lines.push({
					text: `The trail goes further back, through ${hop.parentCount} input${hop.parentCount === 1 ? "" : "s"}. Keep following to see more.`,
				});
			break;
		}
		// A run of quick hops reads as one line, not ten.
		let j = i;
		while (j + 1 < hops.length && !hops[j].coinbase && napAt(hops, j) < QUICK)
			j++;
		if (j - i >= 3) {
			const naps = Array.from({ length: j - i }, (_, k) => napAt(hops, i + k));
			const peel = hops.slice(i, j).every((h) => h.parentCount === 1);
			const from = date(hops[j].coin.born);
			const to = date(hop.coin.born);
			const when = from === to ? `all on ${to}` : `between ${from} and ${to}`;
			lines.push({
				text: `Before that, it moved ${j - i} times in quick succession, ${when}. It never rested longer than ${span(Math.max(...naps))}.${peel ? " Each step split one big coin into a payment and change: a peel chain, the pattern exchanges and payment processors leave." : ""}`,
			});
			if (
				!splitTold &&
				hops.slice(i + 1, j + 1).some((h) => preSplit(h.coin))
			) {
				splitTold = true;
				lines.push(splitLine());
			}
			i = j - 1;
			continue;
		}
		const merged =
			hop.parentCount > 1
				? `It was made by melting ${hop.parentCount} coins together. The biggest of them`
				: "It was made from a single coin, which";
		const nap = napAt(hops, i);
		lines.push({
			text: `${merged} held ${bch(parent.sats)} and was born on ${date(parent.born)}. It waited ${span(nap)} before it moved.`,
			tone: nap >= YEAR ? "wake" : undefined,
		});
		if (!splitTold && preSplit(parent)) {
			splitTold = true;
			lines.push(splitLine());
		}
	}
	return lines;
}

const QUICK = 30 * 86400;
// Seconds between the birth of hop i+1's coin and its spend (hop i's birth).
function napAt(hops: Hop[], i: number) {
	const a = hops[i].coin.born;
	const b = hops[i + 1]?.coin.born;
	return a !== null && b !== null && b !== undefined ? a - b : 0;
}

function splitLine(): Line {
	return {
		text: "From here back, the trail predates the August 2017 split. BCH and BTC shared one ledger then, so these coins exist on both chains.",
		tone: "split",
	};
}

// The longest nap on the trail: the time between a coin's birth and its spend.
export function longestNap(hops: Hop[]) {
	let best: { seconds: number; from: number; to: number } | null = null;
	const first = hops[0];
	if (first?.coin.born && first.spentAt)
		best = {
			seconds: first.spentAt - first.coin.born,
			from: first.coin.born,
			to: first.spentAt,
		};
	for (let i = 1; i < hops.length; i++) {
		const born = hops[i].coin.born;
		const spent = hops[i - 1].coin.born;
		if (born === null || spent === null) continue;
		const s = spent - born;
		if (!best || s > best.seconds) best = { seconds: s, from: born, to: spent };
	}
	return best;
}

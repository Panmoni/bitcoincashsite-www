// Turns a coin's trail into plain sentences. Pure functions, no DOM.
// Every sentence comes from the page locale's catalog, passed in as `f`.
import type { Messages } from "~/i18n/client";
import { type Coin, type Hop, SAT, SPLIT_HEIGHT, type Status } from "./chain";

/** The page's catalog and its Intl locale tag (src/i18n/locales.ts). */
export type Fmt = { t: Messages; intl: string };

const YEAR = 365.25 * 86400;
const MONTH = YEAR / 12;

export const bch = ({ t, intl }: Fmt, sats: number) => {
	const v = sats / SAT;
	if (v === 0) return t.utxo_amount_bch({ amount: (0).toLocaleString(intl) });
	if (v >= 100)
		return t.utxo_amount_bch({
			amount: v.toLocaleString(intl, { maximumFractionDigits: 2 }),
		});
	if (v >= 0.001)
		return t.utxo_amount_bch({
			amount: Number(v.toPrecision(6)).toLocaleString(intl, {
				maximumFractionDigits: 8,
			}),
		});
	return t.utxo_amount_sats({ count: sats, amount: sats.toLocaleString(intl) });
};

export const date = ({ t, intl }: Fmt, time: number | null) =>
	time === null
		? t.utxo_date_mempool({})
		: new Date(time * 1000).toLocaleDateString(intl, {
				year: "numeric",
				month: "long",
				day: "numeric",
				timeZone: "UTC",
			});

export const year = (t: number) => new Date(t * 1000).getUTCFullYear();

export function span({ t }: Fmt, seconds: number): string {
	const s = Math.max(0, seconds);
	if (s < 90) return t.utxo_span_under_two_minutes({});
	if (s < 3600) return t.utxo_span_minutes({ count: Math.round(s / 60) });
	if (s < 2 * 86400) return t.utxo_span_hours({ count: Math.round(s / 3600) });
	if (s < 2 * MONTH) return t.utxo_span_days({ count: Math.round(s / 86400) });
	if (s < YEAR) return t.utxo_span_months({ count: Math.round(s / MONTH) });
	const y = Math.floor(s / YEAR);
	const m = Math.floor((s - y * YEAR) / MONTH);
	const years = t.utxo_span_years({ count: y });
	return m
		? t.utxo_span_years_months({
				years,
				months: t.utxo_span_months({ count: m }),
			})
		: years;
}

export const short = (txid: string) => `${txid.slice(0, 8)}…${txid.slice(-4)}`;

const now = () => Date.now() / 1000;
const preSplit = (c: Coin) => c.height !== null && c.height <= SPLIT_HEIGHT;

// One line that sums up a coin, for its card.
export function headline(
	f: Fmt,
	coin: Coin,
	status: Status | "input",
	spentAt: number | null,
): string {
	const { t } = f;
	if (coin.born === null) return t.utxo_headline_mempool({});
	if (status === "input" && spentAt !== null) {
		const nap = spentAt - coin.born;
		if (nap >= YEAR)
			return t.utxo_headline_woken({
				year: year(coin.born),
				span: span(f, nap),
			});
		return t.utxo_headline_created_before({ span: span(f, nap) });
	}
	if (status === "unspent") {
		const age = now() - coin.born;
		if (age >= YEAR)
			return t.utxo_headline_dormant_unspent({ year: year(coin.born) });
		return t.utxo_headline_unspent({});
	}
	if (status === "spent") return t.utxo_headline_spent({});
	if (status === "unspendable") return t.utxo_headline_unspendable({});
	return "";
}

export type Line = { text: string; tone?: "wake" | "origin" | "split" };

// The whole trail as a story, newest first, ending at the oldest hop loaded.
export function story(
	f: Fmt,
	hops: Hop[],
	startStatus: Status | "input",
): Line[] {
	if (!hops.length) return [];
	const { t, intl } = f;
	const lines: Line[] = [];
	const first = hops[0];
	const c0 = first.coin;
	const amount = bch(f, c0.sats);
	const height = c0.height?.toLocaleString(intl);
	lines.push({
		text: c0.born
			? height
				? t.utxo_story_created_on_in_block({
						amount,
						date: date(f, c0.born),
						height,
					})
				: t.utxo_story_created_on({ amount, date: date(f, c0.born) })
			: height
				? t.utxo_story_created_moments_in_block({ amount, height })
				: t.utxo_story_created_moments({ amount }),
	});
	if (startStatus === "unspent" && c0.born) {
		const age = now() - c0.born;
		lines.push({
			text:
				age >= YEAR
					? t.utxo_story_unmoved({ span: span(f, age) })
					: t.utxo_story_unspent_today({}),
			tone: age >= YEAR ? "wake" : undefined,
		});
	} else if (startStatus === "input" && first.spentAt && c0.born) {
		const nap = first.spentAt - c0.born;
		lines.push({
			text:
				nap >= YEAR
					? t.utxo_story_woken({
							year: year(c0.born),
							date: date(f, first.spentAt),
							span: span(f, nap),
						})
					: t.utxo_story_spent_later({ span: span(f, nap) }),
			tone: nap >= YEAR ? "wake" : undefined,
		});
	}

	let splitTold = preSplit(c0);
	if (splitTold) lines.push(splitLine(f));
	for (let i = 0; i < hops.length; i++) {
		const hop = hops[i];
		if (hop.coinbase) {
			lines.push({
				text: t.utxo_story_coinbase({
					height: hop.coin.height?.toLocaleString(intl) ?? "?",
					date: date(f, hop.coin.born),
				}),
				tone: "origin",
			});
			break;
		}
		const parent = hops[i + 1]?.coin;
		if (!parent) {
			if (hop.parentCount)
				lines.push({
					text: t.utxo_story_further_back({ count: hop.parentCount }),
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
			const from = date(f, hops[j].coin.born);
			const to = date(f, hop.coin.born);
			const count = j - i;
			const rest = span(f, Math.max(...naps));
			const moved =
				from === to
					? t.utxo_story_quick_same_day({ count, date: to, span: rest })
					: t.utxo_story_quick_between({ count, from, to, span: rest });
			lines.push({
				text: peel
					? t.utxo_story_with_peel_chain({
							moved,
							peel: t.utxo_story_peel_chain({}),
						})
					: moved,
			});
			if (
				!splitTold &&
				hops.slice(i + 1, j + 1).some((h) => preSplit(h.coin))
			) {
				splitTold = true;
				lines.push(splitLine(f));
			}
			i = j - 1;
			continue;
		}
		const nap = napAt(hops, i);
		const held = {
			amount: bch(f, parent.sats),
			date: date(f, parent.born),
			span: span(f, nap),
		};
		lines.push({
			text:
				hop.parentCount > 1
					? t.utxo_story_melted({ count: hop.parentCount, ...held })
					: t.utxo_story_single_parent(held),
			tone: nap >= YEAR ? "wake" : undefined,
		});
		if (!splitTold && preSplit(parent)) {
			splitTold = true;
			lines.push(splitLine(f));
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

function splitLine({ t }: Fmt): Line {
	return { text: t.utxo_story_split({}), tone: "split" };
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

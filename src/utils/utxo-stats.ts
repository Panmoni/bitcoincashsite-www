// Reads src/data/utxo-stats.json (written by scripts/utxo-stats.mjs from our
// own BCHN node) and shapes it for the /what-is-a-utxo charts.
import raw from "~/data/utxo-stats.json";

// [date, height, supplySats, cdd, revived3ySats, ...bandSats]
type Row = [string, number, number, number, number, ...number[]];
type Awakening = {
	txid: string;
	height: number;
	date: string;
	sats: number;
	since: string;
	years: number;
};
type Stats = {
	generatedAt: string | null;
	source?: { node: string; method: string; confirmations: number };
	bands: Array<{ id: string; label: string }>;
	verified: {
		height: number;
		supplySats: number;
		matchesCoinstatsindex: boolean;
	} | null;
	rows: Row[];
	awakenings: Awakening[];
};

const stats = raw as unknown as Stats;
const SAT = 1e8;

export const utxoStats = stats;
export const hasStats = stats.rows.length > 0;

// Weekly series: last snapshot of each 7-day block for stocks (supply, bands),
// sums for flows (coin-days destroyed, revived coins). Values in BCH.
export function weeklySeries() {
	const out = {
		dates: [] as string[],
		supply: [] as number[],
		cdd: [] as number[],
		revived: [] as number[],
		bands: stats.bands.map(() => [] as number[]),
	};
	for (let i = 0; i < stats.rows.length; i += 7) {
		const chunk = stats.rows.slice(i, i + 7);
		const last = chunk[chunk.length - 1];
		out.dates.push(last[0]);
		out.supply.push(last[2] / SAT);
		out.cdd.push(chunk.reduce((a, r) => a + r[3], 0));
		out.revived.push(chunk.reduce((a, r) => a + r[4], 0) / SAT);
		stats.bands.forEach((_, b) => {
			out.bands[b].push((last[5 + b] as number) / SAT);
		});
	}
	return out;
}

export function summary() {
	const rows = stats.rows;
	const last = rows[rows.length - 1];
	if (!last) return null;
	const month = rows.slice(-30);
	const since = month[0][0];
	const bands = stats.bands.map((b, i) => ({
		...b,
		bch: (last[5 + i] as number) / SAT,
	}));
	return {
		date: last[0],
		height: last[1],
		supply: last[2] / SAT,
		bands,
		cdd30: month.reduce((a, r) => a + r[3], 0),
		awakenings30: stats.awakenings.filter((a) => a.date >= since).length,
	};
}

export function topAwakenings(n = 10) {
	return [...stats.awakenings].sort((a, b) => b.sats - a.sats).slice(0, n);
}

export function recentAwakenings(n = 10) {
	return [...stats.awakenings].reverse().slice(0, n);
}

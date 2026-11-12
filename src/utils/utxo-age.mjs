// Age of the UTXO-set snapshot (src/data/utxo-stats.json `generatedAt`).
// Shared by the /what-is-a-utxo page (build and browser) and the daily
// refresh job's check (scripts/check-utxo-fresh.mjs), so both agree on
// when the charts count as stale.

export const UTXO_STALE_DAYS = 3;
const DAY = 86_400_000;

/**
 * @param {string | null | undefined} generatedAt ISO timestamp, or null before the first backfill.
 * @param {number} [now] epoch ms; pass a fixed value in tests.
 * @returns {{ days: number, stale: boolean } | null} null when there is no usable date.
 */
export function utxoAge(generatedAt, now = Date.now()) {
	if (!generatedAt) return null;
	const t = Date.parse(generatedAt);
	if (Number.isNaN(t)) return null;
	const days = (now - t) / DAY;
	return { days, stale: days > UTXO_STALE_DAYS };
}

/**
 * Verdict for the refresh job. An empty file (generatedAt null) passes:
 * the pipeline has not published yet, which is not a failure.
 * @param {{ generatedAt?: string | null }} stats
 * @param {number} [now]
 * @returns {{ ok: boolean, message: string }}
 */
export function checkUtxoFreshness(stats, now = Date.now()) {
	const age = utxoAge(stats.generatedAt, now);
	if (!age) {
		if (stats.generatedAt) {
			return {
				ok: false,
				message: `utxo-stats.json generatedAt is not a date: ${stats.generatedAt}`,
			};
		}
		return {
			ok: true,
			message:
				"utxo-stats.json is empty (generatedAt: null); nothing to check.",
		};
	}
	const days = age.days.toFixed(1);
	if (age.stale) {
		return {
			ok: false,
			message: `UTXO stats are stale: generatedAt ${stats.generatedAt} is ${days} days old (limit ${UTXO_STALE_DAYS}).`,
		};
	}
	return {
		ok: true,
		message: `UTXO stats are fresh: generatedAt ${stats.generatedAt} is ${days} days old.`,
	};
}

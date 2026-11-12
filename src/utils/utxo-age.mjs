// Age of the UTXO-set data in src/data/utxo-stats.json. Shared by the
// /what-is-a-utxo page (build and browser) and the daily refresh job's check
// (scripts/check-utxo-fresh.mjs), so both agree on when the charts are stale.
//
// Age runs from the end of the newest daily row, not from `generatedAt`:
// utxo-stats.mjs saves every 2 minutes and again when its time budget runs
// out, so a run that fails or stalls while catching up still writes a fresh
// `generatedAt` over data that is days behind.

export const UTXO_STALE_DAYS = 3;
const DAY = 86_400_000;

/**
 * The day the data covers up to, and the instant that day ended (UTC).
 * @param {{ rows?: Array<[string, ...unknown[]]> }} stats
 * @returns {{ day: string, end: string } | null} null for the empty file.
 */
export function utxoDataAsOf(stats) {
	const day = stats.rows?.at(-1)?.[0];
	const t = typeof day === "string" ? Date.parse(`${day}T00:00:00Z`) : NaN;
	if (Number.isNaN(t)) return null;
	return { day, end: new Date(t + DAY).toISOString() };
}

/**
 * @param {string | null | undefined} end ISO instant the data ends (utxoDataAsOf().end).
 * @param {number} [now] epoch ms; pass a fixed value in tests.
 * @returns {{ days: number, stale: boolean } | null} null when there is no usable date.
 */
export function utxoAge(end, now = Date.now()) {
	const t = end ? Date.parse(end) : NaN;
	if (Number.isNaN(t)) return null;
	const days = (now - t) / DAY;
	return { days, stale: days > UTXO_STALE_DAYS };
}

/**
 * Verdict for the refresh job. The empty file (no rows, generatedAt null)
 * passes: the pipeline has not published yet, which is not a failure.
 * @param {{ generatedAt?: string | null, rows?: Array<[string, ...unknown[]]> }} stats
 * @param {number} [now]
 * @returns {{ ok: boolean, message: string }}
 */
export function checkUtxoFreshness(stats, now = Date.now()) {
	const asOf = utxoDataAsOf(stats);
	if (!asOf) {
		if (stats.rows?.length) {
			return {
				ok: false,
				message: `utxo-stats.json newest row has no valid date: ${stats.rows.at(-1)?.[0]}`,
			};
		}
		return {
			ok: true,
			message: "utxo-stats.json has no rows yet; nothing to check.",
		};
	}
	const age = utxoAge(asOf.end, now);
	const days = age.days.toFixed(1);
	if (age.stale) {
		return {
			ok: false,
			message: `UTXO stats are stale: the newest row (${asOf.day}) ended ${days} days ago (limit ${UTXO_STALE_DAYS}).`,
		};
	}
	return {
		ok: true,
		message: `UTXO stats are fresh: the newest row (${asOf.day}) ended ${days} days ago.`,
	};
}

// Fails the refresh job when the newest row in src/data/utxo-stats.json ended
// more than UTXO_STALE_DAYS ago, so GitHub emails the failure instead of the
// /what-is-a-utxo charts going quietly stale.
// Usage: node scripts/check-utxo-fresh.mjs [path-to-utxo-stats.json]
import { readFileSync } from "node:fs";
import { checkUtxoFreshness } from "../src/utils/utxo-age.mjs";

const file = process.argv[2] ?? "src/data/utxo-stats.json";
let result;
try {
	result = checkUtxoFreshness(JSON.parse(readFileSync(file, "utf8")));
} catch (err) {
	result = { ok: false, message: `cannot read ${file}: ${err.message}` };
}
if (result.ok) {
	console.log(result.message);
} else {
	console.log(`::error::${result.message}`);
	process.exit(1);
}

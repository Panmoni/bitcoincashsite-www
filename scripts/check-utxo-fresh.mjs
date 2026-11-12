// Fails the refresh job when src/data/utxo-stats.json is more than
// UTXO_STALE_DAYS old after the UTXO step, so GitHub emails the failure
// instead of the /what-is-a-utxo charts going quietly stale.
// Usage: node scripts/check-utxo-fresh.mjs [path-to-utxo-stats.json]
import { readFileSync } from "node:fs";
import { checkUtxoFreshness } from "../src/utils/utxo-age.mjs";

const file = process.argv[2] ?? "src/data/utxo-stats.json";
const result = checkUtxoFreshness(JSON.parse(readFileSync(file, "utf8")));
if (result.ok) {
	console.log(result.message);
} else {
	console.log(`::error::${result.message}`);
	process.exit(1);
}

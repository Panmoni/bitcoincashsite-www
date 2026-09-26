# Site data

All reference data lives in git as Astro content collections
(`src/content.config.ts`). There is no database.

| File / folder | Collection | Written by |
|---|---|---|
| `projects.json` | `projects` — directory, wallet matrix, every resource list on /buy /spend /earn /build… | people, via PR |
| `health.json` | `health` — alive / stale / dead per project | `scripts/health-check.mjs`, daily |
| `metrics.json` | (imported) — chain stats for Real Numbers and vitals | `scripts/metrics.mjs`, daily |
| `utxo-stats.json` | (imported) — UTXO-set analytics on /what-is-a-utxo: supply by age, coin-days destroyed, awakenings | `scripts/utxo-stats.mjs`, daily, from our BCHN node |
| `opcodes.json` | `opcodes` | people |
| `glossary.json` | `glossary` | people |
| `src/content/upgrades/` | `upgrades` | people |
| `src/content/chips/` | `chips` | people |
| `src/content/compare/`, `guides/`, `reference/` | long-form pages | people |
| `src/content/reports/` | `reports` — State of BCH | `pnpm report:draft`, then people |

## Freshness

Every human-written entry has `verified: YYYY-MM-DD`: the day someone last
checked it against its `sources`. The `Freshness` badge shows it: green under
90 days, yellow under a year, pink after. Re-verify an entry by checking it
and bumping the date. Machine data shows its snapshot time instead.

## Daily refresh

`.github/workflows/refresh-data.yml` runs the scripts at 06:17 UTC and
commits `health.json`, `metrics.json` and `utxo-stats.json`. The push triggers
the Cloudflare rebuild, so the static pages carry the new data. Run them locally
with `pnpm data:metrics`, `pnpm data:health` and `pnpm data:utxo`.

`utxo-stats.json` needs a Bitcoin Cash Node (29+) with `-coinstatsindex` and
no pruning, reached through the `BCH_RPC_URL` secret
(`http://user:pass@host:8332`). The file carries its own cursor, so each run
reads only new blocks. The first backfill from genesis reads every block: run
`BCH_RPC_URL=http://user:pass@127.0.0.1:8332 pnpm data:utxo` on the node host
and commit the result. If its coin count ever differs from the node's
`coinstatsindex` total, the job fails and publishes nothing.

## Why collections, not Postgres

- **The data is small and slow-moving.** ~400 projects, ~200 opcodes; people
  edit it a few times a week. Git is the right store for that.
- **PRs are the moderation queue.** Anyone can propose a project; review and
  history come free. A database needs an admin UI and auth to match that.
- **The site stays static.** No server, no connection string, no outage mode.
  Zod validates every entry at build, so bad data fails the build, not the page.
- **The only fast-changing data is machine-made** (health, metrics). A nightly
  job writing JSON covers it. Truly live data (mempool, DSProofs, ABLA) belongs
  to the planned `api.bchworks.com` service (strategy Pillar A), not this repo.

Revisit if user submissions without GitHub, per-visitor data, or sub-daily
refresh become requirements.

---
title: "Bitcoin Cash vs Kaspa (BCH vs KAS)"
description: "BCH vs KAS: 10-minute blocks vs a 10-blocks-per-second blockDAG, CashTokens vs Kaspa's new covenants, and what each proof-of-work chain does best."
lang: en
verified: 2026-09-26
rival: "Kaspa"
ticker: "KAS"
faq:
  - q: "Is Kaspa faster than Bitcoin Cash?"
    a: "Yes, for confirmations. Kaspa produces 10 blocks per second on a blockDAG, so a transaction gets its first confirmation in about a second. Bitcoin Cash targets one block every 10 minutes. BCH payments still appear in wallets within seconds as unconfirmed transactions, protected by double-spend proofs, but they are not confirmed that fast."
  - q: "Does Kaspa have smart contracts?"
    a: "Yes, since the Toccata hard fork activated on June 30, 2026. It added covenant-style contracts, native token issuance, zero-knowledge proof verification opcodes and the SilverScript contract language. Bitcoin Cash has run UTXO covenants since its 2022 introspection upgrade and native tokens since 2023."
  - q: "Is Bitcoin Cash better than Kaspa?"
    a: "They fit different needs. Kaspa leads on confirmation speed and has a fresh fair-launch story. Bitcoin Cash has a longer track record, Bitcoin's SHA-256 mining and history, and a contract platform that has shipped upgrades every May since 2022. Pick by what your application needs."
  - q: "What is GHOSTDAG?"
    a: "GHOSTDAG is Kaspa's consensus protocol. Instead of discarding blocks mined at the same time, it keeps them all and orders them in a directed acyclic graph (a blockDAG). That lets Kaspa run many blocks per second without wasting work on orphans."
  - q: "What is DAGKnight?"
    a: "DAGKnight is Kaspa's planned successor to GHOSTDAG. As of September 2026 it is the next item on Kaspa's roadmap after Toccata and has no fixed activation date."
  - q: "What is the max supply of Kaspa vs Bitcoin Cash?"
    a: "Kaspa has a fixed maximum supply of about 28.7 billion KAS. Bitcoin Cash has a fixed cap of 21 million BCH."
sources:
  - title: "LORE (Kaspa.org)"
    url: "https://kaspa.org/lore"
  - title: "What is Kaspa (KAS)? The Fastest Proof-of-Work Blockchain (Coinstancy)"
    url: "https://coinstancy.com/academy/guides/kaspa/"
  - title: "Kaspa in 2025: Crescendo Hard Fork Leads Major Updates (BSC News)"
    url: "https://bsc.news/post/kaspa-crescendo-hard-fork-updates"
  - title: "Kaspa Price Jumps 10% as Toccata Hard Fork Introduces Smart Contracts (CoinAlertNews)"
    url: "https://coinalertnews.com/news/2026/06/30/kaspa-toccata-hard-fork-upgrade"
  - title: "Kaspa Roadmap 2026-2027 (Our Crypto Talk)"
    url: "https://ourcryptotalk.com/blog/kaspa-roadmap-2026-2027"
  - title: "Bitcoin Cash (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bitcoin_Cash"
  - title: "BCH upgrade specifications (Bitcoin Cash Node)"
    url: "https://upgradespecs.bitcoincashnode.org/"
  - title: "2022-05-15 upgrade: introspection and 64-bit integers (BCHN)"
    url: "https://upgradespecs.bitcoincashnode.org/2022-05-15-upgrade/"
  - title: "2023-05-15 upgrade: CashTokens (BCHN)"
    url: "https://upgradespecs.bitcoincashnode.org/2023-05-15-upgrade/"
  - title: "2024-05-15 upgrade: ABLA (BCHN)"
    url: "https://upgradespecs.bitcoincashnode.org/2024-05-15-upgrade/"
  - title: "2025-05-15 upgrade: VM Limits and BigInt (BCHN)"
    url: "https://upgradespecs.bitcoincashnode.org/2025-05-15-upgrade/"
  - title: "2026-05-15 upgrade: loops, functions, bitwise, P2S (BCHN)"
    url: "https://upgradespecs.bitcoincashnode.org/2026-05-15-upgrade/"
  - title: "Double-spend proofs specification (BCHN)"
    url: "https://upgradespecs.bitcoincashnode.org/dsproof/"
  - title: "CHIP-2023-04 Adaptive Blocksize Limit Algorithm"
    url: "https://gitlab.com/0353F40E/ebaa/-/raw/main/README.md"
  - title: "CashTokens specification"
    url: "https://github.com/cashtokens/cashtokens"
  - title: "CHIP-2025-03 Faster Blocks for Bitcoin Cash (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-for-bitcoin-cash/1513/189"
---

Bitcoin Cash and Kaspa are both proof-of-work, UTXO-based chains. They have no shared history. BCH descends from Bitcoin and keeps Bitcoin's 10-minute chain of blocks. Kaspa started from scratch with a different structure: a blockDAG that accepts many blocks at once.

## Two different starting points

Bitcoin Cash split from Bitcoin on August 1, 2017. It inherited Bitcoin's full history, SHA-256 mining and 21 million cap. Since 2022 it has used a yearly May upgrade to extend Bitcoin Script into a full contract platform.

Kaspa launched on November 7, 2021, as a fair launch: no premine, no ICO and no founder allocation. It uses the GHOSTDAG protocol. In a normal chain, two blocks found at the same moment compete and one is thrown away. GHOSTDAG keeps both and orders them in a directed acyclic graph. That design lets Kaspa run far more blocks per second.

Kaspa has moved fast in two years:

- **Crescendo, May 5, 2025:** block rate went from 1 to 10 blocks per second. The node was rewritten in Rust to make this possible.
- **Toccata, June 30, 2026:** Kaspa gained covenant-style contracts on layer 1, native token issuance, zero-knowledge proof verification opcodes and SilverScript, a high-level contract language.
- **Next:** DAGKnight, a successor consensus protocol, is the planned follow-up to Toccata. It has no fixed date. Kaspa's roadmap names 100 blocks per second as a long-term target. VProgs, a broader programmability layer, is still in research.

## Design differences

| | Bitcoin Cash (BCH) | Kaspa (KAS) |
|---|---|---|
| Launch | Aug 2017, split from Bitcoin | Nov 2021, fair launch |
| Structure | Chain of blocks | BlockDAG (GHOSTDAG) |
| Block time | 10 minutes | 10 blocks per second (since May 2025) |
| Block size policy | 32 MB floor; [ABLA](/glossary#abla) raises the limit with sustained demand | Many small blocks; capacity comes from block rate |
| Fee model | Per-byte fees | Transaction fees |
| Smart contracts | [Covenants](/glossary#covenant) since 2022; loops and functions since 2026 | Covenants since Toccata (June 2026); SilverScript language |
| Tokens | Native [CashTokens](/cashtokens) (2023) | Native token issuance (Toccata, 2026) |
| Zero-knowledge | Possible in script with BigInt math; no dedicated opcode | Dedicated ZK verification opcodes (Toccata) |
| Unconfirmed payments | [Zero-conf](/glossary#zero-conf) with [double-spend proofs](/glossary#dsproof) | First confirmation in about a second |
| Privacy | Transparent; optional [CashFusion](/glossary#cashfusion) | Transparent |
| Consensus / mining | SHA-256 proof of work | kHeavyHash proof of work |
| Supply | 21 million | About 28.7 billion |

Fees, hashrate and transaction counts change every day. The Real Numbers panel on this page shows the live figures.

## Where Bitcoin Cash wins

**Contract maturity.** BCH contracts can read their own transaction since the [2022 introspection upgrade](/upgrades/2022-05-upgrade). [CashTokens](/upgrades/2023-05-cashtokens) have run on mainnet since May 2023. The [2025 VM limits and BigInt upgrade](/upgrades/2025-05-vm-limits-bigint) and the [2026 upgrade](/upgrades/2026-05-upgrade) added large-number math, loops and functions. Kaspa's contract layer went live in June 2026. BCH has had years more for bugs to surface, wallets to adopt tokens and tooling to settle.

**Bitcoin lineage.** BCH shares Bitcoin's ledger to 2017, its SHA-256 mining and its 21 million cap. Bitcoin developers can apply their script knowledge directly, and BCH [covenants](/glossary#covenant) show what Bitcoin could run.

**Room to grow on-chain.** The [ABLA](/upgrades/2024-05-abla) limit starts at 32 MB and rises by rule, and blocks today use a small fraction of it.

**Simple, well-studied consensus.** A single chain with 10-minute blocks is the most analyzed design in proof of work. The trade-off is slower confirmation.

## Where Kaspa wins

**Confirmation speed.** At 10 blocks per second, Kaspa includes a transaction in a block in about 100 milliseconds. First confirmation comes in about a second, and full probabilistic security in roughly 10 seconds, according to Coinstancy. BCH merchants can accept [zero-conf](/glossary#zero-conf) payments in seconds, but a first confirmation takes about 10 minutes on average. A BCH proposal to move to 1-minute blocks (CHIP-2025-03) is still under review and is not consensus.

**Native ZK verification.** Toccata added opcodes that verify zero-knowledge proofs directly. BCH can do heavy math in script, but it has no dedicated ZK opcode.

**Fair-launch story.** Kaspa had no premine or insider allocation. Every coin was mined in the open. BCH's initial distribution copied Bitcoin's.

**Momentum.** Kaspa has shipped two major hard forks in about 14 months and publishes an ambitious scaling roadmap. It attracts attention that BCH currently does not.

## Who should use which

- **Choose KAS** if confirmation speed matters most, or you want to build on a new covenant platform with native ZK verification.
- **Choose BCH** if you want a contract platform with years of mainnet history, native tokens with mature wallet support, and Bitcoin's SHA-256 lineage.
- **Developers:** UTXO and covenant skills carry over between the two. Learning on one helps on the other.

Bitcoin Cash has open weaknesses: a small ecosystem, thin liquidity, little buzz and 10-minute blocks. Read the [honest risks page](/risks). Compare also [BCH vs Bitcoin](/compare/bch-vs-btc) and [BCH vs Bitcoin SV](/compare/bch-vs-bsv).

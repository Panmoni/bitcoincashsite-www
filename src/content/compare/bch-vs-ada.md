---
title: "Bitcoin Cash vs Cardano (BCH vs ADA)"
description: "BCH vs ADA: two UTXO chains compared. Covenants vs eUTXO, native tokens on both, proof of work vs Ouroboros stake, and where Cardano leads."
lang: en
verified: 2026-09-26
rival: "Cardano"
ticker: "ADA"
faq:
  - q: "Is Bitcoin Cash better than Cardano?"
    a: "They share more than most pairs: both use UTXOs and both have native tokens. Cardano leads on formal methods, on-chain governance, a funded treasury and staking. Bitcoin Cash leads on proof-of-work security, a fixed 21 million supply, and a simpler fee and token model. Which is better depends on what you build."
  - q: "Are Bitcoin Cash and Cardano both UTXO blockchains?"
    a: "Yes. Cardano uses the extended UTXO (eUTXO) model, where outputs carry a datum and scripts get a redeemer and the full transaction context. Bitcoin Cash uses UTXO covenants: scripts read the transaction through introspection opcodes and can carry state in CashToken NFT commitments."
  - q: "Can Bitcoin Cash run smart contracts like Plutus?"
    a: "Yes. BCH contracts are written in CashScript or raw BCH script and run on the Bitcoin Cash VM. Since May 2026 that VM has loops and functions. Cardano contracts are written in Aiken, Plutus and other languages that compile to Untyped Plutus Core."
  - q: "Does Bitcoin Cash have native tokens like Cardano?"
    a: "Yes. CashTokens (May 2023) put fungible tokens and NFTs directly in BCH outputs, with no token contract. Cardano native assets are also handled by the ledger, governed by a minting policy."
  - q: "Is Cardano proof of stake and Bitcoin Cash proof of work?"
    a: "Yes. Cardano runs Ouroboros proof of stake, with staking that has no lock-up and no slashing. Bitcoin Cash runs SHA-256 proof of work, like Bitcoin."
sources:
  - title: "Extended UTXO model explained (Cardano Docs)"
    url: "https://docs.cardano.org/about-cardano/learn/eutxo-explainer"
  - title: "Native tokens (Cardano Docs)"
    url: "https://docs.cardano.org/developer-resources/native-tokens"
  - title: "Fee structure (Cardano Docs)"
    url: "https://docs.cardano.org/about-cardano/explore-more/fee-structure"
  - title: "Time handling on Cardano (Cardano Docs)"
    url: "https://docs.cardano.org/about-cardano/explore-more/time"
  - title: "Cardano.org"
    url: "https://cardano.org/"
  - title: "Cardano (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Cardano_(blockchain_platform)"
  - title: "Aiken language"
    url: "https://aiken-lang.org/"
  - title: "Cardano moves to full decentralized governance after Plomin hard fork (The Block)"
    url: "https://www.theblock.co/post/337680/cardano-plans-transition-to-full-decentralized-governance-after-wednesdays-plomin-hard-fork"
  - title: "Inside Cardano's van Rossem hard fork (CoinDesk, July 2026)"
    url: "https://www.coindesk.com/markets/2026/07/20/inside-cardano-s-van-rossum-hard-fork-and-what-it-means-for-users"
  - title: "Recent Cardano governance actions (Intersect)"
    url: "https://www.intersectmbo.org/news/recent-cardano-governance-actions"
  - title: "Bitcoin Cash (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bitcoin_Cash"
  - title: "CashTokens CHIP specification"
    url: "https://cashtokens.org/docs/spec/chip"
  - title: "May 15, 2022 upgrade specification (native introspection)"
    url: "https://upgradespecs.bitcoincashnode.org/2022-05-15-upgrade/"
  - title: "Bitcoin Cash Node v27.0.0 release notes (ABLA)"
    url: "https://docs.bitcoincashnode.org/doc/release-notes/release-notes-27.0.0/"
  - title: "Bitcoin Cash Node v28.0.0 release notes (VM Limits, BigInt)"
    url: "https://docs.bitcoincashnode.org/doc/release-notes/release-notes-28.0.0/"
  - title: "Announcing Bitcoin Cash Node v29.0.0"
    url: "https://bitcoincashnode.org/en/newsroom/announcing-bitcoin-cash-node-v29-0-0"
  - title: "Bitcoin Cash Upgrade 2026 (bitjson)"
    url: "https://blog.bitjson.com/bitcoin-cash-upgrade-2026/"
  - title: "About Bitcoin Cash (CashScript docs)"
    url: "https://cashscript.org/docs/basics/about-bch"
  - title: "Lower the default relay fee (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/lower-the-default-relay-fee-create-a-fee-estimation-algorithm/440"
---

Cardano and Bitcoin Cash are closer cousins than most comparisons. Both keep Bitcoin's [UTXO](/glossary#utxo) idea: coins are discrete outputs, each with its own lock. Both put tokens in the ledger itself. They differ on consensus, on how contracts see the world, and on how the chain governs itself.

## How they got here

Bitcoin Cash split from Bitcoin on August 1, 2017. It kept the 21 million cap, SHA-256 mining and 10-minute blocks. Contract features arrived in yearly May upgrades: native [introspection](/glossary#introspection) in 2022, [CashTokens](/upgrades/2023-05-cashtokens) in 2023, an adaptive block size limit in 2024, [VM limits and big integers](/upgrades/2025-05-vm-limits-bigint) in 2025, and [loops, functions, bitwise ops and pay-to-script](/upgrades/2026-05-upgrade) in 2026.

Cardano launched in 2017 as a new proof-of-stake chain built on Ouroboros, a peer-reviewed consensus protocol. Its node is written in Haskell. The Plomin hard fork on January 29, 2025 switched on full on-chain governance under CIP-1694: DReps, stake pools and a Constitutional Committee now vote on treasury withdrawals, hard forks and the constitution. The van Rossem hard fork (protocol version 11) activated on July 18, 2026. It was the first Cardano hard fork proposed and ratified entirely through on-chain governance. It lowered smart-contract execution costs and prepares for the Ouroboros Leios scaling upgrade, expected later in 2026.

## Design differences

| | Bitcoin Cash (BCH) | Cardano (ADA) |
|---|---|---|
| Block time | ~10 minutes (proof of work) | ~20 seconds (1 s slots, 5% active) |
| Block size policy | Adaptive limit (ABLA), 32 MB floor, grows with sustained use | Protocol parameter, changed by governance vote |
| Fee model | Flat rate per byte; default 1 sat/byte | `a × size + b`, plus script execution costs |
| Smart-contract model | UTXO [covenants](/glossary#covenant) with introspection opcodes | eUTXO: datum, redeemer, script context |
| Tokens | Native [CashTokens](/glossary#cashtokens) inside outputs | Native assets under a minting policy; outputs need a minimum ADA |
| Contract languages | [CashScript](/glossary#cashscript), raw BCH script | Aiken, Plutus (compile to Untyped Plutus Core) |
| Privacy | Transparent ledger | Transparent ledger |
| Consensus | SHA-256 proof of work | Ouroboros proof of stake |
| Governance | Off-chain; node teams ship yearly CHIP-based upgrades | On-chain: DReps, stake pools, Constitutional Committee |
| Supply | Fixed 21 million | Max 45 billion |

## A fair mapping: eUTXO vs BCH covenants

If you know one model, you can read the other. The concepts line up closely:

| Cardano eUTXO | Bitcoin Cash |
|---|---|
| Datum (data carried by an output) | NFT commitment on a CashToken, up to 128 bytes since 2026 |
| Redeemer (data supplied to unlock) | Unlocking bytecode pushed by the spender |
| Script context (the whole transaction) | [Introspection](/glossary#introspection) opcodes that read inputs and outputs |
| Minting policy | Token category created in a genesis transaction; all fungible supply is fixed there, and new NFTs need a minting-capability NFT, which a covenant can hold |
| Validator script | Locking bytecode, often written in CashScript |

Both models share the same strengths. Cardano's docs say eUTXO fees are known before you submit, a transaction never fails halfway through a script, and nodes can validate unrelated transactions in parallel. The CashScript docs make the same points about BCH's local state. Both also share the same pain: many users hitting one shared-pool output have to take turns.

## Where Bitcoin Cash wins

**Proof of work and a fixed supply.** BCH keeps Bitcoin's issuance schedule and 21 million cap, secured by SHA-256 mining. Some users want that over stake-based security. The honest caveat: BCH has a small share of SHA-256 hashrate.

**Simpler token outputs.** Cardano requires every output that holds tokens to also hold a minimum amount of ADA, and the minimum grows with the number of token types. BCH [CashTokens](/cashtokens) ride inside ordinary outputs at the same flat per-byte fee as any payment.

**Flat postage.** BCH fees depend on bytes only. Cardano adds a charge for script execution on top of its size formula. Both are predictable. BCH is simpler to estimate by hand. The live panel on this page shows current fees.

**No admin keys, no approvals.** This holds on both chains: tokens need no `approve()`, and scripts are fixed once coins are locked to them. It is a UTXO-family strength, not a BCH-only one. Bugs are still possible; see [risks](/risks).

**Cheap payments that show up fast.** BCH payments appear in wallets within seconds as [zero-conf](/glossary#zero-conf) transactions, with [double-spend proofs](/glossary#dsproof) to alert merchants.

## Where Cardano wins

Cardano is ahead on several fronts, and it helps to say so.

- **Formal methods.** Cardano grounds its design in peer-reviewed research and builds with Haskell and formal methods. Its consensus has academic security proofs.
- **On-chain governance and a treasury.** Holders delegate to DReps who vote on spending and upgrades. The treasury funds development through public votes; the 2025 budget cycle ran under a 350 million ADA cap. BCH has no treasury and a small developer base.
- **Staking.** ADA holders can stake with no lock-up and no slashing. BCH has no staking yield.
- **Tooling.** Aiken gives Cardano a modern, purpose-built contract language. Plutus and Hydra add more options.
- **Faster blocks.** About 20 seconds versus about 10 minutes.

## Who should use which

**Use Cardano** if you want staking, a formal-methods culture, a funded treasury, or a say in on-chain governance.

**Use Bitcoin Cash** if you want proof-of-work money with a fixed supply, flat per-byte fees and cheap native tokens. BCH is also a good place to test Bitcoin-style covenants on a live chain. Skills move both ways: UTXO thinking on Cardano transfers to BCH, and back. Start at [/build](/build), read the [opcode reference](/opcodes), and see token metadata via [BCMR](/glossary#bcmr) and listings on [TokenStork](https://tokenstork.com).

For other matchups, see [BCH vs Ethereum](/compare/bch-vs-eth) and [BCH vs Solana](/compare/bch-vs-sol).

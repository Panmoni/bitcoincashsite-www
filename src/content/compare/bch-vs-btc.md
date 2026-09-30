---
title: "Bitcoin Cash vs Bitcoin Core (BCH vs BTC)"
description: "BCH vs BTC, honestly: the 2017 split, bigger blocks vs SegWit and Lightning, native tokens and covenants, and where Bitcoin clearly leads."
lang: en
verified: 2026-09-26
rival: "Bitcoin Core"
ticker: "BTC"
faq:
  - q: "Is Bitcoin Cash better than Bitcoin?"
    a: "It depends on the job. Bitcoin has far more hashrate, liquidity, exchange support and institutional products, including US spot ETFs. Bitcoin Cash is built for cheap on-chain payments and has a more capable contract system. Pick BTC as a long-term store of value with the deepest markets; pick BCH to pay and build on-chain for fractions of a cent."
  - q: "Why did Bitcoin Cash fork from Bitcoin?"
    a: "A group of developers, activists and miners opposed the SegWit upgrade and wanted larger blocks instead. They split the chain on August 1, 2017, at block 478,559. Anyone who held BTC at that moment received the same amount of BCH."
  - q: "Do Bitcoin and Bitcoin Cash have the same supply?"
    a: "Yes. Both have a fixed cap of 21 million coins and both use SHA-256 proof of work. They share the same transaction history up to the 2017 split."
  - q: "Does Bitcoin Cash have the Lightning Network?"
    a: "No. Bitcoin Cash scales on-chain with larger blocks instead. Its block-size limit has a 32 MB floor and, since May 2024, grows automatically with sustained demand under the ABLA algorithm."
  - q: "Can Bitcoin Cash do things Bitcoin cannot?"
    a: "Yes, at the script level. BCH has native introspection (2022), native tokens called CashTokens (2023), big-integer math (2025), and bounded loops and functions (2026). Bitcoin developers still debate covenant proposals of this kind."
  - q: "Is there a Bitcoin Cash ETF?"
    a: "Not in the US as of September 2026. Grayscale filed on September 11, 2026 to convert its Bitcoin Cash Trust (BCHG) into an ETF on NYSE Arca, but the listing depends on SEC approval that had not happened by that filing. Bitcoin spot ETFs have traded in the US since January 11, 2024."
sources:
  - title: "Bitcoin Cash (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bitcoin_Cash"
  - title: "Bitcoin (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bitcoin"
  - title: "Lightning Network (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Lightning_Network"
  - title: "BCH upgrade specifications (Bitcoin Cash Node)"
    url: "https://upgradespecs.bitcoincashnode.org/"
  - title: "2019-05-15 upgrade: Schnorr signatures (BCHN)"
    url: "https://upgradespecs.bitcoincashnode.org/2019-05-15-upgrade/"
  - title: "ASERT difficulty adjustment (BCHN)"
    url: "https://upgradespecs.bitcoincashnode.org/2020-11-15-asert/"
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
  - title: "CashFusion"
    url: "https://cashfusion.org/"
  - title: "SEC Approves 11 Bitcoin Spot ETFs (Hunton)"
    url: "https://www.hunton.com/blockchain-legal-resource/sec-approves-11-bitcoin-spot-etfs"
  - title: "Bitcoin Cash and the Grayscale ETF Filing: What Counts (CryptoTicker)"
    url: "https://cryptoticker.io/en/bitcoin-cash-grayscale-etf-filing-check/"
  - title: "CHIP-2025-03 Faster Blocks for Bitcoin Cash (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-for-bitcoin-cash/1513/189"
---

Bitcoin Cash and Bitcoin are the same chain up to August 1, 2017. At block 478,559 the two split. Every BTC holder at that moment also received BCH. Both coins still share SHA-256 mining, 10-minute blocks and a 21 million supply cap.

The split was about scaling. One side backed SegWit, a soft fork that changed how signatures are stored and prepared Bitcoin for off-chain payment channels. A group of developers, activists and China-based miners opposed SegWit and wanted bigger blocks instead. Bitcoin activated SegWit in August 2017. Bitcoin Cash launched with 8 MB blocks and raised the limit to 32 MB in 2018.

Since then the two chains have taken different roads. Bitcoin moves slowly and treats the base layer as settlement. Bitcoin Cash upgrades once a year and treats the base layer as the place where payments and contracts happen.

## Design differences

| | Bitcoin Cash (BCH) | Bitcoin (BTC) |
|---|---|---|
| Block time | 10 minutes | 10 minutes |
| Block size policy | 32 MB floor; [ABLA](/glossary#abla) raises the limit with sustained demand (since 2024) | 4 million weight units (SegWit, 2017) |
| Difficulty adjustment | [ASERT](/glossary#asert-daa), every block (since Nov 2020) | Every 2,016 blocks (about two weeks) |
| Fee model | Per-byte fees; blocks far below the limit | Per-byte (vbyte) fees; blocks compete for limited space |
| Scaling path | On-chain | Lightning Network (off-chain payment channels) |
| Smart contracts | Bitcoin Script plus [introspection](/upgrades/2022-05-upgrade), big integers, loops and functions | Bitcoin Script plus Taproot (2021); covenant opcodes still under debate |
| Tokens | Native [CashTokens](/cashtokens) (2023) | No native token type |
| Signatures | ECDSA and [Schnorr](/glossary#schnorr-signatures) (2019) | ECDSA and Schnorr via Taproot (2021) |
| Unconfirmed payments | [Zero-conf](/glossary#zero-conf) with [double-spend proofs](/glossary#dsproof) | Wait for confirmation, or use Lightning |
| Privacy | Transparent ledger; optional [CashFusion](/glossary#cashfusion) mixing | Transparent ledger; Lightning keeps payments off-chain |
| Consensus | SHA-256 proof of work | SHA-256 proof of work |
| Supply | 21 million | 21 million |

Fees, hashrate and transaction counts change daily. The Real Numbers panel on this page shows them live.

## Where Bitcoin Cash wins

**Cheap on-chain payments.** BCH blocks sit far below the 32 MB floor, so a normal payment does not bid against other users for block space. You pay a small per-byte fee and the payment shows up in seconds. Merchants who accept payments before confirmation can watch for [double-spend proofs](/glossary#dsproof): nodes relay cryptographic evidence if someone tries to spend the same coin twice.

**A block-size limit that moves by rule.** The [2024 ABLA upgrade](/upgrades/2024-05-abla) replaced the "argue about it every few years" approach with an algorithm. The limit never falls below 32 MB. It grows when blocks stay full, capped at roughly doubling per year under extreme load.

**Contracts Bitcoin is still debating.** The Bitcoin community has argued for years about covenant proposals. BCH already runs them. Contracts can read their own transaction since 2022. [CashTokens](/upgrades/2023-05-cashtokens) put fungible tokens and NFTs directly inside [UTXOs](/glossary#utxo) in 2023, with no token contract to deploy. The [2025 VM limits and BigInt upgrade](/upgrades/2025-05-vm-limits-bigint) raised the compute budget and added high-precision math. The [2026 upgrade](/upgrades/2026-05-upgrade) added bounded loops, functions, bitwise operations and pay-to-script. If you want to test a [covenant](/glossary#covenant) design on a live proof-of-work chain, BCH is a cheap place to do it.

**Predictable upgrades.** BCH ships network upgrades on a fixed May schedule, specified in public CHIPs. A proposal to cut block time to one minute (CHIP-2025-03) is under review, but it is not consensus and has no activation date yet.

## Where Bitcoin wins

**Security budget and hashrate.** Both chains use the same SHA-256 hardware, and Bitcoin has by far the larger share of it. A bigger hashrate makes a 51% attack far more expensive. For large settlements, BTC's confirmations carry more weight. Compare the live figures in the panel.

**Liquidity and exchange support.** Bitcoin has the deepest markets in crypto and near-universal exchange support. BCH liquidity is real but much thinner.

**Institutional access.** The SEC approved 11 US spot Bitcoin ETFs on January 10, 2024, and they began trading the next day. BCH has no US spot ETF. Grayscale filed on September 11, 2026 to turn its Bitcoin Cash Trust (BCHG) into an ETF on NYSE Arca. The filing states that the listing rule it depends on was not yet approved and names no date.

**Lightning.** Lightning lets two parties open a payment channel and send many payments off-chain, settling on-chain only when they open or close it. Lightning Labs launched it on mainnet in 2018. It comes with its own trade-offs: channels need on-chain transactions and liquidity management.

**Network effect and brand.** "Bitcoin" means BTC to most people. BCH carries the cost of explaining itself. It also went through its own splits, in 2018 and in 2020 (eCash).

## Who should use which

- **Choose BTC** if you want the most liquid, most secure proof-of-work asset to hold for years, or you need ETF or institutional access.
- **Choose BCH** if you want to pay or get paid on-chain for fractions of a cent, issue tokens without a token contract, or build and test Bitcoin-style covenants today.
- **Use both.** Many people hold BTC as savings and use BCH to spend. The two coins are complements more often than rivals.

BCH also has weaknesses that this page does not hide: a small ecosystem, thin liquidity and little hype. Read the [honest risks page](/risks) before you commit money. For other comparisons, see [BCH vs Litecoin](/compare/bch-vs-ltc) and [BCH vs Kaspa](/compare/bch-vs-kas).

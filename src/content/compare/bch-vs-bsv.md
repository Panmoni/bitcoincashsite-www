---
title: "Bitcoin Cash vs Bitcoin SV (BCH vs BSV)"
description: "BCH vs BSV: why Bitcoin Cash split in November 2018, how the two big-block chains differ on block size, script and upgrades, and where each fits."
lang: en
verified: 2026-09-26
rival: "Bitcoin SV"
ticker: "BSV"
faq:
  - q: "Why did Bitcoin SV split from Bitcoin Cash?"
    a: "In 2018 the Bitcoin Cash community disagreed about the November upgrade. One camp, led by Craig Wright with financial backing from Calvin Ayre, wanted to raise the block-size limit to 128 MB and restore Bitcoin's original protocol. The other camp kept a 32 MB limit and a different set of changes. The chain split on November 15, 2018, at block 556,766."
  - q: "Is Bitcoin SV the same as Bitcoin Cash?"
    a: "No. They share history up to November 15, 2018, and both use SHA-256 proof of work with a 21 million cap. Since the split they have separate rules, separate upgrades and separate markets."
  - q: "Is Bitcoin Cash better than Bitcoin SV?"
    a: "They optimize for different things. BSV aims for very large blocks and enterprise data use, and it has restored Bitcoin's original script operations. BCH grows block size by an algorithm, adds new contract features each May, and is designed for payments and UTXO contracts. Which is better depends on what you build."
  - q: "What is the BSV Chronicle upgrade?"
    a: "Chronicle activated on BSV on April 7, 2026, at block 943,816. It re-enabled script operations from Bitcoin's early releases and added the option to sign with Bitcoin's original transaction digest algorithm."
  - q: "Has Bitcoin SV been 51% attacked?"
    a: "Yes. BSV suffered 51% attacks in June, July and August 2021, according to Wikipedia's account."
sources:
  - title: "Bitcoin SV (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bitcoin_SV"
  - title: "Bitcoin Cash (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bitcoin_Cash"
  - title: "Chronicle upgrade on BSV mainnet clears path for Teranode (CoinGeek)"
    url: "https://coingeek.com/chronicle-upgrade-on-bsv-mainnet-clears-path-for-teranode/"
  - title: "BSV token protocols (BSV Association)"
    url: "https://bsvblockchain.org/features/token-protocols/"
  - title: "1Sat Ordinals documentation: BSV-20 / BSV-21"
    url: "https://docs.1satordinals.com/bsv20"
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
  - title: "ASERT difficulty adjustment (BCHN)"
    url: "https://upgradespecs.bitcoincashnode.org/2020-11-15-asert/"
  - title: "Double-spend proofs specification (BCHN)"
    url: "https://upgradespecs.bitcoincashnode.org/dsproof/"
  - title: "CHIP-2023-04 Adaptive Blocksize Limit Algorithm"
    url: "https://gitlab.com/0353F40E/ebaa/-/raw/main/README.md"
  - title: "CashTokens specification"
    url: "https://github.com/cashtokens/cashtokens"
---

Bitcoin SV (BSV) is a fork of Bitcoin Cash. Both chains wanted bigger blocks than Bitcoin. In 2018 they disagreed about how far to go and what else to change.

## The 2018 split

Bitcoin Cash upgraded twice a year in its early days. Ahead of the November 2018 upgrade, two camps proposed incompatible rule sets. One camp, led by Craig Wright and financially backed by Calvin Ayre, proposed raising the block-size limit to 128 MB. It called its client Bitcoin SV, for "Satoshi Vision". The other camp kept the 32 MB limit.

The chain split on November 15, 2018, at block 556,766. Observers called the fight a "civil war" inside the community. The chain that kept the name Bitcoin Cash and the BCH ticker followed the 32 MB rule set. The other became BSV.

After the split the two projects went separate ways. In April 2019 Binance delisted BSV. In June, July and August 2021 BSV suffered 51% attacks. In March 2024 the UK High Court ruled that Craig Wright is not Satoshi Nakamoto.

Bitcoin Cash had its own later split: in November 2020 the Bitcoin ABC client forked off, and that chain is now eCash (XEC).

## Design differences

| | Bitcoin Cash (BCH) | Bitcoin SV (BSV) |
|---|---|---|
| Shared history | Bitcoin to Aug 2017 | Bitcoin, then BCH to Nov 2018 |
| Block time | 10 minutes | 10 minutes |
| Block size policy | 32 MB floor; [ABLA](/glossary#abla) raises the limit by rule with sustained demand | Very large blocks; the project aims to remove artificial limits |
| Difficulty adjustment | [ASERT](/glossary#asert-daa), every block (since Nov 2020) | Separate rules since 2018 |
| Script philosophy | Add new, bounded opcodes each May (introspection, tokens, BigInt, loops, functions) | Restore Bitcoin's original opcodes and signing (Chronicle, Apr 2026) |
| Tokens | Native [CashTokens](/cashtokens), enforced by consensus (2023) | Built in Bitcoin Script by application protocols (for example 1Sat Ordinals BSV-21) |
| Privacy | Transparent; optional [CashFusion](/glossary#cashfusion) | Transparent |
| Consensus / mining | SHA-256 proof of work | SHA-256 proof of work |
| Supply | 21 million | 21 million |

Hashrate, fees, block sizes and transaction counts move daily. The Real Numbers panel on this page shows the live figures.

## How the two big-block visions differ

Both chains reject Bitcoin's small-block path. They disagree on method.

**BCH: grow capacity by rule, extend Script carefully.** Since the [ABLA upgrade](/upgrades/2024-05-abla) in May 2024, the BCH block-size limit tracks real usage. It never falls below 32 MB and can at most roughly double in a year under full load. New contract features arrive through public CHIPs and a yearly May upgrade: [introspection](/upgrades/2022-05-upgrade) in 2022, [CashTokens](/upgrades/2023-05-cashtokens) in 2023, [VM limits and BigInt](/upgrades/2025-05-vm-limits-bigint) in 2025, and loops, functions and bitwise operations in the [2026 upgrade](/upgrades/2026-05-upgrade). Each new operation carries a cost budget.

**BSV: restore the original protocol, then scale hard.** BSV's stated goal is to return Bitcoin to its early design and let block size follow demand. The Chronicle upgrade activated on April 7, 2026, at block 943,816. It re-enabled script operations from Bitcoin's early releases and gave developers the option to sign with the original transaction digest algorithm. BSV is building Teranode, a node design for very high throughput. CoinGeek, a BSV-focused outlet, reports that Teranode already processes blocks on the network but is not yet run by all miners.

## Where Bitcoin Cash wins

- **Liquidity.** Compare live trading volume for both coins in the panel before you choose.
- **Native tokens.** [CashTokens](/cashtokens) are part of the consensus rules. Every full node validates token amounts and NFT rules directly. No indexer has to interpret inscriptions.
- **Contract tooling with a cost model.** BCH's new opcodes come with explicit limits, which keeps validation cost predictable. [Covenants](/glossary#covenant) on BCH can hold tokens, read their own transaction and loop over data.
- **Merchant tools.** [Double-spend proofs](/glossary#dsproof) help merchants accept [zero-conf](/glossary#zero-conf) payments.

## Where Bitcoin SV wins

- **Raw capacity ambition.** BSV aims at far larger blocks and far higher throughput than BCH plans today. If you need to write large volumes of data on-chain, BSV is designed for that.
- **Original Script.** Developers who want Bitcoin's early opcodes and signing method, rather than new additions, get them on BSV.
- **High-volume focus.** BSV's roadmap centers on Teranode and very large transaction volumes.

## Who should use which

- **Choose BCH** for payments, native tokens, and UTXO contracts with a well-defined cost model and a public upgrade process.
- **Choose BSV** if your application writes large amounts of data on-chain and you prefer Bitcoin's original script rules.
- **Check exchange support first.** Access to BSV varies by exchange and country.

Bitcoin Cash has limits of its own: a small ecosystem, thin liquidity and lower hashrate than Bitcoin. See the [honest risks page](/risks), [BCH vs Bitcoin](/compare/bch-vs-btc) and [BCH vs Litecoin](/compare/bch-vs-ltc).

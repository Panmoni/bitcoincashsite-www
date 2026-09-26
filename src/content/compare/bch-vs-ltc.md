---
title: "Bitcoin Cash vs Litecoin (BCH vs LTC)"
description: "BCH vs LTC, honestly: two payment coins compared on block time, fees, MWEB privacy, native tokens, covenants, ETFs and exchange support."
lang: en
verified: 2026-09-26
rival: "Litecoin"
ticker: "LTC"
faq:
  - q: "Is Bitcoin Cash better than Litecoin?"
    a: "For different things. Litecoin confirms blocks four times as often and offers optional MWEB privacy, and it has a US spot ETF. Bitcoin Cash has larger block capacity, native tokens (CashTokens) and a more capable contract system. Both aim at cheap everyday payments."
  - q: "Which is faster, Bitcoin Cash or Litecoin?"
    a: "Litecoin targets a block every 2.5 minutes; Bitcoin Cash targets one every 10 minutes. Bitcoin Cash payments show up in wallets within seconds, before they confirm, and double-spend proofs make those unconfirmed payments safer to accept."
  - q: "Is Litecoin more private than Bitcoin Cash?"
    a: "It can be. Litecoin's MWEB, activated in May 2022, is an opt-in extension block that hides amounts and addresses. Bitcoin Cash is a transparent ledger; its main privacy tool is CashFusion, an optional mixing feature in some wallets."
  - q: "Is there a Litecoin ETF?"
    a: "Yes. Canary Capital launched the Canary Litecoin ETF (LTCC), a spot Litecoin ETF, on Nasdaq on October 28, 2025. As of September 2026 there is no US spot Bitcoin Cash ETF; Grayscale has filed to convert its Bitcoin Cash Trust, pending SEC approval."
  - q: "Are Bitcoin Cash and Litecoin forks of Bitcoin?"
    a: "Both come from Bitcoin's code, in different ways. Litecoin launched in 2011 as a separate chain with its own history. Bitcoin Cash split from the Bitcoin chain itself in August 2017 and shares Bitcoin's history up to that point."
sources:
  - title: "Litecoin (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Litecoin"
  - title: "Bitcoin Cash (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bitcoin_Cash"
  - title: "Litecoin Successfully Activates SegWit (CoinDesk)"
    url: "https://www.coindesk.com/markets/2017/05/10/litecoin-successfully-activates-segwit"
  - title: "Litecoin activates SegWit, completes first Lightning Network transaction (Bitcoin.com News)"
    url: "https://news.bitcoin.com/litecoin-activates-segwit-completes-first-lightning-network-transaction/"
  - title: "Major Korean exchanges delist Litecoin due to its new privacy features (The Block)"
    url: "https://www.theblock.co/post/150799/major-korean-exchanges-delist-litecoin-due-to-its-new-privacy-features"
  - title: "Why did Upbit and Bithumb just delist Litecoin? (CoinGeek)"
    url: "https://coingeek.com/why-did-upbit-and-bithumb-just-delist-litecoin/"
  - title: "Canary Capital Launches Canary Litecoin ETF (LTCC) (ETFGI)"
    url: "https://etfgi.com/news/stories/2025/10/canary-capital-launches-canary-litecoin-etf-ltcc"
  - title: "Canary Capital Launches Canary Litecoin ETF (LTCC) (Canary Capital)"
    url: "https://www.canary.capital/thought-leadership/canary-capital-launches-canary-litecoin-etf-ltcc"
  - title: "Bitcoin Cash and the Grayscale ETF Filing: What Counts (CryptoTicker)"
    url: "https://cryptoticker.io/en/bitcoin-cash-grayscale-etf-filing-check/"
  - title: "BCH upgrade specifications (Bitcoin Cash Node)"
    url: "https://upgradespecs.bitcoincashnode.org/"
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
  - title: "CashFusion"
    url: "https://cashfusion.org/"
---

Litecoin and Bitcoin Cash are two of the oldest attempts to make Bitcoin-style money cheaper and quicker to use. They took different routes.

Charlie Lee released Litecoin in 2011 as a separate chain. It changed a few of Bitcoin's parameters: Scrypt mining instead of SHA-256, a 2.5-minute block target and a cap of 84 million coins. It has run as its own network ever since, and Dogecoin has been merge-mined with it since September 2014.

Bitcoin Cash split from Bitcoin itself on August 1, 2017. It kept Bitcoin's history, SHA-256 mining, 10-minute blocks and 21 million cap, and chose bigger blocks over SegWit.

The two coins made opposite calls in 2017. Litecoin activated SegWit on May 10, 2017, and the first Lightning payment on its mainnet followed the next day. Bitcoin Cash rejected SegWit and scaled the base layer instead.

## Design differences

| | Bitcoin Cash (BCH) | Litecoin (LTC) |
|---|---|---|
| Launch | Aug 2017, split from Bitcoin | 2011, separate chain |
| Block time | 10 minutes | 2.5 minutes |
| Block size policy | 32 MB floor; [ABLA](/glossary#abla) raises the limit with demand (since 2024) | Fixed limit; SegWit activated May 2017 |
| Fee model | Per-byte fees | Per-byte fees |
| Scaling path | On-chain | On-chain plus Lightning |
| Smart contracts | Bitcoin Script plus introspection, big integers, loops and functions | Bitcoin-style Script |
| Tokens | Native [CashTokens](/cashtokens) (2023) | No native token type |
| Privacy | Transparent; optional [CashFusion](/glossary#cashfusion) | Transparent main chain; opt-in MWEB extension block (2022) |
| Unconfirmed payments | [Zero-conf](/glossary#zero-conf) with [double-spend proofs](/glossary#dsproof) | Wait for a 2.5-minute block, or use Lightning |
| Consensus / mining | SHA-256 proof of work | Scrypt proof of work, merge-mined with Dogecoin |
| Supply | 21 million | 84 million |

Price, fees and daily transactions change constantly. See the Real Numbers panel on this page for live figures.

## Where Bitcoin Cash wins

**Block space.** BCH blocks can hold up to 32 MB today, and the [ABLA upgrade](/upgrades/2024-05-abla) lets that limit grow by rule when demand stays high. Current blocks use a small fraction of it, so fees stay low without a second layer.

**Native tokens.** Since the [CashTokens upgrade](/upgrades/2023-05-cashtokens) in May 2023, any BCH output can carry fungible tokens or an NFT. There is no token contract to deploy and no allowance to approve. Litecoin has no equivalent built into its consensus rules.

**Contracts.** BCH has expanded Bitcoin Script every May since 2022: introspection, then tokens, then the [2025 VM limits and BigInt upgrade](/upgrades/2025-05-vm-limits-bigint), then loops and functions in the [2026 upgrade](/upgrades/2026-05-upgrade). That makes BCH a practical place to write [covenants](/glossary#covenant): contracts that control where their coins can go next.

**Safer zero-conf.** BCH nodes relay [double-spend proofs](/glossary#dsproof) when someone tries to spend the same coin twice. That gives merchants a signal before a block arrives.

**Same history as Bitcoin.** BCH shares Bitcoin's ledger up to 2017 and its SHA-256 mining. For some users, that link matters.

## Where Litecoin wins

**Faster blocks.** A 2.5-minute target means the first confirmation arrives about four times sooner on average. For a merchant who waits for one confirmation, that is a real difference.

**Optional privacy with MWEB.** Litecoin activated MimbleWimble Extension Blocks on May 20, 2022. MWEB is opt-in. Coins moved into it get confidential amounts and addresses. BCH has no protocol-level privacy feature; [CashFusion](/glossary#cashfusion) is an optional wallet tool. MWEB came at a cost: Upbit, Bithumb, Coinone, Korbit and Gopax in South Korea delisted Litecoin in June 2022, citing anti-money-laundering rules.

**A US spot ETF.** Canary Capital launched the Canary Litecoin ETF (LTCC) on Nasdaq on October 28, 2025. Bitcoin Cash has no US spot ETF. Grayscale filed on September 11, 2026 to convert its Bitcoin Cash Trust (BCHG) into one, but the listing rule it relies on was not yet approved and the filing names no date.

**Lightning.** Litecoin supports Lightning payment channels and was the first mainnet to carry a Lightning payment, in May 2017.

**Liquidity and exchange support.** Litecoin has broad exchange and payment-processor support. Check the live panel for current volume on both coins.

**Mining security from merge-mining.** Dogecoin miners also secure Litecoin, which ties two large Scrypt communities together.

## Who should use which

- **Choose LTC** if you want quicker first confirmations, optional on-chain privacy, Lightning, or a US-listed spot ETF.
- **Choose BCH** if you want large on-chain capacity, native tokens, or UTXO contracts that go well beyond Bitcoin Script.
- **For plain payments,** both work and both are cheap. Pick the one your wallet, exchange and counterparties already support.

Bitcoin Cash has open weaknesses: a small ecosystem, thin liquidity and 10-minute blocks. Read the [honest risks page](/risks) first. See also [BCH vs Bitcoin](/compare/bch-vs-btc) and [BCH vs Kaspa](/compare/bch-vs-kas).

---
title: "Is Bitcoin Cash dead?"
description: "No. BCH ships a network upgrade every May, its node and tooling release often, and CME plans BCH futures. Here is the evidence, and what is weak."
lang: en
verified: 2026-09-26
faq:
  - q: "Is Bitcoin Cash dead?"
    a: "No. The chain produces blocks, and developers activated network upgrades on 15 May in 2023, 2024, 2025 and 2026. Node software and contract tooling shipped new releases in 2026. Usage is small, and the live panel on this page shows today's numbers."
  - q: "Is Bitcoin Cash a good investment?"
    a: "We don't make price calls. BCH is volatile: it fell about 88% between December 2017 and August 2018. Its ecosystem and liquidity are small. Read our honest risks page before you buy, and never invest money you can't afford to lose."
  - q: "Is Bitcoin Cash still being developed?"
    a: "Yes. Bitcoin Cash Node released v29.0.0 in January 2026 and v29.1.0 in July 2026. CashScript released v0.13.0 with loops and P2S support, and v0.13.3 in September 2026. A proposal for 1-minute blocks is in open debate for 2027."
  - q: "Is Bitcoin Cash getting CME futures?"
    a: "CME Group announced on 22 September 2026 that it plans to launch Bitcoin Cash futures (250 BCH) and Micro Bitcoin Cash futures (25 BCH) on 19 October 2026, pending regulatory review."
  - q: "Can I still use Bitcoin Cash for payments?"
    a: "Yes. Fees are usually well under a cent and payments show in seconds. Pick a wallet from our wallet guide. Remember that zero-confirmation payments rely on double-spend alerts, not a guarantee."
sources:
  - title: "2023-05-15 Network Upgrade Specification — BCHN upgrade specs"
    url: "https://upgradespecs.bitcoincashnode.org/2023-05-15-upgrade/"
  - title: "2024-05-15 Network Upgrade Specification — BCHN upgrade specs"
    url: "https://upgradespecs.bitcoincashnode.org/2024-05-15-upgrade/"
  - title: "2025-05-15 Network Upgrade Specification — BCHN upgrade specs"
    url: "https://upgradespecs.bitcoincashnode.org/2025-05-15-upgrade/"
  - title: "Bitcoin Cash Node v29.0.0 release notes"
    url: "https://docs.bitcoincashnode.org/doc/release-notes/release-notes-29.0.0/"
  - title: "Bitcoin Cash Node releases — GitHub"
    url: "https://github.com/bitcoin-cash-node/bitcoin-cash-node/releases"
  - title: "Bitcoin Cash Upgrade 2026 — Jason Dreyzehner (bitjson)"
    url: "https://blog.bitjson.com/bitcoin-cash-upgrade-2026/"
  - title: "Bitcoin Cash latest updates — CoinMarketCap"
    url: "https://coinmarketcap.com/cmc-ai/bitcoin-cash/latest-updates/"
  - title: "CashScript release notes"
    url: "https://cashscript.org/docs/releases/release-notes"
  - title: "CashScript releases — GitHub"
    url: "https://github.com/CashScript/cashscript/releases"
  - title: "CME Group to expand crypto derivatives suite with Bitcoin Cash and Uniswap futures — PR Newswire (22 Sep 2026)"
    url: "https://www.prnewswire.com/news-releases/cme-group-to-expand-crypto-derivatives-suite-with-bitcoin-cash-and-uniswap-futures-302886066.html"
  - title: "CME Group press release (22 Sep 2026)"
    url: "https://www.cmegroup.com/media-room/press-releases/2026/9/22/cme_group_to_expandcryptoderivativessuitewithbitcoincashandunisw.html"
  - title: "CME expands crypto futures lineup with Bitcoin Cash and Uniswap — Decrypt"
    url: "https://decrypt.co/379004/cme-crypto-bitcoin-cash-uniswap-futures"
  - title: "BCH Weekly Recap, September 20, 2026 — KuCoin News"
    url: "https://www.kucoin.com/news/community/BCH/6ab0ee5274fd460007c479bc"
  - title: "CHIP-2025-03 Faster Blocks: statements of support (and dissent) — Bitcoin Cash Research"
    url: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/33"
  - title: "ParyonUSD — Decentralized stablecoin on Bitcoin Cash"
    url: "https://paryonusd.com/"
  - title: "Coinbase Wallet delists XRP, Bitcoin Cash and Ethereum Classic — Decrypt (Nov 2022)"
    url: "https://decrypt.co/115955/coinbase-wallet-delists-ripple-xrp-bitcoin-cash-ethereum-classic"
  - title: "CashFusion — Privacy for Bitcoin Cash (fees typically under $0.01)"
    url: "https://cashfusion.org/"
  - title: "OKCoin delists Bitcoin Cash, Bitcoin SV — CoinDesk (Feb 2021)"
    url: "https://www.coindesk.com/tech/2021/02/19/okcoin-delists-bitcoin-cash-bitcoin-sv-to-avoid-misleading-new-bitcoin-clients"
  - title: "Bitcoin Cash — Wikipedia"
    url: "https://en.wikipedia.org/wiki/Bitcoin_Cash"
---

Short answer: no. Bitcoin Cash still produces blocks, ships a protocol upgrade every year, and keeps releasing software. A regulated exchange plans to list BCH futures in October 2026. It is also a small network with thin liquidity. Both things are true, and this page shows the evidence for each.

## Why people ask

The question has history behind it. BCH forked from Bitcoin on 1 August 2017 and peaked at $4,355.62 that December. By August 2018 it had fallen about 88%. The same year, Bitcoin SV split off. In November 2020 the chain split again, when the Bitcoin ABC team left and later became eCash. Some venues then stepped back. OKCoin delisted BCH and BSV in February 2021, saying new users confused them with Bitcoin. Coinbase Wallet dropped BCH in January 2023.

Each event fed the "is BCH dead?" question. None of them stopped the chain. The fair question is what the network looks like now, not in 2018.

"Dead" usually means one of three things. The chain stopped. Nobody builds on it. Nobody trades it. We check each below.

## Is the chain still running?

Yes. The live metrics panel beside this text reads from a BCH node and shows the latest block, transaction count and fees. We don't hard-code those numbers here because they change every day. Look at the panel, or at [State of BCH](/state-of-bch) for the monthly report.

A quiet chain is not a dead chain. Low activity tells you demand is modest. It does not tell you the network has stopped.

## Does the protocol still change?

Yes, on a fixed calendar. BCH activates network upgrades on 15 May at 12:00 UTC. Each one first runs on the chipnet test network for six months.

| Year | Upgrade | What it added |
|---|---|---|
| 2023 | [CashTokens](/upgrades/2023-05-cashtokens) | Native fungible tokens and NFTs, plus P2SH32 |
| 2024 | [ABLA](/upgrades/2024-05-abla) | An adaptive block size limit |
| 2025 | [VM limits + BigInt](/upgrades/2025-05-vm-limits-bigint) | More contract compute and high-precision math |
| 2026 | [Loops, functions, bitwise, P2S](/upgrades/2026-05-upgrade) | `OP_BEGIN`/`OP_UNTIL`, `OP_DEFINE`/`OP_INVOKE`, restored bitwise ops, standard pay-to-script |

The BCHN upgrade specifications set the 2023, 2024 and 2025 activation times. Bitcoin Cash Node v29.0.0 implemented the 15 May 2026 upgrade, and v29.1.0 (July 2026) added post-upgrade checkpoints. Market trackers report the 2026 upgrade, nicknamed "Layla", activated on schedule.

The next change is in open debate. CHIP-2025-03 would cut the block time from 10 minutes to 1 minute. Its published timeline is lock-in on 15 November 2026 and activation on 15 May 2027. It has endorsements, an abstention and open dissent, including a developer who argued the code is not ready. Track it at [/upgrades/2027-05-upgrade](/upgrades/2027-05-upgrade). A project that still argues in public about its next upgrade is not dead.

## Is anyone building?

Yes, though the team is small.

- **Node software.** Bitcoin Cash Node released v29.0.0 on 9 January 2026 and v29.1.0 on 28 July 2026. Knuth, an alternative node, released v1.3.0 on 30 July 2026.
- **Contract language.** CashScript v0.13.0 added `for` and `while` loops, bitwise shifts and P2S contracts, matching the 2026 upgrade. It shipped v0.13.3 on 15 September 2026 and has v0.14 pre-releases out with user-defined functions.
- **Apps.** ParyonUSD, a BCH-backed stablecoin, went live on 30 April 2026. In one September 2026 week, community news listed a new native DEX, a pay-per-use AI service priced in BCH, a Cashonize wallet release, and private-payment tests on chipnet.

Browse what is live in the [directory](/directory). It pings each project daily and flags the dead ones, so you can judge for yourself.

## Is anyone trading it?

Yes. BCH trades on major exchanges. On 22 September 2026, CME Group announced plans to launch Bitcoin Cash futures on 19 October 2026, "pending regulatory review." Contracts cover 250 BCH, with Micro contracts of 25 BCH. CME plans Uniswap futures for the same date. BCH would join Bitcoin, Ether, XRP, Solana, Cardano and others in CME's crypto lineup.

A futures listing does not mean people use BCH to pay for things. It does mean a regulated venue sees enough demand to list it. Treat the launch date as planned until CME confirms trading has started.

## What is actually weak

Not dead is not the same as thriving. Here is what the skeptics get right:

- **Usage is small.** Transactions and DeFi deposits are tiny next to Ethereum or Solana. Check the live panel.
- **Liquidity is thin**, and there is no USDT or USDC on BCH.
- **Hashrate is a small share** of SHA-256, which raises 51%-attack questions.
- **Blocks take 10 minutes**, and faster blocks are not yet agreed.
- **Access shrank in places.** Coinbase Wallet dropped BCH support in January 2023, citing low usage. The Coinbase exchange kept it.
- **The price swings hard.** BCH fell about 88% from its December 2017 peak by August 2018.
- **Fork history.** BCH split in 2018 (Bitcoin SV) and 2020 (eCash).

We cover each one, with sources and mitigations, on the [honest risks](/risks) page.

## The verdict

Bitcoin Cash is alive and small. It ships upgrades on schedule and keeps adding contract features. It has few users, thin liquidity and a modest developer base. If you want to try it, a transaction typically costs under a cent: get a [wallet](/wallet) and send one. If you want to compare it with Bitcoin, read [BCH vs BTC](/compare/bch-vs-btc).

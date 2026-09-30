---
publishDate: 2026-10-14T00:00:00Z
draft: true
title: "Bitcoin Cash by the Numbers, Ahead of CME Futures"
excerpt: "CME plans to list Bitcoin Cash futures on 19 October. Here is what the chain underneath looks like: fees, activity, hashrate, upgrades and the honest limits."
category: Data
tags:
  - state of bch
  - cme
  - fees
author: George Donnelly
metadata:
  title: "Bitcoin Cash by the Numbers, Ahead of CME Futures"
  description: "CME lists Bitcoin Cash futures on 19 October. The chain underneath, in numbers: $0.0013 median fee, ~12,000 transactions a day, 3.9 EH/s, and the limits we admit."
---

On 22 September, CME Group said it plans to list [Bitcoin Cash futures](https://www.prnewswire.com/news-releases/cme-group-to-expand-crypto-derivatives-suite-with-bitcoin-cash-and-uniswap-futures-302886066.html) from 19 October, pending regulatory review. One standard contract is 250 BCH. A Micro contract is 25 BCH.

Futures are a market event, not a network event. They change who can trade exposure to BCH. They do not change a single byte of the chain. So before the price charts take over, here is what the chain itself looks like.

We don't do price talk. Everything below is about the network.

## The chain, in one table

Snapshot from our daily data job, 30 September 2026 (UTC):

| Metric | Value |
|---|---|
| Block height | 970,863 |
| Transactions, last 24 hours | 11,953 |
| Median fee | $0.0013 |
| Blocks, last 24 hours | 153 (target: 144) |
| Hashrate | 3.85 EH/s |
| Reachable nodes | 757 |
| Unconfirmed transactions | 36 |
| Full chain size | 217 GB |

Live versions of these numbers are on the [State of BCH](/state-of-bch) page.

## Fees: the number BCH was built for

| Chain | Median fee |
|---|---|
| **Bitcoin Cash** | **$0.0013** |
| Bitcoin | $0.11 |
| Ethereum | $0.12 |
| Litecoin | $0.0006 |

A typical BCH payment costs about a tenth of a cent. That is roughly 90 times cheaper than Bitcoin or Ethereum's base layer on the same day. Litecoin was cheaper still. We show it because we show every number, not only the flattering ones.

Why it stays low: BCH charges by the byte, not by computation. There is no gas auction. And blocks have far more room than demand fills. The block size limit floor is 32 MB, and the [ABLA](/glossary#abla) algorithm raises it as sustained demand grows. Today's blocks use a small fraction of that.

## Activity: small, and we say so

About 12,000 transactions a day is small. Bitcoin processed about 655,000 on the same day. Ethereum processed about 2 million.

That gap is the honest starting point for any BCH story. The network works, and it has capacity to spare. The users are not there yet at the scale of the larger chains. See our [honest risks](/risks) page for the rest of the list.

## Security: shared SHA-256, smaller share

BCH is mined with SHA-256, the same algorithm as Bitcoin. At 3.85 EH/s, BCH has a small fraction of Bitcoin's hashrate. That makes it cheaper to attack in principle. Two things push back:

- **Rolling checkpoints.** Nodes refuse to reorganise more than about 10 blocks deep.
- **Double-spend proofs.** Nodes relay a proof when someone tries to double-spend an unconfirmed payment. Merchants who accept payments in seconds can check for one.

Neither makes BCH as expensive to attack as Bitcoin. Exchanges and futures venues choose their own confirmation depth for that reason.

## Protocol: an upgrade every May

BCH has upgraded on schedule every 15 May:

- **2023:** [CashTokens](/cashtokens). Native fungible tokens and NFTs, with no token contract.
- **2024:** [ABLA](/upgrades/2024-05-abla). An adaptive block size limit.
- **2025:** [VM limits and BigInt](/upgrades/2025-05-vm-limits-bigint). More compute for contracts, and arbitrary-precision math.
- **2026:** [Layla](/upgrades/2026-05-upgrade). Loops, functions, bitwise operations and pay-to-script.

The next decision comes soon. Lock-in for the May 2027 upgrade is expected around 15 November. The main candidate is [Faster Blocks](/blog/faster-blocks-1-minute-blocks-bitcoin-cash), which would cut the block time from 10 minutes to 1 minute. It is not locked in.

## Ecosystem: what's alive

Our [directory](/directory) checks every listed project daily. Of 371 projects on 26 September: 288 alive, 26 stale, 24 dead and 33 unknown. We move dead projects to a graveyard instead of leaving broken links in place. For tokens, [TokenStork](https://tokenstork.com) tracks every CashToken category.

## What the futures change, and what they don't

**They change:** regulated funds and traders can take a position on BCH without holding coins or trusting an offshore exchange. That can bring liquidity and attention.

**They don't change:** fees, block times, capacity, upgrades or anyone's ability to send BCH. None of those depend on a futures market.

If the futures bring you here, start with [why Bitcoin Cash](/bitcoin-cash), then [how it compares with Bitcoin](/compare/bch-vs-btc). If you want to test the numbers yourself, [get a wallet](/onboard) and send a payment. It costs about a tenth of a cent.

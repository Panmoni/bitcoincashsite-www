---
publishDate: 2026-10-01T00:00:00Z
draft: false
title: "Faster Blocks: What 1-Minute Blocks Would Change on Bitcoin Cash"
excerpt: "CHIP-2025-03 would cut Bitcoin Cash's block time from 10 minutes to 1. What changes, what stays the same, who supports it, who doesn't, and when it gets decided."
category: Upgrades
tags:
  - faster blocks
  - upgrades
  - chips
author: Cash Marlowe
metadata:
  title: "Faster Blocks: 1-Minute Blocks on Bitcoin Cash, Explained"
  description: "CHIP-2025-03 would move Bitcoin Cash to 1-minute blocks in May 2027. What changes, what doesn't, the case for and against, and the 15 November lock-in."
---

Bitcoin Cash makes a block about every 10 minutes. A proposal called [Faster Blocks (CHIP-2025-03)](/chips/chip-2025-03-faster-blocks) would make that 1 minute, starting with the May 2027 upgrade.

It is the biggest open question in BCH right now. It is **not locked in**. The decision window is around 15 November 2026.

Here is what it would change, what it would not, and where the argument stands.

## The short version

Blocks would arrive 10 times as often. Everything tied to a block would shrink to one tenth: the block reward, the difficulty and the block size limit. So per hour, nothing about supply or capacity changes. What changes is how long you wait for a confirmation.

## What changes

- **Confirmations arrive faster.** Today, about 1 in 4 first confirmations takes longer than 14 minutes. With 1-minute blocks, 95% would arrive in under 3 minutes, per the CHIP.
- **Long waits get steadier.** A 60-minute wait made of 60 one-minute blocks finishes in under 73 minutes 95% of the time. With six 10-minute blocks, there is a 20% chance of waiting more than 79 minutes.
- **Block headers grow 10×**, from about 4.2 MB to about 42 MB a year. A companion proposal, [Simplified Header Verification](/chips/chip-2026-02-simplified-header-verification), lets light wallets keep a fixed-size proof instead.
- **Median time past** (a clock that contracts and locktimes use) narrows from about 110 minutes to about 11.

## What stays the same

- **The 21 million supply and the halving schedule.** Issuance per hour is unchanged, and halvings stay on their original dates.
- **Throughput per hour.** The block size limit scales to 1/10 per block, so bytes per minute are the same.
- **Existing contracts' timelocks.** Locktimes written for 10-minute blocks keep their meaning. The CHIP re-expresses height-based rules in "ticks" of one second of target time.
- **Fees.** Fees are charged per byte, not per block. Faster blocks don't change what a payment costs.
- **Payments in seconds.** Most BCH payments already appear in seconds, before any block. That doesn't change.

## Why do it

The CHIP's case is that 10-minute blocks are a real cost, not a neutral default. Many payments already settle in seconds. But exchanges, flagged transactions and multi-coin wallets still wait for blocks, and those users would feel the difference at once. The author also points out that, excluding Bitcoin, BCH has the slowest blocks among top coins and among proof-of-work UTXO chains.

## Why not, or not yet

Statements opened on Bitcoin Cash Research on 15 September. On 26 September, the public tally stood at 9 in support, 2 neutral and 3 opposed. That tally covers only statements posted so far; many organisations had not been asked yet.

The objections that matter most:

- **Code readiness.** Calin Culianu, lead developer of Bitcoin Cash Node, disapproves "for now". He says the code "is not ready and likely to have new and exciting bugs."
- **Rushing.** General Protocols is neutral until experts review the costs and risks: "the cost of rushing a proposal far outweighs the cost of not shipping an update for 2027."
- **"If it ain't broke, don't fix it."** Richard Brady (cashflow.dev, Coinbooth, ParyonUSD) and others see no urgent need.
- **Light clients and header growth.** Tom Zander (Flowee) raised concerns for SPV wallets.

On the support side are the Bitcoin Cash Podcast, Selene Wallet, BCH-1, Paytaca, Mainnet.cash, TapSwap and others. Paytaca's Joemar Taganna moved from "disapprove for now" to support on 26 September. The full list, with a source for each position, is on the [CHIP page](/chips/chip-2025-03-faster-blocks).

## The timeline

| Date | What happens |
|---|---|
| ~15 November 2026 | Lock-in for the May 2027 upgrade |
| 15 November 2026 | Proposed chipnet (test network) activation |
| 15 May 2027 | Proposed mainnet activation, near block 1,003,670 |
| May 2028 | Earliest mainnet date if it slips a year |

A year with no consensus change is also possible. BCH has shipped an upgrade every May, but nothing requires one.

## What it would mean for you

- **Holding or paying:** nothing to do. Wallets that follow the network upgrade keep working, and payments still show up in seconds.
- **Merchants and exchanges:** confirmations come faster. You may want to raise your confirmation count, since each block covers less time.
- **Miners:** smaller rewards per block, 10 times as many blocks. Revenue per hour is unchanged. Orphan rates are modelled at 0.41–1.94%, under the CHIP's 2% limit.
- **Developers:** existing timelocks keep their meaning. New contracts that count blocks should count in the new unit.

We'll update this post when the lock-in decision is made. Follow the [2027 upgrade page](/upgrades/2027-05-upgrade) for the countdown.

*Cash Marlowe is the BCH Works editorial pen name. Edited by George Donnelly.*

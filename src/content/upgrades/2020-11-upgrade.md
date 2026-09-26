---
title: "November 2020: ASERT difficulty adjustment (and the ABC split)"
date: 2020-11-15T12:00:00Z
status: activated
height: 661648
summary: "Replaced the 2017 DAA with ASERT (aserti3-2d), ending daily difficulty swings. Bitcoin ABC's rival ruleset, with an 8% coinbase levy, split off with almost no hashpower."
keywords:
  - november 2020 upgrade
  - asert
  - aserti3-2d
  - bitcoin cash difficulty algorithm
  - bch abc split
  - axion upgrade
  - ecash split
chips: []
verified: 2026-09-26
sources:
  - title: "2020-NOV-15 Network Upgrade Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/2020-11-15-upgrade/"
  - title: "2020-NOV-15 ASERT Difficulty Adjustment Algorithm (aserti3-2d)"
    url: "https://upgradespecs.bitcoincashnode.org/2020-11-15-asert/"
  - title: "Bitcoin Cash Node chainparams.cpp (ASERT anchor block)"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
  - title: "Bitcoin Cash Has Split Into Two New Blockchains, Again (CoinDesk)"
    url: "https://www.coindesk.com/markets/2020/11/15/bitcoin-cash-has-split-into-two-new-blockchains-again"
  - title: "Bitcoin Cash Hard Fork: Here's What Happened (Decrypt)"
    url: "https://decrypt.co/48409/bitcoin-cash-hard-fork-heres-what-happened"
  - title: "BCHA has been rebranded to eCash (Bitcoin ABC)"
    url: "https://www.bitcoinabc.org/bcha/"
---

## What changed

Activation came when the [median time past](/glossary#median-time-past) reached Unix time `1605441600`
(15 November 2020, 12:00 UTC). Block 661,647 was the last block under the old algorithm and serves as ASERT's anchor.
Block 661,648 is the first block whose difficulty ASERT computes. Bitcoin Cash Node's code calls this upgrade "Axion".

The one consensus change: **the difficulty adjustment algorithm became ASERT** (`aserti3-2d`), designed by Mark
Lundeberg and specified by freetrader, Jonathan Toomim, Calin Culianu and Mark Lundeberg. See [ASERT](/glossary#asert-daa).

How it works, in one line: every block's target is computed from the anchor block. If the chain is ahead of the ideal
10-minute schedule, difficulty rises exponentially; if behind, it falls. The half-life is 172,800 seconds (two days). So
if blocks run a full two days behind schedule, difficulty halves.

## Why

The ASERT spec states the problem plainly. The 2017 DAA used a simple moving average, and it caused a daily
oscillation. Difficulty dipped, switch-miners piled in, a burst of fast blocks followed, then they left and blocks
crawled. Users saw long waits followed by bursts of near-empty blocks, so average confirmation time went up.

ASERT's goals, from the spec:

- Remove periodic oscillations in difficulty and hashrate.
- Narrow the profit gap between steady miners and switch-miners.
- Keep average block intervals close to 10 minutes.
- Bring average confirmation time close to the target.

In simulations against other candidates, ASERT scored best on those criteria.

## The split

Bitcoin ABC, then one of the node teams, shipped a different ruleset for this date. It required 8% of each block
reward to go to an address it controlled (the "coinbase rule"). Bitcoin Cash Node and most miners rejected it. Over 80%
of miners had been signaling for BCHN before the split, and the ABC chain got almost no hashpower. The ABC chain traded
as BCHA and rebranded to eCash (XEC) on 1 July 2021. The BCH chain is the one that follows the rules on this page.

## What it enables

- **Steadier confirmations.** The daily cycle of slow, then fast, blocks went away.
- **Fair mining.** Loyal miners are no longer at a disadvantage to switch-miners that farm cheap difficulty windows.
- **A simple, stateless formula.** A node needs only the anchor block and the current block to compute difficulty.
  There is no window to game, and no rounding error that builds up over time.
- **A base for faster blocks.** The proposed [Faster Blocks CHIP](/chips/chip-2025-03-faster-blocks) keeps ASERT and
  rescales it for a 1-minute target.

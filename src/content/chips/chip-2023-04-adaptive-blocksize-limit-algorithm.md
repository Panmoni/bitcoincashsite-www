---
title: "Adaptive Blocksize Limit Algorithm (ABLA)"
code: "CHIP-2023-04"
owners:
  - bitcoincashautist
status: activated
upgrade: 2024-05-abla
summary: "Replaces the fixed 32 MB block size limit with an algorithm that raises the limit as sustained demand grows, keeping 32 MB as the floor."
spec: "https://gitlab.com/0353F40E/ebaa"
discussion: "https://bitcoincashresearch.org/t/chip-2023-04-adaptive-blocksize-limit-algorithm-for-bitcoin-cash/1037"
stakeholders:
  - name: "Bitcoin Cash Node"
    position: support
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "Bitcoin Verde"
    position: support
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "BCHD"
    position: neutral
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "Paytaca Wallet"
    position: support
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "Cashonize"
    position: support
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "Selene"
    position: support
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "Electron Cash"
    position: neutral
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "Coin Wallet"
    position: oppose
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "Bmap.app"
    position: oppose
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "Memo Technology, Inc."
    position: oppose
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "The Real Bitcoin Club"
    position: oppose
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - name: "Toomim Bros Bitcoin Mining Concern Ltd."
    position: neutral
    source: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
verified: 2026-09-26
sources:
  - title: "CHIP-2023-04 Adaptive Blocksize Limit Algorithm for Bitcoin Cash"
    url: "https://gitlab.com/0353F40E/ebaa"
  - title: "CHIP-2023-04 stakeholder responses"
    url: "https://gitlab.com/0353F40E/ebaa/-/blob/main/stakeholders.md"
  - title: "2024-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2024-05-15-upgrade/"
---

## Summary

ABLA recomputes the block size limit after every block, based on an exponentially weighted moving average of recent
block sizes. The 32 MB limit stays as a "stand-by" floor; any increase is "a bonus on top of that, sustained by actual
transaction load." See [ABLA](/glossary#abla).

## Motivation

From the CHIP: "Needing to coordinate manual increases to Bitcoin Cash's blocksize limit incurs a meta cost on all
network participants. The need to regularly come to agreement makes the network vulnerable to social attacks."

The algorithm changes the default. Today's default is "do nothing until something is decided." The new default is
"adjust according to this algorithm (until something else is decided, if need be)." The CHIP aims for "minimal to no
impact on the game theory and incentives that Bitcoin Cash has today."

## What it specifies

- A **control function** tracks block sizes with a forget factor. Its input is amplified by an **asymmetry factor**
  (ζ = 1.5), so the limit rises only under sustained load above a threshold and eases back when load drops.
- An **elastic buffer** adds headroom when the control function rises fast. The proposed buffer can "borrow" about a
  year of growth (for example, a quick 2× over a few months) and then decays with a half-life of about half a year.
- The limit is the control block size plus the buffer, never below 32 MB.

The CHIP models a spam attack by a miner with 50% of hashrate filling its own blocks. It would take about 1.5 years to
double the limit and 2.5 more years for another +50%, while costs keep rising.

## Current status

Accepted and activated on 15 May 2024. The stakeholder table records 60 approvals, 8 neutral and 4 disapprovals. The
outreach counted non-responses as neutral.

The algorithm has not raised the limit in practice so far, because current blocks are far below 32 MB. The proposed
[Faster Blocks CHIP](/chips/chip-2025-03-faster-blocks) would rescale ABLA to 1/10 per block so throughput per minute
stays the same.

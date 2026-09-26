---
title: "Faster Blocks for Bitcoin Cash (1-minute blocks)"
code: "CHIP-2025-03"
owners:
  - bitcoincashautist
status: proposed
upgrade: 2027-05-upgrade
summary: "Proposes cutting the target block time from 10 minutes to 1 minute, scaling reward, difficulty and block size per block by 1/10 so issuance and throughput per hour stay the same. Not locked in."
spec: "https://gitlab.com/0353F40E/fablous"
discussion: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-for-bitcoin-cash/1513"
stakeholders:
  - name: "The Bitcoin Cash Podcast / BCH Bullet"
    position: support
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/3"
  - name: "Selene Wallet"
    position: support
    source: "https://gitlab.com/0353F40E/fablous/-/blob/master/stakeholders.md"
  - name: "BCH-1"
    position: support
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/11"
  - name: "Maxbit Digital Asset / Maxme"
    position: support
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/26"
  - name: "Jonathan Silverblood"
    position: support
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/31"
  - name: "Kallisti.cash (kzKallisti)"
    position: support
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/33"
  - name: "Joemar Taganna (Paytaca)"
    position: support
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/70"
  - name: "Mainnet.cash"
    position: support
    source: "https://gitlab.com/0353F40E/fablous/-/blob/master/stakeholders.md"
  - name: "TapSwap"
    position: support
    source: "https://gitlab.com/0353F40E/fablous/-/blob/master/stakeholders.md"
  - name: "General Protocols"
    position: neutral
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/32"
  - name: "OPTN Wallet developer (personal view)"
    position: neutral
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/73"
  - name: "Calin Culianu (BCHN lead developer)"
    position: oppose
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/4"
  - name: "Tom Zander (Flowee)"
    position: oppose
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/20"
  - name: "Richard Brady (cashflow.dev, Coinbooth, ParyonUSD)"
    position: oppose
    source: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/12"
verified: 2026-09-26
sources:
  - title: "CHIP-2025-03 Faster Blocks for Bitcoin Cash (readme)"
    url: "https://gitlab.com/0353F40E/fablous"
  - title: "CHIP-2025-03 stakeholder responses"
    url: "https://gitlab.com/0353F40E/fablous/-/blob/master/stakeholders.md"
  - title: "CHIP-2025-03 Faster Blocks for Bitcoin Cash (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-for-bitcoin-cash/1513"
  - title: "CHIP-2025-03 Faster Blocks: gathering statements of support (and dissent)"
    url: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095"
  - title: "2027 protocol upgrade ideas (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/2027-protocol-upgrade-ideas/1719"
  - title: "Bitcoin Cash Node chainparams.cpp (upgrade2027ActivationTime)"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
---

## Summary

"The CHIP proposes reducing Bitcoin Cash's block target time from 10 minutes to 1 minute to enhance transaction speed,
reliability, and user experience." The author's one-sentence version: blocks arrive 10× more often, and per-block
reward, difficulty and block size limit each scale to 1/10, "so coin issuance, throughput, ABLA, timelocks, and the DAA
all keep their meaning."

It is the main candidate for the [May 2027 upgrade](/upgrades/2027-05-upgrade). **It is not locked in.**

## Motivation

The CHIP's core claim: 10-minute blocks are a real cost, not a neutral default.

- Today, per the CHIP, about 25% of single confirmations take longer than 14 minutes. With 1-minute blocks, 95% would
  arrive in under 3 minutes.
- Multi-confirmation waits get steadier: a 60-minute target (60 × 1-minute blocks) finishes in under 73 minutes 95% of
  the time, versus a 20% chance of exceeding 79 minutes for 6 × 10-minute blocks.
- [0-conf](/glossary#zero-conf) covers most BCH payments. But many cases fall back to waiting for a block: flagged
  transactions, exchanges, multi-coin wallets. The CHIP says current users benefit directly, before any new adoption.
- The author argues that, excluding BTC, BCH has the slowest blocks of any top coin and of the UTXO proof-of-work set.

## What it specifies

- **1-minute target block time.** Block reward and difficulty per block drop to 1/10; issuance per hour is unchanged.
- **The 21 million schedule and halving timing do not change.** An activation guard pins halvings to the original
  grid.
- **Ticks.** A new unit, one second of target time, re-expresses height-based rules. A future block-time change would
  be a schedule entry, not a protocol rewrite.
- **Timelocks.** `nLockTime` and `nSequence` in existing contracts normalise to the old 10-minute scale.
- **[ABLA](/glossary#abla)** is rescaled to 1/10 per block, so bytes per minute stay the same.
- **[ASERT](/glossary#asert-daa)** keeps its timewarp-resistance properties.
- **Coinbase maturity, block parking and finalization** are redefined in ticks to keep their wall-clock meaning
  (finalization still at about 120 minutes).
- **[Median time past](/glossary#median-time-past)** narrows from about 110 to about 11 minutes.
- **Header growth** rises 10×, from about 4.2 to about 42 MB per year. The CHIP pairs this with
  [Simplified Header Verification](/chips/chip-2026-02-simplified-header-verification) so light wallets can keep a
  fixed-size header proof.
- **Orphan rates** are modeled at 0.41–1.94%, under the CHIP's 2% tolerance.

Proposed activation: chipnet at MTP `1794744000` (15 November 2026), mainnet at MTP `1810382400` (15 May 2027). Bitcoin
Cash Node's master branch carries the 2027 time as a "tentative" activation time. The CHIP estimates the mainnet
activation block near height 1,003,670, but that is an estimate, not a fixed height.

## Current status (26 September 2026)

- **Status in the CHIP:** Proposed. Last edited 5 September 2026.
- **Statements:** collection opened on Bitcoin Cash Research on 15 September 2026, about two months before the
  15 November lock-in window.
- **Implementation:** the Bitcoin Cash Node work lives in a work-in-progress branch. The author called it near done,
  pending locktime handling, parking fixes and test updates.
- **Main objection:** code readiness. BCHN's lead developer Calin Culianu disapproves "for now": the code "is not ready
  and likely to have new and exciting bugs," and dividing today's blocks by 10 means far fewer transactions and much
  less work per block. General Protocols abstains until experts review implementation costs and risks, saying "the cost
  of rushing a proposal far outweighs the cost of not shipping an update for 2027."
- **Other objections:** "If it ain't broke, don't fix it" (Richard Brady and others); SPV and header-growth concerns
  (Tom Zander, Flowee). The CHIP author answered these in the threads, and an independent reproduction and stress-test of the
  CHIP's security numbers was posted in the statements thread. It describes itself as "descriptive, not prescriptive."
- **Shifts:** Joemar Taganna (Paytaca) moved from "disapprove for now" to approve on 26 September 2026.

The CHIP might lock in for May 2027 or slip a year. If it slips, the earliest activation would be May 2028. The positions
listed above are only those seen in the CHIP's stakeholder file and the statements thread; many organisations in the
CHIP's outreach list had not been contacted yet.

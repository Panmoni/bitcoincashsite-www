---
title: "May 2027 upgrade (not yet decided)"
date: 2027-05-15T12:00:00Z
status: proposed
summary: "Nothing is locked in yet. The main candidate is CHIP-2025-03 Faster Blocks (1-minute blocks). The lock-in decision falls around 15 November 2026; 2027 could also ship with no consensus changes."
keywords:
  - may 2027 upgrade
  - bitcoin cash 2027 upgrade
  - 1 minute blocks
  - faster blocks bch
  - bitcoin cash block time
  - chip-2025-03
  - bch lock-in november 2026
chips:
  - chip-2025-03-faster-blocks
  - chip-2026-06-op-sighash
  - chip-2025-01-txv5
  - chip-2025-05-elliptic-curve-arithmetic
  - chip-2026-06-post-quantum-hybrid-signatures
verified: 2026-09-26
sources:
  - title: "Bitcoin Cash Node chainparams.cpp (upgrade2027ActivationTime, 'tentative')"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
  - title: "CHIP-2025-03 Faster Blocks for Bitcoin Cash"
    url: "https://gitlab.com/0353F40E/fablous"
  - title: "CHIP-2025-03 Faster Blocks: gathering statements of support (and dissent)"
    url: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095"
  - title: "CHIP-2025-03 Faster Blocks stakeholder responses"
    url: "https://gitlab.com/0353F40E/fablous/-/blob/master/stakeholders.md"
  - title: "2027 protocol upgrade ideas (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/2027-protocol-upgrade-ideas/1719"
  - title: "CHIP-2026-06 OP_SIGHASH (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2026-06-op-sighash/1869"
  - title: "CHIP-2025-01 TXv5 (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2025-01-txv5-transaction-version-5/1490"
  - title: "CHIP-2025-05 Native Elliptic Curve Arithmetic Operations (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2025-05-native-elliptic-curve-arithmetic-operations/1570"
  - title: "CHIP-2026-06 Post-Quantum and Hybrid Signatures (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2026-06-post-quantum-and-hybrid-signatures/1864"
---

## Status, as of 26 September 2026

**No CHIP is locked in for May 2027.** Here is exactly what is and is not decided:

| Item | State |
|---|---|
| Upgrade date | 15 May 2027, 12:00 UTC (MTP `1810382400`). Bitcoin Cash Node's code carries it as a "tentative" activation time. |
| Lock-in | By convention around **15 November 2026**, when chipnet activates the chosen CHIPs six months early. |
| Faster Blocks (1-minute blocks) | Proposed. Collecting stakeholder statements. Node code not finished. |
| Other CHIPs | Drafts. None has claimed a spot with clear support. |
| A "no-op" year | Possible. Some contributors have said it could even show discipline. |

The `date` on this page is the tentative activation time. It will change to "locked-in" only if and when node
releases ship the rules.

## The main candidate: Faster Blocks

[CHIP-2025-03 Faster Blocks](/chips/chip-2025-03-faster-blocks), by bitcoincashautist, proposes cutting the target
block time from 10 minutes to **1 minute**.

What it would change, per the CHIP:

- Blocks arrive 10× as often. Block reward, difficulty and the [ABLA](/glossary#abla) block size limit each scale to
  1/10 per block, so coins per hour and bytes per minute stay the same.
- The 21 million supply and halving timing do not change.
- A new "tick" unit (one second of target time) re-expresses height-based rules. Timelocks in existing contracts keep
  their meaning.
- [Median time past](/glossary#median-time-past) narrows from about 110 to about 11 minutes.
- Header chain growth rises 10×, from about 4.2 to about 42 MB per year.
- The CHIP models orphan rates of 0.41–1.94%, under its 2% tolerance.

The headline benefit: the CHIP says 95% of first confirmations would arrive in under 3 minutes. Today about 25% of
single confirmations take longer than 14 minutes.

Proposed schedule: chipnet on 15 November 2026 (MTP `1794744000`), mainnet on 15 May 2027.

## Where support stands

Statement gathering opened on 15 September 2026. Positions seen so far (see the
[CHIP page](/chips/chip-2025-03-faster-blocks) for sources):

- **Approve:** The Bitcoin Cash Podcast, Selene Wallet, BCH-1, Paytaca's CEO (who switched from "disapprove for now"
  on 26 September), Maxbit, Jonathan Silverblood, Kallisti.cash and others.
- **Neutral or abstain:** General Protocols abstained "until such time that sufficient review of the implementation
  costs and risks are done." An OPTN Wallet developer, speaking personally, endorses the
  CHIP but is neutral on activation until the code is ready.
- **Disapprove:** Calin Culianu, lead developer of Bitcoin Cash Node, disapproves "for now." His reasons: the code is
  not ready and may have bugs, and splitting today's blocks 10 ways means fewer transactions and less work per block.
  Flowee disapproves. Some users object on "if it ain't broke, don't fix it" grounds.

The Bitcoin Cash Node implementation lives in a work-in-progress branch. The CHIP author says it is near done, pending
locktime handling and tests. Node readiness is the most common reason people give for waiting.

**What this means:** 1-minute blocks might lock in this November, or slip to the 2028 cycle. Do not plan around either
outcome yet.

## Other drafts that name 2027

- [CHIP-2026-06 OP_SIGHASH](/chips/chip-2026-06-op-sighash): an opcode that pushes the transaction's signature hash.
  Its author suggested May 2027. BCHN's lead developer raised spec issues, then opened a BCHN merge request
  implementing it and said he "may end up recommending we do this for 2027."
- [CHIP-2025-01 TXv5](/chips/chip-2025-01-txv5): a new transaction format with fractional satoshis. Its author proposed
  a November 2026 lock-in, and said smaller parts might go first if the full format is too disruptive.
- [CHIP-2025-05 Elliptic Curve Arithmetic](/chips/chip-2025-05-elliptic-curve-arithmetic): `OP_ECADD` and `OP_ECMUL`.
  At least one well-known contributor said he would consider endorsing a well-specified, benchmarked version for 2027.
- [CHIP-2026-06 Post-Quantum and Hybrid Signatures](/chips/chip-2026-06-post-quantum-hybrid-signatures): early draft.

None of these has a frozen spec and a stakeholder push comparable to Faster Blocks.

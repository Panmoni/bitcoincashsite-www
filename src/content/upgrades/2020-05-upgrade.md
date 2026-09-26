---
title: "May 2020: SigChecks and OP_REVERSEBYTES"
date: 2020-05-15T12:00:00Z
status: activated
height: 635259
summary: "Replaced SigOps counting with SigChecks, which counts signature checks actually executed, and added OP_REVERSEBYTES."
keywords:
  - may 2020 upgrade
  - sigchecks
  - op_reversebytes
  - bitcoin cash phonon
  - sigops limit
chips: []
verified: 2026-09-26
sources:
  - title: "2020-MAY-15 Network Upgrade Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/2020-05-15-upgrade/"
  - title: "2020-MAY-15 SigChecks specification"
    url: "https://upgradespecs.bitcoincashnode.org/2020-05-15-sigchecks/"
  - title: "OP_REVERSEBYTES specification"
    url: "https://upgradespecs.bitcoincashnode.org/2020-05-15-op_reversebytes/"
  - title: "Bitcoin Cash Node chainparams.cpp (phononHeight)"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
---

## What changed

Activation came when the [median time past](/glossary#median-time-past) reached Unix time `1589544000`
(15 May 2020, 12:00 UTC). The first block under the new rules is height 635,259. Bitcoin Cash Node's code calls this
upgrade "Phonon".

Consensus changes:

- **SigChecks replaces SigOps.** The old rule counted signature opcodes by scanning scripts. The new rule counts the
  signature checks a script actually performs while it runs. A block may contain at most one SigCheck per 141 bytes of
  maximum block size (226,950 for a 32 MB limit). Transactions and inputs have their own limits too.
  See [SigChecks](/glossary#sigchecks).
- **[`OP_REVERSEBYTES`](/opcodes/op_reversebytes).** A new opcode that reverses the byte order of a stack item. It is
  mainly for switching between little-endian and big-endian.

Policy (non-consensus) changes: the default limits on unconfirmed ancestors and descendants in the mempool went from
25 to 50.

## Why

The SigChecks spec explains the problem. SigOps were judged by parsing scripts, not running them. The script that
creates a coin and the script that spends it live in different transactions, but the CPU work happens only when
spending. So a block could score high on SigOps and be cheap to check, or score low and be expensive.

SigChecks counts the real work, in the spending transaction, at the moment it happens. That makes the limit match the
cost it is meant to cap.

`OP_REVERSEBYTES` (spec by Tobias Ruck) fixes a practical pain. Bitcoin's protocol is almost all little-endian, but
many outside protocols are big-endian, including the Simple Ledger Protocol (SLP) token standard. Oracles signing data
for `OP_CHECKDATASIG` may use either order. Before this opcode, contracts had to flip bytes with a long chain of
`OP_SPLIT`, `OP_SWAP` and `OP_CAT`.

## What it enables

- **Fairer, safer limits.** Miners and node operators get a DoS limit that tracks actual CPU cost. Contract authors are
  no longer punished for signature opcodes that never execute.
- **Endianness in one opcode.** Contracts can read big-endian token amounts and oracle data without hand-written byte
  shuffling. The spec names SLP decentralized exchanges and revenue-sharing contracts as use cases.
- **Longer unconfirmed chains** by default (50 instead of 25). The chain limit was later
  [removed entirely in 2021](/upgrades/2021-05-upgrade).

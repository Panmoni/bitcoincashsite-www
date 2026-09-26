---
title: "Loops: Bounded Looping Operations"
code: "CHIP-2021-05"
owners:
  - Jason Dreyzehner
status: activated
upgrade: 2026-05-upgrade
summary: "Adds OP_BEGIN and OP_UNTIL, so contracts can loop, with every iteration charged by the VM cost limits."
spec: "https://github.com/bitjson/bch-loops"
discussion: "https://bitcoincashresearch.org/t/chip-2021-05-bounded-looping-operations/"
stakeholders:
  - name: "Bitcoin Cash Node"
    position: support
    source: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
  - name: "Knuth"
    position: support
    source: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
  - name: "Libauth"
    position: support
    source: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
  - name: "AlbaDsl"
    position: support
    source: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
  - name: "BCHD"
    position: neutral
    source: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
  - name: "Bitcoin Verde"
    position: neutral
    source: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
  - name: "Flowee"
    position: neutral
    source: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
  - name: "Cashonize"
    position: support
    source: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
  - name: "Selene Wallet"
    position: support
    source: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
  - name: "Coin Wallet"
    position: oppose
    source: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
verified: 2026-09-26
sources:
  - title: "CHIP-2021-05 Loops specification"
    url: "https://github.com/bitjson/bch-loops"
  - title: "Loops stakeholder responses"
    url: "https://github.com/bitjson/bch-loops/blob/master/stakeholders.md"
  - title: "2026-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2026-05-15-upgrade/"
---

## Summary

This CHIP adds two opcodes, [`OP_BEGIN`](/opcodes/op_begin) (`0x65`) and [`OP_UNTIL`](/opcodes/op_until) (`0x66`),
"enabling a variety of loop constructions in BCH contracts without increasing the processing or memory requirements of
the VM." It is the `BEGIN … UNTIL` pattern used by most Forth-like languages.

First published on 28 May 2021, it shipped five years later, after [VM Limits](/chips/chip-2021-05-vm-limits) put
the cost system it relies on in place.

## Motivation

Loops were left out of Bitcoin's VM as part of an early anti-DoS approach. The CHIP notes that approach was quietly
abandoned for explicit limits as early as 2010, but loops never came back. The result: contracts duplicate bytecode for
every repeated step, wasting space and fees.

Loops help in two ways, per the CHIP:

- **Aggregation.** Some tasks, like summing values across an unknown number of inputs or outputs, are impractical or
  impossible to express with `OP_IF` alone.
- **Shorter contracts.** Repeated procedures no longer need to be copied out in full.

## What it specifies

- `OP_BEGIN` pushes the next instruction position onto the control stack.
- `OP_UNTIL` pops the top stack item. If it is `0`, execution jumps back to just after the matching `OP_BEGIN`;
  otherwise execution continues.
- Since [VM Limits](/chips/chip-2021-05-vm-limits), every operation counts against density-based cost limits, so a loop
  cannot make validation more expensive than the same code written out in full. The CHIP includes test vectors for
  worst-case validation performance.

## Current status

Activated on 15 May 2026 (version 1.2.3 was frozen for lock-in). The stakeholder table records 86 approvals, 1
disapproval (Coin Wallet) and 425 neutral; non-responses were counted as neutral.

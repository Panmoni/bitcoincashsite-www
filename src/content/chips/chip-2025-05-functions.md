---
title: "Functions: Function Definition and Invocation Operations"
code: "CHIP-2025-05"
owners:
  - Jason Dreyzehner
status: activated
upgrade: 2026-05-upgrade
summary: "Adds OP_DEFINE and OP_INVOKE, so contract bytecode can be split into reusable, immutable functions."
spec: "https://github.com/bitjson/bch-functions"
discussion: "https://bitcoincashresearch.org/t/chip-2025-05-functions-function-definition-and-invocation-operations/1576"
stakeholders:
  - name: "Bitcoin Cash Node"
    position: support
    source: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
  - name: "Knuth"
    position: support
    source: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
  - name: "Libauth"
    position: support
    source: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
  - name: "AlbaDsl"
    position: support
    source: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
  - name: "BCHD"
    position: neutral
    source: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
  - name: "Bitcoin Verde"
    position: neutral
    source: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
  - name: "Flowee"
    position: neutral
    source: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
  - name: "Paytaca"
    position: support
    source: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
  - name: "Cashonize"
    position: support
    source: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
  - name: "Coin Wallet"
    position: oppose
    source: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
verified: 2026-09-26
sources:
  - title: "CHIP-2025-05 Functions specification"
    url: "https://github.com/bitjson/bch-functions"
  - title: "Functions stakeholder responses"
    url: "https://github.com/bitjson/bch-functions/blob/master/stakeholders.md"
  - title: "CHIP-2025-08 Functions (Takes 2 & 3) discussion"
    url: "https://bitcoincashresearch.org/t/chip-2025-08-functions-takes-2-3/"
  - title: "CHIP 2024-12 OP_EVAL: withdrawal post"
    url: "https://bitcoincashresearch.org/t/chip-2024-12-op-eval-function-evaluation/1450/91"
  - title: "2026-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2026-05-15-upgrade/"
---

## Summary

This CHIP introduces [`OP_DEFINE`](/opcodes/op_define) (`0x89`) and [`OP_INVOKE`](/opcodes/op_invoke) (`0x8a`),
"enabling Bitcoin Cash contract bytecode to be factored into reusable functions."

## Motivation

The CHIP names three benefits:

- **Smaller transactions.** Removing duplicated bytecode makes room for finite field arithmetic, pairing-based
  cryptography, zero-knowledge proofs, homomorphic encryption and post-quantum cryptography.
- **Privacy and operational security.** Contracts can be designed to leak less about their security measures, assets
  and history.
- **Auditability.** Shared logic lives in one place, so contracts are shorter and easier to review.

## What it specifies

- The VM gains a **function table**: a map from a function identifier to an immutable byte vector (the function body).
- `OP_DEFINE` pops an identifier (0 to 7 bytes) and then a body, and stores the body in the table. Redefining an
  existing identifier is an error, so functions are immutable.
- `OP_INVOKE` pops an identifier, saves the current execution position on the control stack, runs the stored body, then
  resumes after the `OP_INVOKE`.
- The number of functions and their size are bounded by existing VM limits (memory slots and the 10,000-byte stack
  element limit). Execution is charged by the [VM Limits](/chips/chip-2021-05-vm-limits) cost rules.

## History

This CHIP replaced [CHIP-2024-12 OP_EVAL](/chips/chip-2024-12-op-eval), which proposed a single "evaluate this
bytecode" opcode. Jason Dreyzehner withdrew OP_EVAL on 28 May 2025 and opened this topic with the new design. The
Bitcoin Cash Node upgrade spec links the discussion thread "CHIP-2025-08 Functions (Takes 2 & 3)", reflecting later
revisions.

## Current status

Activated on 15 May 2026 (version 2.0.2 was frozen for lock-in). The stakeholder table records 88 approvals, 1
disapproval (Coin Wallet) and 423 neutral; non-responses were counted as neutral.

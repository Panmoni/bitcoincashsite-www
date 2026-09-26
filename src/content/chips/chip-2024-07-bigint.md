---
title: "BigInt: High-Precision Arithmetic for Bitcoin Cash"
code: "CHIP-2024-07"
owners:
  - Jason Dreyzehner
status: activated
upgrade: 2025-05-vm-limits-bigint
summary: "Removes the script number length limit, so contracts can do arithmetic on numbers up to the 10,000-byte stack item size."
spec: "https://github.com/bitjson/bch-bigint"
discussion: "https://bitcoincashresearch.org/t/chip-2024-07-bigint-high-precision-arithmetic-for-bitcoin-cash/"
stakeholders:
  - name: "Bitcoin Cash Node"
    position: support
    source: "https://github.com/bitjson/bch-bigint/blob/master/stakeholders.md"
  - name: "BCHD"
    position: support
    source: "https://github.com/bitjson/bch-bigint/blob/master/stakeholders.md"
  - name: "Bitcoin Verde"
    position: support
    source: "https://github.com/bitjson/bch-bigint/blob/master/stakeholders.md"
  - name: "Libauth"
    position: support
    source: "https://github.com/bitjson/bch-bigint/blob/master/stakeholders.md"
  - name: "Bitcoin Unlimited"
    position: neutral
    source: "https://github.com/bitjson/bch-bigint/blob/master/stakeholders.md"
  - name: "Knuth"
    position: oppose
    source: "https://github.com/bitjson/bch-bigint/blob/master/stakeholders.md"
  - name: "Flowee"
    position: oppose
    source: "https://github.com/bitjson/bch-bigint/blob/master/stakeholders.md"
  - name: "Paytaca"
    position: support
    source: "https://github.com/bitjson/bch-bigint/blob/master/stakeholders.md"
  - name: "Selene Wallet"
    position: support
    source: "https://github.com/bitjson/bch-bigint/blob/master/stakeholders.md"
verified: 2026-09-26
sources:
  - title: "CHIP-2024-07 BigInt specification"
    url: "https://github.com/bitjson/bch-bigint"
  - title: "BigInt stakeholder responses"
    url: "https://github.com/bitjson/bch-bigint/blob/master/stakeholders.md"
  - title: "2025-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2025-05-15-upgrade/"
---

## Summary

BigInt builds on [VM Limits](/chips/chip-2021-05-vm-limits) by removing one more limit: the maximum length of VM
numbers (`nMaxNumSize`). Numbers had been capped at 8 bytes (64-bit) since
[2022](/chips/chip-2021-03-bigger-script-integers). See [BigInt](/glossary#bigint).

## Motivation

"Many financial and cryptographic applications require higher-precision arithmetic than is currently available to
Bitcoin Cash contracts." Before VM Limits, the anti-DoS design could not safely allow bigger numbers. Once VM Limits
charges arithmetic by its real cost, higher precision can be enabled "without increasing the processing or memory
requirements of the VM."

The CHIP lists two benefits:

- **Safer contracts.** No more math emulation, which is hard to review. Fewer overflows mean fewer bugs that could
  expose users to losses.
- **Smaller transactions.** Removing emulation code shrinks contracts and lowers fees.

## What it specifies

- The number length limit is removed.
- The 10,000-byte stack element limit from VM Limits still bounds both operands and results.
- Arithmetic operations are charged by the VM Limits operation cost rules, so a huge multiplication costs more than a
  small one.

## Current status

Final. Activated on 15 May 2025. Proposed together with VM Limits, which it requires.

The stakeholder table records 124 approvals, 4 disapprovals (Flowee, Knuth, Flowee Pay, Flowee Products) and 345
neutral; non-responses were counted as neutral.

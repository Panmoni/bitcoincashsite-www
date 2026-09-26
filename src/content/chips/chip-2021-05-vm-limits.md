---
title: "VM Limits: Targeted Virtual Machine Limits"
code: "CHIP-2021-05"
owners:
  - Jason Dreyzehner
status: activated
upgrade: 2025-05-vm-limits-bigint
summary: "Replaces the 201-opcode limit and 520-byte stack item limit with density-based operation-cost and hashing limits, and raises stack items to 10,000 bytes."
spec: "https://github.com/bitjson/bch-vm-limits"
discussion: "https://bitcoincashresearch.org/t/chip-2021-05-targeted-virtual-machine-limits/437"
stakeholders:
  - name: "Bitcoin Cash Node"
    position: support
    source: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
  - name: "BCHD"
    position: support
    source: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
  - name: "Bitcoin Verde"
    position: support
    source: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
  - name: "Knuth"
    position: support
    source: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
  - name: "Libauth"
    position: support
    source: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
  - name: "Bitcoin Unlimited"
    position: neutral
    source: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
  - name: "Flowee"
    position: oppose
    source: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
  - name: "Paytaca"
    position: support
    source: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
  - name: "Cashonize"
    position: support
    source: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
  - name: "Bitcoin.com Wallet"
    position: support
    source: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
verified: 2026-09-26
sources:
  - title: "CHIP-2021-05 VM Limits specification"
    url: "https://github.com/bitjson/bch-vm-limits"
  - title: "VM Limits stakeholder responses"
    url: "https://github.com/bitjson/bch-vm-limits/blob/master/stakeholders.md"
  - title: "2025-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2025-05-15-upgrade/"
---

## Summary

This CHIP "re-targets virtual machine (VM) limits to enable more advanced Bitcoin Cash contracts, reduce transaction
sizes, and reduce full node compute requirements." See [VM limits](/glossary#vm-limits).

## Motivation

- **More advanced contracts.** The 201-opcode limit and the 520-byte P2SH contract limit forced authors to cut features
  or split logic into "harder-to-audit, multi-input systems."
- **Larger stack items.** Bigger items enable post-quantum cryptography, stronger escrow and settlement strategies,
  larger hash preimages, zero-knowledge proofs and homomorphic encryption.
- **Accurate cost accounting.** The old limits were blunt: they blocked useful contracts without measuring real
  validation cost well.

## What it specifies

- The **201-operation limit is removed**, replaced by an **operation cost limit** of 800 per byte of "density control
  length" (the input's unlocking bytecode length plus 41). Every stack push costs its length; hashing, signature checks
  and expensive arithmetic cost more.
- The **stack element limit** rises from 520 to 10,000 bytes, equal to the maximum script size.
- A **hashing limit**: about 3.5 digest iterations per density byte in blocks, 0.5 for standard transactions.
- A **control stack limit** keeps the existing maximum `OP_IF`/`OP_NOTIF` nesting depth of 100.
- The standard unlocking bytecode limit (1,650 bytes) stays unchanged, to narrow scope. The
  [2026 P2S CHIP](/chips/chip-2024-12-p2s) later removed it.

Because every limit scales with transaction size, a larger contract gets a larger budget, yet worst-case validation
cost per byte stays bounded.

## Current status

Final. Activated on 15 May 2025 with [BigInt](/chips/chip-2024-07-bigint). The stakeholder table records 127
approvals, 3 disapprovals (Flowee, Flowee Pay and Flowee Products) and 343 neutral; non-responses were counted as neutral.

The cost system it introduced is what made [loops](/chips/chip-2021-05-loops),
[functions](/chips/chip-2025-05-functions) and [bitwise ops](/chips/chip-2025-05-bitwise) safe to add in 2026.

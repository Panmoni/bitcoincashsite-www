---
title: "Bitwise: Re-Enable Bitwise Operations"
code: "CHIP-2025-05"
owners:
  - Jason Dreyzehner
status: activated
upgrade: 2026-05-upgrade
summary: "Enables OP_INVERT plus numeric and binary left/right shifts, completing Script's bitwise toolkit."
spec: "https://github.com/bitjson/bch-bitwise"
discussion: "https://bitcoincashresearch.org/t/chip-2025-05-bitwise-re-enable-bitwise-operations/1580"
stakeholders:
  - name: "Bitcoin Cash Node"
    position: support
    source: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
  - name: "Knuth"
    position: support
    source: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
  - name: "Libauth"
    position: support
    source: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
  - name: "AlbaDsl"
    position: support
    source: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
  - name: "BCHD"
    position: neutral
    source: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
  - name: "Bitcoin Verde"
    position: neutral
    source: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
  - name: "Flowee"
    position: neutral
    source: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
  - name: "Paytaca"
    position: support
    source: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
  - name: "OPTN"
    position: support
    source: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
  - name: "Coin Wallet"
    position: oppose
    source: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
verified: 2026-09-26
sources:
  - title: "CHIP-2025-05 Bitwise specification"
    url: "https://github.com/bitjson/bch-bitwise"
  - title: "Bitwise stakeholder responses"
    url: "https://github.com/bitjson/bch-bitwise/blob/master/stakeholders.md"
  - title: "2026-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2026-05-15-upgrade/"
---

## Summary

This CHIP "re-enables bitwise operations, enabling Bitcoin Cash contracts to more efficiently implement a variety of
financial and cryptographic applications."

## Motivation

The [May 2018 upgrade](/upgrades/2018-05-upgrade) restored [`OP_AND`](/opcodes/op_and), [`OP_OR`](/opcodes/op_or) and
[`OP_XOR`](/opcodes/op_xor), but bit inversion and shifts stayed disabled. The CHIP's summary gives the reason to
enable them: more efficient financial and cryptographic contracts. The CHIP itself is short on examples; its
rationale and alternatives live in separate documents in the repository.

With [VM Limits](/chips/chip-2021-05-vm-limits) charging each operation by the bytes it pushes, these opcodes fit into
the existing cost system. A shift whose result would exceed the maximum stack item length fails.

## What it specifies

Five opcodes:

| Opcode | Code | Does |
|---|---|---|
| [`OP_INVERT`](/opcodes/op_invert) | `0x83` | bitwise NOT of every byte |
| [`OP_LSHIFTNUM`](/opcodes/op_lshiftnum) | `0x8d` | numeric left shift |
| [`OP_RSHIFTNUM`](/opcodes/op_rshiftnum) | `0x8e` | numeric right shift |
| [`OP_LSHIFTBIN`](/opcodes/op_lshiftbin) | `0x98` | binary (bit-string) left shift |
| [`OP_RSHIFTBIN`](/opcodes/op_rshiftbin) | `0x99` | binary (bit-string) right shift |

Each is charged the base instruction cost plus the length of its result.

## Current status

Activated on 15 May 2026 (version 1.1.1 was frozen for lock-in). The stakeholder table records 91 approvals, 1
disapproval (Coin Wallet) and 420 neutral; non-responses were counted as neutral.

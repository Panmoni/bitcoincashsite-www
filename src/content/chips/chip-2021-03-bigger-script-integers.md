---
title: "Bigger Script Integers"
code: "CHIP-2021-03"
owners:
  - Jason Dreyzehner
  - Rosco Kalis
  - Jonathan Silverblood
status: activated
upgrade: 2022-05-upgrade
summary: "Expanded script numbers from 32-bit to 64-bit and re-enabled OP_MUL, with overflow-checked arithmetic."
spec: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Bigger-Script-Integers.md"
discussion: "https://bitcoincashresearch.org/t/chip-2021-03-bigger-script-integers/39"
stakeholders:
  - name: "Bitcoin Unlimited"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Bigger-Script-Integers.md"
  - name: "Bitcoin Cash Node"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Bigger-Script-Integers.md"
  - name: "Knuth"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Bigger-Script-Integers.md"
  - name: "Bitcoin Verde"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Bigger-Script-Integers.md"
  - name: "Bitauth"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Bigger-Script-Integers.md"
verified: 2026-09-26
sources:
  - title: "CHIP-2021-03: Bigger Script Integers"
    url: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Bigger-Script-Integers.md"
  - title: "2022-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2022-05-15-upgrade/"
---

## Summary

This CHIP widens the integer range in BCH contracts from 32-bit to 64-bit numbers and re-enables multiplication
([`OP_MUL`](/opcodes/op_mul)).

Note on naming: the BCHN upgrade spec calls it CHIP-2021-03, while the published file is named
`CHIP-2021-02-Bigger-Script-Integers.md`. They are the same proposal.

## Motivation

VM math was limited to signed 32-bit integers, so contracts could not handle values above 2,147,483,647. In satoshis,
that is about 21 BCH. Workarounds to emulate bigger math were "often impractical, difficult to secure, and
significantly increase transaction sizes." The CHIP notes that Bitcoin always did 64-bit math internally; the 32-bit
cap only avoided defining overflow behaviour.

## What it specifies

- Script numbers may be up to 8 bytes, covering values up to 9,223,372,036,854,775,807. That exceeds the total possible
  satoshi value of any output (about 2.1 quadrillion).
- All arithmetic uses signed 64-bit operations with overflow detection. An overflow fails the script.
- A result equal to the minimum value (−9,223,372,036,854,775,808), which would need 9 bytes, also fails.
- `OP_MUL` is re-enabled at its original codepoint `0x95` with overflow-checked multiplication.
- Cryptographic and arithmetic operations stay separate.

## Current status

Activated on 15 May 2022 alongside [Native Introspection](/chips/chip-2021-02-native-introspection-opcodes). The CHIP's
milestones record acceptance by Bitcoin Unlimited, Bitcoin Cash Node, Knuth, Bitcoin Verde and Bitauth. General
Protocols' statement says working around the 32-bit limit had cost it "a large amount of time and money."

The number-size limit was removed entirely in 2025 by [BigInt](/chips/chip-2024-07-bigint).

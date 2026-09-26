---
title: "Native Elliptic Curve Arithmetic Operations"
code: "CHIP-2025-05"
owners:
  - lightswarm
status: draft
summary: "Proposes OP_ECADD and OP_ECMUL for elliptic curve point addition and scalar multiplication in Script, aimed at zero-knowledge proofs and signature aggregation."
spec: "https://github.com/lightswarm124/bch-ec-arithmetic"
discussion: "https://bitcoincashresearch.org/t/chip-2025-05-native-elliptic-curve-arithmetic-operations/1570"
stakeholders: []
verified: 2026-09-26
sources:
  - title: "CHIP 2025-05 Native Elliptic Curve Arithmetic Operations (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2025-05-native-elliptic-curve-arithmetic-operations/1570"
  - title: "bch-ec-arithmetic repository"
    url: "https://github.com/lightswarm124/bch-ec-arithmetic"
  - title: "2027 protocol upgrade ideas (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/2027-protocol-upgrade-ideas/1719"
---

## Summary

The proposal adds two opcodes, `OP_ECADD` (elliptic curve point addition) and `OP_ECMUL` (scalar multiplication), so
contracts can do elliptic curve math directly.

Note: this CHIP shares the "CHIP-2025-05" date prefix with the unrelated [Functions](/chips/chip-2025-05-functions)
and [Bitwise](/chips/chip-2025-05-bitwise) CHIPs.

## Motivation

From the author: native EC operations would let BCH contracts "natively validate zero-knowledge proofs, enable
signature aggregation, and lay the groundwork for scalable privacy and off-chain protocols like Bulletproofs – all
without resorting to trusted setups or external proof systems."

These operations can already be approximated with covenants and [loops](/chips/chip-2021-05-loops), but "at a massive
cost in complexity, size, and execution cost."

## What it specifies

The initial draft specifies point addition and scalar multiplication. Later discussion noted that a 2027 activation
would need a fully specified version published soon, possibly with more opcodes beyond these two.

## Current status

Draft, first posted 23 May 2025. In the "2027 protocol upgrade ideas" thread (December 2025), kzKallisti listed it among
notable CHIPs that were "incomplete and lacking consensus." In August 2026 he said he "would consider endorsing a
well-specced, benchmarked, and tested CHIP for 2027 lock-in." It is not locked in, and no formal stakeholder statements
were found. The BCH Podcast noted a sentiment page for it on consensus.cash.

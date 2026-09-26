---
title: "OP_SIGHASH"
code: "CHIP-2026-06"
owners:
  - bitcoincashautist
status: draft
upgrade: 2027-05-upgrade
summary: "Proposes an opcode that computes the transaction's signature hash and pushes it to the stack, without checking a signature."
spec: "https://gitlab.com/0353F40E/sighash"
discussion: "https://bitcoincashresearch.org/t/chip-2026-06-op-sighash/1869"
stakeholders: []
verified: 2026-09-26
sources:
  - title: "Chip-2026-06: OP_SIGHASH (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2026-06-op-sighash/1869"
  - title: "OP_SIGHASH early discussion (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/op-sighash-early-discussion-exploration-use-cases/1718"
  - title: "OP_SIGHASH CHIP repository"
    url: "https://gitlab.com/0353F40E/sighash"
---

## Summary

`OP_SIGHASH` would pop a sighash-type byte and push the resulting 32-byte signature hash (sighash) of the current
transaction. It does not verify a signature. The author frames it as completing the "checksig unbundling": a
signature check is a sighash computation followed by a signature verification over that digest, as
[`OP_CHECKDATASIG`](/opcodes/op_checkdatasig) already does for arbitrary messages.

## Motivation

The author calls it "low hanging fruit which we can get nearly for free": the VM already computes sighashes inside
[`OP_CHECKSIG`](/opcodes/op_checksig). Exposing the digest lets contracts reason about exactly what a signature
commits to, which helps oracle and covenant patterns.

## What it specifies

- Uses the same sighash algorithm, type flags and scriptCode conventions as `OP_CHECKSIG`.
- No new cryptography or sighash algorithm.

Reviewer Calin Culianu (Bitcoin Cash Node) pointed out that the CHIP's detailed section uses a single SHA-256 for the
final digest, while `OP_CHECKSIG` uses double SHA-256, so the "identical digest" claim needs fixing. He also asked for
a defined result in the `SIGHASH_SINGLE` corner case where the input index exceeds the output count.

## Current status

Draft, posted 14 June 2026, with the author suggesting May 2027. In August 2026 Calin Culianu said he had worked around
his concerns, opened a Bitcoin Cash Node merge request implementing it, and "may end up recommending we do this for
2027." It is not locked in. No formal stakeholder statements were found.

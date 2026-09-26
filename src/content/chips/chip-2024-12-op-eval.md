---
title: "OP_EVAL: Function Evaluation"
code: "CHIP-2024-12"
owners:
  - Jason Dreyzehner
status: superseded
summary: "Proposed a single OP_EVAL opcode to run bytecode from the stack as a function. Withdrawn in May 2025 and replaced by the Functions CHIP (OP_DEFINE/OP_INVOKE), which activated in 2026."
spec: "https://github.com/bitjson/bch-eval"
discussion: "https://bitcoincashresearch.org/t/chip-2024-12-op-eval-function-evaluation/1450"
stakeholders: []
verified: 2026-09-26
sources:
  - title: "CHIP 2024-12 OP_EVAL: Function Evaluation (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2024-12-op-eval-function-evaluation/1450"
  - title: "Withdrawing OP_EVAL (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2024-12-op-eval-function-evaluation/1450/91"
  - title: "CHIP-2025-05 Functions specification"
    url: "https://github.com/bitjson/bch-functions"
---

## Summary

OP_EVAL (Function Evaluation) "would let Bitcoin Cash contracts be efficiently factored into reusable functions," to
shrink contracts for finite field arithmetic, pairing-based cryptography, zero-knowledge proofs, homomorphic encryption
and post-quantum cryptography.

Note: it shares the "CHIP-2024-12" prefix with [P2S](/chips/chip-2024-12-p2s), a separate CHIP.

## Motivation

The same as its successor: remove duplicated bytecode from contracts. OP_EVAL took the simplest route, one opcode that
executes a stack item as code.

## Current status

**Superseded.** On 28 May 2025, Jason Dreyzehner posted "Withdrawing OP_EVAL" and opened a new topic for
[CHIP-2025-05 Functions](/chips/chip-2025-05-functions), which uses `OP_DEFINE` and `OP_INVOKE` with immutable,
pre-defined function bodies. The thread debated static analysis of contracts at length. Functions activated in the
[May 2026 upgrade](/upgrades/2026-05-upgrade).

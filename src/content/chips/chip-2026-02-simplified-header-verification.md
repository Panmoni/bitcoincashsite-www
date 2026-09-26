---
title: "Simplified Header Verification (SHV)"
code: "CHIP-2026-02"
owners:
  - bitcoincashautist
status: draft
summary: "Proposes a Merkle Mountain Range commitment over block headers so light wallets can verify header history with a small, fixed-size state instead of downloading every header."
spec: "https://gitlab.com/0353F40E/mmr"
discussion: "https://bitcoincashresearch.org/t/chip-2026-02-simplified-header-verification-for-bitcoin-cash/1750"
stakeholders: []
verified: 2026-09-26
sources:
  - title: "CHIP-2026-02: Simplified Header Verification for Bitcoin Cash (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2026-02-simplified-header-verification-for-bitcoin-cash/1750"
  - title: "CHIP-2025-03 Faster Blocks, Deployment section"
    url: "https://gitlab.com/0353F40E/fablous"
---

## Summary

SHV applies the idea behind [SPV](/glossary#spv) to block headers. A server keeps a Merkle Mountain Range (MMR), an
append-only accumulator over all headers, and can prove any past header against the latest root. A light wallet holds
only the latest accumulator state, O(log n) hashes, and can extend it itself as new headers arrive.

## Motivation

The author found the data structure while working on [Faster Blocks](/chips/chip-2025-03-faster-blocks), which would
grow the header chain 10×, from about 4.2 to about 42 MB per year. SHV makes the header data a light wallet must keep
fixed-size, whatever the block rate. It is useful even if block times never change.

The author cites prior art: the "History Tree" (Crosby and Wallach, 2009), later called a Merkle Mountain Range (Todd,
2012), and work describing it as the optimal accumulator for append-only data.

## What it specifies

- A header-chain MMR that nodes can compute and serve.
- A P2P protocol extension for header roots and Merkle proofs.
- A client specification, revised in March 2026 to guard against CVE-2012-2459 (duplicate sub-tree issue in Bitcoin's
  Merkle tree construction), which could otherwise let a server lie about a header's height.

The Faster Blocks CHIP lists SHV work, including a Bitcoin Cash Node merge request and Electron Cash pull requests, as
related actions that can be done "at any time, ahead or after changing consensus rules."

## Current status

Draft, posted 25 February 2026. No formal stakeholder statements were found.

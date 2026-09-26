---
title: "CashTokens FT+NFT Ambiguity Fix"
code: "CHIP-2026-06"
owners:
  - bitcoincashautist
status: withdrawn
summary: "Proposed banning new outputs that hold both fungible tokens and a zero-byte immutable NFT, which contracts cannot tell apart from FT-only outputs. Retracted two days after publication."
spec: "https://gitlab.com/0353F40E/nfta/-/blob/master/readme.md"
discussion: "https://bitcoincashresearch.org/t/retracted-chip-2026-06-cashtokens-ft-nft-ambiguity-fix/1870"
stakeholders: []
verified: 2026-09-26
sources:
  - title: "RETRACTED CHIP-2026-06 CashTokens FT+NFT Ambiguity Fix (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/retracted-chip-2026-06-cashtokens-ft-nft-ambiguity-fix/1870"
---

## Summary

Under the [CashTokens](/chips/chip-2022-02-cashtokens) introspection opcodes, a UTXO holding both a fungible token
amount and an immutable NFT with a zero-byte commitment looks the same as a UTXO holding only the fungible tokens. This
maintenance CHIP proposed a consensus rule forbidding new outputs with that combination. Existing ones would stay
spendable but would have to be split when spent.

## Motivation

The author wanted "future-proofing": so a contract could commit to an entire transaction, using loops and
introspection, without these "invisible" bits leaking through. A blockchain scan found the combination only a few
times.

## Current status

**Withdrawn.** Posted 14 June 2026 and retracted 16 June 2026. The author's reason: the fix "is not really free." It
would push technical debt onto wallet developers, who would have to handle this edge case when merging a user's
balances into fewer UTXOs. Discussion noted that issuers can avoid the problem by never emitting null NFTs, though
category-agnostic contracts like TapSwap may still be affected.

Note: this shares the "CHIP-2026-06" prefix with the unrelated [OP_SIGHASH](/chips/chip-2026-06-op-sighash) and
[Post-Quantum Signatures](/chips/chip-2026-06-post-quantum-hybrid-signatures) proposals.

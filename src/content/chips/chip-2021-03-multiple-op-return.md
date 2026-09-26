---
title: "Multiple OP_RETURNs for Bitcoin Cash"
code: "CHIP-2021-03-12"
owners:
  - Benjamin Scherrey
  - Jonathan Silverblood
  - BigBlockIfTrue
status: activated
upgrade: 2021-05-upgrade
summary: "Made transactions with more than one OP_RETURN data output standard, keeping the 223-byte total limit."
spec: "https://github.com/ActorForth/Auction-Protocol/blob/main/CHIP-2021-03-12_Multiple_OP_RETURN_for_Bitcoin_Cash.md"
discussion: "https://bitcoincashresearch.org/t/multiple-op-returns-this-time-for-real/315"
stakeholders: []
verified: 2026-09-26
sources:
  - title: "Multiple OP_RETURNs for Bitcoin Cash (BCHN upgrade specs copy)"
    url: "https://upgradespecs.bitcoincashnode.org/CHIP-2021-03-12_Multiple_OP_RETURN_for_Bitcoin_Cash/"
  - title: "2021-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2021-05-15-upgrade/"
---

## Summary

Before May 2021, a standard transaction could carry only one [`OP_RETURN`](/glossary#op-return) data output. This
CHIP lets a transaction carry several. The existing 223-byte limit now applies to the total across all of them.

Benjamin Scherrey owned the document, Jonathan Silverblood had the earlier concept, and BigBlockIfTrue wrote the
technical spec. It was first published in ActorForth's auction-protocol repository.

## Motivation

`OP_RETURN` is the agreed place for data that nodes can ignore and never need to keep in the UTXO set. Protocols built
on it (tokens, social apps, auctions) each want their own output. With only one allowed, two protocols could not share
one transaction. The workaround, storing data in spendable outputs, bloats the UTXO set, which the CHIP calls an
undesirable alternative.

The authors kept the byte cap unchanged on purpose. They stayed "silent" on whether 223 bytes is right, to make the
change as small and low-risk as possible and easy to agree on for May 2021.

## What it specifies

- Transactions with multiple `OP_RETURN` outputs are standard.
- The 223-byte limit applies across all `OP_RETURN` outputs in the transaction combined.
- Policy only. No consensus rule changed.

## Current status

Activated with the [May 2021 upgrade](/upgrades/2021-05-upgrade). The later
[P2S CHIP](/chips/chip-2024-12-p2s) (2026) kept the same cumulative 223-byte data-carrier rule.

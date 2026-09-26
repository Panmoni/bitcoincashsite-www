---
title: "November 2018: CTOR, OP_CHECKDATASIG and the BSV split"
date: 2018-11-15T16:40:00Z
status: activated
height: 556767
summary: "Canonical transaction ordering (CTOR), OP_CHECKDATASIG, a 100-byte minimum transaction size, push-only and clean-stack rules. A rival group forked off as Bitcoin SV."
keywords:
  - november 2018 upgrade
  - ctor
  - op_checkdatasig
  - bitcoin sv split
  - bch bsv hash war
  - magnetic anomaly
chips: []
verified: 2026-09-26
sources:
  - title: "2018 November 15 Network Upgrade Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/2018-nov-upgrade/"
  - title: "OP_CHECKDATASIG and OP_CHECKDATASIGVERIFY Specification"
    url: "https://upgradespecs.bitcoincashnode.org/op_checkdatasig/"
  - title: "Bitcoin Cash Node chainparams.cpp (magneticAnomalyHeight)"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
  - title: "Bitcoin Satoshi Vision (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bitcoin_Satoshi_Vision"
  - title: "The November 2018 Bitcoin Cash Fork (Bitwise)"
    url: "https://bitwiseinvestments.com/crypto-market-insights/the-november-2018-bitcoin-cash-fork"
---

## What changed

Activation came when the [median time past](/glossary#median-time-past) reached Unix time `1542300000`
(15 November 2018, 16:40 UTC). The first block under the new rules is height 556,767.

Consensus changes:

- **Canonical transaction order ([CTOR](/glossary#ctor)).** After the coinbase, transactions in a block must be sorted by
  transaction ID. The old rule (a child after its parent) was dropped.
- **[`OP_CHECKDATASIG`](/opcodes/op_checkdatasig) and [`OP_CHECKDATASIGVERIFY`](/opcodes/op_checkdatasigverify).**
  These check a signature against any message and public key, not just the spending transaction.
- **Minimum transaction size: 100 bytes.** This blocked a known Merkle-tree weakness that lets an attacker fool
  [SPV](/glossary#spv) wallets with a 64-byte transaction.
- **Push-only scriptSig.** Unlocking scripts may only push data (BIP 62 rule 2).
- **Clean stack.** Exactly one true value must remain after script execution (BIP 62 rule 6).

## Why

- **CTOR** was pushed by developers who expected a fixed transaction order to help future scaling work, such as
  block propagation and validation.
- **CHECKDATASIG** was the headline smart-contract feature. It lets a script accept data signed by an outside party,
  such as an [oracle](/glossary#oracle) publishing a price.
- **Push-only and clean-stack** closed off third-party malleation of transactions.

## The split

Not everyone agreed. A group backed by Craig Wright and Calvin Ayre opposed CTOR and `OP_CHECKDATASIG`. They released
Bitcoin SV with a 128 MB block limit and no replay protection. The chain split on 15 November 2018. Both sides spent
hashpower at a loss for weeks in a "hash war". The chain following these rules kept the Bitcoin Cash name and ticker;
the other became BSV. See [BCH vs BSV](/compare/bch-vs-bsv).

## What it enables

- **Oracle contracts.** A contract can pay out based on a signed price or event, checked on-chain.
- **Early [covenants](/glossary#covenant).** Checking the same signature with both `OP_CHECKDATASIG` and
  `OP_CHECKSIG` lets a script see parts of its own spending transaction. Contracts used workarounds like this until
  [native introspection arrived in 2022](/upgrades/2022-05-upgrade).

The 100-byte minimum later proved too strict and was lowered to 65 bytes [in 2023](/upgrades/2023-05-cashtokens).

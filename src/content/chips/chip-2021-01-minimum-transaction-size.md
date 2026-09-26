---
title: "Minimum Transaction Size (Allow Smaller Transactions)"
code: "CHIP-2021-01"
owners:
  - Tom Zander
status: activated
upgrade: 2023-05-cashtokens
summary: "Lowered the minimum transaction size from 100 bytes to 65 bytes, still blocking the 64-byte Merkle-tree attack."
spec: "https://gitlab.com/bitcoin.cash/chips/-/blob/00e55fbfdaacf1436e455289086d9b4c6b3e7306/CHIP-2021-01-Allow%20Smaller%20Transactions.md"
discussion: "https://bitcoincashresearch.org/t/chip-2021-01-allow-transactions-to-be-smaller-in-size/154"
stakeholders: []
verified: 2026-09-26
sources:
  - title: "2023-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2023-05-15-upgrade/"
  - title: "CHIP 2021-01 Allow Transactions to be smaller in size (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2021-01-allow-transactions-to-be-smaller-in-size/154"
  - title: "BCHN MR !1598: Allow for txn sizes as small as 65 bytes"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/merge_requests/1598"
  - title: "Bitcoin Cash Upgrade 2023 (bitjson's blog)"
    url: "https://blog.bitjson.com/bitcoin-cash-upgrade-2023/"
---

## Summary

The [November 2018 upgrade](/upgrades/2018-11-upgrade) made transactions under 100 bytes invalid. This CHIP lowered
the minimum to 65 bytes.

## Motivation

The 100-byte rule blocks a known weakness in Bitcoin's Merkle tree: a 64-byte transaction can be confused with an
inner tree node, which lets an attacker fool [SPV](/glossary#spv) wallets. But 100 bytes was more than needed.

Tom Zander's original post lists the costs:

- A default coinbase transaction is smaller than 100 bytes, so mining software had to pad it or risk invalid blocks.
- Many valid, useful non-P2PKH transactions fit in fewer than 100 bytes.

The first draft proposed banning exactly 64 bytes. Discussion settled on a simple minimum of 65 instead, so the range
of valid sizes stays one continuous interval. Calin Culianu implemented it in Bitcoin Cash Node.

## What it specifies

From the May 2023 upgrade, a transaction must be at least 65 bytes. Transactions of 64 bytes or fewer are invalid.

## Current status

Activated on 15 May 2023 with [CashTokens](/upgrades/2023-05-cashtokens). bitjson's summary of the upgrade: "Allowing
transactions to be as small as 65 bytes avoids wasting bandwidth and storage."

No formal stakeholder table was found for this CHIP.

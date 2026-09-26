---
title: "Restrict Transaction Version"
code: "CHIP-2021-01"
owners:
  - Tom Zander
  - Jonathan Silverblood
  - bitcoincashautist
status: activated
upgrade: 2023-05-cashtokens
summary: "Made transaction versions other than 1 and 2 invalid by consensus, so a future transaction format can use a never-before-seen version number."
spec: "https://gitlab.com/bitcoin.cash/chips/-/blob/3b0e5d55e1e139046794e850287b7acb795f4e66/CHIP-2021-01-Restrict%20Transaction%20Versions.md"
discussion: "https://bitcoincashresearch.org/t/restrict-transaction-version-numbers/173"
stakeholders: []
verified: 2026-09-26
sources:
  - title: "2023-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2023-05-15-upgrade/"
  - title: "Restrict transaction version numbers (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/restrict-transaction-version-numbers/173"
  - title: "Bitcoin Cash Upgrade 2023 (bitjson's blog)"
    url: "https://blog.bitjson.com/bitcoin-cash-upgrade-2023/"
---

## Summary

Before 2023, only relay policy limited transactions to version 1 or 2. Any version number was valid by consensus. This
CHIP makes versions 1 and 2 the only valid ones, at the consensus level.

The BCHN upgrade spec lists it as "CHIP-2021-01 Restrict Transaction Version". It shares the 2021-01 number with the
separate [Minimum Transaction Size](/chips/chip-2021-01-minimum-transaction-size) CHIP.

## Motivation

Mark Lundeberg set out the problem in the 2020 discussion thread. Any new transaction format should use a
never-before-seen version number. Then software can tell old and new formats apart from the first four bytes, with no
other context.

But while any version was valid by consensus, a disruptive miner could mine old-format transactions using the number
reserved for a new format, before it activated. Parsers would then need to know which block a transaction came from to
read it. "Context-free parsing is very valuable and worth keeping."

The thread also estimated the cost as near zero: miners use version 1 for coinbase transactions, and wallets were
already bound by the policy rule.

## What it specifies

From the May 2023 upgrade (median time past `1684152000`), a transaction with a version other than 1 or 2 is invalid.

## Current status

Activated on 15 May 2023 with [CashTokens](/upgrades/2023-05-cashtokens). bitjson's upgrade summary credits Tom
Zander, Jonathan Silverblood and bitcoincashautist as proposers. It clears the way for a future format such as
[TXv5](/chips/chip-2025-01-txv5).

No formal stakeholder table was found for this CHIP.

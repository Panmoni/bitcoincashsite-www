---
title: "Unconfirmed Transaction Chain Limit"
code: "CHIP (unnumbered, 2021)"
owners:
  - Josh Green (Software Verde)
  - John Jamiel (Software Verde)
  - Doug McCollough (City of Dublin, OH)
  - Emil Oldenburg (Bitcoin.com)
  - Mark Lamb (CoinFLEX)
status: activated
upgrade: 2021-05-upgrade
summary: "Removed the relay-policy limit of 50 chained unconfirmed transactions, so apps can send dependent payments without waiting for a block."
spec: "https://github.com/softwareverde/bitcoin-cash-chips/blob/master/unconfirmed-transaction-chain-limit.md"
discussion: "https://bitcoincashresearch.org/t/chip-unconfirmed-transaction-chain-limit/302"
stakeholders:
  - name: "Software Verde"
    position: support
    source: "https://upgradespecs.bitcoincashnode.org/unconfirmed-transaction-chain-limit/"
  - name: "Bitcoin.com"
    position: support
    source: "https://upgradespecs.bitcoincashnode.org/unconfirmed-transaction-chain-limit/"
  - name: "CoinFLEX"
    position: support
    source: "https://upgradespecs.bitcoincashnode.org/unconfirmed-transaction-chain-limit/"
verified: 2026-09-26
sources:
  - title: "Unconfirmed Transaction Chain Limit (BCHN upgrade specs copy, v1.2)"
    url: "https://upgradespecs.bitcoincashnode.org/unconfirmed-transaction-chain-limit/"
  - title: "2021-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2021-05-15-upgrade/"
---

## Summary

Before May 2021, nodes relayed a chain of at most 50 unconfirmed transactions, each spending an output of the one
before. Anything past the 50th link was often dropped, even though it was valid. This CHIP removed the limit entirely
at the [May 2021 upgrade](/upgrades/2021-05-upgrade).

It is a relay-policy change, not a consensus change. No block validity rule changed.

## Motivation

The CHIP lists the problems:

- A broadcast transaction cannot be taken back. If the network ignores it, the money is in limbo.
- Nodes often rejected over-limit transactions silently, and wallets could not tell how deep a chain already was.
- Long gaps between blocks made it worse.
- The limit mostly served Child-Pays-For-Parent, which research by Tom Zander found almost unused on BCH.

The authors' own cases: CoinFLEX token dividend payouts failed; a City of Dublin identity beta saw sign-ups fail;
new users at meetups hit the limit passing coins around.

## What it specifies

Once [median time past](/glossary#median-time-past) reaches `1621080000` (15 May 2021, 12:00 UTC), the policy limit
of 50 unconfirmed ancestors or descendants is removed. The removal stays in effect even if a re-org moves the chain
back below that time.

The CHIP warns that the change must be coordinated: if nodes relay different chains, merchants accepting
[0-conf](/glossary#zero-conf) payments face more double-spend risk.

## Current status

Activated on 15 May 2021. Stakeholders listed are the organisations whose people co-authored the CHIP.

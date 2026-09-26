---
title: "May 2021: no chain limit, multiple OP_RETURNs"
date: 2021-05-15T12:00:00Z
status: activated
summary: "A relay-policy upgrade: the 50-transaction limit on chains of unconfirmed transactions was removed, and one transaction may carry several OP_RETURN outputs. No consensus rules changed."
keywords:
  - may 2021 upgrade
  - unconfirmed transaction chain limit
  - multiple op_return
  - bitcoin cash chain limit removed
  - first chip upgrade
chips:
  - chip-unconfirmed-transaction-chain-limit
  - chip-2021-03-multiple-op-return
verified: 2026-09-26
sources:
  - title: "2021-05-15 Network Upgrade Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/2021-05-15-upgrade/"
  - title: "Unconfirmed Transaction Chain Limit CHIP"
    url: "https://upgradespecs.bitcoincashnode.org/unconfirmed-transaction-chain-limit/"
  - title: "Multiple OP_RETURNs for Bitcoin Cash CHIP"
    url: "https://upgradespecs.bitcoincashnode.org/CHIP-2021-03-12_Multiple_OP_RETURN_for_Bitcoin_Cash/"
  - title: "Bitcoin Cash Node chainparams.cpp (2021 upgrade note)"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
---

## What changed

This upgrade took effect at 12:00 UTC on 15 May 2021 (Unix time `1621080000`, measured by
[median time past](/glossary#median-time-past)). Both changes came as [CHIPs](/chips) (Cash Improvement Proposals).

It changed **relay policy only**, not consensus. Bitcoin Cash Node's source code says so directly: the upgrade "was for
relay rules only", so the node does not track an activation height for it. No block was invalid before and valid after.
That is why this page lists no height.

Two changes:

- **[Unconfirmed transaction chain limit](/chips/chip-unconfirmed-transaction-chain-limit) removed.** Before, nodes
  relayed a chain of at most 50 unconfirmed transactions (each spending the previous one). Transactions beyond the 50th
  were often ignored, even though they were valid.
- **[Multiple OP_RETURN outputs](/chips/chip-2021-03-multiple-op-return).** A standard transaction may now have more
  than one [`OP_RETURN`](/glossary#op-return) data output. The existing 223-byte limit now applies to the total across
  all of them.

## Why

**Chain limit.** The CHIP's authors (Software Verde, with Bitcoin.com, CoinFLEX and the City of Dublin, Ohio) described
the pain: once a transaction is broadcast it cannot be taken back, and a transaction past the 50th link could just
vanish from relay, often silently. Their real cases: CoinFLEX token dividend payouts failed; a Dublin Identity beta
saw sign-ups fail; new users at meetups passed coins around faster than blocks arrived and hit the limit. The CHIP
also notes the limit mostly served Child-Pays-For-Parent, a fee feature that research by Tom Zander found almost unused
on BCH. The limit added complexity for services and wallets, and made [0-conf](/glossary#zero-conf) less reliable.

**Multiple OP_RETURNs.** On-chain protocols each want their own `OP_RETURN` output. With only one allowed, two
protocols could not share a transaction. The CHIP kept the byte cap unchanged to keep the risk minimal and the upgrade
easy to agree on.

## What it enables

- **Send as fast as you want.** A service can fire off hundreds of dependent payments without waiting for a block.
- **Simpler wallets.** No more chain-depth tracking or "please wait for a confirmation" errors for rapid spending.
- **Protocol stacking.** One transaction can carry data for two protocols side by side, for example a token
  transfer and a separate app message. The CHIP was first published in ActorForth's auction-protocol repository.

## Note on process

This policy-only upgrade was coordinated on the same May 15 date as consensus upgrades. The chain-limit CHIP warns
why: if nodes relay different chains of unconfirmed transactions, merchants accepting 0-conf face more double-spend
risk. A node that skipped it would not have forked off the network, though.

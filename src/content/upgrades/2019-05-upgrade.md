---
title: "May 2019: Schnorr signatures and SegWit recovery"
date: 2019-05-15T12:00:00Z
status: activated
height: 582680
summary: "OP_CHECKSIG and OP_CHECKDATASIG began accepting Schnorr signatures, and coins sent by mistake to SegWit P2SH addresses became recoverable."
keywords:
  - may 2019 upgrade
  - bitcoin cash schnorr
  - schnorr signatures bch
  - segwit recovery
  - bch segwit coins
chips: []
verified: 2026-09-26
sources:
  - title: "2019-MAY-15 Network Upgrade Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/2019-05-15-upgrade/"
  - title: "2019-MAY-15 Schnorr Signature specification"
    url: "https://upgradespecs.bitcoincashnode.org/2019-05-15-schnorr/"
  - title: "2019-MAY-15 Segwit Recovery specification"
    url: "https://upgradespecs.bitcoincashnode.org/2019-05-15-segwit-recovery/"
  - title: "Blockchair block data (median time past check)"
    url: "https://api.blockchair.com/bitcoin-cash/raw/block/582679"
---

## What changed

Activation came when the [median time past](/glossary#median-time-past) reached Unix time `1557921600`
(15 May 2019, 12:00 UTC). The first block under the new rules is height 582,680. From this upgrade on, BCH upgrades
activate at 12:00 UTC on the 15th.

Consensus changes:

- **[Schnorr signatures](/glossary#schnorr-signatures).** [`OP_CHECKSIG`](/opcodes/op_checksig),
  [`OP_CHECKSIGVERIFY`](/opcodes/op_checksigverify), [`OP_CHECKDATASIG`](/opcodes/op_checkdatasig) and
  [`OP_CHECKDATASIGVERIFY`](/opcodes/op_checkdatasigverify) now accept Schnorr signatures as well as ECDSA. A
  65-byte signature (64 bytes plus a hashtype byte) is read as Schnorr for `OP_CHECKSIG`; a 64-byte signature is read as
  Schnorr for `OP_CHECKDATASIG`. Existing public keys work for both schemes.
- **SegWit recovery.** BCH never adopted SegWit. Some users sent BCH to SegWit-style P2SH addresses by mistake, and the
  2018 clean-stack rule had made those coins unspendable. This upgrade exempts them, so they can be spent again.

Multisig ([`OP_CHECKMULTISIG`](/opcodes/op_checkmultisig)) did not get Schnorr yet. It came
[six months later](/upgrades/2019-11-upgrade).

## Why

The Schnorr spec lists four gains over ECDSA:

- A known proof of security.
- No unknown third-party malleability.
- Linearity, which allows simple multi-party signature aggregation.
- Batch validation, which can speed up checking large transactions and initial sync.

Schnorr signatures also have a fixed length. ECDSA signatures vary in size (usually 71–72 bytes), which complicates
fee estimation and contract design.

SegWit recovery was about fixing user mistakes. Note the catch in the spec: once the redeem script is revealed (for
example by spending from the matching BTC address), any miner can take those coins. Recovery helped, but it was not a
guarantee that the original owner got them back.

## What it enables

- **Smaller, fixed-size signatures** for wallets that choose Schnorr, with no new address type needed.
- **Multi-party signing.** Linearity opens the door to aggregated signatures, where several people produce one
  signature.
- **Predictable contract sizes.** Covenants that check signatures know the exact byte length ahead of time.

---
title: "November 2019: Schnorr multisig and MINIMALDATA"
date: 2019-11-15T12:00:00Z
status: activated
height: 609136
summary: "OP_CHECKMULTISIG gained Schnorr mode, and minimal push and minimal number encoding became consensus rules."
keywords:
  - november 2019 upgrade
  - schnorr multisig
  - minimaldata
  - bitcoin cash graviton
  - checkmultisig schnorr
chips: []
verified: 2026-09-26
sources:
  - title: "2019-NOV-15 Network Upgrade Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/2019-11-15-upgrade/"
  - title: "2019-NOV-15 Schnorr multisig specification"
    url: "https://upgradespecs.bitcoincashnode.org/2019-11-15-schnorrmultisig/"
  - title: "2019-NOV-15 MINIMALDATA specification"
    url: "https://upgradespecs.bitcoincashnode.org/2019-11-15-minimaldata/"
  - title: "Bitcoin Cash Node chainparams.cpp (gravitonHeight)"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
---

## What changed

Activation came when the [median time past](/glossary#median-time-past) reached Unix time `1573819200`
(15 November 2019, 12:00 UTC). The first block under the new rules is height 609,136. Bitcoin Cash Node's code calls
this upgrade "Graviton".

Consensus changes:

- **Schnorr multisig.** [`OP_CHECKMULTISIG`](/opcodes/op_checkmultisig) and
  [`OP_CHECKMULTISIGVERIFY`](/opcodes/op_checkmultisigverify) accept [Schnorr](/glossary#schnorr-signatures) signatures. The unused
  "dummy" stack element that multisig always consumed is repurposed. When it is non-empty, the opcode runs in
  Schnorr mode, and the dummy becomes a bitfield saying which public keys signed.
- **MINIMALDATA.** Every executed data push must use the smallest push opcode, and every number must use its minimal
  encoding. This was already a standardness (relay) rule. Now it is consensus.

## Why

- **Finish the Schnorr rollout.** The [May 2019 upgrade](/upgrades/2019-05-upgrade) added Schnorr to single-signature
  checks only. Multisig was left for later because it needed a new way to match signatures to keys.
- **Faster multisig checks.** With the bitfield, the node knows exactly which key goes with which signature. In ECDSA
  mode it may have to try several keys per signature.
- **Stop malleability.** Non-minimal pushes let a third party change a transaction's bytes (and its ID) without
  invalidating it. Making MINIMALDATA consensus closes that door for good.

## What it enables

- **Schnorr for shared wallets and escrow.** M-of-N setups, like a 2-of-3 business wallet or an escrow with an
  arbiter, can use smaller fixed-size signatures.
- **Stable transaction IDs.** Contracts and apps that chain unconfirmed transactions rely on IDs not changing. This
  upgrade removed one more way for them to change.
- **Cleaner accounting for later limits.** The multisig bitfield let the
  [May 2020 SigChecks rule](/upgrades/2020-05-upgrade) count Schnorr-mode multisig as M checks instead of N.

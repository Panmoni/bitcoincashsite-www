---
title: "May 2026: loops, functions, bitwise ops and Pay-to-Script"
date: 2026-05-15T12:00:00Z
status: activated
height: 951145
summary: "Four CHIPs: bounded loops (OP_BEGIN/OP_UNTIL), reusable functions (OP_DEFINE/OP_INVOKE), re-enabled bitwise and shift ops, and standard Pay-to-Script outputs with 128-byte NFT commitments."
keywords:
  - may 2026 upgrade
  - bitcoin cash 2026 upgrade
  - layla upgrade
  - bch loops
  - op_begin op_until
  - op_define op_invoke
  - bitcoin cash functions
  - p2s pay to script
  - 128 byte nft commitment
  - bitwise operations bch
chips:
  - chip-2024-12-p2s
  - chip-2021-05-loops
  - chip-2025-05-functions
  - chip-2025-05-bitwise
verified: 2026-09-26
sources:
  - title: "2026-05-15 Network Upgrade Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/2026-05-15-upgrade/"
  - title: "CHIP-2024-12 P2S: Pay to Script"
    url: "https://github.com/bitjson/bch-p2s"
  - title: "CHIP-2021-05 Loops: Bounded Looping Operations"
    url: "https://github.com/bitjson/bch-loops"
  - title: "CHIP-2025-05 Functions: Function Definition and Invocation Operations"
    url: "https://github.com/bitjson/bch-functions"
  - title: "CHIP-2025-05 Bitwise: Re-Enable Bitwise Operations"
    url: "https://github.com/bitjson/bch-bitwise"
  - title: "2026 Layla Upgrade Lock-in CHIP Endorsements Thread (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/2026-layla-upgrade-lock-in-chip-endorsements-thread/1672"
  - title: "Bitcoin Cash Node chainparams.cpp (upgrade12Height)"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
---

## What changed

Activation came when the [median time past](/glossary#median-time-past) reached Unix time `1778846400`
(15 May 2026, 12:00 UTC). The first block under the new rules is height 951,145. [Chipnet](/glossary#chipnet) ran them
from mid-November 2025. The community lock-in thread on Bitcoin Cash Research called this the "Layla" upgrade.

Four CHIPs activated, all maintained by Jason Dreyzehner.

### Loops (CHIP-2021-05)

[Loops](/chips/chip-2021-05-loops) adds [`OP_BEGIN`](/opcodes/op_begin) (`0x65`) and [`OP_UNTIL`](/opcodes/op_until)
(`0x66`), the loop construction used by most Forth-like languages. When `OP_UNTIL` pops a zero, execution jumps back to
just after the matching `OP_BEGIN`; any other value ends the loop. Every iteration is charged by the [2025 VM limits](/upgrades/2025-05-vm-limits-bigint), so loops cannot blow
up validation cost.

### Functions (CHIP-2025-05)

[Functions](/chips/chip-2025-05-functions) adds [`OP_DEFINE`](/opcodes/op_define) (`0x89`) and
[`OP_INVOKE`](/opcodes/op_invoke) (`0x8a`). A contract stores a piece of bytecode in a function table under an
identifier, then calls it as often as needed. Defined functions are immutable. This CHIP replaced an earlier
`OP_EVAL` design ([CHIP-2024-12 OP_EVAL](/chips/chip-2024-12-op-eval)), which its author withdrew in May 2025.

### Bitwise (CHIP-2025-05)

[Bitwise](/chips/chip-2025-05-bitwise) enables five opcodes:
[`OP_INVERT`](/opcodes/op_invert) (`0x83`),
[`OP_LSHIFTNUM`](/opcodes/op_lshiftnum) (`0x8d`),
[`OP_RSHIFTNUM`](/opcodes/op_rshiftnum) (`0x8e`),
[`OP_LSHIFTBIN`](/opcodes/op_lshiftbin) (`0x98`) and
[`OP_RSHIFTBIN`](/opcodes/op_rshiftbin) (`0x99`).
These complete the set that [`OP_AND`](/opcodes/op_and), [`OP_OR`](/opcodes/op_or) and [`OP_XOR`](/opcodes/op_xor)
started in 2018: bit inversion plus numeric and binary shifts.

### Pay to Script (CHIP-2024-12)

[P2S](/chips/chip-2024-12-p2s) changes standardness (relay) rules and one token limit:

- **Pay-to-Script outputs are standard.** Any locking bytecode up to 201 bytes may be relayed, not only the old
  templates (P2PKH, P2SH, bare multisig and so on). See [P2S](/glossary#p2s).
- **NFT commitments up to 128 bytes**, up from 40 (consensus).
- **Unlocking bytecode up to 10,000 bytes** in standard transactions. The old 1,650-byte standard limit is gone, so
  standard and consensus limits now match.

## Why

**Loops.** Bitcoin's original VM left out loops as part of an early anti-DoS approach. Since the 2025 VM limits already
charge every operation, that reason is gone. Without loops, contracts copy the same code again and again, which wastes
bytes and fees. The Loops CHIP also notes that some tasks, like aggregating over an unknown number of inputs, are
impractical or impossible with `OP_IF` alone.

**Functions.** The Functions CHIP names three gains: smaller transactions (no duplicated bytecode), stronger privacy
and operational security (contracts leak less about their structure), and better auditability.

**Bitwise.** The CHIP says these ops let contracts "more efficiently implement a variety of financial and
cryptographic applications." Hash functions, field math and bit-packed state all need shifts and inversion.

**P2S.** The P2S CHIP names two goals. Safety: P2SH contracts always have a payable address, so users can send money
to a contract address by mistake and lose it. A P2S output has no address a naive wallet can pay. Simplicity: covenants
no longer build and check a P2SH hash for each output, saving at least 34 bytes per output.

## What it enables

- **Real programs on-chain.** Loops plus functions let contracts iterate over any number of inputs and outputs and
  reuse helper routines. Contract size drops for repetitive logic.
- **Advanced cryptography.** Function reuse and shifts make finite-field arithmetic, pairing-based cryptography,
  zero-knowledge proof verification and post-quantum signature checks more practical, as the Functions CHIP lists.
- **Richer NFTs.** A 128-byte commitment can hold more contract state or metadata per token.
- **Leaner covenants.** P2S removes the hash wrapper, so DEX pools, vaults and multi-party covenants shrink.
- **Tooling.** CashScript added loops, bitwise ops and P2S in v0.13.

BTC still debates `OP_CAT` and covenant opcodes. On BCH, loops, functions and full introspection now run on mainnet.

## Support

The four stakeholder tables show broad support from Bitcoin Cash Node, Knuth, Libauth and AlbaDsl, with BCHD, Bitcoin
Verde and Flowee listed neutral (these tables count non-responses as neutral). Among wallets, Coin Wallet disapproved all
four; Cashonize, Selene, OPTN, Zapit and Bitcoin.com Wallet approved all four.

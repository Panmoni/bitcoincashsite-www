---
title: "May 2025: VM Limits and BigInt"
date: 2025-05-15T12:00:00Z
status: activated
height: 898374
summary: "Replaced the 201-opcode and 520-byte limits with cost-based density limits, raised stack items to 10,000 bytes, and removed the number-size limit for high-precision math."
keywords:
  - may 2025 upgrade
  - vm limits
  - bigint
  - targeted virtual machine limits
  - bitcoin cash big integers
  - op cost limit
  - 520 byte limit removed
  - bch 2025 upgrade
chips:
  - chip-2021-05-vm-limits
  - chip-2024-07-bigint
verified: 2026-09-26
sources:
  - title: "2025-05-15 Network Upgrade Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/2025-05-15-upgrade/"
  - title: "CHIP-2021-05 VM Limits: Targeted Virtual Machine Limits"
    url: "https://github.com/bitjson/bch-vm-limits"
  - title: "CHIP-2024-07 BigInt: High-Precision Arithmetic for Bitcoin Cash"
    url: "https://github.com/bitjson/bch-bigint"
  - title: "VM Limits discussion (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2021-05-targeted-virtual-machine-limits/437"
  - title: "Bitcoin Cash Node chainparams.cpp (upgrade11Height)"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
---

## What changed

Activation came when the [median time past](/glossary#median-time-past) reached Unix time `1747310400`
(15 May 2025, 12:00 UTC). The first block under the new rules is height 898,374. [Chipnet](/glossary#chipnet) ran
them from 15 November 2024.

Two CHIPs activated, both maintained by Jason Dreyzehner.

### VM Limits (CHIP-2021-05)

[VM Limits](/chips/chip-2021-05-vm-limits) re-targets the limits of the BCH virtual machine. See
[VM limits](/glossary#vm-limits).

- **The 201-operation limit is gone.** It is replaced by an **operation cost limit**: each input may spend a budget of
  800 cost units per byte of its "density control length" (roughly, the size of the spending input). Pushing data
  costs its length; hashing, signature checks and expensive arithmetic cost more.
- **Stack items can be 10,000 bytes**, up from 520. This matches the existing maximum script size, and it lifts the
  520-byte cap on P2SH contract length. To keep scope narrow, relay policy still capped unlocking bytecode at 1,650
  bytes. That cap was removed [in 2026](/upgrades/2026-05-upgrade).
- **A hashing limit.** Each input may do about 3.5 hash digest iterations per byte in blocks, and 0.5 per byte for
  standard (relayed) transactions.
- **A control stack limit** keeps the existing maximum `OP_IF` nesting depth of 100.

The "density control length" is the input's unlocking bytecode length plus 41 bytes of fixed per-input overhead.

The key idea is *density*. Limits scale with how many bytes the transaction pays for. A bigger contract gets a bigger
budget, but the worst-case cost to validate a block of any size stays bounded.

### BigInt (CHIP-2024-07)

[BigInt](/chips/chip-2024-07-bigint) removes the number-length limit (`nMaxNumSize`). Script numbers were 8 bytes
(64-bit) since [2022](/upgrades/2022-05-upgrade). Now they can be as long as any stack item: up to 10,000 bytes. The
operation cost limit charges expensive math, like multiplying huge numbers, in proportion to its real cost. See
[BigInt](/glossary#bigint).

## Why

The VM Limits CHIP lists the problems with the old limits:

- The 201-opcode and 520-byte contract limits "raise the cost of developing Bitcoin Cash products." Authors had to
  strip features or split one contract into harder-to-audit multi-input systems.
- The old limits were blunt. They blocked useful contracts but still did not measure the true cost of validation well.

Density-based limits fix both: more room for honest contracts, and a firm cap on validation cost. The CHIP's summary
says it also *reduces* full node compute requirements.

BigInt follows naturally. Once the VM can charge arithmetic by its real cost, there is no reason to cap numbers at 64
bits. Many financial and cryptographic apps need more precision, and emulating it in Script was slow, large and
error-prone.

## What it enables

- **Contracts far past 520 bytes** without splitting them across inputs (up to the 1,650-byte standard unlocking
  limit until 2026). Simpler designs, easier audits.
- **High-precision finance.** Interest, AMM curves, fixed-point prices and share math without overflow tricks.
- **Cryptography in Script.** The CHIP names post-quantum schemes, stronger escrow and settlement strategies, larger
  hash preimages, zero-knowledge proofs and homomorphic encryption as newly practical. Big numbers make finite-field
  math possible in a contract.
- **Smaller transactions.** Removing math emulation shrinks existing contracts, so users pay lower fees.
- **A base for 2026.** Loops, functions and bitwise ops in the [May 2026 upgrade](/upgrades/2026-05-upgrade) rely on
  this cost system to stay safe.

## Support

Both CHIPs' stakeholder tables show broad approval. Bitcoin Cash Node, BCHD, Bitcoin Verde and Libauth approved both.
Knuth approved VM Limits but is listed as disapproving BigInt. Flowee disapproved both, and Bitcoin Unlimited is
listed neutral on both. Note: these tables count non-responses as "neutral". See the CHIP pages for details.

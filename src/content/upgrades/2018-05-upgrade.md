---
title: "May 2018: 32 MB blocks and restored opcodes"
date: 2018-05-15T16:00:00Z
status: activated
height: 530356
summary: "Raised the block size limit to 32 MB and re-enabled OP_CAT, OP_SPLIT, bitwise AND/OR/XOR, OP_DIV, OP_MOD, OP_NUM2BIN and OP_BIN2NUM."
keywords:
  - may 2018 upgrade
  - bitcoin cash 32mb
  - op_cat bitcoin cash
  - re-enabled opcodes
  - monolith upgrade
  - op_return 223 bytes
chips: []
verified: 2026-09-26
sources:
  - title: "May 2018 Hardfork Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/may-2018-hardfork/"
  - title: "Restore disabled script opcodes, May 2018"
    url: "https://upgradespecs.bitcoincashnode.org/may-2018-reenabled-opcodes/"
  - title: "Blockchair block data (median time past check)"
    url: "https://api.blockchair.com/bitcoin-cash/raw/block/530355"
---

## What changed

This upgrade activated when the [median time past](/glossary#median-time-past) reached Unix time `1526400000`
(15 May 2018, 16:00 UTC). The first block under the new rules is height 530,356.

Consensus changes:

- **Block size limit: 32 MB** (32,000,000 bytes), up from 8 MB.
- **Nine opcodes restored or added.** Bitcoin disabled many opcodes in 2010–2011 after serious bugs. This upgrade
  brought back a reviewed, redesigned set:
  - Splice: [`OP_CAT`](/opcodes/op_cat) and [`OP_SPLIT`](/opcodes/op_split). `OP_SPLIT` is new; it replaces the old
    `OP_SUBSTR`, `OP_LEFT` and `OP_RIGHT`.
  - Bitwise: [`OP_AND`](/opcodes/op_and), [`OP_OR`](/opcodes/op_or), [`OP_XOR`](/opcodes/op_xor).
  - Arithmetic: [`OP_DIV`](/opcodes/op_div), [`OP_MOD`](/opcodes/op_mod).
  - Conversion (new): [`OP_NUM2BIN`](/opcodes/op_num2bin) and [`OP_BIN2NUM`](/opcodes/op_bin2num).

Recommended policy (not consensus) changes:

- [`OP_RETURN`](/glossary#op-return) data outputs may carry up to 223 bytes in total.
- Automatic replay protection for the next upgrade, as a way to retire old node versions.

## Why

Blocks on BCH were far from full, but the 8 MB limit was a fixed ceiling. Raising it to 32 MB kept plenty of headroom
while node software was optimised further.

The opcode work was about [Script](/glossary#bitcoin-script) itself. The spec says the goal was to "restore the functionality"
these opcodes provided, not to copy the old versions. Each opcode was re-examined, and some were redesigned.

## What it enables

- **String handling in scripts.** `OP_CAT` and `OP_SPLIT` let a script build and take apart byte strings. This is the
  base for later tricks like checking parts of a signed message.
- **Real arithmetic.** Division and modulo let contracts compute shares, fees and ratios.
- **Number/byte conversion.** `OP_NUM2BIN` and `OP_BIN2NUM` let scripts move between numbers and fixed-width bytes.
- **More room for data.** The 223-byte `OP_RETURN` allowance gave on-chain data protocols more space per
  transaction.

Many of the ideas Bitcoin (BTC) still debates, like `OP_CAT`, have run on BCH since this upgrade.

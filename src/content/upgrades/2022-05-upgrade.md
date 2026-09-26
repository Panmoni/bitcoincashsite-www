---
title: "May 2022: native introspection and 64-bit math"
date: 2022-05-15T12:00:00Z
status: activated
height: 740238
summary: "Contracts can read their own transaction directly (native introspection opcodes), do 64-bit arithmetic, and multiply with OP_MUL."
keywords:
  - may 2022 upgrade
  - native introspection
  - bigger script integers
  - op_mul
  - 64-bit integers bitcoin cash
  - bch covenants 2022
chips:
  - chip-2021-02-native-introspection-opcodes
  - chip-2021-03-bigger-script-integers
verified: 2026-09-26
sources:
  - title: "2022-05-15 Network Upgrade Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/2022-05-15-upgrade/"
  - title: "CHIP-2021-02: Native Introspection Opcodes"
    url: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md"
  - title: "CHIP-2021-03: Bigger Script Integers"
    url: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Bigger-Script-Integers.md"
  - title: "Bitcoin Cash Node chainparams.cpp (upgrade8 height note)"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
  - title: "Blockchair block data (median time past check)"
    url: "https://api.blockchair.com/bitcoin-cash/raw/block/740237"
---

## What changed

Activation came when the [median time past](/glossary#median-time-past) reached Unix time `1652616000`
(15 May 2022, 12:00 UTC). Block 740,237 was the first with a median time past past that mark, so block 740,238 is the
first block under the new rules.

Two CHIPs activated:

- **[CHIP-2021-02 Native Introspection](/chips/chip-2021-02-native-introspection-opcodes)** added 14 opcodes
  (`0xc0`–`0xcd`) that push facts about the current transaction onto the stack:
  - Whole transaction: [`OP_INPUTINDEX`](/opcodes/op_inputindex), [`OP_ACTIVEBYTECODE`](/opcodes/op_activebytecode),
    [`OP_TXVERSION`](/opcodes/op_txversion), [`OP_TXINPUTCOUNT`](/opcodes/op_txinputcount),
    [`OP_TXOUTPUTCOUNT`](/opcodes/op_txoutputcount), [`OP_TXLOCKTIME`](/opcodes/op_txlocktime).
  - Per input: [`OP_UTXOVALUE`](/opcodes/op_utxovalue), [`OP_UTXOBYTECODE`](/opcodes/op_utxobytecode),
    [`OP_OUTPOINTTXHASH`](/opcodes/op_outpointtxhash), [`OP_OUTPOINTINDEX`](/opcodes/op_outpointindex),
    [`OP_INPUTBYTECODE`](/opcodes/op_inputbytecode), [`OP_INPUTSEQUENCENUMBER`](/opcodes/op_inputsequencenumber).
  - Per output: [`OP_OUTPUTVALUE`](/opcodes/op_outputvalue), [`OP_OUTPUTBYTECODE`](/opcodes/op_outputbytecode).
- **[CHIP-2021-03 Bigger Script Integers](/chips/chip-2021-03-bigger-script-integers)** widened script numbers from
  32-bit to 64-bit and re-enabled [`OP_MUL`](/opcodes/op_mul). Overflows now fail the script instead of producing
  odd results.

## Why

**Introspection.** [Covenants](/glossary#covenant) (contracts that control where their coins can go next) already
worked on BCH, but only through a trick: push a copy of the transaction's signing data, check it with both
`OP_CHECKSIG` and `OP_CHECKDATASIG`, then pick it apart. The CHIP says this doubled or tripled the size of even simple covenant transactions, and
advanced ones hit the 1,650-byte unlocking script limit. The CHIP gives contracts
direct access to the same facts "without increasing transaction validation costs."

**Bigger integers.** 32-bit math capped values at 2,147,483,647. In satoshis that is about 21 BCH. Any contract holding
more had to emulate bigger math, which was hard to secure and bloated transactions. 64-bit numbers cover any possible
output value (the total supply is about 2.1 quadrillion satoshis).

The CHIPs recommended shipping both together: `OP_UTXOVALUE` and `OP_OUTPUTVALUE` return amounts that only fit in
64-bit numbers.

## What it enables

- **Much smaller covenants.** Checking "output 0 must pay at least X to address Y" becomes a handful of opcodes.
- **Contracts of any size.** A vault, escrow or pool can safely hold thousands of BCH.
- **Real financial math.** Multiplication plus 64-bit range makes interest, price and ratio calculations practical.
- **Tooling support.** CashScript's author committed in the CHIP to support the full set of introspection opcodes.

The CHIP lists early builders who relied on these features: General Protocols (AnyHedge), be.cash, Causes Cash
recurring payments, Mistcoin, Flipstarter and others. Together with
[CashTokens in 2023](/upgrades/2023-05-cashtokens), this upgrade laid the base for [UTXO](/glossary#utxo)-based
apps like DEXes and lending on BCH.

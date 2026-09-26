---
title: "Native Introspection Opcodes"
code: "CHIP-2021-02"
owners:
  - Jason Dreyzehner
  - Jonathan Silverblood
status: activated
upgrade: 2022-05-upgrade
summary: "Added 14 opcodes that let contracts read the current transaction directly: input and output values, bytecode, counts, locktime and more."
spec: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md"
discussion: "https://bitcoincashresearch.org/t/chip-2021-02-add-native-introspection-opcodes/307"
stakeholders:
  - name: "Bitcoin Unlimited"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md"
  - name: "Bitcoin Cash Node"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md"
  - name: "Knuth"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md"
  - name: "Bitcoin Verde"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md"
  - name: "Bitauth"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md"
  - name: "Flowee (Tom Zander)"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md"
  - name: "CashScript (Rosco Kalis)"
    position: support
    source: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md"
verified: 2026-09-26
sources:
  - title: "CHIP-2021-02: Native Introspection Opcodes"
    url: "https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md"
  - title: "2022-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2022-05-15-upgrade/"
---

## Summary

This CHIP adds virtual machine operations that let a contract read details of the transaction spending it: output
values, recipients, input bytecode and more. It does this "without increasing transaction validation costs," because
nodes already hold all of that data while validating.

## Motivation

Covenants (contracts that check how their coins are spent) became possible on BCH with
[`OP_CHECKDATASIG`](/opcodes/op_checkdatasig) in 2018. But they used a workaround: check the same signature with both
`OP_CHECKSIG` and `OP_CHECKDATASIG`, then parse a copy of the transaction's signing data pushed by the spender.

The CHIP says this "doubles or triples the size of even the simplest covenant transactions," and advanced covenants hit
the 1,650-byte standard unlocking script limit. Native opcodes remove the duplication.

## What it specifies

Fourteen opcodes at codepoints `0xc0`–`0xcd`:

| Opcode | Pushes |
|---|---|
| [`OP_INPUTINDEX`](/opcodes/op_inputindex) | index of the input being evaluated |
| [`OP_ACTIVEBYTECODE`](/opcodes/op_activebytecode) | bytecode currently being evaluated |
| [`OP_TXVERSION`](/opcodes/op_txversion) | transaction version |
| [`OP_TXINPUTCOUNT`](/opcodes/op_txinputcount) | number of inputs |
| [`OP_TXOUTPUTCOUNT`](/opcodes/op_txoutputcount) | number of outputs |
| [`OP_TXLOCKTIME`](/opcodes/op_txlocktime) | transaction locktime |
| [`OP_UTXOVALUE`](/opcodes/op_utxovalue) | value of the coin spent by input N |
| [`OP_UTXOBYTECODE`](/opcodes/op_utxobytecode) | locking bytecode of that coin |
| [`OP_OUTPOINTTXHASH`](/opcodes/op_outpointtxhash) | txid referenced by input N |
| [`OP_OUTPOINTINDEX`](/opcodes/op_outpointindex) | output index referenced by input N |
| [`OP_INPUTBYTECODE`](/opcodes/op_inputbytecode) | unlocking bytecode of input N |
| [`OP_INPUTSEQUENCENUMBER`](/opcodes/op_inputsequencenumber) | sequence number of input N |
| [`OP_OUTPUTVALUE`](/opcodes/op_outputvalue) | value of output N |
| [`OP_OUTPUTBYTECODE`](/opcodes/op_outputbytecode) | locking bytecode of output N |

The CHIP recommended deploying it with [Bigger Script Integers](/chips/chip-2021-03-bigger-script-integers), since
values can exceed 32-bit range.

## Current status

Activated on 15 May 2022. The CHIP records acceptance by Bitcoin Unlimited, Bitcoin Cash Node, Knuth, Bitcoin Verde and
Bitauth. Its statements section includes support from Flowee's founder Tom Zander and from Rosco Kalis, who committed to
supporting all the opcodes in [CashScript](/glossary#cashscript). General Protocols' early statement said the CHIP needed
more analysis before it could take a strong position, while committing resources to support it.

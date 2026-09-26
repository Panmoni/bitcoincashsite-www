---
title: "CashTokens: Token Primitives for Bitcoin Cash"
code: "CHIP-2022-02"
owners:
  - Jason Dreyzehner
status: activated
upgrade: 2023-05-cashtokens
summary: "Adds fungible tokens and non-fungible tokens (NFTs) directly to Bitcoin Cash outputs, validated by consensus and readable by contracts."
spec: "https://github.com/cashtokens/cashtokens"
discussion: "https://bitcoincashresearch.org/t/chip-2022-02-cashtokens-token-primitives-for-bitcoin-cash/725"
stakeholders:
  - name: "Bitcoin Cash Node"
    position: support
    source: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
  - name: "Bitcoin Unlimited"
    position: support
    source: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
  - name: "Bitcoin Verde"
    position: support
    source: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
  - name: "Flowee"
    position: support
    source: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
  - name: "Knuth"
    position: support
    source: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
  - name: "BCHD"
    position: neutral
    source: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
  - name: "Electron Cash"
    position: support
    source: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
  - name: "Paytaca Wallet"
    position: support
    source: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
  - name: "General Protocols"
    position: support
    source: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
  - name: "Memo Technology, Inc."
    position: oppose
    source: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
verified: 2026-09-26
sources:
  - title: "CHIP-2022-02 CashTokens specification"
    url: "https://github.com/cashtokens/cashtokens"
  - title: "CashTokens stakeholder responses"
    url: "https://github.com/cashtokens/cashtokens/blob/master/stakeholders.md"
  - title: "2023-05-15 Network Upgrade Specification"
    url: "https://upgradespecs.bitcoincashnode.org/2023-05-15-upgrade/"
---

## Summary

CashTokens adds two token primitives to Bitcoin Cash: **fungible tokens** and **non-fungible tokens**
([NFTs](/glossary#nft)). Tokens live inside ordinary outputs, next to BCH, and every node enforces their rules. See
[CashTokens](/cashtokens) for a user guide and [tokenstork.com](https://tokenstork.com) for live token data.

## Motivation

The CHIP starts from a limit of the contract system. Before CashTokens, the only commitments a contract could check
were transaction signatures and data signatures. Both need a trusted private key, and a contract cannot hold one. So
contracts could not issue their own verifiable messages, and decentralized oracles and many cross-contract designs were
out of reach.

Token primitives give contracts that ability "without increasing transaction or block validation costs," while keeping
BCH's stateless [UTXO](/glossary#utxo) model. Contracts can interact with each other without shared global state.

## What it specifies

- **Token categories.** Each category ID is a 32-byte transaction ID. It must come from an input that spends output 0
  of its parent transaction (a "genesis input"), so category IDs cannot be forged.
- **Fungible tokens.** All units of a category are created in its genesis transaction, up to
  9,223,372,036,854,775,807 in total.
- **NFTs.** Each carries a commitment of 0–40 bytes (raised to 128 bytes in 2026 by [P2S](/chips/chip-2024-12-p2s)).
  Capabilities: `minting` (create any number of new NFTs of the category), `mutable` (create one replacement NFT with a
  new commitment), or none (immutable).
- **Encoding.** A token prefix, marked by byte `0xef`, sits at the start of the output's locking bytecode field.
- **Six inspection opcodes:** [`OP_UTXOTOKENCATEGORY`](/opcodes/op_utxotokencategory),
  [`OP_UTXOTOKENCOMMITMENT`](/opcodes/op_utxotokencommitment), [`OP_UTXOTOKENAMOUNT`](/opcodes/op_utxotokenamount),
  [`OP_OUTPUTTOKENCATEGORY`](/opcodes/op_outputtokencategory),
  [`OP_OUTPUTTOKENCOMMITMENT`](/opcodes/op_outputtokencommitment),
  [`OP_OUTPUTTOKENAMOUNT`](/opcodes/op_outputtokenamount).
- **`SIGHASH_UTXOS`**, a signing mode that covers all spent outputs.
- **Token-aware [CashAddresses](/glossary#cashaddr).** Token-aware wallets must refuse to send tokens to ordinary
  addresses, which cuts accidental token loss.

## Current status

Final (version 2.2.2). Activated on 15 May 2023; chipnet ran it from 15 November 2022.

The stakeholder table records 82 approvals, 1 disapproval (Memo Technology, Inc.) and 253 neutral. The CHIP's
outreach counted non-responses as neutral, so the neutral figure mostly reflects silence, not objection. All node
implementations approved except BCHD (neutral).

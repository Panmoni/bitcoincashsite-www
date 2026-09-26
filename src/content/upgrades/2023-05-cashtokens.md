---
title: "May 2023: CashTokens, P2SH32 and smaller transactions"
date: 2023-05-15T12:00:00Z
status: activated
height: 792773
summary: "Native fungible tokens and NFTs (CashTokens), 32-byte P2SH for stronger contract security, a 65-byte minimum transaction size, and transaction versions restricted to 1 and 2."
keywords:
  - cashtokens upgrade
  - may 2023 upgrade
  - bitcoin cash tokens
  - bch nft
  - p2sh32
  - sighash_utxos
  - bitcoin cash native tokens
  - token primitives
chips:
  - chip-2022-02-cashtokens
  - chip-2022-05-p2sh32
  - chip-2021-01-restrict-transaction-version
  - chip-2021-01-minimum-transaction-size
verified: 2026-09-26
sources:
  - title: "2023-05-15 Network Upgrade Specification (BCHN upgrade specs)"
    url: "https://upgradespecs.bitcoincashnode.org/2023-05-15-upgrade/"
  - title: "CHIP-2022-02 CashTokens: Token Primitives for Bitcoin Cash"
    url: "https://github.com/cashtokens/cashtokens"
  - title: "CHIP-2022-05 P2SH32 discussion (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2022-05-pay-to-script-hash-32-p2sh32-for-bitcoin-cash/806"
  - title: "Bitcoin Cash Upgrade 2023 (bitjson's blog)"
    url: "https://blog.bitjson.com/bitcoin-cash-upgrade-2023/"
  - title: "BCHN MR !1598: Allow for txn sizes as small as 65 bytes"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/merge_requests/1598"
  - title: "Bitcoin Cash Node chainparams.cpp (upgrade9Height)"
    url: "https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/master/src/chainparams.cpp"
---

## What changed

Activation came when the [median time past](/glossary#median-time-past) reached Unix time `1684152000`
(15 May 2023, 12:00 UTC). The first block under the new rules is height 792,773. Test network
[chipnet](/glossary#chipnet) ran the same rules six months early, from 15 November 2022.

Four CHIPs activated:

### CashTokens (CHIP-2022-02)

[CashTokens](/chips/chip-2022-02-cashtokens), by Jason Dreyzehner, adds two token types directly to
[UTXOs](/glossary#utxo):

- **[Fungible tokens](/glossary#fungible-token)**: interchangeable units, like a stablecoin or points. A category can
  have up to 9,223,372,036,854,775,807 units, all created in its genesis transaction.
- **[NFTs](/glossary#nft)**: each carries a **commitment** of 0 to 40 bytes, set by the issuer. An NFT can have the
  `minting` capability (create any number of new NFTs), the `mutable` capability (edit its own commitment), or neither
  (immutable).

Each token category ID is the transaction ID of an output-0 coin spent in the genesis transaction. So category IDs
are unique and cannot be faked. Tokens sit in an output next to BCH, marked by a prefix byte (`0xef`).

Six new opcodes let contracts inspect tokens:
[`OP_UTXOTOKENCATEGORY`](/opcodes/op_utxotokencategory),
[`OP_UTXOTOKENCOMMITMENT`](/opcodes/op_utxotokencommitment),
[`OP_UTXOTOKENAMOUNT`](/opcodes/op_utxotokenamount),
[`OP_OUTPUTTOKENCATEGORY`](/opcodes/op_outputtokencategory),
[`OP_OUTPUTTOKENCOMMITMENT`](/opcodes/op_outputtokencommitment) and
[`OP_OUTPUTTOKENAMOUNT`](/opcodes/op_outputtokenamount).
The CHIP also adds a `SIGHASH_UTXOS` signing mode and token-aware [CashAddress](/glossary#cashaddr) types.

### P2SH32 (CHIP-2022-05)

[P2SH32](/chips/chip-2022-05-p2sh32), by bitcoincashautist, adds a 32-byte version of pay-to-script-hash:
`OP_HASH256 <32-byte hash> OP_EQUAL`. Classic P2SH uses a 20-byte hash, which is open to collision attacks at about
80-bit security. See [P2SH](/glossary#p2sh).

### Minimum transaction size (CHIP-2021-01)

The [minimum size](/chips/chip-2021-01-minimum-transaction-size) dropped from 100 bytes to 65 bytes. Proposed by Tom
Zander.

### Restrict transaction version (CHIP-2021-01)

[Transaction versions](/chips/chip-2021-01-restrict-transaction-version) other than 1 and 2 became invalid by
consensus. Before, only relay policy enforced this.

## Why

**Contracts that can vouch for things.** The CashTokens CHIP starts from a gap: before 2023, the only commitments a
contract could check were signatures, and signatures need a private key. A contract cannot hold a key, so anything a
contract "says" had to be signed by a trusted party. That ruled out decentralized oracles and many multi-contract
designs. Token commitments give contracts their own verifiable messages, "without increasing transaction or block
validation costs."

**Tokens validated by consensus.** Token rules are enforced by every node, so contracts can read and control tokens
directly. The CHIP also aims to support higher-level token standards on top of these primitives.

**Contract security.** P2SH32 grew out of a discussion titled "a long-term solution for 80-bit P2SH collision
attacks". A 20-byte hash gives only about 80 bits of collision resistance. That matters for multi-party contracts,
where one party could try to craft two scripts with the same hash. A 32-byte hash closes that gap.

**Housekeeping.** The 100-byte minimum (from [2018](/upgrades/2018-11-upgrade)) blocked some valid, useful small
transactions and tripped up coinbase builders; 65 bytes still blocks the 64-byte SPV attack. Pinning versions to 1 and
2 means a future transaction format can claim a fresh version number that no old transaction has ever used.

## What it enables

- **Tokens that cost under a cent to mint or send.** Anyone can issue a token or NFT collection with no contract to
  deploy, no approvals, and no admin keys. See [CashTokens](/cashtokens) and the live token list at
  [tokenstork.com](https://tokenstork.com).
- **DEXes and DeFi in UTXOs.** NFT commitments can hold contract state: ownership, authorizations, credit, debt.
  Contracts can recognise each other's tokens and interact without shared global state. Apps such as Cauldron (DEX),
  Moria (borrow MUSD) and TapSwap (NFT market) build on this.
- **Safer covenants.** Contracts can use a 32-byte script hash for their address.
- **Fewer lost tokens.** Token-aware CashAddresses mark wallets that accept tokens. Token-aware wallets must refuse to
  send tokens to an ordinary address.
- **Metadata.** The separate [BCMR](/glossary#bcmr) standard lets issuers publish names, tickers and icons for a
  category.

## Limits

NFT commitments were capped at 40 bytes. That cap was raised to 128 bytes [in 2026](/upgrades/2026-05-upgrade).

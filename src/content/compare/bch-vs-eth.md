---
title: "Bitcoin Cash vs Ethereum (BCH vs ETH)"
description: "BCH vs ETH, honestly: UTXO covenants vs the EVM, per-byte fees vs gas, native tokens vs ERC-20 approvals, and where Ethereum clearly leads."
lang: en
verified: 2026-09-26
rival: "Ethereum"
ticker: "ETH"
faq:
  - q: "Is Bitcoin Cash better than Ethereum?"
    a: "It depends on the job. Ethereum has far more liquidity, stablecoins, developers and apps. Bitcoin Cash is simpler money: flat per-byte fees, native tokens with no approve() step, contracts with no admin keys, and proof-of-work security. Pick BCH for cheap payments and UTXO contracts; pick Ethereum for deep DeFi and stablecoin markets."
  - q: "Can Bitcoin Cash run smart contracts?"
    a: "Yes. Bitcoin Cash runs UTXO contracts called covenants. Since May 2022 contracts can inspect their own transaction (introspection), since 2023 they can hold native tokens (CashTokens), and the 2025 and 2026 upgrades added big-integer math, loops and functions. The model differs from the EVM: each contract guards its own coins instead of sharing one global state."
  - q: "Does Bitcoin Cash have gas fees?"
    a: "No gas market. A BCH fee is set by transaction size in bytes; the common default is 1 satoshi per byte. Ethereum charges gas for computation, with a burned base fee plus a priority tip."
  - q: "Is Bitcoin Cash proof of work and Ethereum proof of stake?"
    a: "Yes. Bitcoin Cash uses SHA-256 proof of work, like Bitcoin. Ethereum switched from proof of work to proof of stake at the Merge on September 15, 2022."
  - q: "Does Bitcoin Cash have tokens like ERC-20?"
    a: "Yes. CashTokens (activated May 15, 2023) put fungible tokens and NFTs directly inside transaction outputs. There is no token contract to deploy and no approve() allowance that a drainer can abuse."
  - q: "Does Bitcoin Cash have MEV?"
    a: "BCH has far less room for front-running than Ethereum, because contracts keep local state and fees are flat per byte instead of a priority auction. It is not zero: miners still order transactions, and busy shared-pool contracts can see contention."
sources:
  - title: "Fusaka Mainnet Announcement (Ethereum Foundation)"
    url: "https://blog.ethereum.org/2025/11/06/fusaka-mainnet-announcement"
  - title: "Ethereum forks timeline (ethereum.org)"
    url: "https://ethereum.org/ethereum-forks/"
  - title: "The Merge (ethereum.org)"
    url: "https://ethereum.org/roadmap/merge/"
  - title: "ETH issuance and burn (ethereum.org)"
    url: "https://ethereum.org/roadmap/merge/issuance/"
  - title: "Blocks (ethereum.org)"
    url: "https://ethereum.org/developers/docs/blocks/"
  - title: "Gas and fees (ethereum.org)"
    url: "https://ethereum.org/developers/docs/gas/"
  - title: "Maximal extractable value (ethereum.org)"
    url: "https://ethereum.org/developers/docs/mev/"
  - title: "ERC-20 token standard (ethereum.org)"
    url: "https://ethereum.org/developers/docs/standards/tokens/erc-20/"
  - title: "Upgrading smart contracts (ethereum.org)"
    url: "https://ethereum.org/developers/docs/smart-contracts/upgrading/"
  - title: "Layer 2 (ethereum.org)"
    url: "https://ethereum.org/layer-2/"
  - title: "Glamsterdam date: Sepolia fork (CryptoTicker, Aug 2026)"
    url: "https://cryptoticker.io/en/ethereum-glamsterdam-date-sepolia-fork/"
  - title: "Network upgrades (EIPsInsight)"
    url: "https://eipsinsight.com/upgrade"
  - title: "Stablecoin supply by chain (DefiLlama API)"
    url: "https://stablecoins.llama.fi/stablecoinchains"
  - title: "Ethereum adds 16K developers in 2025 (Yahoo Finance, citing Electric Capital)"
    url: "https://finance.yahoo.com/news/ethereum-adds-16k-developers-2025-091310770.html"
  - title: "Bitcoin Cash (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bitcoin_Cash"
  - title: "CashTokens CHIP specification"
    url: "https://cashtokens.org/docs/spec/chip"
  - title: "Bitcoin Cash Node v27.0.0 release notes (ABLA)"
    url: "https://docs.bitcoincashnode.org/doc/release-notes/release-notes-27.0.0/"
  - title: "Bitcoin Cash Node v28.0.0 release notes (VM Limits, BigInt)"
    url: "https://docs.bitcoincashnode.org/doc/release-notes/release-notes-28.0.0/"
  - title: "Announcing Bitcoin Cash Node v29.0.0"
    url: "https://bitcoincashnode.org/en/newsroom/announcing-bitcoin-cash-node-v29-0-0"
  - title: "Bitcoin Cash Upgrade 2026 (bitjson)"
    url: "https://blog.bitjson.com/bitcoin-cash-upgrade-2026/"
  - title: "About Bitcoin Cash (CashScript docs)"
    url: "https://cashscript.org/docs/basics/about-bch"
  - title: "Lower the default relay fee (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/lower-the-default-relay-fee-create-a-fee-estimation-algorithm/440"
  - title: "May 15, 2022 upgrade specification (native introspection)"
    url: "https://upgradespecs.bitcoincashnode.org/2022-05-15-upgrade/"
  - title: "Double Spend Proofs specification"
    url: "https://upgradespecs.bitcoincashnode.org/dsproof/"
---

Bitcoin Cash and Ethereum both run smart contracts. They start from opposite ends. Bitcoin Cash is Bitcoin's [UTXO](/glossary#utxo) design with contracts added on top. Ethereum is a world computer with money added on top. That one difference explains most of what follows.

## How they got here

Ethereum launched on July 30, 2015 (the Frontier release). It moved from proof of work to proof of stake at the Merge on September 15, 2022. Since then it has shipped Dencun (March 2024), Pectra (May 2025) and Fusaka (December 3, 2025). Fusaka added PeerDAS, so nodes sample blob data instead of downloading all of it, and raised the gas limit to 60 million. The next upgrade, Glamsterdam, brings enshrined proposer-builder separation (ePBS) and block-level access lists. It is in public-testnet stage as of late September 2026, and trackers disagree on the final mainnet date.

Bitcoin Cash split from Bitcoin on August 1, 2017, over block size. It keeps Bitcoin's 21 million cap, SHA-256 mining and 10-minute blocks. Since then it has upgraded every May: [CashTokens](/upgrades/2023-05-cashtokens) in 2023, the adaptive block size limit in 2024, [VM limits and big integers](/upgrades/2025-05-vm-limits-bigint) in 2025, and [loops, functions, bitwise ops and pay-to-script](/upgrades/2026-05-upgrade) in 2026.

The two chains are not related by a fork. They are two answers to the question "how should a blockchain do more than send coins?"

## Design differences

| | Bitcoin Cash (BCH) | Ethereum (ETH) |
|---|---|---|
| Block time | ~10 minutes (proof of work) | 12-second slots |
| Block size policy | Adaptive limit (ABLA), 32 MB floor, grows with sustained use | Gas limit set by validator votes, up to 1/1024 per block |
| Fee model | Flat rate per byte; default 1 sat/byte | Gas per computation step; burned base fee plus priority tip (EIP-1559) |
| Smart-contract model | UTXO [covenants](/glossary#covenant); each contract guards its own coins | Account model; EVM contracts share one global state |
| Tokens | Native [CashTokens](/glossary#cashtokens) inside outputs; no token contract | ERC-20 / ERC-721 contracts with `approve()` allowances |
| Upgradeability | Contract code is fixed once coins are locked to it | Proxy patterns let an admin swap contract logic |
| Privacy | Transparent ledger | Transparent ledger |
| Consensus | SHA-256 proof of work | Proof of stake |
| Supply | Fixed 21 million | No fixed cap; issuance to stakers, base fees burned |

## Where Bitcoin Cash wins

**Tokens without approvals.** An ERC-20 token is a contract. To trade it, you usually call `approve()` so another contract can spend your balance via `transferFrom()`. Approval drainers exploit exactly this. On BCH, a token is part of the coin itself. You spend it by signing, like any other coin. There is no allowance sitting on-chain waiting to be abused. See [CashTokens](/cashtokens).

**No admin keys, no upgradeable proxies.** On Ethereum, a proxy contract can point to new logic, and ethereum.org warns that whoever holds upgrade rights "can change the entire contract." A BCH covenant is bytecode locked into the coin's address. Nobody can swap it later. That removes a whole class of rug pulls. It does not remove bugs: a badly written covenant is still badly written. Our [risks page](/risks) covers that.

**Postage, not gas.** Ethereum prices computation in gas, and users bid tips for block space. BCH wallets typically pay 1 satoshi per byte, whatever the script does. Fees are easy to predict before you sign. The live panel on this page shows today's median fee on both chains.

**Far less room for front-running.** MEV on Ethereum comes from reordering transactions against shared state: bots watch the mempool and outbid you. BCH contracts only see their own transaction ([local state](/glossary#introspection)), and there is no priority gas auction. That leaves far less room for front-running. It is not zero: miners still pick the order, and busy shared-pool contracts can contend for the same coin.

**Parallel by default.** Each UTXO is spent once. Transactions that touch different coins can be validated side by side. The CashScript docs call this local state the reason BCH scales with low fees.

**Proof of work.** Some users want issuance and security tied to energy and hardware, not staked capital. BCH offers that, with Bitcoin's fixed supply. The trade-off is real: BCH has a small share of SHA-256 hashrate.

**Cheap payments that show up fast.** BCH payments appear in wallets in seconds as [zero-conf](/glossary#zero-conf) transactions. [Double-spend proofs](/glossary#dsproof) alert merchants if someone tries to spend the same coin twice.

## Where Ethereum wins

Be clear about this. On most ecosystem measures, Ethereum leads by orders of magnitude.

- **Liquidity and DeFi.** Lending, DEXs and derivatives on Ethereum dwarf anything on BCH.
- **Stablecoins.** Ethereum holds the largest stablecoin supply of any chain (DefiLlama, Sept 2026). BCH has no USDT or USDC on its base layer.
- **Developers.** Electric Capital data put Ethereum first by active developers in 2025. BCH has a small developer base and no treasury.
- **Layer 2s.** Arbitrum, Base, Optimism, Starknet and others inherit Ethereum security and offer low fees. BCH has no comparable rollup ecosystem.
- **Tooling and hiring.** Solidity, Foundry, Hardhat, audit firms and wallets are mature and easy to hire for. UTXO contracts are harder to write, and fewer people know how.
- **Fast blocks.** 12-second slots beat 10-minute blocks for on-chain confirmation, although BCH zero-conf covers many payment cases.

## Who should use which

**Use Ethereum** (or an Ethereum L2) if you need deep liquidity, dollar stablecoins, a large DeFi stack, or a big hiring pool.

**Use Bitcoin Cash** if you want to send money for well under a cent, issue tokens without deploying a contract, or build contracts that no admin can change. It also suits Bitcoin developers who want to test covenant ideas on a live chain. Start at [/build](/build), learn [CashScript](/glossary#cashscript), and browse the [opcode reference](/opcodes). Token metadata uses [BCMR](/glossary#bcmr); token listings live at [TokenStork](https://tokenstork.com).

Many builders use both. For other matchups, see [BCH vs Solana](/compare/bch-vs-sol) and [BCH vs Cardano](/compare/bch-vs-ada).

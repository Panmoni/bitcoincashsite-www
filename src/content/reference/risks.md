---
title: "Honest risks of Bitcoin Cash"
description: "The real weaknesses of Bitcoin Cash: thin liquidity, no USDT or USDC, low hashrate share, 10-minute blocks, fork history and 0-conf limits. Sourced."
lang: en
verified: 2026-09-26
faq:
  - q: "Is Bitcoin Cash a good investment?"
    a: "This page cannot tell you that, and nobody can promise a return. BCH is a volatile asset with thin liquidity compared with Bitcoin. It fell about 88% from its December 2017 peak by August 2018. Buy only what you can afford to lose, and read the risks below first."
  - q: "Can Bitcoin Cash be 51% attacked?"
    a: "In principle, yes. BCH shares the SHA-256 algorithm with Bitcoin but has a small share of its hashrate, so a large Bitcoin miner could point hash at BCH. BCH nodes add a 10-block rolling checkpoint that limits deep reorgs, and no successful attack for profit is on record in our sources. The risk is real but has not played out."
  - q: "Is USDT available on Bitcoin Cash?"
    a: "Not in any supported form. Tether stopped minting USDT on Bitcoin Cash SLP on 17 August 2023 and ended redemptions on 1 September 2025. USDC was never issued on BCH. ParyonUSD (PUSD) and MUSD are BCH-native stablecoins, backed by BCH collateral, with their own smart-contract and oracle risks."
  - q: "Are zero-confirmation BCH payments safe?"
    a: "Safe enough for small, everyday payments, not a guarantee. Double-spend proofs (DSProofs) alert merchants to a competing spend within seconds, but they cover only simple P2PKH transactions and cannot stop a miner who chooses to include the other transaction. For large amounts, wait for a confirmation."
  - q: "Is Bitcoin Cash private?"
    a: "No. BCH is a transparent public ledger, like Bitcoin. CashFusion is an optional mixing tool that users must turn on in a supporting wallet. Privacy is opt-in, not the default."
  - q: "Why did Bitcoin Cash split so many times?"
    a: "BCH forked from Bitcoin on 1 August 2017. It split again in November 2018 (Bitcoin SV) and in November 2020 (Bitcoin ABC, now eCash), the last over a plan to divert part of the block reward to developers. Each split cost users, liquidity and trust."
sources:
  - title: "Bitcoin Cash — Wikipedia"
    url: "https://en.wikipedia.org/wiki/Bitcoin_Cash"
  - title: "Tether discontinues USDT on Bitcoin, Kusama and Bitcoin Cash — The Block (Aug 2023)"
    url: "https://www.theblock.co/post/245976/tether-discontinues-usdt-bitcoin-kusama-bitcoin-cash"
  - title: "Tether to wind down USD₮ support for five legacy blockchains — Tether (Jul 2025)"
    url: "https://tether.io/news/tether-to-wind-down-usdt-support-for-five-legacy-blockchains-as-part-of-strategic-infrastructure-review/"
  - title: "USDC contract addresses — Circle Developer Docs"
    url: "https://developers.circle.com/stablecoins/usdc-contract-addresses"
  - title: "ParyonUSD — Decentralized stablecoin on Bitcoin Cash"
    url: "https://paryonusd.com/"
  - title: "Moria Protocol documentation — General"
    url: "https://docs.moria.money/general/"
  - title: "On the Miner Infrastructure Funding Plan — Bitcoin ABC (Feb 2020)"
    url: "https://www.bitcoinabc.org/2020-02-15-miner-fund/"
  - title: "Bitcoin Cash: the dawn of a new hard fork — Young Platform Academy"
    url: "https://academy.youngplatform.com/en/cryptocurrencies/bitcoin-cash-fork/"
  - title: "Is low hashrate a problem? — The Bitcoin Cash Podcast"
    url: "https://bitcoincashpodcast.com/faqs/BCH-vs-BTC/is-low-hashrate-a-problem"
  - title: "CHIP-2025-03 Faster Blocks for Bitcoin Cash — Bitcoin Cash Research"
    url: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-for-bitcoin-cash/1513"
  - title: "CHIP-2025-03 Faster Blocks: statements of support (and dissent) — Bitcoin Cash Research"
    url: "https://bitcoincashresearch.org/t/chip-2025-03-faster-blocks-gathering-statements-of-support-and-dissent/2095/33"
  - title: "BCH Weekly Recap, September 20, 2026 — KuCoin News"
    url: "https://www.kucoin.com/news/community/BCH/6ab0ee5274fd460007c479bc"
  - title: "CashFusion — Privacy for Bitcoin Cash"
    url: "https://cashfusion.org/"
  - title: "Transaction Lifecycle (UTXO contention) — CashScript docs"
    url: "https://cashscript.org/docs/guides/lifecycle"
  - title: "Cauldron whitepaper — Riften Labs"
    url: "https://docs.riftenlabs.com/cauldron/whitepaper/"
  - title: "Double Spend Proofs — Bitcoin Cash upgrade specifications"
    url: "https://upgradespecs.bitcoincashnode.org/dsproof/"
  - title: "DSProof implementation notes — Bitcoin Cash Node"
    url: "https://docs.bitcoincashnode.org/doc/dsproof-implementation-notes/"
  - title: "OKCoin delists Bitcoin Cash, Bitcoin SV — CoinDesk (Feb 2021)"
    url: "https://www.coindesk.com/tech/2021/02/19/okcoin-delists-bitcoin-cash-bitcoin-sv-to-avoid-misleading-new-bitcoin-clients"
  - title: "Coinbase Wallet delists XRP, Bitcoin Cash and Ethereum Classic — Decrypt (Nov 2022)"
    url: "https://decrypt.co/115955/coinbase-wallet-delists-ripple-xrp-bitcoin-cash-ethereum-classic"
  - title: "CME Group to expand crypto derivatives suite with Bitcoin Cash and Uniswap futures — PR Newswire (Sep 2026)"
    url: "https://www.prnewswire.com/news-releases/cme-group-to-expand-crypto-derivatives-suite-with-bitcoin-cash-and-uniswap-futures-302886066.html"
---

We publish this page because a site that only lists strengths is a brochure. Bitcoin Cash works as money and runs real contracts. It also has weaknesses. Here they are, with sources. Where something reduces a risk, we say so. Where nothing does, we say that too.

The live metrics panel beside this text shows current usage, fees and hashrate. We don't hard-code those numbers here because they change daily.

## 1. Thin usage and liquidity

**What it is.** BCH is a small network next to Bitcoin, Ethereum or Solana. Daily transactions, DeFi deposits and order-book depth are all modest. Check the live panel for today's figures.

**Why it matters.** Thin order books move more on large trades. Few users means fewer places to spend BCH and fewer apps to choose from. Tether cited declining volume when it dropped USDT on BCH's old SLP token layer.

**What helps.** Low usage also means low fees and empty blocks, so the network has room to grow. Usage is not the same as capacity. See the [directory](/directory) for what is live today.

## 2. No USDT or USDC on BCH

**What it is.** Tether stopped minting USDT on Bitcoin Cash SLP on 17 August 2023. It ended redemptions there on 1 September 2025. Circle's list of USDC chains does not include Bitcoin Cash.

**Why it matters.** Most crypto trade and remittance runs on USDT and USDC. Without them, BCH users who want dollars must leave the chain or use smaller alternatives.

**What helps, with caveats.** Two native stablecoins now run on [CashTokens](/glossary#cashtokens):

- **ParyonUSD (PUSD)** went live on 30 April 2026. Users borrow PUSD against BCH collateral, with a 110% minimum collateral ratio. The team reports a completed smart-contract audit.
- **MUSD** from Moria Protocol works the same way: lock BCH, borrow MUSD. It uses an on-chain oracle for prices.

Both are young, small, and depend on BCH collateral, an oracle and contract code. A sharp BCH crash or an oracle fault tests the peg. Treat them as experiments, not as a USDT replacement.

## 3. Small developer base and no protocol treasury

**What it is.** BCH has no built-in development fund. In 2020 the Bitcoin ABC team pushed an Infrastructure Funding Plan that would send part of each block reward to developers. Much of the community rejected it. The chain split on 15 November 2020, and the ABC side later renamed itself eCash (XEC).

**Why it matters.** Node and tooling work depends on donations, companies and volunteers. A small pool of reviewers means one skeptical developer can shift an upgrade timeline. That happened in September 2026, when a well-known developer said the Faster Blocks code was "not ready" and proposed waiting until 2028.

**What helps.** Upgrades still ship every May on schedule. See [/upgrades](/upgrades/2026-05-upgrade) and [Is Bitcoin Cash dead?](/is-bitcoin-cash-dead) for the release record.

## 4. Low hashrate share on shared SHA-256

**What it is.** BCH uses the same SHA-256 proof of work as Bitcoin. It gets only a small slice of total SHA-256 hashrate. A large Bitcoin miner or rented hash could, in theory, outpace the BCH chain for a while. That is a 51% attack.

**Why it matters.** An attacker with majority hash could reverse recent payments or censor transactions. Hashrate can also swing as miners chase whichever chain pays more.

**What helps.** BCH adjusts difficulty every block, so hash swings settle fast. Nodes enforce a 10-block rolling checkpoint that refuses deep reorganisations. Our sources record no successful attack for profit. One BCH advocacy FAQ put the rental cost of an attack at about $8,000 per hour (January 2024) but argues too little hash is for rent to sustain one. Treat both claims with care: the source is not neutral, and rental markets change.

## 5. Ten-minute blocks

**What it is.** BCH targets one block every 10 minutes, the same as Bitcoin.

**Why it matters.** A merchant or exchange that waits for a confirmation waits minutes, sometimes longer.

**What helps.** Most small payments use 0-conf (see item 10). A proposal, CHIP-2025-03 Faster Blocks, would cut the target to 1 minute. Its timeline shows lock-in on 15 November 2026 and activation on 15 May 2027. As of late September 2026 it has public endorsements, an abstention from General Protocols, and open dissent. It is not yet consensus. Follow it at [/upgrades/2027-05-upgrade](/upgrades/2027-05-upgrade).

## 6. No default privacy

**What it is.** BCH is a transparent ledger. Anyone can trace coins between addresses.

**Why it matters.** Chain-analysis firms can link your payments. Businesses reveal their revenue on-chain.

**What helps.** [CashFusion](/glossary#cashfusion) mixes coins in a joint transaction, but you must turn it on in a wallet that supports it. Zero-knowledge private payments have been tested on the chipnet test network only, not mainnet (September 2026). Don't call BCH private.

## 7. UTXO contracts are harder to write

**What it is.** BCH contracts live in [UTXOs](/glossary#utxo), not in accounts with global state. Each coin carries its own rules. Developers must think in inputs and outputs, not function calls on a shared object.

**Why it matters.** Most smart-contract developers learned Solidity. BCH asks them to learn a new model, with fewer tutorials and libraries.

**What helps.** CashScript gives a high-level language, and the 2026 upgrade added loops and functions. The model also carries over to Cardano, Kaspa and Bitcoin's own covenant designs. Compare them at [/compare/bch-vs-btc](/compare/bch-vs-btc).

## 8. Shared-pool UTXO contention

**What it is.** When two users try to spend the same contract UTXO at the same moment, only the first one seen wins. CashScript's own docs call this UTXO contention.

**Why it matters.** A busy pool can reject trades, and wallets must retry. Designs that assume one global pool, as on Ethereum, don't port directly.

**What helps.** Developers split state into many UTXOs. CashScript advises "multiple duplicate UTXOs for public covenants," each a separate thread. The Cauldron DEX uses many micro-pools and lets one trade draw on several at once.

## 9. Fork-era baggage

**What it is.** BCH forked from Bitcoin on 1 August 2017. It split again in November 2018, when Bitcoin SV left. It split a third time in November 2020, when Bitcoin ABC left and became eCash.

**Why it matters.** Splits divide users, miners and liquidity. Some venues dropped BCH to avoid confusion. OKCoin delisted BCH and BSV in February 2021, saying new users mistook them for Bitcoin. Coinbase Wallet dropped BCH in January 2023, citing low usage; the Coinbase exchange kept it.

**What helps.** BCH has not split since 2020. Upgrades since then have activated without a chain split.

## 10. Zero-confirmation limits

**What it is.** BCH wallets show a payment in seconds, before any block confirms it. [DSProofs](/glossary#dsproof) warn a merchant if someone broadcasts a competing spend.

**Why it matters.** A DSProof is a warning, not a guarantee. The spec protects only P2PKH transactions signed a certain way. It cannot stop a miner who chooses to mine the double spend. If the victim transaction has children in the mempool, only the parent gets a proof.

**What helps.** For coffee-sized payments, the risk is small. For large sums, wait for a confirmation. The spec itself advises merchants to "either wait for confirmation or apply more stringent risk management."

## 11. Price volatility

**What it is.** BCH prices swing hard. It peaked at $4,355.62 in December 2017 and fell about 88% by August 2018.

**Why it matters.** A payment asset that moves double digits in a week is hard to price goods in or save in.

**What helps.** Merchants can convert to local currency on receipt. Stablecoins (see item 2) are a partial option. Nothing makes BCH a safe store of value.

## 12. Regulatory and exchange access

**What it is.** Access to BCH depends on exchanges, brokers and regulators in your country. Delistings have happened (item 9).

**Why it matters.** If your local exchange drops BCH, buying and selling gets harder.

**What helps.** CME Group plans to list Bitcoin Cash futures on 19 October 2026, pending regulatory review. Futures do not change on-chain access, but they signal that regulated venues still list BCH. See [/wallet](/wallet) for self-custody options and [State of BCH](/state-of-bch) for the monthly numbers.

---
publishDate: 2023-12-22T00:00:00Z
title: 'Understanding and Working with BCMR: CashTokens Metadata (Token Pioneers Tutorial 3)'
description: 'In this third tutorial in the Token Pioneers series, we’re going to take a deep look at CashTokens metadata.'
excerpt: 'In this third tutorial in the Token Pioneers series, we’re going to take a deep look at CashTokens metadata.'
image: ~/assets/images/blog/token-pioneers-3.png
category: Tutorial
tags:
  - cashtokens
  - token pioneers
  - BCMR
canonical: https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-3/
---

## Table of Contents

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [What is BCMR?](#what-is-bcmr)
  - [The BCMR Makes your Tokens Look Good!](#the-bcmr-makes-your-tokens-look-good)
  - [Simple JSON Text Files](#simple-json-text-files)
  - [BCMR Metadata in Wallets, Websites & Dapps](#bcmr-metadata-in-wallets-websites-dapps)
  - [Why the BCMR](#why-the-bcmr)
  - [BCMR Files are Easy to Make and Read](#bcmr-files-are-easy-to-make-and-read)
    - [1. Fungible Token BCMR](#1-fungible-token-bcmr)
    - [2. NFT BCMR](#2-nft-bcmr)
  - [8 Key BCMR Concepts](#8-key-bcmr-concepts)
    - [1. BCMR JSON Schema](#1-bcmr-json-schema)
      - [Key Components of the BCMR Schema](#key-components-of-the-bcmr-schema)
    - [2. Token vs Identity vs Category](#2-token-vs-identity-vs-category)
    - [3. Authhead & Authbase](#3-authhead-authbase)
      - [Metadata Updates](#metadata-updates)
      - [The Authhead](#the-authhead)
      - [On-chain Terms](#on-chain-terms)
      - [Authhead and Authbase Examples](#authhead-and-authbase-examples)
    - [4. Authchain & ZDTC](#4-authchain-zdtc)
      - [Identities on Bitcoin Cash](#identities-on-bitcoin-cash)
      - [Identity Output & the OP_RETURN](#identity-output-the-op_return)
      - [Burning & Merging](#burning-merging)
      - [Authchain Resolution](#authchain-resolution)
      - [SPV Validation](#spv-validation)
    - [5. BCMR Identity History & Identity Snapshots](#5-bcmr-identity-history-identity-snapshots)
      - [Authchain vs Identity History](#authchain-vs-identity-history)
      - [Identity History Builds Trust](#identity-history-builds-trust)
      - [Identity History Reconstruction](#identity-history-reconstruction)
      - [Migration](#migration)
    - [6. BCMR Decimal Places](#6-bcmr-decimal-places)
    - [7. DNS-Resolved Registries](#7-dns-resolved-registries)
    - [8. Chain-Resolved Registries](#8-chain-resolved-registries)
      - [Examples of Chain-Resolved Registries](#examples-of-chain-resolved-registries)
      - [Other Registry Types](#other-registry-types)
    - [BCMR Concepts Conclusion](#bcmr-concepts-conclusion)
- [Building with BCMR](#building-with-bcmr)
  - [1. Explore an Authchain](#1-explore-an-authchain)
    - [Use TokenExplorer.cash](#use-tokenexplorercash)
    - [Use Paytaca’s BCMR Indexer](#use-paytacas-bcmr-indexer)
    - [Use Chaingraph.cash](#use-chaingraphcash)
    - [TASK: Trace an Authchain for 500 XRBF](#task-trace-an-authchain-for-50-xrbf)
  - [2. Create your Personal and/or Corporate Identity on the Blockchain](#2-create-your-personal-andor-corporate-identity-on-the-blockchain)
    - [Create a Mainnet-JS project](#create-a-mainnet-js-project)
    - [Identify the Pre-Genesis Transaction](#identify-the-pre-genesis-transaction)
      - [getPreGenesisTX.js](#getpregenesistxjs)
    - [Create your Identity’s AuthBase](#create-your-identitys-authbase)
    - [Verify ](#verify)
    - [Analyze](#analyze)
    - [Use Cases](#use-cases)
    - [TASK: Create an Identity for 1000 XRBF](#task-create-an-identity-for-100-xrbf)
  - [3. Update your Token and NFT BCMR Files](#3-update-your-token-and-nft-bcmr-files)
    - [Updating XRBF](#updating-xrbf)
      - [Hash Doesn’t Match?](#hash-doesnt-match)
    - [Haven’t Created an FT or NFT yet?](#havent-created-an-ft-or-nft-yet)
    - [otr.cash Eligibility](#otrcash-eligibility)
    - [CashTokens Studio](#cashtokens-studio)
    - [TASK: Update an Identity for 2500 XRBF ](#task-update-an-identity-for-250-xrbf)
  - [4. Get your Token(s) Listed on otr.cash and/or TokenStork.com](#4-get-your-tokens-listed-on-otrcash-andor-tokenstorkcom)
    - [How to Create a Pull Request](#how-to-create-a-pull-request)
      - [Registry Repos](#registry-repos)
      - [Email Submission](#email-submission)
    - [This is Optional](#this-is-optional)
    - [TASK: Submit your Pull Request for 7500 XRBF](#task-submit-your-pull-request-for-750-xrbf)
  - [5. Create Your Own Domain-Based Metadata Registry](#5-create-your-own-domain-based-metadata-registry)
- [Conclusion](#conclusion)
  - [Invaluable Developer Skills](#invaluable-developer-skills)
  - [We’re Just Beginning](#were-just-beginning)
  - [Next Up!](#next-up)
  - [Earn XRBF!](#earn-xrbf)
  - [Thank you](#thank-you)
  - [Token Pioneers Status Update](#token-pioneers-status-update)
  - [Support the Tutorial Series](#support-the-tutorial-series)
- [Additional Builder Resources](#additional-builder-resources)
  - [BCMR Tools](#bcmr-tools)
  - [JSON Tools](#json-tools)
  - [BCMR Content](#bcmr-content)
  - [BCMR Technical Guides](#bcmr-technical-guides)

<!-- TOC end -->

<!-- TOC --><a name="understanding-and-working-with-bcmr-cashtokens-metadata-token-pioneers-tutorial-3"></a>

In this third tutorial in the _Token Pioneers_ series, we’re going to take a deep look at CashTokens metadata.

Metadata matters in the CashTokens ecosystem because it takes complex on-chain data and makes it presentable in human-friendly formats. It’s used on [TokenStork.com](https://TokenStork.com/), in your favorite CashTokens-enabled wallets (such as [Paytaca](https://paytaca.com), [Cashonize](https://cashonize.com) and [Zapit](https://zapit.io)), in BCH dapps and anywhere else CashTokens fungible tokens (FTs) and NFTs are presented to users and holders.

In this tutorial, you’ll gain a full understanding of CashTokens metadata and perform some exercises that **you can get paid for**. This tutorial is suitable for all BCH CashTokens builders who want to fully understand BCMR metadata.

Join us as we take your CashTokens-building game up a level!

<!-- TOC --><a name="build-together"></a>

### Build Together

The BCH CashTokens builders’ community is growing fast! Feel free to join either, or both, of these Telegram groups to get support and talk with other builders:

- [Panmoni CashTokens Builders](https://t.me/Panmoni/315)
- [CashToken Devs](https://t.me/cashtoken_devs)

To get an intro to BCH CashTokens in general as well as fungible CashTokens, see [Tutorial 1 in the Token Pioneers series](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1). For NFTs, see [Tutorial 2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2). To find more CashTokens builder communities, visit [BitcoinCashSite.com/cashtokens](https://www.bitcoincashsite.com/cashtokens).

<!-- TOC --><a name="what-is-bcmr"></a>

## What is BCMR?

As you learned in tutorials [1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-cashtokens-metadata) and [2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2#heading-nft-metadata) of the _Token Pioneers_ series, fungible tokens (FTs) and non-fungible tokens (NFTs) on BCH take a specific format on-chain that utilizes a minimal amount of data.

However, the token metadata, i.e., [tickers](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-cashtokens-metadata) (e.g., BCH, BTC, ETH), coin names (e.g., Tether, USD Coin, etc.), decimals, NFT images, etc., for CashTokens is **not** stored on the BCH blockchain.

Thus, we need a light and extensible protocol for storing this metadata off-chain. This is where the BCMR (Bitcoin Cash Metadata Registries) specification comes into play. The BCMR conserves block space by linking complex and sometimes-mysterious on-chain data to human-readable off-chain metadata.

**Sidenote**: If you feel you already have a solid grasp on the BCMR, you can skip past the “theory” and right to the practice by jumping to the [“Building with BCMR”](#building-with-bcmr) section below.

<!-- TOC --><a name="the-bcmr-makes-your-tokens-look-good"></a>

### The BCMR Makes your Tokens Look Good!

Without BCMR metadata, your tokens in wallets and on websites would look like long, inscrutable alphanumeric strings. BCMR metadata takes on-chain assets and makes them look nice, facilitating mainstream use of BCH tech for tokenization of assets both digital and real-world.

So, you will need the BCMR when creating your tokens, NFTs and dapps on BCH. But, don’t worry, working with the BCMR is very easy!

<!-- TOC --><a name="simple-json-text-files"></a>

### Simple JSON Text Files

BCMR files are simple [JSON](https://en.wikipedia.org/wiki/JSON) text files, hosted on a website over https or [IPFS](https://docs.ipfs.tech/concepts/what-is-ipfs/) (the InterPlanetary File System). This format ensures ensures ease of access, distribution and updating.

BCMR files link identities (which can include tokens) to their respective on-chain data by including the hash of the **pre-genesis transaction**, also known as the `category`.

<!-- TOC --><a name="bcmr-metadata-in-wallets-websites-dapps"></a>

### BCMR Metadata in Wallets, Websites & Dapps

The BCMR empowers service providers and end-users with the autonomy to decide which metadata to utilize. This user-centric approach not only enhances flexibility but also aligns with the decentralized decision-making ethos of the broader BCH community.

And unlike the CRC-20 standard, the BCMR does not permit anyone to squat on ticker symbols.

<!-- TOC --><a name="why-the-bcmr"></a>

### Why the BCMR

BCH distinguishes itself in the cryptocurrency world as an expression of the Bitcoin white paper that scales to serve humanity’s censorship-resistant transaction needs without the use of Layer 2 (L2) solutions such as the Lightning Network (BTC) or Polygon (Ethereum).

As a cryptocurrency that uniquely seeks to scale its Layer 1 (L1, also known as mainnet), the efficient utilization of BCH block space is paramount. After all, every BCH node has to host a copy of the whole block chain. At the time of writing the BCH blockchain is approaching [200 GB](https://blockchair.com/bitcoin-cash), and that’s only going to grow over time.

In fact, it _has_ to grow, and **a lot**, as the BCH security model depends on scaling such that many small transaction fees can combine with the ever-decreasing block reward to compete for mining hash-power vs other blockchains.

<!-- TOC --><a name="bcmr-files-are-easy-to-make-and-read"></a>

### BCMR Files are Easy to Make and Read

Here is some [sample BCMR metadata](https://bafkreibvm5ferzeyo62x7lcocgrpwij2yrhz3d7vin4huervnr5z2s2ydm.ipfs.nftstorage.link/) from my [Real Bitcoin Fam](https://RealBitcoinFam.com) fungible token (FT). It specifies a token name of “Real Bitcoin Fam Community Award Tokens”, a ticker of XRBF and that this token has 2 decimal places.

As you can see, BCMR files are very easy to read! You can also use a [JSON formatter](https://jsonformatter.org/) or drop BCMR JSON text into your [code editor](https://code.visualstudio.com/) for enhanced readability.

<!-- TOC --><a name="1-fungible-token-bcmr"></a>

#### 1. Fungible Token BCMR

```json
{
  "$schema": "https://cashtokens.org/bcmr-v2.schema.json",
  "version": {
    "major": 0,
    "minor": 4,
    "patch": 0
  },
  "latestRevision": "2023-07-19T22:23:41.467Z",
  "registryIdentity": {
    "name": "BCMR for Real Bitcoin Fam",
    "description": "Self-published BCMR for Real Bitcoin Fam"
  },
  "identities": {
    "482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887": {
      "2023-07-19T16:23:41.467Z": {
        "name": "Real Bitcoin Fam Community Award Tokens",
        "description": "Real Bitcoin Fam's community award token for rewarding new BCH builders who are building with CashTokens. Real Bitcoin Fam is a support network for Bitcoin, cryptocurrency and Web3 builders who align with an OG Bitcoin vibe.",
        "token": {
          "category": "482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887",
          "symbol": "XRBF",
          "decimals": 2
        },
        "uris": {
          "icon": "ipfs://bafkreiax4h2evyf4g7iuu6kuqkxwez4kvduxayngj5vxmvgrekipevptl4",
          "web": "https://RealBitcoinFam.com",
          "youtube": "https://www.youtube.com/@RealBitcoinCashSite",
          "support": "https://t.me/Panmoni",
          "telegram": "https://t.me/Panmoni",
          "twitter": "https://twitter.com/RealBitcoinFam",
          "discord": "https://discord.gg/MaybgkHs53",
          "instagram": "https://www.instagram.com/realbitcoinfam/"
        },
        "extensions": {
          "contact": {
            "phone": "+1 (215) 360-3513",
            "email": "hello@panmoni.com"
          }
        }
      }
    }
  }
}
```

<!-- TOC --><a name="2-nft-bcmr"></a>

#### 2. NFT BCMR

And here is an excerpt from some [sample NFT metadata](https://bafkreigiw3m4biu5bx6bc7ab7zcdu6vdsxlcz2e6bwvfha5mmj5dc3nexi.ipfs.nftstorage.link/) for my [“BCH Vision NFT Series 2021”](https://www.bitcoincashsite.com/blog/bch-vision-2021-nft-series) ([Buy them at tapswap.cash!](https://tapswap.cash/trade/792eb291fee60820bc04fcdde48c73fa23a2a35756fe01c7164f5b5ce783f5f2))

```json
{
  "$schema": "https://cashtokens.org/bcmr-v2.schema.json",
  "version": {
    "major": 0,
    "minor": 1,
    "patch": 0
  },
  "latestRevision": "2023-08-12T21:41:35.901Z",
  "registryIdentity": {
    "name": "BCMR for BCH Vision NFT Series 2021",
    "description": "Self-published BCMR for BCH Vision NFT Series 2021."
  },
  "identities": {
    "792eb291fee60820bc04fcdde48c73fa23a2a35756fe01c7164f5b5ce783f5f2": {
      "2023-08-12T21:41:35.901Z": {
        "name": "BCH Vision Series 2021",
        "description": "The BCH Vision Series is a collection of 25 social media images that were first published in 2021. They lay out a vision for the future development of Bitcoin Cash.",
        "token": {
          "category": "792eb291fee60820bc04fcdde48c73fa23a2a35756fe01c7164f5b5ce783f5f2",
          "symbol": "BCHNFT-BCHVISION2021",
          "nfts": {
            "description": "The BCH Vision Series is a collection of 25 social media images that were first published in 2021. They lay out a vision for the future development of Bitcoin Cash.",
            "parse": {
              "types": {
                "01": {
                  "name": "BCH Vision 2021 NFT Series #1",
                  "description": "NFT #1 from the BCH Vision 2021 NFT Series.",
                  "uris": {
                    "icon": "ipfs://bafybeiax6xk6fb4u5cbgursnizylo7kcjtbxhjd6cadyq23iett653nyxi/1.png",
                    "image": "ipfs://bafybeiax6xk6fb4u5cbgursnizylo7kcjtbxhjd6cadyq23iett653nyxi/1-img.png"
                  },
                  "extensions": {
                    "attributes": {
                      "Title": "Bitcoin Cash Thinks Big"
                    }
                  }
                },
```

[View the whole NFT metadata file here.](https://bafkreigiw3m4biu5bx6bc7ab7zcdu6vdsxlcz2e6bwvfha5mmj5dc3nexi.ipfs.nftstorage.link/)

<!-- TOC --><a name="8-key-bcmr-concepts"></a>

### 8 Key BCMR Concepts

Here are 8 key BCMR concepts that you should understand. Don’t worry, only one of them will give you a brief headache, I promise!

You don’t have to memorize nor even understand all of these concepts today. Remember, you can start making tokens and NFTs today just by following tutorial [1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1) (FTs) or [2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2) (NFTs).

<!-- TOC --><a name="1-bcmr-json-schema"></a>

#### 1. BCMR JSON Schema

BCMR is a schema, or a structured format, that you must follow when creating your metadata files (they should validate against the [root schema](https://cashtokens.org/bcmr-v2.schema.json)). This schema permits builders to represent identities that are associated with BCH UTXOs. These identities can be individuals, organizations, etc. — and these identities can have tokens.

You can browse the full schema definition at [https://cashtokens.org/bcmr-v2.schema.json](https://cashtokens.org/bcmr-v2.schema.json) but it’s not a terribly fun read!

With that in mind, we’ll break down the BCMR schema into its key sections.

<!-- TOC --><a name="key-components-of-the-bcmr-schema"></a>

##### Key Components of the BCMR Schema

It’s important to note that any valid BCMR file is itself actually a BCH metadata registry (BCMR). So, while [otr.cash](https://otr.cash/.well-known/bitcoin-cash-metadata-registry.json) and [tokenstork.com](https://tokenstork.com/.well-known/bitcoin-cash-metadata-registry.json) are registries in that they host JSON files with many identities, so also is the [XRBF BCMR file](https://bafkreibvm5ferzeyo62x7lcocgrpwij2yrhz3d7vin4huervnr5z2s2ydm.ipfs.nftstorage.link/) linked above, which only hosts one identity.

_It’s registries all the way down!_

- **version**: BCMR versioning leverages [Semantic Versioning](https://semver.org/), so the major field should be incremented when an identity is removed, the minor when an identity is added or a new snapshot is added, and the patch when an existing identity or identity snapshot is modified or when registry name, description or URIs change. So, in the case of XRBF, the minor should be 1, since 1 identity has been added, and the patch 4, since I have made 4 minor updates to it (I think). In other words, 0.1.4.

```json
  "version": {
    "major": 0,
    "minor": 1,
    "patch": 4
  },
```

- **registryIdentity**: Since every file is its own registry, you get to name yours! This section can have name, description and URIs. The below example is drawn from the [tokenstork.com](https://tokenstork.com/.well-known/bitcoin-cash-metadata-registry.json) registry (which, at the time of writing, is mostly just a mirror of the more authoritative [otr.cash](https://otr.cash/.well-known/bitcoin-cash-metadata-registry.json) registry).

```json
  "registryIdentity": {
    "name": "TokenStorkRegistry",
    "description": "A community-reviewed registry of tokens on Bitcoin Cash. Publishes names, symbols, icons, and other metadata about CashTokens via a Bitcoin Cash Metadata Registry (BCMR).",
    "uris": {
      "icon": "https://tokenstork.com/TokenStorkRegistry-icon.png",
      "web": "https://tokenstork.com/",
      "registry": "https://tokenstork.com/.well-known/bitcoin-cash-metadata-registry.json"
    }
```

- **identities**: The central part of the schema, it outlines how individual and organizational identities are represented.

Here’s an identity from the [otr.cash registry](https://otr.cash/.well-known/bitcoin-cash-metadata-registry.json) for some FTs on chipnet, which is a kind of BCH testnet. Note that it uses `splitId` to indicate that this token is on a different chain from mainnet BCH.

```json
    "07a70ec6e0a325991e829daea5de1be1bb71e1ef4a04931cdddf567d8f60f676": {
      "2023-05-12T20:18:04.000Z": {
        "name": "OTR Chipnet Tokens",
        "description": "OpenTokenRegistry's example fungible token issued on Chipnet, a network used for Bitcoin Cash development.\n\nIn user interfaces with limited space, descriptions may be hidden beyond 140 characters or the first newline character; this example allows for testing of hiding and revealing extended descriptions.",
        "token": {
          "category": "0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428",
          "decimals": 6,
          "symbol": "OTRC"
        },
        "splitId": "00000000040ba9641ba98a37b2e5ceead38e4e2930ac8f145c8094f94c708727",
        "uris": {
          "icon": "ipfs://bafkreig32k6kowcldesjbytktvsh47wnr72qp67ig3aldcjkkkgkx4jmnq",
          "web": "https://otr.cash/docs/test",
          "chat": "https://t.me/cashtoken_devs"
        }
      }
    },
```

Here’s another identity from otr.cash for your reference and analysis. You can pick up a lot just by reading existing BCMRs. Note that this one uses a `symbol` that is highly-compliant with the [otr.cash listing guidelines](https://otr.cash/docs/list/).

```json
    "180f0db4465c2af5ef9363f46bacde732fa6ffb3bfe65844452078085b2e7c93": {
      "2023-05-26T17:10:00.000Z": {
        "name": "Emerald DAO U23",
        "description": "A series of 2000 keycard NFTs which entitle each holder to a unique, on-chain Emerald DAO safebox holding at least 0.101 BCH. Beginning May 15, 2024, each keycard NFT may be burned to unlock its matching safebox.\n\nThe Emerald DAO U23 series was created on May 15, 2023 to demonstrate new capabilities enabled by the CashTokens upgrade and to celebrate the 2023 upgrade event. Emerald DAO U23 is minted by an instance of Emerald DAO v2.1.0 with a minimum safebox size of 0.1 BCH and an initial endowment of 2 BCH into DAO's rewards pool.",
        "token": {
          "category": "180f0db4465c2af5ef9363f46bacde732fa6ffb3bfe65844452078085b2e7c93",
          "symbol": "EMRDAO-U23"
        },
        "uris": {
          "icon": "ipfs://bafybeigqogqx3n4cldk6nizl5vihopi2dkgvw4yqamc5rhleyqu25soe4e",
          "web": "https://emerald-dao.cash/",
          "chat": "https://t.me/emeralddao",
          "app": "https://emerald-dao.vercel.app"
        }
      }
    },
```

- **tags**: Tags are defined at the top level of a registry and used inside individual identities in the `identities` section. They can be useful for categorizing and grouping identities within a given registry, however few registries other than TokenStork are using them, at the time of writing.

Here is a list of tag definitions that could be used at the top-level of a BCMR. In this structure, the `tags` defined at the top level act as a common repository of tags that can be associated with multiple identities, ensuring consistency and ease of management across the registry.

```json
{
  "tags": {
    "utility-token": {
      "name": "Utility Token",
      "description": "A token that provides users with access to a product or service offered by the issuing project."
    },
    "security-token": {
      "name": "Security Token",
      "description": "A token that represents investment in a project, often with expectations of profit, dividends, or voting rights."
    },
    "stablecoin": {
      "name": "Stablecoin",
      "description": "A type of cryptocurrency that aims to maintain a stable market value, often pegged to a fiat currency or commodity."
    },
    "governance-token": {
      "name": "Governance Token",
      "description": "A token that provides holders with voting rights in the governance of a decentralized project or protocol."
    },
    "defi-token": {
      "name": "DeFi Token",
      "description": "A token associated with decentralized finance (DeFi) applications, often used in lending, borrowing, or liquidity provision."
    },
    "nft": {
      "name": "NFT",
      "description": "A unique token representing ownership or proof of authenticity of a digital or physical asset."
    },
    "wrapped-token": {
      "name": "Wrapped Token",
      "description": "A token that represents another cryptocurrency on a different blockchain, allowing for cross-chain token utilization."
    },
    "payment-token": {
      "name": "Payment Token",
      "description": "A token primarily used as a medium of exchange or for payment purposes."
    },
    "exchange-token": {
      "name": "Exchange Token",
      "description": "A token issued by a cryptocurrency exchange, often offering benefits like reduced fees or participation in revenue sharing."
    },
    "privacy-token": {
      "name": "Privacy Token",
      "description": "A token designed with enhanced privacy features, offering greater anonymity for transactions."
    },
    "asset-backed-token": {
      "name": "Asset-Backed Token",
      "description": "A token backed by a tangible or intangible asset, like gold, real estate, or intellectual property."
    },
    "liquidity-provider-token": {
      "name": "Liquidity Provider Token",
      "description": "A token received in exchange for providing liquidity to a decentralized exchange or liquidity pool."
    },
    "memecoin": {
      "name": "Memecoin",
      "description": "A cryptocurrency, often created and shared as a joke or for fun, that may gain popularity or value through social media and community support."
    }
  }
}
```

Here is an example of how those tags might be deployed within an identity. Note that the tag definitions go at the top level of the file but the use of the tags goes at the same level as `name` and `description` in an identity object. Also note that when using tags in an identity, it requires an [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Array), as shown below.

```json
{
"482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887": {
      "2023-07-19T16:23:41.467Z": {
        "name": "Real Bitcoin Fam Community Award Tokens",
        "description": "Real Bitcoin Fam's community award token for rewarding new BCH builders who are building with CashTokens. Real Bitcoin Fam is a support network for Bitcoin, cryptocurrency and Web3 builders who align with an OG Bitcoin vibe.",
        "tags": ["payment-token", "governance-token"],
        "token": {
          "category": "482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887",
          "symbol": "XRBF",
          "decimals": 2
        },
```

- **extensions**: By definition, extensions are for builders to add specific information not covered in the standard schema.

Here is my CashNinjas NFT, which I found by looking up the NFT series at [TokenExplorer.cash](https://tokenexplorer.cash/?tokenId=77a95410a07c2392c340384aef323aea902ebfa698a35815c4ef100062c6d8ac) (from BCH developer [Mathieu Geukens](https://twitter.com/GeukensMathieu)) and then searching inside the [registry](https://api.ninjas.cash/.well-known/bitcoin-cash-metadata-registry.json) for this series.

As you can see it uses `extensions` to publish metadata around the NFT’s attributes. These attribute properties are not defined in the BCMR standard, and include hashes of the NFT image and icon so end-users can verify authenticity.

```json
  "11":{
    "name":"Ninja #18 - Thunder Strider of the Midnight River",
	"description":"Meet Thunder Strider of the Midnight River, an elite CashNinja from the intense and charismatic Thunder clan. His skin, painted in the deep hues of midnight, compliments his ground color markings, a symbol of his raging thunder affiliation, perfect for scouting the dark landscapes undetected. His psychic eyes, a rare trait among Thunder clan members,  give him an uncanny ability to foresee adversaries' movements, making him a formidable opponent. Armed with his lethal bow and arrow, the Thunder Strider stands at the vanguard of his clan, prepared to uphold honor and tradition. This NFT, hand-drawn and steeped in mystery, allows you to immerse yourself in the lore of the CashNinjas, to partake in their epic tales of valor, and take part in a legacy that expands beyond the digital realm.",
    "uris":{
      "icon":"https://api.ninjas.cash/icons/18",
      "image":"https://api.ninjas.cash/images/18"
    },
    "extensions":{
      "attributes":{
        "Background":"River",
        "Primary Color":"Midnight",
        "Secondary Color":"Ground",
        "Marking":"Thunder",
        "Eyes":"Psychic",
        "Weapon":"Bow and Arrow"
        },
	"image-hash": "fd431e234ed79124b8afa28c70aab6b383b8bd1b23f08bcf2a8fc3128e71ce1a",
	"icon-hash": "ec5151b1153c99eccf14550fe3a89ea125879e57506f82f0e1e3dc2c254faf9d"
        }
      }
```

Coincidentally, [you can see my fine NFT](https://viewer.sploit.cash/nft/bitcoincash:qr033df3ym99dqru8a6gtwfus8t8g9w5lsve42m0df/77a95410a07c2392c340384aef323aea902ebfa698a35815c4ef100062c6d8ac/11) using the new NFT viewer from BCH developer [sploit](https://twitter.com/acidsploit).

Another example of `extensions` is in the XRBF registry:

```json
        "extensions": {
          "contact": {
            "phone": "+1 (215) 360-3513",
            "email": "hello@panmoni.com"
          }
        }
```

- **token**: Specifies information about the tokens associated with a given identity, including details like symbols and decimals. This component also includes NFT data. This section was covered in detail in tutorials [1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-cashtokens-metadata) and [2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2#heading-nft-metadata).

- **chains**: This section can be used to identify which chain the identity is valid for, and is especially useful for tokens created on chipnet. In the case of a future BCH network split, this section could become useful in assisting wallets in showing users which assets are on which chain(s).

- **latestRevision**: Indicates the timestamp of the latest revision made to the registry (file), providing a reference point for updates. It is used at the top level of the JSON file. Any time you update a BCMR, it is recommended to update this field with the current time.

```json
"latestRevision": "2023-07-19T22:23:41.467Z",
```

In this example, the `latestRevision` field indicates that the last update to this specific BCMR file was made on July 19, 2023, at 22:23:41.467 UTC.

To get the current time in this format (simplified extended ISO 8601 format), you can open the [Javascript Console](https://webmasters.stackexchange.com/questions/8525/how-do-i-open-the-javascript-console-in-different-browsers) in your browser and run the below code. It will get the current time in the correct format and then log it to the console. You can copy it from there.

```js
const currentTime = new Date().toISOString();
console.log(currentTime);
```

You can also visit [UTCTime.net](https://www.utctime.net/) for this information.

<!-- TOC --><a name="2-token-vs-identity-vs-category"></a>

#### 2. Token vs Identity vs Category

It’s important to be straight on the differences among token, identity and category, as they can be similar and appear slightly overlapping at times.

- **identity**: An identity is what the BCMR deals in. The BCMR is not, first and foremost, about tokens, but about identities. Identities can have tokens, or not.
- **token**: Tokens can be fungible or non-fungible and, from the BCMR perspective, exist inside an identity. How they work on-chain is a different matter that is covered in the tutorials [1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1) (FTs) and [2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2) (NFTs). A single identity can have multiple FTs and NFTs under it in a BCMR, for example [as shown here](https://github.com/bitjson/chip-bcmr/blob/master/examples/payouts-or-dividends.json).
- **category**: In BCMR files, the category is the unique identifier for an identity. In practice, category is simply another name for the pre-genesis transaction of a token, or is sometimes called token ID. Category is what is used to primarily identify a token on [Cauldron Swap](https://cauldron.quest/), [TokenExplorer.cash](https://tokenexplorer.cash/) [TokenStork.com](https://TokenStork.com/), on explorers, indexers and, indeed, BCMR files.

<!-- TOC --><a name="3-authhead-authbase"></a>

#### 3. Authhead & Authbase

As mentioned in [tutorial 1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-authbase-and-authchain), **authhead** and **authbase** are two very key BCMR concepts that you will want to understand and have clear in your mind.

When you create an on-chain identity (token, etc.), it is a good practice to create an OP_RETURN that contains a link to your BCMR(s) for that identity. This OP_RETURN comes after the first output in the genesis transaction (which is known as both the **zeroth output** and the **identity output**). That particular OP_RETURN takes this format:

`OP_RETURN <'BCMR'> <hash> [<uri> <uri> ... <uri>]`

(Later, you will learn how to build your own OP_RETURN!)

The URIs refer to the URL(s) where your BCMR file is located at, for example, `api.ninjas.cash` or `ipfs://bafkreiep4pnftxhhsckibfiifloduhymusaiqiojcggpkptizpdgasxfl4`. You can host your BCMR in multiple places for redundancy, just be sure that every file is identical so they all have the same hash.

This transaction where you first created your BCMR OP_RETURN appropriately is (conventionally) the **authbase**, the on-chain foundation (or, base) of BCMR identity for this particular `category` of identity/token. The **authbase** doesn’t change over time, unless you re-mint your token from scratch.

If your identity has no authbase, it can still have BCMR metadata via a DNS-resolved registry (see below). That said, it is a best practice to create and properly maintain the authbase.

<!-- TOC --><a name="metadata-updates"></a>

##### Metadata Updates

BCMR identities can be updated (see the section on Identity History below). However, updating them is not just a matter of editing the BCMR file in place at its current URL!

In the authbase, the BCMR is linked together with its hash. So, if you edit the file in place, its content — and therefore its hash — will change. This will render your BCMR invalid and your token will have a red X shown for it at the bottom of its listing on [TokenExplorer.cash](https://tokenexplorer.cash/).

Here is an example of a metadata hash that does not match and therefore the integrity of the BCMR data can not be verified by clients such as wallets, etc. This is something you want to avoid.

![](/tp3/Screenshot%202023-12-05%20at%203.09.38%20PM.png)

<!-- TOC --><a name="the-authhead"></a>

##### The Authhead

So, when you want to update a given identity, you must update both the file (or just create a new file at a new URL if, for example, you’re using IPFS) and the blockchain. This update creates a new BCH transaction, and this transaction is the **authhead**.

The **authhead** of a given identity contains a link to the latest update to its metadata — kind of analogous to how the “chain tip” is the most recently created block on a blockchain

Given that the opposite of a head is feet, perhaps authbase would be better referred to as an authfoot? I’ll let you decide that one!

<!-- TOC --><a name="on-chain-terms"></a>

##### On-chain Terms

The authbase and authhead are always on-chain concepts that refer to transaction IDs where these things happened. These terms are not BCMR file properties, per se, though they are deeply relevant to all BCMR topics.

This is another example where the design of CashTokens and BCMR is quite elegant, at least in the sense of some concepts being implied in the structure of things; i.e., in the relationships among things.

In this case, the authbase and authhead terms only find concrete meaning in their relationships, and are not explicit fields nor properties.

<!-- TOC --><a name="authhead-and-authbase-examples"></a>

##### Authhead and Authbase Examples

Let’s look at some examples of these concepts.

For the XRBF token, [this transaction](https://explorer.bitcoinunlimited.info/tx/5de87383470ec7d31a8eeb3da2f21952da42b300fd527c6bf3600f03caf122c4#output-0) from 19 July 2023 is the authbase. As you can see, the full supply of the token was created and the second output is an OP_RETURN with a link to the original metadata for this token.

[![](/tp3/Screenshot%202023-12-05%20at%2011.21.29%20AM.png)](https://explorer.bitcoinunlimited.info/tx/5de87383470ec7d31a8eeb3da2f21952da42b300fd527c6bf3600f03caf122c4#output-0)

On 14 November 2023, I updated the BCMR file and created [this transaction](https://explorer.bitcoinunlimited.info/tx/7a1f732051b6804c991dc72d73faa15612324cbc64f5f081184466d031e3a902). You can see that the second output is an OP_RETURN with a link to an IPFS file that was the revised metadata at that time. As of 14 November, this became the authhead for XRBF.

[![](/tp3/Screenshot%202023-12-05%20at%2011.22.30%20AM.png)](https://explorer.bitcoinunlimited.info/tx/7a1f732051b6804c991dc72d73faa15612324cbc64f5f081184466d031e3a902)

<!-- TOC --><a name="4-authchain-zdtc"></a>

#### 4. Authchain & ZDTC

Now that you know what an authbase and authhead is, just know that an authchain is the full collection of (on-chain) updates to the authbase of a given identity. It’s that simple!

An authchain is an example of a **zeroth-descendant transaction chain**, or ZDTC. This is just a fancy term for the idea of BCMR updates that take place as on-chain transactions in which the first output (identity output) of the previous BCMR update is spent as the first input to create the next identity output.

This just means that you can always update your BCMR by creating a new transaction which takes the previous first output as an input (i.e., the identity output or authhead), and then creates a zeroth (identity) output that is followed by an OP_RETURN in the proper format, as discussed above.

We will perform this update process below in the “Building with BCMR” section, so stand by!

<!-- TOC --><a name="identities-on-bitcoin-cash"></a>

##### Identities on Bitcoin Cash

[![](/tp3/authchain.png)](https://cashtokens.org/docs/bcmr/chip/#zeroth-descendant-transaction-chains)

This diagram from [CashTokens.org](https://cashtokens.org/docs/bcmr/chip/#zeroth-descendant-transaction-chains) can be quite helpful in understanding authchains.

Starting from the left, we see the **authbase** transaction, which could be the genesis transaction of a token. The first output is the **identity output**, and the other output is essentially not relevant to this topic.

There is a second transaction in which the **identity output** of the authbase transaction is spent, perhaps to update the BCMR for the token created in the authbase transaction. Then a third that does the same.

The authhead transaction is simply another transaction in which an **identity output** is spent forward.

Altogether, these transactions that are not grayed out constitute an **authchain** for a given identity (usually including a token), otherwise known in fancy lingo as a ZDTC (zeroth-descendant transaction chain).

Watch this explanation as a YouTube video:

[![Watch this as a YouTube video](https://img.youtube.com/vi/BxGmP9jAlUE/0.jpg)](https://www.youtube.com/watch?v=BxGmP9jAlUE)

<!-- TOC --><a name="identity-output-the-op_return"></a>

##### Identity Output & the OP_RETURN

One important thing to note is that the OP_RETURN and the identity output are two different things.

This confused me at first because I saw discussion of the zeroth output, but the OP_RETURN with the BCMR link was always the second output.

But OP_RETURNs are not spendable. They are just a marker for BCMR updates, but they are irrelevant to the **identity output**.

For those, like me, who like things to be explicit, in this case sadly the **identity output** is identified implicitly, and not explicitly.

The zeroth output (identity output) is reserved for continuing the authchain, and the OP_RETURN output containing the BCMR link is typically positioned after this, and that’s just how this stuff works!

<!-- TOC --><a name="burning-merging"></a>

##### Burning & Merging

It is possible to burn an identity by spending the authhead identity output into a transaction that includes an OP_RETURN containing `0x6a`. Burning lets BCMR clients know that the identity can be archived. Burning is rarely necessary as updating identities is easy, as previously discussed.

If you want to merge two or more identities, you can spend the respective authhead identity outputs together in a transaction.

<!-- TOC --><a name="authchain-resolution"></a>

##### Authchain Resolution

Authchain resolution is simply the process of following an authchain, i.e., recursively tracing the relevant identity outputs starting from the authbase transaction until the authhead.

<!-- TOC --><a name="spv-validation"></a>

##### SPV Validation

Just as SPV ([Simplified Payment Verification](https://documentation.cash/protocol/spv.html)) works to permit the verification of BCH transactions without downloading the full blockchain (notably in mobile wallets), it can also work to simplify the verification of BCMR updates. This makes the BCMR specification quite lightweight, fast and versatile, indeed.

<!-- TOC --><a name="5-bcmr-identity-history-identity-snapshots"></a>

#### 5. BCMR Identity History & Identity Snapshots

Identity History and Identity Snapshots are discussed in the BCMR root schema, but are concepts — and not fields, per se.

An **Identity Snapshot** is just a timestamped collection of identity metadata. Here is one Identity Snapshot:

```json
"2023-07-19T16:23:41.467Z": {
        "name": "Real Bitcoin Fam",
        "description": "Real Bitcoin Fam is a support network for Bitcoin, cryptocurrency and Web3 builders who align with an OG Bitcoin vibe.",
        "token": {
          "category": "482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887",
          "symbol": "RBF",
          "decimals": 2
        },
        "uris": {
          "icon": "https://www.realbitcoinfam.com/images/rbftoken.png",
          "web": "https://RealBitcoinFam.com",
          "youtube": "https://www.youtube.com/@RealBitcoinCashSite",
          "support": "https://t.me/Panmoni",
          "twitter": "https://twitter.com/RealBitcoinFam",
          "discord": "https://discord.gg/MaybgkHs53"
        }
      }
```

As you can see, it starts with a timestamp. This is the time at which this metadata is (or was) valid for the `category` it sits within.

**Identity History** is the collection of time-stamped Identity Snapshots under a given identity. Here is an example of an Identity History that has two Identity Snapshots:

```json
"identities": {
    "482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887": {
      "2023-12-04T18:25:15.000Z": {
        "name": "Real Bitcoin Fam Community Award Tokens",
        "description": "Real Bitcoin Fam's community award token for rewarding new BCH builders who are building with CashTokens. Real Bitcoin Fam is a support network for Bitcoin, cryptocurrency and Web3 builders who align with an OG Bitcoin vibe.",
        "tags": ["payment-token", "governance-token"],
        "token": {
          "category": "482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887",
          "symbol": "XRBF",
          "decimals": 2
        },
        "uris": {
          "icon": "ipfs://bafkreiax4h2evyf4g7iuu6kuqkxwez4kvduxayngj5vxmvgrekipevptl4",
          "web": "https://RealBitcoinFam.com",
          "youtube": "https://www.youtube.com/@RealBitcoinCashSite",
          "support": "https://t.me/Panmoni",
          "telegram": "https://t.me/Panmoni",
          "twitter": "https://twitter.com/RealBitcoinFam",
          "discord": "https://discord.gg/MaybgkHs53",
          "instagram": "https://www.instagram.com/realbitcoinfam/"
        },
        "extensions": {
          "contact": {
            "phone": "+1 (215) 360-3513",
            "email": "hello@panmoni.com"
          }
        }
      },
      "2023-07-19T16:23:41.467Z": {
        "name": "Real Bitcoin Fam",
        "description": "Real Bitcoin Fam is a support network for Bitcoin, cryptocurrency and Web3 builders who align with an OG Bitcoin vibe.",
        "token": {
          "category": "482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887",
          "symbol": "RBF",
          "decimals": 2
        },
        "uris": {
          "icon": "https://www.realbitcoinfam.com/images/rbftoken.png",
          "web": "https://RealBitcoinFam.com",
          "youtube": "https://www.youtube.com/@RealBitcoinCashSite",
          "support": "https://t.me/Panmoni",
          "twitter": "https://twitter.com/RealBitcoinFam",
          "discord": "https://discord.gg/MaybgkHs53"
        }
      }
    }
  },
```

As you can see, it contains the Identity Snapshot from `2023-07-19T16:23:41.467Z` and adds a new one from `2023-12-04T18:25:15.000Z`. Together, these Identity Snapshots form an Identity History.

<!-- TOC --><a name="authchain-vs-identity-history"></a>

##### Authchain vs Identity History

As discussed above, the authchain is found on-chain by examining a chain of transactions. And Identity History is the BCMR analogue of the authchain. Identity History, of course, exists off-chain.

<!-- TOC --><a name="identity-history-builds-trust"></a>

##### Identity History Builds Trust

Maintaining the Identity History of your identities in your BCMRs demonstrates transparency and can build trust in those identities. It’s a kind of metadata version control that permits the ecosystem to see your identities’ histories.

This is important since all CashTokens metadata is stored off-chain and thus is **not immutable**. What today is called X Token can be renamed tomorrow to Y Token just by doing an update of the authchain. Without maintaining your Identity History, this can cause confusion to the ecosystem, resulting in a loss of trust.

Trust matters when you’re trying to build in DeFi in 2024, that’s for sure! So be sure to maintain your BCMR Identity History.

<!-- TOC --><a name="identity-history-reconstruction"></a>

##### Identity History Reconstruction

If you weren’t taking advantage of the Identity History function in your BCMR, but now wish to, you just need to gather your previous Identity Snapshots and place them under the latest one in your BCMR.

If you’ve always used the same GitHub gist, you can go back and look at previous revisions to find those old Identity Snapshots.

If you’ve used IPFS files, you can find those files, for example at [nft.storage](https://nft.storage/files/) (if you used that) and get the historical data that way.

If you want to find your old BCMR data on-chain, you can visit [TokenExplorer.cash](https://TokenExplorer.cash), enter your token’s `category` and click on the “authHead txid”. This will take your to the BU blockchain explorer.

Trace your authhead updates back by continually continually clicking on the first input of each transaction — unless you did something odd with your authhead, in which case click around a bit until you find it.

Find any or all old BCMR URLs, grab the data and organize them sequentially into an Identity History. It’s just good BCMR practice!

Need help? Check in with the [CashToken developers on Telegram](https://t.me/cashtoken_devs) and we will guide you!

<!-- TOC --><a name="migration"></a>

##### Migration

If you are going to make a significant change to your token’s branding, it’s a good idea to use the `migrated` property at the top level of your new Identity Snapshot. This will let the ecosystem know that the Identity Snapshot immediately previous to this one remains relevant, as presumably you are in the process of notifying the ecosystem of the significant branding (and metadata) change.

Here is a BCMR snippet from an [example provided by the BCMR creator](https://github.com/bitjson/chip-bcmr/blob/master/examples/fungible-token.json), [Jason Dreyzehner](https://twitter.com/bitjson), which shows off the use of the `migrated` property:

```json
"identities": {
 "89cad9e3e34280eb1e8bc420542c00a7fcc01002b663dbf7f38bceddf80e680c": {
      "2023-01-13T00:00:00.000Z": {
        "name": "Example Asset",
        "description": "This is a short description of Example Asset. In most interfaces, it will be hidden beyond 140 characters or the first newline character.\n\nThis sentence should be hidden in user interfaces with limited space.\n\nNote that this snapshot was introduced on 2023-1-13, but the 'migrated' property indicates that the migration took place over the following month. During that month, most clients should have warned users about the upcoming change, referring users to the 'migrate' URI for information about the change. (Some clients may also offer clients the option to dismiss the migration period and immediately show the new metadata.) At 0 UTC on 2023-2-13, all clients should have switched their default display for this token to use the new metadata, i.e. ticker symbol XAMPL, with 6 decimal places. After the migrated timestamp, old metadata should only be displayed when providing historical context.",
        "token": {
          "category": "89cad9e3e34280eb1e8bc420542c00a7fcc01002b663dbf7f38bceddf80e680c",
          "decimals": 6,
          "symbol": "XAMPL"
        },
        "migrated": "2023-02-13T00:00:00.000Z",
```

<!-- TOC --><a name="6-bcmr-decimal-places"></a>

#### 6. BCMR Decimal Places

Decimals are not a _major_ BCMR concept but I see confusion around them among new CashTokens builders.

On-chain, there are no decimal places for your tokens! None, **whatsoever**. Decimals are present only in the BCMR metadata standard.

Let's say you want to create an FT with a max supply of 1 million tokens, each of which has 8 decimal places. In this case, you need to create an on-chain genesis supply of 1000000 + 00000000, so 100000000000000 (100,000,000,000,000 or 100 trillion).

Wallets and front-end interfaces will leverage your token’s metadata to present its supply as 1 million, assuming you specify 8 decimals in your valid, linked BCMR file.

<!-- TOC --><a name="7-dns-resolved-registries"></a>

#### 7. DNS-Resolved Registries

A DNS-Resolved BCMR is simply a text file located at a domain/.well-known/bitcoin-cash-metadata-registry.json where bitcoin-cash-metadata-registry.json is the BCMR file.

So, for example, here are some DNS-resolved registries:

1. `https://otr.cash/.well-known/bitcoin-cash-metadata-registry.json`
2. `https://api.ninjas.cash/.well-known/bitcoin-cash-metadata-registry.json`
3. `https://tokenstork.com/.well-known/bitcoin-cash-metadata-registry.json`

Take note that DNS-Resolved BCMRs must be accessible via https.

If you choose to put your BCMR in this location, and also put it on-chain when creating a token or updating its metadata, you can just put the domain, i.e., `otr.cash` or `api.ninjas.cash`. Ecosystem software will infer the rest of the URL.

For example, if you look at the authhead of the CashNinjas NFT series, you’ll see that its BCMR URL is just `api.ninjas.cash`, which works perfectly.

[![](/tp3/Screenshot%202023-12-04%20at%202.48.12%20PM.png)](https://explorer.bitcoinunlimited.info/tx/9f74aae846694b1db53fd2b2eff4f925095024bff8cd36e44571fc49d127b8ce)

<!-- TOC --><a name="8-chain-resolved-registries"></a>

#### 8. Chain-Resolved Registries

Chain-resolved BCMRs are simply good old BCMR files that are linked to in an OP_RETURN on-chain in accordance with the format discussed above.

Chain-resolved registries, since the links on-chain are immutable, can enjoy more trust. After all, not only is the link to the BCMR on-chain and therefore immutable, but the link contains the hash of the file. The hash permits anyone to verify whether the file has changed or remained the same since it was linked to on-chain.

<!-- TOC --><a name="examples-of-chain-resolved-registries"></a>

##### Examples of Chain-Resolved Registries

Here is one for FURU tokens, part of the [BCH Guru](https://bch.guru/) project, and as you can see, it links to [ipfs://bafkreiep4pnftxhhsckibfiifloduhymusaiqiojcggpkptizpdgasxfl4](https://bafkreiep4pnftxhhsckibfiifloduhymusaiqiojcggpkptizpdgasxfl4.ipfs.dweb.link/).

[![](/tp3/Screenshot%202023-12-05%20at%2010.34.53%20AM.png)](https://explorer.bitcoinunlimited.info/tx/5e3915d6ab19c7389a531c7e8144e6d286f48bbc2db48588c27975047ff400aa#output-0)

Here is one for SPICE token which uses a [GitHub gist](https://gist.githubusercontent.com/joemarct/b12e5b0d494590143b11fa9f5837bcdb/raw).

[![](/tp3/Screenshot%202023-12-05%20at%2010.38.18%20AM.png)](https://explorer.bitcoinunlimited.info/tx/dcaadd7e29fdb706e8f5deac7ba4c50dcb1a0268347dcd04548573f1a5202801#output-0)

Note that chain-resolved does not mean that the metadata is hosted on-chain, only that it is found (resolved) via the blockchain. No BCMR metadata is ever actually stored on-chain.

<!-- TOC --><a name="other-registry-types"></a>

##### Other Registry Types

Embedded and manually-imported registries are also contemplated in the BCMR specification. For example, in [tutorial 1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-8-spend-some-tokens), we discussed how to manually import BCMR data into the Electron Cash wallet. You can read more about them in the [BCMR specification](https://cashtokens.org/docs/bcmr/chip/#embedded-registries).

<!-- TOC --><a name="bcmr-concepts-conclusion"></a>

#### BCMR Concepts Conclusion

While these 8 BCMR concepts are a lot to absorb all at once, don’t worry! You can start off very simply as shown in [tutorial 1 for fungible tokens](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1) and [tutorial 2 for NFTs](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2) — and pick up the rest of the concepts as you go.

<!-- TOC --><a name="building-with-bcmr"></a>

## Building with BCMR

Enough theory, am I right? It’s time to build! Here are a few BCMR projects to hone your skills in this important area.

<!-- TOC --><a name="1-explore-an-authchain"></a>

### 1. Explore an Authchain

<!-- TOC --><a name="use-tokenexplorercash"></a>

#### Use TokenExplorer.cash

Visit [TokenStork.com](https://TokenStork.com) and pick any token in the list. Then go to the far right column and, once the data has fully loaded, click the copy icon to grab the `category` of the token whose authchain you want to explore.

Now visit [TokenExplorer.cash](https://TokenExplorer.cash) and enter the `category` you copied where it says to enter tokenID.

I chose the Popcorn! token.

[![](/tp3/Screenshot%202023-12-07%20at%2010.50.11%20AM.png)](https://tokenexplorer.cash/?tokenId=02a690fadd8e3ff5539726c6eca6c2b8039bce945634d78ac46b1db26a8a0eaf)

There is a lot of data here and I encourage you to explore it all. Of immediate interest to us is the following:

1. the **genesis tx**
2. that the token has BCMR metadata linked on-chain
3. the **location metadata** field
4. the **authChain** and **authHead** data at bottom
5. the fact that the metadata hash matches the current contents of the linked metadata file.

Click on the genesis transaction hash (`6f2383b2b2563e15393fc03c6cc225350509b4e5c014ab9d35925cbcdd62d45d`) and you can explore the genesis transaction [on the BU explorer](https://explorer.bitcoinunlimited.info/tx/6f2383b2b2563e15393fc03c6cc225350509b4e5c014ab9d35925cbcdd62d45d).

[![](/tp3/Screenshot%202023-12-07%20at%2011.00.57%20AM.png)](https://explorer.bitcoinunlimited.info/tx/6f2383b2b2563e15393fc03c6cc225350509b4e5c014ab9d35925cbcdd62d45d)

In this case, the OP_RETURN with the linked BCMR is actually the third output, which is fine. All that matters is that it be among the outputs. The first output is always the identity output. This transaction is the **authbase** for the Popcorn! identity/token.

If you go back to the BU explorer and click on the lone input to the genesis transaction, you’ll see that it was created in the transaction with hash `02a690fadd8e3ff5539726c6eca6c2b8039bce945634d78ac46b1db26a8a0eaf` (known as the pre-genesis transaction), which is also the `category` value and which is used as the identity identifier in the [BCMR](https://ipfs.pat.mn/ipfs/QmVBiFzSAVujLnWwCsnWjaFWDrzPVsbvGABTE4LLqBviah) for Popcorn!.

```json
{
  "$schema": "https://cashtokens.org/bcmr-v2.schema.json",
  "version": {
    "major": 1,
    "minor": 0,
    "patch": 0
  },
  "latestRevision": "2023-09-06T08:00:00.000Z",
  "registryIdentity": {
    "name": "Self-certified token metadata",
    "description": ""
  },
  "identities": {
    "02a690fadd8e3ff5539726c6eca6c2b8039bce945634d78ac46b1db26a8a0eaf": {
      "2023-09-06T08:00:00.000Z": {
        "name": "Popcorn!",
        "description": "Popcorn! (Created by a Decentralized Autonomous Popcorn Stand)",
        "token": {
          "category": "02a690fadd8e3ff5539726c6eca6c2b8039bce945634d78ac46b1db26a8a0eaf",
          "decimals": 0,
          "symbol": "POPCORN",
          "nfts": {
            "parse": {
              "types": {
                "": {
                  "name": "Popcorn!",
                  "description": "A popcorn box. May or may not contain popcorn. (Created by a Decentralized Autonomous Popcorn Stand)",
                  "uris": {
                    "icon": "ipfs://QmZC72BMa2YGiNvK9iqNNEDGgDKRidsWxnDMiGEnTu6muF"
                  }
                }
              }
            }
          }
        },
        "uris": {
          "icon": "ipfs://QmQZiH5Qm793qsnhFjF3F8jB3ADYusofE5WBEu4tMuH7mv",
          "contract": "https://gitlab.com/0353F40E/popcorn-stand/-/raw/2243bdbd9004fa05686042925c64188eacd6426a/contract/popcorn.cash"
        }
      }
    }
  },
  "license": "CC0-1.0"
}
```

Hopefully, this helps you see how the dots connect between on-chain CashTokens data and off-chain BCMR metadata.

<!-- TOC --><a name="use-paytacas-bcmr-indexer"></a>

#### Use Paytaca’s BCMR Indexer

Let’s continue looking at the Popcorn! token, this time via the extremely helpful Paytaca BCMR indexer. Visit `https://bcmr.paytaca.com/api/tokens/\{category\}` to get the metadata for any token, similar to what you did at [TokenExplorer.cash](https://tokenexplorer.cash/?tokenId=6f2383b2b2563e15393fc03c6cc225350509b4e5c014ab9d35925cbcdd62d45d). This indexer will always give you the latest metadata, i.e. the BCMR from the authhead.

Here is the [output](https://bcmr.paytaca.com/api/tokens/02a690fadd8e3ff5539726c6eca6c2b8039bce945634d78ac46b1db26a8a0eaf/) for Popcorn!.

```json
{
  "name": "Popcorn!",
  "uris": {
    "icon": "ipfs://QmQZiH5Qm793qsnhFjF3F8jB3ADYusofE5WBEu4tMuH7mv",
    "contract": "https://gitlab.com/0353F40E/popcorn-stand/-/raw/2243bdbd9004fa05686042925c64188eacd6426a/contract/popcorn.cash"
  },
  "token": {
    "symbol": "POPCORN",
    "category": "02a690fadd8e3ff5539726c6eca6c2b8039bce945634d78ac46b1db26a8a0eaf",
    "decimals": 0
  },
  "description": "Popcorn! (Created by a Decentralized Autonomous Popcorn Stand)",
  "is_nft": false
}
```

<!-- TOC --><a name="use-chaingraphcash"></a>

#### Use Chaingraph.cash

[Chaingraph](https://chaingraph.cash/) is a BCH blockchain indexer with a [GraphQL](https://graphql.org/) API that we first discussed in [tutorial 2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2#heading-using-the-chaingraph-indexer-). While the BCMR indexer discussed above hunts the blockchain in order to find, collect and present off-chain BCMR metadata, Chaingraph indexes everything that is on-chain.

You can use the `GetTransactionDetails` function [from tutorial 2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2#heading-using-the-chaingraph-indexer-) to see the authchain of a given identity. Copy the script, put it in your code editor, and where it has `transaction` at the beginning of the function, replace the transaction hash there with the one you want to look up.

Note the `\\x` prefix in the script and in the results is just a sign that what follows is in [hexadecimal format](https://en.wikipedia.org/wiki/Hexadecimal). Be sure to preserve it in your query, otherwise Chaingraph will return an empty dataset.

Let’s use `GetTransactionDetails` to see Popcorn!’s authchain. Here is the output:

```json
{
  "data": {
    "transaction": [
      {
        "authchains": [
          {
            "authchain_length": 3,
            "authhead_transaction_hash": "\\xd39daf150aba899fe44771e9d90410ce326836e54726262aa4c4fc4fe4d676dd",
            "authhead": {
              "block_inclusions": [
                {
                  "block": {
                    "height": "809456"
                  }
                }
              ]
            },
            "migrations": [
              {
                "migration_index": "0",
                "transaction": [
                  {
                    "hash": "\\x02a690fadd8e3ff5539726c6eca6c2b8039bce945634d78ac46b1db26a8a0eaf"
                  }
                ]
              },
              {
                "migration_index": "1",
                "transaction": [
                  {
                    "hash": "\\x6f2383b2b2563e15393fc03c6cc225350509b4e5c014ab9d35925cbcdd62d45d"
                  }
                ]
              },
              {
                "migration_index": "2",
                "transaction": [
                  {
                    "hash": "\\xd39daf150aba899fe44771e9d90410ce326836e54726262aa4c4fc4fe4d676dd"
                  }
                ]
              }
            ],
            "unspent_authhead": true
          }
        ]
      }
    ]
  }
}
```

As we can see, this information corresponds with the data summarized on [TokenExplorer.cash](https://tokenexplorer.cash/?tokenId=6f2383b2b2563e15393fc03c6cc225350509b4e5c014ab9d35925cbcdd62d45d) for this identity, and it even shows us the transactions in which the identity output for Popcorn! was spent in order to get its authchain to a length of 3.

<!-- TOC --><a name="task-trace-an-authchain-for-50-xrbf"></a>

#### TASK: Trace an Authchain for 500 XRBF

Take the fungible token [you created in tutorial 1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-create-your-first-fungible-cashtokens-fts) and trace its authchain using the `GetTransactionDetails` script. Or do this with any token not already covered in this tutorial series. Share the Chaingraph output for it (properly formatted with [backticks](https://www.wikihow.com/Send-Code-on-Telegram)) and your analysis in the [Panmoni CashTokens channel on Telegram](https://t.me/Panmoni/315) along with your BCH address.

The reward for successful completion of the task is **500 XRBF**. It’s best to hurry on this one because so far there are a limited number of tokens to choose from for your analysis, and each one can only be rewarded once!

<!-- TOC --><a name="2-create-your-personal-andor-corporate-identity-on-the-blockchain"></a>

### 2. Create your Personal and/or Corporate Identity on the Blockchain

Here’s a fun little BCMR use-case for you. As you know, the BCMR is not primarily about tokens. The BCMR is about **identities**. And identities can have tokens (or not). So, I created a BCMR for my own personal identity.

```json
{
  "$schema": "https://cashtokens.org/bcmr-v2.schema.json",
  "version": {
    "major": 0,
    "minor": 1,
    "patch": 0
  },
  "latestRevision": "2023-11-30T22:23:41.467Z",
  "tags": {
    "developer": {
      "name": "Developer",
      "description": "An individual skilled in software development."
    },
    "writer": {
      "name": "Writer",
      "description": "An individual who expresses ideas through writing."
    },
    "blockchain-enthusiast": {
      "name": "Blockchain Enthusiast",
      "description": "Someone deeply interested in blockchain technology."
    },
    "individual": {
      "name": "Individual Person",
      "description": "An individual person, as opposed to a corporate entity."
    }
  },
  "registryIdentity": {
    "name": "George Donnelly Individual Registry",
    "description": "Self-published BCMR for George Donnelly.",

    "uris": {
      "icon": "ipfs://bafkreif3cexmrsqjxxfhzoxwlhlys63opwtm56sdijntddcso5vhwndddi",
      "web": "https://georgedonnelly.com/",
      "registry": "https://georgedonnelly.com/.well-known/bitcoin-cash-metadata-registry.json"
    }
  },
  "identities": {
    "??hash??": {
      "2023-11-30T22:23:41.467Z": {
        "name": "George Donnelly",
        "description": "I'm a content writer, project manager, Web3 coder, sci-fi author, weekend hiker and dad. I'm an idealistic pioneer in Bitcoin & Web3 adoption who's known for taking the initiative and inspiring people. I've delivered more than $5.5mm in global projects.",
        "tags": ["developer", "writer", "author", "individual"],
        "uris": {
          "icon": "ipfs://bafkreif3cexmrsqjxxfhzoxwlhlys63opwtm56sdijntddcso5vhwndddi",
          "web": "https://GeorgeDonnelly.com",
          "youtube": "https://www.youtube.com/@GeorgeDonnelly",
          "support": "https://t.me/GeorgeDonnelly",
          "telegram": "https://t.me/GeorgeDonnelly",
          "twitter": "https://twitter.com/GeorgeDonnelly",
          "x": "https://x.com/GeorgeDonnelly",
          "reddit": "https://www.reddit.com/user/georgedonnelly",
          "instagram": "https://www.instagram.com/GeorgeDonnelly",
          "linkedin": "https://www.linkedin.com/in/georgedonnelly",
          "github": "https://github.com/georgedonnelly"
        },
        "extensions": {
          "contact": {
            "phone": "+1 (215) 360-3513",
            "email": "me@georgedonnelly.com"
          },
          "pay": {
            "bch": "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a"
          }
        }
      }
    }
  },
  "license": "CC0-1.0"
}
```

Go ahead and modify this template with your own information!

<!-- TOC --><a name="create-a-mainnet-js-project"></a>

#### Create a Mainnet-JS project

Next, we’re going to create a Mainnet-JS project. Stick with me because this is much easier than it sounds!

You can find the code for this project on [GitHub](https://github.com/Panmoni/identity).

Open your terminal app and `cd` to a suitable location. Create a directory for this project and change into it:

`mkdir identity && cd identity`

If you haven’t already [installed NodeJS on your development system](https://nodejs.org/en/download), you should do that now. I installed mine with [Homebrew](https://brew.sh/) on MacOS.

Next, you want to install mainnet-js. Run this command inside the directory you just created:

`npm i mainnet-js`

If you use [Visual Studio Code](https://code.visualstudio.com/), you might be able to run this command to open this project in the IDE.

`code .`

If not, you can open your favorite IDE or text editor (not rich-text editor) and open the directory you just created.

Edit your `package.json` file and take note of the version of mainnet-js that you installed. Replace the file contents with the below text but do be sure to **preserve the same value** for the version of mainnet-js that was present when you first opened the file.

```json
{
  "name": "identity",
  "version": "0.0.1",
  "description": "",
  "main": "test.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "mainnet-js": "^2.3.0"
  }
}
```

In my case, at the time of publication, I used mainnet-js version `^2.3.0`.

<!-- TOC --><a name="identify-the-pre-genesis-transaction"></a>

#### Identify the Pre-Genesis Transaction

As we first explored in [tutorial 1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-cashtokens-explained) of this series, every identity has a `category`, and this `category` is the hash, or id, of the **pre-genesis transaction**. The pre-genesis transaction is the transaction that created the UTXO used as the first input for the identity’s genesis transaction.

Let’s look back at this diagram from [CashTokens.org](https://cashtokens.org/docs/bcmr/chip/#zeroth-descendant-transaction-chains).

![](/tp3/authchain.png 'Source: https://cashtokens.org/docs/bcmr/chip/#zeroth-descendant-transaction-chains')

The authbase of the identity contemplated in the diagram is the first transaction on the left. As you can see, it has one input. The transaction that came before this — the one where this one input was an output — _that_ is the pre-genesis transaction.

<!-- TOC --><a name="getpregenesistxjs"></a>

##### getPreGenesisTX.js

You may have noticed in the sample BCMR this bit of text: `??hash??`. This is where the `category` value usually goes.

But, we haven’t created this identity yet. And we can’t create it until we upload the BCMR to IPFS. Which we can’t do until we know the `category` value.

It’s a chicken-and-egg situation!

This is where getPreGenesisTX.js comes to the rescue. I stole most of its useful [code](https://github.com/Panmoni/identity/blob/main/getPreGenesisTX.js) from Mathieu Geukens’ outstanding [Cashonize](https://cashonize.com) wallet. (You can learn a lot by reading other people’s code!)

Go ahead and create the file `getPreGenesisTX.js` in your project and drop this code into it.

```js
// getPreGenesisTX.js
// ht https://github.com/cashonize/wallet/blob/main/script.js

import { Wallet, TestNetWallet } from 'mainnet-js';

// replace with your seedphrase and be sure to protect it
const seedphrase = 'gunter glieben glauten globen';

const derivationPathAddress = "m/44'/145'/0'/0/0";

const network = 'mainnet';

const walletClass = network == 'mainnet' ? Wallet : TestNetWallet;
const wallet = await walletClass.fromSeed(seedphrase, derivationPathAddress);

const balance = await wallet.getBalance();

async function getValidPreGenesis() {
  let walletUtxos = await wallet.getAddressUtxos();
  return walletUtxos.filter((utxo) => !utxo.token && utxo.vout === 0);
}
if (balance.sat) {
  let validPreGenesis = await getValidPreGenesis();
  if (validPreGenesis.length === 0) {
    await wallet.send([{ cashaddr: wallet.tokenaddr, value: 10000, unit: 'sat' }]);
    console.log('Created output with vout zero for token genesis');
    validPreGenesis = await getValidPreGenesis();
  }
  const tokenId = validPreGenesis[0].txid;
  console.log(`Pre-Genesis Transaction: ${tokenId}`);
} else {
  console.log('No BCH');
}

getValidPreGenesis();
```

As mentioned in [tutorial 2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2#heading-e-oops-authupdatejs-to-the-rescue), take great care when working with your seed phrase. It’s a good idea to delete it from the file after you are done using it. By all means, be very careful not to share it or, yikes, upload it to GitHub with the seed phrase intact.

If you want to test the script before deploying it on mainnet, you can change the value of the `network` variable from `mainnet` to `chipnet`. You can get chipnet tBCH from [tbch.googol.cash](https://tbch.googol.cash/) to pay for transaction fees.

As mentioned in [tutorial 2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2#heading-a-if-you-want-to-use-chipnet), it can be helpful to use a wallet that you created with Cashonize for this stuff, as it permits you to switch back and forth easily between mainnet and chipnet.

When you are happy with your settings, save the file and run it:

`node getPreGenesisTX.js`

If you don’t have any (t)BCH in the wallet, it will let you know. If the wallet has no transactions, it will create one. Otherwise, it will give you the transaction hash of your first UTXO without a token

Here is the output I got:

```
$ node getPreGenesisTX.js
Pre-Genesis Transaction: 4fe0225c73b5a5f062cad58ee9222798dadece10f866e89305e8fb22b033ec24
```

Copy the hexadecimal output and, in your BCMR file, replace `??hash??` with the value you got. In other words, in my case, this became my `category`:

`4fe0225c73b5a5f062cad58ee9222798dadece10f866e89305e8fb22b033ec24`

Save and upload your IPFS file, e.g. to [NFT.storage](https://nft.storage/). Get the file’s CID ([explained in tutorial 1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-4-create-the-token-metadata)) and have it ready. Use the Actions menu on NFT.storage and click “View URL” to be sure your BCMR file is loading.

I uploaded my BCMR to IPFS as well as to my own domain, just for fun.

```
ipfs://bafkreifbraez6v3uangbd2fsdtklnrfazei6gwyxhll5l6tp4t5kapbh4u
https://georgedonnelly.com/.well-known/bitcoin-cash-metadata-registry.json
```

<!-- TOC --><a name="create-your-identitys-authbase"></a>

#### Create your Identity’s AuthBase

Now, you’re ready to create your identity’s authbase transaction!

Go ahead and create the file `createIdentity.js` in your project and drop this code into it. Thanks to Mathieu Geukens’ [AuthUpdate](https://github.com/mr-zwets/AuthUpdate) and [Cashonize](https://github.com/cashonize/wallet/blob/main/script.js) code, as well as to the outstanding [Mainnet.cash tutorial](https://mainnet.cash/tutorial/) for code and guidance!

If you’re not also uploading your BCMR to your own domain, leave the `dnsBCMR` field blank.

```js
// createIdentity.js
// ht https://github.com/mr-zwets/AuthUpdate & https://mainnet.cash/tutorial/ & https://github.com/cashonize/wallet/blob/main/script.js
// Make sure your BCMR is loading at the ipfs.nftstorage.link gateway before starting. Alternatively, adjust bcmrFile.

import { Wallet, TestNetWallet, utf8ToBin, sha256, OpReturnData } from 'mainnet-js';

//
// VARIABLES
//
const seedPhrase = 'gunter glieben glauten globen';

const derivationPathAddress = "m/44'/145'/0'/0/0"; // last number is the address index from electron cash, if you are using it.

// If using 2 BCMRs, both files must be identical as this script only hashes the IPFS one.
// the CID of your BCMR file uploaded to IPFS, starts with 'baf'. Recommend nft.storage.
const bcmrCID = 'bafxxx';
const dnsBCMR = 'example.com'; // FQDN

const network = 'mainnet'; // mainnet or chipnet

//
// SCRIPT
//
// establish wallet
const walletClass = network == 'mainnet' ? Wallet : TestNetWallet;
const wallet = await walletClass.fromSeed(seedPhrase, derivationPathAddress);

// test wallet for sufficient balance
const walletAddress = wallet.getDepositAddress();
const balance = await wallet.getBalance();

console.log(`wallet address: ${walletAddress}`);
console.log(`Bch amount in walletAddress is ${balance.bch}bch or ${balance.sat}sats`);

if (balance.sat < 1000) throw new Error('Not enough BCH to make the transaction!');

// hash the BCMR file
const bcmrFile = `https://${bcmrCID}.ipfs.nftstorage.link/`;
const reponse = await fetch(bcmrFile);
const bcmrContent = await reponse.text();
const bcmrHash = sha256.hash(utf8ToBin(bcmrContent));

// create BCMR opreturn
const ipfsBCMRLink = `ipfs://${bcmrCID}`;
let bcmrChunks = ['BCMR', bcmrHash, ipfsBCMRLink];
if (dnsBCMR) {
  bcmrChunks.push(dnsBCMR);
}
let opreturnData = OpReturnData.fromArray(bcmrChunks);

const authBase = { cashaddr: walletAddress, value: 800, unit: 'sats' };
const outputs = [authBase, opreturnData];

// create transaction,identity output and opreturn
// change output is automatic.
let walletUtxos = await wallet.getAddressUtxos();
const preGenesisUTXO = walletUtxos.filter((utxo) => !utxo.token && utxo.vout === 0)[0];

// output txid
const { txId } = await wallet.send(outputs, { ensureUtxos: [preGenesisUTXO] });

// Log transaction ID
const explorerUrl =
  network === 'mainnet' ? `https://explorer.bitcoinunlimited.info/tx/${txId}` : `https://chipnet.bch.ninja/tx/${txId}`;
console.log(`Transaction ID: ${explorerUrl}`);
```

As with `getPreGenesisTX.js`, the same notes apply regarding the `seedPhrase` and `network` variables.

Additionally, put your BCMR CID in the variable value for `bcmrCID`. You can leave `dnsBCMR` blank or fill in the FQDN where your BCMR is (at path `/.well-known/bitcoin-cash-metadata-registry.json`).

When ready, you can run the script:

`node createIdentity.js`

I experimented with mine first on chipnet. Here is a sample output of the script from that:

```
$ node createIdentity.js
wallet address: bchtest:qphltzfypuy9ddlzge7lzayg3p2xnpa6qs3k5e0y5j
Bch amount in walletAddress is 1.40121226bch or 140121226sats
Transaction ID: https://chipnet.bch.ninja/tx/f1dcea41a49b1c2b3bc3f3dd616ca798f3e73667bcfcac41ab9a7bf003b2d653
```

After verifying it worked on chipnet, I changed the value of `network` to `mainnet` and ran it on mainnet. Here is the output:

```
$ node createIdentity.js
wallet address: bitcoincash:qphltzfypuy9ddlzge7lzayg3p2xnpa6qs4ys7dnnw
Bch amount in walletAddress is 0.04009803bch or 4009803sats
Transaction ID: https://explorer.bitcoinunlimited.info/tx/3d14d6f39b5508e24230086c2bc948cde741adb3d6614e2e14a91c53c18fcb34

```

<!-- TOC --><a name="verify"></a>

#### Verify

The `createIdentity.js` script outputs a link to a block explorer for the transaction you just created. Go ahead and open it! Explore!

Here’s mine: [explorer.bitcoinunlimited.info](https://explorer.bitcoinunlimited.info/tx/3d14d6f39b5508e24230086c2bc948cde741adb3d6614e2e14a91c53c18fcb34).

Take a look at input 0 for the transaction. Click on the linked text `4fe0225c73b5a5f062cad58ee… #0`. The hex data will be different from you.

![](/tp3/Screenshot%202023-12-21%20at%206.34.47%20PM.png)

This will take you to the pre-genesis transaction. Be sure its transaction id matches what you put in your BCMR. In my case, it does.

<!-- TOC --><a name="analyze"></a>

#### Analyze

Go back to your identity’s genesis transaction and take a look at the OP_RETURN. Here is mine.

![](/tp3/Screenshot%202023-12-21%20at%206.32.51%20PM.png)

As you can see, it includes `BCMR` as well as both my BCMR links: IPFS and domain name.

This is looking good!

But we’re here to learn so let's dig deeper! Click on “show raw” to explore another level.

```json
`OP_RETURN
data(utf-8) - BCMR �� �WtL�ԶĠ��[:���o���<'�Bipfs://bafkreifbraez6v3uangbd2fsdtklnrfazei6gwyxhll5l6tp4t5kapbh4ugeorgedonnelly.com
data(hex) - OP_RETURN 1380795202 a188099f5774034c11e8b21cd4b6c4a0c911e35b173ad7d5fa6fe4faa03c27e5 697066733a2f2f6261666b72656966627261657a36763375616e67626432667364746b6c6e7266617a65693667777978686c6c356c3674703474356b617062683475 67656f726765646f6e6e656c6c792e636f6d
```

What is this `1380795202`? It actually represents the ASCII values of the characters in 'BCMR' when encoded as a 32-bit integer in little-endian format. In other words, each byte of the 32-bit integer corresponds to one character in the ASCII encoding.

Let’s break it down:

- The ASCII code for 'B' is 66, which is 42 in hexadecimal.
- The ASCII code for 'C' is 67, which is 43 in hexadecimal.
- The ASCII code for 'M' is 77, which is 4D in hexadecimal.
- The ASCII code for 'R' is 82, which is 52 in hexadecimal.

When these hexadecimal values are arranged in little-endian format (reversed order), they form `0x524d4342`, which is `1380795202` in decimal.

So, `1380795202` in decimal is [equivalent](https://www.rapidtables.com/convert/number/decimal-to-hex.html) to `0x524d4342` in hexadecimal, which translates to 'BCMR' in ASCII.

Seems overly complex to me, but that’s how it works!

The next value in my OP_RETURN (yours will be different) is:

`a188099f5774034c11e8b21cd4b6c4a0c911e35b173ad7d5fa6fe4faa03c27e5`

You can use the following Python script to double-check this.

Go ahead and create the file `verifyBCMRHash.py` in your project and drop this code into it. Update `bcmr_cid` with your BCMR CID.

```python
# verifyBCMRHash.py

import requests
import hashlib

def get_bcmr_hash(bcmr_cid):
    bcmr_file = f"https://{bcmr_cid}.ipfs.nftstorage.link/"
    response = requests.get(bcmr_file)
    bcmr_content = response.text
    bcmr_hash = hashlib.sha256(bcmr_content.encode('utf-8')).hexdigest()
    return bcmr_hash

# Example usage
bcmr_cid = "your_bcmr_cid_here"
bcmr_hash = get_bcmr_hash(bcmr_cid)
print("BCMR hash:", bcmr_hash)
```

I ran it on mine and indeed the values match!

```
$ python3.10 verifyBCMRHash.py
BCMR hash: a188099f5774034c11e8b21cd4b6c4a0c911e35b173ad7d5fa6fe4faa03c27e5
```

Next is this longer hexadecimal string:

```
697066733a2f2f6261666b72656966627261657a36763375616e67626432667364746b6c6e7266617a65693667777978686c6c356c3674703474356b617062683475
```

When [decoded from hex to ASCII](https://www.rapidtables.com/convert/number/hex-to-ascii.html), it translates to an IPFS link:

`ipfs://bafkreifbraez6v3uangbd2fsdtklnrfazei6gwyxhll5l6tp4t5kapbh4u`

Next is another hex string:

`67656f726765646f6e6e656c6c792e636f6d`

When [decoded from hex to ASCII](https://www.rapidtables.com/convert/number/hex-to-ascii.html), it reads `georgedonnelly.com`.

While this stuff can look complex at first, after some analysis, it all looks a bit prosaic, doesn’t it?

That’s the beauty of developing on a UTXO chain with elegant protocols such as CashTokens and BCMR! Enjoy!

<!-- TOC --><a name="use-cases"></a>

#### Use Cases

Having identities created on-chain could be useful for a variety of situations, perhaps including creating a decentralized and censorship-resistant [KeyBase](https://keybase.io/) clone and creating a decentralized reputation system that facilitates individual accountability.

<!-- TOC --><a name="task-create-an-identity-for-100-xrbf"></a>

#### TASK: Create an Identity for 1000 XRBF

Create any BCMR identity that is recorded on-chain, perhaps for the fungible token [you created in tutorial 1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-create-your-first-fungible-cashtokens-fts) and share the link to the transaction with its OPRETURN in the [Panmoni CashTokens channel on Telegram](https://t.me/Panmoni/315) along with your BCH address.

The reward for successful completion of the task is **1000 XRBF**.

<!-- TOC --><a name="3-update-your-token-and-nft-bcmr-files"></a>

### 3. Update your Token and NFT BCMR Files

When you update your BCMR, you also have to update your authchain. BCH developer [Mathieu Geukens](https://www.youtube.com/@mrzwets) has created a handy script for this called [AuthUpdate](https://github.com/mr-zwets/AuthUpdate).

We [covered this in tutorial 2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2#heading-e-oops-authupdatejs-to-the-rescue) so feel free to refer back and see how it works.

<!-- TOC --><a name="updating-xrbf"></a>

#### Updating XRBF

Now that I’ve updated the XRBF BCMR to include tags and an old Identity Snapshot, I’m updating its authhead as follows.

1. Upload the new BCMR to [NFT.storage](https://NFT.storage/) or your favorite IPFS pinning service, as shown in [tutorial 2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2#heading-b-upload-your-bcmr-file-to-ipfs).
2. Visit [TokenExplorer.cash](https://tokenexplorer.cash/) and enter the `category` of the token you plan to update. Scroll to the bottom and take note of the **authchain length**.
3. Make sure your BCMR file is rendering properly at https://ipfs.io/ipfs/`your-CID`. If you get a 504 error, refresh the page every few minutes until you get your BCMR data. Do not proceed until this is working.
4. Create the update transaction with authUpdate.js, as shown in [tutorial 2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2#heading-e-oops-authupdatejs-to-the-rescue).
5. Check that it worked by seeing if the **authchain length** of your token has incremented by 1 on [TokenExplorer.cash](https://tokenexplorer.cash/).

<!-- TOC --><a name="hash-doesnt-match"></a>

##### Hash Doesn’t Match?

When authUpdate.js created the new identity output and its corresponding OP_RETURN (i.e., a new transaction), it hashed the BCMR you supplied.

Explorers like [SalemKode](https://explorer.salemkode.com/) and [TokenExplorer.cash](https://tokenexplorer.cash/), as well as other consumer-facing apps, will check to be sure the hash of the current file on IPFS and the hash in the OP_RETURN actually match.

If not, you will get a little red ‘x’ on [TokenExplorer.cash](https://tokenexplorer.cash/) and a red circle with an exclamation mark on [SalemKode](https://explorer.salemkode.com/).

Curiously, this happened to me on my first attempt to update XRBF’s metadata because the BCMR file had not yet propagated from NFT.storage to the IPFS gateway at ipfs.io.

I checked https://ipfs.io/ipfs/`your-CID` and got this error, hence step 3 above.

![](/tp3/Screenshot%202023-12-20%20at%202.25.26%20PM.png)

In case you run into this, and get a red ‘x’ on [TokenExplorer.cash](https://tokenexplorer.cash/), you can either wait until the BCMR propagates and run authUpdate.js again, or edit authUpdate.js to use a different IPFS gateway where your BCMR has already propagated.

<!-- TOC --><a name="havent-created-an-ft-or-nft-yet"></a>

#### Haven’t Created an FT or NFT yet?

To create your first CashTokens, see [tutorial 1 for fungible tokens](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1) and [tutorial 2 for NFTs](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2). Because BCH fees are so low, it costs almost nothing to do this.

And even if you just add a dollar or two worth of liquidity for your FT at [cauldron.quest](https://cauldron.quest/), I can list it on [TokenStork.com](https://TokenStork.com/).

So don’t delay! Get in on the CashTokens rush today!

<!-- TOC --><a name="otrcash-eligibility"></a>

#### otr.cash Eligibility

If you created your token and want it [listed](https://otr.cash/docs/list) on otr.cash, but for example chose a ticker symbol of fewer than 4 characters, you can fix this now and then use AuthUpdate to become compliant before you get your token listed in the next section.

<!-- TOC --><a name="cashtokens-studio"></a>

#### CashTokens Studio

Thanks to the Paytaca development team, [CashTokens Studio](https://cashtokens.studio) is now available for testing around creating and updating your FTs and NFTs using CashTokens. I will likely cover it in more depth in a future tutorial. But feel free to [try it out](https://cashtokens.studio)!

<!-- TOC --><a name="task-update-an-identity-for-250-xrbf"></a>

#### TASK: Update an Identity for 2500 XRBF

Update any BCMR identity under your control that is recorded on-chain, perhaps for the fungible token [you created in tutorial 1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-create-your-first-fungible-cashtokens-fts) and share the link to the transaction with its OP_RETURN in the [Panmoni CashTokens channel on Telegram](https://t.me/Panmoni/315).

The reward for successful completion of the task is **2500 XRBF**.

<!-- TOC --><a name="4-get-your-tokens-listed-on-otrcash-andor-tokenstorkcom"></a>

### 4. Get your Token(s) Listed on otr.cash and/or TokenStork.com

[OTR.cash](https://otr.cash/.well-known/bitcoin-cash-metadata-registry.json) is a DNS-based BCMR where multiple identities are listed. It has strict [listing requirements](https://otr.cash/docs/list) and is considered to be the reference registry for the ecosystem.

The [TokenStork registry](https://tokenstork.com/.well-known/bitcoin-cash-metadata-registry.json) is mostly just a mirror of that data, though I may host BCMR data there in the future that doesn’t meet the otr.cash listing guidelines.

Getting listed on either registry is as easy as making a pull request on GitHub.

<!-- TOC --><a name="how-to-create-a-pull-request"></a>

#### How to Create a Pull Request

A pull request is when you copy (fork) someone’s codebase, make changes in your copy, and then offer to let the original codebase pull in your changes back to the original codebase.

Here is [GitHub’s documentation on pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) and here are the basic steps for a successful pull request.

1. You need a GitHub account. [Create one here](https://github.com/join/) if you don’t have one already.
2. Fork the original codebase repository; i.e., copy the code to a new repository on your GitHub account. Then clone your copy of the repo to your machine. You can use the `git clone` command for this.
3. Make your desired changes. In this case, that will mean adding your identity to the correct spot in the JSON hierarchy near the end of the `bitcoin-cash-metadata-registry.json` file.
4. Push your changes to your repository on GitHub, usually using the `git push` command.
5. On GitHub.com, create the pull request.

This 3-minute [pull request tutorial](https://www.youtube.com/watch?v=jRLGobWwA3Y) is excellent. That said, you can skip the part about creating a new branch as it is not necessary in this case.

For your otr.cash registry pull request, you should use [this template](https://github.com/OpenTokenRegistry/otr.cash/blob/master/.github/pull_request_template.md). Copy the raw markdown and paste it into the text field of your pull request, if for some reason it does not come up automatically. Fill it out carefully.

It pays to be detail-oriented when requesting a listing as otr.cash is operated by [ecosystem volunteers](https://github.com/orgs/OpenTokenRegistry/people) who have limited time to review improperly-formed requests.

For your reference, check out [my pull request for adding the XRBF token to otr.cash](https://github.com/OpenTokenRegistry/otr.cash/pull/13). It was successful on the first try!

<!-- TOC --><a name="registry-repos"></a>

##### Registry Repos

You can find the OTR.cash registry repo at [github.com/OpenTokenRegistry/otr.cash](https://github.com/OpenTokenRegistry/otr.cash) and the TokenStork.com registry repo at [github.com/Panmoni/tokenstork](https://github.com/Panmoni/tokenstork).

<!-- TOC --><a name="email-submission"></a>

##### Email Submission

If all of this feels like a bit too much, you can submit your BCMR to the TokenStork registry via email to [hello@panmoni.com](mailto:hello@panmoni.com). Be sure to provide the link to your JSON file (IPFS links are best). Please do not attach it nor include the JSON text inline.

<!-- TOC --><a name="this-is-optional"></a>

#### This is Optional

Remember, getting your identity/token listed on these or any other registries is entirely optional because the one that matters the most is the one you create and link to on-chain. You can simply follow tutorials [1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1) (FTs) and/or [2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2) (NFTs), as the case may be, to have a successful token creation event on BCH!

<!-- TOC --><a name="task-submit-your-pull-request-for-750-xrbf"></a>

#### TASK: Submit your Pull Request for 7500 XRBF

Make a properly-formed pull request as described above for your FT and/or NFT and share the link to it in the [Panmoni CashTokens channel on Telegram](https://t.me/Panmoni/315).

The reward for successful completion of the task is **7500 XRBF**.

<!-- TOC --><a name="5-create-your-own-domain-based-metadata-registry"></a>

### 5. Create Your Own Domain-Based Metadata Registry

Creating your own domain-based registry, like otr.cash or TokenStork.com, is very easy if you have an existing domain and website.

1. Create a directory in the root of your site named `.well-known`.
2. Put a file in that directory named `bitcoin-cash-metadata-registry.json`.
3. Put valid BCMR data into the file. For example, you could mirror the [otr.cash](https://otr.cash/.well-known/bitcoin-cash-metadata-registry.json) registry just by copying it and pasting it into your BCMR.

Note, at this time it is not suitable to use multi-identity domain-based registries as described here inside your on-chain OP_RETURNs as the hash will not match the hash of a BCMR with just your own identities.

<!-- TOC --><a name="conclusion"></a>

## Conclusion

In this tutorial, we delved into the intricate world of CashTokens metadata, focusing on the Bitcoin Cash Metadata Registries (BCMR) specification. This exploration is crucial for BCH CashTokens builders seeking a comprehensive understanding of how metadata transforms complex on-chain data into user-friendly, readable formats. BCMR is not just a technical framework. It's a bridge connecting the raw data on the BCH blockchain to the polished presentations in wallets, websites, and decentralized applications (dapps), making BCH tech more accessible and mainstream-friendly.

The BCMR files, structured as simple JSON text files, are lightweight and easy to update, yet they play a pivotal role in defining the identity of fungible tokens and NFTs within the BCH ecosystem. They link these on-chain assets with off-chain data, conserving blockchain space while enriching the user experience. Whether it's for wallets like [Paytaca](https://paytaca.com), [Cashonize](https://cashonize.com) and [Zapit](https://zapit.io), or for various BCH dapps, BCMR metadata is the unseen hero that makes tokens and NFTs more than just strings of characters.

<!-- TOC --><a name="invaluable-developer-skills"></a>

### Invaluable Developer Skills

This tutorial not only provided theoretical insights but also practical exercises, offering you the opportunity to get hands-on experience and even earn rewards in XRBF tokens. By exploring authchains, creating personal or corporate blockchain identities, and updating BCMR files, you've gained invaluable skills that are directly applicable in the BCH CashTokens ecosystem.

<!-- TOC --><a name="were-just-beginning"></a>

### We’re Just Beginning

As we wrap up this tutorial, remember that the journey with CashTokens and BCMR is just beginning. The BCH ecosystem is thriving and constantly evolving, and there is ample room for innovation and growth. The concepts and skills you've learned here will serve as a solid foundation for your future projects, whatever you're building. Stay tuned for more in this series, where we'll continue to explore the exciting possibilities that BCH and CashTokens offer.

<!-- TOC --><a name="next-up"></a>

### Next Up!

Next up in this series, we’ll be building a ticketing dapp, a warrant canary and an ICO contract, as well as learning to construct transactions with Libauth and the Bitauth IDE. Stay tuned!

This series, "Token Pioneers," is dedicated to enabling and empowering you, the upcoming generation of BCH builders. Your journey has just begun, and the potential for innovation and impact is immense. Keep building, keep exploring, and watch this space for more tutorials and updates on the dynamic world of BCH CashTokens.

<!-- TOC --><a name="earn-xrbf"></a>

### Earn XRBF!

Be sure to take advantage of all the learning tasks in this series so that you can earn some XRBF while you’re building your BCH developer profile!

XRBF is one of the most prominent and best-performing CashTokens fungible tokens. XRBF holders may, in the future, be able to form a DAO to support the
[Real Bitcoin Fam](https://RealBitcoinFam.com) mission of attracting and supporting new BCH builders!

- [Tutorial 1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-bonus-get-some-xrbf-tokens-): earn up to 110 XRBF.
- [Tutorial 2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2): earn up to 1,000 XRBF.
- [Tutorial 3](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-3): earn up to 11,500 XRBF!

That’s **13,160 XRBF** that’s up for grabs! And that amount is available to everyone who is willing to earn as you learn.

Developers are standing by to assist new builders like yourself in the [Panmoni Telegram group](https://t.me/Panmoni/315)!

### Get Updates

The best way to get updates is to follow [@BitcoinCashSite](https://twitter.com/bitcoincashsite) on Twitter, [@RealBitcoinCashSite](https://www.youtube.com/@RealBitcoinCashSite) on YouTube and/or [@BitcoinCashSite](https://t.me/bitcoincashsite) on Telegram.

<!-- TOC --><a name="thank-you"></a>

### Thank you

Thank you to Mathieu Geukens, BitcoinCashAutist and the [Mainnet.cash](https://mainnet.cash/) project for essential technical guidance that enhanced the value of this tutorial.

Thank you to [toorik](https://twitter.com/toorik), anonymous, William Patrick, S0me_N0b0dy and na for their support of the [flipstarter](https://archive.li/UznMe) that makes this “Token Pioneers” tutorial series possible. Please visit [BitcoinCashSite.com/about](https://www.bitcoincashsite.com/about) to see the complete list of 55+ community members who have funded my work since 2019.

<!-- TOC --><a name="token-pioneers-status-update"></a>

### Token Pioneers Status Update

It’s been awhile since tutorial number 2, so thanks for your patience. I’ve taken some time away from the tutorials to work on building up more excitement and more dapps in the space so more builders can benefit from this series. The good news is that my recent development work will feed into future tutorial topics.

With the release of new tooling, some things in tutorials [1](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1) and [2](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2) may be more complex than necessary. That said, I still think it is good for new CashTokens builders to possess a more complete understanding of building on BCH. A fluent comprehension of fundamentals is a solid foundation for long-term building. So, it certainly won’t hurt to go through those tutorials.

After I make more progress with the text tutorials in this series, I will go back and either bring them up to date with the new tooling and/or produce videos that reflect the latest ecosystem tooling advancements.

So, you can rest assured that [this tutorial series](https://gist.github.com/georgedonnelly/317aa1746159dc575c7f612eff475d56) is far from over and will continue updating over time.

<!-- TOC --><a name="support-the-tutorial-series"></a>

### Support the Tutorial Series

Want more tutorials? I accept donations to fund this critical work of educating new BCH builders about how to build permissionless, unstoppable dapps with CashTokens on Bitcoin Cash. You can also [sponsor](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1#heading-sponsor-this-work) my work and get benefits in return.

[bitcoincash:qz3pxmwda8gd42wa8k9yfxcwhcaapeuhygjc8mc4m8](bitcoincash:qz3pxmwda8gd42wa8k9yfxcwhcaapeuhygjc8mc4m8)

<!-- TOC --><a name="additional-builder-resources"></a>

## Additional Builder Resources

You can find a complete listing of CashTokens resources at [BitcoinCashSite.com/cashtokens](https://www.bitcoincashsite.com/cashtokens) and here are the ones most relevant to the BCMR.

Please [let me know](mailto:hello@panmoni.com) if I’m missing your fave resource!

<!-- TOC --><a name="bcmr-tools"></a>

### BCMR Tools

- [BCMR Generator](https://bcmr-generator.netlify.app/)
- [Token Metadata Explorer](https://tokenexplorer.cash/)
- [NFT Viewer](https://viewer.sploit.cash/)
- [BCMR Indexer API](https://bcmr.paytaca.com/)

<!-- TOC --><a name="json-tools"></a>

### JSON Tools

- [JSONLint.com](https://jsonlint.com/) (use this to validate your BCMRs)

<!-- TOC --><a name="bcmr-content"></a>

### BCMR Content

- [How To Add Metadata to CashTokens (The BCMR-standard explained)](https://www.youtube.com/watch?v=3Hr0_re135Q) by Mathieu Geukens
- [Mint your First CashTokens on Bitcoin Cash (Token Pioneers Tutorial 1)](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1)
- [Mint your First NFTs on Bitcoin Cash (Token Pioneers Tutorial 2)](https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-2)

<!-- TOC --><a name="bcmr-technical-guides"></a>

### BCMR Technical Guides

- [The BCMR schema](https://github.com/bitjson/chip-bcmr/blob/master/bcmr-v2.schema.json)
- [More readable version of the schema](https://json-schema.app/view/%23?url=https%3A%2F%2Fcashtokens.org%2Fbcmr-v2.schema.json)
- [The BCMR Specification](https://cashtokens.org/docs/bcmr/chip/)
- [otr.cash listing requirements](https://otr.cash/docs/list/)

[![Token Pioneers](/tp1/token-pioneers-big.png)](https://gist.github.com/georgedonnelly/317aa1746159dc575c7f612eff475d56)

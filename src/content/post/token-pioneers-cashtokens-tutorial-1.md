---
publishDate: 2023-07-26T00:00:00Z
title: Mint your First CashTokens on Bitcoin Cash (Token Pioneers Tutorial 1)
description: 'none'
excerpt: Learn how to mint your first fungible tokens with CashTokens on Bitcoin Cash.
image: ~/assets/images/blog/token-pioneers-1.png
category: Tutorial
tags:
  - cashtokens
  - token pioneers
canonical: https://www.bitcoincashsite.com/blog/token-pioneers-cashtokens-tutorial-1/
---

## Table of Contents

- [What is CashTokens?](#heading-what-is-cashtokens)
  * [What You Can Do With CashTokens](#heading-what-you-can-do-with-cashtokens)
  * [Why CashTokens Matters](#heading-why-cashtokens-matters)
- [Mint Your First CashTokens!](#heading-mint-your-first-cashtokens)
  * [A Quick Intro to How Bitcoin Transactions Work](#heading-a-quick-intro-to-how-bitcoin-transactions-work)
    + [A Sample BCH Transaction](#heading-a-sample-bch-transaction)
  * [CashTokens Explained](#heading-cashtokens-explained)
    + [CashTokens Metadata](#heading-cashtokens-metadata)
      - [Sample BCMR Metadata](#heading-sample-bcmr-metadata)
      - [Sample FT Genesis Transaction ](#heading-sample-ft-genesis-transaction)
      - [AuthBase and AuthChain](#heading-authbase-and-authchain)
  * [Create Your First Fungible CashTokens (FTs)](#heading-create-your-first-fungible-cashtokens-fts)
    + [Easy FT Minting Instructions 🏁](#heading-easy-ft-minting-instructions-)
      - [1. Install Electron Cash](#heading-1-install-electron-cash)
      - [2. Open Cashonize.com](#heading-2-open-cashonizecom)
      - [3. Get the Token ID (`category`)](#heading-3-get-the-token-id-category)
      - [4. Create the Token Metadata](#heading-4-create-the-token-metadata)
      - [5. Return to Cashonize](#heading-5-return-to-cashonize)
      - [6. Verify Token Creation](#heading-6-verify-token-creation)
      - [7. Freeze your Token’s Authbase](#heading-7-freeze-your-tokens-authbase)
        * [Understanding AuthBase](#heading-understanding-authbase)
      - [8. Spend Some Tokens!](#heading-8-spend-some-tokens)
      - [BONUS: Get some XRBF Tokens 💰💸](#heading-bonus-get-some-xrbf-tokens-)
- [Coming Soon](#heading-coming-soon)
- [Support the “Token Pioneers” Tutorial Series](#heading-support-the-token-pioneers-tutorial-series)
  * [Sponsor this Work](#heading-sponsor-this-work)
  * [Thank You 🙏](#heading-thank-you-)
- [Your Feedback Matters](#heading-your-feedback-matters)

CashTokens is how we’re building transparent, unstoppable wealth for everyone—and not just the select few who can afford high fees on ETH and BTC!

The CashTokens functionality is the next evolution of Bitcoin. It enables not just simple tokens, but also truly scalable and permissionless smart contracts on the BCH blockchain.

As opposed to smart-contract-capable blockchains such as Ethereum, which suffer from high transaction fees, BCH has sub-cent transaction fees—and that will not change for the smart contracts you create with BCH CashTokens.

Cheap fees mean everyone can participate, which builds economies of scale, which means your dapps can gain more users more quickly and your long-term growth won’t be interrupted by high fees. That means more potential income for you.

This tutorial is only the first in a series I’m writing, with valuable community help, on how to build scalable, decentralized applications with BCH CashTokens.

This first tutorial is going to give you an overview and show you how to mint your first fungible tokens. But don’t worry about getting overwhelmed! CashTokens is easy to get started with and there are multiple tools you can use with varying learning curves. Over time, this will get easier, and less mysterious.

<a name="heading-cashtokens-is-worth-it"></a>
### CashTokens is Worth it

And it is absolutely worth it! This is a tremendous opportunity to start tinkering with CashTokens on Bitcoin Cash. Here’s why:

- DeFi (decentralized finance) on BCH can actually scale (unlike so many other chains)!
- Many of those currently building with CashTokens are open-sourcing their code, so you can learn from these elite Bitcoin builders.
- Building with CashTokens is just getting started, and that means your dapps can be segment leaders.
- The BCH ecosystem has support available for CashTokens builders.
- The BCH ecosystem is very authentic, so you’re going to know where you stand. You are dealing with real people whose motivations are, in large part, philosophical.

So, please join me for this “Token Pioneers” CashTokens tutorial series! It’s going to be a blast! 🥳 🎉

<a name="heading-get-updates"></a>
### Get Updates

The best way to get updates is to follow [@BitcoinCashSite](https://twitter.com/bitcoincashsite) on Twitter, [@RealBitcoinCashSite](https://www.youtube.com/@RealBitcoinCashSite) on YouTube and/or [@BitcoinCashSite](https://t.me/bitcoincashsite) on Telegram.

<a name="heading-what-is-cashtokens"></a>
## What is CashTokens?

CashTokens is an expansion to the format of Bitcoin (BCH) transactions that went live on BCH mainnet on May 15 2023 as part of the annual network upgrade. 

CashTokens adds new token fields to the format of transactions on Bitcoin Cash. Because this new token functionality is now part of the basic format of a BCH transaction, the tokens themselves are validated by the miners. This means that the new tokens enjoy the same security, scalability and resilience as normal mainnet BCH transactions always have.

CashTokens includes:

- **Fungible Tokens**: FTs are just numbers that permit you to create simple tokens like on most any other chain, including meme coins, company shares, utility tokens, etc.
- **Non-Fungible Tokens**: NFTs are the [JPEG photos we’ve all come to know and love](https://en.wikipedia.org/wiki/Non-fungible_token), but BCH NFTs are much more than this—they permit the passing of a message (known as a `commitment`) that facilitate the creation of on-chain decentralized applications.

The CashTokens upgrade also adds new opcodes. [Opcodes](https://documentation.cash/protocol/blockchain/script#operation-codes-opcodes) are built-in functions that you can use in on-chain Bitcoin scripts.

CashTokens was authored by BCH developer [Jason Dreyzehner](https://blog.bitjson.com/), and subsequently refined and implemented via the [CHIP](https://bch.info/en/chips) (Cash Improvement Proposals) process for Bitcoin Cash protocol governance with the participation of many BCH community members.

<a name="heading-what-you-can-do-with-cashtokens"></a>
### What You Can Do With CashTokens

Use cases for CashTokens include the following:

- NFTs where an on-chain hash is linked to an image hosted off-chain.
- Access tokens, which, when held, can serve as a kind of key to open doors physical or virtual.
- Collateralized loans.
- Formation of a business entity with tokenized shares that can receive dividends (security tokens).
- ICOs (initial coin offerings).
- Auctions.
- Decentralized exchanges (DEXs) that operate peer-to-peer.
- DAOs (decentralized autonomous organization) and on-chain voting.
- Algorithmic stablecoins.
- Sidechains, which could be written in a fast, low-level language such as Rust in order to handle tasks that don’t need to take place on-chain.
- [Prediction markets](https://www.youtube.com/watch?v=QZJ1Al50xfc).
- Utility tokens, which can enable users to pay for a certain product or service on-chain.
- Wrapped coins.

What would you like to build with CashTokens? Let me know in the Panmoni CashTokens chat on [Telegram](https://t.me/Panmoni/315) or [Discord](https://discord.gg/MaybgkHs53).

<a name="heading-why-cashtokens-matters"></a>
### Why CashTokens Matters

Unlike smart contracts on Ethereum that suffer from high fees and complicated L2 (Layer 2; i.e., multi-blockchain) scaling schemes, smart contracts built with BCH CashTokens can actually scale on L1 while keeping transaction fees low and enjoying the same security as BCH itself.

That means you can build dapps (decentralized applications) just like on Ethereum, but without having to worrying about transaction fees going sky-high when you’re successful. On BCH, your dapps can keep growing without interruption and can serve everyone in the world, enabling you to grow economies of scale that are impossible on Ethereum.

And just like on Cosmos, but without having to worry about bridges or the fees, UX (user experience) complexity and vulnerabilities they bring. Your dapps can remain easy-to-use and accessible to even the least technically-savvy users, without having to go through multiple steps to move funds between chains or deal with wrapping and unwrapping coins.

With CashTokens, you can build dapps that are unstoppable, permissionless, non-custodial and free of middlemen. You can build Binance, but without having to hold custody of users’ coins. You can build DEXs that perform complex swaps with sub-cent fees. You can build electronic cash applications where transactions benefit from L1 censorship-resistance without the unpredictable fees of BTC L1.

CashTokens permits the construction and deployment of permissionless, cross-border DeFi solutions for everyone, everywhere—and not just for the select few who can afford the hefty fees on Ethereum.

<a name="heading-mint-your-first-cashtokens"></a>
## Mint Your First CashTokens!

In this tutorial, you will mint your first (fungible) CashTokens! It’s easy so let’s get to it! 🚀

<a name="heading-a-quick-intro-to-how-bitcoin-transactions-work"></a>
### A Quick Intro to How Bitcoin Transactions Work

Bitcoin transactions are made of inputs and outputs. For a transaction to be valid, among other requirements, the outputs must be larger in terms of the total BCH amount than the input(s).

Each of the outputs in a transaction is an _unspent transaction output_, or **UTXO**. A UTXO is usually a BCH balance on a key pair (address) that you have in your wallet, available to spend.

Each of the inputs in a transactions was previously an output, or UTXO, from an antecedent transaction.

The terms UTXO, address and key pair are in many ways quite similar. A key pair includes both a public key and a private key. The public key is your BCH address. For every public key, there is a corresponding private key which you are well-served to keep secure and private. Not every key pair has a BCH balance, but those that do are UTXOs.

Your wallet usually has many BCH addresses and your total BCH wallet balance may be spread across multiple UTXOs in your wallet.

Coincidentally, this is why sometimes your BCH transaction fee may end up being a significant amount—because you received many small payments, for example from [read.cash](https://read.cash/) or [noise.app](https://noise.app/), and now you are combining, or consolidating, those many small UTXOs into a larger output. The more UTXOs you use as inputs, the more bytes are required to store the transaction on disk, the more expensive the recommended transaction fee is likely to be.

So, to sum up, when you hear **UTXO**, just remind yourself that it means a BCH balance on a single BCH address. A simpler way to think of it is that a UTXO is a BCH coin of a specific denomination, be it 1.00000000, 2385.028495276, 0.00000578 or another that fits the pattern of being a whole number with up to 8 digits after any decimal point it might have.

Side note: There is, in reality, no such thing as BCH “coins”. Only UTXOs.

<a name="heading-a-sample-bch-transaction"></a>
#### A Sample BCH Transaction

[![Sample BCH Transaction](/tp1/sample-bch-tx.png)](https://blockchair.com/bitcoin-cash/transaction/00ee4f1734dab5942866dccd293ba6785edacfc7beee1230cafb5b02fa920c8f)

Here is a [sample BCH transaction](https://blockchair.com/bitcoin-cash/transaction/00ee4f1734dab5942866dccd293ba6785edacfc7beee1230cafb5b02fa920c8f) where there is 1 input from BCH address qpakksk9vsc3u4mj4e9zm85mylaxy3kh9syl9vtukh of 3.35141172 BCH and 2 outputs. The input provided BCH to the transaction and the outputs received BCH from the transaction.

The outputs are as follows:

0. qpu3ahzcxhqhntkuvrjkzkrxktvem5lcqqvm2c0qmu: 0.1 BCH
1. qq9nhrsvst9nf9zxxlg8h4k7gltkpus7xu4lqwmzcv: 3.25140722 BCH

Output 0 is likely a payment of 0.1 BCH to another party. Output 1 is the change from that transaction and was returned to an address in the wallet of the same user who controls the input and who created this transaction.

Output 1 is the _change address_. Change here is used in the same sense as when you give a cashier a $20 bill to pay a $15 charge, and the cashier gives you a $5 bill as change, i.e., “money returned to someone as the balance of the sum paid for something”.

If you compare the total of the input with the total of the output, you will see that the input is larger than the output by 0.0000045 BCH. This small amount is the transaction fee paid to the miner, and is implicit in the transaction.

`3.35141172 - (3.25140722+0.1) = 0.0000045`

On the [Blockchair block explorer](https://blockchair.com/bitcoin-cash/transaction/00ee4f1734dab5942866dccd293ba6785edacfc7beee1230cafb5b02fa920c8f), you can retrieve the raw transaction in different formats, including [JSON](https://www.json.org/json-en.html) (an easy-to-learn Javascript data format), by clicking on “Raw tx”. Below is the sample transaction from above in JSON format.

Take a moment and compare it with the image and webpage linked above in order to become familiar with this format. Don’t worry about the parts you don’t understand, just look for the parts you do. I promise it’s easy!

As this series goes on, I will explain more parts of this to you in a clear and easy-to-understand way.

	{
	    "txid": "00ee4f1734dab5942866dccd293ba6785edacfc7beee1230cafb5b02fa920c8f",
	    "hash": "00ee4f1734dab5942866dccd293ba6785edacfc7beee1230cafb5b02fa920c8f",
	    "version": 2,
	    "size": 225,
	    "locktime": 0,
	    "vin": [
	        {
	            "txid": "7230465bf9f76567672ba0f136816b37e92d0b6dc5d10bdd676648b32e192226",
	            "vout": 0,
	            "scriptSig": {
	                "asm": "3044022037a59a21f56da586f32d70e976b84b22232e4d5de97a0842cb6ead23863e0d2702200842dafe37fcb3c270ef62df26ffb364cf35badcefeeb6e40ca4b4e3e2c55665[ALL|FORKID] 02f3452dfc0271696ebf45383a3b7491c3e68a3b9128b7183bfb4bd08846e6971d",
	                "hex": "473044022037a59a21f56da586f32d70e976b84b22232e4d5de97a0842cb6ead23863e0d2702200842dafe37fcb3c270ef62df26ffb364cf35badcefeeb6e40ca4b4e3e2c55665412102f3452dfc0271696ebf45383a3b7491c3e68a3b9128b7183bfb4bd08846e6971d"
	            },
	            "sequence": 4294967295
	        }
	    ],
	    "vout": [
	        {
	            "value": 0.1,
	            "n": 0,
	            "scriptPubKey": {
	                "asm": "OP_DUP OP_HASH160 791edc5835c179aedc60e5615866b2d99dd3f800 OP_EQUALVERIFY OP_CHECKSIG",
	                "hex": "76a914791edc5835c179aedc60e5615866b2d99dd3f80088ac",
	                "reqSigs": 1,
	                "type": "pubkeyhash",
	                "addresses": [
	                    "bitcoincash:qpu3ahzcxhqhntkuvrjkzkrxktvem5lcqqvm2c0qmu"
	                ]
	            }
	        },
	        {
	            "value": 3.25140722,
	            "n": 1,
	            "scriptPubKey": {
	                "asm": "OP_DUP OP_HASH160 0b3b8e0c82cb34944637d07bd6de47d760f21e37 OP_EQUALVERIFY OP_CHECKSIG",
	                "hex": "76a9140b3b8e0c82cb34944637d07bd6de47d760f21e3788ac",
	                "reqSigs": 1,
	                "type": "pubkeyhash",
	                "addresses": [
	                    "bitcoincash:qq9nhrsvst9nf9zxxlg8h4k7gltkpus7xu4lqwmzcv"
	                ]
	            }
	        }
	    ]
	}

<a name="heading-cashtokens-explained"></a>
### CashTokens Explained

The BCH CashTokens upgrade added a new field, `token_data` that has multiple subfields. This is effectively information that can be added to any new UTXO, like adding new columns to rows in a spreadsheet.

- `amount`: The number of fungible tokens (FTs) held on the UTXO. You can hold any amount of any single FT `category` (up to 9223372036854775807 units) on a single UTXO. To hold multiple categories of tokens, you will need at least 1 UTXO for each `category` of token. The number of non-fungible tokens (NFTs) on a UTXO is always either 0 or 1, and is therefore implicit.
- `category`: The hash, or transaction ID, of the transaction that created the UTXO used as the first input for the cashtoken's genesis transaction. This is called the _pre-genesis transaction_. This field is used both for NFTs and FTs. One category can include both NFTs and FTs. The category field is a proxy for the token name/brand/ticker, and is resolved through the use of the BCMR metadata standard (see below).
- `nft`
	- `capability`: This can have one of three values: ‘none’, ‘mutable’ or ‘minting’. ‘None’ means you can spend the NFT but not change its `commitment` nor make more. ‘Mutable’ means you can both spend the NFT and change its `commitment`. ‘Minting’ means you can spend it, change its `commitment` and make more NFTs of the same `category`.
	- `commitment`: The NFT message that can be up to 40 bytes.

If there is no data for the `nft` fields, then the UTXO has no NFTs on it, and these fields will be omitted.

<a name="heading-cashtokens-metadata"></a>
#### CashTokens Metadata

Tickers (e.g., BCH, BTC, ETH), coin names (e.g., Tether, USD Coin, etc.) and other such metadata for CashTokens is **not** stored on the BCH blockchain. This is in order to make the most efficient use of block space. After all, every byte of data that goes into a transaction is stored on dozens or hundreds of BCH full nodes across the world (until or unless pruned).

The metadata for CashTokens is, instead, made available through individual initiative via a JSON file that uses a specific [schema](https://github.com/bitjson/chip-bcmr#metadata-registry-json-schema), called the [Bitcoin Cash Metadata Registries](https://github.com/bitjson/chip-bcmr), or **BCMR** for short. This metadata can be made available via IPFS and/or via DNS on a website of one's choosing over HTTPS, and can be linked to on-chain from the genesis transaction's OP\_RETURN together with a hash of the metadata file in JSON format.

Token creators and/or other entities in the ecosystem can create and publish BCMR files. Registries can aggregate these files into large collections of BCMR JSON data, such as [this one from the otr.cash registry](https://raw.githubusercontent.com/OpenTokenRegistry/otr.cash/master/static/.well-known/bitcoin-cash-metadata-registry.json). There can be any number of registries and different registries can have different standards or specializations. For example, [otr.cash](https://otr.cash/docs/list/) has very specific listing standards that any serious token project would do well to review.

Or, you can forego registries altogether, and simply publish your own BCMR file. Registries may then pick it up, or not, depending on individual initiative.

Whatever method you choose, my recommendation for serious projects is to adopt the [BCMR standard](https://github.com/bitjson/chip-bcmr).

<a name="heading-sample-bcmr-metadata"></a>
##### Sample BCMR Metadata

Here is some sample BCMR metadata from my [“Real Bitcoin Fam” ](https://RealBitcoinFam.com)fungible token. It specifies a token name of “Real Bitcoin Fam Community Award Tokens”, a ticker of XRBF and that this token has 2 decimal places.

Take a look. It’s very human-readable, I promise. 😊

	{
		"$schema": "https://cashtokens.org/bcmr-v2.schema.json",
		"version": {
			"major": 0,
			"minor": 2,
			"patch": 0
		},
		"latestRevision": "2023-07-19T22:23:41.467Z",
		"registryIdentity": {
			"name": "bcmr for Real Bitcoin Fam",
			"description": "self-published bcmr for Real Bitcoin Fam"
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

<a name="heading-sample-ft-genesis-transaction"></a>
##### Sample FT Genesis Transaction 

Copy this token’s `category` from above and visit the [SalemKode block explorer](https://explorer.salemkode.com/). Paste the `category` hash into the search bar.

`482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887`

On the left, click on “Open token page” to visit the [page](https://explorer.salemkode.com/token/482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887) for Real Bitcoin Fam’s Token ID (`category`) on this block explorer. Find the token’s genesis transaction from Jul 19, 2023 with this transaction ID (hash):

`5de87383470ec7d31a8eeb3da2f21952da42b300fd527c6bf3600f03caf122c4`

Copy that hash, visit [Blockchair.com](https://blockchair.com/) and enter that transaction ID into the search box. On the [transaction page](https://blockchair.com/bitcoin-cash/transaction/5de87383470ec7d31a8eeb3da2f21952da42b300fd527c6bf3600f03caf122c4), click on “Raw tx” bottom right. Here is the raw genesis transaction for my XRBF fungible token in JSON format:

	{
	    "txid": "5de87383470ec7d31a8eeb3da2f21952da42b300fd527c6bf3600f03caf122c4",
	    "hash": "5de87383470ec7d31a8eeb3da2f21952da42b300fd527c6bf3600f03caf122c4",
	    "version": 2,
	    "size": 386,
	    "locktime": 0,
	    "vin": [
	        {
	            "txid": "482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887",
	            "vout": 0,
	            "scriptSig": {
	                "asm": "d702d99cba05c4b2d8d6538712dbd74cecf5f7a602b9ba047e6b0f292a204d5218c94ba402635ec7389d1212af46af4acc7e4195c04362ddf44b67c4c6ce541d[ALL|FORKID] 03bc3bee1b12fe218a35d296af5788febbc01e8c169345e143addc86c338a726ef",
	                "hex": "41d702d99cba05c4b2d8d6538712dbd74cecf5f7a602b9ba047e6b0f292a204d5218c94ba402635ec7389d1212af46af4acc7e4195c04362ddf44b67c4c6ce541d412103bc3bee1b12fe218a35d296af5788febbc01e8c169345e143addc86c338a726ef"
	            },
	            "sequence": 0
	        }
	    ],
	    "vout": [
	        {
	            "value": 0.00001,
	            "n": 0,
	            "scriptPubKey": {
	                "asm": "OP_DUP OP_HASH160 6ff589240f0856b7e2467df1748888546987ba04 OP_EQUALVERIFY OP_CHECKSIG",
	                "hex": "76a9146ff589240f0856b7e2467df1748888546987ba0488ac",
	                "reqSigs": 1,
	                "type": "pubkeyhash",
	                "addresses": [
	                    "bitcoincash:qphltzfypuy9ddlzge7lzayg3p2xnpa6qs4ys7dnnw"
	                ]
	            },
	            "tokenData": {
	                "category": "482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887",
	                "amount": "2100000000"
	            }
	        },
	        {
	            "value": 0,
	            "n": 1,
	            "scriptPubKey": {
	                "asm": "OP_RETURN 1380795202 f54610c897b382070f92857e6d342247e27e51cac8b24217e435a317110d38cc 676973742e67697468756275736572636f6e74656e742e636f6d2f67656f726765646f6e6e656c6c792f33313137386133363239306135643365303732396532626337386330333737312f726177",
	                "hex": "6a0442434d5220f54610c897b382070f92857e6d342247e27e51cac8b24217e435a317110d38cc4c4e676973742e67697468756275736572636f6e74656e742e636f6d2f67656f726765646f6e6e656c6c792f33313137386133363239306135643365303732396532626337386330333737312f726177",
	                "type": "nulldata"
	            }
	        },
	        {
	            "value": 0.00008613,
	            "n": 2,
	            "scriptPubKey": {
	                "asm": "OP_DUP OP_HASH160 6ff589240f0856b7e2467df1748888546987ba04 OP_EQUALVERIFY OP_CHECKSIG",
	                "hex": "76a9146ff589240f0856b7e2467df1748888546987ba0488ac",
	                "reqSigs": 1,
	                "type": "pubkeyhash",
	                "addresses": [
	                    "bitcoincash:qphltzfypuy9ddlzge7lzayg3p2xnpa6qs4ys7dnnw"
	                ]
	            }
	        }
	    ]
	}

Locate the `vout` section on line 18. The **first transaction output** has a value for `n` of ‘0’ and a `value` of ‘0.00001’ BCH. Here it is:

	{
	            "value": 0.00001,
	            "n": 0,
	            "scriptPubKey": {
	                "asm": "OP_DUP OP_HASH160 6ff589240f0856b7e2467df1748888546987ba04 OP_EQUALVERIFY OP_CHECKSIG",
	                "hex": "76a9146ff589240f0856b7e2467df1748888546987ba0488ac",
	                "reqSigs": 1,
	                "type": "pubkeyhash",
	                "addresses": [
	                    "bitcoincash:qphltzfypuy9ddlzge7lzayg3p2xnpa6qs4ys7dnnw"
	                ]
	            },
	            "tokenData": {
	                "category": "482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887",
	                "amount": "2100000000"
	            }
	        },

Scroll down to the `tokenData` section of that UTXO and you will see that `category` has the same value as `category` in the BCMR file. This is also the transaction ID of the transaction that created the UTXO that is used as the first input for this genesis transaction (This is called the _pre-genesis transaction_). That value is:

`482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887`

This is the unique identifier for the Real Bitcoin Fam XRBF token, i.e., its `category`.

As you can see the value for `amount` is ‘2100000000’, which is 2 billion 1 hundred million. If you take off the last two zeros, i.e., the 2 decimal places specified by the `decimals` sub-field in the BCMR file, then the number is 21 million, which is the intended total supply of this fungible token.

Now scroll down a little further in the JSON file of the XRBF genesis transaction and find the transaction output where `n` has a value of ‘1’. This is the OP\_RETURN where the BCMR file for this token is established on-chain. Here it is:

	{
	            "value": 0,
	            "n": 1,
	            "scriptPubKey": {
	                "asm": "OP_RETURN 1380795202 f54610c897b382070f92857e6d342247e27e51cac8b24217e435a317110d38cc 676973742e67697468756275736572636f6e74656e742e636f6d2f67656f726765646f6e6e656c6c792f33313137386133363239306135643365303732396532626337386330333737312f726177",
	                "hex": "6a0442434d5220f54610c897b382070f92857e6d342247e27e51cac8b24217e435a317110d38cc4c4e676973742e67697468756275736572636f6e74656e742e636f6d2f67656f726765646f6e6e656c6c792f33313137386133363239306135643365303732396532626337386330333737312f726177",
	                "type": "nulldata"
	            }
	        },

Once decoded, this transaction output reads as follows:

	BCMR Fȗ~m4"G~QȲB5
	8LNgist.githubusercontent.com/georgedonnelly/31178a36290a5d3e0729e2bc78c03771/raw

You can visit the [URL](https://gist.github.com/georgedonnelly/31178a36290a5d3e0729e2bc78c03771) in the decoded output and indeed see that the contents of it include the BCMR-compatible metadata for XRBF.

<a name="heading-authbase-and-authchain"></a>
##### AuthBase and AuthChain

This UTXO that carries the BCMR metadata link is called the **authbase**. With this minting shown above, which was done via the Cashonize wallet, the authbase and the full supply of the created fungible token are on the same UTXO. Below, I will show you how to separate them and subsequently freeze your authbase.

Every time you change the BCMR file, the hash of it will change and therefore you will need to publish an update to the chain with the new hash. Over time, this series of changes is called the **authchain**.

Don’t worry if all of this stuff is still a little hazy for you. Future "Token Pioneers" tutorials will help resolve any confusion, and you can always ask for support in [my Telegram group](https://t.me/Panmoni/315) or the [CashTokens Developers group](https://t.me/cashtoken_devs).

<a name="heading-create-your-first-fungible-cashtokens-fts"></a>
### Create Your First Fungible CashTokens (FTs)

The fungible tokens are just numbers—simple tokens. They are great for representing the number of assets you hold, such as shares in a company or meme coins. They are well-suited for use in liquidity-pooling in DEXs, voting, etc.

FTs use just two of the CashTokens `token_data`fields: `amount` and `category`. The `amount` is the number of tokens and `category` is the unique ID we discussed above. The `category` field can be linked to your desired token name, ticker, logo, etc. using the BCMR metadata specification mentioned below.

Fungible tokens have some interesting properties, including the following.

- They cannot be counterfeited, since they are on-chain assets at the same level as BCH itself. This is what “miner-validated tokens” means.
- All fungible tokens of a given `category` must be created when the token category is created. This means that if you create a token that you want to have a maximum supply of 21,000,000 tokens, that the complete supply of the tokens must be created at once in the genesis transaction. However, you can [lock up the supply of these tokens in a smart contract](https://bitcoincashresearch.org/t/chip-2023-07-minting-baton-covenant-mbc-standard-for-fungible-tokens/1113) and only disburse them based on certain conditions. In this way, you can create contracts that disburse tokens in response to on-chain activity.
- FTs can be merged and divided as you like, however each BCH UTXO can only hold FTs (and NFTs) of 1 token `category`. This means that if you have tokens of multiple categories, they can not be held on the same UTXO. Since you can have multiple UTXOs in one wallet, this is not an obstacle—just something to be aware of.

<a name="heading-easy-ft-minting-instructions-"></a>
#### Easy FT Minting Instructions 🏁

If you just want to make some fungible tokens via a web interface, you’re in luck! BCH community member Mathieu Geukens has created [Cashonize](https://cashonize.com/), a BCH web wallet that permits you to mint both fungible and non-fungible BCH CashTokens.

Here’s how to mint your first fungible tokens (FTs) with BCH CashTokens! 🤩😮

<a name="heading-1-install-electron-cash"></a>
##### 1. Install Electron Cash
1. Install the [Electron Cash desktop wallet](https://electroncash.org/) and create a wallet, or import an existing BCH wallet (only if it’s not a terribly important wallet).
2. Ensure your wallet is funded with a small amount of BCH. Here are [some places](https://www.bitcoincashsite.com/buy) where you can get BCH. Try to send it to the _primary address_ of your wallet.
	1. You can find the _primary address_ of your wallet in Electron Cash by visiting the **Addresses** tab and finding the one with an `index` value of ‘0’. If you have no **Addresses** tab, go to the **View** menu and select “Show Addresses.”
3. If you created a new wallet, store your seed phrase securely, for example using [BitWarden](https://bitwarden.com/), [KeePass](https://keepass.info/), pen and paper, or another secure method that you’re not going to lose.
4. If using an existing wallet, you can find your seed phrase in Electron Cash under the **Wallet** menu \> **Seed**. Be sure to protect it from prying eyes.

![Primary Wallet Address](/tp1/wallet-primary-address.png)

<a name="heading-2-open-cashonizecom"></a>
##### 2. Open Cashonize.com
1. Open the [Cashonize web wallet](https://cashonize.com/) in your browser and paste your seed phrase (from your Electron Cash wallet) into the text box below where it says “Import existing wallet.” Leave the derivation path as the default value and click the Import button.
	1. If you prefer, you can create a new wallet in Cashonize and later on import that wallet into Electron Cash. To go this route, use the “Create new wallet” function on Cashonize.com.
    2. Click on the gear in the tab bar.
    3. Click the “Show seed phrase” button and securely store the seed phrase that is shown there.
		1. To import this seed phrase into Electron Cash, click the **File** menu \> New/Restore in Electron Cash.
        2. Follow the dialog and select “Standard wallet” \> “I already have a seed”.
        3. On the next screen, paste your seed phrase from Cashonize and, later, accept the default derivation path.
        4. Finish the dialog and you will have successfully “mirrored” your wallet on both Cashonize and Electron Cash. 
2. If you are using an existing wallet, it’s important to note that Cashonize is a single-address wallet. It only sees and uses the first address (i.e., _primary address_) in your wallet. So, that first address should have a BCH balance. If it doesn’t, you can just do a consolidating transaction in Electron Cash. 
	1. In case you need to perform a consolidating transaction because your _primary address_ has no or insufficient BCH balance, please do the following.
		1. Visit the Addresses tab in Electron Cash and find the address that has an `index` value of ‘0’.
		2. Right-click it and select Copy Address.
		3. Now visit the Coins tab in Electron Cash and select any UTXO(s) that have a BCH balance that you wish to consolidate (i.e., move to the _primary address_).
		4. Once selected (you can select more than one if you like), right-click and select Spend. This will open the Send screen and show in the From field the UTXO(s) you are consolidating.
		5. Paste into the "Pay to" field the _primary address_ of your wallet. 
		6. You can enter a description if you like and you can enter the amount you wish to consolidate to your primary address, or just hit max.
		7. If consolidating many UTXOs, make sure the fee is not too high and click send.
		8. This should consolidate the selected UTXOs to your wallet's _primary address_.

<a name="heading-3-get-the-token-id-category"></a>
##### 3. Get the Token ID (`category`)

1. In your Cashonize wallet, click on the “CreateTokens” tab top right. Leave the "token-type" with its default value of “Fungible Tokens”.
2. The wallet will select a _pre-genesis transaction_ UTXO to use as the input for the transaction that creates your FT (i.e., the _genesis transaction_). Cashonize will show it as the "Planned tokenId", otherwise known as the `category` for your FT. Copy this hash to your clipboard.
3. Choose the Total Supply. This can be tricky, because the decision depends on how many decimal places you want your FT to have.
	1. For example, if you want a total supply of 21 million with 8 decimal places, then the number you enter here should be 2100000000000000. Do not enter any decimal points or commas here. The decimal point actually gets “placed” by the metadata, and is not present on-chain. So you have to put your desired total supply and then add on the digits for the decimal places to that. Here is another example: If you want a total supply of one-thousand with two decimal places, then enter 100000.
4. **Do not submit the form yet.**

![Cashonize Create Tokens](/tp1/cashonize-create-tokens.png)

<a name="heading-4-create-the-token-metadata"></a>
##### 4. Create the Token Metadata
1. Click on the little black arrow to expand the metadata section. Open in another tab the [BCMR Generator Tool](https://bcmr-generator.netlify.app/).
	1. The "Planned tokenId" from the "Create Token" page should now be pasted into the "Tokenid" field on the BCMR Generator Tool page, if it’s not pre-filled.
	2. Enter your Token Name, Token Description, Token Symbol (ticker), Icon Link, Decimals, Website URL and any other URLs you would like to associate with your new token.
		1. If this is just a fun or throwaway token for testing, then you can fill out whatever you want for this information. Furthermore, you can always update your token’s metadata later.
		2. However, if you think you might like for your token to achieve the highest-possible level of trust and acceptance in the community, then you can read the [listing standards at otr.cash](https://otr.cash/docs/list/) before proceeding further.
		3. The Icon Link is a URL to the image that will represent your token in wallets, block explorers and other apps across the BCH ecosystem. If you can, use an SVG. AVIF, WebP and PNG are also acceptable. If you choose a format other than SVG, be sure the image is exactly 400px x 400px. Transparency is supported.
			1. It is recommended to host your Icon on IPFS to ensure it is always available. [Nft.storage](https://nft.storage/) is an easy, free way to do that. You can also patronize [mainnet\_pat’s](https://twitter.com/mainnet_pat) IPFS pinning service, which currently costs 0.0025 BCH (about USD$0.60 at the time of publication).
			2. Once uploaded, copy the CID (“Content Identifier”) from [nft.storage](https://nft.storage/files/). Now create a URL that starts with `https://ipfs.io/ipfs/` and ends with the CID. If your Icon comes up, you were successful. For example, here is the one for the [XRBF token icon](https://ipfs.io/ipfs/bafkreiax4h2evyf4g7iuu6kuqkxwez4kvduxayngj5vxmvgrekipevptl4).
			3. Under Actions on [nft.storage](https://nft.storage/files/) , click “Copy IPFS URL”. This is the URL that you will paste into the the BCMR Generator Tool for the Icon Link field.
			4. If you don’t need your new token to be highly trusted by the community, you can host the image on your own domain or a GitHub gist.
	3. Click “Download BCMR JSON File”. Don’t worry, you can always update this data later. The metadata file will download to your computer. 
	4. You can simply upload this file to your own HTTPS-enabled website, to IPFS, or you can use a GitHub gist.
		1. If using a gist, open the downloaded file in a text editor such as [VS Code](https://code.visualstudio.com/), select the complete contents and copy them.
		2. Visit [gist.github.com](https://gist.github.com/). This next step assumes you have a GitHub account and that you are logged in. 
		3. Fill in the form with filename `your-token-bcmr.json` and paste the contents of the BCMR file you previously downloaded into the main text box.
		4. At bottom right, click on the arrow on the green button next to “Create secret gist” and select “Create public gist”.
		5. If you would like to host your token icon on GitHub, you can include it as part of this same gist by [following these instructions](https://gist.github.com/remarkablemark/feff40b0a522f0c41c4eff0b77ea1d47). This requires a minimal knowledge of git.
			1. Here is an [example](https://gist.github.com/mr-zwets/84b0057808af20df392815fb27d4a661) of how a gist that contains both a BCMR file and a token icon looks like in its final state.
		6. Click on “Create public gist” and your BCMR file is complete. To get the URL, click on “Raw” at the top right of your completed gist. Copy the URL from the URL bar. It will look something like this:
			1. `https://gist.githubusercontent.com/mr-zwets/84b0057808af20df392815fb27d4a661/raw/5baa2e979e17f19df5aa62c4abb49e044cdfd2fc/bcmr.json`
			2. Delete the ‘https://' and everything after ‘raw’. This will leave you a URL fragment that looks like the following:
			3. `gist.githubusercontent.com/mr-zwets/84b0057808af20df392815fb27d4a661/raw`

![Metadata Generator Screenshot](/tp1/bcmr-generator.png)

<a name="heading-5-return-to-cashonize"></a>
##### 5. Return to Cashonize

1. Now take this URL fragment and return to the Cashonize "CreateTokens" page. Find where it says “Upload the metadata to” and select the appropriate option. If you used a gist, select “HTTPS: GitHub gist”.
2. Find the text field below and paste your BCMR URL fragment into it.
3.  Click the green Create button and you should get a success message that says your fungible tokens were created in the amount you specified with its `category` (tokenId). Success! 🥳🎉

<a name="heading-6-verify-token-creation"></a>
##### 6. Verify Token Creation

1. Once your token is created, which can take a couple minutes, check the “MyTokens” tab in Cashonize.  You should see your token with its full supply in your wallet and its `symbol` (ticker). It should also show you the icon (though it can take up to 48 hours to show up in some cases). Click on “Info” to reveal the most important metadata.
2. Keep track of your Tokenid (`category`). If you have a website for your token, publish it there so your token holders can verify for themselves if they have your authentic token—or if they have a copycat.
3. Find your token’s page on the SalemKode block explorer. Visit [explorer.salemkode.com](https://explorer.salemkode.com/) and paste your "Tokenid" into the search bar. Then click on “Open token page.” From here, you can explore your token’s genesis transaction.

For example, here is [the page for XRBF](https://explorer.salemkode.com/token/482d555258d3be69fef6ffcd0e5eeb23c4aaacec572b25ab1c21897600c45887). And you can explore its genesis transaction above in the “Sample FT Genesis Transaction” section.

![Cashonize MyTokens](/tp1/cashonize-newly-minted-fts.png)

<a name="heading-7-freeze-your-tokens-authbase"></a>
##### 7. Freeze your Token’s Authbase

Don’t send any tokens yet! You first want to freeze your authbase to ensure you maintain control of the metadata for your new fungible token.

1. Return to Cashonize and click on the “MyTokens” tab. Under your new fungible tokens, click on “auth transfer”. This will open a text box where you can put a BCH address.
2. Go into Electron Cash and ensure you are looking at the same wallet you used in Cashonize.
3. Visit the **Addresses** tab and pick an address near the bottom of the list that is unused and has an `index` value greater than ‘0’. Right-click on it and copy this address.
4. Go back to Cashonize and input this address into the text box.
5. Click the “Transfer Auth” button. This will pop up a message that says the authbase of your tokenID has been transferred to the address you entered on Cashonize for this purpose.
6. Visit your Electron Cash wallet again and go to the **Coins** tab. (If it’s not visible, go to the **View** menu \> Show Coins.) Find the address you just used to transfer your authbase to. It should now have an “Amount” next to it, probably 0.00001 BCH (1000 satoshis).
7. Right-click on the address and click “Freeze Coin.” Your token’s authbase is now frozen in Electron Cash (only).

![Authbase Transfer](/tp1/separate-authbase.png)

<a name="heading-understanding-authbase"></a>
###### Understanding AuthBase

To understand what happened, right-click on the authbase address again and select “Details.” This will pop up a new window showing the transaction that moved the authbase for your new fungible token.

The window will show you a lot of information, including the inputs and outputs for the transaction. The important thing here is simply that the output 0, i.e., the first output of this transaction, be the address you selected to hold the authbase for this fungible token—and that you freeze it.

By doing so, you have assured that the authchain for your new fungible token remains under your control in your wallet (double-check that you have secured your seed phrase!) when using Electron Cash.

As mentioned previously, the authbase is important because whoever controls that also controls the ability to update the metadata for the fungible token you just created.

I will do an extensive tutorial on CashTokens metadata (i.e., the [BCMR](https://github.com/bitjson/chip-bcmr)) soon.

<a name="heading-8-spend-some-tokens"></a>
##### 8. Spend Some Tokens!

Now you can spend your new fungible tokens!

1. Under the **View** menu in Electron Cash, click Show CashTokens and Show Tokens History. This will open two new tabs in the main interface of Electron Cash.
2. Under the Token History tab, the total supply of your tokens should be present. Left click on it and click on “Category Properties…”.
3. This will open a dialog. Find the link near the bottom of the dialog that says “Click here to apply it…”. This will load the BCMR you created into your Electron Cash instance. Your token metadata should appear. Click OK to clear the dialog.
4. To spend your tokens from Electron Cash, visit the “CashTokens” tab.
    1. Select the token you want to spend, right-click and select “Send Token…”.
    2. Enter the amount of tokens you want to send, and the “Pay to”, i.e., the address to send them to. You can optionally add a description and send BCH with it.
    3. Click “Preview Tx…” By default it will send 800 sats of dust to enable the tokens to be sent again, if need be.
    4. If you’re happy with the transaction, click the “Sign” button and then the “Broadcast” button.
    5. It will give you a “Payment sent” dialog with the transaction ID. Success! 🥳🎉
    6. Feel free to copy the link from the dialog and explore the raw transaction data on [Blockchair.com](https://blockchair.com/).
5. To spend your tokens from Cashonize, visit the "MyTokens" tab and click “send” for the token you want to send. A form will appear. Enter the address you want to send the tokens to and how many tokens you want to send. When you’re satisfied with your transaction, click the “Send” button. A dialog will pop up confirming how many units of which token you sent and to what address. Success! 🥳🎉

![Send FTs with Electron Cash](/tp1/ec-send-fts.png)

![Send Fts with Cashonize](/tp1/cashonize-send-fts.png)

<a name="heading-bonus-get-some-xrbf-tokens-"></a>
##### BONUS: Get some XRBF Tokens 💰💸

Want some of my new ["Real Bitcoin Fam"](https://www.realbitcoinfam.com/) XRBF tokens? It’s easy and fun!

1. Join [my Telegram group](https://t.me/Panmoni/315).
2. Post a few words about what you want to build with CashTokens and your BCH address (ideally the token-aware one.)
3. I will send you **10 XRBF** tokens!
4. **Bonus!** Share the link to your new CashTokens fungible token (_that you created by following this tutorial_) on [explorer.salemkode.com](https://explorer.salemkode.com/) and I will give you up to **100 XRBF**!

<a name="heading-coming-soon"></a>
## Coming Soon

Coming up next are tutorials on NFT minting, BCMR metadata, Authchain management and more. [Vote here](https://twitter.com/BitcoinCashSite/status/1683919957367877632) for your favorite tutorial topics!

<a name="heading-support-the-token-pioneers-tutorial-series"></a>
## Support the “Token Pioneers” Tutorial Series

_Want more tutorials?_ I accept donations to fund this critical work of educating new BCH builders about how to build permissionless, unstoppable dapps with CashTokens on Bitcoin Cash.

Yes, there will be video tutorials and yes, I will be getting into more advanced topics as soon as I have covered the basics.

**BCH address**:
[bitcoincash:qz3pxmwda8gd42wa8k9yfxcwhcaapeuhygjc8mc4m8](bitcoincash:qz3pxmwda8gd42wa8k9yfxcwhcaapeuhygjc8mc4m8)

**Token-aware address** (Send me 1+ of every FT you create!): [bitcoincash:zz3pxmwda8gd42wa8k9yfxcwhcaapeuhyg4j59kny5](bitcoincash:zz3pxmwda8gd42wa8k9yfxcwhcaapeuhyg4j59kny5)

**QR Code**: [tipb.ch/bitcoincashsite](https://tipb.ch/bitcoincashsite)

![Token Pioneers](/tp1/token-pioneers-big.png)

<a name="heading-sponsor-this-work"></a>
### Sponsor this Work

For each 2 BCH donation in support of this tutorial series, you can select 1 tutorial or marketing video to sponsor. Sponsors get a text + image mention embedded in the deliverable, subject to reasonable limits. I reserve the right to select with sponsorship requests I will accept.

I’m also working on an additional 68+ short tutorial videos ([examples 1](https://www.youtube.com/playlist?list=PLfCBnMrjKRClnfdFU86KhlbuyBCkbgo6m), [2](https://www.youtube.com/playlist?list=PLfCBnMrjKRCnQ6jh4Sb4g5Njw0dVaIiLY)) beyond what is mentioned in the [Token Pioneers flipstarter](https://archive.li/UznMe), and these are also available for sponsorship at the rate of 0.25 BCH per video (negotiable). For these videos, you can influence the content. I can even make tutorials about your product, service or project.

Selection of sponsored deliverables is on a first-come, first-serve basis. If you wish to take advantage of this offer, [please fill out this form](https://panmoni.zapier.app/sign-up).

<a name="heading-thank-you-"></a>
### Thank You 🙏

A huge **thank you** to [toorik](https://twitter.com/toorik), anonymous, William Patrick, S0me\_N0b0dy and na for their support of the [flipstarter](https://archive.li/UznMe) that makes this “Token Pioneers” tutorial series possible. Please visit [BitcoinCashSite.com/about](https://www.bitcoincashsite.com/about) to see the complete list of 55+ community members who have funded my work since 2019.

Thank you also to [Mathieu Geukens](https://twitter.com/GeukensMathieu) (AKA mr-zwets), [BitcoinCashAutist](https://twitter.com/bchautist) and [OPReturn](https://twitter.com/OPReturnCode) whose guidance in the [CashTokens Developers group](https://t.me/cashtoken_devs) has been extremely valuable.

However, any errors or omissions are my own. 😳

<a name="heading-your-feedback-matters"></a>
## Your Feedback Matters

After this tutorial undergoes some community revision and feedback, I’ll publish a video to go with it. Your feedback and ideas are important to me. Reach out anytime. Email [george@panmoni.com](mailto:george@panmoni.com) or [join the Panmoni Telegram channel](https://t.me/Panmoni/315). 🔥
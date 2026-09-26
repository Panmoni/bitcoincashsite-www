---
title: "Post-Quantum and Hybrid Signatures"
code: "CHIP-2026-06"
owners:
  - mainnet_pat
  - bitcoincashautist
status: draft
summary: "Proposes letting the existing signature opcodes verify more than one signature scheme, starting with post-quantum SPHINCS+ and hybrid secp256k1-plus-PQ keys, spendable from ordinary P2PKH outputs."
spec: "https://gitlab.com/mainnet-pat/chip-2026-06-generic-sigs"
discussion: "https://bitcoincashresearch.org/t/chip-2026-06-post-quantum-and-hybrid-signatures/1864"
stakeholders: []
verified: 2026-09-26
sources:
  - title: "CHIP-2026-06: Post-Quantum and Hybrid Signatures (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2026-06-post-quantum-and-hybrid-signatures/1864"
  - title: "CHIP-2026-06 generic signatures repository"
    url: "https://gitlab.com/mainnet-pat/chip-2026-06-generic-sigs"
---

## Summary

The proposal adds **generic signature dispatch** to Bitcoin Cash's check-signature opcodes. A public key's first byte
selects its signature scheme from a registry: secp256k1 today, with post-quantum (PQ) schemes such as Falcon-512 and
SPHINCS+ added over time.

A **compound key** binds two schemes under one signer with AND logic. A hybrid spend, such as secp256k1 plus a PQ
scheme, is valid only if every part verifies. The idea for hybrid signatures came from bitcoincashautist; mainnet_pat
wrote the dispatch design.

## Motivation

Large quantum computers could one day break the elliptic-curve signatures that protect BCH today. This CHIP prepares a
path to quantum-resistant spending without a new address type. Hybrid keys hedge both ways: if either scheme holds,
the coins stay safe.

## What it specifies

- No new opcode and no new output type.
- PQ and hybrid keys spend from ordinary P2PKH outputs that commit to `HASH160(public key)`, so existing address
  tooling keeps working.
- These spends keep [double-spend proof](/glossary#dsproof) coverage, which a script-based PQ vault would have to
  re-earn with extra protocol work.
- Which schemes to enable is a follow-up question. The authors propose starting with SPHINCS+ (hash-based) and the
  hybrid variant while lattice schemes mature.

## Current status

Draft, posted 10 June 2026. Discussion continued into July 2026, including debate about lattice-based versus
hash-based schemes. It is not locked in for any upgrade, and no formal stakeholder statements were found.

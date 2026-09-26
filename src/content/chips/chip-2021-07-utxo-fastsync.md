---
title: "UTXO Fastsync"
code: "CHIP-2021-07"
owners:
  - Josh Green
status: draft
summary: "Proposes a way for nodes to create, share, check and load UTXO-set snapshots over the P2P network, so new nodes can sync in hours instead of replaying the whole chain."
spec: "https://bitcoincashresearch.org/t/chip-2021-07-utxo-fastsync/502"
discussion: "https://bitcoincashresearch.org/t/chip-2021-07-utxo-fastsync/502"
stakeholders: []
verified: 2026-09-26
sources:
  - title: "CHIP 2021-07 UTXO Fastsync (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/chip-2021-07-utxo-fastsync/502"
  - title: "2027 protocol upgrade ideas (Bitcoin Cash Research)"
    url: "https://bitcoincashresearch.org/t/2027-protocol-upgrade-ideas/1719"
---

## Summary

This proposal "defines a method for nodes to generate, distribute, validate, and consume UTXO snapshots via the BCH P2P
network." A new node could download a snapshot of the current [UTXO](/glossary#utxo) set instead of processing every
block since 2009.

It is a peer-services proposal. It does not ask miners to commit to UTXO sets at this time, but it "paves the way to
UTXO commitments in the future if desired."

## Motivation

- Faster setup: the CHIP says new nodes could join "within a couple of hours (or less), instead of the current average
  of 8+ hours."
- Long-term scaling: combined with block pruning, snapshots let BCH keep node costs manageable as the chain grows from
  gigabytes to terabytes.

## What it specifies

How nodes generate snapshots, how peers advertise and transfer them, and how a receiving node validates one before
using it. The original post is the specification (version 0.1.1, July 2021).

## Current status

Draft. Discussion was still active in 2026, including ideas around zero-knowledge proofs for UTXO commitments. The
"2027 protocol upgrade ideas" thread notes a general view that UTXO commitments do not require consensus changes. No formal
stakeholder statements were found.

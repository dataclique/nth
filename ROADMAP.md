# Roadmap

Epics ordered by priority: the first epic is always the next thing to implement.
V1 scope is specified in [SPEC.md](SPEC.md); the standard itself in
[ADR 02](adrs/02-composable-instrument-standard.md).

```mermaid
graph LR
    prop[In-house prop MM onboards]
    v2[V2: risk domains, novation, cross-chain]

    prop --> v2
```

Every v1 layer is built (see the Completed sections below): the kernel, the
reference instruments, the indexer/API, and the SolidJS web UI. The platform is
ready for the in-house prop market maker to onboard as the first market-making
participant — prop capital trades through ordinary margin accounts and the API,
no additional protocol surface required.

## V2: risk domains, novation, cross-chain

V1 must not prevent these; it does not implement them. Each requires its own
threat model before any value moves.

- [ ] explicit multi-market risk domains: opt-in shared collateral and portfolio
      margin; new markets always start isolated
- [ ] checked position novation: liability transfer with recipient consent and
      post-transfer solvency proof
- [ ] cross-chain strategy execution and hedging, preserving permissionless
      participation, non-custodial control, and minimized trust. Candidate
      mechanisms are deliberately non-binding: an Ika dWallet driven by Sui Move
      policy (programmable 2PC-MPC signing), or an external operator trading
      only its own off-protocol capital against an insurance bond posted to the
      Sui vault. The standard reserves executor identity, pending-operation,
      reconciliation, and unavailable-asset states so an asynchronous hedge is
      never credited as settled Sui collateral.

## Beyond V2

- [ ] decentralized, permissionless NAV-attestation / keeper network reducing
      reliance on any single operator or reporter — one possible implementation,
      not a committed architecture; if Ika or another primitive makes
      trust-minimized cross-chain control small and auditable enough, the
      capability may land in v2 without such a network

## Not epic

- [ ] triage the uncommitted GitButler workspace scratch files
      (`contracts/.pool_workspace.move` and friends, `flake.nix`/`flake.lock`
      drift, `scripts/resolve-but-conflicts.sh`)
- [ ] land or close the property-based fuzzing harness
      ([#16](https://github.com/dataclique/nth/pull/16))
- [ ] indexer reconciliation job: periodically compare projected balances
      against authoritative on-chain state and alert on divergence
- [ ] registry audit/oracle disclosure metadata beyond the on-chain instrument
      parameters (source links, audit reports)

## Permanent non-goals

- **AMMs — never.** No passive curve, concentrated-liquidity, or
  instrument-specific AMM as a venue, in any version. Active market-making
  strategies quote into the shared CLOB as ordinary orders.

## Completed: indexer and trading API

The non-custodial platform surface from SPEC.md (`feat/trading-api`): it holds
no keys, and every calculation is informational.

- [x] event indexer: typed decode of every kernel and instrument event, durable
      Postgres log with cursors, replay-on-boot projections (reconciliation
      against on-chain balances is a Not-epic follow-up)
- [x] REST market data: books, trades, candles, funding/carry history, open
      interest, positions
- [x] WebSocket stream of every decoded chain event with market filtering
- [x] transaction-building endpoints returning PTB-shaped call specs for
      client-side signing, including the typed-argument constructor chain
- [x] instrument registry with risk labels and default filtering of unranked
      markets (audit-metadata disclosures are a Not-epic follow-up)
- [x] versioned `/v1` API with a machine-readable schema route

## Completed: SolidJS web UI

The React/dapp-kit scaffold is gone (`feat/solid-web-ui`); wallet integration
uses the framework-agnostic Sui wallet standard and TypeScript SDK.

- [x] replace the Vite+React scaffold with SolidJS; drop `@mysten/dapp-kit`,
      `react-*`, and Radix React dependencies
- [x] wallet connect, margin deposit/withdraw
- [x] market browser with risk labels and opt-in to unranked instruments
- [x] order entry with pre-sign simulation: margin impact, liquidation distance,
      expiry worst case
- [x] positions, margin health, funding/carry history views
- [x] vault deposit/redeem flows with manager policy and fee disclosure

## Completed: reference instruments on the standard

The conformance set proves the standard's range and provides copyable templates
for third-party integrators; the legacy perpetual prototype was dissolved into a
conforming implementation, leaving the kernel generic.

- [x] complete linear perpetual: funding index, margin formulas, oracle
      validation, liquidation via forced settlement
      (`feat/perpetual-instrument`)
- [x] split perp-specific `Order`/`OrderBook`/`Pool` responsibilities into the
      perpetual package; kernel keeps only matching data
      (`feat/perpetual-instrument`)
- [x] European cash-settled option: terminal settlement at expiry, one-time
      value binding (`feat/european-option`)
- [x] American-style option: holder-initiated early exercise on top of the same
      issuance and terminal transitions (`feat/american-option`)
- [x] cliquet option: periodic strike resets composed from maintenance periods,
      carry, and terminal settlement — the exotic-payoff demonstration
      (`feat/cliquet-option`)
- [x] fund/strategy claim: NAV share math, first-depositor defense,
      donation-resistant pricing (`feat/community-vault`)
- [x] community-funded market-making vault: bounded non-custodial manager
      authority, policy limits, fee disclosure (`feat/community-vault`)
- [x] two-external-packages conformance run against one unchanged kernel —
      `perpetual`, `options`, and `funds` are three independent external
      packages whose suites all pass against the same kernel

## Completed: lifecycle kernel

Every lifecycle transition in ADR 02 exists with its conformance tests.

- [x] composable instrument matching kernel with atomic fill obligations
      ([#18](https://github.com/dataclique/nth/pull/18))
- [x] isolated collateral lifecycle (`feat/instrument-collateral`)
- [x] claim issuance and redemption (`feat/instrument-issuance`)
- [x] directed carry transfers (`feat/instrument-carry`)
- [x] terminal settlement: one-time entry and per-position closure, collateral
      release, permissionless bounded reservation cleanup
      (`feat/instrument-terminal`)
- [x] forced settlement: implementation-proven forced close, penalties and
      backstop inside the market silo (`feat/instrument-forced-settlement`)
- [x] permissionless maintenance bookkeeping: sequential one-time periods,
      wall-clock due times, funded capped keeper rewards
      (`feat/instrument-maintenance`)

## Completed: composable instrument standard

- [x] composable instrument standard ADR with threat model, invariants, and
      conformance tests ([#17](https://github.com/dataclique/nth/pull/17))
- [x] six cross-package feasibility spikes against Sui v1.75.1 (external
      witness, atomic obligation, account-bound storage, multiple packages,
      event envelope, shared-object cost)
- [x] project renamed to Nth Market

## Completed: orderbook and margin prototype

- [x] price-time-priority orderbook with typed quantities, capability-gated
      oracle, and staleness-guarded liquidation sweeps (`feat/orderbook`,
      merged)
- [x] margin mechanism docs and risk-kernel property tests
      ([#13](https://github.com/dataclique/nth/pull/13))
- [x] funding-rate payouts with oracle-tethered margin transfers
      ([#15](https://github.com/dataclique/nth/pull/15))

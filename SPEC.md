# Nth Market V1 Specification

Nth Market is a permissionless orderbook protocol for composable financial
instruments on Sui. One reusable matching kernel trades any instrument that
implements the position standard: perpetuals, dated futures, options, fund and
index claims, and community-funded or proprietary market-making strategies.

This document specifies what V1 is and what every consumer of the system can
expect from it. The decision rationale, threat model, STRIDE analysis, and
rejected alternatives live in
[ADR 02](adrs/02-composable-instrument-standard.md); that ADR is the normative
source where the two disagree. V2 and beyond are tracked in
[ROADMAP.md](ROADMAP.md).

## Scope

V1 standardizes:

- one reusable price-time-priority orderbook implementation instantiated per
  market;
- one account-bound net position per margin account and market;
- USDC collateral and quote accounting at the existing \(10^6\) scale;
- atomic trade settlement;
- issuance and redemption;
- directed carry;
- terminal settlement;
- forced settlement and liquidation;
- strictly isolated market collateral;
- permissionless instrument and strategy-vault implementations;
- bounded manager authority for community-funded strategies;
- primitive, immutable event envelopes suitable for indexers.

The conformance set — the six reference instruments that prove the standard's
range — is a fund or strategy claim, a linear perpetual, a European cash-settled
option, an American-style option, a cliquet option, and a community-funded
market-making strategy. The option family is deliberately graded: the European
option exercises terminal settlement, the American option adds holder-initiated
early exercise, and the cliquet composes periodic strike resets from the same
maintenance, carry, and terminal transitions — demonstrating that an exotic
payoff is an instrument-package concern requiring no kernel changes.

## Core model

- **`Market<Instrument>`** — one isolated market instance and one orderbook for
  a fungible unit of exposure. Distinct strikes, expiries, or basket definitions
  are distinct markets.
- **`Order<Instrument>`** — an instruction plus a reservation. The generic book
  owns only matching data: identity, account, side, limit price, quantities,
  price-time priority, and reservation identity.
- **`Position<Instrument>`** — one net, account-bound exposure per margin
  account and market: `Flat`, `Long { size }`, or `Short { size }`. Logically
  bound to the margin-account ID, physically stored in the shared market's keyed
  position table so a later taker can settle a resting maker. No public transfer
  path exists; liability transfer is a future novation, not a `transfer`.
- **Fill obligation** — a non-droppable batch of matched deltas returned by the
  kernel. It owns a private settlement cursor that only the standard's two-sided
  net-position transition advances; the obligation can be consumed only after
  the cursor proves every fill settled. An unconsumed obligation aborts the
  whole transaction.
- **Instrument witness** — a type whose private construction lets the defining
  package invoke lifecycle transitions for its own markets, and only its own.

The orderbook is economically ignorant: it is not an AMM, oracle, valuation
engine, payoff language, or risk model. Instrument packages own contract terms,
margin formulas, oracle selection and validation, carry formulas, terminal
payouts, and liquidation triggers. The standard owns balance arithmetic,
lifecycle state transitions, isolation, and events.

## Lifecycle transitions

The standard provides constrained state and collateral transitions; the
instrument supplies amount, timing, formula, and oracle evidence.

| Transition                 | Kernel surface                           | What the standard enforces                                                              |
| -------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Trade                      | matching kernel + settlement transition  | reservation consumption, both-side updates, post-trade solvency hook, atomicity         |
| Issuance / redemption      | `issue_long_claim` / `redeem_long_claim` | ownership, flat-or-long claim, free ↔ position collateral moves without minting, events |
| Carry                      | `apply_carry`                            | market isolation, positive amount, distinct accounts, conservation, `CarryApplied`      |
| Permissionless maintenance | per-implementation entry points          | action-key idempotence, bounded catch-up, reward only on state advance, funded rewards  |
| Terminal settlement        | terminal transition                      | one-time application, conservation, position closure, terminal finality                 |
| Forced settlement          | forced-close transition                  | market identity, authorized shape, available collateral, exact accounting, events       |

Liquidation is a lifecycle capability, not an orderbook responsibility. There is
no dynamically dispatched `tick`; each implementation exposes explicit
maintenance functions (`settle_funding`, `settle_expiry`, `reconcile_nav`) that
may be permissionless and keeper-rewarded through standard bookkeeping.

## Market isolation

V1 collateral and solvency are isolated per market. No market can debit another
market's collateral, count another market's unrealized profit, or rely on an
offsetting position elsewhere. A faulty or malicious permissionless instrument
is confined to its own collateral silo. The data model reserves an additive path
to explicit risk domains in v2; joining a shared collateral domain must be an
explicit act by that domain.

## Strategy vaults are instruments

A strategy vault is an instrument implementation, not venue infrastructure:
deposits issue a long claim, redemption reduces it against realizable assets,
PnL and fees flow through NAV and carry, distress uses the same terminal and
forced-settlement transitions, and the strategy trades through the same CLOB as
everyone else. The operator's authority is bounded and non-custodial: it can
quote, cancel, rebalance, and trade within on-chain exposure, market, loss,
rate, and withdrawal constraints; it cannot transfer depositor principal to
itself. Prop-market-making systems ("PropAMMs") are active strategies placing
ordinary orders — the venue never embeds an AMM.

## Invariants

Every conforming implementation and kernel transition preserves the thirteen
invariants specified in ADR 02: atomic fills, collateral conservation, market
isolation, single net exposure, reservation coverage, no unrestricted liability
transfer, no negative collateral, one-time periods and terminal actions,
terminal finality, explicit cash-flow sources, bounded manager authority,
bounded work, and observable mutation. The first-failing conformance tests in
ADR 02 are the executable form of this specification.

## Surfaces and UX

The system serves three audiences at three altitudes. Each surface has explicit
UX obligations; permissionless on-chain access is never gated by the layers
above it.

### Protocol level: integrating Move packages

The developer experience of the Move API is the product at this level. A
third-party team must be able to ship an instrument without talking to Nth
Market.

- **Stability**: published Move APIs and event layouts are effectively
  permanent. Public signatures are frozen only after the cross-package
  feasibility spikes, and additive evolution is the only planned change mode.
- **Self-serve conformance**: the conformance test set runs against any external
  implementation. Passing it is the definition of "conforming"; the four
  reference instruments double as copyable templates.
- **Diagnosable failures**: every invalid boundary condition aborts with a
  named, documented abort code — no silent clamping, no generic aborts.
- **Indexable by construction**: every mutation emits primitive, phantom-typed
  events with documented field scale and meaning, BCS fixture tests, and stable
  ordering, so an integrator's indexer needs no Nth Market cooperation.
- **Least ceremony, least authority**: an implementation holds one private
  witness and reaches only standard-owned transitions scoped to its own markets.
  There is nothing else to configure and nothing else it can touch.

### Platform level: trading through the backend API

Market participants — market makers, arbitrageurs, strategy operators, bots —
consume the Rust backend (Rocket on Shuttle, Postgres via sqlx, sui-sdk) as an
indexing and execution-support layer.

- **Non-custodial by construction**: the API never holds keys and cannot move
  funds. It serves data and builds unsigned transactions; participants sign and
  submit with their own keys. Every API calculation is informational and cannot
  authorize settlement.
- **Market data**: orderbook snapshots and deltas, trades, candles, funding and
  carry history, open interest, and per-account positions and balances,
  reconstructed from on-chain events and reconciled against authoritative
  on-chain balances. REST for state, WebSocket streams for books, fills, and
  account updates.
- **Execution support**: transaction-building endpoints for order placement,
  cancellation, deposits, withdrawals, and vault flows, returning PTBs for
  client-side signing — so a participant does not need to hand-roll Move calls
  to trade, but always can.
- **Risk metadata**: an instrument registry carrying source, audit, oracle, and
  disclosure information plus risk labels. The API can label, rank, warn, and
  filter by default; it cannot delist anything from the chain.
- **Operational contract**: versioned endpoints, documented pagination and rate
  limits, machine-readable schemas, and a testnet environment mirroring mainnet.

### User level: discretionary trading in the web UI

The web UI serves users making discretionary decisions with their own wallets.
It is a SolidJS application — the dataclique org no longer uses React, and the
current React scaffold is replaced, not extended. Wallet integration uses the
framework-agnostic Sui wallet-standard and TypeScript SDK rather than the
React-only dapp-kit.

- **Core flows**: connect wallet; deposit and withdraw margin; browse markets
  with risk labels and default filtering; place, amend, and cancel orders;
  monitor positions, margin health, and liquidation distance; follow funding and
  carry history; deposit into and redeem from strategy vaults with the manager's
  policy, bounds, and fees disclosed before signing.
- **Informed consent over gatekeeping**: unaudited or unranked instruments are
  hidden by default and reachable by explicit opt-in with clear warnings. The UI
  simulates outcomes — margin impact, estimated liquidation price, worst case at
  expiry — before the user signs, and shows exactly what the transaction does.
- **Honest state**: every number traces to on-chain state or events; degraded
  states (stale oracle, terminal market, paused vault, pending settlement) are
  surfaced, never papered over.
- **Progressive depth**: a first-time user can buy a vault claim without
  understanding funding cursors; a power user can see reservation-level detail.
  Both drive the same permissionless contracts as any API or Move integrator.

## Permanent non-goal: AMMs

Nth Market will never implement a passive curve, concentrated-liquidity, or
instrument-specific AMM as a venue. Passive AMM designs expose liquidity
providers to loss-versus-rebalancing; active, inventory-aware strategies quoting
into a CLOB have proven tighter spreads. Market-making strategies —
permissionless, proprietary, or community-funded — express liquidity as ordinary
orders through the shared engine.

## Verification

- The first-failing conformance tests in ADR 02 precede production modules and
  define done for each lifecycle slice.
- Every invariant has adversarial coverage: wrong-witness, cross-market,
  double-period, overflow, dust-rounding, and manager-abuse tests.
- All Move tests and `nix flake check` gate every change; the backend gate is
  local `cargo check` / `test` / `clippy`.

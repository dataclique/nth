# Nth Market Architecture

## Overview

Nth Market is a permissionless orderbook protocol for composable financial
instruments. The generic kernel matches orders and owns account-bound net
positions; external instrument packages supply collateral, valuation, carry,
settlement, and liquidation semantics. The perpetual lives in its own
`contracts/perpetual` package built entirely on the standard.

## Module Map

| File                                     | Module                      | Responsibility                                              |
| ---------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| `units/sources/*.move`                   | `units::*`                  | Typed fixed-point quantities and `float_scaling()` ($10^6$) |
| `sources/margin.move`                    | `nth::margin`               | `MarginAccount`: USDC deposits/withdrawals, owner checks    |
| `sources/order.move`                     | `nth::order`                | `Side` enum, `OrderId`                                      |
| `sources/position.move`                  | `nth::position`             | Generic flat/long/short net exposure                        |
| `sources/collateral.move`                | `nth::collateral`           | Market-isolated USDC custody and typed order reservations   |
| `sources/matching.move`                  | `nth::matching`             | Generic CLOB and non-droppable fill/cancel obligations      |
| `sources/maintenance.move`               | `nth::maintenance`          | Keeper-action periods, idempotence, reward caps             |
| `sources/instrument_market.move`         | `nth::instrument_market`    | Market-owned positions and settlement cursor checks         |
| `perpetual/sources/{perp,risk,...}.move` | `perpetual::*`              | Complete linear perpetual reference instrument              |
| `options/sources/{european,...}.move`    | `options::*`                | Option-family reference instruments                         |
| `funds/sources/vault.move`               | `funds::vault`              | Community strategy vault: NAV claims, buyback quoting       |
| `conformance/sources/{linear,...}.move`  | `instrument_conformance::*` | External fixture instruments proving the boundary           |

## Core Components

### Composable Instrument Kernel

An external instrument package defines a privately constructible type witness
and wraps `instrument_market::Market<Instrument>` inside its own shared market
object. The wrapper can add oracle state, expiry, funding indexes, NAV, manager
policy, insurance reserves, or other instrument-specific state without the
kernel importing that package.

Each generic market owns one bounded price-time-priority orderbook and a keyed
table containing at most one net position per margin-account ID. Positions are
logically account-bound but market-owned: a taker transaction cannot include the
address-owned account of every resting maker. The same market owns an isolated
USDC silo with free, order-reserved, and position collateral for each account.
Deposits and withdrawals still require the address-owned account, while fills
consume reservations without it. `Position<Instrument>` has no `key`, no
extraction API, and no independent transfer path.

Matching returns a `FillObligation<Instrument>` with no abilities. The wrapper
can inspect each fill and calculate how much of each side's reservation becomes
position collateral, but only `instrument_market::settle_next_with_collateral`
applies those debits, updates both net positions, and advances the private
cursor. Full fills and cancellations return any unconsumed reserve to free
collateral. `complete` aborts unless every fill advanced. Fill batches are
capped at 32 and each book side at 1,024 resting orders; these are explicit
protocol bounds, not assumptions about transaction gas.

Positive-claim instruments use the same silo through
`instrument_market::issue_long_claim` and `redeem_long_claim`. The instrument
supplies the claim size and collateral amounts; the standard verifies account
ownership, rejects short exposure, moves free ↔ position collateral without
minting or destroying USDC, and emits `ClaimIssued` / `ClaimRedeemed` events.
Issuance requires a positive collateral amount; redemption may release zero
collateral when the instrument reports no realizable assets.

Directed carry uses `instrument_market::apply_carry` to move free or position
collateral between accounts in one market without changing net exposure. The
instrument chooses payer, receiver, amount, period key, and bucket sides; the
standard conserves USDC, rejects zero or self transfers, and emits
`CarryApplied`. Period idempotence stays with the instrument.

Terminal settlement gives every market a one-way end of life. The witness holder
calls `instrument_market::enter_terminal` exactly once; after `MarketTerminated`
the market rejects new orders and claim issuance while cancellation, carry,
terminal settlement, and withdrawal remain available. `settle_terminal_position`
closes one account's exposure — long, short, or a bare position-collateral
balance — and returns all of its position collateral to free collateral,
emitting `PositionSettled`; a second application aborts because nothing remains
to settle. Instruments realize expiry payouts by directing carry between
accounts before settling them, so the standard never computes a payout.
`cancel_terminal_orders` permissionlessly removes up to an explicit bound of
resting orders per call, releasing each reservation to its own order owner, so
keepers can drain the book without owner signatures.

Permissionless maintenance bookkeeping lives in the per-market
`nth::maintenance` schedule. An instrument registers each maintenance action
kind once via `instrument_market::register_maintenance` — wall-clock period
interval, pre-funded reserve account, per-period reward cap — and wraps
`claim_maintenance` around its own state advance so the reward is paid in the
same transaction as the work. Periods apply sequentially and exactly once,
become claimable only at their wall-clock start (past periods catch up
immediately), and pay at most the cap from the reserve's free collateral to a
keeper margin account the transaction sender must own, so payments cannot be
redirected. `ActionRegistered` and `PeriodClaimed` events record kind, period,
keeper, and reward.

Forced settlement uses `instrument_market::force_reduce_position` to shrink or
close an open exposure through an instrument-proven distress path. The reduction
can never flip a position; equality closes to flat, and the released position
collateral returns to the same account's free bucket with a
`PositionForceReduced` event. The transition has no owner check — distress is
involuntary and authority comes from the market-scoped witness — while penalties
and backstop transfers compose through carry so every cash flow names its
source. The trigger proof (margin threshold, oracle evidence) stays in the
implementation, which must abort on a safe position before touching state.

`contracts/conformance` contains independent linear and expiring wrappers that
compile against the public kernel boundary. The expiring wrapper binds its
expiry value exactly once, terminates the kernel market, and settles long/short
pairs through the standard transitions; the linear wrapper liquidates
under-collateralized positions through the forced-settlement transition after
proving its maintenance-margin trigger and paying a keeper penalty via carry.
The full design and remaining lifecycle scope are specified in
[ADR 02](../adrs/02-composable-instrument-standard.md).

### Perpetual reference instrument

`contracts/perpetual` is the complete linear perpetual built on the standard —
the first production-shaped reference instrument, owning everything the kernel
delegates: `perpetual::risk` reimplements the margin, liquidation, and funding
formulas on the shared `units::*` types in u128; `perpetual::oracle` is the
capability-gated mark price with an explicit staleness bound checked before
every funding round and liquidation; `perpetual::funding` adapts
[docs/funding.md](funding.md) to account-bound positions with two cumulative
indexes (`long_pays`, `short_pays` accumulating `mark_price * rate_bps` per
round) plus per-account cursors, because positions live in a table and cannot be
enumerated eagerly on-chain. `perpetual::perp` composes them: placement computes
initial margin from the order's own leverage and reserves it, each fill consumes
margin at each party's leverage while accruing funding and updating a
double-scaled average-entry notional at pre-fill exposure, funding rounds are
permissionless keeper-rewarded maintenance claims that derive the rate from the
live book mid, per-account funding settles lazily through carry against a
pre-funded reserve (payments capped at position collateral, receivables from
reserve free collateral), and liquidation proves the entry-anchored threshold at
a fresh mark before force-reducing the full position with a percent penalty
carried to the keeper.

### Matching engine

Each generic market owns one price-time-priority book per side: bids sorted
highest price first, asks lowest first, each a contiguous `vector` re-sorted
with a stable insertion sort after every append — a deliberate data-structure
choice recorded in
[adrs/01-orderbook-insertion-sort.md](../adrs/01-orderbook-insertion-sort.md).
Matching runs on placement: an incoming order crosses the opposite side in price
priority, **fills execute at the resting (maker) order's price** with an
`OrderFilled` event per match, and any remainder rests. Self-trades abort with
`ESelfMatch`. Every placed order gets a sequential `OrderId` — the cancellation
key that stays unique when one account rests several orders at one price level.
`best_bid_price` / `best_ask_price` views expose the front of each side so
instruments can derive book-relative quantities such as the funding divergence.

### European option reference instrument

`contracts/options` opens the option family with `options::european` — a capped
cash-settled European call. One market is one (strike, expiry, payout cap)
contract; the book trades the option premium. Buyers reserve and pay
`premium * size`, carried to the seller's free collateral on every fill; sellers
escrow `payout_cap * size` as position collateral, which fully collateralizes
the clamped payoff `min(max(S_T - K, 0), cap)` so no liquidation path exists. At
or after expiry anyone binds the settlement value exactly once from a fresh
capability-gated underlying price, which turns the market terminal through the
kernel's one-time transition. Positions then settle permissionlessly and exactly
once each: shorts carry their payoff into a designated settlement-reserve
account, longs draw the same amount out (retrying while the reserve is
unfunded), and the terminal transition releases every remaining balance.

`options::american` reuses the same market mechanics and adds holder-initiated
early exercise: before expiry a long holder exercises any part of its position
at a fresh underlying price against any short it names. The clamped intrinsic
value carries from the assigned short's escrow to the holder, the short's excess
escrow for the exercised size releases pro rata, and both exposures reduce
through the standard's forced-settlement transition — the instrument-defined
trigger is the holder's signature plus a valid assignment rather than distress.

`options::cliquet` is the exotic-payoff demonstration: a ratchet option composed
entirely from existing kernel transitions. Each reset period is a permissionless
keeper-rewarded maintenance round that locks in the clamped gain since the
previous reset and ratchets the strike to the current underlying price; shorts
escrow `periods * local_cap` per unit — the maximum possible accrued payoff — so
the exotic stays fully collateralized. After the final reset the accumulated
payoff binds once and settlement clears through the reserve exactly like the
European option. No kernel change was needed.

### Community strategy vault

`funds::vault` is the fund/strategy-claim and community market-making vault
reference. Deposits issue NAV-priced share claims through the kernel's issuance
transition, with the deposit carried into a treasury keyed by the vault market's
own object ID — an ID no `MarginAccount` can carry, so no withdrawal path exists
for anyone (including the manager) and no public path can credit it, making NAV
donation-resistant by construction. The first deposit locks dead shares against
first-depositor share-price inflation. Shares trade on the vault's own book:
buyers escrow the premium, sellers list only unlisted holdings (a short share is
unrepresentable), and premiums carry buyer → seller per fill. The manager's
authority is a capability bounded by disclosed policy: policy-capped buyback
bids quoted from treasury free collateral through the kernel's witness-gated
instrument-order path, with bought-back shares burned immediately via forced
settlement, accreting NAV per share. The deposit fee and both policy bounds are
fixed and disclosed at creation.

### Mark price and PriceCap (perpetual)

Creating a perpetual market mints a `PriceCap` and returns it to the caller, who
decides where it lives (keep, DAO, multisig). `perp::update_mark_price` requires
the cap and checks it belongs to that market, so only the cap holder can move
the mark price — and with it every liquidation decision. Losing the cap freezes
the mark at its last value; once it is older than the market's staleness bound
(60 seconds), funding rounds and liquidations abort with `EStalePrice`. Custody
is a liveness-critical responsibility — hold the cap in a durable multisig, not
a hot key.

### MarginAccount

A user's collateral account. The struct has `key` but deliberately **not**
`store`: without `store`, `transfer::public_transfer` and embedding in other
modules' structs are impossible, so the only way to place the account at an
address is the module's own `keep`, which transfers it to the transaction
sender. This pins the account to its recorded `owner`, which `deposit` and
`withdraw` verify against the sender (aborting with `ENotOwner` otherwise).

### Units and Risk

Prices, sizes, leverage, and USDC amounts are typed fixed-point quantities
(`units::*`) scaled by $10^6$, matching USDC's 6 decimals. Cross-quantity
arithmetic lives in each instrument's risk module (`perpetual::risk` for the
perp) and runs in `u128`. See [float_scaling.md](float_scaling.md) for encoding
and [margin.md](margin.md) for the financial formulas.

## User Flow (perpetual)

### Account Setup

1. Users create margin accounts (`margin::new` or `margin::new_with_deposit`)
   and keep them at their own address
2. `perp::deposit_collateral` moves USDC into the market's isolated silo as free
   collateral
3. Only the account owner can deposit, withdraw, or place orders

### Order Placement

1. User specifies side, price, size, and leverage
2. `perp::place_limit_order` validates ownership, non-zero price/size, the
   leverage cap, and non-dust margin, then reserves the initial margin
   (`price * size / leverage`) from free collateral
3. The order crosses the opposite side of the book; each fill consumes both
   parties' margin at their own leverage into position collateral, accrues
   funding, and updates average entries — atomically inside the call
4. Any remainder rests on the book under a sequential `OrderId`; cancellation
   releases the unconsumed reservation

### Funding

1. Anyone settles a due round with `perp::settle_funding_round`: the rate comes
   from the live book mid vs a fresh mark price, the paying side's cumulative
   index advances, and the keeper earns a capped reward from the pre-funded
   reserve through the kernel's maintenance bookkeeping
2. Anyone settles an account with `perp::settle_account_funding`: accruals net
   and move through carry against the reserve, payments capped at the payer's
   position collateral

### Liquidation Process

1. The `PriceCap` holder keeps the mark price fresh
2. Anyone calls `perp::liquidate` on an under-collateralized account: the
   entry-anchored threshold is proven at the fresh mark, a percent penalty is
   carried to the keeper, and the position force-closes through the standard's
   forced-settlement transition, releasing the remainder to the liquidated
   account's free collateral with a `PositionLiquidated` event

### Withdrawal Process

1. Cancelling resting orders releases their reservations to free collateral
2. `perp::withdraw_collateral` returns free collateral to the margin account —
   reserved and position collateral cannot leave through this path
3. The user withdraws USDC from their margin account

## Security Features

### Signature-based Security

- All fund movements require the account owner's signature
- Ownership is asserted at every boundary, ensuring only the account owner can
  place orders, deposit, and withdraw
- Distress transitions (liquidation, forced settlement) are deliberately
  involuntary: authority comes from the instrument's private witness scoped to
  its own market, never from a sender check

### Capability-based Administration

- Mark-price updates require the market's `PriceCap` — no hardcoded addresses or
  sender allowlists
- Funding rounds and liquidations abort when the mark price is older than the
  market's staleness bound
- If the `PriceCap` is lost, the mark price freezes and there is no re-issuance
  path; liquidations halt once the frozen price exceeds the staleness window

### Fund Protection

- Collateral is isolated per market in the kernel silo; no market can debit
  another market's collateral
- Position collateral moves only through standard transitions (settlement,
  carry, terminal, forced) — never by direct instrument arithmetic
- `MarginAccount` cannot be transferred or wrapped by external code (no `store`
  ability), so it stays bound to its owner

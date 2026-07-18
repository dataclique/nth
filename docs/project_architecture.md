# Nth Market Architecture

## Overview

Nth Market is a permissionless orderbook protocol for composable financial
instruments. The generic kernel matches orders and owns account-bound net
positions; external instrument packages supply collateral, valuation, carry,
settlement, and liquidation semantics. The older `Pool` path below remains the
perpetual prototype while those economics migrate onto the standard.

## Module Map

| File                             | Module                   | Responsibility                                                      |
| -------------------------------- | ------------------------ | ------------------------------------------------------------------- |
| `units/sources/*.move`           | `units::*`               | Typed fixed-point quantities and `float_scaling()` ($10^6$)         |
| `sources/risk.move`              | `nth::risk`              | Margin, liquidation, and funding formulas, all arithmetic in `u128` |
| `sources/margin.move`            | `nth::margin`            | `MarginAccount`: USDC deposits/withdrawals, owner checks            |
| `sources/order.move`             | `nth::order`             | `Order` struct, `Side` enum, `OrderId`                              |
| `sources/position.move`          | `nth::position`          | Generic flat/long/short net exposure                                |
| `sources/collateral.move`        | `nth::collateral`        | Market-isolated USDC custody and typed order reservations           |
| `sources/matching.move`          | `nth::matching`          | Generic CLOB and non-droppable fill/cancel obligations              |
| `sources/instrument_market.move` | `nth::instrument_market` | Market-owned positions and settlement cursor checks                 |
| `sources/orderbook.move`         | `nth::orderbook`         | CLOB: matching, cancellation, liquidation sweep, events             |
| `sources/pool.move`              | `nth::pool`              | `Pool` + `PriceCap`: entry points tying vault, orderbook, oracle    |
| `sources/vault.move`             | `nth::vault`             | Pooled USDC collateral                                              |
| `sources/oracle.move`            | `nth::oracle`            | Price feed object for a pool                                        |

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

`contracts/conformance` contains independent linear and expiring wrappers that
compile against the public kernel boundary. The full design, lifecycle scope,
and remaining directed-cash-flow conformance work are specified in
[ADR 02](../adrs/02-composable-instrument-standard.md).

### Pool

The Pool is the central component that orchestrates all trading activities for a
specific token. `pool::new` validates the maintenance margin rate
(`0 < rate <= 100`) and **shares** the Pool object: a market must accept orders
from any trader, so every mutation goes through Sui's shared-object consensus
rather than a single owner. The struct carries a `version` field asserted by
every mutator, giving package upgrades an explicit migration path. It serves as
the main interface for:

- Order placement and management (`place_leveraged_order`, `close_position`)
- Fund handling through the vault
- Oracle price updates (`update_price`, gated by `PriceCap`)
- Liquidation sweeps (`check_liquidations`)
- Funding rounds (`update_funding`, permissionless, once per interval)

Order placement validates everything at the boundary before any state changes:
account ownership, non-zero price and size, the leverage cap, and a non-zero
margin (dust notionals whose margin truncates to zero abort with `EZeroMargin`).
Leverage above `100 / maintenance_margin_rate` (or zero leverage) aborts with
`EInvalidLeverage` — above that bound the initial margin is below the
maintenance margin, so the position would be born liquidatable. Margin formulas,
collateral flow, and the leverage cap are in [margin.md](margin.md); liquidation
thresholds are in [liquidation.md](liquidation.md).

Matching enforces self-trade prevention: an incoming order that would cross a
resting order from the same margin account aborts with `ESelfMatch` rather than
filling against it or trading through it.

`update_funding` runs a funding round — margin bookkeeping that tethers the book
to the oracle by moving margin from the side trading away from spot to the other
side. It is permissionless and rate-limited to once per interval
(`EFundingTooSoon`). See [funding.md](funding.md).

### PriceCap

Creating a pool mints a `PriceCap` and returns it to the caller, who decides
where it lives (keep, DAO, multisig). `pool::update_price` requires the cap (and
checks it belongs to that pool), so only the cap holder can move the oracle
price — and with it, every liquidation decision. There is no other production
path to the price.

This is a deliberate trust trade-off. Because the cap is the sole price path,
**losing it freezes the pool's price at its last value**: `update_price` can
never be called again, and there is no re-issuance path (adding one would
reintroduce the admin authority the capability removes). Once the frozen price
is older than `pool::max_oracle_staleness_ms()` (currently one hour), every
`check_liquidations` call aborts with `EStaleOracle` and liquidations halt
entirely — the staleness guard bounds bad liquidations from a frozen price but
cannot substitute for cap custody. Custody is therefore a liveness-critical
responsibility — hold it in a durable multisig, not a hot key.

### OrderBook

The OrderBook maintains the resting orders for a specific token:

- Buy orders (bids), sorted highest price first
- Sell orders (asks), sorted lowest price first

Each side is a contiguous `vector<Order>` re-sorted with a stable insertion sort
after every append — a deliberate data-structure choice recorded in
[adrs/01-orderbook-insertion-sort.md](../adrs/01-orderbook-insertion-sort.md)
(workload, layout, gas model, and the stability that preserves price-time
priority).

The matching engine runs on placement: an incoming order first crosses against
the opposite side of the book, walking resting orders in price priority. A bid
matches asks priced at or below it; an ask matches bids priced at or above it.
**Fills execute at the resting (maker) order's price**, and each fill emits an
`OrderMatched` event. Any unfilled remainder rests on the book.

Every placed order is assigned a sequential `OrderId`, which is the cancellation
key. Unlike an `(account, price)` pair, the id stays unique when one account
rests several orders at the same price level, so each is individually
cancellable.

### Vault

The Vault is responsible for:

- Holding all deposited collateral for a pool
- Processing withdrawals when positions close
- Storing liquidated funds

### Oracle

Each pool owns an Oracle object holding the current price and its last update
time. It is written only through the capability-gated `pool::update_price` and
read by the liquidation sweep. Every update emits a `PriceUpdate` event.

### MarginAccount

A user's collateral account. The struct has `key` but deliberately **not**
`store`: without `store`, `transfer::public_transfer` and embedding in other
modules' structs are impossible, so the only way to place the account at an
address is the module's own `keep`, which transfers it to the transaction
sender. This pins the account to its recorded `owner`, which `deposit` and
`withdraw` verify against the sender (aborting with `ENotOwner` otherwise).

### Units and Risk

Prices, sizes, leverage, and USDC amounts are typed fixed-point quantities
(`units::*`) scaled by $10^6$, matching USDC's 6 decimals. All cross-quantity
arithmetic lives in `nth::risk` and runs in `u128`. See
[float_scaling.md](float_scaling.md) for encoding and [margin.md](margin.md) for
the financial formulas.

## User Flow

### Account Setup

1. Users create margin accounts (`margin::new` or `margin::new_with_deposit`)
   and keep them at their own address
2. Deposit USDC into their margin accounts
3. Only the account owner can deposit to or withdraw from the account

### Order Placement

1. User specifies:
   - Target token (pool)
   - Side (bid or ask)
   - Order size
   - Price
   - Leverage
2. Pool validates the inputs (ownership, non-zero price/size, leverage cap) and
   calculates the required margin (`risk::margin_required`)
3. The margin moves from the user's margin account to the pool's vault
4. The order crosses the opposite side of the book; fills execute at maker
   prices, and any remainder rests on the book
5. The user receives the order's `OrderId` for later cancellation

### Liquidation Process

1. The `PriceCap` holder updates the oracle price
2. `pool::check_liquidations` sweeps the book against the current oracle price,
   using `risk::is_liquidated`
3. Every position past its liquidation threshold is:
   - Removed from the orderbook
   - Reported via a `PositionLiquidated` event
   - Its funds remain in the vault

### Withdrawal Process

1. User closes their position by `OrderId` (`pool::close_position`)
2. The margin backing the unfilled remainder (`risk::refund_for_unfilled`) is
   transferred:
   - From the vault
   - Back to the user's margin account
3. The user withdraws USDC from their margin account

## Security Features

### Signature-based Security

- All fund movements require the account owner's signature
- Ownership is asserted at every boundary, ensuring only the account owner can:
  - Place orders
  - Withdraw funds
  - Close positions

### Capability-based Administration

- Oracle price updates require the pool's `PriceCap` — no hardcoded addresses or
  sender allowlists
- `check_liquidations` aborts when the oracle price is older than
  `pool::max_oracle_staleness_ms()` (currently one hour)
- If the `PriceCap` is lost, `update_price` is permanently disabled for that
  pool — there is no re-issuance path — and liquidation sweeps abort once the
  frozen price exceeds the staleness window

### Fund Protection

- Collateral is always held in the vault while a position is open
- No direct fund movement between users
- `MarginAccount` cannot be transferred or wrapped by external code (no `store`
  ability), so it stays bound to its owner

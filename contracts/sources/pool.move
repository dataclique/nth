module strike::pool;

use strike::oracle::{Self, Oracle};
use strike::order::{Self, Side, OrderId};
use strike::orderbook::{Self, OrderBook};
use strike::risk;
use strike::strike::{Self, MarginAccount};
use strike::units::{Price, Size, Leverage};
use strike::vault::{Self, Vault};
use sui::event;

// === Constants ===

/// Mutators assert this against `Pool.version` so a future package upgrade
/// can migrate shared pools explicitly instead of operating on stale state.
const POOL_VERSION: u64 = 1;

// === Errors ===

const EInsufficientBalance: u64 = 1;
const EInvalidPrice: u64 = 2;
const EInvalidQuantity: u64 = 3;
const EInvalidAccountOwner: u64 = 4;
const EInvalidLeverage: u64 = 5;
const EWrongPool: u64 = 6;
const EInvalidMaintenanceMarginRate: u64 = 7;
const EZeroMargin: u64 = 8;
const EWrongVersion: u64 = 9;

// === Structs ===

/// Shared market object holding the vault, orderbook, and oracle for one
/// trading pair. Shared (not owned) so any trader can submit orders
/// concurrently; Sui serializes the mutations.
public struct Pool has key {
  id: UID,
  version: u64,
  vault: Vault,
  orderbook: OrderBook,
  oracle: Oracle,
  /// Percentage (0..=100] of position notional required as maintenance
  /// margin. Also bounds leverage: max leverage = 100 / rate.
  maintenance_margin_rate: u64,
  funding_rate: u64,
  last_funding_time: u64,
}

/// Capability to update the pool's oracle price. Minted once in `new` and
/// returned to the caller; without it the price — and therefore every
/// liquidation decision — cannot be moved.
public struct PriceCap has key, store {
  id: UID,
  pool_id: ID,
}

// === Events ===

// Events carry primitive fields: their BCS layout is the external
// contract consumed by indexers.

public struct PoolCreated has copy, drop {
  pool_id: ID,
}

public struct PositionOpened has copy, drop {
  pool_id: ID,
  order_id: u64,
  margin_account_id: ID,
  is_bid: bool,
  price: u64,
  size: u64,
  leverage: u64,
  margin: u64,
}

public struct PositionClosed has copy, drop {
  pool_id: ID,
  order_id: u64,
  margin_account_id: ID,
  price: u64,
  is_bid: bool,
  margin: u64,
}

// === Public Functions ===

/// Create and share a pool for one trading pair, returning its `PriceCap`
/// for the caller to keep or delegate. The oracle starts at
/// `initial_price` so liquidation checks are meaningful before the first
/// `update_price`. Aborts with `EInvalidMaintenanceMarginRate` unless
/// `0 < maintenance_margin_rate <= 100` (0 would divide by zero in
/// `risk::max_leverage`; above 100 no leverage satisfies the margin
/// requirement).
public fun new(
  maintenance_margin_rate: u64,
  initial_price: Price,
  ctx: &mut TxContext,
): PriceCap {
  assert!(
    maintenance_margin_rate > 0 && maintenance_margin_rate <= 100,
    EInvalidMaintenanceMarginRate,
  );
  assert!(!initial_price.is_zero(), EInvalidPrice);

  let id = object::new(ctx);
  let vault = vault::empty(ctx);
  let orderbook = orderbook::empty(ctx);
  let mut oracle = oracle::new(ctx);
  oracle::update_price(&mut oracle, initial_price, ctx);

  let pool_id = object::uid_to_inner(&id);
  event::emit(PoolCreated { pool_id });

  transfer::share_object(Pool {
    id,
    version: POOL_VERSION,
    vault,
    orderbook,
    oracle,
    maintenance_margin_rate,
    funding_rate: 0,
    last_funding_time: 0,
  });

  PriceCap { id: object::new(ctx), pool_id }
}

/// Move the oracle price. Capability-gated: liquidations key off this
/// price, so only the `PriceCap` holder may set it. Aborts with
/// `EWrongPool` when the cap belongs to a different pool.
public fun update_price(
  pool: &mut Pool,
  cap: &PriceCap,
  new_price: Price,
  ctx: &TxContext,
) {
  assert_version(pool);
  assert!(cap.pool_id == object::id(pool), EWrongPool);
  assert!(!new_price.is_zero(), EInvalidPrice);
  oracle::update_price(&mut pool.oracle, new_price, ctx);
}

#[test_only]
public fun borrow_orderbook(pool: &Pool): &OrderBook {
  &pool.orderbook
}

#[test_only]
public fun borrow_vault(pool: &Pool): &Vault {
  &pool.vault
}

/// Place a leveraged limit order: charge the margin
/// (`price * size / leverage`, in USDC base units) from the account into
/// the vault, cross the order against the book, and rest any remainder.
/// Returns the assigned order id. Aborts on: foreign account
/// (`EInvalidAccountOwner`), zero price/size, leverage of zero or above
/// `risk::max_leverage` (`EInvalidLeverage`), margin rounding to zero
/// (`EZeroMargin`), or insufficient balance.
public fun place_leveraged_order(
  pool: &mut Pool,
  margin_account: &mut MarginAccount,
  side: Side,
  price: Price,
  size: Size,
  leverage: Leverage,
  ctx: &mut TxContext,
): OrderId {
  assert_version(pool);
  let sender = tx_context::sender(ctx);
  assert!(margin_account.verify_owner(sender), EInvalidAccountOwner);
  assert!(!price.is_zero(), EInvalidPrice);
  assert!(!size.is_zero(), EInvalidQuantity);
  // Above `max_leverage` the initial margin is below the maintenance
  // margin, so the position would be born liquidatable.
  assert!(
    !leverage.is_zero() &&
    leverage.le(risk::max_leverage(pool.maintenance_margin_rate)),
    EInvalidLeverage,
  );

  let required_margin = risk::margin_required(price, size, leverage);
  // Truncation can floor a dust notional to zero margin — never accept
  // an order backed by no collateral.
  assert!(required_margin.value() > 0, EZeroMargin);
  assert!(
    margin_account.balance() >= required_margin.value(),
    EInsufficientBalance,
  );

  // Transfer funds to vault
  let balance = strike::withdraw(
    margin_account,
    required_margin.value(),
    ctx,
  );
  vault::deposit(&mut pool.vault, balance);

  // Create and place order
  let order = order::new(
    object::id(margin_account),
    side,
    price,
    size,
    leverage,
    required_margin,
    ctx,
  );

  let order_id = orderbook::place_limit_order(
    &mut pool.orderbook,
    margin_account,
    order,
  );

  event::emit(PositionOpened {
    pool_id: object::uid_to_inner(&pool.id),
    order_id: order_id.value(),
    margin_account_id: object::id(margin_account),
    is_bid: side.is_bid(),
    price: price.value(),
    size: size.value(),
    leverage: leverage.value(),
    margin: required_margin.value(),
  });

  order_id
}

// TODO: funding-rate payouts (update_funding_rates) — see git history for
// the prototype sketch.

/// Cancel the sender's resting order by id and refund the margin backing
/// its unfilled size from the vault to the margin account. Aborts with
/// `EInvalidAccountOwner` for a foreign account and `EOrderNotFound`
/// (from the orderbook) when the id does not match a resting order of
/// this account on that side.
public fun close_position(
  pool: &mut Pool,
  margin_account: &mut MarginAccount,
  side: Side,
  order_id: OrderId,
  ctx: &mut TxContext,
) {
  assert_version(pool);
  let sender = tx_context::sender(ctx);
  assert!(margin_account.verify_owner(sender), EInvalidAccountOwner);

  let (amount_to_withdraw, price) = orderbook::cancel_order(
    &mut pool.orderbook,
    margin_account,
    side,
    order_id,
    ctx,
  );

  let balance = vault::withdraw(
    &mut pool.vault,
    amount_to_withdraw.value(),
    ctx,
  );

  strike::deposit(margin_account, balance, ctx);

  event::emit(PositionClosed {
    pool_id: object::uid_to_inner(&pool.id),
    order_id: order_id.value(),
    margin_account_id: object::id(margin_account),
    price: price.value(),
    is_bid: side.is_bid(),
    margin: amount_to_withdraw.value(),
  });
}

/// Sweep both book sides once, removing every position past its
/// liquidation threshold at the current oracle price. Anyone may call
/// this; each removal emits `PositionLiquidated`.
///
/// The sweep reads whatever price is in the oracle — there is no
/// staleness guard yet (see `oracle::last_update_time`). Losing the
/// pool's `PriceCap` permanently disables `update_price`; document
/// recovery procedures before mainnet.
public fun check_liquidations(pool: &mut Pool) {
  assert_version(pool);
  let current_price = oracle::price(&pool.oracle);
  let pool_id = object::id(pool);

  orderbook::remove_liquidated_bids(
    &mut pool.orderbook,
    pool.maintenance_margin_rate,
    current_price,
    pool_id,
  );
  orderbook::remove_liquidated_asks(
    &mut pool.orderbook,
    pool.maintenance_margin_rate,
    current_price,
    pool_id,
  );
}

// === Private Functions ===

fun assert_version(pool: &Pool) {
  assert!(pool.version == POOL_VERSION, EWrongVersion);
}

// === Test-Only Functions ===

#[test_only]
/// Imitate an oracle update without threading the PriceCap through tests.
public fun set_token_price(pool: &mut Pool, new_price: Price, ctx: &TxContext) {
  oracle::update_price(&mut pool.oracle, new_price, ctx);
}

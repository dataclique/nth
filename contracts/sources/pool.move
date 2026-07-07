module strike::pool;

use strike::oracle::{Self, Oracle};
use strike::order::{Self, Side, OrderId};
use strike::orderbook::{Self, OrderBook};
use strike::risk;
use strike::strike::{Self, MarginAccount};
use strike::units::{Price, Size, Leverage};
use strike::vault::{Self, Vault};
use sui::event;

// Error constants
const EInsufficientBalance: u64 = 1;
const EInvalidPrice: u64 = 2;
const EInvalidQuantity: u64 = 3;
const EInvalidAccountOwner: u64 = 4;
const EInvalidLeverage: u64 = 5;
const EWrongPool: u64 = 6;

/// Pool holds the vault, orderbook, and oracle for a trading pair
public struct Pool has key, store {
  id: UID,
  vault: Vault,
  orderbook: OrderBook,
  oracle: Oracle,
  maintenance_margin_rate: u64, //percentage of margin required to maintain a position
  funding_rate: u64,
  last_funding_time: u64,
}

/// Capability to update the pool's oracle price. Minted once in `new` for
/// the pool creator; without it the price — and therefore every
/// liquidation decision — cannot be moved.
public struct PriceCap has key, store {
  id: UID,
  pool_id: ID,
}

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
}

/// Create a pool and transfer its `PriceCap` to the sender. The oracle
/// starts at `initial_price` so liquidation checks are meaningful before
/// the first `update_price`.
public fun new(
  maintenance_margin_rate: u64,
  initial_price: Price,
  ctx: &mut TxContext,
): Pool {
  let id = object::new(ctx);
  let vault = vault::empty(ctx);
  let orderbook = orderbook::empty(ctx);
  let mut oracle = oracle::new(ctx);
  oracle::update_price(&mut oracle, initial_price, ctx);

  let pool_id = object::uid_to_inner(&id);
  event::emit(PoolCreated { pool_id });

  transfer::transfer(
    PriceCap { id: object::new(ctx), pool_id },
    tx_context::sender(ctx),
  );

  Pool {
    id,
    vault,
    orderbook,
    oracle,
    maintenance_margin_rate,
    funding_rate: 0,
    last_funding_time: 0,
  }
}

/// Move the oracle price. Capability-gated: liquidations key off this
/// price, so only the `PriceCap` holder may set it.
public fun update_price(
  pool: &mut Pool,
  cap: &PriceCap,
  new_price: Price,
  ctx: &TxContext,
) {
  assert!(cap.pool_id == object::id(pool), EWrongPool);
  oracle::update_price(&mut pool.oracle, new_price, ctx);
}

#[test_only]
public fun get_orderbook(pool: &Pool): &OrderBook {
  &pool.orderbook
}

#[test_only]
public fun get_vault(pool: &Pool): &Vault {
  &pool.vault
}

public fun place_leveraged_order(
  pool: &mut Pool,
  margin_account: &mut MarginAccount,
  side: Side,
  price: Price,
  size: Size,
  leverage: Leverage,
  ctx: &mut TxContext,
): OrderId {
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

public fun close_position(
  pool: &mut Pool,
  margin_account: &mut MarginAccount,
  side: Side,
  order_id: OrderId,
  ctx: &mut TxContext,
) {
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
  });
}

public fun check_liquidations(pool: &mut Pool) {
  let current_price = oracle::get_price(&pool.oracle);
  let pool_id = object::id(pool);
  let orderbook = &mut pool.orderbook;

  // Run until no liquidations are found
  while (
    orderbook::check_and_remove_liquidated_bid(
      orderbook,
      pool.maintenance_margin_rate,
      current_price,
      pool_id,
    )
  ) {};

  while (
    orderbook::check_and_remove_liquidated_ask(
      orderbook,
      pool.maintenance_margin_rate,
      current_price,
      pool_id,
    )
  ) {};
}

#[test_only]
/// Imitate an oracle update without threading the PriceCap through tests.
public fun set_token_price(pool: &mut Pool, new_price: Price, ctx: &TxContext) {
  oracle::update_price(&mut pool.oracle, new_price, ctx);
}

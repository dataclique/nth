module strike::pool;

use strike::constants;
use strike::oracle::{Self, Oracle};
use strike::order;
use strike::orderbook::{Self, OrderBook};
use strike::strike::{Self, MarginAccount};
use strike::vault::{Self, Vault};
use sui::event;

// Error constants
const EInsufficientBalance: u64 = 1;
const EInvalidPrice: u64 = 2;
const EInvalidQuantity: u64 = 3;
const EInvalidAccountOwner: u64 = 4;
const EInvalidLeverage: u64 = 5;

/// Pool holds the vault, orderbook, and oracle for a trading pair
public struct Pool has key, store {
  id: UID,
  vault: Vault,
  orderbook: OrderBook,
  oracle: Oracle,
  maintenance_margin_rate: u64, //percentage of margin required to maintain a position
  current_usdc_price_of_token: u64,
  funding_rate: u64,
  last_funding_time: u64,
}

/// Events
public struct PoolCreated has copy, drop {
  pool_id: ID,
}

public struct PositionOpened has copy, drop {
  pool_id: ID,
  margin_account_id: ID,
  is_bid: bool,
  price: u64,
  size: u64,
  leverage: u64,
  margin: u64,
}

public struct PositionClosed has copy, drop {
  pool_id: ID,
  margin_account_id: ID,
  price: u64,
  is_bid: bool,
}

public struct PositionLiquidated has copy, drop {
  pool_id: ID,
  margin_account_id: ID,
  price: u64,
  is_bid: bool,
}

public fun new(
  maintenance_margin_rate: u64,
  current_usdc_price_of_token: u64,
  ctx: &mut TxContext,
): Pool {
  let id = object::new(ctx);
  let vault = vault::empty(ctx);
  let orderbook = orderbook::empty(ctx);
  let oracle = oracle::new(ctx);

  event::emit(PoolCreated {
    pool_id: object::uid_to_inner(&id),
  });

  Pool {
    id,
    vault,
    orderbook,
    oracle,
    maintenance_margin_rate,
    current_usdc_price_of_token,
    funding_rate: 0,
    last_funding_time: 0,
  }
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
  is_bid: bool,
  price: u64,
  size: u64,
  leverage: u64,
  ctx: &mut TxContext,
) {
  let sender = tx_context::sender(ctx);
  assert!(margin_account.verify_owner(sender), EInvalidAccountOwner);
  assert!(price > 0, EInvalidPrice);
  assert!(size > 0, EInvalidQuantity);
  assert!(
    leverage > 0*constants::float_scaling() && leverage <= 100*constants::float_scaling(),
    EInvalidLeverage,
  );

  // Calculate required margin with fees
  let required_margin = (price * size) / leverage;
  let available_balance = margin_account.balance();
  assert!(available_balance >= required_margin, EInsufficientBalance);

  // Transfer funds to vault
  let balance = strike::withdraw(
    margin_account,
    required_margin,
    ctx,
  );
  vault::deposit(&mut pool.vault, balance);

  // Create and place order
  let order = order::new(
    object::id(margin_account),
    is_bid,
    price,
    size,
    leverage,
    required_margin,
    ctx,
  );

  orderbook::place_limit_order(
    &mut pool.orderbook,
    margin_account,
    order,
  );

  event::emit(PositionOpened {
    pool_id: object::uid_to_inner(&pool.id),
    margin_account_id: object::id(margin_account),
    is_bid,
    price,
    size,
    leverage,
    margin: required_margin,
  });
}

// TODO: make funding rate payouts
// public fun update_funding_rates(pool: &mut Pool, ctx: &mut TxContext) {
//   let current_time = tx_context::epoch_timestamp_ms(ctx);
//   let current_price = oracle::get_price(&pool.oracle);

//   // Calculate time elapsed since last funding
//   let time_elapsed = current_time - pool.last_funding_time;
//   if (time_elapsed < 3600000) {
//     // 1 hour in milliseconds
//     return
//   };

//   // Update funding rate based on price difference
//   let price_diff = if (current_price > pool.last_funding_time) {
//     current_price - pool.last_funding_time
//   } else {
//     pool.last_funding_time - current_price
//   };

//   pool.funding_rate = (price_diff * 100) / current_price; // 1% per hour
//   pool.last_funding_time = current_time;

//   // Update all positions with new funding rate
//   let bids = &mut pool.orderbook.bids;
//   let asks = &mut pool.orderbook.asks;

//   // Update bid positions
//   let i = 0;
//   let len = vector::length(bids);
//   while (i < len) {
//     let bid = vector::borrow_mut(bids, i);
//     let funding_amount = (bid.margin() * pool.funding_rate) / 100;
//     bid.update_margin(bid.margin() - funding_amount);
//     i = i + 1;
//   };

//   // Update ask positions
//   let i = 0;
//   let len = vector::length(asks);
//   while (i < len) {
//     let ask = vector::borrow_mut(asks, i);
//     let funding_amount = (ask.margin() * pool.funding_rate) / 100;
//     ask.update_margin(ask.margin() - funding_amount);
//     i = i + 1;
//   };
// }

public fun close_position(
  pool: &mut Pool,
  margin_account: &mut MarginAccount,
  price: u64,
  is_bid: bool,
  ctx: &mut TxContext,
) {
  let sender = tx_context::sender(ctx);
  assert!(margin_account.verify_owner(sender), EInvalidAccountOwner);

  let amount_to_withdraw = orderbook::cancel_order(
    &mut pool.orderbook,
    margin_account,
    is_bid,
    price,
    ctx,
  );

  let balance = vault::withdraw(
    &mut pool.vault,
    amount_to_withdraw,
    ctx,
  );

  strike::deposit(margin_account, balance, ctx);

  event::emit(PositionClosed {
    pool_id: object::uid_to_inner(&pool.id),
    margin_account_id: object::id(margin_account),
    price,
    is_bid,
  });
}

public fun check_liquidations(pool: &mut Pool) {
  let current_price = pool.current_usdc_price_of_token;
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
// immitate oracle update
public fun set_token_price(pool: &mut Pool, new_price: u64) {
  pool.current_usdc_price_of_token = new_price;
}

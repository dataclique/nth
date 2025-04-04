module strike::orderbook;

use strike::strike::{Self, MarginAccount};
use sui::event;

// TODO: now no freezing coins in margin account while placing orders

// Error codes
const EInsufficientBalance: u64 = 1;
const EInvalidPrice: u64 = 2;
const EInvalidQuantity: u64 = 3;
const EOrderNotFound: u64 = 4;
const EUnauthorized: u64 = 5;
const EInvalidOrderState: u64 = 6;
const EInvalidPosition: u64 = 7;

// Order types
const LIMIT: u8 = 0;
const MARKET: u8 = 1;

public struct Position has store {
  owner: address,
  size: u64, // Position size in base asset
  entry_price: u64, // Average entry price
  is_long: bool, // Long or Short position
  collateral: u64, // Amount of USDC locked as collateral
}

public struct Order has store {
  owner: address,
  is_long: bool,
  order_type: u8,
  price: u64,
  size: u64,
  filled_size: u64,
  collateral: u64,
}

public struct OrderBook has key {
  id: UID,
  bids: vector<Order>, // Buy/Long orders sorted by price (highest first)
  asks: vector<Order>, // Sell/Short orders sorted by price (lowest first)
  positions: vector<Position>,
  min_collateral: u64, // Minimum collateral required to open a position
}

// Events
public struct OrderCreated has copy, drop {
  owner: address,
  is_long: bool,
  order_type: u8,
  price: u64,
  size: u64,
}

public struct PositionOpened has copy, drop {
  owner: address,
  is_long: bool,
  size: u64,
  entry_price: u64,
  collateral: u64,
}

public struct OrderMatched has copy, drop {
  maker_address: address,
  taker_address: address,
  price: u64,
  size: u64,
}

public fun new(min_collateral: u64, ctx: &mut TxContext) {
  let orderbook = OrderBook {
    id: object::new(ctx),
    bids: vector::empty(),
    asks: vector::empty(),
    positions: vector::empty(),
    min_collateral,
  };
  transfer::share_object(orderbook);
}

public fun place_limit_order(
  orderbook: &mut OrderBook,
  margin_account: &mut MarginAccount,
  is_long: bool,
  price: u64,
  size: u64,
  ctx: &mut TxContext,
) {
  assert!(price > 0, EInvalidPrice);
  assert!(size > 0, EInvalidQuantity);

  // Calculate required collateral (simple version for now)
  let required_collateral = if (is_long) {
    // For longs, we need price * size as collateral
    price * size
  } else {
    // For shorts, we need size as collateral (simplified)
    size
  };

  assert!(
    required_collateral >= orderbook.min_collateral,
    EInsufficientBalance,
  );
  assert!(
    strike::balance(margin_account) >= required_collateral,
    EInsufficientBalance,
  );

  let order = Order {
    owner: tx_context::sender(ctx),
    is_long,
    order_type: LIMIT,
    price,
    size,
    filled_size: 0,
    collateral: required_collateral,
  };

  // Add order to the appropriate vector and sort
  if (is_long) {
    vector::push_back(&mut orderbook.bids, order);
    sort_bids(&mut orderbook.bids);
  } else {
    vector::push_back(&mut orderbook.asks, order);
    sort_asks(&mut orderbook.asks);
  };

  event::emit(OrderCreated {
    owner: tx_context::sender(ctx),
    is_long,
    order_type: LIMIT,
    price,
    size,
  });
}

public fun place_market_order(
  orderbook: &mut OrderBook,
  margin_account: &mut MarginAccount,
  is_long: bool,
  size: u64,
  ctx: &mut TxContext,
) {
  assert!(size > 0, EInvalidQuantity);
  let sender = tx_context::sender(ctx);
  let mut remaining_size = size;

  // Calculate and verify initial margin requirement
  let initial_margin = if (is_long) {
    // For market buys, we use the best ask price as estimate
    if (!vector::is_empty(&orderbook.asks)) {
      let best_ask = vector::borrow(&orderbook.asks, 0);
      best_ask.price * size
    } else {
      abort EInvalidOrderState
    }
  } else {
    // For market sells, we use size as collateral (simplified)
    size
  };

  assert!(
    strike::balance(margin_account) >= initial_margin,
    EInsufficientBalance,
  );
  let _margin_account = margin_account; // Use margin_account to satisfy compiler

  // Match against existing orders
  if (is_long) {
    // Market buy order matches with asks (sells)
    while (remaining_size > 0 && !vector::is_empty(&orderbook.asks)) {
      // Get the best ask order details first
      let best_ask_owner = vector::borrow(&orderbook.asks, 0).owner;
      let best_ask_price = vector::borrow(&orderbook.asks, 0).price;
      let best_ask_size = vector::borrow(&orderbook.asks, 0).size;

      let match_size = if (remaining_size >= best_ask_size) {
        best_ask_size
      } else {
        remaining_size
      };

      // Update positions
      update_position(
        orderbook,
        best_ask_owner,
        best_ask_price,
        match_size,
        false,
      ); // Maker is selling
      update_position(
        orderbook,
        sender,
        best_ask_price,
        match_size,
        true,
      ); // Taker is buying

      event::emit(OrderMatched {
        maker_address: best_ask_owner,
        taker_address: sender,
        price: best_ask_price,
        size: match_size,
      });

      remaining_size = remaining_size - match_size;

      // Remove or update the matched order
      if (match_size == best_ask_size) {
        // Remove the entire order
        let removed_order = vector::remove(&mut orderbook.asks, 0);
        // We need to use the removed order to satisfy the compiler
        let Order { size: removed_size, .. } = removed_order;
        assert!(removed_size == best_ask_size, EInvalidOrderState);
      } else {
        let order = vector::borrow_mut(&mut orderbook.asks, 0);
        order.size = order.size - match_size;
      };
    };
  } else {
    // Market sell order matches with bids (buys)
    while (remaining_size > 0 && !vector::is_empty(&orderbook.bids)) {
      // Get the best bid order details first
      let best_bid_owner = vector::borrow(&orderbook.bids, 0).owner;
      let best_bid_price = vector::borrow(&orderbook.bids, 0).price;
      let best_bid_size = vector::borrow(&orderbook.bids, 0).size;

      let match_size = if (remaining_size >= best_bid_size) {
        best_bid_size
      } else {
        remaining_size
      };

      // Update positions
      update_position(
        orderbook,
        best_bid_owner,
        best_bid_price,
        match_size,
        true,
      ); // Maker is buying
      update_position(
        orderbook,
        sender,
        best_bid_price,
        match_size,
        false,
      ); // Taker is selling

      event::emit(OrderMatched {
        maker_address: best_bid_owner,
        taker_address: sender,
        price: best_bid_price,
        size: match_size,
      });

      remaining_size = remaining_size - match_size;

      // Remove or update the matched order
      if (match_size == best_bid_size) {
        // Remove the entire order
        let removed_order = vector::remove(&mut orderbook.bids, 0);
        // We need to use the removed order to satisfy the compiler
        let Order { size: removed_size, .. } = removed_order;
        assert!(removed_size == best_bid_size, EInvalidOrderState);
      } else {
        let order = vector::borrow_mut(&mut orderbook.bids, 0);
        order.size = order.size - match_size;
      };
    };
  };

  assert!(remaining_size == 0, EInvalidOrderState); // Ensure the entire order was filled
}

fun update_position(
  orderbook: &mut OrderBook,
  owner: address,
  price: u64,
  size: u64,
  is_long: bool,
) {
  let mut i = 0;
  let mut found = false;
  let len = vector::length(&orderbook.positions);

  while (i < len) {
    let position = vector::borrow_mut(&mut orderbook.positions, i);
    if (position.owner == owner && position.is_long == is_long) {
      // Update existing position
      let new_size = position.size + size;
      position.entry_price =
        ((position.entry_price * position.size) + (price * size)) / new_size;
      position.size = new_size;
      found = true;
      break
    };
    i = i + 1;
  };

  if (!found) {
    // Create new position
    let position = Position {
      owner,
      size,
      entry_price: price,
      is_long,
      collateral: price * size, // Simplified collateral calculation
    };
    vector::push_back(&mut orderbook.positions, position);

    event::emit(PositionOpened {
      owner,
      is_long,
      size,
      entry_price: price,
      collateral: price * size,
    });
  };
}

fun sort_bids(bids: &mut vector<Order>) {
  let mut i = 0;
  let len = vector::length(bids);
  while (i < len) {
    let mut j = i + 1;
    while (j < len) {
      let order_i = vector::borrow(bids, i);
      let order_j = vector::borrow(bids, j);
      if (order_j.price > order_i.price) {
        vector::swap(bids, i, j);
      };
      j = j + 1;
    };
    i = i + 1;
  };
}

fun sort_asks(asks: &mut vector<Order>) {
  let mut i = 0;
  let len = vector::length(asks);
  while (i < len) {
    let mut j = i + 1;
    while (j < len) {
      let order_i = vector::borrow(asks, i);
      let order_j = vector::borrow(asks, j);
      if (order_j.price < order_i.price) {
        vector::swap(asks, i, j);
      };
      j = j + 1;
    };
    i = i + 1;
  };
}

// View functions
public fun get_best_bid(orderbook: &OrderBook): (u64, u64) {
  if (vector::is_empty(&orderbook.bids)) {
    (0, 0)
  } else {
    let best_bid = vector::borrow(&orderbook.bids, 0);
    (best_bid.price, best_bid.size)
  }
}

public fun get_best_ask(orderbook: &OrderBook): (u64, u64) {
  if (vector::is_empty(&orderbook.asks)) {
    (0, 0)
  } else {
    let best_ask = vector::borrow(&orderbook.asks, 0);
    (best_ask.price, best_ask.size)
  }
}

public fun get_position(
  orderbook: &OrderBook,
  owner: address,
  is_long: bool,
): (u64, u64, u64) {
  let mut i = 0;
  let len = vector::length(&orderbook.positions);
  let mut size: u64 = 0;
  let mut entry_price: u64 = 0;
  let mut collateral: u64 = 0;

  while (i < len) {
    let position = vector::borrow(&orderbook.positions, i);
    if (position.owner == owner && position.is_long == is_long) {
      size = position.size;
      entry_price = position.entry_price;
      collateral = position.collateral;
      break
    };
    i = i + 1;
  };
  (size, entry_price, collateral)
}

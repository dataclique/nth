module strike::orderbook;

use strike::order::{Self, Order};
use strike::pool;
use strike::strike::{Self, MarginAccount};
use sui::balance::{Self, Balance};
use sui::coin::{Self as CoinModule, Coin};
use sui::event;

// Error codes
const EInsufficientBalance: u64 = 1;
const EInvalidPrice: u64 = 2;
const EInvalidQuantity: u64 = 3;
const EOrderNotFound: u64 = 4;
const EUnauthorized: u64 = 5;
const EInvalidOrderState: u64 = 6;
const EInvalidPosition: u64 = 7;
const EInvalidAccountOwner: u64 = 8;

// Order side
const LONG: bool = true;
const SHORT: bool = false;

// Order types
const LIMIT: u8 = 0;
const MARKET: u8 = 1;

// Order status
const OPEN: u8 = 0;
const FILLED: u8 = 1;
const CANCELLED: u8 = 2;
const PARTIALLY_FILLED: u8 = 3;

public struct Position has drop, store {
  owner: address,
  price: u64,
  size: u64, // Position size in base asset
  entry_price: u64, // Average entry price
  is_long: bool, // Long or Short position
}

public struct OrderBook has key, store {
  id: UID,
  bids: vector<Order>, // Buy/Long orders sorted by price (highest first)
  asks: vector<Order>, // Sell/Short orders sorted by price (lowest first)
  positions: vector<Position>,
  // accounts: Table<ID, Account>,
}

// one account for each user stores their orders
// public struct Account has copy, drop, store {
//   orders_id: vector<ID>,
// }

public struct PositionOpened has copy, drop {
  margin_account_id: ID,
  is_long: bool,
  size: u64,
  entry_price: u64,
  collateral: u64,
}

public struct OrderMatched has copy, drop {
  maker_margin_account_id: ID,
  taker_margin_account_id: ID,
  price: u64,
  size: u64,
}

public struct OrderCreated has copy, drop {
  margin_account_id: ID,
  is_bid: bool,
  order_type: u8,
  price: u64,
  size: u64,
}

public fun empty(ctx: &mut TxContext): OrderBook {
  OrderBook {
    id: object::new(ctx),
    bids: vector::empty(),
    asks: vector::empty(),
    positions: vector::empty(),
    // accounts: table::new(ctx),
  }
}

public fun place_limit_order(
  orderbook: &mut OrderBook,
  margin_account: &mut MarginAccount,
  order: Order,
  ctx: &mut TxContext,
) {
  let margin_account_id = object::id(margin_account);

  let remaining_size = match_against_book(
    orderbook,
    margin_account,
    order,
    ctx,
  );

  if (remaining_size == 0) {
    return
  };
  event::emit(OrderCreated {
    margin_account_id,
    is_bid: order.is_bid(),
    order_type: LIMIT,
    price: order.price(),
    size: order.size(),
  });

  if (order.is_bid()) {
    vector::push_back(&mut orderbook.bids, order);
    sort_bids(&mut orderbook.bids);
  } else {
    vector::push_back(&mut orderbook.asks, order);
    sort_asks(&mut orderbook.asks);
  };
}

// public fun cancel_order(
//   orderbook: &mut OrderBook,
//   margin_account: &MarginAccount,
//   is_bid: bool,
//   price: u64,
//   ctx: &mut TxContext,
// ) {
//   let sender = tx_context::sender(ctx);
//   assert!(sender == margin_account.owner(), EInvalidAccountOwner);

//   let margin_account_id = object::id(margin_account);
//   let mut i = 0;
//   let mut found = false;
//   let mut order_index = 0;

//   let orders = if (is_bid) {
//     &mut orderbook.bids
//   } else {
//     &mut orderbook.asks
//   };

//   let len = vector::length(orders);
//   while (i < len) {
//     let order = vector::borrow(orders, i);
//     if (order.margin_account_id == margin_account_id && order.price == price) {
//       found = true;
//       order_index = i;
//       break
//     };
//     i = i + 1;
//   };

//   assert!(found, EOrderNotFound);
//   vector::remove(orders, order_index);

//   event::emit(OrderCanceled {
//     margin_account_id,
//     is_bid,
//     order_type: LIMIT,
//     price,
//   });
// }

// public fun place_market_order(
//   orderbook: &mut OrderBook,
//   margin_account: &mut MarginAccount,
//   is_long: bool,
//   size: u64,
//   ctx: &mut TxContext,
// ) {
//   assert!(size > 0, EInvalidQuantity);
//   let sender = tx_context::sender(ctx);
//   let mut remaining_size = size;

//   // Calculate and verify initial margin requirement
//   let initial_margin = if (is_long) {
//     // For market buys, we use the best ask price as estimate
//     if (!vector::is_empty(&orderbook.asks)) {
//       let best_ask = vector::borrow(&orderbook.asks, 0);
//       best_ask.price * size
//     } else {
//       abort EInvalidOrderState
//     }
//   } else {
//     // For market sells, we use size as collateral (simplified)
//     size
//   };

//   let available_balance = get_available_balance(orderbook, margin_account);
//   assert!(available_balance >= initial_margin, EInsufficientBalance);

//   // Lock the required collateral
//   lock_balance(orderbook, sender, initial_margin);

//   event::emit(BalanceLocked {
//     owner: sender,
//     amount: initial_margin,
//   });

//   // Match against existing orders
//   if (is_long) {
//     // Market buy order matches with asks (sells)
//     while (remaining_size > 0 && !vector::is_empty(&orderbook.asks)) {
//       // Get the best ask order details first
//       let best_ask_margin_account_id = vector::borrow(
//         &orderbook.asks,
//         0,
//       ).margin_account_id;
//       let best_ask_price = vector::borrow(&orderbook.asks, 0).price;
//       let best_ask_size = vector::borrow(&orderbook.asks, 0).size;

//       let match_size = if (remaining_size >= best_ask_size) {
//         best_ask_size
//       } else {
//         remaining_size
//       };

//       // Update positions
//       update_position(
//         orderbook,
//         best_ask_margin_account_id,
//         best_ask_price,
//         match_size,
//         false,
//       ); // Maker is selling
//       update_position(
//         orderbook,
//         sender,
//         best_ask_price,
//         match_size,
//         true,
//       ); // Taker is buying

//       event::emit(OrderMatched {
//         maker_address: best_ask_margin_account_id,
//         taker_address: sender,
//         price: best_ask_price,
//         size: match_size,
//       });

//       remaining_size = remaining_size - match_size;

//       // Remove or update the matched order
//       if (match_size == best_ask_size) {
//         // Remove the entire order
//         let removed_order = vector::remove(&mut orderbook.asks, 0);
//         // Store the values we need before destructuring
//         let order_margin_account_id = removed_order.margin_account_id;
//         let order_collateral = removed_order.collateral;
//         // Use the removed order to satisfy the compiler
//         let Order { status, .. } = removed_order;
//         assert!(status == OPEN, EInvalidOrderState);

//         // Unlock the maker's balance
//         unlock_balance(orderbook, order_margin_account_id, order_collateral);

//         event::emit(BalanceUnlocked {
//           owner: order_margin_account_id,
//           amount: order_collateral,
//         });
//       } else {
//         let order = vector::borrow_mut(&mut orderbook.asks, 0);
//         let original_size = order.size;
//         let order_margin_account_id = order.margin_account_id;
//         let order_collateral = order.collateral;
//         order.size = order.size - match_size;

//         // Partially unlock the maker's balance
//         let unlocked_amount = (order_collateral * match_size) / original_size;
//         unlock_balance(orderbook, order_margin_account_id, unlocked_amount);

//         event::emit(BalanceUnlocked {
//           margin_account_id: order_margin_account_id,
//           amount: unlocked_amount,
//         });
//       };
//     };
//   } else {
//     // Market sell order matches with bids (buys)
//     while (remaining_size > 0 && !vector::is_empty(&orderbook.bids)) {
//       // Get the best bid order details first
//       let best_bid_margin_account_id = vector::borrow(
//         &orderbook.bids,
//         0,
//       ).margin_account_id;
//       let best_bid_price = vector::borrow(&orderbook.bids, 0).price;
//       let best_bid_size = vector::borrow(&orderbook.bids, 0).size;

//       let match_size = if (remaining_size >= best_bid_size) {
//         best_bid_size
//       } else {
//         remaining_size
//       };

//       // Update positions
//       update_position(
//         orderbook,
//         best_bid_margin_account_id,
//         best_bid_price,
//         match_size,
//         true,
//       ); // Maker is buying
//       update_position(
//         orderbook,
//         sender,
//         best_bid_price,
//         match_size,
//         false,
//       ); // Taker is selling

//       event::emit(OrderMatched {
//         maker_margin_account_id: best_bid_margin_account_id,
//         taker_margin_account_id: sender,
//         price: best_bid_price,
//         size: match_size,
//       });

//       remaining_size = remaining_size - match_size;

//       // Remove or update the matched order
//       if (match_size == best_bid_size) {
//         // Remove the entire order
//         let removed_order = vector::remove(&mut orderbook.bids, 0);
//         // Store the values we need before destructuring
//         let order_margin_account_id = removed_order.margin_account_id;
//         let order_collateral = removed_order.collateral;
//         // Use the removed order to satisfy the compiler
//         let Order { status, .. } = removed_order;
//         assert!(status == OPEN, EInvalidOrderState);

//         // Unlock the maker's balance
//         unlock_balance(orderbook, order_margin_account_id, order_collateral);

//         event::emit(BalanceUnlocked {
//           margin_account_id: order_margin_account_id,
//           amount: order_collateral,
//         });
//       } else {
//         let order = vector::borrow_mut(&mut orderbook.bids, 0);
//         let original_size = order.size;
//         let order_margin_account_id = order.margin_account_id;
//         let order_collateral = order.collateral;
//         order.size = order.size - match_size;

//         // Partially unlock the maker's balance
//         let unlocked_amount = (order_collateral * match_size) / original_size;
//         unlock_balance(orderbook, order_margin_account_id, unlocked_amount);

//         event::emit(BalanceUnlocked {
//           margin_account_id: order_margin_account_id,
//           amount: unlocked_amount,
//         });
//       };
//     };
//   };

//   assert!(remaining_size == 0, EInvalidOrderState); // Ensure the entire order was filled

//   // Unlock any remaining balance for the market order
//   unlock_balance(orderbook, sender, initial_margin);

//   event::emit(BalanceUnlocked {
//     owner: sender,
//     amount: initial_margin,
//   });
// }

// fun update_position(
//   orderbook: &mut OrderBook,
//   margin_account_id: ID,
//   price: u64,
//   size: u64,
//   is_long: bool,
// ) {
//   let mut i = 0;
//   let mut found = false;
//   let len = vector::length(&orderbook.positions);

//   while (i < len) {
//     let position = vector::borrow_mut(&mut orderbook.positions, i);
//     if (
//       position.margin_account_id == margin_account_id && position.is_long == is_long
//     ) {
//       // Update existing position
//       let new_size = position.size + size;
//       position.entry_price =
//         ((position.entry_price * position.size) + (price * size)) / new_size;
//       position.size = new_size;
//       found = true;
//       break
//     };
//     i = i + 1;
//   };

//   if (!found) {
//     // Create new position
//     let position = Position {
//       margin_account_id,
//       size,
//       entry_price: price,
//       is_long,
//       collateral: price * size, // Simplified collateral calculation
//     };
//     vector::push_back(&mut orderbook.positions, position);

//     event::emit(PositionOpened {
//       margin_account_id,
//       is_long,
//       size,
//       entry_price: price,
//       collateral: price * size,
//     });
//   };
// }

fun sort_bids(bids: &mut vector<Order>) {
  let mut i = 0;
  let len = vector::length(bids);
  while (i < len) {
    let mut j = i + 1;
    while (j < len) {
      let order_i = vector::borrow(bids, i);
      let order_j = vector::borrow(bids, j);
      if (order_j.price() > order_i.price()) {
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
      if (order_j.price() < order_i.price()) {
        vector::swap(asks, i, j);
      };
      j = j + 1;
    };
    i = i + 1;
  };
}

public fun get_best_bid(orderbook: &OrderBook): (u64, u64) {
  if (vector::is_empty(&orderbook.bids)) {
    (0, 0)
  } else {
    let best_bid = vector::borrow(&orderbook.bids, 0);
    (best_bid.price(), best_bid.size())
  }
}

public fun get_best_ask(orderbook: &OrderBook): (u64, u64) {
  if (vector::is_empty(&orderbook.asks)) {
    (0, 0)
  } else {
    let best_ask = vector::borrow(&orderbook.asks, 0);
    (best_ask.price(), best_ask.size())
  }
}

// public fun get_position(
//   orderbook: &OrderBook,
//   owner: address,
//   is_long: bool,
// ): (u64, u64, u64) {
//   let mut i = 0;
//   let len = vector::length(&orderbook.positions);
//   let mut size: u64 = 0;
//   let mut entry_price: u64 = 0;
//   let mut collateral: u64 = 0;

//   while (i < len) {
//     let position = vector::borrow(&orderbook.positions, i);
//     if (position.owner == owner && position.is_long == is_long) {
//       size = position.size;
//       entry_price = position.entry_price;
//       collateral = position.collateral;
//       break
//     };
//     i = i + 1;
//   };
//   (size, entry_price, collateral)
// }

public fun get_bids_length(orderbook: &OrderBook): u64 {
  vector::length(&orderbook.bids)
}

public fun get_asks_length(orderbook: &OrderBook): u64 {
  vector::length(&orderbook.asks)
}

public fun get_bid(orderbook: &OrderBook, index: u64): &Order {
  vector::borrow(&orderbook.bids, index)
}

public fun get_ask(orderbook: &OrderBook, index: u64): &Order {
  vector::borrow(&orderbook.asks, index)
}

public fun match_against_book(
  orderbook: &mut OrderBook,
  margin_account: &mut MarginAccount,
  order: &Order,
  ctx: &mut TxContext,
) {}

// fun remove_order(orderbook: &mut OrderBook, order_id: ID) {
//   let mut i = 0;
//   let mut found = false;
//   let mut order_index = 0;
//   let mut is_bid = false;

//   // Search in bids
//   let bids_len = vector::length(&orderbook.bids);
//   while (i < bids_len) {
//     let order = vector::borrow(&orderbook.bids, i);
//     if (order.margin_account_id == order_id) {
//       found = true;
//       order_index = i;
//       is_bid = true;
//       break
//     };
//     i = i + 1;
//   };

//   // If not found in bids, search in asks
//   if (!found) {
//     i = 0;
//     let asks_len = vector::length(&orderbook.asks);
//     while (i < asks_len) {
//       let order = vector::borrow(&orderbook.asks, i);
//       if (order.margin_account_id == order_id) {
//         found = true;
//         order_index = i;
//         is_bid = false;
//         break
//       };
//       i = i + 1;
//     };
//   };

//   assert!(found, EOrderNotFound);

//   if (is_bid) {
//     vector::remove(&mut orderbook.bids, order_index);
//   } else {
//     vector::remove(&mut orderbook.asks, order_index);
//   };
// }

module strike::orderbook;

use strike::constants;
use strike::order::Order;
use strike::strike::MarginAccount;
use sui::event;

// Error codes
const EOrderNotFound: u64 = 1;
const EInvalidAccountOwner: u64 = 2;

public struct OrderBook has key, store {
  id: UID,
  bids: vector<Order>, // Buy/Long orders sorted by price (highest first)
  asks: vector<Order>, // Sell/Short orders sorted by price (lowest first)
}

public struct OrderCreated has copy, drop {
  margin_account_id: ID,
  is_bid: bool,
  price: u64,
  size: u64,
}

public struct OrderCanceled has copy, drop {
  margin_account_id: ID,
  is_bid: bool,
  price: u64,
}

public struct PositionLiquidated has copy, drop {
  pool_id: object::ID,
  margin_account_id: object::ID,
  price: u64,
  is_bid: bool,
}

public(package) fun empty(ctx: &mut TxContext): OrderBook {
  OrderBook {
    id: object::new(ctx),
    bids: vector::empty(),
    asks: vector::empty(),
  }
}

public(package) fun place_limit_order(
  orderbook: &mut OrderBook,
  margin_account: &MarginAccount,
  mut order: Order,
) {
  let margin_account_id = object::id(margin_account);

  // TODO: make match_against_book
  let remaining_size = order.size();
  // let remaining_size = match_against_book(
  //   orderbook,
  //   margin_account,
  //   &order,
  // );

  // if (remaining_size == 0) {
  //   return
  // };

  let filled_size = order.size() - remaining_size;
  order.set_filled_size(filled_size);

  event::emit(OrderCreated {
    margin_account_id,
    is_bid: order.is_bid(),
    price: order.price(),
    size: remaining_size,
  });

  if (order.is_bid()) {
    vector::push_back(&mut orderbook.bids, order);
    sort_bids(&mut orderbook.bids);
  } else {
    vector::push_back(&mut orderbook.asks, order);
    sort_asks(&mut orderbook.asks);
  };
}

// Cancel order by price of exact margin account
public(package) fun cancel_order(
  orderbook: &mut OrderBook,
  margin_account: &MarginAccount,
  is_bid: bool,
  price: u64,
  ctx: &TxContext,
): u64 {
  let sender = tx_context::sender(ctx);
  assert!(margin_account.verify_owner(sender), EInvalidAccountOwner);

  let margin_account_id = object::id(margin_account);
  let mut i = 0;
  let mut found = false;
  let mut order_index = 0;
  let mut amount_to_withdraw = 0;

  let orders = if (is_bid) {
    &mut orderbook.bids
  } else {
    &mut orderbook.asks
  };

  let len = vector::length(orders);
  while (i < len) {
    let order = vector::borrow(orders, i);
    if (
      order.margin_account_id() == margin_account_id && order.price() == price
    ) {
      found = true;
      order_index = i;
      amount_to_withdraw = calculate_amount_to_withdraw(order);
      break
    };
    i = i + 1;
  };

  assert!(found, EOrderNotFound);
  vector::remove(orders, order_index);

  event::emit(OrderCanceled {
    margin_account_id,
    is_bid,
    price,
  });

  amount_to_withdraw
}

public(package) fun calculate_amount_to_withdraw(order: &Order): u64 {
  ((order.size() - order.filled_size())*order.price())/order.leverage()
}

public(package) fun sort_bids(bids: &mut vector<Order>) {
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

public(package) fun sort_asks(asks: &mut vector<Order>) {
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

public(package) fun get_best_bid(orderbook: &OrderBook): (u64, u64) {
  if (vector::is_empty(&orderbook.bids)) {
    (0, 0)
  } else {
    let best_bid = vector::borrow(&orderbook.bids, 0);
    (best_bid.price(), best_bid.size())
  }
}

public(package) fun get_best_ask(orderbook: &OrderBook): (u64, u64) {
  if (vector::is_empty(&orderbook.asks)) {
    (0, 0)
  } else {
    let best_ask = vector::borrow(&orderbook.asks, 0);
    (best_ask.price(), best_ask.size())
  }
}

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

// fun match_against_book(
//   orderbook: &mut OrderBook,
//   margin_account: &mut MarginAccount,
//   order: &Order,
// ): u64 {
//   let mut remaining_size = order.size();
//   debug::print(&b"Initial order size: ");
//   debug::print(&remaining_size);
//   let mut matched = false;

//   if (order.is_bid()) {
//     // For bid orders, match against asks (sell orders)
//     let mut i = 0;
//     let len = vector::length(&orderbook.asks);
//     while (i < len && remaining_size > 0) {
//       let ask_order = vector::borrow_mut(&mut orderbook.asks, i);
//       debug::print(&b"Checking ask order - price: ");
//       debug::print(&ask_order.price());
//       debug::print(&b" size: ");
//       debug::print(&ask_order.size());

//       if (order.price() <= ask_order.price()) {
//         let match_size = if (remaining_size >= ask_order.size()) {
//           ask_order.size()
//         } else {
//           remaining_size
//         };

//         debug::print(&b"Match found! Size: ");
//         debug::print(&match_size);

//         // Update filled sizes
//         let filled_size = ask_order.filled_size();
//         ask_order.set_filled_size(filled_size + match_size);
//         remaining_size = remaining_size - match_size;
//         matched = true;

//         // If ask order is fully filled, remove it
//         if (ask_order.filled_size() == ask_order.size()) {
//           vector::remove(&mut orderbook.asks, i);
//         } else {
//           i = i + 1;
//         };
//       } else {
//         break
//       };
//     };
//   } else {
//     // For ask orders, match against bids (buy orders)
//     let mut i = 0;
//     let len = get_bids_length(orderbook);
//     while (i < len && remaining_size > 0) {
//       let bid_order = vector::borrow_mut(&mut orderbook.bids, i);
//       debug::print(&b"Checking bid order - price: ");
//       debug::print(&bid_order.price());
//       debug::print(&b" size: ");
//       debug::print(&bid_order.size());

//       if (order.price() <= bid_order.price()) {
//         let match_size = if (remaining_size >= bid_order.size()) {
//           bid_order.size()
//         } else {
//           remaining_size
//         };

//         debug::print(&b"Match found! Size: ");
//         debug::print(&match_size);

//         // Update filled sizes
//         let filled_size = bid_order.filled_size();
//         bid_order.set_filled_size(filled_size + match_size);
//         remaining_size = remaining_size - match_size;
//         matched = true;

//         // If bid order is fully filled, remove it
//         if (bid_order.filled_size() == bid_order.size()) {
//           vector::remove(&mut orderbook.bids, i);
//         } else {
//           i = i + 1;
//         };
//       } else {
//         break
//       };
//     };
//   };

//   if (matched) {
//     event::emit(OrderMatched {
//       maker_margin_account_id: object::id(margin_account),
//       taker_margin_account_id: order.margin_account_id(),
//       price: order.price(),
//       size: order.size() - remaining_size,
//     });
//   };

//   debug::print(&b"Final remaining size: ");
//   debug::print(&remaining_size);

// Liquidate bid order if margin percentage level is below maintenance margin
// percentage
public(package) fun check_and_remove_liquidated_bid(
  orderbook: &mut OrderBook,
  maintenance_margin_rate: u64,
  current_price: u64,
  pool_id: object::ID,
): bool {
  let bids = &mut orderbook.bids;
  let len = vector::length(bids);
  let mut i = 0;
  while (i < len) {
    let bid = vector::borrow(bids, i);

    // NO NEGATIVE NUMBERS IN SUI MOVE, CMON
    if (bid.price() < current_price) {
      return false
    };

    let initial_margin = bid.margin();
    // remove float scaling, because here it's 2 scalings in size and price
    let maintenance_margin =
      bid.size()*bid.price()*maintenance_margin_rate/100/constants::float_scaling();
    // multiply by float scaling because lose it during division
    let liquidation_price =
      bid.price() - (initial_margin - maintenance_margin)/bid.size()*constants::float_scaling();

    std::debug::print(&b"Liquidation price: ");
    std::debug::print(&liquidation_price);
    std::debug::print(&b"Current price: ");
    std::debug::print(&current_price);

    if (liquidation_price >= current_price) {
      std::debug::print(&b"Liquidatated");
      let margin_account_id = bid.margin_account_id();
      let price = bid.price();
      vector::remove(bids, i);

      event::emit(PositionLiquidated {
        pool_id,
        margin_account_id,
        price,
        is_bid: true,
      });
      return true
    };
    i = i + 1;
  };
  false
}

public(package) fun check_and_remove_liquidated_ask(
  orderbook: &mut OrderBook,
  maintenance_margin_rate: u64,
  current_price: u64,
  pool_id: object::ID,
): bool {
  let asks = &mut orderbook.asks;
  let len = vector::length(asks);
  let mut i = 0;
  while (i < len) {
    let ask = vector::borrow(asks, i);

    if (ask.price() > current_price) {
      return false
    };

    let initial_margin = ask.margin();
    let maintenance_margin = ask.size()*ask.price()*maintenance_margin_rate/100;
    let liquidation_price =
      ask.price() + (initial_margin - maintenance_margin)/ask.size();

    if (liquidation_price <= current_price) {
      let margin_account_id = ask.margin_account_id();
      let price = ask.price();
      vector::remove(asks, i);

      event::emit(PositionLiquidated {
        pool_id,
        margin_account_id,
        price,
        is_bid: false,
      });
      return true
    };
    order_index = order_index + 1;
  };
  false
}

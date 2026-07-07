module strike::orderbook;

use strike::order::{Self, Order, Side, OrderId};
use strike::risk;
use strike::strike::MarginAccount;
use strike::units::{Self, Price, Size, UsdcAmount};
use sui::event;

// Error codes
const EOrderNotFound: u64 = 1;
const EInvalidAccountOwner: u64 = 2;

public struct OrderBook has key, store {
  id: UID,
  bids: vector<Order>, // Buy/Long orders sorted by price (highest first)
  asks: vector<Order>, // Sell/Short orders sorted by price (lowest first)
  next_order_id: OrderId,
}

// Events carry primitive fields: their BCS layout is the external contract
// consumed by indexers, so domain types are projected via
// `.value()` / `.is_bid()` at the emit site.

public struct OrderCreated has copy, drop {
  order_id: u64,
  margin_account_id: ID,
  is_bid: bool,
  price: u64,
  size: u64,
}

public struct OrderCanceled has copy, drop {
  order_id: u64,
  margin_account_id: ID,
  is_bid: bool,
  price: u64,
}

/// Emitted once per fill: the incoming (taker) order crossing a resting
/// (maker) order. Fills execute at the maker's price.
public struct OrderMatched has copy, drop {
  maker_order_id: u64,
  taker_order_id: u64,
  maker_margin_account_id: ID,
  taker_margin_account_id: ID,
  price: u64,
  size: u64,
}

public struct PositionLiquidated has copy, drop {
  pool_id: ID,
  margin_account_id: ID,
  price: u64,
  is_bid: bool,
}

public(package) fun empty(ctx: &mut TxContext): OrderBook {
  OrderBook {
    id: object::new(ctx),
    bids: vector[],
    asks: vector[],
    next_order_id: order::order_id(1),
  }
}

/// Place a limit order: first cross it against the opposite side of the
/// book (fills execute at resting-order prices), then rest any remainder.
/// Returns the assigned order id; the id cancels the order while a
/// remainder rests on the book.
public(package) fun place_limit_order(
  orderbook: &mut OrderBook,
  margin_account: &MarginAccount,
  mut order: Order,
): OrderId {
  let margin_account_id = object::id(margin_account);

  let order_id = orderbook.next_order_id;
  orderbook.next_order_id = order_id.next();
  order.set_order_id(order_id);

  let remaining_size = match_against_book(orderbook, &order);
  if (remaining_size.is_zero()) {
    return order_id
  };

  let filled_size = order.size().sub(remaining_size);
  order.set_filled_size(filled_size);

  event::emit(OrderCreated {
    order_id: order_id.value(),
    margin_account_id,
    is_bid: order.side().is_bid(),
    price: order.price().value(),
    size: remaining_size.value(),
  });

  order.side().match_side!(
    || {
      orderbook.bids.push_back(order);
      sort_bids(&mut orderbook.bids);
    },
    || {
      orderbook.asks.push_back(order);
      sort_asks(&mut orderbook.asks);
    },
  );

  order_id
}

/// Cross an incoming order against the opposite side of the book, walking
/// resting orders in price priority (books stay sorted best-first). A bid
/// matches asks priced at or below it; an ask matches bids priced at or
/// above it. Returns the taker size left unfilled.
fun match_against_book(orderbook: &mut OrderBook, taker: &Order): Size {
  let side = taker.side();
  let makers = side.match_side!(
    || &mut orderbook.asks,
    || &mut orderbook.bids,
  );

  let mut remaining_size = taker.size();
  while (!makers.is_empty() && !remaining_size.is_zero()) {
    let maker = makers.borrow(0);
    let crosses = side.match_side!(
      || maker.price().le(taker.price()),
      || maker.price().ge(taker.price()),
    );
    if (!crosses) {
      break
    };
    remaining_size = fill_maker(makers, taker, remaining_size);
  };

  remaining_size
}

/// Fill the best resting order (index 0 — books are sorted best-first)
/// with up to `remaining_size` from the taker, emit the fill, and remove
/// the resting order once fully filled.
fun fill_maker(
  makers: &mut vector<Order>,
  taker: &Order,
  remaining_size: Size,
): Size {
  let maker = makers.borrow_mut(0);
  let match_size = remaining_size.min(maker.unfilled_size());

  let new_filled_size = maker.filled_size().add(match_size);
  maker.set_filled_size(new_filled_size);

  event::emit(OrderMatched {
    maker_order_id: maker.order_id().value(),
    taker_order_id: taker.order_id().value(),
    maker_margin_account_id: maker.margin_account_id(),
    taker_margin_account_id: taker.margin_account_id(),
    price: maker.price().value(),
    size: match_size.value(),
  });

  if (maker.unfilled_size().is_zero()) {
    makers.remove(0);
  };

  remaining_size.sub(match_size)
}

/// Cancel the sender's resting order by its unique id and report the
/// margin to refund plus the order's price. Keyed by order id rather than
/// (account, price) so duplicate price levels stay individually
/// cancellable.
public(package) fun cancel_order(
  orderbook: &mut OrderBook,
  margin_account: &MarginAccount,
  side: Side,
  order_id: OrderId,
  ctx: &TxContext,
): (UsdcAmount, Price) {
  let sender = tx_context::sender(ctx);
  assert!(margin_account.verify_owner(sender), EInvalidAccountOwner);

  let margin_account_id = object::id(margin_account);
  let orders = side.match_side!(
    || &mut orderbook.bids,
    || &mut orderbook.asks,
  );

  let mut order_index = orders.length();
  let mut candidate_index = 0;
  while (candidate_index < orders.length()) {
    let order = orders.borrow(candidate_index);
    if (
      order.order_id().eq(order_id) &&
      order.margin_account_id() == margin_account_id
    ) {
      order_index = candidate_index;
      break
    };
    candidate_index = candidate_index + 1;
  };

  assert!(order_index < orders.length(), EOrderNotFound);
  let order = orders.borrow(order_index);
  let amount_to_withdraw = risk::refund_for_unfilled(
    order.unfilled_size(),
    order.price(),
    order.leverage(),
  );
  let price = order.price();
  orders.remove(order_index);

  event::emit(OrderCanceled {
    order_id: order_id.value(),
    margin_account_id,
    is_bid: side.is_bid(),
    price: price.value(),
  });

  (amount_to_withdraw, price)
}

/// Keep bids sorted highest price first. The book is already sorted except
/// for the just-appended order, which the stdlib insertion sort handles in
/// linear time.
public(package) fun sort_bids(bids: &mut vector<Order>) {
  bids.insertion_sort_by!(|left, right| left.price().ge(right.price()));
}

/// Keep asks sorted lowest price first.
public(package) fun sort_asks(asks: &mut vector<Order>) {
  asks.insertion_sort_by!(|left, right| left.price().le(right.price()));
}

public(package) fun get_best_bid(orderbook: &OrderBook): (Price, Size) {
  if (orderbook.bids.is_empty()) {
    (units::price(0), units::size_zero())
  } else {
    let best_bid = orderbook.bids.borrow(0);
    (best_bid.price(), best_bid.size())
  }
}

public(package) fun get_best_ask(orderbook: &OrderBook): (Price, Size) {
  if (orderbook.asks.is_empty()) {
    (units::price(0), units::size_zero())
  } else {
    let best_ask = orderbook.asks.borrow(0);
    (best_ask.price(), best_ask.size())
  }
}

public fun get_bids_length(orderbook: &OrderBook): u64 {
  orderbook.bids.length()
}

public fun get_asks_length(orderbook: &OrderBook): u64 {
  orderbook.asks.length()
}

public fun get_bid(orderbook: &OrderBook, index: u64): &Order {
  orderbook.bids.borrow(index)
}

public fun get_ask(orderbook: &OrderBook, index: u64): &Order {
  orderbook.asks.borrow(index)
}

/// Remove and report the first liquidated bid, if any. `pool_id` only
/// feeds the emitted event.
public(package) fun check_and_remove_liquidated_bid(
  orderbook: &mut OrderBook,
  maintenance_margin_rate: u64,
  current_price: Price,
  pool_id: ID,
): bool {
  check_and_remove_liquidated(
    &mut orderbook.bids,
    maintenance_margin_rate,
    current_price,
    pool_id,
  )
}

/// Remove and report the first liquidated ask, if any.
public(package) fun check_and_remove_liquidated_ask(
  orderbook: &mut OrderBook,
  maintenance_margin_rate: u64,
  current_price: Price,
  pool_id: ID,
): bool {
  check_and_remove_liquidated(
    &mut orderbook.asks,
    maintenance_margin_rate,
    current_price,
    pool_id,
  )
}

fun check_and_remove_liquidated(
  orders: &mut vector<Order>,
  maintenance_margin_rate: u64,
  current_price: Price,
  pool_id: ID,
): bool {
  let order_count = orders.length();
  let mut order_index = 0;
  while (order_index < order_count) {
    let order = orders.borrow(order_index);

    let liquidated = risk::is_liquidated(
      order.side(),
      order.price(),
      order.size(),
      order.margin(),
      maintenance_margin_rate,
      current_price,
    );

    if (liquidated) {
      let margin_account_id = order.margin_account_id();
      let price = order.price();
      let side = order.side();
      orders.remove(order_index);

      event::emit(PositionLiquidated {
        pool_id,
        margin_account_id,
        price: price.value(),
        is_bid: side.is_bid(),
      });
      return true
    };
    order_index = order_index + 1;
  };
  false
}

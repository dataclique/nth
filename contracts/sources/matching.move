module nth::matching;

use nth::collateral::ReservationId;
use nth::order::{Self, OrderId, Side};
use sui::event;
use units::price::{Price};
use units::size::{Self, Size};

// === Constants ===

/// Bounds the hot-potato payload and the position work in one transaction.
const MAX_FILLS_PER_ORDER: u64 = 32;

/// Bounds insertion, cancellation, and crossing scans for one side of a book.
const MAX_ORDERS_PER_SIDE: u64 = 1_024;

const EVENT_SCHEMA_VERSION: u16 = 1;

// === Errors ===

#[error]
const EFillLimitExceeded: vector<u8> =
  b"incoming order would exceed the per-transaction fill limit";

#[error]
const EOrderLimitExceeded: vector<u8> =
  b"orderbook side has reached its resting-order limit";

#[error]
const ESelfMatch: vector<u8> = b"an account cannot match its own resting order";

#[error]
const EZeroPrice: vector<u8> = b"limit price must be positive";

#[error]
const EZeroSize: vector<u8> = b"order size must be positive";

#[error]
const ENoPendingFill: vector<u8> = b"fill obligation has no unsettled fill";

#[error]
const EOrderNotFound: vector<u8> =
  b"resting order does not belong to this account and side";

// === Structs ===

/// One resting order in an instrument market's price-time-priority book.
public struct RestingOrder<phantom Instrument> has drop, store {
  order_id: OrderId,
  margin_account_id: ID,
  reservation_id: ReservationId,
  side: Side,
  price: Price,
  size: Size,
  filled_size: Size,
}

/// The reusable price-time-priority book for one fungible instrument market.
public struct OrderBook<phantom Instrument> has store {
  bids: vector<RestingOrder<Instrument>>,
  asks: vector<RestingOrder<Instrument>>,
  next_order_id: OrderId,
}

/// Primitive, immutable description of one maker/taker match.
public struct Fill<phantom Instrument> has copy, drop {
  maker_order_id: OrderId,
  taker_order_id: OrderId,
  maker_margin_account_id: ID,
  taker_margin_account_id: ID,
  maker_reservation_id: ReservationId,
  taker_reservation_id: ReservationId,
  maker_side: Side,
  price: Price,
  size: Size,
  maker_fully_filled: bool,
}

/// Non-droppable result of matching. The standard advances `settled_fills`
/// only while applying both generic net-position transitions.
public struct FillObligation<phantom Instrument> {
  market_id: ID,
  order_id: OrderId,
  reservation_id: ReservationId,
  resting_size: Size,
  fills: vector<Fill<Instrument>>,
  settled_fills: u64,
}

/// Non-droppable cancellation result that carries the instrument reservation
/// and the exact unfilled quantity that the wrapper must release.
public struct CancelObligation<phantom Instrument> {
  market_id: ID,
  order_id: OrderId,
  reservation_id: ReservationId,
  remaining_size: Size,
}

// === Events ===

/// Emitted when an incoming order leaves a resting remainder.
public struct OrderRested<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  order_id: u64,
  margin_account_id: ID,
  reservation_id: u64,
  is_bid: bool,
  price: u64,
  remaining_size: u64,
}

/// Emitted once for each maker/taker match at the maker's price.
public struct OrderFilled<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  maker_order_id: u64,
  taker_order_id: u64,
  maker_margin_account_id: ID,
  taker_margin_account_id: ID,
  maker_reservation_id: u64,
  taker_reservation_id: u64,
  maker_is_bid: bool,
  price: u64,
  size: u64,
  maker_fully_filled: bool,
}

/// Emitted when an account removes its own resting order.
public struct OrderCanceled<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  order_id: u64,
  margin_account_id: ID,
  reservation_id: u64,
  is_bid: bool,
  remaining_size: u64,
}

// === Public Constants ===

/// Maximum maker fills represented by one `FillObligation`.
public fun max_fills_per_order(): u64 {
  MAX_FILLS_PER_ORDER
}

/// Maximum resting orders stored on either side of one market.
public fun max_orders_per_side(): u64 {
  MAX_ORDERS_PER_SIDE
}

// === Fill Views ===

/// Resting maker's order ID, unique within the market.
public fun maker_order_id<Instrument>(fill: &Fill<Instrument>): OrderId {
  fill.maker_order_id
}

/// Incoming taker's order ID, unique within the market.
public fun taker_order_id<Instrument>(fill: &Fill<Instrument>): OrderId {
  fill.taker_order_id
}

/// Resting maker's margin-account object ID.
public fun maker_margin_account_id<Instrument>(fill: &Fill<Instrument>): ID {
  fill.maker_margin_account_id
}

/// Incoming taker's margin-account object ID.
public fun taker_margin_account_id<Instrument>(fill: &Fill<Instrument>): ID {
  fill.taker_margin_account_id
}

/// Market-local collateral reservation backing the maker order.
public fun maker_reservation_id<Instrument>(
  fill: &Fill<Instrument>,
): ReservationId {
  fill.maker_reservation_id
}

/// Market-local collateral reservation backing the taker order.
public fun taker_reservation_id<Instrument>(
  fill: &Fill<Instrument>,
): ReservationId {
  fill.taker_reservation_id
}

/// Side of the resting maker; the taker always has the opposite side.
public fun maker_side<Instrument>(fill: &Fill<Instrument>): Side {
  fill.maker_side
}

/// Execution price at the shared `10^6` scale.
public fun price<Instrument>(fill: &Fill<Instrument>): Price {
  fill.price
}

/// Executed quantity at the shared `10^6` scale.
public fun size<Instrument>(fill: &Fill<Instrument>): Size {
  fill.size
}

/// Whether this fill completely removed its resting maker order.
public fun maker_fully_filled<Instrument>(fill: &Fill<Instrument>): bool {
  fill.maker_fully_filled
}

// === Obligation Views ===

/// Stable object ID of the market that produced this obligation.
public fun market_id<Instrument>(
  obligation: &FillObligation<Instrument>,
): ID {
  obligation.market_id
}

/// Incoming order ID assigned by the market.
public fun order_id<Instrument>(
  obligation: &FillObligation<Instrument>,
): OrderId {
  obligation.order_id
}

/// Market-local collateral reservation backing the incoming order.
public fun reservation_id<Instrument>(
  obligation: &FillObligation<Instrument>,
): ReservationId {
  obligation.reservation_id
}

/// Incoming quantity that remains resting after all maker fills.
public fun resting_size<Instrument>(
  obligation: &FillObligation<Instrument>,
): Size {
  obligation.resting_size
}

/// Number of maker/taker fills in the obligation.
public fun fill_count<Instrument>(
  obligation: &FillObligation<Instrument>,
): u64 {
  obligation.fills.length()
}

/// Number of fills whose two generic position transitions were applied.
public fun settled_fill_count<Instrument>(
  obligation: &FillObligation<Instrument>,
): u64 {
  obligation.settled_fills
}

/// Whether the obligation still contains an unsettled fill.
public fun has_next_fill<Instrument>(
  obligation: &FillObligation<Instrument>,
): bool {
  obligation.settled_fills < obligation.fills.length()
}

/// Inspect the next unsettled fill before instrument-specific settlement.
/// Aborts with `ENoPendingFill` when every fill is already settled.
public fun next_fill<Instrument>(
  obligation: &FillObligation<Instrument>,
): Fill<Instrument> {
  assert!(obligation.has_next_fill(), ENoPendingFill);
  obligation.fills[obligation.settled_fills]
}

// === Cancellation Views ===

/// Stable object ID of the market that produced this cancellation.
public fun cancel_market_id<Instrument>(
  obligation: &CancelObligation<Instrument>,
): ID {
  obligation.market_id
}

/// ID of the canceled order.
public fun canceled_order_id<Instrument>(
  obligation: &CancelObligation<Instrument>,
): OrderId {
  obligation.order_id
}

/// Market-local collateral reservation backing the canceled order.
public fun canceled_reservation_id<Instrument>(
  obligation: &CancelObligation<Instrument>,
): ReservationId {
  obligation.reservation_id
}

/// Unfilled quantity that no longer rests and can be released.
public fun canceled_remaining_size<Instrument>(
  obligation: &CancelObligation<Instrument>,
): Size {
  obligation.remaining_size
}

// === Package Functions ===

/// Create an empty orderbook with IDs beginning at one.
public(package) fun empty<Instrument>(): OrderBook<Instrument> {
  OrderBook {
    bids: vector[],
    asks: vector[],
    next_order_id: order::order_id(1),
  }
}

/// Validate every user-controlled order boundary before collateral reservation
/// or book mutation. Aborts on self-match, zero price/size, more than 32 maker
/// fills, or a resting remainder on a full side.
public(package) fun validate_limit_order<Instrument>(
  orderbook: &OrderBook<Instrument>,
  margin_account_id: ID,
  side: Side,
  price: Price,
  size: Size,
) {
  assert!(!price.is_zero(), EZeroPrice);
  assert!(!size.is_zero(), EZeroSize);
  preflight(orderbook, margin_account_id, side, price, size);
}

/// Match one prevalidated limit order and return a non-droppable obligation.
/// The package caller must invoke `validate_limit_order` before reserving
/// collateral and entering this function.
public(package) fun place_limit_order<Instrument>(
  orderbook: &mut OrderBook<Instrument>,
  market_id: ID,
  margin_account_id: ID,
  reservation_id: ReservationId,
  side: Side,
  price: Price,
  size: Size,
): FillObligation<Instrument> {
  let order_id = orderbook.next_order_id;
  orderbook.next_order_id = order_id.next();
  let mut incoming = RestingOrder {
    order_id,
    margin_account_id,
    reservation_id,
    side,
    price,
    size,
    filled_size: size::size_zero(),
  };

  let fills = match_order(orderbook, market_id, &mut incoming);
  let resting_size = incoming.unfilled_size();
  if (!resting_size.is_zero()) {
    rest(orderbook, market_id, incoming);
  };

  FillObligation {
    market_id,
    order_id,
    reservation_id,
    resting_size,
    fills,
    settled_fills: 0,
  }
}

/// Remove one resting order owned by `margin_account_id` from `side`.
/// Returns a non-droppable cancellation result for reservation release.
public(package) fun cancel_order<Instrument>(
  orderbook: &mut OrderBook<Instrument>,
  market_id: ID,
  margin_account_id: ID,
  side: Side,
  order_id: OrderId,
): CancelObligation<Instrument> {
  let orders = side.match_side!(
    || &orderbook.bids,
    || &orderbook.asks,
  );
  let mut index = 0;
  while (index < orders.length()) {
    let candidate = &orders[index];
    if (
      candidate.order_id.eq(order_id) &&
      candidate.margin_account_id == margin_account_id
    ) {
      break
    };
    index = index + 1;
  };
  assert!(index < orders.length(), EOrderNotFound);
  remove_resting_at(orderbook, market_id, side, index)
}

/// Remove the front resting order from `side` regardless of its owner.
/// Aborts when the side is empty. Reserved for market-wide cleanup paths whose
/// released collateral can only return to each order's own account.
public(package) fun cancel_front<Instrument>(
  orderbook: &mut OrderBook<Instrument>,
  market_id: ID,
  side: Side,
): CancelObligation<Instrument> {
  let orders = side.match_side!(
    || &orderbook.bids,
    || &orderbook.asks,
  );
  assert!(orders.length() > 0, EOrderNotFound);
  remove_resting_at(orderbook, market_id, side, 0)
}

/// Advance an obligation after both generic position transitions succeed.
public(package) fun advance<Instrument>(
  obligation: &mut FillObligation<Instrument>,
) {
  assert!(obligation.has_next_fill(), ENoPendingFill);
  obligation.settled_fills = obligation.settled_fills + 1;
}

/// Consume a fully settled obligation. The caller verifies market identity and
/// completion before calling this package-only destructor.
public(package) fun destroy<Instrument>(
  obligation: FillObligation<Instrument>,
) {
  let FillObligation {
    market_id: _,
    order_id: _,
    reservation_id: _,
    resting_size: _,
    fills: _,
    settled_fills: _,
  } = obligation;
}

/// Consume a cancellation after the instrument wrapper releases its reserve.
public(package) fun destroy_cancel<Instrument>(
  obligation: CancelObligation<Instrument>,
) {
  let CancelObligation {
    market_id: _,
    order_id: _,
    reservation_id: _,
    remaining_size: _,
  } = obligation;
}

/// Number of resting bids.
public(package) fun bid_count<Instrument>(
  orderbook: &OrderBook<Instrument>,
): u64 {
  orderbook.bids.length()
}

/// Number of resting asks.
public(package) fun ask_count<Instrument>(
  orderbook: &OrderBook<Instrument>,
): u64 {
  orderbook.asks.length()
}

// === Private Functions ===

fun remove_resting_at<Instrument>(
  orderbook: &mut OrderBook<Instrument>,
  market_id: ID,
  side: Side,
  index: u64,
): CancelObligation<Instrument> {
  let orders = side.match_side!(
    || &mut orderbook.bids,
    || &mut orderbook.asks,
  );
  let canceled = orders.remove(index);
  let remaining_size = canceled.unfilled_size();

  event::emit(OrderCanceled<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    order_id: canceled.order_id.value(),
    margin_account_id: canceled.margin_account_id,
    reservation_id: canceled.reservation_id.value(),
    is_bid: canceled.side.is_bid(),
    remaining_size: remaining_size.value(),
  });
  CancelObligation {
    market_id,
    order_id: canceled.order_id,
    reservation_id: canceled.reservation_id,
    remaining_size,
  }
}

fun preflight<Instrument>(
  orderbook: &OrderBook<Instrument>,
  margin_account_id: ID,
  side: Side,
  price: Price,
  size: Size,
) {
  let makers = side.match_side!(
    || &orderbook.asks,
    || &orderbook.bids,
  );
  let mut remaining_size = size;
  let mut maker_index = 0;
  let mut fill_count = 0;
  while (maker_index < makers.length() && !remaining_size.is_zero()) {
    let maker = &makers[maker_index];
    if (!crosses(side, price, maker.price)) {
      break
    };
    assert!(maker.margin_account_id != margin_account_id, ESelfMatch);
    fill_count = fill_count + 1;
    assert!(fill_count <= MAX_FILLS_PER_ORDER, EFillLimitExceeded);
    remaining_size = remaining_size.sub(
      remaining_size.min(maker.unfilled_size()),
    );
    maker_index = maker_index + 1;
  };

  if (!remaining_size.is_zero()) {
    let resting_side = side.match_side!(
      || &orderbook.bids,
      || &orderbook.asks,
    );
    assert!(
      resting_side.length() < MAX_ORDERS_PER_SIDE,
      EOrderLimitExceeded,
    );
  };
}

fun match_order<Instrument>(
  orderbook: &mut OrderBook<Instrument>,
  market_id: ID,
  taker: &mut RestingOrder<Instrument>,
): vector<Fill<Instrument>> {
  let taker_side = taker.side;
  let makers = taker_side.match_side!(
    || &mut orderbook.asks,
    || &mut orderbook.bids,
  );
  let mut fills = vector[];

  while (!makers.is_empty() && !taker.unfilled_size().is_zero()) {
    let maker = &makers[0];
    if (!crosses(taker_side, taker.price, maker.price)) {
      break
    };
    fills.push_back(fill_best(makers, market_id, taker));
  };
  fills
}

fun fill_best<Instrument>(
  makers: &mut vector<RestingOrder<Instrument>>,
  market_id: ID,
  taker: &mut RestingOrder<Instrument>,
): Fill<Instrument> {
  let maker = &mut makers[0];
  let fill_size = taker.unfilled_size().min(maker.unfilled_size());
  maker.filled_size = maker.filled_size.add(fill_size);
  taker.filled_size = taker.filled_size.add(fill_size);
  let maker_fully_filled = maker.unfilled_size().is_zero();

  let fill = Fill {
    maker_order_id: maker.order_id,
    taker_order_id: taker.order_id,
    maker_margin_account_id: maker.margin_account_id,
    taker_margin_account_id: taker.margin_account_id,
    maker_reservation_id: maker.reservation_id,
    taker_reservation_id: taker.reservation_id,
    maker_side: maker.side,
    price: maker.price,
    size: fill_size,
    maker_fully_filled,
  };
  event::emit(OrderFilled<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    maker_order_id: maker.order_id.value(),
    taker_order_id: taker.order_id.value(),
    maker_margin_account_id: maker.margin_account_id,
    taker_margin_account_id: taker.margin_account_id,
    maker_reservation_id: maker.reservation_id.value(),
    taker_reservation_id: taker.reservation_id.value(),
    maker_is_bid: maker.side.is_bid(),
    price: maker.price.value(),
    size: fill_size.value(),
    maker_fully_filled,
  });

  if (maker_fully_filled) {
    makers.remove(0);
  };
  fill
}

fun rest<Instrument>(
  orderbook: &mut OrderBook<Instrument>,
  market_id: ID,
  order: RestingOrder<Instrument>,
) {
  event::emit(OrderRested<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    order_id: order.order_id.value(),
    margin_account_id: order.margin_account_id,
    reservation_id: order.reservation_id.value(),
    is_bid: order.side.is_bid(),
    price: order.price.value(),
    remaining_size: order.unfilled_size().value(),
  });

  order.side.match_side!(
    || {
      orderbook.bids.push_back(order);
      orderbook.bids.insertion_sort_by!(
        |left, right| left.price.ge(right.price),
      );
    },
    || {
      orderbook.asks.push_back(order);
      orderbook.asks.insertion_sort_by!(
        |left, right| left.price.le(right.price),
      );
    },
  );
}

fun crosses(taker_side: Side, taker_price: Price, maker_price: Price): bool {
  taker_side.match_side!(
    || maker_price.le(taker_price),
    || maker_price.ge(taker_price),
  )
}

fun unfilled_size<Instrument>(order: &RestingOrder<Instrument>): Size {
  order.size.sub(order.filled_size)
}

// === Test-Only Functions ===

/// Fill one resting side to the explicit storage limit without emitting events.
#[test_only]
public(package) fun fill_side_to_limit_for_testing<Instrument>(
  orderbook: &mut OrderBook<Instrument>,
  margin_account_id: ID,
  reservation_id: ReservationId,
  side: Side,
) {
  let orders = side.match_side!(
    || &mut orderbook.bids,
    || &mut orderbook.asks,
  );
  while (orders.length() < MAX_ORDERS_PER_SIDE) {
    let order_id = orderbook.next_order_id;
    orderbook.next_order_id = order_id.next();
    orders.push_back(RestingOrder {
      order_id,
      margin_account_id,
      reservation_id,
      side,
      price: units::price::price(1),
      size: size::size(1),
      filled_size: size::size_zero(),
    });
  };
}

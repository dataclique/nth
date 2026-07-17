module nth::order;

use nth::units::{Self, Price, Size, Leverage, UsdcAmount};

// === Side ===

/// Which side of the book an order is on. Bid = buy/long, Ask = sell/short.
/// Replaces `is_bid: bool` at call sites: `order::bid()` reads where a bare
/// `true` did not. Variants are module-internal (Move enums), so consumers
/// branch via the `is_bid` projection.
public enum Side has copy, drop, store {
  Bid,
  Ask,
}

public fun bid(): Side { Side::Bid }

public fun ask(): Side { Side::Ask }

/// Branch on a side from any module. Enum variants are module-internal
/// (and macro bodies resolve visibility in the caller's scope), so this
/// dispatches through the public `is_bid` projection while keeping both
/// arms required at every call site — `side.match_side!(|| ..., || ...)`.
public macro fun match_side<$T>($side: Side, $bid: || -> $T, $ask: || -> $T): $T {
  if (is_bid($side)) $bid() else $ask()
}

/// Primitive projection for event payloads and `match_side!`; for control
/// flow prefer the macro.
public fun is_bid(side: Side): bool {
  match (side) {
    Side::Bid => true,
    Side::Ask => false,
  }
}

// === OrderId ===

/// Identifier unique within one orderbook; assigned sequentially when an
/// order is placed. The cancellation key: unlike (account, price), it
/// stays unique when an account places several orders at one price level.
public struct OrderId has copy, drop, store { value: u64 }

public fun order_id(value: u64): OrderId { OrderId { value } }

public fun order_id_value(id: OrderId): u64 { id.value }

public use fun order_id_value as OrderId.value;

public fun order_id_next(id: OrderId): OrderId {
  OrderId { value: id.value + 1 }
}

public use fun order_id_next as OrderId.next;

public fun order_id_eq(id: OrderId, other: OrderId): bool {
  id.value == other.value
}

public use fun order_id_eq as OrderId.eq;

// === Order ===

public struct Order has drop, store {
  /// Assigned by `orderbook::place_limit_order`; zero until placed.
  order_id: OrderId,
  margin_account_id: ID,
  side: Side,
  price: Price,
  size: Size,
  leverage: Leverage,
  margin: UsdcAmount,
  filled_size: Size,
  entry_price: Price,
  last_funding_time: u64,
}

public(package) fun new(
  margin_account_id: ID,
  side: Side,
  price: Price,
  size: Size,
  leverage: Leverage,
  margin: UsdcAmount,
  ctx: &TxContext,
): Order {
  Order {
    order_id: order_id(0),
    margin_account_id,
    side,
    price,
    size,
    leverage,
    margin,
    filled_size: units::size_zero(),
    entry_price: price,
    last_funding_time: tx_context::epoch_timestamp_ms(ctx),
  }
}

public(package) fun order_id_of(order: &Order): OrderId {
  order.order_id
}

public use fun order_id_of as Order.order_id;

public(package) fun margin_account_id(order: &Order): ID {
  order.margin_account_id
}

public(package) fun side(order: &Order): Side {
  order.side
}

public(package) fun price(order: &Order): Price {
  order.price
}

public(package) fun size(order: &Order): Size {
  order.size
}

public(package) fun leverage(order: &Order): Leverage {
  order.leverage
}

public(package) fun margin(order: &Order): UsdcAmount {
  order.margin
}

public(package) fun filled_size(order: &Order): Size {
  order.filled_size
}

public(package) fun unfilled_size(order: &Order): Size {
  order.size.sub(order.filled_size)
}

public(package) fun entry_price(order: &Order): Price {
  order.entry_price
}

public(package) fun set_order_id(order: &mut Order, order_id: OrderId) {
  order.order_id = order_id;
}

public(package) fun set_filled_size(order: &mut Order, filled_size: Size) {
  order.filled_size = filled_size;
}

public(package) fun update_margin(order: &mut Order, new_margin: UsdcAmount) {
  order.margin = new_margin;
}

public(package) fun update_funding_time(order: &mut Order, timestamp: u64) {
  order.last_funding_time = timestamp;
}

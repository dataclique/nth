module nth::order;

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

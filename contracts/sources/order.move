module strike::order;

public struct Order has copy, drop, store {
  margin_account_id: ID,
  is_bid: bool,
  price: u64,
  size: u64,
  filled_size: u64,
}

// Events
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

public fun new(
  margin_account_id: ID,
  is_bid: bool,
  price: u64,
  size: u64,
): Order {
  Order {
    margin_account_id,
    is_bid,
    price,
    size,
    filled_size: 0,
  }
}

public fun margin_account_id(order: &Order): ID {
  order.margin_account_id
}

public fun price(order: &Order): u64 {
  order.price
}

public fun size(order: &Order): u64 {
  order.size
}

public fun is_bid(order: &Order): bool {
  order.is_bid
}

public fun filled_size(order: &Order): u64 {
  order.filled_size
}

public fun set_filled_size(order: &mut Order, filled_size: u64) {
  order.filled_size = filled_size;
}

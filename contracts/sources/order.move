module strike::order;

public struct Order has copy, drop, store {
  margin_account_id: ID,
  is_bid: bool,
  order_type: u8,
  price: u64,
  size: u64,
  filled_size: u64,
}

// Events
public struct OrderCreated has copy, drop {
  margin_account_id: ID,
  is_bid: bool,
  order_type: u8,
  price: u64,
  size: u64,
}

public struct OrderCanceled has copy, drop {
  margin_account_id: ID,
  is_bid: bool,
  order_type: u8,
  price: u64,
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

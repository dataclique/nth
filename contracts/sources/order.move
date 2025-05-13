module strike::order;

public struct Order has drop, store {
  margin_account_id: ID,
  is_bid: bool,
  price: u64,
  size: u64,
  leverage: u64,
  margin: u64,
  filled_size: u64,
  entry_price: u64,
  last_funding_time: u64,
}

public(package) fun new(
  margin_account_id: ID,
  is_bid: bool,
  price: u64,
  size: u64,
  leverage: u64,
  margin: u64,
  ctx: &TxContext,
): Order {
  Order {
    margin_account_id,
    is_bid,
    price,
    size,
    leverage,
    margin,
    filled_size: 0,
    entry_price: price,
    last_funding_time: tx_context::epoch_timestamp_ms(ctx),
  }
}

public(package) fun margin_account_id(order: &Order): ID {
  order.margin_account_id
}

public(package) fun is_bid(order: &Order): bool {
  order.is_bid
}

public(package) fun price(order: &Order): u64 {
  order.price
}

public(package) fun size(order: &Order): u64 {
  order.size
}

public(package) fun leverage(order: &Order): u64 {
  order.leverage
}

public(package) fun margin(order: &Order): u64 {
  order.margin
}

public(package) fun filled_size(order: &Order): u64 {
  order.filled_size
}

public(package) fun entry_price(order: &Order): u64 {
  order.entry_price
}

public(package) fun set_filled_size(order: &mut Order, filled_size: u64) {
  order.filled_size = filled_size;
}

public(package) fun update_margin(order: &mut Order, new_margin: u64) {
  order.margin = new_margin;
}

public(package) fun update_funding_time(order: &mut Order, timestamp: u64) {
  order.last_funding_time = timestamp;
}

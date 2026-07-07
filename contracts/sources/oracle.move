module strike::oracle;

use strike::units::{Self, Price};
use sui::event;

/// Price feed for a pool. Writes are gated by the pool's `PriceCap` (see
/// `pool::update_price`); this module only enforces the data shape.
public struct Oracle has key, store {
  id: UID,
  price: Price,
  last_update_time: u64,
}

public struct PriceUpdate has copy, drop {
  price: u64,
  timestamp: u64,
}

public(package) fun new(ctx: &mut TxContext): Oracle {
  Oracle {
    id: object::new(ctx),
    price: units::price(0),
    last_update_time: 0,
  }
}

public(package) fun update_price(
  oracle: &mut Oracle,
  new_price: Price,
  ctx: &TxContext,
) {
  let timestamp = tx_context::epoch_timestamp_ms(ctx);
  oracle.price = new_price;
  oracle.last_update_time = timestamp;

  event::emit(PriceUpdate {
    price: new_price.value(),
    timestamp,
  });
}

public(package) fun get_price(oracle: &Oracle): Price {
  oracle.price
}

public(package) fun get_last_update_time(oracle: &Oracle): u64 {
  oracle.last_update_time
}

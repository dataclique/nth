module strike::oracle;

use strike::units::{Self, Price};
use sui::clock::Clock;
use sui::event;

// === Structs ===

/// Price feed for a pool. Writes are gated by the pool's `PriceCap` (see
/// `pool::update_price`); this module only enforces the data shape.
public struct Oracle has key, store {
  id: UID,
  price: Price,
  last_update_time: u64,
}

// === Events ===

public struct PriceUpdate has copy, drop {
  price: u64,
  timestamp: u64,
}

// === Package Functions ===

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
  clock: &Clock,
) {
  let timestamp = clock.timestamp_ms();
  oracle.price = new_price;
  oracle.last_update_time = timestamp;

  event::emit(PriceUpdate {
    price: new_price.value(),
    timestamp,
  });
}

// === View Functions ===

/// The most recently written price; zero only before the first update
/// (`pool::new` seeds it at creation).
public(package) fun price(oracle: &Oracle): Price {
  oracle.price
}

/// `Clock`-milliseconds timestamp of the last `update_price`.
public(package) fun last_update_time(oracle: &Oracle): u64 {
  oracle.last_update_time
}

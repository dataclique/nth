module strike::oracle;

use sui::event;

public struct Oracle has key, store {
  id: UID,
  price: u64,
  last_update_time: u64,
}

public struct PriceUpdate has copy, drop {
  price: u64,
  timestamp: u64,
}

public(package) fun new(ctx: &mut TxContext): Oracle {
  Oracle {
    id: object::new(ctx),
    price: 0,
    last_update_time: 0,
  }
}

public(package) fun update_price(
  oracle: &mut Oracle,
  new_price: u64,
  ctx: &TxContext,
) {
  let timestamp = tx_context::epoch_timestamp_ms(ctx);
  oracle.price = new_price;
  oracle.last_update_time = timestamp;

  event::emit(PriceUpdate {
    price: new_price,
    timestamp,
  });
}

public(package) fun get_price(oracle: &Oracle): u64 {
  oracle.price
}

public(package) fun get_last_update_time(oracle: &Oracle): u64 {
  oracle.last_update_time
}

/// Underlying-price oracle owned by the options instrument. The instrument
/// selects and validates its own oracle per the composable instrument
/// standard: writes are gated by the market's `PriceCap`; the European
/// settlement path reads it exactly once at expiry.
module options::oracle;

use sui::clock::Clock;
use units::price::Price;

// === Errors ===

#[error]
const EZeroPrice: vector<u8> = b"underlying price must be positive";

// === Structs ===

/// Underlying-price state embedded in one options market. `last_update_ms`
/// is `Clock` milliseconds of the most recent write.
public struct UnderlyingOracle has store {
  price: Price,
  last_update_ms: u64,
}

/// Capability gating underlying-price writes for exactly one market.
public struct PriceCap has key, store {
  id: UID,
}

// === Package Functions ===

/// Create the oracle seeded with a positive initial price stamped at the
/// current clock. Aborts on a zero price.
public(package) fun new(
  initial_price: Price,
  clock: &Clock,
): UnderlyingOracle {
  assert!(!initial_price.is_zero(), EZeroPrice);
  UnderlyingOracle {
    price: initial_price,
    last_update_ms: clock.timestamp_ms(),
  }
}

/// Create the write capability paired with one market at creation.
public(package) fun new_cap(ctx: &mut TxContext): PriceCap {
  PriceCap { id: object::new(ctx) }
}

/// Overwrite the underlying price and stamp the clock. Aborts on a zero
/// price.
public(package) fun update(
  oracle: &mut UnderlyingOracle,
  new_price: Price,
  clock: &Clock,
) {
  assert!(!new_price.is_zero(), EZeroPrice);
  oracle.price = new_price;
  oracle.last_update_ms = clock.timestamp_ms();
}

/// The most recently written underlying price.
public(package) fun price(oracle: &UnderlyingOracle): Price {
  oracle.price
}

/// `Clock`-milliseconds timestamp of the last write.
public(package) fun last_update_ms(oracle: &UnderlyingOracle): u64 {
  oracle.last_update_ms
}

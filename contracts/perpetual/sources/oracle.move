/// Mark-price oracle owned by the perpetual instrument. The instrument
/// selects and validates its own oracle per the composable instrument
/// standard: writes are gated by the market's `PriceCap`, reads used for
/// funding and liquidation must pass an explicit staleness bound.
module perpetual::oracle;

use sui::clock::Clock;
use units::price::Price;

// === Errors ===

#[error]
const EZeroPrice: vector<u8> = b"mark price must be positive";

#[error]
const EStalePrice: vector<u8> =
  b"mark price is older than the market's staleness bound";

// === Structs ===

/// Mark-price state embedded in one perpetual market. `last_update_ms` is
/// `Clock` milliseconds of the most recent write.
public struct MarkOracle has store {
  price: Price,
  last_update_ms: u64,
}

/// Capability gating mark-price writes for exactly one market.
public struct PriceCap has key, store {
  id: UID,
}

// === Package Functions ===

/// Create the oracle seeded with a positive initial mark price stamped at
/// the current clock. Aborts on a zero price.
public(package) fun new(initial_price: Price, clock: &Clock): MarkOracle {
  assert!(!initial_price.is_zero(), EZeroPrice);
  MarkOracle {
    price: initial_price,
    last_update_ms: clock.timestamp_ms(),
  }
}

/// Create the write capability paired with one market at creation.
public(package) fun new_cap(ctx: &mut TxContext): PriceCap {
  PriceCap { id: object::new(ctx) }
}

/// Overwrite the mark price and stamp the clock. Aborts on a zero price.
public(package) fun update(
  oracle: &mut MarkOracle,
  new_price: Price,
  clock: &Clock,
) {
  assert!(!new_price.is_zero(), EZeroPrice);
  oracle.price = new_price;
  oracle.last_update_ms = clock.timestamp_ms();
}

/// Abort when the last write is older than `max_staleness_ms` at the
/// current clock. Funding rounds and liquidations must call this first.
public(package) fun assert_fresh(
  oracle: &MarkOracle,
  max_staleness_ms: u64,
  clock: &Clock,
) {
  assert!(
    clock.timestamp_ms() <= oracle.last_update_ms + max_staleness_ms,
    EStalePrice,
  );
}

/// The most recently written mark price.
public(package) fun price(oracle: &MarkOracle): Price {
  oracle.price
}

/// `Clock`-milliseconds timestamp of the last mark-price write.
public(package) fun last_update_ms(oracle: &MarkOracle): u64 {
  oracle.last_update_ms
}

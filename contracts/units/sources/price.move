/// USDC-per-token price, scaled by `scaling::float_scaling()`.
module units::price;

// === Structs ===

public struct Price has copy, drop, store {
  /// Raw scaled value; divide by `scaling::float_scaling()` for human USDC.
  value: u64,
}

// === Method Aliases ===

public use fun price_value as Price.value;
public use fun price_is_zero as Price.is_zero;
public use fun price_lt as Price.lt;
public use fun price_le as Price.le;
public use fun price_gt as Price.gt;
public use fun price_ge as Price.ge;

// === Public Functions ===

/// Wraps a scaled price. Human 100 USDC/token → `price(100 * float_scaling())`.
public fun price(value: u64): Price { Price { value } }

public fun price_value(price: Price): u64 { price.value }

public fun price_is_zero(price: Price): bool { price.value == 0 }

public fun price_lt(price: Price, other: Price): bool {
  price.value < other.value
}

public fun price_le(price: Price, other: Price): bool {
  price.value <= other.value
}

public fun price_gt(price: Price, other: Price): bool {
  price.value > other.value
}

public fun price_ge(price: Price, other: Price): bool {
  price.value >= other.value
}

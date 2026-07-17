/// Position leverage multiplier, scaled by `scaling::float_scaling()`
/// (2x leverage = `2 * float_scaling()`).
module units::leverage;

// === Structs ===

public struct Leverage has copy, drop, store {
  /// Raw scaled leverage multiplier.
  value: u64,
}

// === Method Aliases ===

public use fun leverage_value as Leverage.value;
public use fun leverage_is_zero as Leverage.is_zero;
public use fun leverage_le as Leverage.le;

// === Public Functions ===

/// Wraps scaled leverage. Human 2x → `leverage(2 * float_scaling())`.
public fun leverage(value: u64): Leverage { Leverage { value } }

public fun leverage_value(leverage: Leverage): u64 { leverage.value }

public fun leverage_is_zero(leverage: Leverage): bool { leverage.value == 0 }

public fun leverage_le(leverage: Leverage, other: Leverage): bool {
  leverage.value <= other.value
}

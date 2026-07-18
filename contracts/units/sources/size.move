/// Token quantity, scaled by `scaling::float_scaling()`.
module units::size;

// === Structs ===

public struct Size has copy, drop, store {
  /// Raw scaled token amount.
  value: u64,
}

// === Method Aliases ===

public use fun size_value as Size.value;
public use fun size_is_zero as Size.is_zero;
public use fun size_sub as Size.sub;
public use fun size_add as Size.add;
public use fun size_min as Size.min;
public use fun size_eq as Size.eq;
public use fun size_lt as Size.lt;

// === Public Functions ===

/// Wraps a scaled size. Human 10 tokens → `size(10 * float_scaling())`.
public fun size(value: u64): Size { Size { value } }

public fun size_zero(): Size { Size { value: 0 } }

public fun size_value(size: Size): u64 { size.value }

public fun size_is_zero(size: Size): bool { size.value == 0 }

/// Aborts on underflow; callers must ensure `size >= other`.
public fun size_sub(size: Size, other: Size): Size {
  Size { value: size.value - other.value }
}

public fun size_add(size: Size, other: Size): Size {
  Size { value: size.value + other.value }
}

public fun size_min(size: Size, other: Size): Size {
  if (size.value <= other.value) { size } else { other }
}

public fun size_eq(size: Size, other: Size): bool {
  size.value == other.value
}

public fun size_lt(size: Size, other: Size): bool {
  size.value < other.value
}

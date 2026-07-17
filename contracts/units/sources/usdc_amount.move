/// USDC collateral in base units (1 USDC = $10^6$ base units).
///
/// Because USDC has six decimals, `UsdcAmount` shares the same scale as
/// `scaling::float_scaling()`, which lets `nth::risk::margin_required`
/// divide a double-scaled `price * size` product by scaled leverage and land
/// directly in base units.
module units::usdc_amount;

// === Errors ===

/// A `u128` narrowing result does not fit `u64` base units.
#[error]
const EOverflow: vector<u8> = b"USDC amount does not fit u64 base units";

// === Constants ===

const MAX_U64: u128 = 18_446_744_073_709_551_615;

// === Structs ===

public struct UsdcAmount has copy, drop, store {
  /// USDC base units (six decimals).
  value: u64,
}

// === Method Aliases ===

public use fun usdc_value as UsdcAmount.value;
public use fun usdc_lt as UsdcAmount.lt;
public use fun usdc_le as UsdcAmount.le;
public use fun usdc_add as UsdcAmount.add;
public use fun usdc_sub as UsdcAmount.sub;
public use fun usdc_min as UsdcAmount.min;
public use fun usdc_ge as UsdcAmount.ge;

// === Public Functions ===

/// Wraps a USDC base-unit amount (six decimals).
public fun usdc(value: u64): UsdcAmount { UsdcAmount { value } }

/// Checked narrowing for amounts computed in `u128` (see `nth::risk`).
/// Aborts with `EOverflow` instead of silently truncating.
public fun usdc_from_u128(value: u128): UsdcAmount {
  assert!(value <= MAX_U64, EOverflow);
  UsdcAmount { value: value as u64 }
}

public fun usdc_value(amount: UsdcAmount): u64 { amount.value }

public fun usdc_lt(amount: UsdcAmount, other: UsdcAmount): bool {
  amount.value < other.value
}

public fun usdc_le(amount: UsdcAmount, other: UsdcAmount): bool {
  amount.value <= other.value
}

/// Aborts on underflow; callers must ensure `amount >= other`.
public fun usdc_sub(amount: UsdcAmount, other: UsdcAmount): UsdcAmount {
  UsdcAmount { value: amount.value - other.value }
}

public fun usdc_add(amount: UsdcAmount, other: UsdcAmount): UsdcAmount {
  UsdcAmount { value: amount.value + other.value }
}

public fun usdc_min(amount: UsdcAmount, other: UsdcAmount): UsdcAmount {
  if (amount.value <= other.value) { amount } else { other }
}

public fun usdc_ge(amount: UsdcAmount, other: UsdcAmount): bool {
  amount.value >= other.value
}

/// Fixed-point market quantities.
///
/// Prices, sizes, leverage, and USDC amounts are all scaled by
/// `float_scaling()`, but they are NOT interchangeable:
/// multiplying two scaled values yields a double-scaled result, and mixing
/// units silently corrupts margin math. Each quantity therefore gets its
/// own type; the formulas that combine them (and juggle the scaling
/// factors) live in `nth::risk`.
module nth::units;

// === Fixed-Point Scale ===

/// Fixed-point scale for prices, sizes, and leverage. MUST equal
/// 10^(USDC decimals) = 10^6: margin math relies on one factor of
/// FLOAT_SCALING cancelling against USDC's base-unit denominator so
/// `risk::margin_required` lands in `Balance<USDC>` base units. USDC has 6
/// decimals (`6, // decimals` in the `create_currency` call):
/// https://github.com/circlefin/stablecoin-sui/blob/master/packages/usdc/sources/usdc.move
const FLOAT_SCALING: u64 = 1_000_000;

public fun float_scaling(): u64 {
  FLOAT_SCALING
}

// === Price ===

/// USDC-per-token price, scaled by `float_scaling()`.
public struct Price has copy, drop, store { value: u64 }

public fun price(value: u64): Price { Price { value } }

public fun price_value(price: Price): u64 { price.value }

public use fun price_value as Price.value;

public fun price_is_zero(price: Price): bool { price.value == 0 }

public use fun price_is_zero as Price.is_zero;

public fun price_lt(price: Price, other: Price): bool {
  price.value < other.value
}

public use fun price_lt as Price.lt;

public fun price_le(price: Price, other: Price): bool {
  price.value <= other.value
}

public use fun price_le as Price.le;

public fun price_gt(price: Price, other: Price): bool {
  price.value > other.value
}

public use fun price_gt as Price.gt;

public fun price_ge(price: Price, other: Price): bool {
  price.value >= other.value
}

public use fun price_ge as Price.ge;

// === Size ===

/// Token quantity, scaled by `float_scaling()`.
public struct Size has copy, drop, store { value: u64 }

public fun size(value: u64): Size { Size { value } }

public fun size_value(size: Size): u64 { size.value }

public use fun size_value as Size.value;

public fun size_zero(): Size { Size { value: 0 } }

public fun size_is_zero(size: Size): bool { size.value == 0 }

public use fun size_is_zero as Size.is_zero;

/// Aborts on underflow, so callers state the `size >= other` invariant.
public fun size_sub(size: Size, other: Size): Size {
  Size { value: size.value - other.value }
}

public use fun size_sub as Size.sub;

public fun size_add(size: Size, other: Size): Size {
  Size { value: size.value + other.value }
}

public use fun size_add as Size.add;

public fun size_min(size: Size, other: Size): Size {
  if (size.value <= other.value) { size } else { other }
}

public use fun size_min as Size.min;

public fun size_eq(size: Size, other: Size): bool {
  size.value == other.value
}

public use fun size_eq as Size.eq;

// === Leverage ===

/// Position leverage multiplier, scaled by `float_scaling()`
/// (2x leverage = `2 * float_scaling()`).
public struct Leverage has copy, drop, store { value: u64 }

public fun leverage(value: u64): Leverage { Leverage { value } }

public fun leverage_value(leverage: Leverage): u64 { leverage.value }

public use fun leverage_value as Leverage.value;

public fun leverage_is_zero(leverage: Leverage): bool { leverage.value == 0 }

public use fun leverage_is_zero as Leverage.is_zero;

public fun leverage_le(leverage: Leverage, other: Leverage): bool {
  leverage.value <= other.value
}

public use fun leverage_le as Leverage.le;

// === UsdcAmount ===

/// USDC amount in base units. 1 USDC = 10^6 base units (USDC has 6
/// decimals, `decimals = 6` in
/// https://github.com/circlefin/stablecoin-sui/blob/master/packages/usdc/sources/usdc.move).
/// Because 10^6 is also `float_scaling()`, dividing a
/// price-times-size product (double-scaled) by scaled leverage lands
/// exactly in base units — `risk::margin_required` depends on this and
/// `FLOAT_SCALING` above documents the coupling.
public struct UsdcAmount has copy, drop, store { value: u64 }

/// A u128 amount does not fit u64 base units. Move's `as u64` silently
/// truncates, so wide arithmetic must narrow through `usdc_from_u128`.
const EOverflow: u64 = 1;

const MAX_U64: u128 = 18_446_744_073_709_551_615;

public fun usdc(value: u64): UsdcAmount { UsdcAmount { value } }

/// Checked narrowing for amounts computed in u128 (see `nth::risk`).
/// Aborts with `EOverflow` instead of silently truncating — a truncated
/// margin would pass the zero/balance checks with a sliver of the real
/// collateral requirement.
public fun usdc_from_u128(value: u128): UsdcAmount {
  assert!(value <= MAX_U64, EOverflow);
  UsdcAmount { value: value as u64 }
}

public fun usdc_value(amount: UsdcAmount): u64 { amount.value }

public use fun usdc_value as UsdcAmount.value;

public fun usdc_lt(amount: UsdcAmount, other: UsdcAmount): bool {
  amount.value < other.value
}

public use fun usdc_lt as UsdcAmount.lt;

public fun usdc_le(amount: UsdcAmount, other: UsdcAmount): bool {
  amount.value <= other.value
}

public use fun usdc_le as UsdcAmount.le;

public fun usdc_add(amount: UsdcAmount, other: UsdcAmount): UsdcAmount {
  UsdcAmount { value: amount.value + other.value }
}

public use fun usdc_add as UsdcAmount.add;

/// Aborts on underflow, so callers state the `amount >= other` invariant.
public fun usdc_sub(amount: UsdcAmount, other: UsdcAmount): UsdcAmount {
  UsdcAmount { value: amount.value - other.value }
}

public use fun usdc_sub as UsdcAmount.sub;

public fun usdc_min(amount: UsdcAmount, other: UsdcAmount): UsdcAmount {
  if (amount.value <= other.value) { amount } else { other }
}

public use fun usdc_min as UsdcAmount.min;

public fun usdc_ge(amount: UsdcAmount, other: UsdcAmount): bool {
  amount.value >= other.value
}

public use fun usdc_ge as UsdcAmount.ge;

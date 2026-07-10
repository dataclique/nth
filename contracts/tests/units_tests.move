#[test_only]
module strike::units_tests;

use strike::units;

const MAX_U64: u64 = 18_446_744_073_709_551_615;

// === Price comparisons ===

#[test]
fun price_comparisons_at_equality() {
  let first = units::price(100);
  let second = units::price(100);
  assert!(!first.lt(second), 0);
  assert!(first.le(second), 1);
  assert!(!first.gt(second), 2);
  assert!(first.ge(second), 3);
}

#[test]
fun price_comparisons_strict_order() {
  let lo = units::price(99);
  let hi = units::price(100);
  assert!(lo.lt(hi), 0);
  assert!(lo.le(hi), 1);
  assert!(!lo.gt(hi), 2);
  assert!(!lo.ge(hi), 3);
  assert!(!hi.lt(lo), 4);
  assert!(!hi.le(lo), 5);
  assert!(hi.gt(lo), 6);
  assert!(hi.ge(lo), 7);
}

// === Size arithmetic ===

#[test, expected_failure(arithmetic_error, location = strike::units)]
fun size_sub_underflow_aborts() {
  let _ = units::size(1).sub(units::size(2));
}

#[test, expected_failure(arithmetic_error, location = strike::units)]
fun size_add_overflow_aborts() {
  let _ = units::size(MAX_U64).add(units::size(1));
}

#[test]
fun size_min_is_symmetric() {
  let small = units::size(3);
  let big = units::size(7);
  assert!(small.min(big).eq(units::size(3)), 0);
  assert!(big.min(small).eq(units::size(3)), 1);
  assert!(small.min(small).eq(small), 2);
}

#[test]
fun size_zero_boundaries() {
  assert!(units::size_zero().is_zero(), 0);
  assert!(!units::size(1).is_zero(), 1);
  // Subtracting a size from itself lands exactly on zero.
  assert!(units::size(5).sub(units::size(5)).is_zero(), 2);
}

// === UsdcAmount comparisons ===

#[test]
fun usdc_comparisons_at_equality() {
  let first = units::usdc(100);
  let second = units::usdc(100);
  assert!(!first.lt(second), 0);
  assert!(first.le(second), 1);
  assert!(first.ge(second), 2);
}

#[test]
fun usdc_comparisons_strict_order() {
  let lo = units::usdc(99);
  let hi = units::usdc(100);
  assert!(lo.lt(hi), 0);
  assert!(lo.le(hi), 1);
  assert!(!lo.ge(hi), 2);
  assert!(!hi.lt(lo), 3);
  assert!(!hi.le(lo), 4);
  assert!(hi.ge(lo), 5);
}

// === Leverage ===

#[test]
fun leverage_le_boundary_at_equality() {
  let two_x = units::leverage(2_000_000);
  assert!(two_x.le(units::leverage(2_000_000)), 0);
  assert!(two_x.le(units::leverage(2_000_001)), 1);
  assert!(!two_x.le(units::leverage(1_999_999)), 2);
}

#[test]
fun leverage_is_zero_boundary() {
  assert!(units::leverage(0).is_zero(), 0);
  assert!(!units::leverage(1).is_zero(), 1);
}

// === Checked narrowing (usdc_from_u128) ===

#[test]
fun usdc_from_u128_at_u64_max_succeeds() {
  // The largest value that fits u64 narrows without loss.
  let amount = units::usdc_from_u128(MAX_U64 as u128);
  assert!(amount.value() == MAX_U64, 0);
}

#[test]
fun usdc_from_u128_below_max_is_exact() {
  let amount = units::usdc_from_u128(1_000_000);
  assert!(amount.value() == 1_000_000, 0);
}

#[test, expected_failure(abort_code = units::EOverflow)]
fun usdc_from_u128_above_u64_max_aborts() {
  // One past u64::MAX must abort rather than silently truncate. (Also
  // confirms the private EOverflow constant is usable in expected_failure
  // from a sibling test module — no `public` needed.)
  let _ = units::usdc_from_u128((MAX_U64 as u128) + 1);
}

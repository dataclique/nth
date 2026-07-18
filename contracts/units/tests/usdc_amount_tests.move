#[test_only]
module units::usdc_amount_tests;

use units::usdc_amount;

const MAX_U64: u64 = 18_446_744_073_709_551_615;

#[test]
fun comparisons_at_equality() {
  let first = usdc_amount::usdc(100);
  let second = usdc_amount::usdc(100);
  assert!(!first.lt(second), 0);
  assert!(first.le(second), 1);
  assert!(first.ge(second), 2);
}

#[test]
fun comparisons_strict_order() {
  let lo = usdc_amount::usdc(99);
  let hi = usdc_amount::usdc(100);
  assert!(lo.lt(hi), 0);
  assert!(lo.le(hi), 1);
  assert!(!lo.ge(hi), 2);
  assert!(!hi.lt(lo), 3);
  assert!(!hi.le(lo), 4);
  assert!(hi.ge(lo), 5);
}

#[test]
fun from_u128_at_u64_max_succeeds() {
  let amount = usdc_amount::usdc_from_u128(MAX_U64 as u128);
  assert!(amount.value() == MAX_U64, 0);
}

#[test]
fun from_u128_below_max_is_exact() {
  let amount = usdc_amount::usdc_from_u128(1_000_000);
  assert!(amount.value() == 1_000_000, 0);
}

#[test, expected_failure(abort_code = usdc_amount::EOverflow)]
fun from_u128_above_u64_max_aborts() {
  let _ = usdc_amount::usdc_from_u128((MAX_U64 as u128) + 1);
}

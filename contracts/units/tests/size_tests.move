#[test_only]
module units::size_tests;

use units::size;

const MAX_U64: u64 = 18_446_744_073_709_551_615;

#[test, expected_failure(arithmetic_error, location = units::size)]
fun sub_underflow_aborts() {
  let _ = size::size(1).sub(size::size(2));
}

#[test, expected_failure(arithmetic_error, location = units::size)]
fun add_overflow_aborts() {
  let _ = size::size(MAX_U64).add(size::size(1));
}

#[test]
fun min_is_symmetric() {
  let small = size::size(3);
  let big = size::size(7);
  assert!(small.min(big).eq(size::size(3)), 0);
  assert!(big.min(small).eq(size::size(3)), 1);
  assert!(small.min(small).eq(small), 2);
}

#[test]
fun zero_boundaries() {
  assert!(size::size_zero().is_zero(), 0);
  assert!(!size::size(1).is_zero(), 1);
  assert!(size::size(5).sub(size::size(5)).is_zero(), 2);
}

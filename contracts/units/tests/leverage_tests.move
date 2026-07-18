#[test_only]
module units::leverage_tests;

use units::leverage;

#[test]
fun le_boundary_at_equality() {
  let two_x = leverage::leverage(2_000_000);
  assert!(two_x.le(leverage::leverage(2_000_000)), 0);
  assert!(two_x.le(leverage::leverage(2_000_001)), 1);
  assert!(!two_x.le(leverage::leverage(1_999_999)), 2);
}

#[test]
fun is_zero_boundary() {
  assert!(leverage::leverage(0).is_zero(), 0);
  assert!(!leverage::leverage(1).is_zero(), 1);
}

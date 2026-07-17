#[test_only]
module units::price_tests;

use units::price;

#[test]
fun comparisons_at_equality() {
  let first = price::price(100);
  let second = price::price(100);
  assert!(!first.lt(second), 0);
  assert!(first.le(second), 1);
  assert!(!first.gt(second), 2);
  assert!(first.ge(second), 3);
}

#[test]
fun comparisons_strict_order() {
  let lo = price::price(99);
  let hi = price::price(100);
  assert!(lo.lt(hi), 0);
  assert!(lo.le(hi), 1);
  assert!(!lo.gt(hi), 2);
  assert!(!lo.ge(hi), 3);
  assert!(!hi.lt(lo), 4);
  assert!(!hi.le(lo), 5);
  assert!(hi.gt(lo), 6);
  assert!(hi.ge(lo), 7);
}

#[test_only]
module units::examples_tests;

use units::maintenance_rate;
use units::scaled_order;

#[test]
fun scaled_order_example_quantities() {
  let (price, size, leverage) = scaled_order::example_order_quantities();
  assert!(price.value() == 100 * 1_000_000, 0);
  assert!(size.value() == 10 * 1_000_000, 1);
  assert!(leverage.value() == 2 * 1_000_000, 2);
}

#[test]
fun maintenance_rate_example_default() {
  assert!(maintenance_rate::example_default_pool_rate().value() == 25, 0);
  assert!(maintenance_rate::example_rate_is_not_float_scaled(), 1);
}

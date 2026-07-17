#[test_only]
module units::maintenance_margin_rate_tests;

use units::maintenance_margin_rate;
use units::scaling::float_scaling;

#[test]
fun is_plain_percent_not_scaled() {
  let rate = maintenance_margin_rate::maintenance_margin_rate(25);
  assert!(rate.value() == 25, 0);
  assert!(rate.value() != 25 * float_scaling(), 1);
}

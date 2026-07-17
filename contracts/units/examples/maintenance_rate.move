/// Example: maintenance margin rate is a plain percent, not float-scaled.
///
/// Contrast with `scaled_order`, where price and size are multiplied by
/// `float_scaling()`. Passing a scaled value here would corrupt margin math.
module units::maintenance_rate;

use units::maintenance_margin_rate::{Self, MaintenanceMarginRate};
use units::scaling::float_scaling;

// === Public Functions ===

/// Returns the default 25% maintenance margin rate used by `nth::pool::new`.
public fun example_default_pool_rate(): MaintenanceMarginRate {
  maintenance_margin_rate::maintenance_margin_rate(25)
}

/// Demonstrates that the rate is **not** scaled like prices or sizes.
public fun example_rate_is_not_float_scaled(): bool {
  let rate = maintenance_margin_rate::maintenance_margin_rate(25);
  rate.value() == 25 && rate.value() != 25 * float_scaling()
}

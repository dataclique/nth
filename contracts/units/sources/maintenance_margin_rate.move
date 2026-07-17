/// Maintenance margin as a percent of position notional.
///
/// Unlike `Price`, `Size`, and `Leverage`, this is **not** scaled by
/// `scaling::float_scaling()`: 25 means 25%. Valid range `(0, 100]` is
/// enforced at `nth::pool::new`, not in this module.
module units::maintenance_margin_rate;

// === Structs ===

public struct MaintenanceMarginRate has copy, drop, store {
  /// Plain percent (25 = 25%).
  value: u64,
}

// === Method Aliases ===

public use fun maintenance_margin_rate_value as MaintenanceMarginRate.value;

// === Public Functions ===

/// Wraps a maintenance margin percent. 25% → `maintenance_margin_rate(25)`.
public fun maintenance_margin_rate(percent: u64): MaintenanceMarginRate {
  MaintenanceMarginRate { value: percent }
}

public fun maintenance_margin_rate_value(rate: MaintenanceMarginRate): u64 {
  rate.value
}

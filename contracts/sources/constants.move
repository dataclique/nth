module strike::constants;

// === Constants ===

const DEFAULT_MAINTENANCE_MARGIN_RATE: u64 = 25; // 25%

/// Fixed-point scale for prices, sizes, and leverage (see strike::units).
/// MUST equal 10^(USDC decimals) = 10^6: margin math relies on one factor
/// of FLOAT_SCALING cancelling against USDC's base-unit denominator so
/// `risk::margin_required` lands in `Balance<USDC>` base units. USDC has 6
/// decimals (`6, // decimals` in the `create_currency` call):
/// https://github.com/circlefin/stablecoin-sui/blob/master/packages/usdc/sources/usdc.move
const FLOAT_SCALING: u64 = 1_000_000;

// === Public Functions ===

public fun default_maintenance_margin_rate(): u64 {
  DEFAULT_MAINTENANCE_MARGIN_RATE
}

public fun float_scaling(): u64 {
  FLOAT_SCALING
}

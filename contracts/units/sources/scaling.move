/// Fixed-point scale shared by `Price`, `Size`, and `Leverage`.
///
/// The factor MUST equal $10^{\text{USDC decimals}}$: margin math in
/// `nth::risk` relies on one factor of `FLOAT_SCALING` cancelling against
/// USDC's base-unit denominator so `margin_required` lands in `UsdcAmount`
/// base units.
module units::scaling;

// === Constants ===

/// $10^6$ — matches USDC's six decimal places (see
/// [circlefin/stablecoin-sui `usdc.move`](https://github.com/circlefin/stablecoin-sui/blob/master/packages/usdc/sources/usdc.move)).
const FLOAT_SCALING: u64 = 1_000_000;

// === Public Functions ===

/// Returns the fixed-point scale ($10^6$) for prices, sizes, and leverage.
public fun float_scaling(): u64 {
  FLOAT_SCALING
}

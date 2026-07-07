module strike::constants;

const DEFAULT_MAINTANCE_MARGIN_RATE: u64 = 25; // 25%

/// Fixed-point scale for prices, sizes, and leverage (see strike::units).
/// MUST equal 10^(USDC decimals) = 10^6: margin math relies on one factor
/// of FLOAT_SCALING cancelling against USDC's base-unit denominator so
/// `risk::margin_required` lands in `Balance<USDC>` base units. USDC has 6
/// decimals per circlefin/stablecoin-sui `packages/usdc/sources/usdc.move`
/// (`6, // decimals` in the `create_currency` call).
const FLOAT_SCALING: u64 = 1_000_000;

public fun default_maintance_margin_rate(): u64 {
  DEFAULT_MAINTANCE_MARGIN_RATE
}

public fun float_scaling(): u64 {
  FLOAT_SCALING
}

// const MAX_U64: u64 = ((1u128 << 64) - 1) as u64;
// const MAX_U128: u128 = ((1u256 << 128) - 1) as u128;
// const CURRENT_VERSION: u64 = 2; // Update version during upgrades
// const POOL_CREATION_FEE: u64 = 500 * 1_000_000; // 500 DEEP
// const FLOAT_SCALING: u64 = 1_000_000_000;
// const FLOAT_SCALING_U128: u128 = 1_000_000_000;
// const MIN_PRICE: u64 = 1;
// const MAX_PRICE: u64 = ((1u128 << 63) - 1) as u64;
// const HALF: u64 = 500_000_000;
// const DEEP_UNIT: u64 = 1_000_000;
// const FEE_PENALTY_MULTIPLIER: u64 = 1_250_000_000; // 25% more than normal

module strike::constants;

const DEFAULT_MAINTANCE_PERSENTAGE_MARGIN: u64 = 25; // 25%

public fun default_maintance_persentage_margin(): u64 {
  DEFAULT_MAINTANCE_PERSENTAGE_MARGIN
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

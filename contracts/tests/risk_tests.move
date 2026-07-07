#[test_only]
module strike::risk_tests;

use strike::constants;
use strike::order;
use strike::risk;
use strike::units::{Self, Price, Size, Leverage, UsdcAmount};

/// Maintenance margin rate used across the boundary tests (25%), matching
/// `constants::default_maintance_margin_rate()`.
const RATE: u64 = 25;

fun px(value: u64): Price { units::price(value*constants::float_scaling()) }

fun sz(value: u64): Size { units::size(value*constants::float_scaling()) }

fun lev(value: u64): Leverage {
  units::leverage(value*constants::float_scaling())
}

fun us(value: u64): UsdcAmount {
  units::usdc(value*constants::float_scaling())
}

// === margin_required ===

#[test]
fun margin_required_divides_exactly() {
  // 100 * 10 / 2 = 500 USDC with no remainder.
  let margin = risk::margin_required(px(100), sz(10), lev(2));
  assert!(margin.value() == us(500).value(), 0);
}

#[test]
fun margin_required_rounds_down() {
  // 100 * 1 / 3 = 33.333... USDC; floor lands at 33_333_333 base units.
  let margin = risk::margin_required(px(100), sz(1), lev(3));
  assert!(margin.value() == 33_333_333, 0);
}

#[test]
fun margin_required_survives_u64_overflowing_notional() {
  // (100_000 * FS) * (1000 * FS) = 10^20 overflows u64; the u128
  // intermediate must carry it. Result: exactly 100_000_000 USDC.
  let margin = risk::margin_required(px(100_000), sz(1000), lev(1));
  assert!(margin.value() == us(100_000_000).value(), 0);
}

// === maintenance_margin ===

#[test]
fun maintenance_margin_divides_exactly() {
  // 2 tokens * 100 USDC * 25% = 50 USDC with no remainder.
  let maintenance = risk::maintenance_margin(px(100), sz(2), RATE);
  assert!(maintenance.value() == us(50).value(), 0);
}

#[test]
fun maintenance_margin_rounds_down() {
  // 1 token at a 7-base-unit price: 7 * 25 / 100 = 1.75 base units of
  // USDC; floors to 1.
  let maintenance = risk::maintenance_margin(units::price(7), sz(1), RATE);
  assert!(maintenance.value() == 1, 0);
}

#[test]
fun maintenance_margin_survives_u64_overflowing_product() {
  // (1000 * FS) * (100_000 * FS) * 25 = 2.5 * 10^21 overflows u64; the
  // u128 intermediate must carry it. Result: exactly 25_000_000 USDC.
  let maintenance = risk::maintenance_margin(px(100_000), sz(1000), RATE);
  assert!(maintenance.value() == us(25_000_000).value(), 0);
}

// === max_leverage ===

#[test]
fun max_leverage_inverts_the_maintenance_rate() {
  assert!(risk::max_leverage(25).value() == lev(4).value(), 0);
  assert!(risk::max_leverage(20).value() == lev(5).value(), 1);
  assert!(risk::max_leverage(50).value() == lev(2).value(), 2);
  assert!(risk::max_leverage(100).value() == lev(1).value(), 3);
  assert!(risk::max_leverage(1).value() == lev(100).value(), 4);
}

// === is_liquidated: long ===

#[test]
fun long_at_max_leverage_liquidates_at_entry() {
  // lev 4 == max_leverage(25): initial margin equals maintenance, the
  // buffer is zero, and the liquidation price is the entry price itself.
  let margin = risk::margin_required(px(100), sz(2), lev(4));
  assert!(
    risk::is_liquidated(order::bid(), px(100), sz(2), margin, RATE, px(100)),
    0,
  );
}

#[test]
fun long_at_max_leverage_survives_one_base_unit_above_entry() {
  let margin = risk::margin_required(px(100), sz(2), lev(4));
  let one_above = units::price(px(100).value() + 1);
  assert!(
    !risk::is_liquidated(
      order::bid(), px(100), sz(2), margin, RATE, one_above,
    ),
    0,
  );
}

#[test]
fun long_mid_range_liquidation_price_boundary() {
  // entry 100, lev 2, rate 25: margin 50/token, maintenance 25/token,
  // buffer 25 -> liquidation price 75. Exactly 75 liquidates; one base
  // unit above survives.
  let margin = risk::margin_required(px(100), sz(1), lev(2));
  assert!(
    risk::is_liquidated(order::bid(), px(100), sz(1), margin, RATE, px(75)),
    0,
  );
  let one_above = units::price(px(75).value() + 1);
  assert!(
    !risk::is_liquidated(
      order::bid(), px(100), sz(1), margin, RATE, one_above,
    ),
    1,
  );
}

#[test]
fun long_with_oversized_margin_is_never_price_liquidated() {
  // Synthetic margin of 2x the notional (possible via future funding
  // credits): buffer = 175 exceeds entry = 100, so the liquidation price
  // would be negative. A long in this state can never be liquidated by a
  // price drop — even a crash to 1 base unit leaves it alive.
  assert!(
    !risk::is_liquidated(
      order::bid(), px(100), sz(1), us(200), RATE, units::price(1),
    ),
    0,
  );
}

// === is_liquidated: short ===

#[test]
fun short_liquidation_price_boundary() {
  // entry 100, lev 2, rate 25: buffer 25 -> liquidation price 125.
  // Exactly 125 liquidates; one base unit below survives.
  let margin = risk::margin_required(px(100), sz(2), lev(2));
  assert!(
    risk::is_liquidated(order::ask(), px(100), sz(2), margin, RATE, px(125)),
    0,
  );
  let one_below = units::price(px(125).value() - 1);
  assert!(
    !risk::is_liquidated(
      order::ask(), px(100), sz(2), margin, RATE, one_below,
    ),
    1,
  );
}

#[test]
fun short_with_huge_synthetic_margin_survives_extreme_prices() {
  // A 10^9 USDC margin on a 1-token short pushes the liquidation price to
  // ~10^15 base units; `entry + buffer` must not overflow in u128, and no
  // realistic price reaches it.
  let margin = units::usdc(1_000_000_000 * constants::float_scaling());
  assert!(
    !risk::is_liquidated(
      order::ask(), px(100), sz(1), margin, RATE, px(1_000_000),
    ),
    0,
  );
}

// === is_liquidated: born past the threshold ===

#[test]
fun margin_below_maintenance_liquidates_at_any_price() {
  // One base unit below maintenance: past the threshold regardless of
  // where the price sits, on both sides. The naive `margin - maintenance`
  // would underflow here; the guard must fire first.
  let maintenance = risk::maintenance_margin(px(100), sz(2), RATE);
  let margin = units::usdc(maintenance.value() - 1);
  assert!(
    risk::is_liquidated(
      order::bid(), px(100), sz(2), margin, RATE, units::price(1),
    ),
    0,
  );
  assert!(
    risk::is_liquidated(
      order::ask(), px(100), sz(2), margin, RATE, units::price(1),
    ),
    1,
  );
}

// === refund_for_unfilled ===

#[test]
fun refund_for_untouched_order_equals_margin_required() {
  // Same formula as margin_required, so a full cancel returns exactly what
  // was locked — including the truncation lev 3 forces.
  let locked = risk::margin_required(px(100), sz(10), lev(3));
  let refund = risk::refund_for_unfilled(sz(10), px(100), lev(3));
  assert!(refund.value() == locked.value(), 0);
}

#[test]
fun refund_for_half_filled_order_is_half_the_margin() {
  let locked = risk::margin_required(px(100), sz(10), lev(2));
  let refund = risk::refund_for_unfilled(sz(5), px(100), lev(2));
  assert!(refund.value() * 2 == locked.value(), 0);
}

#[test]
fun refund_rounds_down() {
  // 1 base unit of size at price 100 with lev 3: 10^8 / (3 * 10^6) floors
  // to 33 base units.
  let refund = risk::refund_for_unfilled(units::size(1), px(100), lev(3));
  assert!(refund.value() == 33, 0);
}

#[test]
fun refund_of_dust_rounds_to_zero() {
  // 1 base unit of size at a 1-base-unit price refunds 10^-12 USDC, which
  // floors to 0: the protocol keeps the dust.
  let refund =
    risk::refund_for_unfilled(units::size(1), units::price(1), lev(1));
  assert!(refund.value() == 0, 0);
}

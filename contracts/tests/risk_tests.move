#[test_only]
module nth::risk_tests;

use nth::order;
use nth::risk;
use nth::units::{Self, Price, Size, Leverage, UsdcAmount};

/// Maintenance margin rate used across the boundary tests (25%), matching
/// `pool::default_maintenance_margin_rate()`.
const RATE: u64 = 25;

fun px(value: u64): Price { units::price(value*units::float_scaling()) }

fun sz(value: u64): Size { units::size(value*units::float_scaling()) }

fun lev(value: u64): Leverage {
  units::leverage(value*units::float_scaling())
}

fun us(value: u64): UsdcAmount {
  units::usdc(value*units::float_scaling())
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

/// Executable pin of the FLOAT_SCALING == 10^(USDC decimals) coupling
/// documented in `units.move`: 1 USDC of price times 1 token of size at
/// 1x leverage must land at exactly 1_000_000 base units == 1 USDC. If
/// either scale drifts from the other, this fails.
#[test]
fun test_one_usdc_of_margin_lands_in_base_units() {
  let margin = risk::margin_required(
    units::price(1_000_000),
    units::size(1_000_000),
    units::leverage(1_000_000),
  );
  assert!(margin.value() == 1_000_000, 0);
}

#[test]
fun margin_required_survives_u64_overflowing_notional() {
  // (100_000 * FS) * (1000 * FS) = 10^20 overflows u64; the u128
  // intermediate must carry it. Result: exactly 100_000_000 USDC.
  let margin = risk::margin_required(px(100_000), sz(1000), lev(1));
  assert!(margin.value() == us(100_000_000).value(), 0);
}

/// Move's `as u64` truncates silently; the checked narrowing in
/// `units::usdc_from_u128` turns a wrap-around margin into an abort.
/// Price 10^13 * size 2*10^12 at 1x leverage puts the u128 result at
/// 2*10^19 base units, past u64::MAX.
#[test, expected_failure(abort_code = units::EOverflow)]
fun margin_overflowing_u64_aborts() {
  let _ = risk::margin_required(
    units::price(10_000_000_000_000),
    units::size(2_000_000_000_000),
    units::leverage(1_000_000),
  );
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
  let margin = units::usdc(1_000_000_000 * units::float_scaling());
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
fun refund_for_untouched_order_equals_margin() {
  // A fully unfilled cancel returns the whole stored margin exactly.
  let locked = risk::margin_required(px(100), sz(10), lev(3));
  let refund = risk::refund_for_unfilled(locked, sz(10), sz(10));
  assert!(refund.value() == locked.value(), 0);
}

#[test]
fun refund_for_half_filled_order_is_half_the_margin() {
  let locked = risk::margin_required(px(100), sz(10), lev(2));
  let refund = risk::refund_for_unfilled(locked, sz(5), sz(10));
  assert!(refund.value() * 2 == locked.value(), 0);
}

#[test]
fun refund_rounds_down() {
  // 100 USDC of margin over a size of 3 tokens, cancelling 1 token:
  // 10^8 / 3 floors to 33_333_333 base units.
  let margin = units::usdc(100 * units::float_scaling());
  let refund = risk::refund_for_unfilled(margin, sz(1), sz(3));
  assert!(refund.value() == 33_333_333, 0);
}

#[test]
fun refund_of_dust_rounds_to_zero() {
  // 1 base unit of margin spread over 2 base units of size: cancelling 1
  // refunds 0.5 base units, which floors to 0 — the protocol keeps dust.
  let refund = risk::refund_for_unfilled(
    units::usdc(1),
    units::size(1),
    units::size(2),
  );
  assert!(refund.value() == 0, 0);
}

// === Property tests (randomized) ===

// Shared domain reductions: prices land in [1 .. 10^12] base units (up to
// 10^6 USDC per token), sizes in [1 .. 10^10] base units (up to 10^4
// tokens), and leverage in [1x .. 4x] scaled — 4x is max_leverage(RATE),
// so every combination is a position the protocol could actually hold, and
// every u128 intermediate stays far from overflow.

/// Domain: price in [1 .. 10^12], size in [1 .. 10^10] base units,
/// leverage in [1x .. 4x] scaled. At >= 1x leverage the initial margin can
/// never exceed the notional value `price * size / FLOAT_SCALING`.
#[random_test]
fun random_margin_never_exceeds_balance_proxy(
  raw_price: u64,
  raw_size: u64,
  raw_leverage: u64,
) {
  let price = units::price(raw_price % 1_000_000_000_000 + 1);
  let size = units::size(raw_size % 10_000_000_000 + 1);
  let fs = units::float_scaling();
  let leverage = units::leverage(fs + raw_leverage % (3 * fs + 1));

  let margin = risk::margin_required(price, size, leverage);
  let notional =
    (price.value() as u128) * (size.value() as u128)
      / (units::float_scaling() as u128);
  assert!((margin.value() as u128) <= notional, 0);
}

/// Domain: same price/size/leverage ranges as above, with unfilled reduced
/// into [0 .. size]. Cancelling part of an order never refunds more than
/// the margin charged for the whole order.
#[random_test]
fun random_refund_never_exceeds_margin(
  raw_price: u64,
  raw_size: u64,
  raw_unfilled: u64,
  raw_leverage: u64,
) {
  let price = units::price(raw_price % 1_000_000_000_000 + 1);
  let size_value = raw_size % 10_000_000_000 + 1;
  let size = units::size(size_value);
  let unfilled = units::size(raw_unfilled % (size_value + 1));
  let fs = units::float_scaling();
  let leverage = units::leverage(fs + raw_leverage % (3 * fs + 1));

  let margin = risk::margin_required(price, size, leverage);
  let refund = risk::refund_for_unfilled(margin, unfilled, size);
  assert!(refund.le(margin), 0);
}

/// Domain: entry and both current prices in [1 .. 10^12] base units, size
/// in [1 .. 10^10] base units, leverage in [1x .. 4x] scaled. A long
/// liquidated at some price stays liquidated at every lower price.
#[random_test]
fun random_liquidation_monotone_in_price_for_longs(
  raw_entry: u64,
  raw_size: u64,
  raw_leverage: u64,
  raw_p1: u64,
  raw_p2: u64,
) {
  let entry = units::price(raw_entry % 1_000_000_000_000 + 1);
  let size = units::size(raw_size % 10_000_000_000 + 1);
  let fs = units::float_scaling();
  let leverage = units::leverage(fs + raw_leverage % (3 * fs + 1));
  let margin = risk::margin_required(entry, size, leverage);

  let a = raw_p1 % 1_000_000_000_000 + 1;
  let b = raw_p2 % 1_000_000_000_000 + 1;
  if (a == b) return;
  let (lo, hi) = if (a < b) { (a, b) } else { (b, a) };
  let lo = units::price(lo);
  let hi = units::price(hi);

  if (risk::is_liquidated(order::bid(), entry, size, margin, RATE, hi)) {
    assert!(
      risk::is_liquidated(order::bid(), entry, size, margin, RATE, lo),
      0,
    );
  }
}

/// Domain: mirror of the long test — same reductions. A short liquidated
/// at some price stays liquidated at every higher price.
#[random_test]
fun random_liquidation_monotone_in_price_for_shorts(
  raw_entry: u64,
  raw_size: u64,
  raw_leverage: u64,
  raw_p1: u64,
  raw_p2: u64,
) {
  let entry = units::price(raw_entry % 1_000_000_000_000 + 1);
  let size = units::size(raw_size % 10_000_000_000 + 1);
  let fs = units::float_scaling();
  let leverage = units::leverage(fs + raw_leverage % (3 * fs + 1));
  let margin = risk::margin_required(entry, size, leverage);

  let a = raw_p1 % 1_000_000_000_000 + 1;
  let b = raw_p2 % 1_000_000_000_000 + 1;
  if (a == b) return;
  let (lo, hi) = if (a < b) { (a, b) } else { (b, a) };
  let lo = units::price(lo);
  let hi = units::price(hi);

  if (risk::is_liquidated(order::ask(), entry, size, margin, RATE, lo)) {
    assert!(
      risk::is_liquidated(order::ask(), entry, size, margin, RATE, hi),
      0,
    );
  }
}

/// Domain: maintenance rate in [1 .. 100]. Price and size are generous
/// whole-token multiples (100 USDC, 100 tokens) so the maintenance margin
/// divides exactly and truncation noise cannot flip either comparison:
/// margin at exactly max_leverage(rate) covers maintenance (never
/// born-dead), and one base unit of leverage above it does not.
#[random_test]
fun random_max_leverage_boundary(raw_rate: u64) {
  let rate = raw_rate % 100 + 1;
  let price = px(100);
  let size = sz(100);
  let maintenance = risk::maintenance_margin(price, size, rate);

  let max_lev = risk::max_leverage(rate);
  let at_max = risk::margin_required(price, size, max_lev);
  assert!(at_max.ge(maintenance), 0);

  let above = units::leverage(max_lev.value() + 1);
  let past_max = risk::margin_required(price, size, above);
  assert!(past_max.lt(maintenance), 1);
}

/// Domain: price in [1 .. 10^12], size in [1 .. 10^10] base units, two
/// rates in [1 .. 100] sorted into lo <= hi. Maintenance margin is
/// monotone in the rate.
#[random_test]
fun random_maintenance_margin_scales_with_rate(
  raw_price: u64,
  raw_size: u64,
  raw_r1: u64,
  raw_r2: u64,
) {
  let price = units::price(raw_price % 1_000_000_000_000 + 1);
  let size = units::size(raw_size % 10_000_000_000 + 1);
  let r1 = raw_r1 % 100 + 1;
  let r2 = raw_r2 % 100 + 1;
  let (lo, hi) = if (r1 <= r2) { (r1, r2) } else { (r2, r1) };
  assert!(
    risk::maintenance_margin(price, size, lo)
      .le(risk::maintenance_margin(price, size, hi)),
    0,
  );
}

// === funding_rate_bps ===

#[test]
fun funding_rate_longs_pay_when_mid_above_oracle() {
  // mid = (99 + 103) / 2 = 101, oracle = 100: divergence 1% = 100 bps,
  // exactly at the cap. Longs bid the book above spot, so bids pay.
  let (rate, paying_side) =
    risk::funding_rate_bps(px(99), px(103), px(100));
  assert!(rate == 100, 0);
  assert!(paying_side.is_bid(), 1);
}

#[test]
fun funding_rate_shorts_pay_when_mid_below_oracle() {
  // mid = (97 + 101) / 2 = 99, oracle = 100: divergence 1% = 100 bps,
  // asks pay.
  let (rate, paying_side) =
    risk::funding_rate_bps(px(97), px(101), px(100));
  assert!(rate == 100, 0);
  assert!(!paying_side.is_bid(), 1);
}

#[test]
fun funding_rate_zero_when_mid_equals_oracle() {
  let (rate, _) = risk::funding_rate_bps(px(99), px(101), px(100));
  assert!(rate == 0, 0);
}

#[test]
fun funding_rate_caps_at_max() {
  // mid = 150 vs oracle 100: raw divergence 50% = 5000 bps, capped.
  let (rate, paying_side) =
    risk::funding_rate_bps(px(140), px(160), px(100));
  assert!(rate == risk::max_funding_rate_bps(), 0);
  assert!(paying_side.is_bid(), 1);
}

#[test]
fun funding_rate_rounds_down() {
  // mid = (100 + 104) / 2 = 102 vs oracle 101: divergence 1/101 in bps
  // is 10_000 / 101 = 99.0099..., floored to 99.
  let (rate, _) = risk::funding_rate_bps(px(100), px(104), px(101));
  assert!(rate == 99, 0);
}

// === funding_payment ===

#[test]
fun funding_payment_is_notional_times_rate() {
  // Notional 100 * 10 = 1000 USDC at 100 bps (1%) = 10 USDC.
  let payment = risk::funding_payment(px(100), sz(10), 100);
  assert!(payment.value() == us(10).value(), 0);
}

#[test]
fun funding_payment_rounds_down() {
  // Notional 1 USDC at 3 bps: 10^6 * 3 / 10^4 = 300 base units exactly;
  // with 1 base unit of notional instead, 1 * 3 / 10^4 floors to 0.
  let whole = risk::funding_payment(px(1), sz(1), 3);
  assert!(whole.value() == 300, 0);
  let dust = risk::funding_payment(units::price(1), units::size(1), 3);
  assert!(dust.value() == 0, 1);
}

#[test]
fun funding_payment_zero_rate_is_zero() {
  let payment = risk::funding_payment(px(100), sz(10), 0);
  assert!(payment.value() == 0, 0);
}

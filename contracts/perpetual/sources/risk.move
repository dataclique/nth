/// Margin, liquidation, and funding formulas for the perpetual instrument,
/// on the shared `units::*` types. Every cross-quantity product runs in
/// u128: double-scaled intermediates (`price * size`) overflow u64 for
/// realistic inputs. Formula references: docs/margin.md, docs/liquidation.md,
/// and docs/funding.md.
module perpetual::risk;

use nth::order::{Self, Side};
use units::leverage::{Self, Leverage};
use units::maintenance_margin_rate::MaintenanceMarginRate;
use units::price::{Self, Price};
use units::scaling;
use units::size::Size;
use units::usdc_amount::{Self, UsdcAmount};

// === Constants ===

/// Per-round funding rate ceiling in basis points (100 bps = 1%). Caps the
/// margin transfer a single round can force regardless of how far the book
/// mid drifts from the mark price. Applied inside `funding_rate_bps`.
const MAX_FUNDING_RATE_BPS: u64 = 100;

/// Basis-point denominator shared by the funding rate and index math.
const BPS_DENOMINATOR: u64 = 10_000;

// === Package Functions ===

public(package) fun max_funding_rate_bps(): u64 {
  MAX_FUNDING_RATE_BPS
}

/// Initial margin backing an order: `price * size / leverage`. All three
/// inputs share the `10^6` scale, so the result lands directly in USDC
/// base units. Aborts on zero leverage (division).
public(package) fun initial_margin(
  price: Price,
  size: Size,
  leverage: Leverage,
): UsdcAmount {
  let value =
    (price.value() as u128) * (size.value() as u128)
      / (leverage.value() as u128);
  usdc_amount::usdc_from_u128(value)
}

/// Maintenance margin for a position: `price * size * rate / 100`, with one
/// float scaling divided back out of the double-scaled product. `rate` is a
/// plain percent.
public(package) fun maintenance_margin(
  price: Price,
  size: Size,
  rate: MaintenanceMarginRate,
): UsdcAmount {
  let value =
    (size.value() as u128) * (price.value() as u128)
      * (rate.value() as u128) / 100
      / (scaling::float_scaling() as u128);
  usdc_amount::usdc_from_u128(value)
}

/// The highest leverage whose initial margin still covers the maintenance
/// margin: `100 / rate` at the shared `10^6` scale. Above this bound a
/// position is born past its liquidation threshold.
public(package) fun max_leverage(rate: MaintenanceMarginRate): Leverage {
  leverage::leverage(100 * scaling::float_scaling() / rate.value())
}

/// Whether a long crosses its liquidation threshold at `mark_price`, per
/// docs/liquidation.md: margin strictly below maintenance liquidates at any
/// price; otherwise the entry price minus the per-unit margin buffer is the
/// threshold, and a buffer at or beyond the entry price is unreachable.
/// Aborts on zero size (division).
public(package) fun long_liquidated(
  entry_price: Price,
  size: Size,
  margin: UsdcAmount,
  rate: MaintenanceMarginRate,
  mark_price: Price,
): bool {
  let maintenance = maintenance_margin(entry_price, size, rate);
  if (margin.lt(maintenance)) {
    return true
  };
  let buffer = price_buffer(margin, maintenance, size);
  let entry = entry_price.value() as u128;
  let mark = mark_price.value() as u128;
  buffer < entry && entry - buffer >= mark
}

/// Whether a short crosses its liquidation threshold at `mark_price`: the
/// entry price plus the per-unit margin buffer. Margin strictly below
/// maintenance liquidates at any price. Aborts on zero size (division).
public(package) fun short_liquidated(
  entry_price: Price,
  size: Size,
  margin: UsdcAmount,
  rate: MaintenanceMarginRate,
  mark_price: Price,
): bool {
  let maintenance = maintenance_margin(entry_price, size, rate);
  if (margin.lt(maintenance)) {
    return true
  };
  let buffer = price_buffer(margin, maintenance, size);
  let entry = entry_price.value() as u128;
  let mark = mark_price.value() as u128;
  entry + buffer <= mark
}

/// Funding rate for one round from the divergence between the book mid and
/// the mark price: `|mid - mark| / mark` in basis points, capped at
/// `max_funding_rate_bps()`. Returns the rate and the side that PAYS: a mid
/// above the mark means longs bid the book above spot, so longs (bids) pay;
/// below, shorts (asks) pay. On a zero rate the returned side is
/// meaningless and callers must skip the round. Aborts on a zero mark
/// price; the oracle guarantees non-zero.
public(package) fun funding_rate_bps(
  best_bid: Price,
  best_ask: Price,
  mark_price: Price,
): (u64, Side) {
  let mid =
    ((best_bid.value() as u128) + (best_ask.value() as u128)) / 2;
  let mark = mark_price.value() as u128;

  let (divergence, paying_side) = if (mid > mark) {
    (mid - mark, order::bid())
  } else {
    (mark - mid, order::ask())
  };

  let bps = divergence * (BPS_DENOMINATOR as u128) / mark;
  let capped = MAX_FUNDING_RATE_BPS as u128;
  let rate = if (bps > capped) { capped } else { bps };
  (rate as u64, paying_side)
}

/// One round's funding-index increment for the paying side:
/// `mark_price * rate_bps`, deliberately NOT divided down so the index
/// keeps full precision. `funding_owed` divides both scalings back out.
public(package) fun funding_index_increment(
  mark_price: Price,
  rate_bps: u64,
): u128 {
  (mark_price.value() as u128) * (rate_bps as u128)
}

/// Funding owed by one position across an index delta:
/// `size * delta / 10^6 / 10^4`, where `delta` accumulates
/// `mark_price * rate_bps` per round. Aborts if the result exceeds u64.
public(package) fun funding_owed(
  size: Size,
  index_delta: u128,
): UsdcAmount {
  let value =
    (size.value() as u128) * index_delta
      / (scaling::float_scaling() as u128)
      / (BPS_DENOMINATOR as u128);
  usdc_amount::usdc_from_u128(value)
}

/// The average entry price implied by a double-scaled entry notional
/// (`sum of price * size` at `10^12`) over a `10^6`-scaled size. Aborts on
/// zero size (division).
public(package) fun implied_entry_price(
  entry_notional: u128,
  size: Size,
): Price {
  price::price(((entry_notional / (size.value() as u128)) as u64))
}

// === Private Functions ===

/// Price distance the margin buffer above maintenance covers, restoring
/// the float scaling lost dividing a base-unit margin by a scaled size.
fun price_buffer(
  margin: UsdcAmount,
  maintenance: UsdcAmount,
  size: Size,
): u128 {
  ((margin.value() - maintenance.value()) as u128)
    * (scaling::float_scaling() as u128)
    / (size.value() as u128)
}

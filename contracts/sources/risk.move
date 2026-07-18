/// Margin, liquidation, and funding formulas.
///
/// Every formula that combines fixed-point quantities lives here, computed
/// in u128: double-scaled intermediate products (`price * size`) overflow
/// u64 for realistic inputs. Formula references: docs/margin.md (margin
/// mechanism), docs/liquidation.md (liquidation thresholds), and
/// docs/funding.md (funding rate and payments).
module nth::risk;

use nth::order::{Self, Side};
use nth::units::{Self, Price, Size, Leverage, UsdcAmount};

// === Constants ===

/// Per-round funding rate ceiling in basis points (100 bps = 1%). Caps
/// the margin transfer a single round can force regardless of how far
/// the book mid drifts from the oracle price. Applied inside
/// `funding_rate_bps`.
const MAX_FUNDING_RATE_BPS: u64 = 100;

public fun max_funding_rate_bps(): u64 {
  MAX_FUNDING_RATE_BPS
}

// === Public Functions ===

/// Initial margin backing an order: `price * size / leverage`. The result
/// lands in USDC base units (see `units::UsdcAmount` on why the scaling
/// factors cancel).
public fun margin_required(
  price: Price,
  size: Size,
  leverage: Leverage,
): UsdcAmount {
  let value =
    (price.value() as u128) * (size.value() as u128)
      / (leverage.value() as u128);
  units::usdc_from_u128(value)
}

/// Maintenance margin for a position: `size * price * rate / 100`, with
/// one float scaling divided back out of the double-scaled product.
public fun maintenance_margin(
  price: Price,
  size: Size,
  maintenance_margin_rate: u64,
): UsdcAmount {
  let float_scaling = units::float_scaling() as u128;
  let value =
    (size.value() as u128) * (price.value() as u128)
      * (maintenance_margin_rate as u128) / 100 / float_scaling;
  units::usdc_from_u128(value)
}

/// The highest leverage whose initial margin still covers the maintenance
/// margin: `initial >= maintenance` iff `leverage <= 100 / rate`. Above
/// this bound a position is born past its liquidation threshold.
public fun max_leverage(maintenance_margin_rate: u64): Leverage {
  units::leverage(
    100 * units::float_scaling() / maintenance_margin_rate,
  )
}

/// Whether a position crosses its liquidation threshold at
/// `current_price`, using the ByBit-style liquidation price documented in
/// docs/liquidation.md (thresholds) and docs/margin.md (margin definitions).
/// Runs entirely in u128: a margin strictly below maintenance liquidates at
/// any price (the naive `initial - maintenance` would underflow-abort for any
/// leverage above `max_leverage`), and a long whose buffer exceeds its entry
/// price can never be liquidated by a price drop. Aborts on `size` of zero
/// (division); callers guarantee positive size — `pool::place_leveraged_order`
/// rejects zero-size orders at the boundary.
public fun is_liquidated(
  side: Side,
  entry_price: Price,
  size: Size,
  margin: UsdcAmount,
  maintenance_margin_rate: u64,
  current_price: Price,
): bool {
  let maintenance =
    maintenance_margin(entry_price, size, maintenance_margin_rate);
  // Strictly below maintenance: past the threshold at any price. At
  // exactly max_leverage the margins are equal, the buffer below is zero,
  // and the liquidation price is the entry price itself.
  if (margin.lt(maintenance)) {
    return true
  };

  // Price distance the margin buffer covers (restore the float scaling
  // lost dividing a base-unit margin by a scaled size).
  let float_scaling = units::float_scaling() as u128;
  let buffer =
    ((margin.value() - maintenance.value()) as u128) * float_scaling
      / (size.value() as u128);
  let entry = entry_price.value() as u128;
  let current = current_price.value() as u128;

  side.match_side!(
    // Long: liquidation price sits `buffer` below entry. A buffer at or
    // beyond the full entry price can never be reached by a price drop.
    || buffer < entry && entry - buffer >= current,
    // Short: liquidation price sits `buffer` above entry.
    || entry + buffer <= current,
  )
}

/// Margin refunded when the unfilled part of an order is cancelled: the
/// unfilled fraction of the order's CURRENT margin, `margin * unfilled /
/// size`. Deriving from the stored margin (not re-deriving from price and
/// leverage) keeps refunds consistent with funding payments that have
/// moved the margin since placement — the vault never pays out more than
/// the margin actually backing the order. Aborts on `size` of zero;
/// callers guarantee positive size.
public fun refund_for_unfilled(
  margin: UsdcAmount,
  unfilled: Size,
  size: Size,
): UsdcAmount {
  let value =
    (margin.value() as u128) * (unfilled.value() as u128)
      / (size.value() as u128);
  units::usdc_from_u128(value)
}

/// Funding rate for one round, from the divergence between the book mid
/// and the oracle price: `|mid - oracle| / oracle` in basis points, capped
/// at `max_funding_rate_bps()`. Returns the rate and the side
/// that PAYS: a mid above the oracle means longs are bidding the book
/// above spot, so longs (bids) pay; below, shorts (asks) pay. A zero rate
/// (mid == oracle) means no funding flows this round — the returned side
/// is meaningless and callers must skip on zero. Aborts on a zero oracle
/// price; `pool::update_price` guarantees non-zero.
public fun funding_rate_bps(
  best_bid: Price,
  best_ask: Price,
  oracle_price: Price,
): (u64, Side) {
  let mid =
    ((best_bid.value() as u128) + (best_ask.value() as u128)) / 2;
  let oracle = oracle_price.value() as u128;

  let (divergence, paying_side) = if (mid > oracle) {
    (mid - oracle, order::bid())
  } else {
    (oracle - mid, order::ask())
  };

  let bps = divergence * 10_000 / oracle;
  let capped = MAX_FUNDING_RATE_BPS as u128;
  let rate = if (bps > capped) { capped } else { bps };
  (rate as u64, paying_side)
}

/// Funding payment owed by one position for one round: `notional * rate`,
/// where the notional is `price * size` (one float scaling divided back
/// out) and the rate is in basis points.
public fun funding_payment(
  price: Price,
  size: Size,
  rate_bps: u64,
): UsdcAmount {
  let float_scaling = units::float_scaling() as u128;
  let value =
    (price.value() as u128) * (size.value() as u128) / float_scaling
      * (rate_bps as u128) / 10_000;
  units::usdc_from_u128(value)
}

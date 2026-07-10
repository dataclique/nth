/// Margin and liquidation formulas.
///
/// Every formula that combines fixed-point quantities lives here, computed
/// in u128: double-scaled intermediate products (`price * size`) overflow
/// u64 for realistic inputs. Formula reference: docs/liquidation.md.
module strike::risk;

use strike::constants;
use strike::order::Side;
use strike::units::{Self, Price, Size, Leverage, UsdcAmount};

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
  let float_scaling = constants::float_scaling() as u128;
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
    100 * constants::float_scaling() / maintenance_margin_rate,
  )
}

/// Whether a position crosses its liquidation threshold at
/// `current_price`, using the ByBit-style liquidation price documented in
/// docs/liquidation.md. Runs entirely in u128: a margin strictly below
/// maintenance liquidates at any price (the naive `initial - maintenance`
/// would underflow-abort for any leverage above `max_leverage`), and a
/// long whose buffer exceeds its entry price can never be liquidated by a
/// price drop. Aborts on `size` of zero (division); callers guarantee
/// positive size — `pool::place_leveraged_order` rejects zero-size orders
/// at the boundary.
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
  let float_scaling = constants::float_scaling() as u128;
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

/// Margin refunded when the unfilled part of an order is cancelled:
/// `unfilled * price / leverage`.
public fun refund_for_unfilled(
  unfilled: Size,
  price: Price,
  leverage: Leverage,
): UsdcAmount {
  let value =
    (unfilled.value() as u128) * (price.value() as u128)
      / (leverage.value() as u128);
  units::usdc_from_u128(value)
}

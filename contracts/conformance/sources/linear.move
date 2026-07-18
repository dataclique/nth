module instrument_conformance::linear;

use nth::instrument_market::{Self, Market};
use nth::margin::MarginAccount;
use nth::matching::{CancelObligation, Fill, FillObligation};
use nth::order::{OrderId, Side};
use units::price::Price;
use units::size::Size;
use units::usdc_amount::UsdcAmount;

// === Structs ===

/// Type-level identity whose private field makes construction module-private.
public struct Linear has drop {
  private: bool,
}

/// Example external instrument wrapper around the generic kernel state.
public struct LinearMarket has key {
  id: UID,
  kernel: Market<Linear>,
}

// === Public Functions ===

/// Create a linear market without exposing its private witness.
public fun new(ctx: &mut TxContext): LinearMarket {
  let witness = witness();
  LinearMarket {
    id: object::new(ctx),
    kernel: instrument_market::new(&witness, ctx),
  }
}

/// Share the wrapper object that owns generic and instrument-specific state.
public fun share(market: LinearMarket) {
  transfer::share_object(market);
}

/// Move USDC base units into this linear market's isolated collateral.
public fun deposit_collateral(
  market: &mut LinearMarket,
  margin_account: &mut MarginAccount,
  amount: UsdcAmount,
  ctx: &mut TxContext,
) {
  let witness = witness();
  instrument_market::deposit_collateral(
    &mut market.kernel,
    margin_account,
    amount,
    &witness,
    ctx,
  );
}

/// Match a linear limit order after the standard verifies account ownership.
public fun place_limit_order(
  market: &mut LinearMarket,
  margin_account: &MarginAccount,
  reservation_amount: UsdcAmount,
  side: Side,
  price: Price,
  size: Size,
  ctx: &TxContext,
): FillObligation<Linear> {
  let witness = witness();
  instrument_market::place_collateralized_limit_order(
    &mut market.kernel,
    margin_account,
    reservation_amount,
    &witness,
    side,
    price,
    size,
    ctx,
  )
}

/// Remove one resting linear order owned by `margin_account`.
public fun cancel_order(
  market: &mut LinearMarket,
  margin_account: &MarginAccount,
  side: Side,
  order_id: OrderId,
  ctx: &TxContext,
): CancelObligation<Linear> {
  let witness = witness();
  instrument_market::cancel_order(
    &mut market.kernel,
    margin_account,
    &witness,
    side,
    order_id,
    ctx,
  )
}

/// Apply both generic net-position transitions for the next linear fill.
public fun settle_next(
  market: &mut LinearMarket,
  obligation: &mut FillObligation<Linear>,
  maker_collateral: UsdcAmount,
  taker_collateral: UsdcAmount,
): Fill<Linear> {
  let witness = witness();
  instrument_market::settle_next_with_collateral(
    &mut market.kernel,
    obligation,
    maker_collateral,
    taker_collateral,
    &witness,
  )
}

/// Consume a fully settled linear fill obligation.
public fun complete(
  market: &LinearMarket,
  obligation: FillObligation<Linear>,
) {
  let witness = witness();
  instrument_market::complete(&market.kernel, obligation, &witness);
}

/// Consume a linear cancellation after releasing the instrument reservation.
public fun complete_cancel(
  market: &LinearMarket,
  obligation: CancelObligation<Linear>,
) {
  let witness = witness();
  instrument_market::complete_cancel(
    &market.kernel,
    obligation,
    &witness,
  );
}

/// Primitive net-position state for one account in this linear market.
public fun position_state(
  market: &LinearMarket,
  margin_account_id: ID,
): u8 {
  instrument_market::position_state(&market.kernel, margin_account_id)
}

/// Absolute net-position size at the shared `10^6` scale.
public fun position_size(
  market: &LinearMarket,
  margin_account_id: ID,
): Size {
  instrument_market::position_size(&market.kernel, margin_account_id)
}

/// Free USDC base units available to the account in this market.
public fun free_collateral(
  market: &LinearMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::free_collateral(&market.kernel, margin_account_id)
}

/// USDC base units backing the account's linear net position.
public fun position_collateral(
  market: &LinearMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::position_collateral(&market.kernel, margin_account_id)
}

/// Total USDC base units isolated inside this linear market.
public fun total_collateral(market: &LinearMarket): UsdcAmount {
  instrument_market::total_collateral(&market.kernel)
}

// === Private Functions ===

fun witness(): Linear {
  Linear { private: true }
}

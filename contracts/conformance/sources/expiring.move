module instrument_conformance::expiring;

use nth::instrument_market::{Self, Market};
use nth::margin::MarginAccount;
use nth::matching::{CancelObligation, Fill, FillObligation};
use nth::order::{OrderId, Side};
use units::price::Price;
use units::size::Size;

// === Structs ===

/// Independent type-level identity for an expiring instrument implementation.
public struct Expiring has drop {
  private: bool,
}

/// A second external wrapper proving that the kernel imports neither fixture.
public struct ExpiringMarket has key {
  id: UID,
  kernel: Market<Expiring>,
}

// === Public Functions ===

/// Create an expiring market without exposing its private witness.
public fun new(ctx: &mut TxContext): ExpiringMarket {
  let witness = witness();
  ExpiringMarket {
    id: object::new(ctx),
    kernel: instrument_market::new(&witness, ctx),
  }
}

/// Share the wrapper object that owns generic and instrument-specific state.
public fun share(market: ExpiringMarket) {
  transfer::share_object(market);
}

/// Match an expiring limit order after standard account authorization.
public fun place_limit_order(
  market: &mut ExpiringMarket,
  margin_account: &MarginAccount,
  reservation_id: ID,
  side: Side,
  price: Price,
  size: Size,
  ctx: &TxContext,
): FillObligation<Expiring> {
  let witness = witness();
  instrument_market::place_limit_order(
    &mut market.kernel,
    margin_account,
    reservation_id,
    &witness,
    side,
    price,
    size,
    ctx,
  )
}

/// Remove one resting expiring order owned by `margin_account`.
public fun cancel_order(
  market: &mut ExpiringMarket,
  margin_account: &MarginAccount,
  side: Side,
  order_id: OrderId,
  ctx: &TxContext,
): CancelObligation<Expiring> {
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

/// Apply both generic net-position transitions for the next expiring fill.
public fun settle_next(
  market: &mut ExpiringMarket,
  obligation: &mut FillObligation<Expiring>,
): Fill<Expiring> {
  let witness = witness();
  instrument_market::settle_next(
    &mut market.kernel,
    obligation,
    &witness,
  )
}

/// Consume a fully settled expiring fill obligation.
public fun complete(
  market: &ExpiringMarket,
  obligation: FillObligation<Expiring>,
) {
  let witness = witness();
  instrument_market::complete(&market.kernel, obligation, &witness);
}

/// Consume an expiring cancellation after releasing its reservation.
public fun complete_cancel(
  market: &ExpiringMarket,
  obligation: CancelObligation<Expiring>,
) {
  let witness = witness();
  instrument_market::complete_cancel(
    &market.kernel,
    obligation,
    &witness,
  );
}

/// Primitive net-position state for one account in this expiring market.
public fun position_state(
  market: &ExpiringMarket,
  margin_account_id: ID,
): u8 {
  instrument_market::position_state(&market.kernel, margin_account_id)
}

/// Absolute net-position size at the shared `10^6` scale.
public fun position_size(
  market: &ExpiringMarket,
  margin_account_id: ID,
): Size {
  instrument_market::position_size(&market.kernel, margin_account_id)
}

// === Private Functions ===

fun witness(): Expiring {
  Expiring { private: true }
}

module instrument_conformance::expiring;

use nth::instrument_market::{Self, Market};
use nth::margin::MarginAccount;
use nth::matching::{CancelObligation, Fill, FillObligation};
use nth::order::{OrderId, Side};
use units::price::Price;
use units::size::Size;
use units::usdc_amount::UsdcAmount;

// === Errors ===

#[error]
const EExpiryAlreadyBound: vector<u8> =
  b"an expiry settlement value can be bound exactly once";

#[error]
const EExpiryNotBound: vector<u8> =
  b"expiry settlement requires a bound settlement value";

// === Structs ===

/// Independent type-level identity for an expiring instrument implementation.
public struct Expiring has drop {
  private: bool,
}

/// A second external wrapper proving that the kernel imports neither fixture.
public struct ExpiringMarket has key {
  id: UID,
  kernel: Market<Expiring>,
  expiry_value: Option<Price>,
}

// === Public Functions ===

/// Create an expiring market without exposing its private witness.
public fun new(ctx: &mut TxContext): ExpiringMarket {
  let witness = witness();
  ExpiringMarket {
    id: object::new(ctx),
    kernel: instrument_market::new(&witness, ctx),
    expiry_value: option::none(),
  }
}

/// Share the wrapper object that owns generic and instrument-specific state.
public fun share(market: ExpiringMarket) {
  transfer::share_object(market);
}

/// Move USDC from the sender-owned margin account into this expiring market.
public fun deposit_collateral(
  market: &mut ExpiringMarket,
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

/// Bind this market's expiry settlement value exactly once and stop trading by
/// entering the kernel's terminal phase. A second value can never rebind.
public fun terminate(market: &mut ExpiringMarket, expiry_value: Price) {
  assert!(market.expiry_value.is_none(), EExpiryAlreadyBound);
  market.expiry_value.fill(expiry_value);
  let witness = witness();
  instrument_market::enter_terminal(&mut market.kernel, &witness);
}

/// The bound expiry settlement value. Aborts before termination.
public fun expiry_value(market: &ExpiringMarket): Price {
  assert!(market.expiry_value.is_some(), EExpiryNotBound);
  *market.expiry_value.borrow()
}

/// Settle one expired long/short pair. The instrument computes `long_payout`
/// from its bound expiry value, moves it from the short's position collateral
/// to the long's, then closes both exposures through the standard terminal
/// transition, releasing each side's remaining position collateral.
public fun settle_pair(
  market: &mut ExpiringMarket,
  long_account_id: ID,
  short_account_id: ID,
  long_payout: UsdcAmount,
) {
  assert!(market.expiry_value.is_some(), EExpiryNotBound);
  let witness = witness();
  if (long_payout.value() > 0) {
    instrument_market::apply_carry(
      &mut market.kernel,
      short_account_id,
      long_account_id,
      long_payout,
      0,
      true,
      true,
      &witness,
    );
  };
  instrument_market::settle_terminal_position(
    &mut market.kernel,
    long_account_id,
    &witness,
  );
  instrument_market::settle_terminal_position(
    &mut market.kernel,
    short_account_id,
    &witness,
  );
}

/// Permissionlessly remove up to `max_orders` resting orders from `side` after
/// termination, releasing each reservation to its own order owner.
public fun cancel_terminal_orders(
  market: &mut ExpiringMarket,
  side: Side,
  max_orders: u64,
): u64 {
  let witness = witness();
  instrument_market::cancel_terminal_orders(
    &mut market.kernel,
    side,
    max_orders,
    &witness,
  )
}

/// Match an expiring limit order after standard account authorization.
public fun place_limit_order(
  market: &mut ExpiringMarket,
  margin_account: &MarginAccount,
  reservation_amount: UsdcAmount,
  side: Side,
  price: Price,
  size: Size,
  ctx: &TxContext,
): FillObligation<Expiring> {
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
  maker_collateral: UsdcAmount,
  taker_collateral: UsdcAmount,
): Fill<Expiring> {
  let witness = witness();
  instrument_market::settle_next_with_collateral(
    &mut market.kernel,
    obligation,
    maker_collateral,
    taker_collateral,
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

/// Whether the kernel still materializes a position for `margin_account_id`.
public fun has_position(
  market: &ExpiringMarket,
  margin_account_id: ID,
): bool {
  instrument_market::has_position(&market.kernel, margin_account_id)
}

/// Whether this market stopped trading by entering the terminal phase.
public fun is_terminal(market: &ExpiringMarket): bool {
  instrument_market::is_terminal(&market.kernel)
}

/// Free USDC base units for one account in this market.
public fun free_collateral(
  market: &ExpiringMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::free_collateral(&market.kernel, margin_account_id)
}

/// USDC base units backing one account's net position.
public fun position_collateral(
  market: &ExpiringMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::position_collateral(&market.kernel, margin_account_id)
}

/// Total USDC base units held across this market's collateral buckets.
public fun total_collateral(market: &ExpiringMarket): UsdcAmount {
  instrument_market::total_collateral(&market.kernel)
}

/// Number of resting bids in this market.
public fun bid_count(market: &ExpiringMarket): u64 {
  instrument_market::bid_count(&market.kernel)
}

/// Number of resting asks in this market.
public fun ask_count(market: &ExpiringMarket): u64 {
  instrument_market::ask_count(&market.kernel)
}

// === Private Functions ===

fun witness(): Expiring {
  Expiring { private: true }
}

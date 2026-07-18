module instrument_conformance::linear;

use nth::instrument_market::{Self, Market};
use nth::margin::MarginAccount;
use nth::matching::{CancelObligation, Fill, FillObligation};
use nth::order::{OrderId, Side};
use units::price::Price;
use units::scaling;
use units::size::Size;
use units::usdc_amount::{Self, UsdcAmount};

// === Constants ===

/// Maintenance margin as a plain percent of notional at the mark price.
const MAINTENANCE_MARGIN_PERCENT: u64 = 25;

/// This instrument's kernel maintenance-action kind for funding rounds.
const FUNDING_ACTION_KIND: u64 = 1;

// === Errors ===

#[error]
const EPositionSafe: vector<u8> =
  b"position collateral satisfies its maintenance margin";

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

/// Register this market's funding round as a permissionless, keeper-rewarded
/// maintenance action. `reserve_account_id`'s free collateral funds rewards
/// capped at `max_reward` per period.
public fun enable_funding_rewards(
  market: &mut LinearMarket,
  period_interval_ms: u64,
  reserve_account_id: ID,
  max_reward: UsdcAmount,
  clock: &sui::clock::Clock,
) {
  let witness = witness();
  instrument_market::register_maintenance(
    &mut market.kernel,
    FUNDING_ACTION_KIND,
    period_interval_ms,
    reserve_account_id,
    max_reward,
    clock,
    &witness,
  );
}

/// Permissionlessly settle one funding round and claim its keeper reward in
/// the same transaction: the reward can only be paid when the authoritative
/// funding state advances, and each period settles exactly once.
public fun settle_funding_with_reward(
  market: &mut LinearMarket,
  payer_account_id: ID,
  receiver_account_id: ID,
  amount: UsdcAmount,
  period: u64,
  reward: UsdcAmount,
  keeper_account: &MarginAccount,
  clock: &sui::clock::Clock,
  ctx: &TxContext,
) {
  let witness = witness();
  instrument_market::claim_maintenance(
    &mut market.kernel,
    FUNDING_ACTION_KIND,
    period,
    reward,
    keeper_account,
    clock,
    &witness,
    ctx,
  );
  instrument_market::apply_carry(
    &mut market.kernel,
    payer_account_id,
    receiver_account_id,
    amount,
    period,
    true,
    true,
    &witness,
  );
}

/// Apply one funding-style carry between two accounts' position collateral.
/// Size is unchanged; `period` is the caller's funding round key.
public fun settle_funding(
  market: &mut LinearMarket,
  payer_account_id: ID,
  receiver_account_id: ID,
  amount: UsdcAmount,
  period: u64,
) {
  let witness = witness();
  instrument_market::apply_carry(
    &mut market.kernel,
    payer_account_id,
    receiver_account_id,
    amount,
    period,
    true,
    true,
    &witness,
  );
}

/// Permissionlessly liquidate one under-collateralized position. This
/// instrument's trigger: position collateral strictly below the maintenance
/// margin at `mark_price`. A safe position aborts before any state change.
/// The keeper penalty moves from the liquidated account's position collateral
/// to `keeper_account_id`'s free collateral; the remainder returns to the
/// liquidated account through the standard forced-settlement transition.
public fun liquidate(
  market: &mut LinearMarket,
  liquidated_account_id: ID,
  mark_price: Price,
  keeper_account_id: ID,
  keeper_penalty: UsdcAmount,
) {
  let witness = witness();
  let size = instrument_market::position_size(
    &market.kernel,
    liquidated_account_id,
  );
  let collateral = instrument_market::position_collateral(
    &market.kernel,
    liquidated_account_id,
  );
  let maintenance = maintenance_margin(mark_price, size);
  assert!(collateral.lt(maintenance), EPositionSafe);

  if (keeper_penalty.value() > 0) {
    instrument_market::apply_carry(
      &mut market.kernel,
      liquidated_account_id,
      keeper_account_id,
      keeper_penalty,
      0,
      true,
      false,
      &witness,
    );
  };
  let remainder = instrument_market::position_collateral(
    &market.kernel,
    liquidated_account_id,
  );
  instrument_market::force_reduce_position(
    &mut market.kernel,
    liquidated_account_id,
    size,
    remainder,
    &witness,
  );
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

/// This instrument's maintenance margin: a plain percent of notional at the
/// mark price, computed in u128 so realistic scaled inputs cannot overflow.
fun maintenance_margin(mark_price: Price, size: Size): UsdcAmount {
  let notional =
    (size.value() as u128) * (mark_price.value() as u128)
      / (scaling::float_scaling() as u128);
  usdc_amount::usdc_from_u128(
    notional * (MAINTENANCE_MARGIN_PERCENT as u128) / 100,
  )
}

fun witness(): Linear {
  Linear { private: true }
}

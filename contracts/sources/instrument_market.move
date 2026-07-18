module nth::instrument_market;

use nth::collateral::{Self, ReservationId, Silo};
use nth::maintenance::{Self, Schedule};
use nth::margin::{Self, MarginAccount};
use nth::matching::{
  Self,
  CancelObligation,
  Fill,
  FillObligation,
  OrderBook,
};
use nth::order::{Self, OrderId, Side};
use nth::position::{Self, Position};
use sui::clock::Clock;
use sui::coin;
use sui::event;
use sui::table::{Self, Table};
use units::price::Price;
use units::size::Size;
use units::usdc_amount::{Self, UsdcAmount};

// === Constants ===

const MARKET_VERSION: u64 = 1;
const EVENT_SCHEMA_VERSION: u16 = 1;

// === Errors ===

#[error]
const EInvalidAccountOwner: vector<u8> =
  b"transaction sender does not own the margin account";

#[error]
const EIncompleteSettlement: vector<u8> =
  b"every fill must update both generic positions before completion";

#[error]
const EWrongMarket: vector<u8> =
  b"fill obligation belongs to a different market";

#[error]
const EWrongVersion: vector<u8> = b"market version is not supported";

#[error]
const EZeroIssuanceCollateral: vector<u8> =
  b"claim issuance collateral must be positive";

#[error]
const ETerminalMarket: vector<u8> =
  b"a terminal market accepts no new orders or exposure";

#[error]
const ENotTerminal: vector<u8> =
  b"transition requires the market to be terminal";

#[error]
const EAlreadyTerminal: vector<u8> = b"market is already terminal";

#[error]
const ENothingToSettle: vector<u8> =
  b"account has no position and no position collateral to settle";

// === Structs ===

/// The only representable lifecycle phases for one market.
public enum Phase has copy, drop, store {
  Trading,
  Terminal,
}

/// Generic matching and net-position state for one isolated instrument market.
/// An instrument package stores this value inside its own shared market object
/// alongside its instrument-specific lifecycle state.
public struct Market<phantom Instrument> has key, store {
  id: UID,
  version: u64,
  phase: Phase,
  orderbook: OrderBook<Instrument>,
  positions: Table<ID, Position<Instrument>>,
  position_count: u64,
  collateral: Silo<Instrument>,
  maintenance: Schedule<Instrument>,
}

// === Events ===

/// Stable primitive envelope emitted when an instrument creates a market.
public struct MarketCreated<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  version: u64,
}

/// Emitted when free collateral is locked behind a newly issued long claim.
public struct ClaimIssued<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  issued_size: u64,
  collateral_amount: u64,
}

/// Emitted when a long claim is reduced and position collateral is released.
public struct ClaimRedeemed<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  redeemed_size: u64,
  collateral_amount: u64,
}

/// Emitted once when an instrument moves its market into the terminal phase.
public struct MarketTerminated<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
}

/// Emitted when a terminal market closes one account's exposure and returns
/// all of its position collateral to free collateral. State codes are flat
/// `0`, long `1`, and short `2`; sizes use the shared `10^6` scale.
public struct PositionSettled<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  previous_state: u8,
  previous_size: u64,
  released_collateral: u64,
}

/// Emitted when an instrument force-reduces one account's exposure through a
/// proven distress path. State codes are flat `0`, long `1`, and short `2`;
/// sizes use the shared `10^6` scale.
public struct PositionForceReduced<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  reduced_size: u64,
  current_state: u8,
  current_size: u64,
  released_collateral: u64,
}

/// Emitted when collateral moves between accounts without changing exposure.
public struct CarryApplied<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  from_account_id: ID,
  to_account_id: ID,
  amount: u64,
  period: u64,
  from_position: bool,
  to_position: bool,
}

// === Public Functions ===

/// Create one isolated generic market while holding the instrument package's
/// privately constructible witness.
public fun new<Instrument>(
  _witness: &Instrument,
  ctx: &mut TxContext,
): Market<Instrument> {
  let id = object::new(ctx);
  let market_id = object::uid_to_inner(&id);
  event::emit(MarketCreated<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    version: MARKET_VERSION,
  });
  Market {
    id,
    version: MARKET_VERSION,
    phase: Phase::Trading,
    orderbook: matching::empty(),
    positions: table::new(ctx),
    position_count: 0,
    collateral: collateral::new(ctx),
    maintenance: maintenance::new(ctx),
  }
}

/// Register one permissionless maintenance action kind exactly once for this
/// market. The instrument names the action `kind`, the wall-clock spacing of
/// its periods, the pre-funded reserve account whose free collateral pays
/// keeper rewards, and the per-period reward cap.
public fun register_maintenance<Instrument>(
  market: &mut Market<Instrument>,
  kind: u64,
  period_interval_ms: u64,
  reserve_account_id: ID,
  max_reward: UsdcAmount,
  clock: &Clock,
  _witness: &Instrument,
) {
  market.assert_version();
  let market_id = object::id(market);
  maintenance::register(
    &mut market.maintenance,
    market_id,
    kind,
    period_interval_ms,
    reserve_account_id,
    max_reward,
    clock,
  );
}

/// Claim one maintenance period after the instrument advanced its
/// authoritative state in the same transaction. Periods apply sequentially
/// and exactly once, become claimable only at their wall-clock start, and pay
/// at most the registered cap from the reserve's free collateral to the
/// sender-owned keeper account — the sender is the recipient by construction,
/// so a keeper payment cannot be redirected.
public fun claim_maintenance<Instrument>(
  market: &mut Market<Instrument>,
  kind: u64,
  period: u64,
  reward: UsdcAmount,
  keeper_account: &MarginAccount,
  clock: &Clock,
  _witness: &Instrument,
  ctx: &TxContext,
) {
  market.assert_version();
  assert!(
    margin::verify_owner(keeper_account, ctx.sender()),
    EInvalidAccountOwner,
  );
  let market_id = object::id(market);
  let keeper_account_id = object::id(keeper_account);
  maintenance::validate_claim(
    &market.maintenance,
    kind,
    period,
    reward,
    clock,
  );
  if (reward.value() > 0) {
    let reserve_account_id = maintenance::reserve_account_id(
      &market.maintenance,
      kind,
    );
    collateral::transfer_carry(
      &mut market.collateral,
      reserve_account_id,
      keeper_account_id,
      reward,
      false,
      false,
    );
  };
  maintenance::record_claim(
    &mut market.maintenance,
    market_id,
    kind,
    period,
    keeper_account_id,
    reward,
  );
}

/// Move this market into its terminal phase exactly once. A terminal market
/// accepts no new orders or claim issuance; cancellation, carry, terminal
/// settlement, and withdrawal remain available.
public fun enter_terminal<Instrument>(
  market: &mut Market<Instrument>,
  _witness: &Instrument,
) {
  market.assert_version();
  match (market.phase) {
    Phase::Trading => (),
    Phase::Terminal => abort EAlreadyTerminal,
  };
  market.phase = Phase::Terminal;
  event::emit(MarketTerminated<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
  });
}

/// Close one account's net exposure in a terminal market and return all of its
/// position collateral to free collateral. Applies exactly once per account:
/// a second call aborts because neither a position nor position collateral
/// remains. Instruments realize payouts by directing carry between accounts
/// before settling them.
public fun settle_terminal_position<Instrument>(
  market: &mut Market<Instrument>,
  margin_account_id: ID,
  _witness: &Instrument,
) {
  market.assert_version();
  market.assert_terminal();
  let market_id = object::id(market);
  let has_position = market.positions.contains(margin_account_id);
  let released_collateral = collateral::position(
    &market.collateral,
    margin_account_id,
  );
  assert!(
    has_position || released_collateral.value() > 0,
    ENothingToSettle,
  );

  let (previous_state, previous_size) = if (has_position) {
    let position = market.positions.remove(margin_account_id);
    let state = position::state(&position);
    let size = position::size(&position);
    position::destroy(position);
    market.position_count = market.position_count - 1;
    (state, size.value())
  } else {
    (position::flat(), 0)
  };
  collateral::move_position_to_free(
    &mut market.collateral,
    margin_account_id,
    released_collateral,
  );

  event::emit(PositionSettled<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    margin_account_id,
    previous_state,
    previous_size,
    released_collateral: released_collateral.value(),
  });
}

/// Force-reduce one account's open exposure by `reduce_size` through the
/// instrument's proven distress path — liquidation, backstop transfer, or
/// another explicitly defined trigger the implementation must satisfy before
/// calling. The reduction cannot flip exposure; equality closes to flat.
/// `released_collateral` moves from the account's position collateral back to
/// its free collateral. Penalties and backstop transfers compose through
/// `apply_carry` before this transition. No owner check: distress transitions
/// are involuntary by definition, and authority comes from the private
/// witness scoped to this market.
public fun force_reduce_position<Instrument>(
  market: &mut Market<Instrument>,
  margin_account_id: ID,
  reduce_size: Size,
  released_collateral: UsdcAmount,
  _witness: &Instrument,
) {
  market.assert_version();
  position::assert_force_reducible(
    market.positions.contains(margin_account_id),
  );
  let market_id = object::id(market);
  collateral::validate_position(
    &market.collateral,
    margin_account_id,
    released_collateral,
  );
  position::force_reduce(
    &mut market.positions[margin_account_id],
    reduce_size,
  );
  collateral::move_position_to_free(
    &mut market.collateral,
    margin_account_id,
    released_collateral,
  );

  event::emit(PositionForceReduced<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    margin_account_id,
    reduced_size: reduce_size.value(),
    current_state: position::state(&market.positions[margin_account_id]),
    current_size: position::size(&market.positions[margin_account_id]).value(),
    released_collateral: released_collateral.value(),
  });
}

/// Permissionlessly remove up to `max_orders` resting orders from `side` of a
/// terminal market, returning each unconsumed reservation to its own order
/// owner's free collateral. Returns how many orders were removed so keepers
/// can continue until both sides are empty.
public fun cancel_terminal_orders<Instrument>(
  market: &mut Market<Instrument>,
  side: Side,
  max_orders: u64,
  _witness: &Instrument,
): u64 {
  market.assert_version();
  market.assert_terminal();
  let market_id = object::id(market);
  let mut canceled = 0;
  while (canceled < max_orders && market.side_count(side) > 0) {
    let obligation = matching::cancel_front(
      &mut market.orderbook,
      market_id,
      side,
    );
    collateral::release(
      &mut market.collateral,
      market_id,
      obligation.canceled_reservation_id(),
    );
    matching::destroy_cancel(obligation);
    canceled = canceled + 1;
  };
  canceled
}

/// Move an exact USDC base-unit amount from the sender-owned margin account
/// into this market's isolated free collateral.
public fun deposit_collateral<Instrument>(
  market: &mut Market<Instrument>,
  margin_account: &mut MarginAccount,
  amount: UsdcAmount,
  _witness: &Instrument,
  ctx: &mut TxContext,
) {
  market.assert_version();
  assert!(
    margin::verify_owner(margin_account, ctx.sender()),
    EInvalidAccountOwner,
  );
  let market_id = object::id(market);
  let margin_account_id = object::id(margin_account);
  let coin = margin_account.withdraw(amount.value(), ctx);
  collateral::deposit(
    &mut market.collateral,
    market_id,
    margin_account_id,
    coin::into_balance(coin),
  );
}

/// Return an exact USDC base-unit amount from this market's free collateral to
/// the sender-owned margin account. Reserved and position collateral cannot be
/// withdrawn through this transition.
public fun withdraw_collateral<Instrument>(
  market: &mut Market<Instrument>,
  margin_account: &mut MarginAccount,
  amount: UsdcAmount,
  _witness: &Instrument,
  ctx: &mut TxContext,
) {
  market.assert_version();
  assert!(
    margin::verify_owner(margin_account, ctx.sender()),
    EInvalidAccountOwner,
  );
  let market_id = object::id(market);
  let margin_account_id = object::id(margin_account);
  let balance = collateral::withdraw(
    &mut market.collateral,
    market_id,
    margin_account_id,
    amount,
  );
  margin_account.deposit(coin::from_balance(balance, ctx), ctx);
}

/// Issue a positive long claim by moving `collateral_amount` from the owner's
/// free market collateral into position collateral. The instrument supplies both
/// the collateral amount and the claim size; the standard enforces ownership,
/// positivity, flat-or-long exposure, collateral availability, and conservation.
public fun issue_long_claim<Instrument>(
  market: &mut Market<Instrument>,
  margin_account: &MarginAccount,
  collateral_amount: UsdcAmount,
  issued_size: Size,
  _witness: &Instrument,
  ctx: &TxContext,
) {
  market.assert_version();
  market.assert_trading();
  assert!(
    margin::verify_owner(margin_account, ctx.sender()),
    EInvalidAccountOwner,
  );
  assert!(collateral_amount.value() > 0, EZeroIssuanceCollateral);
  position::assert_claim_size_positive(issued_size);
  let margin_account_id = object::id(margin_account);
  market.ensure_position(margin_account_id);
  let market_id = object::id(market);
  position::validate_issue_long_claim(
    &market.positions[margin_account_id],
    issued_size,
  );
  collateral::validate_free(
    &market.collateral,
    margin_account_id,
    collateral_amount,
  );
  collateral::move_free_to_position(
    &mut market.collateral,
    margin_account_id,
    collateral_amount,
  );
  position::issue_long_claim(
    &mut market.positions[margin_account_id],
    issued_size,
  );
  event::emit(ClaimIssued<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    margin_account_id,
    issued_size: issued_size.value(),
    collateral_amount: collateral_amount.value(),
  });
}

/// Redeem part or all of an owner's positive long claim and release the
/// instrument-calculated `collateral_amount` back to free market collateral.
/// Zero collateral is allowed when the instrument reports no realizable assets;
/// oversize claims and oversize collateral releases abort.
public fun redeem_long_claim<Instrument>(
  market: &mut Market<Instrument>,
  margin_account: &MarginAccount,
  redemption_size: Size,
  collateral_amount: UsdcAmount,
  _witness: &Instrument,
  ctx: &TxContext,
) {
  market.assert_version();
  assert!(
    margin::verify_owner(margin_account, ctx.sender()),
    EInvalidAccountOwner,
  );
  position::assert_claim_size_positive(redemption_size);
  let margin_account_id = object::id(margin_account);
  position::assert_long_claim_materialized(
    market.positions.contains(margin_account_id),
  );
  let market_id = object::id(market);
  position::validate_redeem_long_claim(
    &market.positions[margin_account_id],
    redemption_size,
  );
  collateral::validate_position(
    &market.collateral,
    margin_account_id,
    collateral_amount,
  );
  position::redeem_long_claim(
    &mut market.positions[margin_account_id],
    redemption_size,
  );
  collateral::move_position_to_free(
    &mut market.collateral,
    margin_account_id,
    collateral_amount,
  );
  event::emit(ClaimRedeemed<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    margin_account_id,
    redeemed_size: redemption_size.value(),
    collateral_amount: collateral_amount.value(),
  });
}

/// Transfer `amount` of market-isolated collateral from `from_account_id` to
/// `to_account_id` without changing either net position size. When
/// `from_position` / `to_position` are true the debit or credit uses position
/// collateral; otherwise it uses free collateral. `period` is an
/// instrument-defined accounting key recorded in the event. Period idempotence
/// remains the instrument's responsibility.
public fun apply_carry<Instrument>(
  market: &mut Market<Instrument>,
  from_account_id: ID,
  to_account_id: ID,
  amount: UsdcAmount,
  period: u64,
  from_position: bool,
  to_position: bool,
  _witness: &Instrument,
) {
  market.assert_version();
  let market_id = object::id(market);
  collateral::transfer_carry(
    &mut market.collateral,
    from_account_id,
    to_account_id,
    amount,
    from_position,
    to_position,
  );
  event::emit(CarryApplied<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    from_account_id,
    to_account_id,
    amount: amount.value(),
    period,
    from_position,
    to_position,
  });
}

/// Match a positive limit order after verifying that the sender owns
/// `margin_account`. `reservation_amount` is USDC base units; `price` and
/// `size` use the shared `10^6` scale.
///
/// Returns a non-droppable obligation that the instrument wrapper must settle
/// and complete in the same transaction.
public fun place_collateralized_limit_order<Instrument>(
  market: &mut Market<Instrument>,
  margin_account: &MarginAccount,
  reservation_amount: UsdcAmount,
  _witness: &Instrument,
  side: Side,
  price: Price,
  size: Size,
  ctx: &TxContext,
): FillObligation<Instrument> {
  market.assert_version();
  market.assert_trading();
  assert!(
    margin::verify_owner(margin_account, ctx.sender()),
    EInvalidAccountOwner,
  );
  let market_id = object::id(market);
  let margin_account_id = object::id(margin_account);
  matching::validate_limit_order(
    &market.orderbook,
    margin_account_id,
    side,
    price,
    size,
  );
  let reservation_id = collateral::reserve(
    &mut market.collateral,
    market_id,
    margin_account_id,
    reservation_amount,
  );
  matching::place_limit_order(
    &mut market.orderbook,
    market_id,
    margin_account_id,
    reservation_id,
    side,
    price,
    size,
  )
}

/// Remove the sender's own resting order and return a non-droppable
/// cancellation carrying the opaque reservation and exact unfilled size.
public fun cancel_order<Instrument>(
  market: &mut Market<Instrument>,
  margin_account: &MarginAccount,
  _witness: &Instrument,
  side: Side,
  order_id: OrderId,
  ctx: &TxContext,
): CancelObligation<Instrument> {
  market.assert_version();
  assert!(
    margin::verify_owner(margin_account, ctx.sender()),
    EInvalidAccountOwner,
  );
  let market_id = object::id(market);
  let obligation = matching::cancel_order(
    &mut market.orderbook,
    market_id,
    object::id(margin_account),
    side,
    order_id,
  );
  collateral::release(
    &mut market.collateral,
    market_id,
    obligation.canceled_reservation_id(),
  );
  obligation
}

/// Consume instrument-calculated maker and taker USDC reservation amounts,
/// apply both generic net-position transitions, and advance the obligation
/// exactly once. Consumed USDC becomes position collateral.
///
/// Aborts when the obligation belongs to another market, has no next fill, or
/// either reservation is missing, foreign, or insufficient.
public fun settle_next_with_collateral<Instrument>(
  market: &mut Market<Instrument>,
  obligation: &mut FillObligation<Instrument>,
  maker_collateral: UsdcAmount,
  taker_collateral: UsdcAmount,
  _witness: &Instrument,
): Fill<Instrument> {
  market.assert_version();
  market.assert_obligation_market(obligation);
  let fill = obligation.next_fill();
  let maker_account_id = fill.maker_margin_account_id();
  let taker_account_id = fill.taker_margin_account_id();
  collateral::validate_consume(
    &market.collateral,
    fill.maker_reservation_id(),
    maker_account_id,
    maker_collateral,
  );
  collateral::validate_consume(
    &market.collateral,
    fill.taker_reservation_id(),
    taker_account_id,
    taker_collateral,
  );
  market.ensure_position(maker_account_id);
  market.ensure_position(taker_account_id);
  let market_id = object::id(market);

  collateral::consume(
    &mut market.collateral,
    market_id,
    fill.maker_reservation_id(),
    maker_account_id,
    maker_collateral,
  );
  collateral::consume(
    &mut market.collateral,
    market_id,
    fill.taker_reservation_id(),
    taker_account_id,
    taker_collateral,
  );
  position::apply_trade(
    &mut market.positions[maker_account_id],
    market_id,
    fill.maker_order_id(),
    fill.taker_order_id(),
    fill.maker_side(),
    fill.size(),
  );
  let taker_side = fill.maker_side().match_side!(
    || order::ask(),
    || order::bid(),
  );
  position::apply_trade(
    &mut market.positions[taker_account_id],
    market_id,
    fill.maker_order_id(),
    fill.taker_order_id(),
    taker_side,
    fill.size(),
  );
  if (fill.maker_fully_filled()) {
    collateral::release(
      &mut market.collateral,
      market_id,
      fill.maker_reservation_id(),
    );
  };
  if (
    obligation.settled_fill_count() + 1 == obligation.fill_count() &&
    obligation.resting_size().is_zero()
  ) {
    collateral::release(
      &mut market.collateral,
      market_id,
      fill.taker_reservation_id(),
    );
  };
  matching::advance(obligation);
  fill
}

/// Consume an obligation only after every fill has applied both generic
/// position transitions. Aborts for a different market or incomplete work.
public fun complete<Instrument>(
  market: &Market<Instrument>,
  obligation: FillObligation<Instrument>,
  _witness: &Instrument,
) {
  market.assert_version();
  market.assert_obligation_market(&obligation);
  assert!(
    obligation.settled_fill_count() == obligation.fill_count(),
    EIncompleteSettlement,
  );
  matching::destroy(obligation);
}

/// Consume a cancellation after `cancel_order` atomically released all
/// unconsumed reserved USDC. Aborts when it belongs to another market.
public fun complete_cancel<Instrument>(
  market: &Market<Instrument>,
  obligation: CancelObligation<Instrument>,
  _witness: &Instrument,
) {
  market.assert_version();
  assert!(
    obligation.cancel_market_id() == object::id(market),
    EWrongMarket,
  );
  matching::destroy_cancel(obligation);
}

// === View Functions ===

/// Stable identity used by orders, obligations, positions, and events.
public fun id<Instrument>(market: &Market<Instrument>): ID {
  object::id(market)
}

/// Last claimed period for one registered maintenance action kind, `0`
/// before the first claim. Aborts for an unregistered kind.
public fun maintenance_last_period<Instrument>(
  market: &Market<Instrument>,
  kind: u64,
): u64 {
  maintenance::last_period(&market.maintenance, kind)
}

/// Whether the market has entered its terminal phase.
public fun is_terminal<Instrument>(market: &Market<Instrument>): bool {
  match (market.phase) {
    Phase::Trading => false,
    Phase::Terminal => true,
  }
}

/// Whether the market has materialized a position for `margin_account_id`.
public fun has_position<Instrument>(
  market: &Market<Instrument>,
  margin_account_id: ID,
): bool {
  market.positions.contains(margin_account_id)
}

/// Primitive position state code for `margin_account_id`.
///
/// Aborts if the account has never filled in this market.
public fun position_state<Instrument>(
  market: &Market<Instrument>,
  margin_account_id: ID,
): u8 {
  position::state(&market.positions[margin_account_id])
}

/// Absolute net position size at the shared `10^6` scale.
///
/// Aborts if the account has never filled in this market.
public fun position_size<Instrument>(
  market: &Market<Instrument>,
  margin_account_id: ID,
): Size {
  position::size(&market.positions[margin_account_id])
}

/// Number of margin accounts with a materialized position in this market.
public fun position_count<Instrument>(market: &Market<Instrument>): u64 {
  market.position_count
}

/// Number of resting bids in this market.
public fun bid_count<Instrument>(market: &Market<Instrument>): u64 {
  matching::bid_count(&market.orderbook)
}

/// Number of resting asks in this market.
public fun ask_count<Instrument>(market: &Market<Instrument>): u64 {
  matching::ask_count(&market.orderbook)
}

/// Free USDC base units available for withdrawal or new reservations.
public fun free_collateral<Instrument>(
  market: &Market<Instrument>,
  margin_account_id: ID,
): UsdcAmount {
  collateral::free(&market.collateral, margin_account_id)
}

/// USDC base units backing the account's current net position.
public fun position_collateral<Instrument>(
  market: &Market<Instrument>,
  margin_account_id: ID,
): UsdcAmount {
  collateral::position(&market.collateral, margin_account_id)
}

/// Whether this market owns the reservation.
public fun has_reservation<Instrument>(
  market: &Market<Instrument>,
  reservation_id: ReservationId,
): bool {
  collateral::has_reservation(&market.collateral, reservation_id)
}

/// Remaining USDC base units in one market-local order reservation.
///
/// Aborts when this market does not own `reservation_id`.
public fun reserved_collateral<Instrument>(
  market: &Market<Instrument>,
  reservation_id: ReservationId,
): UsdcAmount {
  collateral::reserved(&market.collateral, reservation_id)
}

/// Total USDC base units held across free, reserved, and position collateral.
public fun total_collateral<Instrument>(
  market: &Market<Instrument>,
): UsdcAmount {
  collateral::total(&market.collateral)
}

// === Private Functions ===

fun ensure_position<Instrument>(
  market: &mut Market<Instrument>,
  margin_account_id: ID,
) {
  if (!market.positions.contains(margin_account_id)) {
    market.positions.add(
      margin_account_id,
      position::new<Instrument>(margin_account_id),
    );
    market.position_count = market.position_count + 1;
  };
}

fun assert_obligation_market<Instrument>(
  market: &Market<Instrument>,
  obligation: &FillObligation<Instrument>,
) {
  assert!(obligation.market_id() == object::id(market), EWrongMarket);
}

fun assert_version<Instrument>(market: &Market<Instrument>) {
  assert!(market.version == MARKET_VERSION, EWrongVersion);
}

fun assert_trading<Instrument>(market: &Market<Instrument>) {
  match (market.phase) {
    Phase::Trading => (),
    Phase::Terminal => abort ETerminalMarket,
  };
}

fun assert_terminal<Instrument>(market: &Market<Instrument>) {
  match (market.phase) {
    Phase::Trading => abort ENotTerminal,
    Phase::Terminal => (),
  };
}

fun side_count<Instrument>(market: &Market<Instrument>, side: Side): u64 {
  side.match_side!(
    || matching::bid_count(&market.orderbook),
    || matching::ask_count(&market.orderbook),
  )
}

// === Test-Only Functions ===

/// Test-only zero-collateral placement preserving matching-kernel fixtures.
#[test_only]
public fun place_limit_order<Instrument>(
  market: &mut Market<Instrument>,
  margin_account: &MarginAccount,
  _reservation_id: ID,
  witness: &Instrument,
  side: Side,
  price: Price,
  size: Size,
  ctx: &TxContext,
): FillObligation<Instrument> {
  place_collateralized_limit_order(
    market,
    margin_account,
    usdc_amount::usdc(0),
    witness,
    side,
    price,
    size,
    ctx,
  )
}

/// Test-only settlement for matching fixtures whose instruments require no
/// collateral.
#[test_only]
public fun settle_next<Instrument>(
  market: &mut Market<Instrument>,
  obligation: &mut FillObligation<Instrument>,
  witness: &Instrument,
): Fill<Instrument> {
  settle_next_with_collateral(
    market,
    obligation,
    usdc_amount::usdc(0),
    usdc_amount::usdc(0),
    witness,
  )
}

/// Populate one book side to its explicit bound without emitting order events.
#[test_only]
public fun fill_side_to_limit_for_testing<Instrument>(
  market: &mut Market<Instrument>,
  margin_account_id: ID,
  _reservation_id: ID,
  side: Side,
) {
  let market_id = object::id(market);
  let reservation_id = collateral::reserve(
    &mut market.collateral,
    market_id,
    margin_account_id,
    usdc_amount::usdc(0),
  );
  matching::fill_side_to_limit_for_testing(
    &mut market.orderbook,
    margin_account_id,
    reservation_id,
    side,
  );
}

/// Set an unsupported version to prove every public mutator fails closed.
#[test_only]
public fun set_version_for_testing<Instrument>(
  market: &mut Market<Instrument>,
  version: u64,
) {
  market.version = version;
}

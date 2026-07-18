/// The complete linear perpetual on the composable instrument standard.
///
/// This package owns everything the standard delegates to instruments:
/// margin formulas (initial margin reserved at placement, per-fill
/// consumption at each party's own leverage), average-entry tracking for
/// liquidation thresholds, mark-price oracle selection and staleness
/// validation, a lazy funding index settled permissionlessly through
/// keeper-rewarded maintenance rounds and carry, and liquidation through
/// the standard's forced-settlement transition. The kernel keeps only
/// matching data and balance transitions.
module perpetual::perp;

use nth::instrument_market::{Self, Market};
use nth::margin::{Self, MarginAccount};
use nth::matching::FillObligation;
use nth::order::{Self, OrderId, Side};
use nth::position;
use perpetual::funding::{Self, FundingState};
use perpetual::oracle::{Self, MarkOracle, PriceCap};
use perpetual::risk;
use sui::clock::Clock;
use sui::event;
use sui::table::{Self, Table};
use units::leverage::Leverage;
use units::maintenance_margin_rate::MaintenanceMarginRate;
use units::price::Price;
use units::size::Size;
use units::usdc_amount::{Self, UsdcAmount};

// === Constants ===

const EVENT_SCHEMA_VERSION: u16 = 1;

/// This instrument's kernel maintenance-action kind for funding rounds.
const FUNDING_ACTION_KIND: u64 = 1;

/// Funding rounds and liquidations reject mark prices older than this.
const MAX_ORACLE_STALENESS_MS: u64 = 60_000;

/// Share of the liquidated position's collateral paid to the keeper.
const LIQUIDATION_PENALTY_PERCENT: u64 = 5;

// === Errors ===

#[error]
const EInvalidLeverage: vector<u8> =
  b"leverage must be positive and at most the maintenance-implied maximum";

#[error]
const EZeroMargin: vector<u8> =
  b"order notional truncates to zero initial margin";

#[error]
const EInvalidMaintenanceRate: vector<u8> =
  b"maintenance margin rate must be a percent within (0, 100]";

#[error]
const EWrongPriceCap: vector<u8> =
  b"price capability belongs to a different perpetual market";

#[error]
const EFundingNotRegistered: vector<u8> =
  b"funding rounds are not registered for this market";

#[error]
const ENoExposure: vector<u8> =
  b"account has no open exposure in this market";

#[error]
const EPositionSafe: vector<u8> =
  b"position collateral satisfies its maintenance margin at the mark price";

#[error]
const EInvalidAccountOwner: vector<u8> =
  b"transaction sender does not own the margin account";

// === Structs ===

/// Type-level identity whose private field makes construction module-private.
public struct Perp has drop {
  private: bool,
}

/// One linear perpetual market: the generic kernel plus every
/// perp-specific responsibility (oracle, margin parameters, funding
/// indexes, per-order leverage, per-account average entry).
public struct PerpMarket has key {
  id: UID,
  kernel: Market<Perp>,
  oracle: MarkOracle,
  price_cap_id: ID,
  maintenance_margin_rate: MaintenanceMarginRate,
  funding: FundingState,
  funding_reserve: Option<ID>,
  order_leverage: Table<u64, Leverage>,
  entries: Table<ID, u128>,
}

// === Events ===

/// Emitted once per market creation with the perp-specific parameters.
/// `kernel_market_id` joins this wrapper's events with the kernel's
/// primitive event stream.
public struct PerpMarketCreated has copy, drop {
  schema_version: u16,
  market_id: ID,
  kernel_market_id: ID,
  maintenance_margin_rate_percent: u64,
}

/// Emitted on every capability-gated mark-price write.
public struct MarkPriceUpdated has copy, drop {
  schema_version: u16,
  market_id: ID,
  price: u64,
  timestamp_ms: u64,
}

/// Emitted once when funding rounds are registered for this market.
public struct FundingRegistered has copy, drop {
  schema_version: u16,
  market_id: ID,
  reserve_account_id: ID,
  period_interval_ms: u64,
  max_reward: u64,
}

/// Emitted per settled funding round. A zero `rate_bps` round only
/// advances the cadence; `longs_pay` is meaningless at a zero rate.
public struct FundingRoundSettled has copy, drop {
  schema_version: u16,
  market_id: ID,
  period: u64,
  rate_bps: u64,
  longs_pay: bool,
  mark_price: u64,
}

/// Emitted when one account's accrued funding settles into collateral
/// moves. `paid` is capped at the payer's position collateral.
public struct FundingSettled has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  paid: u64,
  received: u64,
}

/// Emitted when an under-collateralized position is force-closed.
public struct PositionLiquidated has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  size: u64,
  entry_price: u64,
  mark_price: u64,
  penalty: u64,
  released_collateral: u64,
}

// === Public Functions ===

/// Create a perpetual market with its mark-price capability. The
/// maintenance margin rate is a plain percent within (0, 100]; the initial
/// mark price must be positive and is stamped at the current clock.
public fun new(
  initial_mark_price: Price,
  maintenance_margin_rate: MaintenanceMarginRate,
  clock: &Clock,
  ctx: &mut TxContext,
): (PerpMarket, PriceCap) {
  assert!(
    maintenance_margin_rate.value() > 0 &&
    maintenance_margin_rate.value() <= 100,
    EInvalidMaintenanceRate,
  );
  let witness = witness();
  let cap = oracle::new_cap(ctx);
  let market = PerpMarket {
    id: object::new(ctx),
    kernel: instrument_market::new(&witness, ctx),
    oracle: oracle::new(initial_mark_price, clock),
    price_cap_id: object::id(&cap),
    maintenance_margin_rate,
    funding: funding::new(ctx),
    funding_reserve: option::none(),
    order_leverage: table::new(ctx),
    entries: table::new(ctx),
  };
  event::emit(PerpMarketCreated {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(&market),
    kernel_market_id: instrument_market::id(&market.kernel),
    maintenance_margin_rate_percent: maintenance_margin_rate.value(),
  });
  (market, cap)
}

/// Share the market object once trading opens.
public fun share(market: PerpMarket) {
  transfer::share_object(market);
}

/// Move USDC base units from the sender-owned margin account into this
/// market's isolated free collateral.
public fun deposit_collateral(
  market: &mut PerpMarket,
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

/// Return USDC base units from this market's free collateral to the
/// sender-owned margin account. Reserved and position collateral cannot
/// leave through this path.
public fun withdraw_collateral(
  market: &mut PerpMarket,
  margin_account: &mut MarginAccount,
  amount: UsdcAmount,
  ctx: &mut TxContext,
) {
  let witness = witness();
  instrument_market::withdraw_collateral(
    &mut market.kernel,
    margin_account,
    amount,
    &witness,
    ctx,
  );
}

/// Overwrite the mark price through the market's own capability.
public fun update_mark_price(
  market: &mut PerpMarket,
  cap: &PriceCap,
  new_price: Price,
  clock: &Clock,
) {
  assert!(object::id(cap) == market.price_cap_id, EWrongPriceCap);
  oracle::update(&mut market.oracle, new_price, clock);
  event::emit(MarkPriceUpdated {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    price: new_price.value(),
    timestamp_ms: clock.timestamp_ms(),
  });
}

/// Place a leveraged limit order: the initial margin
/// (`price * size / leverage`) is computed here, reserved from the
/// account's free market collateral, and consumed per fill at each party's
/// own leverage and the fill price. Fills settle atomically inside this
/// call — funding accrues and average entries update for both parties
/// before every position change. Aborts on leverage outside
/// `(0, max_leverage]` or a notional that truncates to zero margin.
public fun place_limit_order(
  market: &mut PerpMarket,
  margin_account: &MarginAccount,
  side: Side,
  price: Price,
  size: Size,
  leverage: Leverage,
  ctx: &TxContext,
) {
  let witness = witness();
  assert!(!leverage.is_zero(), EInvalidLeverage);
  assert!(
    leverage.le(risk::max_leverage(market.maintenance_margin_rate)),
    EInvalidLeverage,
  );
  let reservation = risk::initial_margin(price, size, leverage);
  assert!(reservation.value() > 0, EZeroMargin);

  let mut obligation = instrument_market::place_collateralized_limit_order(
    &mut market.kernel,
    margin_account,
    reservation,
    &witness,
    side,
    price,
    size,
    ctx,
  );
  let placed_order = obligation.order_id().value();
  market.order_leverage.add(placed_order, leverage);
  while (obligation.has_next_fill()) {
    settle_fill(market, &mut obligation, &witness);
  };
  if (obligation.resting_size().is_zero()) {
    market.order_leverage.remove(placed_order);
  };
  instrument_market::complete(&market.kernel, obligation, &witness);
}

/// Remove the sender's own resting order, releasing the unconsumed
/// reservation back to free market collateral.
public fun cancel_order(
  market: &mut PerpMarket,
  margin_account: &MarginAccount,
  side: Side,
  order_id: OrderId,
  ctx: &TxContext,
) {
  let witness = witness();
  let obligation = instrument_market::cancel_order(
    &mut market.kernel,
    margin_account,
    &witness,
    side,
    order_id,
    ctx,
  );
  market.order_leverage.remove(order_id.value());
  instrument_market::complete_cancel(&market.kernel, obligation, &witness);
}

/// Register this market's funding round as a permissionless,
/// keeper-rewarded maintenance action, exactly once. `reserve_account_id`'s
/// free collateral funds per-round rewards capped at `max_reward`, and acts
/// as the counterparty buffer for lazy funding settlement.
public fun register_funding(
  market: &mut PerpMarket,
  period_interval_ms: u64,
  reserve_account_id: ID,
  max_reward: UsdcAmount,
  clock: &Clock,
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
  market.funding_reserve.fill(reserve_account_id);
  event::emit(FundingRegistered {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    reserve_account_id,
    period_interval_ms,
    max_reward: max_reward.value(),
  });
}

/// Permissionlessly settle one funding round: validate mark-price
/// freshness, derive the round's rate from the book mid's divergence from
/// the mark, advance the paying side's cumulative index, and claim the
/// round's keeper reward through the standard's maintenance bookkeeping
/// (sequential one-time periods, wall-clock due times, capped funded
/// rewards to the sender-owned keeper account). An empty book side or a
/// zero divergence advances the cadence without moving the index.
public fun settle_funding_round(
  market: &mut PerpMarket,
  period: u64,
  reward: UsdcAmount,
  keeper_account: &MarginAccount,
  clock: &Clock,
  ctx: &TxContext,
) {
  let witness = witness();
  oracle::assert_fresh(&market.oracle, MAX_ORACLE_STALENESS_MS, clock);
  let mark = oracle::price(&market.oracle);
  let best_bid = instrument_market::best_bid_price(&market.kernel);
  let best_ask = instrument_market::best_ask_price(&market.kernel);

  let mut rate_bps = 0;
  let mut longs_pay = false;
  if (best_bid.is_some() && best_ask.is_some()) {
    let (rate, paying_side) = risk::funding_rate_bps(
      best_bid.destroy_some(),
      best_ask.destroy_some(),
      mark,
    );
    if (rate > 0) {
      paying_side.match_side!(
        || funding::advance_long_pays(&mut market.funding, mark, rate),
        || funding::advance_short_pays(&mut market.funding, mark, rate),
      );
      rate_bps = rate;
      longs_pay = paying_side.is_bid();
    };
  };

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
  event::emit(FundingRoundSettled {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    period,
    rate_bps,
    longs_pay,
    mark_price: mark.value(),
  });
}

/// Permissionlessly settle one account's accrued funding into collateral:
/// accrue to the current indexes, net both directions, then pay the net
/// payable from the account's position collateral to the funding reserve
/// (capped at what the position holds — the remainder is forgiven, per
/// docs/funding.md) or the net receivable from the reserve's free
/// collateral into the account's position collateral. A dry reserve aborts
/// the receivable path; the accruals survive for a later retry.
public fun settle_account_funding(
  market: &mut PerpMarket,
  margin_account_id: ID,
) {
  let witness = witness();
  assert!(market.funding_reserve.is_some(), EFundingNotRegistered);
  let reserve_account_id = *market.funding_reserve.borrow();
  accrue_funding(market, margin_account_id);
  let (payable, receivable) = funding::take_net(
    &mut market.funding,
    margin_account_id,
  );
  let period = instrument_market::maintenance_last_period(
    &market.kernel,
    FUNDING_ACTION_KIND,
  );
  let paid = funding::capped_payment(
    payable,
    instrument_market::position_collateral(&market.kernel, margin_account_id),
  );
  if (paid > 0) {
    instrument_market::apply_carry(
      &mut market.kernel,
      margin_account_id,
      reserve_account_id,
      usdc_amount::usdc(paid),
      period,
      true,
      false,
      &witness,
    );
  };
  if (receivable > 0) {
    let credit_position = has_open_exposure(market, margin_account_id);
    instrument_market::apply_carry(
      &mut market.kernel,
      reserve_account_id,
      margin_account_id,
      usdc_amount::usdc(receivable),
      period,
      false,
      credit_position,
      &witness,
    );
  };
  event::emit(FundingSettled {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    margin_account_id,
    paid,
    received: receivable,
  });
}

/// Permissionlessly liquidate one under-collateralized position through
/// the standard's forced-settlement transition. The trigger is this
/// instrument's own: position collateral at or below the
/// entry-price-anchored liquidation threshold at a FRESH mark price. The
/// keeper penalty moves to the sender-owned keeper account; the remainder
/// returns to the liquidated account's free collateral.
public fun liquidate(
  market: &mut PerpMarket,
  liquidated_account_id: ID,
  keeper_account: &MarginAccount,
  clock: &Clock,
  ctx: &TxContext,
) {
  let witness = witness();
  assert!(
    margin::owner(keeper_account) == ctx.sender(),
    EInvalidAccountOwner,
  );
  oracle::assert_fresh(&market.oracle, MAX_ORACLE_STALENESS_MS, clock);
  assert!(has_open_exposure(market, liquidated_account_id), ENoExposure);
  let state = instrument_market::position_state(
    &market.kernel,
    liquidated_account_id,
  );
  let size = instrument_market::position_size(
    &market.kernel,
    liquidated_account_id,
  );
  let collateral = instrument_market::position_collateral(
    &market.kernel,
    liquidated_account_id,
  );
  let entry = risk::implied_entry_price(
    market.entries[liquidated_account_id],
    size,
  );
  let mark = oracle::price(&market.oracle);
  let liquidatable = if (state == position::long()) {
    risk::long_liquidated(
      entry,
      size,
      collateral,
      market.maintenance_margin_rate,
      mark,
    )
  } else {
    risk::short_liquidated(
      entry,
      size,
      collateral,
      market.maintenance_margin_rate,
      mark,
    )
  };
  assert!(liquidatable, EPositionSafe);

  accrue_funding(market, liquidated_account_id);
  let penalty = ((collateral.value() as u128)
    * (LIQUIDATION_PENALTY_PERCENT as u128) / 100) as u64;
  if (penalty > 0) {
    instrument_market::apply_carry(
      &mut market.kernel,
      liquidated_account_id,
      object::id(keeper_account),
      usdc_amount::usdc(penalty),
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
  *market.entries.borrow_mut(liquidated_account_id) = 0;

  event::emit(PositionLiquidated {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    margin_account_id: liquidated_account_id,
    size: size.value(),
    entry_price: entry.value(),
    mark_price: mark.value(),
    penalty,
    released_collateral: remainder.value(),
  });
}

// === View Functions ===

/// The kernel market identity used in primitive kernel events.
public fun kernel_id(market: &PerpMarket): ID {
  instrument_market::id(&market.kernel)
}

/// The current mark price.
public fun mark_price(market: &PerpMarket): Price {
  oracle::price(&market.oracle)
}

/// `Clock`-milliseconds timestamp of the last mark-price write.
public fun mark_price_updated_ms(market: &PerpMarket): u64 {
  oracle::last_update_ms(&market.oracle)
}

/// The market's maintenance margin rate (plain percent).
public fun maintenance_margin_rate(
  market: &PerpMarket,
): MaintenanceMarginRate {
  market.maintenance_margin_rate
}

/// The highest leverage accepted at placement.
public fun max_leverage(market: &PerpMarket): Leverage {
  risk::max_leverage(market.maintenance_margin_rate)
}

/// Primitive net-position state code for one account.
public fun position_state(market: &PerpMarket, margin_account_id: ID): u8 {
  instrument_market::position_state(&market.kernel, margin_account_id)
}

/// Absolute net position size at the shared `10^6` scale.
public fun position_size(market: &PerpMarket, margin_account_id: ID): Size {
  instrument_market::position_size(&market.kernel, margin_account_id)
}

/// Free USDC base units available to the account in this market.
public fun free_collateral(
  market: &PerpMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::free_collateral(&market.kernel, margin_account_id)
}

/// USDC base units backing the account's net position.
public fun position_collateral(
  market: &PerpMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::position_collateral(&market.kernel, margin_account_id)
}

/// Total USDC base units isolated inside this market.
public fun total_collateral(market: &PerpMarket): UsdcAmount {
  instrument_market::total_collateral(&market.kernel)
}

/// Number of resting bids.
public fun bid_count(market: &PerpMarket): u64 {
  instrument_market::bid_count(&market.kernel)
}

/// Number of resting asks.
public fun ask_count(market: &PerpMarket): u64 {
  instrument_market::ask_count(&market.kernel)
}

/// The account's average entry price implied by its tracked entry
/// notional. Aborts for an account without open exposure.
public fun entry_price(market: &PerpMarket, margin_account_id: ID): Price {
  assert!(market.entries.contains(margin_account_id), ENoExposure);
  risk::implied_entry_price(
    market.entries[margin_account_id],
    instrument_market::position_size(&market.kernel, margin_account_id),
  )
}

/// Cumulative funding index of rounds longs paid.
public fun long_pays_index(market: &PerpMarket): u128 {
  funding::long_pays_index(&market.funding)
}

/// Cumulative funding index of rounds shorts paid.
public fun short_pays_index(market: &PerpMarket): u128 {
  funding::short_pays_index(&market.funding)
}

/// Accrued unsettled USDC base units the account owes.
public fun funding_payable(
  market: &PerpMarket,
  margin_account_id: ID,
): u64 {
  funding::payable(&market.funding, margin_account_id)
}

/// Accrued unsettled USDC base units owed to the account.
public fun funding_receivable(
  market: &PerpMarket,
  margin_account_id: ID,
): u64 {
  funding::receivable(&market.funding, margin_account_id)
}

/// Last settled funding period, `0` before the first round. Aborts before
/// funding registration.
public fun funding_last_period(market: &PerpMarket): u64 {
  instrument_market::maintenance_last_period(
    &market.kernel,
    FUNDING_ACTION_KIND,
  )
}

// === Private Functions ===

/// Settle one matched fill: accrue funding and update average entries for
/// both parties at their PRE-fill exposures, then consume each party's
/// margin for the fill notional at that party's own order leverage.
fun settle_fill(
  market: &mut PerpMarket,
  obligation: &mut FillObligation<Perp>,
  witness: &Perp,
) {
  let fill = obligation.next_fill();
  let maker_id = fill.maker_margin_account_id();
  let taker_id = fill.taker_margin_account_id();
  accrue_funding(market, maker_id);
  accrue_funding(market, taker_id);

  let maker_leverage = market.order_leverage[fill.maker_order_id().value()];
  let taker_leverage = market.order_leverage[fill.taker_order_id().value()];
  let maker_collateral = risk::initial_margin(
    fill.price(),
    fill.size(),
    maker_leverage,
  );
  let taker_collateral = risk::initial_margin(
    fill.price(),
    fill.size(),
    taker_leverage,
  );
  let taker_side = fill.maker_side().match_side!(
    || order::ask(),
    || order::bid(),
  );
  update_entry(market, maker_id, fill.maker_side(), fill.price(), fill.size());
  update_entry(market, taker_id, taker_side, fill.price(), fill.size());

  instrument_market::settle_next_with_collateral(
    &mut market.kernel,
    obligation,
    maker_collateral,
    taker_collateral,
    witness,
  );
  if (fill.maker_fully_filled()) {
    market.order_leverage.remove(fill.maker_order_id().value());
  };
}

/// Update one account's double-scaled average-entry notional for a fill it
/// participates in, from its PRE-fill exposure: increases add the fill
/// notional, reductions release entry notional pro rata, an exact close
/// zeroes it, and a flip restarts it at the fill price for the flipped
/// remainder.
fun update_entry(
  market: &mut PerpMarket,
  margin_account_id: ID,
  trade_side: Side,
  fill_price: Price,
  fill_size: Size,
) {
  if (!market.entries.contains(margin_account_id)) {
    market.entries.add(margin_account_id, 0);
  };
  let (state, current_size) = if (
    instrument_market::has_position(&market.kernel, margin_account_id)
  ) {
    (
      instrument_market::position_state(&market.kernel, margin_account_id),
      instrument_market::position_size(&market.kernel, margin_account_id)
        .value() as u128,
    )
  } else {
    (position::flat(), 0)
  };
  let notional = market.entries[margin_account_id];
  let fill = fill_size.value() as u128;
  let fill_notional = (fill_price.value() as u128) * fill;

  let increases = trade_side.match_side!(
    || state != position::short(),
    || state != position::long(),
  );
  let updated = if (increases) {
    notional + fill_notional
  } else if (fill < current_size) {
    notional - notional * fill / current_size
  } else if (fill == current_size) {
    0
  } else {
    (fill_price.value() as u128) * (fill - current_size)
  };
  *market.entries.borrow_mut(margin_account_id) = updated;
}

/// Accrue funding for one account at its CURRENT exposure and snapshot its
/// cursor. Every position-changing transition calls this first.
fun accrue_funding(market: &mut PerpMarket, margin_account_id: ID) {
  let exposure = if (
    !instrument_market::has_position(&market.kernel, margin_account_id)
  ) {
    funding::flat()
  } else {
    let state = instrument_market::position_state(
      &market.kernel,
      margin_account_id,
    );
    let size = instrument_market::position_size(
      &market.kernel,
      margin_account_id,
    );
    if (state == position::long()) {
      funding::long(size)
    } else if (state == position::short()) {
      funding::short(size)
    } else {
      funding::flat()
    }
  };
  funding::accrue(&mut market.funding, margin_account_id, exposure);
}

/// Whether the account currently holds a non-flat net position.
fun has_open_exposure(market: &PerpMarket, margin_account_id: ID): bool {
  instrument_market::has_position(&market.kernel, margin_account_id) &&
  instrument_market::position_state(&market.kernel, margin_account_id)
    != position::flat()
}

fun witness(): Perp {
  Perp { private: true }
}

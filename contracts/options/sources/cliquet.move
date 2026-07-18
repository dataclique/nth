/// Cliquet (ratchet) option on the composable instrument standard — the
/// exotic-payoff demonstration: an exotic is an instrument-package concern
/// composed entirely from existing kernel transitions.
///
/// A cliquet is a series of forward-start options. At each reset period the
/// clamped gain since the last reset, `min(max(S_t - K_prev, 0), local
/// cap)`, LOCKS IN and the strike ratchets to the current underlying price.
/// Reset rounds are permissionless keeper-rewarded maintenance periods
/// (sequential, one-time, wall-clock due). After the last reset anyone
/// binds the accumulated payoff and the market turns terminal; settlement
/// clears through a reserve exactly like `options::european`. Shorts escrow
/// `periods * local_cap` per unit — the maximum possible accrued payoff —
/// so the instrument is fully collateralized and needs no liquidation path.
module options::cliquet;

use nth::instrument_market::{Self, Market};
use nth::margin::MarginAccount;
use nth::matching::FillObligation;
use nth::order::{Self, OrderId, Side};
use nth::position;
use options::oracle::{Self, UnderlyingOracle, PriceCap};
use sui::clock::Clock;
use sui::event;
use units::price::{Self, Price};
use units::size::Size;
use units::usdc_amount::{Self, UsdcAmount};

// === Constants ===

const EVENT_SCHEMA_VERSION: u16 = 1;

/// This instrument's kernel maintenance-action kind for reset rounds.
const RESET_ACTION_KIND: u64 = 1;

/// Reset rounds and settlement reject prices older than this.
const MAX_ORACLE_STALENESS_MS: u64 = 60_000;

// === Errors ===

#[error]
const EZeroStrike: vector<u8> = b"initial strike must be positive";

#[error]
const EZeroLocalCap: vector<u8> = b"per-period gain cap must be positive";

#[error]
const EZeroPeriods: vector<u8> = b"a cliquet needs at least one reset period";

#[error]
const EWrongPriceCap: vector<u8> =
  b"price capability belongs to a different options market";

#[error]
const EStaleUnderlyingPrice: vector<u8> =
  b"underlying price is older than the staleness bound";

#[error]
const EResetScheduleComplete: vector<u8> =
  b"every reset period has already locked in";

#[error]
const EResetsNotComplete: vector<u8> =
  b"settlement binds only after the last reset period";

#[error]
const ENotBound: vector<u8> =
  b"positions settle only after the settlement value is bound";

#[error]
const EZeroEscrow: vector<u8> =
  b"seller escrow truncates to zero for this size";

// === Structs ===

/// Type-level identity whose private field makes construction module-private.
public struct Cliquet has drop {
  private: bool,
}

/// One cliquet market: the generic kernel plus the ratchet state. `strike`
/// resets at every locked period; `accrued_payoff_per_unit` accumulates the
/// clamped per-period gains in per-unit price units.
public struct CliquetMarket has key {
  id: UID,
  kernel: Market<Cliquet>,
  oracle: UnderlyingOracle,
  price_cap_id: ID,
  strike: Price,
  local_cap: Price,
  periods: u64,
  accrued_payoff_per_unit: u64,
  settlement_reserve: ID,
  payoff_per_unit: Option<u64>,
}

// === Events ===

/// Emitted once per market creation with the cliquet terms.
public struct CliquetMarketCreated has copy, drop {
  schema_version: u16,
  market_id: ID,
  kernel_market_id: ID,
  initial_strike: u64,
  local_cap: u64,
  periods: u64,
  period_interval_ms: u64,
  settlement_reserve: ID,
}

/// Emitted on every capability-gated underlying-price write.
public struct UnderlyingPriceUpdated has copy, drop {
  schema_version: u16,
  market_id: ID,
  price: u64,
  timestamp_ms: u64,
}

/// Emitted when one fill's premium moves from buyer to seller.
public struct PremiumPaid has copy, drop {
  schema_version: u16,
  market_id: ID,
  buyer_account_id: ID,
  seller_account_id: ID,
  premium: u64,
  size: u64,
}

/// Emitted per locked reset period: `gain_per_unit` joined the accrued
/// payoff and the strike ratcheted to `new_strike`.
public struct StrikeReset has copy, drop {
  schema_version: u16,
  market_id: ID,
  period: u64,
  underlying_price: u64,
  gain_per_unit: u64,
  new_strike: u64,
  accrued_payoff_per_unit: u64,
}

/// Emitted exactly once when the accumulated payoff binds after the final
/// reset.
public struct SettlementBound has copy, drop {
  schema_version: u16,
  market_id: ID,
  payoff_per_unit: u64,
}

// === Public Functions ===

/// Create a cliquet market with its underlying-price capability, and
/// register the reset schedule as a keeper-rewarded maintenance action:
/// `periods` sequential rounds spaced `period_interval_ms` apart, rewards
/// capped at `max_reset_reward` from `keeper_reserve`'s free collateral.
public fun new(
  initial_strike: Price,
  local_cap: Price,
  periods: u64,
  period_interval_ms: u64,
  initial_underlying_price: Price,
  settlement_reserve: ID,
  keeper_reserve: ID,
  max_reset_reward: UsdcAmount,
  clock: &Clock,
  ctx: &mut TxContext,
): (CliquetMarket, PriceCap) {
  assert!(!initial_strike.is_zero(), EZeroStrike);
  assert!(!local_cap.is_zero(), EZeroLocalCap);
  assert!(periods > 0, EZeroPeriods);
  let witness = witness();
  let cap = oracle::new_cap(ctx);
  let mut market = CliquetMarket {
    id: object::new(ctx),
    kernel: instrument_market::new(&witness, ctx),
    oracle: oracle::new(initial_underlying_price, clock),
    price_cap_id: object::id(&cap),
    strike: initial_strike,
    local_cap,
    periods,
    accrued_payoff_per_unit: 0,
    settlement_reserve,
    payoff_per_unit: option::none(),
  };
  instrument_market::register_maintenance(
    &mut market.kernel,
    RESET_ACTION_KIND,
    period_interval_ms,
    keeper_reserve,
    max_reset_reward,
    clock,
    &witness,
  );
  event::emit(CliquetMarketCreated {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(&market),
    kernel_market_id: instrument_market::id(&market.kernel),
    initial_strike: initial_strike.value(),
    local_cap: local_cap.value(),
    periods,
    period_interval_ms,
    settlement_reserve,
  });
  (market, cap)
}

/// Share the market object once trading opens.
public fun share(market: CliquetMarket) {
  transfer::share_object(market);
}

/// Move USDC base units from the sender-owned margin account into this
/// market's isolated free collateral.
public fun deposit_collateral(
  market: &mut CliquetMarket,
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
/// sender-owned margin account.
public fun withdraw_collateral(
  market: &mut CliquetMarket,
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

/// Overwrite the underlying price through the market's own capability.
public fun update_underlying_price(
  market: &mut CliquetMarket,
  cap: &PriceCap,
  new_price: Price,
  clock: &Clock,
) {
  assert!(object::id(cap) == market.price_cap_id, EWrongPriceCap);
  oracle::update(&mut market.oracle, new_price, clock);
  event::emit(UnderlyingPriceUpdated {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    price: new_price.value(),
    timestamp_ms: clock.timestamp_ms(),
  });
}

/// Place a premium limit order. Bids reserve the premium `price * size`;
/// asks reserve the full escrow `periods * local_cap * size` — the maximum
/// possible accrued payoff. Fills settle atomically, carrying the premium
/// from the buyer to the seller. The kernel rejects orders once the market
/// is terminal.
public fun place_limit_order(
  market: &mut CliquetMarket,
  margin_account: &MarginAccount,
  side: Side,
  price: Price,
  size: Size,
  ctx: &TxContext,
) {
  let witness = witness();
  let reservation = side.match_side!(
    || per_unit_amount(price, size),
    || {
      let escrow = escrow_amount(market, size);
      assert!(escrow.value() > 0, EZeroEscrow);
      escrow
    },
  );
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
  while (obligation.has_next_fill()) {
    settle_fill(market, &mut obligation, &witness);
  };
  instrument_market::complete(&market.kernel, obligation, &witness);
}

/// Remove the sender's own resting order, releasing the unconsumed premium
/// or escrow reservation back to free collateral.
public fun cancel_order(
  market: &mut CliquetMarket,
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
  instrument_market::complete_cancel(&market.kernel, obligation, &witness);
}

/// Permissionlessly lock in one reset period at a FRESH underlying price
/// and earn the keeper reward through the kernel's maintenance bookkeeping
/// (sequential one-time periods, wall-clock due times, capped funded
/// rewards). The clamped gain since the previous reset joins the accrued
/// payoff and the strike ratchets to the current price. Aborts once every
/// scheduled period has locked.
public fun settle_reset_round(
  market: &mut CliquetMarket,
  period: u64,
  reward: UsdcAmount,
  keeper_account: &MarginAccount,
  clock: &Clock,
  ctx: &TxContext,
) {
  let witness = witness();
  assert!(period <= market.periods, EResetScheduleComplete);
  let now = clock.timestamp_ms();
  assert!(
    now <= oracle::last_update_ms(&market.oracle) + MAX_ORACLE_STALENESS_MS,
    EStaleUnderlyingPrice,
  );
  instrument_market::claim_maintenance(
    &mut market.kernel,
    RESET_ACTION_KIND,
    period,
    reward,
    keeper_account,
    clock,
    &witness,
    ctx,
  );
  let underlying = oracle::price(&market.oracle);
  let raw_gain = if (underlying.gt(market.strike)) {
    underlying.value() - market.strike.value()
  } else {
    0
  };
  let gain = if (raw_gain > market.local_cap.value()) {
    market.local_cap.value()
  } else {
    raw_gain
  };
  market.accrued_payoff_per_unit = market.accrued_payoff_per_unit + gain;
  market.strike = underlying;
  event::emit(StrikeReset {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    period,
    underlying_price: underlying.value(),
    gain_per_unit: gain,
    new_strike: underlying.value(),
    accrued_payoff_per_unit: market.accrued_payoff_per_unit,
  });
}

/// Permissionlessly bind the accumulated payoff exactly once after the
/// final reset period has locked, turning the market terminal.
public fun bind_settlement(market: &mut CliquetMarket) {
  let witness = witness();
  assert!(
    instrument_market::maintenance_last_period(
      &market.kernel,
      RESET_ACTION_KIND,
    ) == market.periods,
    EResetsNotComplete,
  );
  instrument_market::enter_terminal(&mut market.kernel, &witness);
  market.payoff_per_unit.fill(market.accrued_payoff_per_unit);
  event::emit(SettlementBound {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    payoff_per_unit: market.accrued_payoff_per_unit,
  });
}

/// Permissionlessly settle one account after binding, exactly once per
/// account: shorts pay `payoff * size` into the settlement reserve, longs
/// draw the same out, and the terminal transition releases every remaining
/// balance.
public fun settle_position(
  market: &mut CliquetMarket,
  margin_account_id: ID,
) {
  let witness = witness();
  assert!(market.payoff_per_unit.is_some(), ENotBound);
  let payoff = *market.payoff_per_unit.borrow();
  if (
    payoff > 0 &&
    instrument_market::has_position(&market.kernel, margin_account_id)
  ) {
    let state = instrument_market::position_state(
      &market.kernel,
      margin_account_id,
    );
    let size = instrument_market::position_size(
      &market.kernel,
      margin_account_id,
    );
    let owed = per_unit_amount(price::price(payoff), size);
    if (owed.value() > 0) {
      if (state == position::short()) {
        instrument_market::apply_carry(
          &mut market.kernel,
          margin_account_id,
          market.settlement_reserve,
          owed,
          market.periods,
          true,
          false,
          &witness,
        );
      } else if (state == position::long()) {
        instrument_market::apply_carry(
          &mut market.kernel,
          market.settlement_reserve,
          margin_account_id,
          owed,
          market.periods,
          false,
          false,
          &witness,
        );
      };
    };
  };
  instrument_market::settle_terminal_position(
    &mut market.kernel,
    margin_account_id,
    &witness,
  );
}

/// Permissionlessly remove up to `max_orders` resting orders from `side` of
/// the terminal market, returning each reservation to its owner.
public fun cancel_terminal_orders(
  market: &mut CliquetMarket,
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

// === View Functions ===

/// The kernel market identity used in primitive kernel events.
public fun kernel_id(market: &CliquetMarket): ID {
  instrument_market::id(&market.kernel)
}

/// The current (last reset) strike at the shared `10^6` scale.
public fun strike(market: &CliquetMarket): Price {
  market.strike
}

/// The per-period gain clamp.
public fun local_cap(market: &CliquetMarket): Price {
  market.local_cap
}

/// The total number of scheduled reset periods.
public fun periods(market: &CliquetMarket): u64 {
  market.periods
}

/// Locked reset periods so far, `0` before the first.
public fun locked_periods(market: &CliquetMarket): u64 {
  instrument_market::maintenance_last_period(
    &market.kernel,
    RESET_ACTION_KIND,
  )
}

/// The accumulated per-unit payoff locked so far, in price units.
public fun accrued_payoff_per_unit(market: &CliquetMarket): u64 {
  market.accrued_payoff_per_unit
}

/// The current underlying price.
public fun underlying_price(market: &CliquetMarket): Price {
  oracle::price(&market.oracle)
}

/// The bound per-unit settlement payoff, `none` before binding.
public fun payoff_per_unit(market: &CliquetMarket): Option<u64> {
  market.payoff_per_unit
}

/// Whether the market has entered its terminal phase.
public fun is_terminal(market: &CliquetMarket): bool {
  instrument_market::is_terminal(&market.kernel)
}

/// Primitive net-position state code for one account.
public fun position_state(
  market: &CliquetMarket,
  margin_account_id: ID,
): u8 {
  instrument_market::position_state(&market.kernel, margin_account_id)
}

/// Whether the account has a materialized position in this market.
public fun has_position(
  market: &CliquetMarket,
  margin_account_id: ID,
): bool {
  instrument_market::has_position(&market.kernel, margin_account_id)
}

/// Absolute net position size at the shared `10^6` scale.
public fun position_size(
  market: &CliquetMarket,
  margin_account_id: ID,
): Size {
  instrument_market::position_size(&market.kernel, margin_account_id)
}

/// Free USDC base units available to the account in this market.
public fun free_collateral(
  market: &CliquetMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::free_collateral(&market.kernel, margin_account_id)
}

/// USDC base units backing the account's net position.
public fun position_collateral(
  market: &CliquetMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::position_collateral(&market.kernel, margin_account_id)
}

/// Total USDC base units isolated inside this market.
public fun total_collateral(market: &CliquetMarket): UsdcAmount {
  instrument_market::total_collateral(&market.kernel)
}

/// Number of resting bids.
public fun bid_count(market: &CliquetMarket): u64 {
  instrument_market::bid_count(&market.kernel)
}

/// Number of resting asks.
public fun ask_count(market: &CliquetMarket): u64 {
  instrument_market::ask_count(&market.kernel)
}

// === Private Functions ===

/// Settle one matched fill exactly as the other option modules do: consume
/// the buyer's premium and the seller's escrow, then carry the premium.
fun settle_fill(
  market: &mut CliquetMarket,
  obligation: &mut FillObligation<Cliquet>,
  witness: &Cliquet,
) {
  let fill = obligation.next_fill();
  let premium = per_unit_amount(fill.price(), fill.size());
  let escrow = escrow_amount(market, fill.size());
  let (maker_collateral, taker_collateral) = fill.maker_side().match_side!(
    || (premium, escrow),
    || (escrow, premium),
  );
  let (buyer_id, seller_id) = fill.maker_side().match_side!(
    || (fill.maker_margin_account_id(), fill.taker_margin_account_id()),
    || (fill.taker_margin_account_id(), fill.maker_margin_account_id()),
  );
  instrument_market::settle_next_with_collateral(
    &mut market.kernel,
    obligation,
    maker_collateral,
    taker_collateral,
    witness,
  );
  if (premium.value() > 0) {
    instrument_market::apply_carry(
      &mut market.kernel,
      buyer_id,
      seller_id,
      premium,
      0,
      true,
      false,
      witness,
    );
  };
  event::emit(PremiumPaid {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    buyer_account_id: buyer_id,
    seller_account_id: seller_id,
    premium: premium.value(),
    size: fill.size().value(),
  });
}

/// The seller escrow for `size`: `periods * local_cap * size` — the
/// maximum accrued payoff a cliquet can reach.
fun escrow_amount(market: &CliquetMarket, size: Size): UsdcAmount {
  let value =
    (market.periods as u128) * (market.local_cap.value() as u128)
      * (size.value() as u128)
      / (units::scaling::float_scaling() as u128);
  usdc_amount::usdc_from_u128(value)
}

/// A per-unit price applied to a `10^6`-scaled size, in USDC base units.
fun per_unit_amount(price: Price, size: Size): UsdcAmount {
  let value =
    (price.value() as u128) * (size.value() as u128)
      / (units::scaling::float_scaling() as u128);
  usdc_amount::usdc_from_u128(value)
}

fun witness(): Cliquet {
  Cliquet { private: true }
}

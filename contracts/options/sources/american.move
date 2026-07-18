/// American cash-settled call option on the composable instrument standard.
///
/// Identical market structure to `options::european` — premium book,
/// fully escrowed shorts, one-time expiry binding, reserve-cleared terminal
/// settlement — plus **holder-initiated early exercise**: before expiry a
/// long holder may exercise any part of its position at a fresh underlying
/// price, assigning any short. The clamped intrinsic value
/// `min(max(S - K, 0), cap)` carries from the assigned short's escrow to
/// the holder, the short's excess escrow releases pro rata, and both
/// exposures reduce through the standard's forced-settlement transition —
/// the instrument-defined trigger here is the holder's own signature plus a
/// valid assignment, not distress.
module options::american;

use nth::instrument_market::{Self, Market};
use nth::margin::{Self, MarginAccount};
use nth::matching::FillObligation;
use nth::order::{Self, OrderId, Side};
use nth::position;
use options::oracle::{Self, UnderlyingOracle, PriceCap};
use sui::clock::Clock;
use sui::event;
use units::price::Price;
use units::size::Size;
use units::usdc_amount::{Self, UsdcAmount};

// === Constants ===

const EVENT_SCHEMA_VERSION: u16 = 1;

/// Exercise and settlement binding reject prices older than this.
const MAX_ORACLE_STALENESS_MS: u64 = 60_000;

// === Errors ===

#[error]
const EZeroStrike: vector<u8> = b"strike price must be positive";

#[error]
const EZeroPayoutCap: vector<u8> = b"per-unit payout cap must be positive";

#[error]
const EExpiryNotInFuture: vector<u8> =
  b"expiry must be strictly after market creation";

#[error]
const EWrongPriceCap: vector<u8> =
  b"price capability belongs to a different options market";

#[error]
const EExpired: vector<u8> =
  b"an expired option accepts no new orders or exercises";

#[error]
const ENotExpired: vector<u8> =
  b"settlement can bind only at or after expiry";

#[error]
const EStaleUnderlyingPrice: vector<u8> =
  b"underlying price is older than the staleness bound";

#[error]
const ENotBound: vector<u8> =
  b"positions settle only after the settlement value is bound";

#[error]
const EZeroEscrow: vector<u8> =
  b"seller escrow truncates to zero for this size";

#[error]
const EInvalidAccountOwner: vector<u8> =
  b"transaction sender does not own the margin account";

#[error]
const EInsufficientLongExposure: vector<u8> =
  b"holder must be long at least the exercised size";

#[error]
const EInsufficientShortExposure: vector<u8> =
  b"assigned account must be short at least the exercised size";

// === Structs ===

/// Type-level identity whose private field makes construction module-private.
public struct American has drop {
  private: bool,
}

/// One American call market: the generic kernel plus the option's terms,
/// oracle, and one-time settlement state.
public struct AmericanMarket has key {
  id: UID,
  kernel: Market<American>,
  oracle: UnderlyingOracle,
  price_cap_id: ID,
  strike: Price,
  expiry_ms: u64,
  payout_cap: Price,
  settlement_reserve: ID,
  payoff_per_unit: Option<u64>,
}

// === Events ===

/// Emitted once per market creation with the option terms.
public struct AmericanMarketCreated has copy, drop {
  schema_version: u16,
  market_id: ID,
  kernel_market_id: ID,
  strike: u64,
  expiry_ms: u64,
  payout_cap: u64,
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

/// Emitted per early exercise: the holder collected `payoff_per_unit *
/// size` from the assigned short's escrow at `underlying_price`.
public struct OptionExercised has copy, drop {
  schema_version: u16,
  market_id: ID,
  holder_account_id: ID,
  assigned_account_id: ID,
  size: u64,
  underlying_price: u64,
  payoff_per_unit: u64,
}

/// Emitted exactly once when the settlement value binds at expiry.
public struct SettlementBound has copy, drop {
  schema_version: u16,
  market_id: ID,
  underlying_price: u64,
  payoff_per_unit: u64,
}

// === Public Functions ===

/// Create an American call market with its underlying-price capability.
/// Terms match `options::european::new`; the difference is the exercise
/// path below.
public fun new(
  strike: Price,
  expiry_ms: u64,
  payout_cap: Price,
  initial_underlying_price: Price,
  settlement_reserve: ID,
  clock: &Clock,
  ctx: &mut TxContext,
): (AmericanMarket, PriceCap) {
  assert!(!strike.is_zero(), EZeroStrike);
  assert!(!payout_cap.is_zero(), EZeroPayoutCap);
  assert!(expiry_ms > clock.timestamp_ms(), EExpiryNotInFuture);
  let witness = witness();
  let cap = oracle::new_cap(ctx);
  let market = AmericanMarket {
    id: object::new(ctx),
    kernel: instrument_market::new(&witness, ctx),
    oracle: oracle::new(initial_underlying_price, clock),
    price_cap_id: object::id(&cap),
    strike,
    expiry_ms,
    payout_cap,
    settlement_reserve,
    payoff_per_unit: option::none(),
  };
  event::emit(AmericanMarketCreated {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(&market),
    kernel_market_id: instrument_market::id(&market.kernel),
    strike: strike.value(),
    expiry_ms,
    payout_cap: payout_cap.value(),
    settlement_reserve,
  });
  (market, cap)
}

/// Share the market object once trading opens.
public fun share(market: AmericanMarket) {
  transfer::share_object(market);
}

/// Move USDC base units from the sender-owned margin account into this
/// market's isolated free collateral.
public fun deposit_collateral(
  market: &mut AmericanMarket,
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
  market: &mut AmericanMarket,
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
  market: &mut AmericanMarket,
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

/// Place a premium limit order before expiry. Reservation and fill
/// semantics match `options::european::place_limit_order`: bids reserve the
/// premium, asks the full escrow, and each fill carries the premium from
/// the buyer to the seller.
public fun place_limit_order(
  market: &mut AmericanMarket,
  margin_account: &MarginAccount,
  side: Side,
  price: Price,
  size: Size,
  clock: &Clock,
  ctx: &TxContext,
) {
  let witness = witness();
  assert!(clock.timestamp_ms() < market.expiry_ms, EExpired);
  let reservation = side.match_side!(
    || per_unit_amount(price, size),
    || {
      let escrow = per_unit_amount(market.payout_cap, size);
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
  market: &mut AmericanMarket,
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

/// Exercise `size` of the sender's long position before expiry against any
/// short, at a FRESH underlying price. The clamped intrinsic value carries
/// from the assigned short's escrowed position collateral to the holder's
/// free collateral, the short's excess escrow for the exercised size
/// releases back to its own free collateral, and both exposures reduce
/// through the standard's forced-settlement transition.
public fun exercise(
  market: &mut AmericanMarket,
  holder_account: &MarginAccount,
  assigned_account_id: ID,
  size: Size,
  clock: &Clock,
  ctx: &TxContext,
) {
  let witness = witness();
  assert!(
    margin::owner(holder_account) == ctx.sender(),
    EInvalidAccountOwner,
  );
  let now = clock.timestamp_ms();
  assert!(now < market.expiry_ms, EExpired);
  assert!(
    now <= oracle::last_update_ms(&market.oracle) + MAX_ORACLE_STALENESS_MS,
    EStaleUnderlyingPrice,
  );
  let holder_id = object::id(holder_account);
  assert!(
    exposure_covers(market, holder_id, position::long(), size),
    EInsufficientLongExposure,
  );
  assert!(
    exposure_covers(market, assigned_account_id, position::short(), size),
    EInsufficientShortExposure,
  );

  let underlying = oracle::price(&market.oracle);
  let payoff = clamped_intrinsic(market, underlying);
  let owed = per_unit_amount(units::price::price(payoff), size);
  if (owed.value() > 0) {
    instrument_market::apply_carry(
      &mut market.kernel,
      assigned_account_id,
      holder_id,
      owed,
      now,
      true,
      false,
      &witness,
    );
  };
  let escrow_released = per_unit_amount(market.payout_cap, size)
    .sub(owed);
  instrument_market::force_reduce_position(
    &mut market.kernel,
    assigned_account_id,
    size,
    escrow_released,
    &witness,
  );
  instrument_market::force_reduce_position(
    &mut market.kernel,
    holder_id,
    size,
    usdc_amount::usdc(0),
    &witness,
  );

  event::emit(OptionExercised {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    holder_account_id: holder_id,
    assigned_account_id,
    size: size.value(),
    underlying_price: underlying.value(),
    payoff_per_unit: payoff,
  });
}

/// Permissionlessly bind the settlement value exactly once at or after
/// expiry from a FRESH underlying price and turn the market terminal.
public fun bind_settlement(market: &mut AmericanMarket, clock: &Clock) {
  let witness = witness();
  let now = clock.timestamp_ms();
  assert!(now >= market.expiry_ms, ENotExpired);
  assert!(
    now <= oracle::last_update_ms(&market.oracle) + MAX_ORACLE_STALENESS_MS,
    EStaleUnderlyingPrice,
  );
  let underlying = oracle::price(&market.oracle);
  let payoff = clamped_intrinsic(market, underlying);
  instrument_market::enter_terminal(&mut market.kernel, &witness);
  market.payoff_per_unit.fill(payoff);
  event::emit(SettlementBound {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    underlying_price: underlying.value(),
    payoff_per_unit: payoff,
  });
}

/// Permissionlessly settle one account after binding, exactly once per
/// account: shorts pay `payoff * size` into the settlement reserve, longs
/// draw the same out, and the terminal transition releases every remaining
/// balance.
public fun settle_position(
  market: &mut AmericanMarket,
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
    let owed = per_unit_amount(units::price::price(payoff), size);
    if (owed.value() > 0) {
      if (state == position::short()) {
        instrument_market::apply_carry(
          &mut market.kernel,
          margin_account_id,
          market.settlement_reserve,
          owed,
          market.expiry_ms,
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
          market.expiry_ms,
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
  market: &mut AmericanMarket,
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
public fun kernel_id(market: &AmericanMarket): ID {
  instrument_market::id(&market.kernel)
}

/// The strike price at the shared `10^6` scale.
public fun strike(market: &AmericanMarket): Price {
  market.strike
}

/// `Clock`-milliseconds expiry.
public fun expiry_ms(market: &AmericanMarket): u64 {
  market.expiry_ms
}

/// The per-unit payoff clamp that fully collateralizes shorts.
public fun payout_cap(market: &AmericanMarket): Price {
  market.payout_cap
}

/// The current underlying price.
public fun underlying_price(market: &AmericanMarket): Price {
  oracle::price(&market.oracle)
}

/// The bound per-unit settlement payoff, `none` before binding.
public fun payoff_per_unit(market: &AmericanMarket): Option<u64> {
  market.payoff_per_unit
}

/// Whether the market has entered its terminal phase.
public fun is_terminal(market: &AmericanMarket): bool {
  instrument_market::is_terminal(&market.kernel)
}

/// Primitive net-position state code for one account.
public fun position_state(
  market: &AmericanMarket,
  margin_account_id: ID,
): u8 {
  instrument_market::position_state(&market.kernel, margin_account_id)
}

/// Whether the account has a materialized position in this market.
public fun has_position(
  market: &AmericanMarket,
  margin_account_id: ID,
): bool {
  instrument_market::has_position(&market.kernel, margin_account_id)
}

/// Absolute net position size at the shared `10^6` scale.
public fun position_size(
  market: &AmericanMarket,
  margin_account_id: ID,
): Size {
  instrument_market::position_size(&market.kernel, margin_account_id)
}

/// Free USDC base units available to the account in this market.
public fun free_collateral(
  market: &AmericanMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::free_collateral(&market.kernel, margin_account_id)
}

/// USDC base units backing the account's net position.
public fun position_collateral(
  market: &AmericanMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::position_collateral(&market.kernel, margin_account_id)
}

/// Total USDC base units isolated inside this market.
public fun total_collateral(market: &AmericanMarket): UsdcAmount {
  instrument_market::total_collateral(&market.kernel)
}

/// Number of resting bids.
public fun bid_count(market: &AmericanMarket): u64 {
  instrument_market::bid_count(&market.kernel)
}

/// Number of resting asks.
public fun ask_count(market: &AmericanMarket): u64 {
  instrument_market::ask_count(&market.kernel)
}

// === Private Functions ===

/// Settle one matched fill exactly as the European module does: consume the
/// buyer's premium and the seller's escrow, then carry the premium.
fun settle_fill(
  market: &mut AmericanMarket,
  obligation: &mut FillObligation<American>,
  witness: &American,
) {
  let fill = obligation.next_fill();
  let premium = per_unit_amount(fill.price(), fill.size());
  let escrow = per_unit_amount(market.payout_cap, fill.size());
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

/// Whether the account holds `state` exposure of at least `size`.
fun exposure_covers(
  market: &AmericanMarket,
  margin_account_id: ID,
  state: u8,
  size: Size,
): bool {
  instrument_market::has_position(&market.kernel, margin_account_id) &&
  instrument_market::position_state(&market.kernel, margin_account_id)
    == state &&
  !instrument_market::position_size(&market.kernel, margin_account_id)
    .lt(size)
}

/// The clamped intrinsic value `min(max(S - K, 0), payout_cap)` in
/// per-unit price units.
fun clamped_intrinsic(market: &AmericanMarket, underlying: Price): u64 {
  let intrinsic = if (underlying.gt(market.strike)) {
    underlying.value() - market.strike.value()
  } else {
    0
  };
  if (intrinsic > market.payout_cap.value()) {
    market.payout_cap.value()
  } else {
    intrinsic
  }
}

/// A per-unit price applied to a `10^6`-scaled size, in USDC base units.
fun per_unit_amount(price: Price, size: Size): UsdcAmount {
  let value =
    (price.value() as u128) * (size.value() as u128)
      / (units::scaling::float_scaling() as u128);
  usdc_amount::usdc_from_u128(value)
}

fun witness(): American {
  American { private: true }
}

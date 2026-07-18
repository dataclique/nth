module nth::instrument_market;

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
use sui::event;
use sui::table::{Self, Table};
use units::price::Price;
use units::size::Size;

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

// === Structs ===

/// Generic matching and net-position state for one isolated instrument market.
/// An instrument package stores this value inside its own shared market object
/// alongside the collateral silo and instrument-specific lifecycle state.
public struct Market<phantom Instrument> has key, store {
  id: UID,
  version: u64,
  orderbook: OrderBook<Instrument>,
  positions: Table<ID, Position<Instrument>>,
  position_count: u64,
}

// === Events ===

/// Stable primitive envelope emitted when an instrument creates a market.
public struct MarketCreated<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  version: u64,
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
    orderbook: matching::empty(),
    positions: table::new(ctx),
    position_count: 0,
  }
}

/// Match a positive limit order after verifying that the sender owns
/// `margin_account`. `price` and `size` use the shared `10^6` scale.
///
/// Returns a non-droppable obligation that the instrument wrapper must settle
/// and complete in the same transaction.
public fun place_limit_order<Instrument>(
  market: &mut Market<Instrument>,
  margin_account: &MarginAccount,
  reservation_id: ID,
  _witness: &Instrument,
  side: Side,
  price: Price,
  size: Size,
  ctx: &TxContext,
): FillObligation<Instrument> {
  market.assert_version();
  assert!(
    margin::verify_owner(margin_account, ctx.sender()),
    EInvalidAccountOwner,
  );
  let market_id = object::id(market);
  matching::place_limit_order(
    &mut market.orderbook,
    market_id,
    object::id(margin_account),
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
  matching::cancel_order(
    &mut market.orderbook,
    market_id,
    object::id(margin_account),
    side,
    order_id,
  )
}

/// Apply both generic net-position transitions for the next fill and advance
/// the obligation exactly once. Instrument-specific collateral and lifecycle
/// logic can inspect `matching::next_fill` before calling this function.
///
/// Aborts when the obligation belongs to another market or has no next fill.
public fun settle_next<Instrument>(
  market: &mut Market<Instrument>,
  obligation: &mut FillObligation<Instrument>,
  _witness: &Instrument,
): Fill<Instrument> {
  market.assert_version();
  market.assert_obligation_market(obligation);
  let fill = obligation.next_fill();
  let maker_account_id = fill.maker_margin_account_id();
  let taker_account_id = fill.taker_margin_account_id();
  market.ensure_position(maker_account_id);
  market.ensure_position(taker_account_id);
  let market_id = object::id(market);

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

/// Consume a cancellation after the instrument wrapper releases the associated
/// reservation. Aborts when the cancellation belongs to another market.
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

// === Test-Only Functions ===

/// Populate one book side to its explicit bound without emitting order events.
#[test_only]
public fun fill_side_to_limit_for_testing<Instrument>(
  market: &mut Market<Instrument>,
  margin_account_id: ID,
  reservation_id: ID,
  side: Side,
) {
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

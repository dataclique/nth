/// Community-funded strategy vault on the composable instrument standard —
/// the fund/strategy-claim reference instrument and the community
/// market-making vault in one module.
///
/// Deposits issue NAV-priced share claims; redemptions burn them against
/// realizable assets. The vault treasury is the market object's own ID: no
/// `MarginAccount` can ever carry that ID, so there is no withdrawal path
/// for anyone — including the manager — and no public path can credit it
/// (donation-resistant pricing by construction). The first deposit locks
/// dead shares so a first depositor cannot inflate the share price against
/// later entrants.
///
/// Shares trade on the market's own book: buyers escrow the premium,
/// sellers list only what they hold (never a short share), and the premium
/// carries buyer → seller on every fill. The manager's authority is bounded
/// and non-custodial: it can quote policy-capped buyback bids from treasury
/// free collateral and cancel them — nothing else. Bought-back shares burn
/// immediately through the standard's forced-settlement transition,
/// accreting NAV per share for remaining holders. The deposit fee and every
/// policy bound are fixed at creation and disclosed in views and events.
module funds::vault;

use nth::collateral::ReservationId;
use nth::instrument_market::{Self, Market};
use nth::margin::MarginAccount;
use nth::matching::FillObligation;
use nth::order::{Self, OrderId, Side};
use sui::event;
use units::price::Price;
use units::size::{Self, Size};
use units::usdc_amount::{Self, UsdcAmount};

// === Constants ===

const EVENT_SCHEMA_VERSION: u16 = 1;

/// Shares locked forever by the first deposit — the first-depositor
/// (inflation-attack) defense.
const DEAD_SHARES: u64 = 1_000;

/// Basis-point denominator for the deposit fee.
const BPS_DENOMINATOR: u64 = 10_000;

// === Errors ===

#[error]
const EExcessiveFee: vector<u8> =
  b"deposit fee must be at most 10_000 basis points";

#[error]
const EZeroDeposit: vector<u8> = b"vault deposit must be positive";

#[error]
const EInitialDepositTooSmall: vector<u8> =
  b"the first deposit must exceed the locked dead shares";

#[error]
const EZeroShares: vector<u8> =
  b"deposit truncates to zero shares at the current NAV";

#[error]
const EZeroRedemption: vector<u8> = b"redemption size must be positive";

#[error]
const ESharesLockedOnBook: vector<u8> =
  b"shares resting as sell orders cannot be redeemed";

#[error]
const EOversoldShares: vector<u8> =
  b"sell orders cannot exceed the account's unlisted share holdings";

#[error]
const EWrongManagerCap: vector<u8> =
  b"manager capability belongs to a different vault";

#[error]
const EPolicyOrderTooLarge: vector<u8> =
  b"buyback notional exceeds the vault's per-order policy cap";

#[error]
const EPolicyTooManyOrders: vector<u8> =
  b"the vault's open-order policy bound is reached";

// === Structs ===

/// Type-level identity whose private field makes construction module-private.
public struct Vault has drop {
  private: bool,
}

/// Capability holding the vault's bounded manager authority.
public struct VaultManagerCap has key, store {
  id: UID,
}

/// One resting treasury buyback order, tracked so NAV can count its
/// unconsumed reservation.
public struct TrackedOrder has copy, drop, store {
  order_id: u64,
  reservation_id: ReservationId,
}

/// One community vault market: the generic kernel plus share supply, the
/// disclosed fee, and the manager policy.
public struct VaultMarket has key {
  id: UID,
  kernel: Market<Vault>,
  manager_cap_id: ID,
  manager_fee_account: ID,
  deposit_fee_bps: u64,
  max_order_notional: u64,
  max_open_orders: u64,
  total_shares: u64,
  resting_sales: sui::table::Table<ID, u64>,
  treasury_orders: vector<TrackedOrder>,
}

// === Events ===

/// Emitted once per vault creation, disclosing the fee and policy bounds.
public struct VaultCreated has copy, drop {
  schema_version: u16,
  market_id: ID,
  kernel_market_id: ID,
  manager_fee_account: ID,
  deposit_fee_bps: u64,
  max_order_notional: u64,
  max_open_orders: u64,
}

/// Emitted per deposit: `shares` minted to the investor at `nav_before`.
public struct VaultDeposited has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  amount: u64,
  fee: u64,
  shares: u64,
  nav_before: u64,
}

/// Emitted per redemption: `shares` burned for `value`.
public struct VaultRedeemed has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  shares: u64,
  value: u64,
}

/// Emitted when one fill's premium moves from share buyer to share seller.
public struct SharesTraded has copy, drop {
  schema_version: u16,
  market_id: ID,
  buyer_account_id: ID,
  seller_account_id: ID,
  premium: u64,
  size: u64,
}

/// Emitted when a treasury buyback burns shares, accreting NAV per share.
public struct SharesBurned has copy, drop {
  schema_version: u16,
  market_id: ID,
  size: u64,
  premium: u64,
}

// === Public Functions ===

/// Create a community vault with its manager capability. `deposit_fee_bps`
/// (at most 10_000) is carried to `manager_fee_account` on every deposit;
/// `max_order_notional` and `max_open_orders` bound the manager's buyback
/// quoting. All four are fixed here and disclosed forever.
public fun new(
  manager_fee_account: ID,
  deposit_fee_bps: u64,
  max_order_notional: UsdcAmount,
  max_open_orders: u64,
  ctx: &mut TxContext,
): (VaultMarket, VaultManagerCap) {
  assert!(deposit_fee_bps <= BPS_DENOMINATOR, EExcessiveFee);
  let witness = witness();
  let cap = VaultManagerCap { id: object::new(ctx) };
  let market = VaultMarket {
    id: object::new(ctx),
    kernel: instrument_market::new(&witness, ctx),
    manager_cap_id: object::id(&cap),
    manager_fee_account,
    deposit_fee_bps,
    max_order_notional: max_order_notional.value(),
    max_open_orders,
    total_shares: 0,
    resting_sales: sui::table::new(ctx),
    treasury_orders: vector[],
  };
  event::emit(VaultCreated {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(&market),
    kernel_market_id: instrument_market::id(&market.kernel),
    manager_fee_account,
    deposit_fee_bps,
    max_order_notional: max_order_notional.value(),
    max_open_orders,
  });
  (market, cap)
}

/// Share the vault object once open for deposits.
public fun share(market: VaultMarket) {
  transfer::share_object(market);
}

/// Move USDC base units from the sender-owned margin account into this
/// vault market's isolated free collateral.
public fun deposit_collateral(
  market: &mut VaultMarket,
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

/// Return USDC base units from this vault market's free collateral to the
/// sender-owned margin account.
public fun withdraw_collateral(
  market: &mut VaultMarket,
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

/// Deposit `amount` of the sender's free market collateral into the vault:
/// the disclosed fee carries to the manager's fee account, the remainder
/// moves into the treasury, and NAV-priced share claims are issued. The
/// first deposit locks `DEAD_SHARES` forever.
public fun deposit(
  market: &mut VaultMarket,
  margin_account: &MarginAccount,
  amount: UsdcAmount,
  ctx: &TxContext,
) {
  let witness = witness();
  assert!(amount.value() > 0, EZeroDeposit);
  let investor_id = object::id(margin_account);
  let fee = amount.value() * market.deposit_fee_bps / BPS_DENOMINATOR;
  let net = amount.value() - fee;
  assert!(net > 0, EZeroDeposit);
  let nav_before = market.nav().value();

  let investor_shares = if (market.total_shares == 0) {
    assert!(net > DEAD_SHARES, EInitialDepositTooSmall);
    market.total_shares = net;
    net - DEAD_SHARES
  } else {
    let shares = ((net as u128) * (market.total_shares as u128)
      / (nav_before as u128)) as u64;
    assert!(shares > 0, EZeroShares);
    market.total_shares = market.total_shares + shares;
    shares
  };

  instrument_market::issue_long_claim(
    &mut market.kernel,
    margin_account,
    usdc_amount::usdc(net),
    size::size(investor_shares),
    &witness,
    ctx,
  );
  let treasury = treasury_id(market);
  instrument_market::apply_carry(
    &mut market.kernel,
    investor_id,
    treasury,
    usdc_amount::usdc(net),
    0,
    true,
    false,
    &witness,
  );
  if (fee > 0) {
    instrument_market::apply_carry(
      &mut market.kernel,
      investor_id,
      market.manager_fee_account,
      usdc_amount::usdc(fee),
      0,
      false,
      false,
      &witness,
    );
  };
  event::emit(VaultDeposited {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    margin_account_id: investor_id,
    amount: amount.value(),
    fee,
    shares: investor_shares,
    nav_before,
  });
}

/// Redeem `shares` of the sender's claim at the current NAV, paid from
/// treasury free collateral (aborting while the treasury's liquid balance
/// is quoted away — retry after buyback orders cancel or fill). Shares
/// resting as sell orders cannot be redeemed.
public fun redeem(
  market: &mut VaultMarket,
  margin_account: &MarginAccount,
  shares: Size,
  ctx: &TxContext,
) {
  let witness = witness();
  assert!(shares.value() > 0, EZeroRedemption);
  let investor_id = object::id(margin_account);
  let holdings = instrument_market::position_size(
    &market.kernel,
    investor_id,
  );
  assert!(
    holdings.value() >= market.listed_sales(investor_id) + shares.value(),
    ESharesLockedOnBook,
  );
  let value = ((shares.value() as u128) * (market.nav().value() as u128)
    / (market.total_shares as u128)) as u64;

  let treasury = treasury_id(market);
  if (value > 0) {
    instrument_market::apply_carry(
      &mut market.kernel,
      treasury,
      investor_id,
      usdc_amount::usdc(value),
      0,
      false,
      true,
      &witness,
    );
  };
  instrument_market::redeem_long_claim(
    &mut market.kernel,
    margin_account,
    shares,
    usdc_amount::usdc(value),
    &witness,
    ctx,
  );
  market.total_shares = market.total_shares - shares.value();
  event::emit(VaultRedeemed {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    margin_account_id: investor_id,
    shares: shares.value(),
    value,
  });
}

/// Place a share limit order on the vault's own book. A bid escrows the
/// premium `price * size`; an ask escrows nothing but is capped at the
/// account's unlisted holdings, so a short share can never exist. Fills
/// settle atomically, carrying the premium from buyer to seller.
public fun place_limit_order(
  market: &mut VaultMarket,
  margin_account: &MarginAccount,
  side: Side,
  price: Price,
  size: Size,
  ctx: &TxContext,
) {
  let witness = witness();
  let account_id = object::id(margin_account);
  let reservation = side.match_side!(
    || per_unit_amount(price, size),
    || {
      let holdings = if (
        instrument_market::has_position(&market.kernel, account_id)
      ) {
        instrument_market::position_size(&market.kernel, account_id).value()
      } else {
        0
      };
      assert!(
        holdings >= market.listed_sales(account_id) + size.value(),
        EOversoldShares,
      );
      add_listed_sales(market, account_id, size.value());
      usdc_amount::usdc(0)
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

/// Remove the sender's own resting share order, releasing any premium
/// escrow and unlocking listed shares.
public fun cancel_order(
  market: &mut VaultMarket,
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
  side.match_side!(
    || (),
    || remove_listed_sales(
      market,
      object::id(margin_account),
      obligation.canceled_remaining_size().value(),
    ),
  );
  instrument_market::complete_cancel(&market.kernel, obligation, &witness);
}

/// Quote one policy-bounded buyback bid from treasury free collateral.
/// The premium notional must respect `max_order_notional`, and at most
/// `max_open_orders` treasury orders may rest. Crossing fills buy back and
/// burn shares immediately.
public fun place_buyback_bid(
  market: &mut VaultMarket,
  cap: &VaultManagerCap,
  price: Price,
  size: Size,
) {
  let witness = witness();
  assert!(object::id(cap) == market.manager_cap_id, EWrongManagerCap);
  let premium = per_unit_amount(price, size);
  assert!(
    premium.value() <= market.max_order_notional,
    EPolicyOrderTooLarge,
  );
  assert!(
    market.treasury_orders.length() < market.max_open_orders,
    EPolicyTooManyOrders,
  );
  let treasury = treasury_id(market);
  let mut obligation = instrument_market::place_instrument_order(
    &mut market.kernel,
    treasury,
    premium,
    &witness,
    order::bid(),
    price,
    size,
  );
  let order_id = obligation.order_id().value();
  let reservation_id = obligation.reservation_id();
  while (obligation.has_next_fill()) {
    settle_fill(market, &mut obligation, &witness);
  };
  if (!obligation.resting_size().is_zero()) {
    market.treasury_orders.push_back(TrackedOrder {
      order_id,
      reservation_id,
    });
  };
  instrument_market::complete(&market.kernel, obligation, &witness);
}

/// Cancel one resting treasury buyback bid, releasing its reservation back
/// to treasury free collateral.
public fun cancel_buyback_bid(
  market: &mut VaultMarket,
  cap: &VaultManagerCap,
  order_id: OrderId,
) {
  let witness = witness();
  assert!(object::id(cap) == market.manager_cap_id, EWrongManagerCap);
  let treasury = treasury_id(market);
  let obligation = instrument_market::cancel_instrument_order(
    &mut market.kernel,
    treasury,
    &witness,
    order::bid(),
    order_id,
  );
  untrack_treasury_order(market, order_id.value());
  instrument_market::complete_cancel(&market.kernel, obligation, &witness);
}

// === View Functions ===

/// The kernel market identity used in primitive kernel events.
public fun kernel_id(market: &VaultMarket): ID {
  instrument_market::id(&market.kernel)
}

/// The vault's net asset value: treasury free collateral, any treasury
/// position collateral, and the unconsumed reservations of resting buyback
/// bids. No public path can credit the treasury, so this cannot be
/// inflated by donation.
public fun nav(market: &VaultMarket): UsdcAmount {
  let treasury = treasury_id(market);
  let mut total = instrument_market::free_collateral(
    &market.kernel,
    treasury,
  ).value() + instrument_market::position_collateral(
    &market.kernel,
    treasury,
  ).value();
  let mut index = 0;
  while (index < market.treasury_orders.length()) {
    total = total + instrument_market::reserved_collateral(
      &market.kernel,
      market.treasury_orders[index].reservation_id,
    ).value();
    index = index + 1;
  };
  usdc_amount::usdc(total)
}

/// Outstanding shares, including the locked dead shares.
public fun total_shares(market: &VaultMarket): u64 {
  market.total_shares
}

/// The disclosed deposit fee in basis points.
public fun deposit_fee_bps(market: &VaultMarket): u64 {
  market.deposit_fee_bps
}

/// The disclosed per-order buyback notional cap in USDC base units.
public fun max_order_notional(market: &VaultMarket): u64 {
  market.max_order_notional
}

/// The disclosed bound on concurrently resting treasury orders.
public fun max_open_orders(market: &VaultMarket): u64 {
  market.max_open_orders
}

/// Currently resting treasury buyback orders.
public fun open_treasury_orders(market: &VaultMarket): u64 {
  market.treasury_orders.length()
}

/// Shares the account currently lists as resting sell orders.
public fun listed_sales(market: &VaultMarket, margin_account_id: ID): u64 {
  if (market.resting_sales.contains(margin_account_id)) {
    market.resting_sales[margin_account_id]
  } else {
    0
  }
}

/// The account's share claim size, `0` without a position.
public fun share_balance(
  market: &VaultMarket,
  margin_account_id: ID,
): u64 {
  if (instrument_market::has_position(&market.kernel, margin_account_id)) {
    instrument_market::position_size(&market.kernel, margin_account_id)
      .value()
  } else {
    0
  }
}

/// Free USDC base units available to the account in this market.
public fun free_collateral(
  market: &VaultMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::free_collateral(&market.kernel, margin_account_id)
}

/// Total USDC base units isolated inside this market.
public fun total_collateral(market: &VaultMarket): UsdcAmount {
  instrument_market::total_collateral(&market.kernel)
}

/// Number of resting bids.
public fun bid_count(market: &VaultMarket): u64 {
  instrument_market::bid_count(&market.kernel)
}

/// Number of resting asks.
public fun ask_count(market: &VaultMarket): u64 {
  instrument_market::ask_count(&market.kernel)
}

// === Private Functions ===

/// The treasury account key: the vault market's own object ID. No
/// `MarginAccount` can carry this ID, so no withdrawal path exists.
fun treasury_id(market: &VaultMarket): ID {
  object::id(market)
}

/// Settle one matched share fill: the buyer's premium escrow is consumed
/// and carried to the seller; a treasury buyback burns the bought shares
/// immediately through the forced-settlement transition.
fun settle_fill(
  market: &mut VaultMarket,
  obligation: &mut FillObligation<Vault>,
  witness: &Vault,
) {
  let fill = obligation.next_fill();
  let premium = per_unit_amount(fill.price(), fill.size());
  let (maker_collateral, taker_collateral) = fill.maker_side().match_side!(
    || (premium, usdc_amount::usdc(0)),
    || (usdc_amount::usdc(0), premium),
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
  remove_listed_sales(market, seller_id, fill.size().value());
  if (buyer_id == treasury_id(market)) {
    instrument_market::force_reduce_position(
      &mut market.kernel,
      buyer_id,
      fill.size(),
      usdc_amount::usdc(0),
      witness,
    );
    market.total_shares = market.total_shares - fill.size().value();
    if (fill.maker_fully_filled() &&
        fill.maker_margin_account_id() == buyer_id) {
      untrack_treasury_order(market, fill.maker_order_id().value());
    };
    event::emit(SharesBurned {
      schema_version: EVENT_SCHEMA_VERSION,
      market_id: object::id(market),
      size: fill.size().value(),
      premium: premium.value(),
    });
  };
  event::emit(SharesTraded {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id: object::id(market),
    buyer_account_id: buyer_id,
    seller_account_id: seller_id,
    premium: premium.value(),
    size: fill.size().value(),
  });
}

fun add_listed_sales(
  market: &mut VaultMarket,
  margin_account_id: ID,
  amount: u64,
) {
  if (!market.resting_sales.contains(margin_account_id)) {
    market.resting_sales.add(margin_account_id, 0);
  };
  let listed = &mut market.resting_sales[margin_account_id];
  *listed = *listed + amount;
}

fun remove_listed_sales(
  market: &mut VaultMarket,
  margin_account_id: ID,
  amount: u64,
) {
  if (market.resting_sales.contains(margin_account_id)) {
    let listed = &mut market.resting_sales[margin_account_id];
    *listed = *listed - amount;
  };
}

fun untrack_treasury_order(market: &mut VaultMarket, order_id: u64) {
  let mut index = 0;
  while (index < market.treasury_orders.length()) {
    if (market.treasury_orders[index].order_id == order_id) {
      market.treasury_orders.swap_remove(index);
      return
    };
    index = index + 1;
  };
}

/// A per-unit price applied to a `10^6`-scaled size, in USDC base units.
fun per_unit_amount(price: Price, size: Size): UsdcAmount {
  let value =
    (price.value() as u128) * (size.value() as u128)
      / (units::scaling::float_scaling() as u128);
  usdc_amount::usdc_from_u128(value)
}

fun witness(): Vault {
  Vault { private: true }
}

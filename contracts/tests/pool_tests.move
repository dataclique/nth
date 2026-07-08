#[test_only]
module strike::pool_tests;

use strike::order;
use strike::orderbook;
use strike::pool::{Self, Pool, PriceCap};
use strike::strike::{Self, MarginAccount};
use strike::units::{Self, Price, Size, Leverage};
use sui::coin::mint_for_testing;
use sui::test_scenario::{
  begin,
  end,
  next_tx,
  return_shared,
  take_from_address,
  take_shared,
  Scenario,
};
use usdc::usdc::USDC;

// Creating setup: Alice with 1000 USDC + Bob with 1000 USDC
// And pool with default token price 100 USDC
// and maintenance margin percentage 25%
const ALICE: address = @0xA;
const BOB: address = @0xB;

fun px(value: u64): Price { units::price(value*units::float_scaling()) }

fun sz(value: u64): Size { units::size(value*units::float_scaling()) }

fun lev(value: u64): Leverage {
  units::leverage(value*units::float_scaling())
}

fun usdc_of(value: u64): u64 { value*units::float_scaling() }

fun setup(test: &mut Scenario) {
  next_tx(test, ALICE);
  {
    // pool::new shares the Pool and returns its PriceCap.
    let price_cap = pool::new(
      pool::default_maintenance_margin_rate(),
      px(100),
      test.ctx(),
    );
    let alice_usdc = mint_for_testing<USDC>(usdc_of(1000), test.ctx());
    let alice_margin = strike::new_with_deposit(alice_usdc, test.ctx());

    transfer::public_transfer(price_cap, ALICE);
    alice_margin.keep(test.ctx());
  };

  next_tx(test, BOB);
  {
    let bob_usdc = mint_for_testing<USDC>(usdc_of(1000), test.ctx());
    let bob_margin = strike::new_with_deposit(bob_usdc, test.ctx());
    bob_margin.keep(test.ctx());
  };
}

// === close_position two-layer authorization ===

// close_position checks the sender against the margin account FIRST
// (pool::EInvalidAccountOwner), and only then scans the book for an order
// matching (id, account) (orderbook::EOrderNotFound). The next two tests
// pin that ordering: same attack — Bob going after Alice's resting order —
// aborts with a different code depending on which account object he
// presents.

#[test, expected_failure(abort_code = pool::EInvalidAccountOwner)]
fun test_close_position_with_foreign_account_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  let bid_id = {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    let bid_id = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    return_shared(pool);
    margin_account.keep(test.ctx());
    bid_id
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_shared<Pool>(&test);
    // Bob presents ALICE's margin account: the owner check fires before
    // the book is ever scanned.
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      bid_id,
      test.ctx(),
    );

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = orderbook::EOrderNotFound)]
fun test_close_position_by_non_owner_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  let bid_id = {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    let bid_id = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    return_shared(pool);
    margin_account.keep(test.ctx());
    bid_id
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_shared<Pool>(&test);
    // Bob presents HIS OWN account: the owner check passes, so the
    // failure falls through to the book scan, which requires BOTH the id
    // and the account to match.
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      bid_id,
      test.ctx(),
    );

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Margin conservation ===

#[test]
fun test_close_position_returns_margin_to_account_exactly() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    assert!(margin_account.balance() == usdc_of(1000), 1);
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == 0, 2);

    // 95*5/4 = 118.75 USDC margin: a non-round amount so an off-by-one
    // in either direction of the round trip would show.
    let bid_id = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(5),
      lev(4),
      test.ctx(),
    );

    let margin = usdc_of(118) + usdc_of(75)/100;
    assert!(margin_account.balance() == usdc_of(1000) - margin, 3);
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == margin, 4);

    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      bid_id,
      test.ctx(),
    );

    // Conservation: account and vault return to exactly the pre-place
    // values, not a scaled or truncated approximation.
    assert!(margin_account.balance() == usdc_of(1000), 5);
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == 0, 6);

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_vault_conserves_value_across_mixed_flow() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // 95*5/4 = 118.75 margin; at max leverage the liquidation price is
    // the entry price, 95.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(5),
      lev(4),
      test.ctx(),
    );

    // 90*2/2 = 90 margin; buffer (90-45)/2 = 22.5, liquidation at 67.5,
    // safely below the coming price move.
    let bid_90 = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(90),
      sz(2),
      lev(2),
      test.ctx(),
    );

    let liquidated_margin = usdc_of(118) + usdc_of(75)/100;
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == liquidated_margin + usdc_of(90), 1);

    // Cancel the 90 bid: its margin leaves the vault.
    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      bid_90,
      test.ctx(),
    );

    // Drop to 80: liquidates the 4x bid at 95 (95 - 0 >= 80).
    pool::set_token_price(&mut pool, px(80), test.ctx());
    pool::check_liquidations(&mut pool);

    let orderbook = pool::borrow_orderbook(&pool);
    assert!(orderbook::bids_length(orderbook) == 0, 2);

    // Pool-level conservation: the cancelled margin was refunded, the
    // liquidated margin was retained — the vault holds exactly the
    // liquidated order's margin.
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == liquidated_margin, 3);
    assert!(
      margin_account.balance() == usdc_of(1000) - liquidated_margin,
      4,
    );

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_liquidated_order_margin_stays_in_vault() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // 95*5/4 = 118.75 margin, liquidation price 95 (max leverage).
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(5),
      lev(4),
      test.ctx(),
    );

    let margin = usdc_of(118) + usdc_of(75)/100;
    let account_after_place = margin_account.balance();
    assert!(account_after_place == usdc_of(1000) - margin, 1);

    pool::set_token_price(&mut pool, px(80), test.ctx());
    pool::check_liquidations(&mut pool);

    let orderbook = pool::borrow_orderbook(&pool);
    assert!(orderbook::bids_length(orderbook) == 0, 2);

    // Liquidation forfeits the margin: the vault keeps it and the
    // account receives nothing back.
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == margin, 3);
    assert!(margin_account.balance() == account_after_place, 4);

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_place_order_charges_exact_margin() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // 95*5/4 = 118.75 USDC: fractional in whole USDC but exact in base
    // units — 118_750_000 with 10^6 scaling.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(5),
      lev(4),
      test.ctx(),
    );

    let margin_bid = 118_750_000;
    assert!(margin_account.balance() == usdc_of(1000) - margin_bid, 1);
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == margin_bid, 2);

    // 110*1/3 = 36.666... USDC: not exact in base units, so the u128
    // division must truncate to exactly 36_666_666.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(110),
      sz(1),
      lev(3),
      test.ctx(),
    );

    let margin_ask = 36_666_666;
    assert!(
      margin_account.balance() == usdc_of(1000) - margin_bid - margin_ask,
      3,
    );
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == margin_bid + margin_ask, 4);

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_partial_fill_then_rest_conserves_margin() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Resting bid: 100 x 10 at 2x, margin 500.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(10),
      lev(2),
      test.ctx(),
    );

    return_shared(pool);
    margin_account.keep(test.ctx());
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    // Ask at 95 x 15 at 3x (margin 95*15/3 = 475): 10 fill against
    // Alice's bid at 100 and the remaining 5 rest at 95. The FULL
    // margin is charged up front and retained across the partial fill.
    let ask_id = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(95),
      sz(15),
      lev(3),
      test.ctx(),
    );

    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == usdc_of(500 + 475), 1);
    assert!(margin_account.balance() == usdc_of(1000 - 475), 2);

    // Closing the resting remainder refunds only the unfilled part:
    // 5*95/3 = 158.333... USDC, truncated to 158_333_333 base units.
    // The filled 10's margin stays locked — conservation across
    // partial-fill, rest, then cancel.
    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::ask(),
      ask_id,
      test.ctx(),
    );

    let refund = 158_333_333;
    assert!(margin_account.balance() == usdc_of(525) + refund, 3);
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == usdc_of(975) - refund, 4);

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Liquidation sweep ===

#[test]
fun test_check_liquidations_on_empty_book_is_noop() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);

    // A sweep over a book with no resting orders must complete without
    // aborting and leave both sides empty.
    pool::check_liquidations(&mut pool);

    let orderbook = pool::borrow_orderbook(&pool);
    assert!(orderbook::bids_length(orderbook) == 0, 1);
    assert!(orderbook::asks_length(orderbook) == 0, 2);

    return_shared(pool);
  };
  end(test);
}

#[test]
fun test_check_liquidations_removes_multiple_bids_and_asks_in_one_sweep() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Three max-leverage positions: liquidation price equals entry for
    // each. Two longs at different entries, one short above them.
    // 100*1/4 = 25 margin, long liquidates at 100
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(1),
      lev(4),
      test.ctx(),
    );

    // 95*2/4 = 47.5 margin, long liquidates at 95
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(2),
      lev(4),
      test.ctx(),
    );

    // 110*1/4 = 27.5 margin, short liquidates at 110
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(110),
      sz(1),
      lev(4),
      test.ctx(),
    );

    // Round 1 — crash to 50: BOTH longs are past their liquidation
    // prices (100 and 95), so one sweep must remove more than one order
    // (the loop-until-none behavior). The short at 110 survives a crash.
    pool::set_token_price(&mut pool, px(50), test.ctx());
    pool::check_liquidations(&mut pool);

    let orderbook = pool::borrow_orderbook(&pool);
    assert!(orderbook::bids_length(orderbook) == 0, 1);
    assert!(orderbook::asks_length(orderbook) == 1, 2);

    // Round 2 — spike to 120: the short at 110 liquidates.
    pool::set_token_price(&mut pool, px(120), test.ctx());
    pool::check_liquidations(&mut pool);

    let orderbook = pool::borrow_orderbook(&pool);
    assert!(orderbook::bids_length(orderbook) == 0, 3);
    assert!(orderbook::asks_length(orderbook) == 0, 4);

    // All three margins (25 + 47.5 + 27.5 = 100) stay in the vault.
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == usdc_of(100), 5);

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Pool construction ===

#[test]
fun test_pool_new_seeds_oracle_with_initial_price() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // The pool was created with initial price 100. A max-leverage long
    // AT 100 has a zero buffer, so its liquidation price is exactly the
    // current oracle price.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(1),
      lev(4),
      test.ctx(),
    );

    // No set_token_price: the sweep runs against whatever `pool::new`
    // seeded the oracle with. Liquidation here proves the initial price
    // actually reached the oracle (100 - 0 >= 100).
    pool::check_liquidations(&mut pool);

    let orderbook = pool::borrow_orderbook(&pool);
    assert!(orderbook::bids_length(orderbook) == 0, 1);
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == usdc_of(25), 2);

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInvalidMaintenanceMarginRate)]
fun test_zero_maintenance_rate_aborts() {
  let mut test = begin(@0xF);

  next_tx(&mut test, ALICE);
  {
    // A 0% maintenance rate would divide by zero in risk::max_leverage.
    // The transfer below is unreachable but consumes the PriceCap
    // syntactically, mirroring the other abort-path tests.
    let cap = pool::new(0, px(100), test.ctx());
    transfer::public_transfer(cap, ALICE);
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInvalidMaintenanceMarginRate)]
fun test_maintenance_rate_above_100_aborts() {
  let mut test = begin(@0xF);

  next_tx(&mut test, ALICE);
  {
    // Above 100% no leverage satisfies the margin requirement.
    let cap = pool::new(101, px(100), test.ctx());
    transfer::public_transfer(cap, ALICE);
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInvalidPrice)]
fun test_zero_price_pool_aborts() {
  let mut test = begin(@0xF);

  next_tx(&mut test, ALICE);
  {
    // A zero initial price would make every liquidation check
    // meaningless before the first oracle update.
    let cap = pool::new(25, units::price(0), test.ctx());
    transfer::public_transfer(cap, ALICE);
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInvalidPrice)]
fun test_update_price_to_zero_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let cap = take_from_address<PriceCap>(&test, ALICE);

    // Even the PriceCap holder cannot zero the oracle: a zero price
    // would make every liquidation check meaningless.
    pool::update_price(&mut pool, &cap, units::price(0), test.ctx());

    // Unreachable, but the objects must be consumed syntactically.
    return_shared(pool);
    transfer::public_transfer(cap, ALICE);
  };
  end(test);
}

#[test]
fun test_update_price_via_price_cap() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);
    let cap = take_from_address<PriceCap>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(5),
      lev(4),
      test.ctx(),
    );

    pool::update_price(&mut pool, &cap, px(80), test.ctx());
    pool::check_liquidations(&mut pool);

    let orderbook = pool::borrow_orderbook(&pool);
    assert!(orderbook::bids_length(orderbook) == 0, 1);

    return_shared(pool);
    transfer::public_transfer(cap, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EWrongPool)]
fun test_update_price_with_foreign_cap_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, BOB);
  {
    let cap_b = pool::new(
      pool::default_maintenance_margin_rate(),
      px(100),
      test.ctx(),
    );

    let mut pool_a = take_shared<Pool>(&test);
    pool::update_price(&mut pool_a, &cap_b, px(50), test.ctx());

    return_shared(pool_a);
    transfer::public_transfer(cap_b, BOB);
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInvalidLeverage)]
fun test_zero_leverage_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(10),
      units::leverage(0),
      test.ctx(),
    );

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInvalidLeverage)]
fun test_leverage_above_max_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(10),
      lev(5),
      test.ctx(),
    );

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Margin rounding ===

/// A 1-base-unit price times a 1-base-unit size at 1x leverage yields a
/// margin of 1*1/1_000_000, which truncates to zero — the order must
/// abort with `EZeroMargin` instead of resting with no collateral.
#[test, expected_failure(abort_code = pool::EZeroMargin)]
fun test_dust_notional_aborts_with_zero_margin() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      units::price(1),
      units::size(1),
      lev(1),
      test.ctx(),
    );

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Settlement gap ===

/// Pins the known settlement gap: a taker that fully fills and never
/// rests gets NO margin refund — both the maker's and the taker's margin
/// stay locked in the vault until a position ledger exists to settle
/// fills against.
#[test]
fun test_fully_filled_taker_margin_stays_in_vault() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Resting bid: 100 x 4 at 2x, margin 200.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(4),
      lev(2),
      test.ctx(),
    );

    return_shared(pool);
    margin_account.keep(test.ctx());
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    // Ask at 95 x 4 at 2x (margin 190) crosses the bid at 100 and fully
    // fills: the maker is consumed and the taker never rests.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(95),
      sz(4),
      lev(2),
      test.ctx(),
    );

    let orderbook = pool::borrow_orderbook(&pool);
    assert!(orderbook::bids_length(orderbook) == 0, 1);
    assert!(orderbook::asks_length(orderbook) == 0, 2);

    // BOTH margins are retained by the vault — no settlement yet.
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == usdc_of(200 + 190), 3);
    assert!(margin_account.balance() == usdc_of(1000 - 190), 4);

    return_shared(pool);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Funding ===

// One hour in epoch milliseconds — the minimum gap between funding rounds.
const FUNDING_INTERVAL_MS: u64 = 3_600_000;

#[test]
fun test_update_funding_moves_margin_from_longs_to_shorts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  // Alice rests a bid at 99, Bob an ask at 103 — they do not cross, so
  // both rest. Mid = 101 against the oracle's 100: a +1% divergence caps
  // at 100 bps and longs (bids) pay.
  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);
    pool::place_leveraged_order(
      &mut pool, &mut margin_account, order::bid(),
      px(99), sz(4), lev(2), test.ctx(),
    );
    return_shared(pool);
    margin_account.keep(test.ctx());
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);
    pool::place_leveraged_order(
      &mut pool, &mut margin_account, order::ask(),
      px(103), sz(4), lev(2), test.ctx(),
    );
    return_shared(pool);
    margin_account.keep(test.ctx());
  };

  // Advance past the funding interval; funding is permissionless.
  test.later_epoch(FUNDING_INTERVAL_MS, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    pool::update_funding(&mut pool, test.ctx());

    // Payment = notional (99*4 = 396) * 100 bps = 3.96 USDC.
    // Bid margin 99*4/2 = 198 → 198 - 3.96; ask margin 103*4/2 = 206 → +3.96.
    let orderbook = pool::borrow_orderbook(&pool);
    let bid = orderbook::bid_at(orderbook, 0);
    let ask = orderbook::ask_at(orderbook, 0);
    assert!(bid.margin().value() == usdc_of(198) - usdc_of(396)/100, 0);
    assert!(ask.margin().value() == usdc_of(206) + usdc_of(396)/100, 1);

    // Margin only moved between orders — the vault total is unchanged.
    let vault = pool::borrow_vault(&pool);
    assert!(vault.balance() == usdc_of(198 + 206), 2);
    return_shared(pool);
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EFundingTooSoon)]
fun test_update_funding_before_interval_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  // last_funding_time starts at 0 and the clock starts at 0, so a first
  // round before the interval elapses is too soon.
  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    pool::update_funding(&mut pool, test.ctx());
    return_shared(pool);
  };
  end(test);
}

#[test]
fun test_update_funding_with_one_empty_side_is_noop() {
  let mut test = begin(@0xF);
  setup(&mut test);

  // Only a bid rests; with no ask there is no counterparty, so funding
  // stamps the clock without moving margin.
  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);
    pool::place_leveraged_order(
      &mut pool, &mut margin_account, order::bid(),
      px(99), sz(4), lev(2), test.ctx(),
    );
    return_shared(pool);
    margin_account.keep(test.ctx());
  };

  test.later_epoch(FUNDING_INTERVAL_MS, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    pool::update_funding(&mut pool, test.ctx());

    let orderbook = pool::borrow_orderbook(&pool);
    let bid = orderbook::bid_at(orderbook, 0);
    assert!(bid.margin().value() == usdc_of(198), 0);
    return_shared(pool);
  };
  end(test);
}

#[test]
fun test_second_funding_round_requires_another_interval() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);
    pool::place_leveraged_order(
      &mut pool, &mut margin_account, order::bid(),
      px(99), sz(4), lev(2), test.ctx(),
    );
    return_shared(pool);
    margin_account.keep(test.ctx());
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_shared<Pool>(&test);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);
    pool::place_leveraged_order(
      &mut pool, &mut margin_account, order::ask(),
      px(103), sz(4), lev(2), test.ctx(),
    );
    return_shared(pool);
    margin_account.keep(test.ctx());
  };

  // Two rounds one interval apart both succeed; each stamps the clock.
  test.later_epoch(FUNDING_INTERVAL_MS, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    pool::update_funding(&mut pool, test.ctx());
    return_shared(pool);
  };
  test.later_epoch(FUNDING_INTERVAL_MS, ALICE);
  {
    let mut pool = take_shared<Pool>(&test);
    pool::update_funding(&mut pool, test.ctx());

    // Two rounds of 3.96 USDC each moved off the bid.
    let orderbook = pool::borrow_orderbook(&pool);
    let bid = orderbook::bid_at(orderbook, 0);
    assert!(bid.margin().value() == usdc_of(198) - 2*usdc_of(396)/100, 0);
    return_shared(pool);
  };
  end(test);
}

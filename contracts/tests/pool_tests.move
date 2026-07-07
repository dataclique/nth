#[test_only]
module strike::pool_tests;

use strike::constants;
use strike::order;
use strike::orderbook;
use strike::pool::{Self, Pool};
use strike::strike::{Self, MarginAccount};
use strike::units::{Self, Price, Size, Leverage};
use sui::coin::mint_for_testing;
use sui::test_scenario::{begin, end, next_tx, take_from_address, Scenario};
use usdc::usdc::USDC;

// Creating setup: Alice with 1000 USDC + Bob with 1000 USDC
// And pool with default token price 100 USDC
// and maintenance margin percentage 25%
const ALICE: address = @0xA;
const BOB: address = @0xB;

fun px(value: u64): Price { units::price(value*constants::float_scaling()) }

fun sz(value: u64): Size { units::size(value*constants::float_scaling()) }

fun lev(value: u64): Leverage {
  units::leverage(value*constants::float_scaling())
}

fun usdc_of(value: u64): u64 { value*constants::float_scaling() }

fun setup(test: &mut Scenario) {
  next_tx(test, ALICE);
  {
    let pool = pool::new(
      constants::default_maintance_margin_rate(),
      px(100),
      test.ctx(),
    );
    let alice_usdc = mint_for_testing<USDC>(usdc_of(1000), test.ctx());
    let alice_margin = strike::new_with_deposit(alice_usdc, test.ctx());

    transfer::public_transfer(pool, ALICE);
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
    let mut pool = take_from_address<Pool>(&test, ALICE);
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

    transfer::public_transfer(pool, BOB);
    margin_account.keep(test.ctx());
    bid_id
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, BOB);
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

    transfer::public_transfer(pool, ALICE);
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
    let mut pool = take_from_address<Pool>(&test, ALICE);
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

    transfer::public_transfer(pool, BOB);
    margin_account.keep(test.ctx());
    bid_id
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, BOB);
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

    transfer::public_transfer(pool, ALICE);
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
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    assert!(margin_account.balance() == usdc_of(1000), 1);
    let vault = pool::get_vault(&pool);
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
    let vault = pool::get_vault(&pool);
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
    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == 0, 6);

    transfer::public_transfer(pool, ALICE);
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
    let mut pool = take_from_address<Pool>(&test, ALICE);
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
    let vault = pool::get_vault(&pool);
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

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 2);

    // Pool-level conservation: the cancelled margin was refunded, the
    // liquidated margin was retained — the vault holds exactly the
    // liquidated order's margin.
    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == liquidated_margin, 3);
    assert!(
      margin_account.balance() == usdc_of(1000) - liquidated_margin,
      4,
    );

    transfer::public_transfer(pool, ALICE);
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
    let mut pool = take_from_address<Pool>(&test, ALICE);
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

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 2);

    // Liquidation forfeits the margin: the vault keeps it and the
    // account receives nothing back.
    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == margin, 3);
    assert!(margin_account.balance() == account_after_place, 4);

    transfer::public_transfer(pool, ALICE);
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
    let mut pool = take_from_address<Pool>(&test, ALICE);
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
    let vault = pool::get_vault(&pool);
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
    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == margin_bid + margin_ask, 4);

    transfer::public_transfer(pool, ALICE);
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
    let mut pool = take_from_address<Pool>(&test, ALICE);

    // A sweep over a book with no resting orders must complete without
    // aborting and leave both sides empty.
    pool::check_liquidations(&mut pool);

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 1);
    assert!(orderbook::get_asks_length(orderbook) == 0, 2);

    transfer::public_transfer(pool, ALICE);
  };
  end(test);
}

#[test]
fun test_check_liquidations_removes_multiple_bids_and_asks_in_one_sweep() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
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

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 1);
    assert!(orderbook::get_asks_length(orderbook) == 1, 2);

    // Round 2 — spike to 120: the short at 110 liquidates.
    pool::set_token_price(&mut pool, px(120), test.ctx());
    pool::check_liquidations(&mut pool);

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 3);
    assert!(orderbook::get_asks_length(orderbook) == 0, 4);

    // All three margins (25 + 47.5 + 27.5 = 100) stay in the vault.
    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == usdc_of(100), 5);

    transfer::public_transfer(pool, ALICE);
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
    let mut pool = take_from_address<Pool>(&test, ALICE);
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

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 1);
    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == usdc_of(25), 2);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

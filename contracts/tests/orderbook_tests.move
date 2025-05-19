#[test_only]
module strike::orderbook_tests;

use strike::constants;
use strike::order;
use strike::orderbook;
use strike::pool::{Self, Pool};
use strike::strike::{Self, MarginAccount};
use sui::coin::mint_for_testing;
use sui::test_scenario::{begin, end, next_tx, take_from_address, Scenario};
use usdc::usdc::USDC;

// Cteating setup: Alice with 1000 USDC + Bob with 1000 USDC
// And pool with default token price 100 USDC
// and maintenance margin percentage 25%
const ALICE: address = @0xA;
const BOB: address = @0xB;

fun setup(test: &mut Scenario) {
  next_tx(test, ALICE);
  {
    let pool = pool::new(
      constants::default_maintance_margin_rate(),
      100*constants::float_scaling(),
      test.ctx(),
    );
    let alice_usdc = mint_for_testing<USDC>(
      1000*constants::float_scaling(),
      test.ctx(),
    );
    let alice_margin = strike::new_with_deposit(alice_usdc, test.ctx());

    transfer::public_transfer(pool, ALICE);
    transfer::public_transfer(alice_margin, ALICE);
  };

  next_tx(test, BOB);
  {
    let bob_usdc = mint_for_testing<USDC>(
      1000*constants::float_scaling(),
      test.ctx(),
    );
    let bob_margin = strike::new_with_deposit(bob_usdc, test.ctx());
    transfer::public_transfer(bob_margin, BOB);
  };
}

#[test]
fun test_place_bid_order() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      true,
      100*constants::float_scaling(),
      10*constants::float_scaling(),
      2*constants::float_scaling(),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 1, 1);
    let order = orderbook::get_bid(orderbook, 0);
    assert!(order::is_bid(order), 2);
    assert!(order::price(order) == 100*constants::float_scaling(), 3);
    assert!(order::size(order) == 10*constants::float_scaling(), 4);

    assert!(margin_account.balance() == 500*constants::float_scaling(), 5);

    transfer::public_transfer(pool, ALICE);
    transfer::public_transfer(margin_account, ALICE);
  };
  end(test);
}

#[test]
fun test_place_ask_order() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      false,
      100*constants::float_scaling(),
      10*constants::float_scaling(),
      4*constants::float_scaling(),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 1);
    assert!(orderbook::get_asks_length(orderbook) == 1, 2);
    let order = orderbook::get_ask(orderbook, 0);
    assert!(!order::is_bid(order), 3);
    assert!(order::price(order) == 100*constants::float_scaling(), 4);
    assert!(order::size(order) == 10*constants::float_scaling(), 5);

    assert!(margin_account.balance() == 750*constants::float_scaling(), 6);

    transfer::public_transfer(pool, ALICE);
    transfer::public_transfer(margin_account, ALICE);
  };
  end(test);
}

#[test]
fun test_place_and_cancel_orders() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      true,
      100*constants::float_scaling(),
      10*constants::float_scaling(),
      2*constants::float_scaling(),
      test.ctx(),
    );

    transfer::public_transfer(pool, BOB);
    transfer::public_transfer(margin_account, ALICE);
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, BOB);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      false,
      90*constants::float_scaling(),
      5*constants::float_scaling(),
      2*constants::float_scaling(),
      test.ctx(),
    );

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      false,
      100*constants::float_scaling(),
      2*constants::float_scaling(),
      1*constants::float_scaling(),
      test.ctx(),
    );

    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == 925*constants::float_scaling(), 1);

    pool::close_position(
      &mut pool,
      &mut margin_account,
      90*constants::float_scaling(),
      false,
      test.ctx(),
    );

    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == 700*constants::float_scaling(), 2);

    assert!(margin_account.balance() == 800*constants::float_scaling(), 3);

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_asks_length(orderbook) == 1, 4);
    assert!(orderbook::get_bids_length(orderbook) == 1, 5);

    transfer::public_transfer(pool, ALICE);
    transfer::public_transfer(margin_account, BOB);
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInsufficientBalance)]
fun test_insufficient_balance() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Try to place order with too high leverage
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      true,
      1000*constants::float_scaling(),
      100*constants::float_scaling(),
      1*constants::float_scaling(),
      test.ctx(),
    );

    transfer::public_transfer(pool, ALICE);
    transfer::public_transfer(margin_account, ALICE);
  };
  end(test);
}

#[test]
fun test_liquidations() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // 100*2/2 = 100 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      true,
      100*constants::float_scaling(),
      2*constants::float_scaling(),
      2*constants::float_scaling(),
      test.ctx(),
    );

    // 95*5/4 = 118.75 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      true,
      95*constants::float_scaling(),
      5*constants::float_scaling(),
      4*constants::float_scaling(),
      test.ctx(),
    );
    // std::debug::print(&margin_account.balance());

    // 90*8/2 = 360 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      true,
      90*constants::float_scaling(),
      8*constants::float_scaling(),
      2*constants::float_scaling(),
      test.ctx(),
    );

    // 105*7/5 = 147 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      false,
      105*constants::float_scaling(),
      7*constants::float_scaling(),
      5*constants::float_scaling(),
      test.ctx(),
    );

    // 110*6/3 = 220 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      false,
      110*constants::float_scaling(),
      6*constants::float_scaling(),
      3*constants::float_scaling(),
      test.ctx(),
    );
    // In total we need 100 + 118.75 + 360 + 147 + 220 = 945.75 margin

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 3, 1);
    assert!(orderbook::get_asks_length(orderbook) == 2, 2);
    // 25*constants::float_scaling()/100 = 0.25 USDC
    assert!(
      margin_account.balance() == 54*constants::float_scaling() + 25*constants::float_scaling()/100,
      3,
    );

    // Drop price of token from 100 to 80
    pool::set_token_price(&mut pool, 80*constants::float_scaling());
    pool::check_liquidations(&mut pool);

    // Only bid order with price 95 and size 5 should be liquidated
    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 2, 4);
    assert!(orderbook::get_asks_length(orderbook) == 2, 5); // All asks remain

    let remaining_bid = orderbook::get_bid(orderbook, 0);
    assert!(order::price(remaining_bid) == 100*constants::float_scaling(), 6);

    let remaining_bid = orderbook::get_bid(orderbook, 1);
    assert!(order::price(remaining_bid) == 90*constants::float_scaling(), 7);

    // Let's close all bids positions
    pool::close_position(
      &mut pool,
      &mut margin_account,
      100*constants::float_scaling(),
      true,
      test.ctx(),
    );

    pool::close_position(
      &mut pool,
      &mut margin_account,
      90*constants::float_scaling(),
      true,
      test.ctx(),
    );

    // Check vault balance - should contain all the margin from liquidated
    // positions + asks orders
    let vault = pool::get_vault(&pool);
    // 75*constants::float_scaling()/100 = 0.75 USDC
    assert!(
      vault.balance() == (118 + 147 + 220)*constants::float_scaling() + 75*constants::float_scaling()/100,
      8,
    );

    transfer::public_transfer(pool, ALICE);
    transfer::public_transfer(margin_account, ALICE);
  };
  end(test);
}

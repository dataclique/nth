#[test_only]
module strike::orderbook_tests;

use strike::order;
use strike::orderbook;
use strike::pool::{Self, Pool};
use strike::strike::{Self, MarginAccount};
use sui::coin::mint_for_testing;
use sui::test_scenario::{begin, end, next_tx, take_from_address, Scenario};
use usdc::usdc::USDC;

// Cteating setup: pool + Alice with 1000 USDC + Bob with 1000 USDC
const ALICE: address = @0xA;
const BOB: address = @0xB;

fun setup(test: &mut Scenario) {
  next_tx(test, ALICE);
  {
    let pool = pool::new(100, test.ctx());
    let alice_usdc = mint_for_testing<USDC>(1000, test.ctx());
    let alice_margin = strike::new_with_deposit(alice_usdc, test.ctx());

    transfer::public_transfer(pool, ALICE);
    transfer::public_transfer(alice_margin, ALICE);
  };

  next_tx(test, BOB);
  {
    let bob_usdc = mint_for_testing<USDC>(1000, test.ctx());
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
      100,
      10,
      2,
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 1, 1);
    let order = orderbook::get_bid(orderbook, 0);
    assert!(order::is_bid(order), 2);
    assert!(order::price(order) == 100, 3);
    assert!(order::size(order) == 10, 4);

    assert!(margin_account.balance() == 500, 5);

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
      100,
      10,
      4,
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 1);
    assert!(orderbook::get_asks_length(orderbook) == 1, 2);
    let order = orderbook::get_ask(orderbook, 0);
    assert!(!order::is_bid(order), 3);
    assert!(order::price(order) == 100, 4);
    assert!(order::size(order) == 10, 5);

    assert!(margin_account.balance() == 750, 6);

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
      100,
      10,
      2,
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
      90,
      5,
      2,
      test.ctx(),
    );

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      false,
      100,
      2,
      1,
      test.ctx(),
    );

    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == 925, 1);

    pool::close_position(
      &mut pool,
      &mut margin_account,
      90,
      false,
      test.ctx(),
    );

    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == 700, 2);

    assert!(margin_account.balance() == 800, 3);

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
      1000,
      100,
      1,
      test.ctx(),
    );

    transfer::public_transfer(pool, ALICE);
    transfer::public_transfer(margin_account, ALICE);
  };
  end(test);
}

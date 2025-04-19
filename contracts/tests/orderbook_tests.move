#[test_only]
module strike::orderbook_tests;

use strike::order;
use strike::orderbook::{Self, OrderBook};
use strike::strike::{Self, MarginAccount};
use sui::coin::mint_for_testing;
use sui::test_scenario::{begin, end};
use usdc::usdc::USDC;

#[test]
fun test_place_bid_order() {
  let mut test = begin(@0xF);
  let alice = @0xA;
  test.next_tx(alice);
  {
    let usdc_coin = mint_for_testing<USDC>(1000, test.ctx());
    let mut margin_account = strike::new_with_deposit(usdc_coin, test.ctx());
    let margin_account_id = object::id(&margin_account);
    let mut orderbook = orderbook::empty(test.ctx());

    let order = order::new(
      margin_account_id,
      true,
      100,
      10,
    );

    // Place bid order
    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account,
      order,
    );

    assert!(orderbook::get_bids_length(&orderbook) == 1, 1);
    let order = orderbook::get_bid(&orderbook, 0);
    assert!(order::margin_account_id(order) == margin_account_id, 2);
    assert!(order::is_bid(order) == true, 3);
    assert!(order::price(order) == 100, 4);
    assert!(order::size(order) == 10, 5);
    assert!(order::filled_size(order) == 0, 6);

    transfer::public_transfer(margin_account, alice);
    transfer::public_transfer(orderbook, alice);
  };
  end(test);
}

#[test]
fun test_cancel_order_multiple_users() {
  let mut test = begin(@0xF);
  let alice = @0xA;
  let bob = @0xB;

  test.next_tx(alice);
  {
    let usdc_coin = mint_for_testing<USDC>(2000, test.ctx());
    let mut margin_account_alice = strike::new_with_deposit(
      usdc_coin,
      test.ctx(),
    );
    let mut orderbook = orderbook::empty(test.ctx());

    let alice_order = order::new(
      object::id(&margin_account_alice),
      true,
      100,
      10,
    );

    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_alice,
      alice_order,
    );

    assert!(orderbook::get_bids_length(&orderbook) == 1, 1);

    transfer::public_transfer(orderbook, bob);
    transfer::public_transfer(margin_account_alice, alice);
  };

  test.next_tx(bob);
  {
    let mut orderbook = test.take_from_address<OrderBook>(bob);

    let mut margin_account_bob = strike::new(test.ctx());
    let margin_account_bob_id = object::id(&margin_account_bob);

    let bob_order = order::new(
      margin_account_bob_id,
      true,
      90,
      5,
    );

    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_bob,
      bob_order,
    );

    let bob_order2 = order::new(
      object::id(&margin_account_bob),
      true,
      80,
      8,
    );

    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_bob,
      bob_order2,
    );

    assert!(orderbook::get_bids_length(&orderbook) == 3, 2);

    transfer::public_transfer(orderbook, alice);
    transfer::public_transfer(margin_account_bob, bob);
  };

  test.next_tx(alice);
  {
    let mut orderbook = test.take_from_address<OrderBook>(alice);
    let margin_account_alice = test.take_from_address<MarginAccount>(alice);

    // Cancel Alice's first order (price 100)
    orderbook::cancel_order(
      &mut orderbook,
      &margin_account_alice,
      true,
      100,
      test.ctx(),
    );

    assert!(orderbook::get_bids_length(&orderbook) == 2, 3);

    let margin_account_bob = test.take_from_address<MarginAccount>(bob);
    let bob_margin_account_id = object::id(&margin_account_bob);
    let bob_order1 = orderbook::get_bid(&orderbook, 0);
    let bob_order2 = orderbook::get_bid(&orderbook, 1);

    assert!(order::margin_account_id(bob_order1) == bob_margin_account_id, 4);
    assert!(order::margin_account_id(bob_order2) == bob_margin_account_id, 5);

    transfer::public_transfer(orderbook, alice);
    transfer::public_transfer(margin_account_alice, alice);
    transfer::public_transfer(margin_account_bob, bob);
  };

  end(test);
}

#[test, expected_failure(abort_code = orderbook::EInvalidAccountOwner)]
fun test_cancel_order_unauthorized() {
  let mut test = begin(@0xF);
  let alice = @0xA;
  let bob = @0xB;

  test.next_tx(alice);
  {
    let usdc_coin = mint_for_testing<USDC>(1000, test.ctx());
    let mut margin_account_alice = strike::new_with_deposit(
      usdc_coin,
      test.ctx(),
    );
    let mut orderbook = orderbook::empty(test.ctx());
    let alice_order = order::new(
      object::id(&margin_account_alice),
      true,
      100,
      10,
    );

    // Alice places an order
    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_alice,
      alice_order,
    );

    assert!(orderbook::get_bids_length(&orderbook) == 1, 1);

    transfer::public_transfer(orderbook, bob);
    transfer::public_transfer(margin_account_alice, alice);
  };

  test.next_tx(bob);
  {
    let margin_account_alice = test.take_from_address<MarginAccount>(alice);
    let mut orderbook = test.take_from_address<OrderBook>(bob);

    // Bob tries to cancel Alice's order (should fail)
    orderbook::cancel_order(
      &mut orderbook,
      &margin_account_alice,
      true,
      100,
      test.ctx(),
    );

    transfer::public_transfer(orderbook, alice);
    transfer::public_transfer(margin_account_alice, alice);
  };

  end(test);
}

#[test]
fun test_order_matching() {
  let mut test = begin(@0xF);
  let alice = @0xA;
  let bob = @0xB;
  let clinton = @0xC;

  test.next_tx(alice);
  {
    let usdc_coin = mint_for_testing<USDC>(1000, test.ctx());
    let mut margin_account_alice = strike::new_with_deposit(
      usdc_coin,
      test.ctx(),
    );
    let mut orderbook = orderbook::empty(test.ctx());

    // Alice places ask order (selling) at price 100
    let alice_order = order::new(
      object::id(&margin_account_alice),
      false,
      100,
      50,
    );

    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_alice,
      alice_order,
    );

    transfer::public_transfer(orderbook, bob);
    transfer::public_transfer(margin_account_alice, alice);
  };

  test.next_tx(bob);
  {
    let usdc_coin = mint_for_testing<USDC>(1000, test.ctx());
    let mut margin_account_bob = strike::new_with_deposit(
      usdc_coin,
      test.ctx(),
    );
    let mut orderbook = test.take_from_address<OrderBook>(bob);
    let margin_account_alice = test.take_from_address<MarginAccount>(alice);

    // Bob places bid order (buying) at price 110
    let bob_order = order::new(
      object::id(&margin_account_bob),
      true,
      110,
      30,
    );

    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_bob,
      bob_order,
    );

    transfer::public_transfer(orderbook, clinton);
    transfer::public_transfer(margin_account_bob, bob);
    transfer::public_transfer(margin_account_alice, alice);
  };

  test.next_tx(clinton);
  {
    let usdc_coin = mint_for_testing<USDC>(1000, test.ctx());
    let mut margin_account_clinton = strike::new_with_deposit(
      usdc_coin,
      test.ctx(),
    );
    let mut orderbook = test.take_from_address<OrderBook>(clinton);
    let margin_account_alice = test.take_from_address<MarginAccount>(alice);
    let margin_account_bob = test.take_from_address<MarginAccount>(bob);

    // Clinton places bid order (buying) at price 90
    let clinton_order = order::new(
      object::id(&margin_account_clinton),
      true,
      90,
      20,
    );

    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_clinton,
      clinton_order,
    );

    // Verify orderbook state after matching
    assert!(orderbook::get_bids_length(&orderbook) == 1, 0); // Only Clinton's order remains
    assert!(orderbook::get_asks_length(&orderbook) == 1, 0); // Alice's order remains with reduced size

    // Alice's aks should exist and filled by Clintons size
    let last_ask = orderbook::get_ask(&orderbook, 0);
    assert!(
      order::margin_account_id(last_ask) == object::id(&margin_account_alice),
      1,
    );
    assert!(order::price(last_ask) == 100, 2);
    assert!(order::size(last_ask) == 50, 3);
    assert!(order::filled_size(last_ask) == 20, 4);

    // Bob's bid should be untouched
    let last_bid = orderbook::get_bid(&orderbook, 0);
    assert!(
      order::margin_account_id(last_bid) == object::id(&margin_account_bob),
      5,
    );
    assert!(order::price(last_bid) == 110, 6);
    assert!(order::size(last_bid) == 30, 7);
    assert!(order::filled_size(last_bid) == 0, 8);

    transfer::public_transfer(orderbook, alice);
    transfer::public_transfer(margin_account_clinton, clinton);
    transfer::public_transfer(margin_account_bob, bob);
    transfer::public_transfer(margin_account_alice, alice);
  };

  end(test);
}

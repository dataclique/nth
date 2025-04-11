#[test_only]
module strike::orderbook_tests;

use strike::orderbook::{Self, OrderBook};
use strike::strike::{Self, MarginAccount};
use sui::coin::{Self, mint_for_testing};
use sui::sui::SUI;
use sui::test_scenario::{Self, begin, end};
use usdc::usdc::USDC;

const TEST_USDC_AMOUNT: u64 = 1000;

#[test]
fun test_get_available_balance_no_orders() {
  let mut test = begin(@0xF);
  let alice = @0xA;
  test.next_tx(alice);
  {
    let usdc_coin = coin::mint_for_testing<USDC>(
      TEST_USDC_AMOUNT,
      test.ctx(),
    );

    let margin_account = strike::new_with_deposit(usdc_coin, test.ctx());
    let orderbook = orderbook::empty(test.ctx());

    let available_balance = orderbook::get_available_balance(
      &orderbook,
      &margin_account,
    );

    assert!(available_balance == TEST_USDC_AMOUNT, 1);

    transfer::public_transfer(margin_account, alice);
    transfer::public_transfer(orderbook, alice);
  };

  end(test);
}

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

    // Place bid order
    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account,
      true,
      100,
      10,
      test.ctx(),
    );

    assert!(orderbook::get_bids_length(&orderbook) == 1, 1);
    let order = orderbook::get_bid(&orderbook, 0);
    assert!(
      orderbook::get_order_margin_account_id(order) == margin_account_id,
      2,
    );
    assert!(orderbook::get_order_is_bid(order) == true, 3);
    assert!(orderbook::get_order_price(order) == 100, 4);
    assert!(orderbook::get_order_size(order) == 10, 5);
    assert!(orderbook::get_order_filled_size(order) == 0, 6);

    // Verify all balance is locked
    let available_balance = orderbook::get_available_balance(
      &orderbook,
      &margin_account,
    );
    assert!(available_balance == 0, 8);

    transfer::public_transfer(margin_account, alice);
    transfer::public_transfer(orderbook, alice);
  };
  end(test);
}

#[test, expected_failure(abort_code = orderbook::EInsufficientBalance)]
fun test_place_order_low_deposit() {
  let mut test = begin(@0xF);
  let alice = @0xA;
  test.next_tx(alice);
  {
    let usdc_coin = mint_for_testing<USDC>(500, test.ctx());
    let mut margin_account = strike::new_with_deposit(usdc_coin, test.ctx());
    let mut orderbook = orderbook::empty(test.ctx());

    // Try to place order for 100*10 = 1000 and took error balance too low
    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account,
      true,
      100,
      10,
      test.ctx(),
    );

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

    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_alice,
      true,
      100,
      10,
      test.ctx(),
    );

    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_alice,
      true,
      90,
      5,
      test.ctx(),
    );

    assert!(orderbook::get_bids_length(&orderbook) == 2, 1);

    let alice_balance_after_place_order = 2000 - 100 * 10 - 90 * 5;
    let available_balance = orderbook::get_available_balance(
      &orderbook,
      &margin_account_alice,
    );
    assert!(available_balance == alice_balance_after_place_order, 2);

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

    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_bob,
      true,
      80,
      8,
      test.ctx(),
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

    let alice_balance_after_cancel_order = 2000 - 90 * 5;
    let available_balance = orderbook::get_available_balance(
      &orderbook,
      &margin_account_alice,
    );
    assert!(available_balance == alice_balance_after_cancel_order, 4);

    transfer::public_transfer(orderbook, alice);
    transfer::public_transfer(margin_account_alice, alice);
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

    // Alice places an order
    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_alice,
      true,
      100,
      10,
      test.ctx(),
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
fun test_order_matching_and_transfer() {
  let mut test = begin(@0xF);
  let alice = @0xA;
  let bob = @0xB;

  test.next_tx(alice);
  {
    // Alice creates a margin account and places an ask order
    let usdc_coin = mint_for_testing<USDC>(1000, test.ctx());
    let mut margin_account_alice = strike::new_with_deposit(
      usdc_coin,
      test.ctx(),
    );
    let mut orderbook = orderbook::empty(test.ctx());

    // Alice places an ask order (sell) at price 100
    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_alice,
      false, // is_bid = false for ask
      100, // price
      10, // size
      test.ctx(),
    );

    assert!(orderbook::get_asks_length(&orderbook) == 1, 1);
    let alice_balance_after_place = 1000 - 100 * 10; // All balance locked for the order
    assert!(
      orderbook::get_available_balance(&orderbook, &margin_account_alice) == alice_balance_after_place,
      2,
    );

    transfer::public_transfer(orderbook, bob);
    transfer::public_transfer(margin_account_alice, alice);
  };

  test.next_tx(bob);
  {
    // Bob creates a margin account and places a bid order
    let usdc_coin = mint_for_testing<USDC>(2000, test.ctx());
    let mut margin_account_bob = strike::new_with_deposit(
      usdc_coin,
      test.ctx(),
    );
    let mut orderbook = test.take_from_address<OrderBook>(bob);
    let margin_account_alice = test.take_from_address<MarginAccount>(alice);

    // Bob places a bid order (buy) at price 100 that should match Alice's ask
    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account_bob,
      true, // is_bid = true
      100, // price
      10, // size
      test.ctx(),
    );

    // Verify the match
    assert!(orderbook::get_asks_length(&orderbook) == 0, 3); // Alice's ask should be removed
    assert!(orderbook::get_bids_length(&orderbook) == 0, 4); // Bob's bid should be removed

    //  TODO: fix that we trading USDC for USDC price. LOL. So money will be the
    // same after trade.
    // Verify balances after transfer
    // Alice should have her original balance plus the money from Bob
    let alice_expected_balance = 1000;
    assert!(
      orderbook::get_available_balance(&orderbook, &margin_account_alice) == alice_expected_balance,
      5,
    );

    // Bob should have his original balance minus the money he paid
    let bob_expected_balance = 2000;
    assert!(
      orderbook::get_available_balance(&orderbook, &margin_account_bob) == bob_expected_balance,
      6,
    );

    transfer::public_transfer(orderbook, alice);
    transfer::public_transfer(margin_account_alice, alice);
    transfer::public_transfer(margin_account_bob, bob);
  };

  end(test);
}

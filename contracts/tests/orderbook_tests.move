#[test_only]
module strike::orderbook_tests;

use strike::orderbook::{Self, OrderBook};
use strike::strike::{Self, MarginAccount};
use sui::coin;
use sui::test_scenario;
use usdc::usdc::USDC;

// Test constants
const MIN_COLLATERAL: u64 = 100;
const INITIAL_BALANCE: u64 = 10000;
const ORDER_PRICE: u64 = 1000;
const ORDER_SIZE: u64 = 5;

#[test]
fun test_orderbook_creation() {
  // Create test address representing the user
  let alice = @0xA;

  // First transaction: Create an orderbook
  let mut scenario = test_scenario::begin(alice);
  {
    // Create a new orderbook
    orderbook::new(MIN_COLLATERAL, scenario.ctx());
  };

  // Second transaction: Verify the orderbook exists in storage
  scenario.next_tx(alice);
  {
    // Check that the orderbook exists
    assert!(test_scenario::has_most_recent_for_address<OrderBook>(alice), 1);

    // Take the orderbook from storage to verify properties
    let orderbook = test_scenario::take_from_sender<OrderBook>(&scenario);

    // Verify the orderbook properties
    let (bid_price, bid_size) = orderbook::get_best_bid(&orderbook);
    assert!(bid_price == 0, 2);
    assert!(bid_size == 0, 3);

    let (ask_price, ask_size) = orderbook::get_best_ask(&orderbook);
    assert!(ask_price == 0, 4);
    assert!(ask_size == 0, 5);

    // Return the orderbook to storage
    test_scenario::return_to_sender(&scenario, orderbook);
  };

  test_scenario::end(scenario);
}

#[test]
fun test_place_limit_order() {
  // Create test address representing the user
  let alice = @0xA;

  // First transaction: Create an orderbook and margin account
  let mut scenario = test_scenario::begin(alice);
  {
    // Create a new orderbook
    orderbook::new(MIN_COLLATERAL, scenario.ctx());

    // Create a test USDC coin
    let usdc_coin = coin::mint_for_testing<USDC>(
      INITIAL_BALANCE,
      scenario.ctx(),
    );

    // Create a new margin account with deposit
    strike::new_with_deposit(usdc_coin, scenario.ctx());
  };

  // Second transaction: Place a limit order
  scenario.next_tx(alice);
  {
    // Take the orderbook and margin account from storage
    let mut orderbook = test_scenario::take_from_sender<OrderBook>(&scenario);
    let mut margin_account = test_scenario::take_from_sender<MarginAccount>(
      &scenario,
    );

    // Place a limit buy order
    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account,
      true, // is_long
      ORDER_PRICE,
      ORDER_SIZE,
      scenario.ctx(),
    );

    // Verify the order was placed
    let (best_bid_price, best_bid_size) = orderbook::get_best_bid(&orderbook);
    assert!(best_bid_price == ORDER_PRICE, 1);
    assert!(best_bid_size == ORDER_SIZE, 2);

    // Return the orderbook and margin account to storage
    test_scenario::return_to_sender(&scenario, orderbook);
    test_scenario::return_to_sender(&scenario, margin_account);
  };

  test_scenario::end(scenario);
}

// #[test]
// #[expected_failure(abort_code = strike::orderbook::EInsufficientBalance)]
// fun test_insufficient_balance_for_order() {
//   // Create test address representing the user
//   let alice = @0xA;
//   let small_balance = 100; // Not enough for the order

//   // First transaction: Create an orderbook and margin account
//   let mut scenario = test_scenario::begin(alice);
//   {
//     // Create a new orderbook
//     orderbook::new(MIN_COLLATERAL, scenario.ctx());

//     // Create a test USDC coin with small balance
//     let usdc_coin = coin::mint_for_testing<USDC>(small_balance, scenario.ctx());

//     // Create a new margin account with deposit
//     strike::new_with_deposit(usdc_coin, scenario.ctx());
//   };

//   // Second transaction: Try to place a limit order (should fail)
//   scenario.next_tx(alice);
//   {
//     // Take the orderbook and margin account from storage
//     let mut orderbook = test_scenario::take_from_sender<OrderBook>(&scenario);
//     let mut margin_account = test_scenario::take_from_sender<MarginAccount>(
//       &scenario,
//     );

//     // Try to place a limit buy order (should fail due to insufficient balance)
//     orderbook::place_limit_order(
//       &mut orderbook,
//       &mut margin_account,
//       true, // is_long
//       ORDER_PRICE,
//       ORDER_SIZE,
//       scenario.ctx(),
//     );
//   };

//   test_scenario::end(scenario);
// }

#[test]
fun test_cancel_order() {
  // Create test address representing the user
  let alice = @0xA;

  // First transaction: Create an orderbook and margin account
  let mut scenario = test_scenario::begin(alice);
  {
    // Create a new orderbook
    orderbook::new(MIN_COLLATERAL, scenario.ctx());

    // Create a test USDC coin
    let usdc_coin = coin::mint_for_testing<USDC>(
      INITIAL_BALANCE,
      scenario.ctx(),
    );

    // Create a new margin account with deposit
    strike::new_with_deposit(usdc_coin, scenario.ctx());
  };

  // Second transaction: Place a limit order
  scenario.next_tx(alice);
  {
    // Take the orderbook and margin account from storage
    let mut orderbook = test_scenario::take_from_sender<OrderBook>(&scenario);
    let mut margin_account = test_scenario::take_from_sender<MarginAccount>(
      &scenario,
    );

    // Place a limit buy order
    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account,
      true, // is_long
      ORDER_PRICE,
      ORDER_SIZE,
      scenario.ctx(),
    );

    // Return the orderbook and margin account to storage
    test_scenario::return_to_sender(&scenario, orderbook);
    test_scenario::return_to_sender(&scenario, margin_account);
  };

  // Third transaction: Cancel the order
  scenario.next_tx(alice);
  {
    // Take the orderbook and margin account from storage
    let mut orderbook = test_scenario::take_from_sender<OrderBook>(&scenario);
    let mut margin_account = test_scenario::take_from_sender<MarginAccount>(
      &scenario,
    );

    // Cancel the order
    orderbook::cancel_order(
      &mut orderbook,
      &mut margin_account,
      true, // is_long
      ORDER_PRICE,
      scenario.ctx(),
    );

    // Verify the order was cancelled
    let (best_bid_price, best_bid_size) = orderbook::get_best_bid(&orderbook);
    assert!(best_bid_size == 0, 1); // Order should be cancelled

    // Return the orderbook and margin account to storage
    test_scenario::return_to_sender(&scenario, orderbook);
    test_scenario::return_to_sender(&scenario, margin_account);
  };

  test_scenario::end(scenario);
}

#[test]
fun test_withdraw_after_order() {
  // Create test address representing the user
  let alice = @0xA;
  let withdrawal_amount = 500;

  // First transaction: Create an orderbook and margin account
  let mut scenario = test_scenario::begin(alice);
  {
    // Create a new orderbook
    orderbook::new(MIN_COLLATERAL, scenario.ctx());

    // Create a test USDC coin
    let usdc_coin = coin::mint_for_testing<USDC>(
      INITIAL_BALANCE,
      scenario.ctx(),
    );

    // Create a new margin account with deposit
    strike::new_with_deposit(usdc_coin, scenario.ctx());
  };

  // Second transaction: Place a limit order
  scenario.next_tx(alice);
  {
    // Take the orderbook and margin account from storage
    let mut orderbook = test_scenario::take_from_sender<OrderBook>(&scenario);
    let mut margin_account = test_scenario::take_from_sender<MarginAccount>(
      &scenario,
    );

    // Place a limit buy order
    orderbook::place_limit_order(
      &mut orderbook,
      &mut margin_account,
      true, // is_long
      ORDER_PRICE,
      ORDER_SIZE,
      scenario.ctx(),
    );

    // Return the orderbook and margin account to storage
    test_scenario::return_to_sender(&scenario, orderbook);
    test_scenario::return_to_sender(&scenario, margin_account);
  };

  // Third transaction: Withdraw a smaller amount (should succeed)
  scenario.next_tx(alice);
  {
    // Take the margin account from storage
    let mut margin_account = test_scenario::take_from_sender<MarginAccount>(
      &scenario,
    );

    // Withdraw a smaller amount
    let withdrawn_coin = strike::withdraw(
      &mut margin_account,
      withdrawal_amount,
      scenario.ctx(),
    );

    // Verify the withdrawn amount
    assert!(coin::value(&withdrawn_coin) == withdrawal_amount, 1);

    // Clean up the withdrawn coin
    coin::burn_for_testing(withdrawn_coin);

    // Return the margin account to storage
    test_scenario::return_to_sender(&scenario, margin_account);
  };

  test_scenario::end(scenario);
}

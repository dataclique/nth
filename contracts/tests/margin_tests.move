#[test_only]
module strike::margin_tests;

use strike::strike::{Self, MarginAccount};
use sui::coin;
use sui::test_scenario;
use usdc::usdc::USDC;

#[test]
fun test_margin_account_creation() {
  // Create test address representing the user
  let alice = @0xA;

  // First transaction: Create a margin account
  let mut scenario = test_scenario::begin(alice);
  {
    // Create a new margin account
    strike::new(scenario.ctx());
  };

  // Second transaction: Verify the margin account exists in storage
  scenario.next_tx(alice);
  {
    // Check that the margin account exists and is owned by alice
    assert!(
      test_scenario::has_most_recent_for_address<MarginAccount>(alice),
      2,
    );

    // Take the margin account from storage to verify properties
    let margin_account = test_scenario::take_from_sender<MarginAccount>(
      &scenario,
    );

    // Verify the margin account properties
    assert!(strike::owner(&margin_account) == alice, 0);
    assert!(strike::balance(&margin_account) == 0, 1);

    // Return the margin account to storage
    test_scenario::return_to_sender(&scenario, margin_account);
  };

  test_scenario::end(scenario);
}

#[test]
fun test_margin_account_with_deposit() {
  // Create test address representing the user
  let alice = @0xA;
  let deposit_amount = 1000;

  // First transaction: Create a margin account with deposit
  let mut scenario = test_scenario::begin(alice);
  {
    // Create a test USDC coin
    let usdc_coin = coin::mint_for_testing<USDC>(
      deposit_amount,
      scenario.ctx(),
    );

    // Create a new margin account with deposit
    strike::new_with_deposit(usdc_coin, scenario.ctx());
  };

  // Second transaction: Verify the margin account exists in storage
  scenario.next_tx(alice);
  {
    // Check that the margin account exists and is owned by alice
    assert!(
      test_scenario::has_most_recent_for_address<MarginAccount>(alice),
      2,
    );

    // Take the margin account from storage to verify properties
    let margin_account = test_scenario::take_from_sender<MarginAccount>(
      &scenario,
    );

    // Verify the margin account properties
    assert!(strike::owner(&margin_account) == alice, 0);
    assert!(strike::balance(&margin_account) == deposit_amount, 1);

    // Return the margin account to storage
    test_scenario::return_to_sender(&scenario, margin_account);
  };

  test_scenario::end(scenario);
}

#[test]
fun test_deposit_and_withdraw() {
  // Create test address representing the user
  let alice = @0xA;
  let initial_deposit = 1000;
  let additional_deposit = 500;
  let withdrawal_amount = 300;

  // First transaction: Create a margin account with initial deposit
  let mut scenario = test_scenario::begin(alice);
  {
    // Create a test USDC coin
    let usdc_coin = coin::mint_for_testing<USDC>(
      initial_deposit,
      scenario.ctx(),
    );

    // Create a new margin account with deposit
    strike::new_with_deposit(usdc_coin, scenario.ctx());
  };

  // Second transaction: Deposit additional funds
  scenario.next_tx(alice);
  {
    // Take the margin account from storage
    let mut margin_account = test_scenario::take_from_sender<MarginAccount>(
      &scenario,
    );

    // Create additional USDC for deposit
    let usdc_coin = coin::mint_for_testing<USDC>(
      additional_deposit,
      scenario.ctx(),
    );

    // Deposit additional funds
    strike::deposit(&mut margin_account, usdc_coin, scenario.ctx());

    // Verify the updated balance
    assert!(
      strike::balance(&margin_account) == initial_deposit + additional_deposit,
      2,
    );

    // Return the margin account to storage
    test_scenario::return_to_sender(&scenario, margin_account);
  };

  // Third transaction: Withdraw some funds
  scenario.next_tx(alice);
  {
    // Take the margin account from storage
    let mut margin_account = test_scenario::take_from_sender<MarginAccount>(
      &scenario,
    );

    // Withdraw some funds
    let withdrawn_coin = strike::withdraw(
      &mut margin_account,
      withdrawal_amount,
      scenario.ctx(),
    );

    // Verify the withdrawn amount
    assert!(coin::value(&withdrawn_coin) == withdrawal_amount, 3);

    // Verify the updated balance
    assert!(
      strike::balance(&margin_account) == initial_deposit + additional_deposit - withdrawal_amount,
      4,
    );

    // Clean up the withdrawn coin
    coin::burn_for_testing(withdrawn_coin);

    // Return the margin account to storage
    test_scenario::return_to_sender(&scenario, margin_account);
  };

  test_scenario::end(scenario);
}

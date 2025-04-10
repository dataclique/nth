#[test_only]
module strike::orderbook_tests;

use strike::orderbook;
use strike::strike::{Self, MarginAccount};
use sui::coin;
use sui::test_scenario;
use usdc::usdc::USDC;

const TEST_USDC_AMOUNT: u64 = 1000;

#[test]
fun test_get_available_balance_no_orders() {
  let alice = @0xA;
  let mut scenario = test_scenario::begin(alice);

  // First transaction: Create margin account with deposit
  {
    let usdc_coin = coin::mint_for_testing<USDC>(
      TEST_USDC_AMOUNT,
      scenario.ctx(),
    );

    strike::new_with_deposit(usdc_coin, scenario.ctx());
  };

  // Second transaction: Create orderbook and test balance
  scenario.next_tx(alice);
  {
    let orderbook = orderbook::empty(scenario.ctx());

    let margin_account = test_scenario::take_from_sender<MarginAccount>(
      &scenario,
    );

    let available_balance = orderbook::get_available_balance(
      &orderbook,
      &margin_account,
    );

    assert!(available_balance == TEST_USDC_AMOUNT, 1);

    test_scenario::return_to_sender(&scenario, margin_account);

    orderbook::destroy(orderbook);
  };

  test_scenario::end(scenario);
}

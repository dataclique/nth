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

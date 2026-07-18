#[test_only]
module funds::vault_tests;

use funds::vault::{Self, VaultMarket, VaultManagerCap};
use nth::margin::{Self, MarginAccount};
use nth::order;
use sui::coin;
use sui::test_scenario::{Self, Scenario};
use units::price;
use units::size;
use units::usdc_amount;
use usdc::usdc::USDC;

const ALICE: address = @0xA11CE;

#[error]
const EUnexpectedValue: vector<u8> = b"vault value did not match";

macro fun assert_eq<$T: drop>($left: $T, $right: $T) {
  assert!($left == $right, EUnexpectedValue);
}

fun funded_account(test: &mut Scenario, amount: u64): MarginAccount {
  margin::new_with_deposit(
    coin::mint_for_testing<USDC>(amount, test.ctx()),
    test.ctx(),
  )
}

fun new_vault(
  fee_account: ID,
  fee_bps: u64,
  test: &mut Scenario,
): (VaultMarket, VaultManagerCap) {
  vault::new(
    fee_account,
    fee_bps,
    usdc_amount::usdc(50_000_000),
    2,
    test.ctx(),
  )
}

fun fund_and_move_in(
  market: &mut VaultMarket,
  account: &mut MarginAccount,
  amount: u64,
  test: &mut Scenario,
) {
  vault::deposit_collateral(
    market,
    account,
    usdc_amount::usdc(amount),
    test.ctx(),
  );
}

fun finish(
  market: VaultMarket,
  cap: VaultManagerCap,
  test: test_scenario::Scenario,
) {
  vault::share(market);
  transfer::public_transfer(cap, ALICE);
  test.end();
}

#[test]
fun deposits_mint_nav_shares_with_the_dead_share_defense() {
  let mut test = test_scenario::begin(ALICE);
  let mut alice = funded_account(&mut test, 100_000_000);
  let mut bob = funded_account(&mut test, 50_000_000);
  let fee_account = funded_account(&mut test, 1_000_000);
  let alice_id = object::id(&alice);
  let bob_id = object::id(&bob);
  let fee_id = object::id(&fee_account);
  let (mut market, cap) = new_vault(fee_id, 100, &mut test);
  fund_and_move_in(&mut market, &mut alice, 100_000_000, &mut test);
  fund_and_move_in(&mut market, &mut bob, 50_000_000, &mut test);

  vault::deposit(
    &mut market,
    &alice,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );
  assert_eq!(vault::nav(&market).value(), 99_000_000);
  assert_eq!(vault::total_shares(&market), 99_000_000);
  assert_eq!(vault::share_balance(&market, alice_id), 98_999_000);
  assert_eq!(vault::free_collateral(&market, fee_id).value(), 1_000_000);
  assert_eq!(vault::free_collateral(&market, alice_id).value(), 0);

  vault::deposit(&mut market, &bob, usdc_amount::usdc(50_000_000), test.ctx());
  assert_eq!(vault::nav(&market).value(), 148_500_000);
  assert_eq!(vault::total_shares(&market), 148_500_000);
  assert_eq!(vault::share_balance(&market, bob_id), 49_500_000);

  vault::redeem(&mut market, &alice, size::size(50_000_000), test.ctx());
  assert_eq!(vault::free_collateral(&market, alice_id).value(), 50_000_000);
  assert_eq!(vault::nav(&market).value(), 98_500_000);
  assert_eq!(vault::total_shares(&market), 98_500_000);
  assert_eq!(vault::share_balance(&market, alice_id), 48_999_000);

  margin::keep(alice, test.ctx());
  margin::keep(bob, test.ctx());
  margin::keep(fee_account, test.ctx());
  finish(market, cap, test);
}

#[test, expected_failure(abort_code = vault::EInitialDepositTooSmall)]
fun the_first_deposit_must_exceed_the_dead_shares() {
  let mut test = test_scenario::begin(ALICE);
  let mut alice = funded_account(&mut test, 1_000_000);
  let fee_account = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_vault(object::id(&fee_account), 0, &mut test);
  fund_and_move_in(&mut market, &mut alice, 1_000_000, &mut test);

  vault::deposit(&mut market, &alice, usdc_amount::usdc(900), test.ctx());
  margin::keep(alice, test.ctx());
  margin::keep(fee_account, test.ctx());
  finish(market, cap, test);
}

#[test, expected_failure(abort_code = vault::EOversoldShares)]
fun share_sales_cannot_exceed_holdings() {
  let mut test = test_scenario::begin(ALICE);
  let mut alice = funded_account(&mut test, 100_000_000);
  let fee_account = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_vault(object::id(&fee_account), 0, &mut test);
  fund_and_move_in(&mut market, &mut alice, 100_000_000, &mut test);
  vault::deposit(
    &mut market,
    &alice,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );

  vault::place_limit_order(
    &mut market,
    &alice,
    order::ask(),
    price::price(1_000_000),
    size::size(100_000_000),
    test.ctx(),
  );
  margin::keep(alice, test.ctx());
  margin::keep(fee_account, test.ctx());
  finish(market, cap, test);
}

#[test, expected_failure(abort_code = vault::ESharesLockedOnBook)]
fun listed_shares_cannot_be_redeemed() {
  let mut test = test_scenario::begin(ALICE);
  let mut alice = funded_account(&mut test, 100_000_000);
  let fee_account = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_vault(object::id(&fee_account), 0, &mut test);
  fund_and_move_in(&mut market, &mut alice, 100_000_000, &mut test);
  vault::deposit(
    &mut market,
    &alice,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );
  vault::place_limit_order(
    &mut market,
    &alice,
    order::ask(),
    price::price(1_000_000),
    size::size(99_000_000),
    test.ctx(),
  );

  vault::redeem(&mut market, &alice, size::size(10_000_000), test.ctx());
  margin::keep(alice, test.ctx());
  margin::keep(fee_account, test.ctx());
  finish(market, cap, test);
}

#[test]
fun secondary_trades_move_premium_and_shares() {
  let mut test = test_scenario::begin(ALICE);
  let mut alice = funded_account(&mut test, 100_000_000);
  let mut bob = funded_account(&mut test, 20_000_000);
  let fee_account = funded_account(&mut test, 1_000_000);
  let alice_id = object::id(&alice);
  let bob_id = object::id(&bob);
  let (mut market, cap) = new_vault(object::id(&fee_account), 0, &mut test);
  fund_and_move_in(&mut market, &mut alice, 100_000_000, &mut test);
  fund_and_move_in(&mut market, &mut bob, 20_000_000, &mut test);
  vault::deposit(
    &mut market,
    &alice,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );

  vault::place_limit_order(
    &mut market,
    &alice,
    order::ask(),
    price::price(900_000),
    size::size(10_000_000),
    test.ctx(),
  );
  vault::place_limit_order(
    &mut market,
    &bob,
    order::bid(),
    price::price(900_000),
    size::size(10_000_000),
    test.ctx(),
  );

  assert_eq!(vault::share_balance(&market, alice_id), 89_999_000);
  assert_eq!(vault::share_balance(&market, bob_id), 10_000_000);
  assert_eq!(vault::free_collateral(&market, alice_id).value(), 9_000_000);
  assert_eq!(vault::free_collateral(&market, bob_id).value(), 11_000_000);
  assert_eq!(vault::listed_sales(&market, alice_id), 0);
  assert_eq!(vault::total_shares(&market), 100_000_000);
  assert_eq!(vault::nav(&market).value(), 100_000_000);

  margin::keep(alice, test.ctx());
  margin::keep(bob, test.ctx());
  margin::keep(fee_account, test.ctx());
  finish(market, cap, test);
}

#[test]
fun manager_buybacks_burn_shares_and_accrete_nav() {
  let mut test = test_scenario::begin(ALICE);
  let mut alice = funded_account(&mut test, 100_000_000);
  let fee_account = funded_account(&mut test, 1_000_000);
  let alice_id = object::id(&alice);
  let (mut market, cap) = new_vault(object::id(&fee_account), 0, &mut test);
  fund_and_move_in(&mut market, &mut alice, 100_000_000, &mut test);
  vault::deposit(
    &mut market,
    &alice,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );

  vault::place_limit_order(
    &mut market,
    &alice,
    order::ask(),
    price::price(1_100_000),
    size::size(10_000_000),
    test.ctx(),
  );
  vault::place_buyback_bid(
    &mut market,
    &cap,
    price::price(1_100_000),
    size::size(10_000_000),
  );

  assert_eq!(vault::total_shares(&market), 90_000_000);
  assert_eq!(vault::nav(&market).value(), 89_000_000);
  assert_eq!(vault::share_balance(&market, alice_id), 89_999_000);
  assert_eq!(vault::free_collateral(&market, alice_id).value(), 11_000_000);
  assert_eq!(vault::ask_count(&market), 0);
  assert_eq!(vault::open_treasury_orders(&market), 0);

  margin::keep(alice, test.ctx());
  margin::keep(fee_account, test.ctx());
  finish(market, cap, test);
}

#[test]
fun resting_buybacks_count_in_nav_and_release_on_cancel() {
  let mut test = test_scenario::begin(ALICE);
  let mut alice = funded_account(&mut test, 100_000_000);
  let fee_account = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_vault(object::id(&fee_account), 0, &mut test);
  fund_and_move_in(&mut market, &mut alice, 100_000_000, &mut test);
  vault::deposit(
    &mut market,
    &alice,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );

  vault::place_buyback_bid(
    &mut market,
    &cap,
    price::price(1_000_000),
    size::size(10_000_000),
  );
  assert_eq!(vault::open_treasury_orders(&market), 1);
  assert_eq!(vault::nav(&market).value(), 100_000_000);
  assert_eq!(vault::bid_count(&market), 1);

  vault::cancel_buyback_bid(&mut market, &cap, order::order_id(1));
  assert_eq!(vault::open_treasury_orders(&market), 0);
  assert_eq!(vault::nav(&market).value(), 100_000_000);
  assert_eq!(vault::bid_count(&market), 0);

  margin::keep(alice, test.ctx());
  margin::keep(fee_account, test.ctx());
  finish(market, cap, test);
}

#[test, expected_failure(abort_code = vault::EPolicyOrderTooLarge)]
fun buybacks_respect_the_notional_policy_cap() {
  let mut test = test_scenario::begin(ALICE);
  let mut alice = funded_account(&mut test, 100_000_000);
  let fee_account = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_vault(object::id(&fee_account), 0, &mut test);
  fund_and_move_in(&mut market, &mut alice, 100_000_000, &mut test);
  vault::deposit(
    &mut market,
    &alice,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );

  vault::place_buyback_bid(
    &mut market,
    &cap,
    price::price(1_000_000),
    size::size(60_000_000),
  );
  margin::keep(alice, test.ctx());
  margin::keep(fee_account, test.ctx());
  finish(market, cap, test);
}

#[test, expected_failure(abort_code = vault::EPolicyTooManyOrders)]
fun buybacks_respect_the_open_order_policy_bound() {
  let mut test = test_scenario::begin(ALICE);
  let mut alice = funded_account(&mut test, 100_000_000);
  let fee_account = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_vault(object::id(&fee_account), 0, &mut test);
  fund_and_move_in(&mut market, &mut alice, 100_000_000, &mut test);
  vault::deposit(
    &mut market,
    &alice,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );

  vault::place_buyback_bid(
    &mut market,
    &cap,
    price::price(1_000_000),
    size::size(1_000_000),
  );
  vault::place_buyback_bid(
    &mut market,
    &cap,
    price::price(900_000),
    size::size(1_000_000),
  );
  vault::place_buyback_bid(
    &mut market,
    &cap,
    price::price(800_000),
    size::size(1_000_000),
  );
  margin::keep(alice, test.ctx());
  margin::keep(fee_account, test.ctx());
  finish(market, cap, test);
}

#[test, expected_failure(abort_code = vault::EWrongManagerCap)]
fun a_foreign_manager_cap_cannot_quote() {
  let mut test = test_scenario::begin(ALICE);
  let mut alice = funded_account(&mut test, 100_000_000);
  let fee_account = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_vault(object::id(&fee_account), 0, &mut test);
  let (other_market, other_cap) = new_vault(
    object::id(&fee_account),
    0,
    &mut test,
  );
  fund_and_move_in(&mut market, &mut alice, 100_000_000, &mut test);
  vault::deposit(
    &mut market,
    &alice,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );

  vault::place_buyback_bid(
    &mut market,
    &other_cap,
    price::price(1_000_000),
    size::size(1_000_000),
  );
  vault::share(other_market);
  transfer::public_transfer(other_cap, ALICE);
  margin::keep(alice, test.ctx());
  margin::keep(fee_account, test.ctx());
  finish(market, cap, test);
}

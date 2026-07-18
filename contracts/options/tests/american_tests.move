#[test_only]
module options::american_tests;

use nth::margin::{Self, MarginAccount};
use nth::order;
use nth::position;
use options::american::{Self, AmericanMarket};
use options::oracle::PriceCap;
use sui::clock::{Self, Clock};
use sui::coin;
use sui::test_scenario::{Self, Scenario, take_from_address, return_to_address};
use units::price;
use units::size;
use units::usdc_amount;
use usdc::usdc::USDC;

const ALICE: address = @0xA11CE;
const BOB: address = @0xB0B;

const STRIKE: u64 = 100_000_000;
const PAYOUT_CAP: u64 = 50_000_000;
const EXPIRY_MS: u64 = 100_000;
const PREMIUM: u64 = 5_000_000;
const SIZE: u64 = 2_000_000;

#[error]
const EUnexpectedValue: vector<u8> = b"american option value did not match";

macro fun assert_eq<$T: drop>($left: $T, $right: $T) {
  assert!($left == $right, EUnexpectedValue);
}

fun funded_account(test: &mut Scenario, amount: u64): MarginAccount {
  margin::new_with_deposit(
    coin::mint_for_testing<USDC>(amount, test.ctx()),
    test.ctx(),
  )
}

fun new_market(
  reserve_id: ID,
  clock: &Clock,
  test: &mut Scenario,
): (AmericanMarket, PriceCap) {
  american::new(
    price::price(STRIKE),
    EXPIRY_MS,
    price::price(PAYOUT_CAP),
    price::price(STRIKE),
    reserve_id,
    clock,
    test.ctx(),
  )
}

fun open_option_pair(
  market: &mut AmericanMarket,
  buyer: &MarginAccount,
  seller: &MarginAccount,
  clock: &Clock,
  test: &mut Scenario,
) {
  american::place_limit_order(
    market,
    seller,
    order::ask(),
    price::price(PREMIUM),
    size::size(SIZE),
    clock,
    test.ctx(),
  );
  american::place_limit_order(
    market,
    buyer,
    order::bid(),
    price::price(PREMIUM),
    size::size(SIZE),
    clock,
    test.ctx(),
  );
}

fun finish(
  market: AmericanMarket,
  cap: PriceCap,
  clock: Clock,
  test: test_scenario::Scenario,
) {
  american::share(market);
  transfer::public_transfer(cap, ALICE);
  clock.destroy_for_testing();
  test.end();
}

#[test]
fun early_exercise_pays_intrinsic_and_reduces_both_sides() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let seller_id = object::id(&seller);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  american::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  american::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(5_000);
  american::update_underlying_price(
    &mut market,
    &cap,
    price::price(130_000_000),
    &clock,
  );
  american::exercise(
    &mut market,
    &buyer,
    seller_id,
    size::size(1_000_000),
    &clock,
    test.ctx(),
  );

  assert_eq!(american::position_state(&market, buyer_id), position::long());
  assert_eq!(american::position_size(&market, buyer_id).value(), 1_000_000);
  assert_eq!(american::position_state(&market, seller_id), position::short());
  assert_eq!(american::position_size(&market, seller_id).value(), 1_000_000);
  assert_eq!(american::free_collateral(&market, buyer_id).value(), 70_000_000);
  assert_eq!(
    american::free_collateral(&market, seller_id).value(),
    130_000_000,
  );
  assert_eq!(
    american::position_collateral(&market, seller_id).value(),
    50_000_000,
  );
  assert_eq!(american::total_collateral(&market).value(), 250_000_000);

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test]
fun full_exercise_closes_both_positions() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let seller_id = object::id(&seller);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  american::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  american::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(5_000);
  american::update_underlying_price(
    &mut market,
    &cap,
    price::price(130_000_000),
    &clock,
  );
  american::exercise(
    &mut market,
    &buyer,
    seller_id,
    size::size(SIZE),
    &clock,
    test.ctx(),
  );

  assert_eq!(american::position_state(&market, buyer_id), position::flat());
  assert_eq!(american::position_state(&market, seller_id), position::flat());
  assert_eq!(american::free_collateral(&market, buyer_id).value(), 100_000_000);
  assert_eq!(
    american::free_collateral(&market, seller_id).value(),
    150_000_000,
  );
  assert_eq!(american::position_collateral(&market, seller_id).value(), 0);

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = american::EStaleUnderlyingPrice)]
fun exercise_requires_a_fresh_underlying_price() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let seller_id = object::id(&seller);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  american::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  american::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(70_000);
  american::exercise(
    &mut market,
    &buyer,
    seller_id,
    size::size(SIZE),
    &clock,
    test.ctx(),
  );
  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = american::EExpired)]
fun exercise_after_expiry_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let seller_id = object::id(&seller);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  american::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  american::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(EXPIRY_MS);
  american::update_underlying_price(
    &mut market,
    &cap,
    price::price(130_000_000),
    &clock,
  );
  american::exercise(
    &mut market,
    &buyer,
    seller_id,
    size::size(SIZE),
    &clock,
    test.ctx(),
  );
  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = american::EInsufficientLongExposure)]
fun exercise_beyond_the_long_position_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let seller_id = object::id(&seller);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  american::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  american::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(5_000);
  american::exercise(
    &mut market,
    &buyer,
    seller_id,
    size::size(3_000_000),
    &clock,
    test.ctx(),
  );
  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = american::EInsufficientShortExposure)]
fun exercise_must_assign_a_short() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  american::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  american::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(5_000);
  american::exercise(
    &mut market,
    &buyer,
    object::id(&reserve),
    size::size(SIZE),
    &clock,
    test.ctx(),
  );
  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = american::EInvalidAccountOwner)]
fun exercise_requires_the_holders_signature() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let seller_id = object::id(&seller);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  american::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  american::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);
  margin::keep(buyer, test.ctx());

  test.next_tx(BOB);
  clock.set_for_testing(5_000);
  let taken_buyer = take_from_address<MarginAccount>(&test, ALICE);
  american::exercise(
    &mut market,
    &taken_buyer,
    seller_id,
    size::size(SIZE),
    &clock,
    test.ctx(),
  );
  return_to_address(ALICE, taken_buyer);
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test]
fun expiry_settlement_still_clears_through_the_reserve() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let seller_id = object::id(&seller);
  let reserve_id = object::id(&reserve);
  let (mut market, cap) = new_market(reserve_id, &clock, &mut test);
  american::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  american::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(EXPIRY_MS);
  american::update_underlying_price(
    &mut market,
    &cap,
    price::price(130_000_000),
    &clock,
  );
  american::bind_settlement(&mut market, &clock);
  assert_eq!(
    american::payoff_per_unit(&market).destroy_some(),
    30_000_000,
  );

  american::settle_position(&mut market, seller_id);
  american::settle_position(&mut market, buyer_id);
  assert_eq!(american::free_collateral(&market, buyer_id).value(), 100_000_000);
  assert_eq!(
    american::free_collateral(&market, seller_id).value(),
    150_000_000,
  );
  assert_eq!(american::free_collateral(&market, reserve_id).value(), 0);
  assert_eq!(american::total_collateral(&market).value(), 250_000_000);

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

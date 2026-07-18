#[test_only]
module options::european_tests;

use nth::margin::{Self, MarginAccount};
use nth::order;
use nth::position;
use options::european::{Self, EuropeanMarket};
use options::oracle::PriceCap;
use sui::clock::{Self, Clock};
use sui::coin;
use sui::test_scenario::{Self, Scenario};
use units::price;
use units::size;
use units::usdc_amount;
use usdc::usdc::USDC;

const ALICE: address = @0xA11CE;

const STRIKE: u64 = 100_000_000;
const PAYOUT_CAP: u64 = 50_000_000;
const EXPIRY_MS: u64 = 10_000;
const PREMIUM: u64 = 5_000_000;
const SIZE: u64 = 2_000_000;

#[error]
const EUnexpectedValue: vector<u8> = b"european option value did not match";

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
): (EuropeanMarket, PriceCap) {
  european::new(
    price::price(STRIKE),
    EXPIRY_MS,
    price::price(PAYOUT_CAP),
    price::price(STRIKE),
    reserve_id,
    clock,
    test.ctx(),
  )
}

/// Cross a seller ask and a buyer bid at `PREMIUM` for `SIZE`: the buyer
/// ends long, the seller short with the full escrow.
fun open_option_pair(
  market: &mut EuropeanMarket,
  buyer: &MarginAccount,
  seller: &MarginAccount,
  clock: &Clock,
  test: &mut Scenario,
) {
  european::place_limit_order(
    market,
    seller,
    order::ask(),
    price::price(PREMIUM),
    size::size(SIZE),
    clock,
    test.ctx(),
  );
  european::place_limit_order(
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
  market: EuropeanMarket,
  cap: PriceCap,
  clock: Clock,
  test: test_scenario::Scenario,
) {
  european::share(market);
  transfer::public_transfer(cap, ALICE);
  clock.destroy_for_testing();
  test.end();
}

#[test]
fun premium_moves_to_seller_and_escrow_backs_the_short() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let seller_id = object::id(&seller);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  european::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  european::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );

  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  assert_eq!(european::position_state(&market, buyer_id), position::long());
  assert_eq!(european::position_state(&market, seller_id), position::short());
  assert_eq!(european::position_size(&market, buyer_id).value(), SIZE);
  assert_eq!(european::position_collateral(&market, buyer_id).value(), 0);
  assert_eq!(
    european::position_collateral(&market, seller_id).value(),
    100_000_000,
  );
  assert_eq!(european::free_collateral(&market, buyer_id).value(), 40_000_000);
  assert_eq!(
    european::free_collateral(&market, seller_id).value(),
    110_000_000,
  );
  assert_eq!(european::total_collateral(&market).value(), 250_000_000);

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = european::EExpired)]
fun expired_option_rejects_new_orders() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut account = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  european::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  clock.set_for_testing(EXPIRY_MS);

  european::place_limit_order(
    &mut market,
    &account,
    order::ask(),
    price::price(PREMIUM),
    size::size(SIZE),
    &clock,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test]
fun settlement_binds_the_clamped_intrinsic_value_at_expiry() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let reserve = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);

  clock.set_for_testing(EXPIRY_MS);
  european::update_underlying_price(
    &mut market,
    &cap,
    price::price(130_000_000),
    &clock,
  );
  european::bind_settlement(&mut market, &clock);

  assert_eq!(european::is_terminal(&market), true);
  assert_eq!(
    european::payoff_per_unit(&market).destroy_some(),
    30_000_000,
  );

  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test]
fun deep_itm_payoff_clamps_at_the_cap() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let reserve = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);

  clock.set_for_testing(EXPIRY_MS);
  european::update_underlying_price(
    &mut market,
    &cap,
    price::price(300_000_000),
    &clock,
  );
  european::bind_settlement(&mut market, &clock);

  assert_eq!(
    european::payoff_per_unit(&market).destroy_some(),
    PAYOUT_CAP,
  );

  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = european::ENotExpired)]
fun settlement_cannot_bind_before_expiry() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let reserve = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);

  european::bind_settlement(&mut market, &clock);
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = european::EStaleUnderlyingPrice)]
fun settlement_cannot_bind_from_a_stale_price() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let reserve = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);

  clock.set_for_testing(80_000);
  european::bind_settlement(&mut market, &clock);
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = nth::instrument_market::EAlreadyTerminal)]
fun settlement_binds_exactly_once() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let reserve = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);

  clock.set_for_testing(EXPIRY_MS);
  european::update_underlying_price(
    &mut market,
    &cap,
    price::price(130_000_000),
    &clock,
  );
  european::bind_settlement(&mut market, &clock);

  european::bind_settlement(&mut market, &clock);
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test]
fun itm_settlement_clears_through_the_reserve() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let seller_id = object::id(&seller);
  let reserve_id = object::id(&reserve);
  let (mut market, cap) = new_market(reserve_id, &clock, &mut test);
  european::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  european::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(EXPIRY_MS);
  european::update_underlying_price(
    &mut market,
    &cap,
    price::price(130_000_000),
    &clock,
  );
  european::bind_settlement(&mut market, &clock);

  european::settle_position(&mut market, seller_id);
  assert_eq!(european::free_collateral(&market, reserve_id).value(), 60_000_000);
  assert_eq!(
    european::free_collateral(&market, seller_id).value(),
    150_000_000,
  );
  assert_eq!(european::position_collateral(&market, seller_id).value(), 0);
  assert_eq!(european::has_position(&market, seller_id), false);

  european::settle_position(&mut market, buyer_id);
  assert_eq!(european::free_collateral(&market, reserve_id).value(), 0);
  assert_eq!(
    european::free_collateral(&market, buyer_id).value(),
    100_000_000,
  );
  assert_eq!(european::has_position(&market, buyer_id), false);
  assert_eq!(european::total_collateral(&market).value(), 250_000_000);

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = nth::collateral::EInsufficientFreeCollateral)]
fun long_cannot_draw_before_shorts_pay_in() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  european::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  european::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(EXPIRY_MS);
  european::update_underlying_price(
    &mut market,
    &cap,
    price::price(130_000_000),
    &clock,
  );
  european::bind_settlement(&mut market, &clock);

  european::settle_position(&mut market, buyer_id);
  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test]
fun otm_settlement_returns_the_escrow_without_a_payoff() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let seller_id = object::id(&seller);
  let reserve_id = object::id(&reserve);
  let (mut market, cap) = new_market(reserve_id, &clock, &mut test);
  european::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  european::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(EXPIRY_MS);
  european::update_underlying_price(
    &mut market,
    &cap,
    price::price(90_000_000),
    &clock,
  );
  european::bind_settlement(&mut market, &clock);

  european::settle_position(&mut market, seller_id);
  european::settle_position(&mut market, buyer_id);
  assert_eq!(
    european::free_collateral(&market, seller_id).value(),
    210_000_000,
  );
  assert_eq!(european::free_collateral(&market, buyer_id).value(), 40_000_000);
  assert_eq!(european::free_collateral(&market, reserve_id).value(), 0);

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = european::ENotBound)]
fun positions_cannot_settle_before_binding() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let account = funded_account(&mut test, 1_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);

  european::settle_position(&mut market, object::id(&account));
  margin::keep(account, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = nth::instrument_market::ENothingToSettle)]
fun settlement_applies_once_per_account() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 50_000_000);
  let mut seller = funded_account(&mut test, 200_000_000);
  let reserve = funded_account(&mut test, 1_000_000);
  let seller_id = object::id(&seller);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  european::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(50_000_000),
    test.ctx(),
  );
  european::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(200_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &clock, &mut test);

  clock.set_for_testing(EXPIRY_MS);
  european::update_underlying_price(
    &mut market,
    &cap,
    price::price(130_000_000),
    &clock,
  );
  european::bind_settlement(&mut market, &clock);
  european::settle_position(&mut market, seller_id);

  european::settle_position(&mut market, seller_id);
  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  finish(market, cap, clock, test);
}

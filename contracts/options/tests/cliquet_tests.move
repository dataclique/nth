#[test_only]
module options::cliquet_tests;

use nth::margin::{Self, MarginAccount};
use nth::order;
use nth::position;
use options::cliquet::{Self, CliquetMarket};
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
const LOCAL_CAP: u64 = 20_000_000;
const PERIODS: u64 = 3;
const INTERVAL_MS: u64 = 1_000;
const PREMIUM: u64 = 5_000_000;
const SIZE: u64 = 2_000_000;

#[error]
const EUnexpectedValue: vector<u8> = b"cliquet value did not match";

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
): (CliquetMarket, PriceCap) {
  cliquet::new(
    price::price(STRIKE),
    price::price(LOCAL_CAP),
    PERIODS,
    INTERVAL_MS,
    price::price(STRIKE),
    reserve_id,
    reserve_id,
    usdc_amount::usdc(1_000_000),
    clock,
    test.ctx(),
  )
}

fun open_option_pair(
  market: &mut CliquetMarket,
  buyer: &MarginAccount,
  seller: &MarginAccount,
  test: &mut Scenario,
) {
  cliquet::place_limit_order(
    market,
    seller,
    order::ask(),
    price::price(PREMIUM),
    size::size(SIZE),
    test.ctx(),
  );
  cliquet::place_limit_order(
    market,
    buyer,
    order::bid(),
    price::price(PREMIUM),
    size::size(SIZE),
    test.ctx(),
  );
}

/// Run one reset round at `timestamp` after moving the underlying there.
fun reset_at(
  market: &mut CliquetMarket,
  cap: &PriceCap,
  period: u64,
  timestamp: u64,
  underlying: u64,
  reward: u64,
  keeper: &MarginAccount,
  clock: &mut Clock,
  test: &mut Scenario,
) {
  clock.set_for_testing(timestamp);
  cliquet::update_underlying_price(
    market,
    cap,
    price::price(underlying),
    clock,
  );
  cliquet::settle_reset_round(
    market,
    period,
    usdc_amount::usdc(reward),
    keeper,
    clock,
    test.ctx(),
  );
}

fun finish(
  market: CliquetMarket,
  cap: PriceCap,
  clock: Clock,
  test: test_scenario::Scenario,
) {
  cliquet::share(market);
  transfer::public_transfer(cap, ALICE);
  clock.destroy_for_testing();
  test.end();
}

#[test]
fun resets_lock_gains_and_ratchet_the_strike() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut reserve = funded_account(&mut test, 10_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let reserve_id = object::id(&reserve);
  let keeper_id = object::id(&keeper);
  let (mut market, cap) = new_market(reserve_id, &clock, &mut test);
  cliquet::deposit_collateral(
    &mut market,
    &mut reserve,
    usdc_amount::usdc(10_000_000),
    test.ctx(),
  );

  reset_at(
    &mut market,
    &cap,
    1,
    1_000,
    130_000_000,
    1_000_000,
    &keeper,
    &mut clock,
    &mut test,
  );
  assert_eq!(cliquet::accrued_payoff_per_unit(&market), LOCAL_CAP);
  assert_eq!(cliquet::strike(&market).value(), 130_000_000);
  assert_eq!(cliquet::locked_periods(&market), 1);
  assert_eq!(cliquet::free_collateral(&market, keeper_id).value(), 1_000_000);
  assert_eq!(cliquet::free_collateral(&market, reserve_id).value(), 9_000_000);

  reset_at(
    &mut market,
    &cap,
    2,
    2_000,
    120_000_000,
    0,
    &keeper,
    &mut clock,
    &mut test,
  );
  assert_eq!(cliquet::accrued_payoff_per_unit(&market), LOCAL_CAP);
  assert_eq!(cliquet::strike(&market).value(), 120_000_000);

  reset_at(
    &mut market,
    &cap,
    3,
    3_000,
    135_000_000,
    0,
    &keeper,
    &mut clock,
    &mut test,
  );
  assert_eq!(cliquet::accrued_payoff_per_unit(&market), 35_000_000);
  assert_eq!(cliquet::strike(&market).value(), 135_000_000);
  assert_eq!(cliquet::locked_periods(&market), 3);

  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = nth::maintenance::EPeriodNotNext)]
fun reset_periods_apply_sequentially_once() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let reserve = funded_account(&mut test, 10_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);

  reset_at(
    &mut market,
    &cap,
    1,
    1_000,
    130_000_000,
    0,
    &keeper,
    &mut clock,
    &mut test,
  );
  reset_at(
    &mut market,
    &cap,
    1,
    2_000,
    130_000_000,
    0,
    &keeper,
    &mut clock,
    &mut test,
  );
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = cliquet::EStaleUnderlyingPrice)]
fun resets_require_a_fresh_underlying_price() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let reserve = funded_account(&mut test, 10_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);

  clock.set_for_testing(70_000);
  cliquet::settle_reset_round(
    &mut market,
    1,
    usdc_amount::usdc(0),
    &keeper,
    &clock,
    test.ctx(),
  );
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = cliquet::EResetScheduleComplete)]
fun resets_beyond_the_schedule_abort() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let reserve = funded_account(&mut test, 10_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  reset_at(&mut market, &cap, 1, 1_000, 110_000_000, 0, &keeper, &mut clock, &mut test);
  reset_at(&mut market, &cap, 2, 2_000, 110_000_000, 0, &keeper, &mut clock, &mut test);
  reset_at(&mut market, &cap, 3, 3_000, 110_000_000, 0, &keeper, &mut clock, &mut test);

  reset_at(&mut market, &cap, 4, 4_000, 110_000_000, 0, &keeper, &mut clock, &mut test);
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, cap, clock, test);
}

#[test, expected_failure(abort_code = cliquet::EResetsNotComplete)]
fun settlement_binds_only_after_the_final_reset() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let reserve = funded_account(&mut test, 10_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let (mut market, cap) = new_market(object::id(&reserve), &clock, &mut test);
  reset_at(&mut market, &cap, 1, 1_000, 110_000_000, 0, &keeper, &mut clock, &mut test);
  reset_at(&mut market, &cap, 2, 2_000, 110_000_000, 0, &keeper, &mut clock, &mut test);

  cliquet::bind_settlement(&mut market);
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, cap, clock, test);
}

#[test]
fun settlement_pays_the_accrued_ratchet_through_the_reserve() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut buyer = funded_account(&mut test, 100_000_000);
  let mut seller = funded_account(&mut test, 500_000_000);
  let reserve = funded_account(&mut test, 10_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let seller_id = object::id(&seller);
  let reserve_id = object::id(&reserve);
  let (mut market, cap) = new_market(reserve_id, &clock, &mut test);
  cliquet::deposit_collateral(
    &mut market,
    &mut buyer,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );
  cliquet::deposit_collateral(
    &mut market,
    &mut seller,
    usdc_amount::usdc(500_000_000),
    test.ctx(),
  );
  open_option_pair(&mut market, &buyer, &seller, &mut test);
  assert_eq!(
    cliquet::position_collateral(&market, seller_id).value(),
    120_000_000,
  );
  assert_eq!(cliquet::free_collateral(&market, seller_id).value(), 390_000_000);
  assert_eq!(cliquet::free_collateral(&market, buyer_id).value(), 90_000_000);

  reset_at(&mut market, &cap, 1, 1_000, 130_000_000, 0, &keeper, &mut clock, &mut test);
  reset_at(&mut market, &cap, 2, 2_000, 120_000_000, 0, &keeper, &mut clock, &mut test);
  reset_at(&mut market, &cap, 3, 3_000, 135_000_000, 0, &keeper, &mut clock, &mut test);
  cliquet::bind_settlement(&mut market);
  assert_eq!(cliquet::payoff_per_unit(&market).destroy_some(), 35_000_000);

  cliquet::settle_position(&mut market, seller_id);
  assert_eq!(cliquet::free_collateral(&market, reserve_id).value(), 70_000_000);
  assert_eq!(cliquet::free_collateral(&market, seller_id).value(), 440_000_000);
  assert_eq!(cliquet::has_position(&market, seller_id), false);

  cliquet::settle_position(&mut market, buyer_id);
  assert_eq!(cliquet::free_collateral(&market, reserve_id).value(), 0);
  assert_eq!(cliquet::free_collateral(&market, buyer_id).value(), 160_000_000);
  assert_eq!(cliquet::total_collateral(&market).value(), 600_000_000);

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, cap, clock, test);
}

#[test_only]
module perpetual::perp_tests;

use nth::margin::{Self, MarginAccount};
use nth::order;
use nth::position;
use perpetual::perp::{Self, PerpMarket};
use sui::clock::{Self, Clock};
use sui::coin;
use sui::test_scenario::{Self, Scenario};
use units::leverage;
use units::maintenance_margin_rate;
use units::price;
use units::size;
use units::usdc_amount;
use usdc::usdc::USDC;

const ALICE: address = @0xA11CE;

/// 100 USDC per unit at the shared `10^6` scale.
const MARK: u64 = 100_000_000;

#[error]
const EUnexpectedValue: vector<u8> = b"perp value did not match";

macro fun assert_eq<$T: drop>($left: $T, $right: $T) {
  assert!($left == $right, EUnexpectedValue);
}

fun funded_account(test: &mut Scenario, amount: u64): MarginAccount {
  margin::new_with_deposit(
    coin::mint_for_testing<USDC>(amount, test.ctx()),
    test.ctx(),
  )
}

fun market_at_mark(test: &mut Scenario, clock: &Clock): PerpMarket {
  let (market, cap) = perp::new(
    price::price(MARK),
    maintenance_margin_rate::maintenance_margin_rate(25),
    clock,
    test.ctx(),
  );
  transfer::public_transfer(cap, ALICE);
  market
}

fun deposit(
  market: &mut PerpMarket,
  account: &mut MarginAccount,
  amount: u64,
  test: &mut Scenario,
) {
  perp::deposit_collateral(
    market,
    account,
    usdc_amount::usdc(amount),
    test.ctx(),
  );
}

fun finish(
  market: PerpMarket,
  clock: Clock,
  test: test_scenario::Scenario,
) {
  perp::share(market);
  clock.destroy_for_testing();
  test.end();
}

#[test]
fun initial_margin_reserves_and_consumes_at_each_partys_leverage() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut maker = funded_account(&mut test, 200_000_000);
  let mut taker = funded_account(&mut test, 200_000_000);
  let maker_id = object::id(&maker);
  let taker_id = object::id(&taker);
  deposit(&mut market, &mut maker, 200_000_000, &mut test);
  deposit(&mut market, &mut taker, 200_000_000, &mut test);

  perp::place_limit_order(
    &mut market,
    &maker,
    order::ask(),
    price::price(MARK),
    size::size(2_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  assert_eq!(perp::free_collateral(&market, maker_id).value(), 100_000_000);
  assert_eq!(perp::ask_count(&market), 1);

  perp::place_limit_order(
    &mut market,
    &taker,
    order::bid(),
    price::price(MARK),
    size::size(2_000_000),
    leverage::leverage(4_000_000),
    test.ctx(),
  );

  assert_eq!(perp::position_state(&market, maker_id), position::short());
  assert_eq!(perp::position_state(&market, taker_id), position::long());
  assert_eq!(perp::position_size(&market, maker_id).value(), 2_000_000);
  assert_eq!(perp::position_size(&market, taker_id).value(), 2_000_000);
  assert_eq!(
    perp::position_collateral(&market, maker_id).value(),
    100_000_000,
  );
  assert_eq!(
    perp::position_collateral(&market, taker_id).value(),
    50_000_000,
  );
  assert_eq!(perp::free_collateral(&market, maker_id).value(), 100_000_000);
  assert_eq!(perp::free_collateral(&market, taker_id).value(), 150_000_000);
  assert_eq!(perp::total_collateral(&market).value(), 400_000_000);
  assert_eq!(perp::entry_price(&market, maker_id).value(), MARK);
  assert_eq!(perp::entry_price(&market, taker_id).value(), MARK);

  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perp::EInvalidLeverage)]
fun zero_leverage_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut account = funded_account(&mut test, 200_000_000);
  deposit(&mut market, &mut account, 200_000_000, &mut test);

  perp::place_limit_order(
    &mut market,
    &account,
    order::bid(),
    price::price(MARK),
    size::size(2_000_000),
    leverage::leverage(0),
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perp::EInvalidLeverage)]
fun leverage_above_max_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut account = funded_account(&mut test, 200_000_000);
  deposit(&mut market, &mut account, 200_000_000, &mut test);

  perp::place_limit_order(
    &mut market,
    &account,
    order::bid(),
    price::price(MARK),
    size::size(2_000_000),
    leverage::leverage(4_000_001),
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perp::EZeroMargin)]
fun dust_notional_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut account = funded_account(&mut test, 200_000_000);
  deposit(&mut market, &mut account, 200_000_000, &mut test);

  perp::place_limit_order(
    &mut market,
    &account,
    order::bid(),
    price::price(100),
    size::size(2),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  finish(market, clock, test);
}

#[test]
fun partial_fill_consumes_pro_rata_and_cancel_refunds_remainder() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut maker = funded_account(&mut test, 200_000_000);
  let mut taker = funded_account(&mut test, 200_000_000);
  let maker_id = object::id(&maker);
  let taker_id = object::id(&taker);
  deposit(&mut market, &mut maker, 200_000_000, &mut test);
  deposit(&mut market, &mut taker, 200_000_000, &mut test);

  perp::place_limit_order(
    &mut market,
    &maker,
    order::ask(),
    price::price(MARK),
    size::size(4_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  assert_eq!(perp::free_collateral(&market, maker_id).value(), 0);

  perp::place_limit_order(
    &mut market,
    &taker,
    order::bid(),
    price::price(MARK),
    size::size(2_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  assert_eq!(
    perp::position_collateral(&market, maker_id).value(),
    100_000_000,
  );
  assert_eq!(
    perp::position_collateral(&market, taker_id).value(),
    100_000_000,
  );
  assert_eq!(perp::free_collateral(&market, taker_id).value(), 100_000_000);
  assert_eq!(perp::free_collateral(&market, maker_id).value(), 0);

  perp::cancel_order(
    &mut market,
    &maker,
    order::ask(),
    order::order_id(1),
    test.ctx(),
  );
  assert_eq!(perp::free_collateral(&market, maker_id).value(), 100_000_000);
  assert_eq!(perp::ask_count(&market), 0);

  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  finish(market, clock, test);
}

#[test]
fun mark_price_updates_through_the_markets_own_cap() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  clock.set_for_testing(5_000);
  let (mut market, cap) = perp::new(
    price::price(MARK),
    maintenance_margin_rate::maintenance_margin_rate(25),
    &clock,
    test.ctx(),
  );

  clock.set_for_testing(9_000);
  perp::update_mark_price(
    &mut market,
    &cap,
    price::price(120_000_000),
    &clock,
  );
  assert_eq!(perp::mark_price(&market).value(), 120_000_000);
  assert_eq!(perp::mark_price_updated_ms(&market), 9_000);

  transfer::public_transfer(cap, ALICE);
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perp::EWrongPriceCap)]
fun foreign_price_cap_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let (other_market, other_cap) = perp::new(
    price::price(MARK),
    maintenance_margin_rate::maintenance_margin_rate(25),
    &clock,
    test.ctx(),
  );

  perp::update_mark_price(
    &mut market,
    &other_cap,
    price::price(120_000_000),
    &clock,
  );
  transfer::public_transfer(other_cap, ALICE);
  perp::share(other_market);
  finish(market, clock, test);
}

#[test]
fun entry_price_averages_across_fills() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut maker = funded_account(&mut test, 200_000_000);
  let mut taker = funded_account(&mut test, 200_000_000);
  let maker_id = object::id(&maker);
  let taker_id = object::id(&taker);
  deposit(&mut market, &mut maker, 200_000_000, &mut test);
  deposit(&mut market, &mut taker, 200_000_000, &mut test);

  perp::place_limit_order(
    &mut market,
    &maker,
    order::ask(),
    price::price(100_000_000),
    size::size(1_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  perp::place_limit_order(
    &mut market,
    &maker,
    order::ask(),
    price::price(110_000_000),
    size::size(1_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  perp::place_limit_order(
    &mut market,
    &taker,
    order::bid(),
    price::price(110_000_000),
    size::size(2_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );

  assert_eq!(perp::entry_price(&market, maker_id).value(), 105_000_000);
  assert_eq!(perp::entry_price(&market, taker_id).value(), 105_000_000);
  assert_eq!(perp::position_size(&market, maker_id).value(), 2_000_000);
  assert_eq!(perp::position_size(&market, taker_id).value(), 2_000_000);

  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  finish(market, clock, test);
}

#[test]
fun reduction_preserves_entry_and_a_flip_resets_it() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut buyer = funded_account(&mut test, 500_000_000);
  let mut seller = funded_account(&mut test, 500_000_000);
  let buyer_id = object::id(&buyer);
  let seller_id = object::id(&seller);
  deposit(&mut market, &mut buyer, 500_000_000, &mut test);
  deposit(&mut market, &mut seller, 500_000_000, &mut test);

  perp::place_limit_order(
    &mut market,
    &seller,
    order::ask(),
    price::price(100_000_000),
    size::size(2_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  perp::place_limit_order(
    &mut market,
    &buyer,
    order::bid(),
    price::price(100_000_000),
    size::size(2_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  assert_eq!(perp::entry_price(&market, buyer_id).value(), 100_000_000);
  assert_eq!(perp::entry_price(&market, seller_id).value(), 100_000_000);

  perp::place_limit_order(
    &mut market,
    &seller,
    order::bid(),
    price::price(120_000_000),
    size::size(1_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  perp::place_limit_order(
    &mut market,
    &buyer,
    order::ask(),
    price::price(120_000_000),
    size::size(1_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  assert_eq!(perp::position_state(&market, buyer_id), position::long());
  assert_eq!(perp::position_size(&market, buyer_id).value(), 1_000_000);
  assert_eq!(perp::entry_price(&market, buyer_id).value(), 100_000_000);
  assert_eq!(perp::position_state(&market, seller_id), position::short());
  assert_eq!(perp::position_size(&market, seller_id).value(), 1_000_000);
  assert_eq!(perp::entry_price(&market, seller_id).value(), 100_000_000);

  perp::place_limit_order(
    &mut market,
    &seller,
    order::bid(),
    price::price(120_000_000),
    size::size(2_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  perp::place_limit_order(
    &mut market,
    &buyer,
    order::ask(),
    price::price(120_000_000),
    size::size(2_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  assert_eq!(perp::position_state(&market, buyer_id), position::short());
  assert_eq!(perp::position_size(&market, buyer_id).value(), 1_000_000);
  assert_eq!(perp::entry_price(&market, buyer_id).value(), 120_000_000);
  assert_eq!(perp::position_state(&market, seller_id), position::long());
  assert_eq!(perp::position_size(&market, seller_id).value(), 1_000_000);
  assert_eq!(perp::entry_price(&market, seller_id).value(), 120_000_000);

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  finish(market, clock, test);
}

/// Open a 2.0-unit position pair at the mark: `buyer` long, `seller`
/// short, both at 2x leverage with 100 USDC of position collateral each.
fun open_position_pair(
  market: &mut PerpMarket,
  buyer: &MarginAccount,
  seller: &MarginAccount,
  test: &mut Scenario,
) {
  perp::place_limit_order(
    market,
    seller,
    order::ask(),
    price::price(MARK),
    size::size(2_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  perp::place_limit_order(
    market,
    buyer,
    order::bid(),
    price::price(MARK),
    size::size(2_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
}

/// Rest a non-crossing bid at 99 and ask at 103 so the book mid (101)
/// diverges 100 bps above the mark (100): longs pay at the capped rate.
fun rest_divergent_book(
  market: &mut PerpMarket,
  buyer: &MarginAccount,
  seller: &MarginAccount,
  test: &mut Scenario,
) {
  perp::place_limit_order(
    market,
    buyer,
    order::bid(),
    price::price(99_000_000),
    size::size(1_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
  perp::place_limit_order(
    market,
    seller,
    order::ask(),
    price::price(103_000_000),
    size::size(1_000_000),
    leverage::leverage(2_000_000),
    test.ctx(),
  );
}

#[test]
fun funding_round_advances_the_paying_index_and_pays_the_keeper() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut buyer = funded_account(&mut test, 500_000_000);
  let mut seller = funded_account(&mut test, 500_000_000);
  let mut reserve = funded_account(&mut test, 200_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let reserve_id = object::id(&reserve);
  let keeper_id = object::id(&keeper);
  deposit(&mut market, &mut buyer, 500_000_000, &mut test);
  deposit(&mut market, &mut seller, 500_000_000, &mut test);
  deposit(&mut market, &mut reserve, 200_000_000, &mut test);
  open_position_pair(&mut market, &buyer, &seller, &mut test);
  rest_divergent_book(&mut market, &buyer, &seller, &mut test);

  perp::register_funding(
    &mut market,
    1_000,
    reserve_id,
    usdc_amount::usdc(500_000),
    &clock,
  );
  clock.set_for_testing(1_000);
  perp::settle_funding_round(
    &mut market,
    1,
    usdc_amount::usdc(500_000),
    &keeper,
    &clock,
    test.ctx(),
  );

  assert_eq!(perp::long_pays_index(&market), 10_000_000_000);
  assert_eq!(perp::short_pays_index(&market), 0);
  assert_eq!(perp::funding_last_period(&market), 1);
  assert_eq!(perp::free_collateral(&market, keeper_id).value(), 500_000);
  assert_eq!(
    perp::free_collateral(&market, reserve_id).value(),
    199_500_000,
  );

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, clock, test);
}

#[test]
fun account_funding_settles_through_the_reserve() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut buyer = funded_account(&mut test, 500_000_000);
  let mut seller = funded_account(&mut test, 500_000_000);
  let mut reserve = funded_account(&mut test, 200_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let seller_id = object::id(&seller);
  let reserve_id = object::id(&reserve);
  deposit(&mut market, &mut buyer, 500_000_000, &mut test);
  deposit(&mut market, &mut seller, 500_000_000, &mut test);
  deposit(&mut market, &mut reserve, 200_000_000, &mut test);
  open_position_pair(&mut market, &buyer, &seller, &mut test);
  rest_divergent_book(&mut market, &buyer, &seller, &mut test);
  perp::register_funding(
    &mut market,
    1_000,
    reserve_id,
    usdc_amount::usdc(0),
    &clock,
  );
  clock.set_for_testing(1_000);
  perp::settle_funding_round(
    &mut market,
    1,
    usdc_amount::usdc(0),
    &keeper,
    &clock,
    test.ctx(),
  );

  perp::settle_account_funding(&mut market, buyer_id);
  assert_eq!(
    perp::position_collateral(&market, buyer_id).value(),
    98_000_000,
  );
  assert_eq!(
    perp::free_collateral(&market, reserve_id).value(),
    202_000_000,
  );
  assert_eq!(perp::funding_payable(&market, buyer_id), 0);

  perp::settle_account_funding(&mut market, seller_id);
  assert_eq!(
    perp::position_collateral(&market, seller_id).value(),
    102_000_000,
  );
  assert_eq!(
    perp::free_collateral(&market, reserve_id).value(),
    200_000_000,
  );
  assert_eq!(perp::funding_receivable(&market, seller_id), 0);
  assert_eq!(perp::total_collateral(&market).value(), 1_200_000_000);

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, clock, test);
}

#[test]
fun funding_payment_caps_at_the_payers_position_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut buyer = funded_account(&mut test, 500_000_000);
  let mut seller = funded_account(&mut test, 500_000_000);
  let mut reserve = funded_account(&mut test, 200_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let seller_id = object::id(&seller);
  let reserve_id = object::id(&reserve);
  deposit(&mut market, &mut buyer, 500_000_000, &mut test);
  deposit(&mut market, &mut seller, 500_000_000, &mut test);
  deposit(&mut market, &mut reserve, 200_000_000, &mut test);
  open_position_pair(&mut market, &buyer, &seller, &mut test);
  rest_divergent_book(&mut market, &buyer, &seller, &mut test);
  perp::register_funding(
    &mut market,
    1_000,
    reserve_id,
    usdc_amount::usdc(0),
    &clock,
  );

  let mut period = 1;
  while (period <= 60) {
    clock.set_for_testing(period * 1_000);
    perp::settle_funding_round(
      &mut market,
      period,
      usdc_amount::usdc(0),
      &keeper,
      &clock,
      test.ctx(),
    );
    period = period + 1;
  };

  assert_eq!(perp::funding_payable(&market, buyer_id), 0);
  perp::settle_account_funding(&mut market, buyer_id);
  assert_eq!(perp::position_collateral(&market, buyer_id).value(), 0);
  assert_eq!(
    perp::free_collateral(&market, reserve_id).value(),
    300_000_000,
  );

  perp::settle_account_funding(&mut market, seller_id);
  assert_eq!(
    perp::position_collateral(&market, seller_id).value(),
    220_000_000,
  );
  assert_eq!(
    perp::free_collateral(&market, reserve_id).value(),
    180_000_000,
  );

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = nth::maintenance::EPeriodNotDue)]
fun funding_round_before_its_wall_clock_start_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut reserve = funded_account(&mut test, 200_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let reserve_id = object::id(&reserve);
  deposit(&mut market, &mut reserve, 200_000_000, &mut test);
  perp::register_funding(
    &mut market,
    1_000,
    reserve_id,
    usdc_amount::usdc(0),
    &clock,
  );

  perp::settle_funding_round(
    &mut market,
    1,
    usdc_amount::usdc(0),
    &keeper,
    &clock,
    test.ctx(),
  );
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = nth::maintenance::EPeriodNotNext)]
fun duplicate_funding_period_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut reserve = funded_account(&mut test, 200_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let reserve_id = object::id(&reserve);
  deposit(&mut market, &mut reserve, 200_000_000, &mut test);
  perp::register_funding(
    &mut market,
    1_000,
    reserve_id,
    usdc_amount::usdc(0),
    &clock,
  );
  clock.set_for_testing(2_000);
  perp::settle_funding_round(
    &mut market,
    1,
    usdc_amount::usdc(0),
    &keeper,
    &clock,
    test.ctx(),
  );

  perp::settle_funding_round(
    &mut market,
    1,
    usdc_amount::usdc(0),
    &keeper,
    &clock,
    test.ctx(),
  );
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perpetual::oracle::EStalePrice)]
fun stale_mark_price_aborts_a_funding_round() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut reserve = funded_account(&mut test, 200_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let reserve_id = object::id(&reserve);
  deposit(&mut market, &mut reserve, 200_000_000, &mut test);
  perp::register_funding(
    &mut market,
    1_000,
    reserve_id,
    usdc_amount::usdc(0),
    &clock,
  );
  clock.set_for_testing(61_000);

  perp::settle_funding_round(
    &mut market,
    1,
    usdc_amount::usdc(0),
    &keeper,
    &clock,
    test.ctx(),
  );
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perp::EFundingNotRegistered)]
fun account_funding_without_registration_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let account = funded_account(&mut test, 1_000_000);

  perp::settle_account_funding(&mut market, object::id(&account));
  margin::keep(account, test.ctx());
  finish(market, clock, test);
}

#[test]
fun liquidation_pays_the_keeper_and_releases_the_remainder() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let (mut market, cap) = perp::new(
    price::price(MARK),
    maintenance_margin_rate::maintenance_margin_rate(25),
    &clock,
    test.ctx(),
  );
  let mut buyer = funded_account(&mut test, 500_000_000);
  let mut seller = funded_account(&mut test, 500_000_000);
  let mut keeper = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  let keeper_id = object::id(&keeper);
  deposit(&mut market, &mut buyer, 500_000_000, &mut test);
  deposit(&mut market, &mut seller, 500_000_000, &mut test);
  deposit(&mut market, &mut keeper, 1_000_000, &mut test);
  open_position_pair(&mut market, &buyer, &seller, &mut test);

  clock.set_for_testing(10_000);
  perp::update_mark_price(&mut market, &cap, price::price(75_000_000), &clock);
  perp::liquidate(&mut market, buyer_id, &keeper, &clock, test.ctx());

  assert_eq!(perp::position_state(&market, buyer_id), position::flat());
  assert_eq!(perp::position_collateral(&market, buyer_id).value(), 0);
  assert_eq!(
    perp::free_collateral(&market, buyer_id).value(),
    495_000_000,
  );
  assert_eq!(
    perp::free_collateral(&market, keeper_id).value(),
    6_000_000,
  );

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(keeper, test.ctx());
  transfer::public_transfer(cap, ALICE);
  finish(market, clock, test);
}

#[test]
fun short_liquidates_at_its_upside_threshold() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let (mut market, cap) = perp::new(
    price::price(MARK),
    maintenance_margin_rate::maintenance_margin_rate(25),
    &clock,
    test.ctx(),
  );
  let mut buyer = funded_account(&mut test, 500_000_000);
  let mut seller = funded_account(&mut test, 500_000_000);
  let mut keeper = funded_account(&mut test, 1_000_000);
  let seller_id = object::id(&seller);
  deposit(&mut market, &mut buyer, 500_000_000, &mut test);
  deposit(&mut market, &mut seller, 500_000_000, &mut test);
  deposit(&mut market, &mut keeper, 1_000_000, &mut test);
  open_position_pair(&mut market, &buyer, &seller, &mut test);

  clock.set_for_testing(10_000);
  perp::update_mark_price(
    &mut market,
    &cap,
    price::price(125_000_000),
    &clock,
  );
  perp::liquidate(&mut market, seller_id, &keeper, &clock, test.ctx());

  assert_eq!(perp::position_state(&market, seller_id), position::flat());
  assert_eq!(
    perp::free_collateral(&market, seller_id).value(),
    495_000_000,
  );

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(keeper, test.ctx());
  transfer::public_transfer(cap, ALICE);
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perp::EPositionSafe)]
fun position_above_its_threshold_cannot_be_liquidated() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let (mut market, cap) = perp::new(
    price::price(MARK),
    maintenance_margin_rate::maintenance_margin_rate(25),
    &clock,
    test.ctx(),
  );
  let mut buyer = funded_account(&mut test, 500_000_000);
  let mut seller = funded_account(&mut test, 500_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  deposit(&mut market, &mut buyer, 500_000_000, &mut test);
  deposit(&mut market, &mut seller, 500_000_000, &mut test);
  open_position_pair(&mut market, &buyer, &seller, &mut test);

  clock.set_for_testing(10_000);
  perp::update_mark_price(&mut market, &cap, price::price(75_000_001), &clock);
  perp::liquidate(&mut market, buyer_id, &keeper, &clock, test.ctx());

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(keeper, test.ctx());
  transfer::public_transfer(cap, ALICE);
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perpetual::oracle::EStalePrice)]
fun liquidation_requires_a_fresh_mark_price() {
  let mut test = test_scenario::begin(ALICE);
  let mut clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let mut buyer = funded_account(&mut test, 500_000_000);
  let mut seller = funded_account(&mut test, 500_000_000);
  let keeper = funded_account(&mut test, 1_000_000);
  let buyer_id = object::id(&buyer);
  deposit(&mut market, &mut buyer, 500_000_000, &mut test);
  deposit(&mut market, &mut seller, 500_000_000, &mut test);
  open_position_pair(&mut market, &buyer, &seller, &mut test);

  clock.set_for_testing(61_000);
  perp::liquidate(&mut market, buyer_id, &keeper, &clock, test.ctx());

  margin::keep(buyer, test.ctx());
  margin::keep(seller, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perp::ENoExposure)]
fun liquidating_an_account_without_exposure_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let mut market = market_at_mark(&mut test, &clock);
  let account = funded_account(&mut test, 1_000_000);
  let keeper = funded_account(&mut test, 1_000_000);

  perp::liquidate(
    &mut market,
    object::id(&account),
    &keeper,
    &clock,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  margin::keep(keeper, test.ctx());
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perp::EInvalidMaintenanceRate)]
fun zero_maintenance_rate_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let (market, cap) = perp::new(
    price::price(MARK),
    maintenance_margin_rate::maintenance_margin_rate(0),
    &clock,
    test.ctx(),
  );
  transfer::public_transfer(cap, ALICE);
  finish(market, clock, test);
}

#[test, expected_failure(abort_code = perp::EInvalidMaintenanceRate)]
fun maintenance_rate_above_100_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let clock = clock::create_for_testing(test.ctx());
  let (market, cap) = perp::new(
    price::price(MARK),
    maintenance_margin_rate::maintenance_margin_rate(101),
    &clock,
    test.ctx(),
  );
  transfer::public_transfer(cap, ALICE);
  finish(market, clock, test);
}

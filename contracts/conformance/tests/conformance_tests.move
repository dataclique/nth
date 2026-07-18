#[test_only]
module instrument_conformance::conformance_tests;

use instrument_conformance::claim;
use instrument_conformance::expiring;
use instrument_conformance::linear;
use nth::margin;
use nth::order;
use nth::position;
use sui::coin;
use sui::test_scenario;
use units::price;
use units::size;
use units::usdc_amount;
use usdc::usdc::USDC;

const ALICE: address = @0xA11CE;

#[error]
const EUnexpectedValue: vector<u8> = b"conformance value did not match";

macro fun assert_eq<$T: drop>($left: $T, $right: $T) {
  assert!($left == $right, EUnexpectedValue);
}

#[test]
fun independent_external_instruments_share_the_same_kernel() {
  let mut test = test_scenario::begin(ALICE);
  let mut maker = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(20, test.ctx()),
    test.ctx(),
  );
  let mut taker = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(20, test.ctx()),
    test.ctx(),
  );
  let maker_id = object::id(&maker);
  let taker_id = object::id(&taker);
  let mut linear_market = linear::new(test.ctx());
  let mut expiring_market = expiring::new(test.ctx());
  linear::deposit_collateral(
    &mut linear_market,
    &mut maker,
    usdc_amount::usdc(10),
    test.ctx(),
  );
  linear::deposit_collateral(
    &mut linear_market,
    &mut taker,
    usdc_amount::usdc(10),
    test.ctx(),
  );

  let linear_ask = linear::place_limit_order(
    &mut linear_market,
    &maker,
    usdc_amount::usdc(7),
    order::ask(),
    price::price(100),
    size::size(7),
    test.ctx(),
  );
  linear::complete(&linear_market, linear_ask);
  let mut linear_bid = linear::place_limit_order(
    &mut linear_market,
    &taker,
    usdc_amount::usdc(7),
    order::bid(),
    price::price(100),
    size::size(7),
    test.ctx(),
  );
  linear::settle_next(
    &mut linear_market,
    &mut linear_bid,
    usdc_amount::usdc(7),
    usdc_amount::usdc(7),
  );
  linear::complete(&linear_market, linear_bid);

  let expiring_ask = expiring::place_limit_order(
    &mut expiring_market,
    &taker,
    usdc_amount::usdc(0),
    order::ask(),
    price::price(50),
    size::size(3),
    test.ctx(),
  );
  expiring::complete(&expiring_market, expiring_ask);
  let mut expiring_bid = expiring::place_limit_order(
    &mut expiring_market,
    &maker,
    usdc_amount::usdc(0),
    order::bid(),
    price::price(50),
    size::size(3),
    test.ctx(),
  );
  expiring::settle_next(
    &mut expiring_market,
    &mut expiring_bid,
    usdc_amount::usdc(0),
    usdc_amount::usdc(0),
  );
  expiring::complete(&expiring_market, expiring_bid);

  assert_eq!(linear::position_state(&linear_market, maker_id), position::short());
  assert_eq!(linear::position_size(&linear_market, maker_id).value(), 7);
  assert_eq!(linear::position_state(&linear_market, taker_id), position::long());
  assert_eq!(linear::position_size(&linear_market, taker_id).value(), 7);
  assert_eq!(linear::position_collateral(&linear_market, maker_id).value(), 7);
  assert_eq!(linear::position_collateral(&linear_market, taker_id).value(), 7);
  assert_eq!(linear::total_collateral(&linear_market).value(), 20);
  assert_eq!(
    expiring::position_state(&expiring_market, maker_id),
    position::long(),
  );
  assert_eq!(
    expiring::position_size(&expiring_market, maker_id).value(),
    3,
  );
  assert_eq!(
    expiring::position_state(&expiring_market, taker_id),
    position::short(),
  );
  assert_eq!(
    expiring::position_size(&expiring_market, taker_id).value(),
    3,
  );

  let resting_bid = linear::place_limit_order(
    &mut linear_market,
    &maker,
    usdc_amount::usdc(2),
    order::bid(),
    price::price(40),
    size::size(2),
    test.ctx(),
  );
  let resting_bid_id = resting_bid.order_id();
  let resting_reservation_id = resting_bid.reservation_id();
  linear::complete(&linear_market, resting_bid);
  let canceled = linear::cancel_order(
    &mut linear_market,
    &maker,
    order::bid(),
    resting_bid_id,
    test.ctx(),
  );
  assert!(
    canceled.canceled_reservation_id().eq(resting_reservation_id),
    EUnexpectedValue,
  );
  assert_eq!(canceled.canceled_remaining_size().value(), 2);
  linear::complete_cancel(&linear_market, canceled);
  assert_eq!(linear::free_collateral(&linear_market, maker_id).value(), 3);

  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  linear::share(linear_market);
  expiring::share(expiring_market);
  test.end();
}

#[test]
fun external_linear_instrument_settles_funding_through_carry() {
  let mut test = test_scenario::begin(ALICE);
  let mut short_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let mut long_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let short_id = object::id(&short_account);
  let long_id = object::id(&long_account);
  let mut market = linear::new(test.ctx());
  linear::deposit_collateral(
    &mut market,
    &mut short_account,
    usdc_amount::usdc(10),
    test.ctx(),
  );
  linear::deposit_collateral(
    &mut market,
    &mut long_account,
    usdc_amount::usdc(10),
    test.ctx(),
  );

  let ask = linear::place_limit_order(
    &mut market,
    &short_account,
    usdc_amount::usdc(8),
    order::ask(),
    price::price(100),
    size::size(8),
    test.ctx(),
  );
  linear::complete(&market, ask);
  let mut bid = linear::place_limit_order(
    &mut market,
    &long_account,
    usdc_amount::usdc(8),
    order::bid(),
    price::price(100),
    size::size(8),
    test.ctx(),
  );
  linear::settle_next(
    &mut market,
    &mut bid,
    usdc_amount::usdc(8),
    usdc_amount::usdc(8),
  );
  linear::complete(&market, bid);

  linear::settle_funding(
    &mut market,
    short_id,
    long_id,
    usdc_amount::usdc(3),
    1,
  );

  assert_eq!(linear::position_state(&market, short_id), position::short());
  assert_eq!(linear::position_size(&market, short_id).value(), 8);
  assert_eq!(linear::position_state(&market, long_id), position::long());
  assert_eq!(linear::position_size(&market, long_id).value(), 8);
  assert_eq!(linear::position_collateral(&market, short_id).value(), 5);
  assert_eq!(linear::position_collateral(&market, long_id).value(), 11);
  assert_eq!(linear::total_collateral(&market).value(), 20);

  margin::keep(short_account, test.ctx());
  margin::keep(long_account, test.ctx());
  linear::share(market);
  test.end();
}

#[test]
fun external_claim_instrument_issues_and_redeems_through_the_kernel() {
  let mut test = test_scenario::begin(ALICE);
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let account_id = object::id(&account);
  let mut market = claim::new(test.ctx());
  claim::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(10),
    test.ctx(),
  );

  claim::issue(&mut market, &account, usdc_amount::usdc(6), test.ctx());
  assert_eq!(claim::position_state(&market, account_id), position::long());
  assert_eq!(claim::position_size(&market, account_id).value(), 6);
  assert_eq!(claim::free_collateral(&market, account_id).value(), 4);
  assert_eq!(claim::position_collateral(&market, account_id).value(), 6);

  claim::redeem(&mut market, &account, usdc_amount::usdc(2), test.ctx());
  assert_eq!(claim::position_state(&market, account_id), position::long());
  assert_eq!(claim::position_size(&market, account_id).value(), 4);
  assert_eq!(claim::free_collateral(&market, account_id).value(), 6);
  assert_eq!(claim::position_collateral(&market, account_id).value(), 4);
  assert_eq!(claim::total_collateral(&market).value(), 10);

  margin::keep(account, test.ctx());
  claim::share(market);
  test.end();
}

#[test]
fun external_keeper_earns_reward_only_with_funding_state_advance() {
  let mut test = test_scenario::begin(ALICE);
  let mut short_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let mut long_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let mut reserve = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(4, test.ctx()),
    test.ctx(),
  );
  let keeper = margin::new(test.ctx());
  let short_id = object::id(&short_account);
  let long_id = object::id(&long_account);
  let reserve_id = object::id(&reserve);
  let keeper_id = object::id(&keeper);
  let mut market = linear::new(test.ctx());
  linear::deposit_collateral(
    &mut market,
    &mut short_account,
    usdc_amount::usdc(10),
    test.ctx(),
  );
  linear::deposit_collateral(
    &mut market,
    &mut long_account,
    usdc_amount::usdc(10),
    test.ctx(),
  );
  linear::deposit_collateral(
    &mut market,
    &mut reserve,
    usdc_amount::usdc(4),
    test.ctx(),
  );

  let ask = linear::place_limit_order(
    &mut market,
    &short_account,
    usdc_amount::usdc(8),
    order::ask(),
    price::price(100),
    size::size(8),
    test.ctx(),
  );
  linear::complete(&market, ask);
  let mut bid = linear::place_limit_order(
    &mut market,
    &long_account,
    usdc_amount::usdc(8),
    order::bid(),
    price::price(100),
    size::size(8),
    test.ctx(),
  );
  linear::settle_next(
    &mut market,
    &mut bid,
    usdc_amount::usdc(8),
    usdc_amount::usdc(8),
  );
  linear::complete(&market, bid);

  let mut clock = sui::clock::create_for_testing(test.ctx());
  linear::enable_funding_rewards(
    &mut market,
    1_000,
    reserve_id,
    usdc_amount::usdc(2),
    &clock,
  );
  clock.set_for_testing(1_000);
  linear::settle_funding_with_reward(
    &mut market,
    short_id,
    long_id,
    usdc_amount::usdc(3),
    1,
    usdc_amount::usdc(2),
    &keeper,
    &clock,
    test.ctx(),
  );

  assert_eq!(linear::position_size(&market, short_id).value(), 8);
  assert_eq!(linear::position_size(&market, long_id).value(), 8);
  assert_eq!(linear::position_collateral(&market, short_id).value(), 5);
  assert_eq!(linear::position_collateral(&market, long_id).value(), 11);
  assert_eq!(linear::free_collateral(&market, keeper_id).value(), 2);
  assert_eq!(linear::free_collateral(&market, reserve_id).value(), 2);
  assert_eq!(linear::total_collateral(&market).value(), 24);

  margin::keep(short_account, test.ctx());
  margin::keep(long_account, test.ctx());
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  sui::clock::destroy_for_testing(clock);
  linear::share(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::maintenance::EPeriodNotNext)]
fun duplicate_funding_round_cannot_claim_a_second_reward() {
  let mut test = test_scenario::begin(ALICE);
  let mut short_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let mut long_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let mut reserve = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(4, test.ctx()),
    test.ctx(),
  );
  let keeper = margin::new(test.ctx());
  let short_id = object::id(&short_account);
  let long_id = object::id(&long_account);
  let mut market = linear::new(test.ctx());
  linear::deposit_collateral(
    &mut market,
    &mut short_account,
    usdc_amount::usdc(10),
    test.ctx(),
  );
  linear::deposit_collateral(
    &mut market,
    &mut long_account,
    usdc_amount::usdc(10),
    test.ctx(),
  );
  linear::deposit_collateral(
    &mut market,
    &mut reserve,
    usdc_amount::usdc(4),
    test.ctx(),
  );

  let ask = linear::place_limit_order(
    &mut market,
    &short_account,
    usdc_amount::usdc(8),
    order::ask(),
    price::price(100),
    size::size(8),
    test.ctx(),
  );
  linear::complete(&market, ask);
  let mut bid = linear::place_limit_order(
    &mut market,
    &long_account,
    usdc_amount::usdc(8),
    order::bid(),
    price::price(100),
    size::size(8),
    test.ctx(),
  );
  linear::settle_next(
    &mut market,
    &mut bid,
    usdc_amount::usdc(8),
    usdc_amount::usdc(8),
  );
  linear::complete(&market, bid);

  let mut clock = sui::clock::create_for_testing(test.ctx());
  linear::enable_funding_rewards(
    &mut market,
    1_000,
    object::id(&reserve),
    usdc_amount::usdc(2),
    &clock,
  );
  clock.set_for_testing(1_000);
  linear::settle_funding_with_reward(
    &mut market,
    short_id,
    long_id,
    usdc_amount::usdc(1),
    1,
    usdc_amount::usdc(1),
    &keeper,
    &clock,
    test.ctx(),
  );
  linear::settle_funding_with_reward(
    &mut market,
    short_id,
    long_id,
    usdc_amount::usdc(1),
    1,
    usdc_amount::usdc(1),
    &keeper,
    &clock,
    test.ctx(),
  );

  margin::keep(short_account, test.ctx());
  margin::keep(long_account, test.ctx());
  margin::keep(reserve, test.ctx());
  margin::keep(keeper, test.ctx());
  sui::clock::destroy_for_testing(clock);
  linear::share(market);
  test.end();
}

/// Realistically scaled linear market: 8 units of exposure at 100 USDC, the
/// short backed by 300 USDC and the long by only 100 USDC of position
/// collateral. Maintenance margin at the 100 USDC mark is 200 USDC, so the
/// long is liquidatable and the short is safe.
fun leveraged_linear_pair(
  test: &mut test_scenario::Scenario,
): (linear::LinearMarket, nth::margin::MarginAccount, nth::margin::MarginAccount) {
  let mut short_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(300_000_000, test.ctx()),
    test.ctx(),
  );
  let mut long_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(100_000_000, test.ctx()),
    test.ctx(),
  );
  let mut market = linear::new(test.ctx());
  linear::deposit_collateral(
    &mut market,
    &mut short_account,
    usdc_amount::usdc(300_000_000),
    test.ctx(),
  );
  linear::deposit_collateral(
    &mut market,
    &mut long_account,
    usdc_amount::usdc(100_000_000),
    test.ctx(),
  );

  let ask = linear::place_limit_order(
    &mut market,
    &short_account,
    usdc_amount::usdc(300_000_000),
    order::ask(),
    price::price(100_000_000),
    size::size(8_000_000),
    test.ctx(),
  );
  linear::complete(&market, ask);
  let mut bid = linear::place_limit_order(
    &mut market,
    &long_account,
    usdc_amount::usdc(100_000_000),
    order::bid(),
    price::price(100_000_000),
    size::size(8_000_000),
    test.ctx(),
  );
  linear::settle_next(
    &mut market,
    &mut bid,
    usdc_amount::usdc(300_000_000),
    usdc_amount::usdc(100_000_000),
  );
  linear::complete(&market, bid);
  (market, long_account, short_account)
}

#[test]
fun liquidation_uses_standard_forced_close() {
  let mut test = test_scenario::begin(ALICE);
  let (mut market, long_account, short_account) =
    leveraged_linear_pair(&mut test);
  let long_id = object::id(&long_account);
  let short_id = object::id(&short_account);
  let keeper = margin::new(test.ctx());
  let keeper_id = object::id(&keeper);

  linear::liquidate(
    &mut market,
    long_id,
    price::price(100_000_000),
    keeper_id,
    usdc_amount::usdc(10_000_000),
  );

  assert_eq!(linear::position_state(&market, long_id), position::flat());
  assert_eq!(linear::position_size(&market, long_id).value(), 0);
  assert_eq!(linear::position_collateral(&market, long_id).value(), 0);
  assert_eq!(linear::free_collateral(&market, long_id).value(), 90_000_000);
  assert_eq!(linear::free_collateral(&market, keeper_id).value(), 10_000_000);
  assert_eq!(linear::position_state(&market, short_id), position::short());
  assert_eq!(
    linear::position_collateral(&market, short_id).value(),
    300_000_000,
  );
  assert_eq!(linear::total_collateral(&market).value(), 400_000_000);

  margin::keep(long_account, test.ctx());
  margin::keep(short_account, test.ctx());
  margin::keep(keeper, test.ctx());
  linear::share(market);
  test.end();
}

#[test, expected_failure(abort_code = linear::EPositionSafe)]
fun safe_position_cannot_be_forced_closed() {
  let mut test = test_scenario::begin(ALICE);
  let (mut market, long_account, short_account) =
    leveraged_linear_pair(&mut test);
  let short_id = object::id(&short_account);
  let keeper = margin::new(test.ctx());

  linear::liquidate(
    &mut market,
    short_id,
    price::price(100_000_000),
    object::id(&keeper),
    usdc_amount::usdc(10_000_000),
  );

  margin::keep(long_account, test.ctx());
  margin::keep(short_account, test.ctx());
  margin::keep(keeper, test.ctx());
  linear::share(market);
  test.end();
}

fun expired_position_pair(
  test: &mut test_scenario::Scenario,
): (
  expiring::ExpiringMarket,
  nth::margin::MarginAccount,
  nth::margin::MarginAccount,
) {
  let mut short_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let mut long_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let mut market = expiring::new(test.ctx());
  expiring::deposit_collateral(
    &mut market,
    &mut short_account,
    usdc_amount::usdc(10),
    test.ctx(),
  );
  expiring::deposit_collateral(
    &mut market,
    &mut long_account,
    usdc_amount::usdc(10),
    test.ctx(),
  );

  let ask = expiring::place_limit_order(
    &mut market,
    &short_account,
    usdc_amount::usdc(8),
    order::ask(),
    price::price(100),
    size::size(8),
    test.ctx(),
  );
  expiring::complete(&market, ask);
  let mut bid = expiring::place_limit_order(
    &mut market,
    &long_account,
    usdc_amount::usdc(2),
    order::bid(),
    price::price(100),
    size::size(8),
    test.ctx(),
  );
  expiring::settle_next(
    &mut market,
    &mut bid,
    usdc_amount::usdc(8),
    usdc_amount::usdc(2),
  );
  expiring::complete(&market, bid);
  (market, long_account, short_account)
}

#[test]
fun option_expiry_settles_long_and_short_once() {
  let mut test = test_scenario::begin(ALICE);
  let (mut market, long_account, short_account) =
    expired_position_pair(&mut test);
  let long_id = object::id(&long_account);
  let short_id = object::id(&short_account);

  expiring::terminate(&mut market, price::price(103));
  assert_eq!(expiring::is_terminal(&market), true);
  assert_eq!(expiring::expiry_value(&market).value(), 103);
  expiring::settle_pair(&mut market, long_id, short_id, usdc_amount::usdc(3));

  assert_eq!(expiring::has_position(&market, long_id), false);
  assert_eq!(expiring::has_position(&market, short_id), false);
  assert_eq!(expiring::free_collateral(&market, long_id).value(), 13);
  assert_eq!(expiring::free_collateral(&market, short_id).value(), 7);
  assert_eq!(expiring::position_collateral(&market, long_id).value(), 0);
  assert_eq!(expiring::position_collateral(&market, short_id).value(), 0);
  assert_eq!(expiring::total_collateral(&market).value(), 20);

  margin::keep(long_account, test.ctx());
  margin::keep(short_account, test.ctx());
  expiring::share(market);
  test.end();
}

#[test]
fun worthless_expiry_settles_without_a_payout() {
  let mut test = test_scenario::begin(ALICE);
  let (mut market, long_account, short_account) =
    expired_position_pair(&mut test);
  let long_id = object::id(&long_account);
  let short_id = object::id(&short_account);

  expiring::terminate(&mut market, price::price(100));
  expiring::settle_pair(&mut market, long_id, short_id, usdc_amount::usdc(0));

  assert_eq!(expiring::has_position(&market, long_id), false);
  assert_eq!(expiring::has_position(&market, short_id), false);
  assert_eq!(expiring::free_collateral(&market, long_id).value(), 10);
  assert_eq!(expiring::free_collateral(&market, short_id).value(), 10);
  assert_eq!(expiring::total_collateral(&market).value(), 20);

  margin::keep(long_account, test.ctx());
  margin::keep(short_account, test.ctx());
  expiring::share(market);
  test.end();
}

#[test, expected_failure(abort_code = expiring::EExpiryAlreadyBound)]
fun expiry_value_is_bound_once() {
  let mut test = test_scenario::begin(ALICE);
  let mut market = expiring::new(test.ctx());
  expiring::terminate(&mut market, price::price(103));
  expiring::terminate(&mut market, price::price(200));
  expiring::share(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::instrument_market::ENothingToSettle)]
fun expiry_settlement_cannot_apply_twice() {
  let mut test = test_scenario::begin(ALICE);
  let (mut market, long_account, short_account) =
    expired_position_pair(&mut test);
  let long_id = object::id(&long_account);
  let short_id = object::id(&short_account);

  expiring::terminate(&mut market, price::price(103));
  expiring::settle_pair(&mut market, long_id, short_id, usdc_amount::usdc(3));
  expiring::settle_pair(&mut market, long_id, short_id, usdc_amount::usdc(0));

  margin::keep(long_account, test.ctx());
  margin::keep(short_account, test.ctx());
  expiring::share(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::instrument_market::ETerminalMarket)]
fun settled_market_rejects_new_orders() {
  let mut test = test_scenario::begin(ALICE);
  let (mut market, long_account, short_account) =
    expired_position_pair(&mut test);

  expiring::terminate(&mut market, price::price(103));
  let obligation = expiring::place_limit_order(
    &mut market,
    &long_account,
    usdc_amount::usdc(1),
    order::bid(),
    price::price(100),
    size::size(1),
    test.ctx(),
  );
  expiring::complete(&market, obligation);

  margin::keep(long_account, test.ctx());
  margin::keep(short_account, test.ctx());
  expiring::share(market);
  test.end();
}

#[test]
fun terminal_cleanup_releases_all_reservations() {
  let mut test = test_scenario::begin(ALICE);
  let mut resting_account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(9, test.ctx()),
    test.ctx(),
  );
  let resting_id = object::id(&resting_account);
  let mut market = expiring::new(test.ctx());
  expiring::deposit_collateral(
    &mut market,
    &mut resting_account,
    usdc_amount::usdc(9),
    test.ctx(),
  );
  let bid = expiring::place_limit_order(
    &mut market,
    &resting_account,
    usdc_amount::usdc(9),
    order::bid(),
    price::price(90),
    size::size(1),
    test.ctx(),
  );
  expiring::complete(&market, bid);
  assert_eq!(expiring::free_collateral(&market, resting_id).value(), 0);

  expiring::terminate(&mut market, price::price(103));
  assert_eq!(
    expiring::cancel_terminal_orders(&mut market, order::bid(), 10),
    1,
  );
  assert_eq!(expiring::bid_count(&market), 0);
  assert_eq!(expiring::free_collateral(&market, resting_id).value(), 9);
  assert_eq!(expiring::total_collateral(&market).value(), 9);

  margin::keep(resting_account, test.ctx());
  expiring::share(market);
  test.end();
}

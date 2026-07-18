#[test_only]
module instrument_conformance::conformance_tests;

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

#[test_only]
module instrument_conformance::conformance_tests;

use instrument_conformance::expiring;
use instrument_conformance::linear;
use nth::margin;
use nth::order;
use nth::position;
use sui::test_scenario;
use units::price;
use units::size;

const ALICE: address = @0xA11CE;

#[error]
const EUnexpectedValue: vector<u8> = b"conformance value did not match";

macro fun assert_eq<$T: drop>($left: $T, $right: $T) {
  assert!($left == $right, EUnexpectedValue);
}

#[test]
fun independent_external_instruments_share_the_same_kernel() {
  let mut test = test_scenario::begin(ALICE);
  let maker = margin::new(test.ctx());
  let taker = margin::new(test.ctx());
  let maker_id = object::id(&maker);
  let taker_id = object::id(&taker);
  let mut linear_market = linear::new(test.ctx());
  let mut expiring_market = expiring::new(test.ctx());

  let linear_ask = linear::place_limit_order(
    &mut linear_market,
    &maker,
    maker_id,
    order::ask(),
    price::price(100),
    size::size(7),
    test.ctx(),
  );
  linear::complete(&linear_market, linear_ask);
  let mut linear_bid = linear::place_limit_order(
    &mut linear_market,
    &taker,
    taker_id,
    order::bid(),
    price::price(100),
    size::size(7),
    test.ctx(),
  );
  linear::settle_next(&mut linear_market, &mut linear_bid);
  linear::complete(&linear_market, linear_bid);

  let expiring_ask = expiring::place_limit_order(
    &mut expiring_market,
    &taker,
    taker_id,
    order::ask(),
    price::price(50),
    size::size(3),
    test.ctx(),
  );
  expiring::complete(&expiring_market, expiring_ask);
  let mut expiring_bid = expiring::place_limit_order(
    &mut expiring_market,
    &maker,
    maker_id,
    order::bid(),
    price::price(50),
    size::size(3),
    test.ctx(),
  );
  expiring::settle_next(&mut expiring_market, &mut expiring_bid);
  expiring::complete(&expiring_market, expiring_bid);

  assert_eq!(linear::position_state(&linear_market, maker_id), position::short());
  assert_eq!(linear::position_size(&linear_market, maker_id).value(), 7);
  assert_eq!(linear::position_state(&linear_market, taker_id), position::long());
  assert_eq!(linear::position_size(&linear_market, taker_id).value(), 7);
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
    maker_id,
    order::bid(),
    price::price(40),
    size::size(2),
    test.ctx(),
  );
  let resting_bid_id = resting_bid.order_id();
  linear::complete(&linear_market, resting_bid);
  let canceled = linear::cancel_order(
    &mut linear_market,
    &maker,
    order::bid(),
    resting_bid_id,
    test.ctx(),
  );
  assert_eq!(canceled.canceled_reservation_id(), maker_id);
  assert_eq!(canceled.canceled_remaining_size().value(), 2);
  linear::complete_cancel(&linear_market, canceled);

  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  linear::share(linear_market);
  expiring::share(expiring_market);
  test.end();
}

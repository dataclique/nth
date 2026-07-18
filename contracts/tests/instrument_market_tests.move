#[test_only]
module nth::instrument_market_tests;

use nth::instrument_market::{Self, Market};
use nth::margin::{Self, MarginAccount};
use nth::matching;
use nth::order;
use nth::position;
use std::unit_test;
use sui::test_scenario;
use units::price;
use units::size;

const ALICE: address = @0xA11CE;
const MAX_U64: u64 = 18_446_744_073_709_551_615;

#[error]
const EUnexpectedValue: vector<u8> = b"test value did not match";

/// Test-only private-construction witness for a linear instrument package.
public struct Linear has drop {
  private: bool,
}

macro fun assert_eq<$T: drop>($left: $T, $right: $T) {
  assert!($left == $right, EUnexpectedValue);
}

fun witness(): Linear {
  Linear { private: true }
}

#[test]
fun fills_update_one_net_position_per_account_and_market() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let maker = margin::new(test.ctx());
  let taker = margin::new(test.ctx());
  let maker_id = object::id(&maker);
  let taker_id = object::id(&taker);

  let ask = instrument_market::place_limit_order(
    &mut market,
    &maker,
    maker_id,
    &witness,
    order::ask(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  assert_eq!(ask.fill_count(), 0);
  assert_eq!(ask.resting_size().value(), 10);
  instrument_market::complete(&market, ask, &witness);

  let mut bid = instrument_market::place_limit_order(
    &mut market,
    &taker,
    taker_id,
    &witness,
    order::bid(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  assert_eq!(bid.fill_count(), 1);
  assert_eq!(bid.settled_fill_count(), 0);
  let fill = bid.next_fill();
  assert_eq!(fill.maker_margin_account_id(), maker_id);
  assert_eq!(fill.taker_margin_account_id(), taker_id);
  assert_eq!(fill.price().value(), 100);
  assert_eq!(fill.size().value(), 10);
  instrument_market::settle_next(&mut market, &mut bid, &witness);
  assert_eq!(bid.settled_fill_count(), 1);
  instrument_market::complete(&market, bid, &witness);

  assert_eq!(
    instrument_market::position_state(&market, maker_id),
    position::short(),
  );
  assert_eq!(
    instrument_market::position_size(&market, maker_id).value(),
    10,
  );
  assert_eq!(
    instrument_market::position_state(&market, taker_id),
    position::long(),
  );
  assert_eq!(
    instrument_market::position_size(&market, taker_id).value(),
    10,
  );
  assert_eq!(instrument_market::position_count(&market), 2);

  let taker_ask = instrument_market::place_limit_order(
    &mut market,
    &taker,
    taker_id,
    &witness,
    order::ask(),
    price::price(100),
    size::size(20),
    test.ctx(),
  );
  instrument_market::complete(&market, taker_ask, &witness);
  let mut maker_bid = instrument_market::place_limit_order(
    &mut market,
    &maker,
    maker_id,
    &witness,
    order::bid(),
    price::price(100),
    size::size(15),
    test.ctx(),
  );
  instrument_market::settle_next(&mut market, &mut maker_bid, &witness);
  instrument_market::complete(&market, maker_bid, &witness);

  assert_eq!(
    instrument_market::position_state(&market, maker_id),
    position::long(),
  );
  assert_eq!(
    instrument_market::position_size(&market, maker_id).value(),
    5,
  );
  assert_eq!(
    instrument_market::position_state(&market, taker_id),
    position::short(),
  );
  assert_eq!(
    instrument_market::position_size(&market, taker_id).value(),
    5,
  );
  assert_eq!(instrument_market::position_count(&market), 2);

  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::EIncompleteSettlement)]
fun cannot_complete_before_settling_every_fill() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let maker = margin::new(test.ctx());
  let taker = margin::new(test.ctx());

  let ask = instrument_market::place_limit_order(
    &mut market,
    &maker,
    object::id(&maker),
    &witness,
    order::ask(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::complete(&market, ask, &witness);
  let bid = instrument_market::place_limit_order(
    &mut market,
    &taker,
    object::id(&taker),
    &witness,
    order::bid(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::complete(&market, bid, &witness);
  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::EWrongMarket)]
fun obligation_cannot_settle_against_another_same_type_market() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut first = instrument_market::new(&witness, test.ctx());
  let mut second = instrument_market::new(&witness, test.ctx());
  let maker = margin::new(test.ctx());
  let taker = margin::new(test.ctx());

  let ask = instrument_market::place_limit_order(
    &mut first,
    &maker,
    object::id(&maker),
    &witness,
    order::ask(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::complete(&first, ask, &witness);
  let mut bid = instrument_market::place_limit_order(
    &mut first,
    &taker,
    object::id(&taker),
    &witness,
    order::bid(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::settle_next(&mut second, &mut bid, &witness);
  instrument_market::complete(&first, bid, &witness);
  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(first);
  transfer::public_share_object(second);
  test.end();
}

#[test, expected_failure(abort_code = matching::ESelfMatch)]
fun account_cannot_match_itself() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  let account_id = object::id(&account);

  let ask = instrument_market::place_limit_order(
    &mut market,
    &account,
    account_id,
    &witness,
    order::ask(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::complete(&market, ask, &witness);
  let obligation = instrument_market::place_limit_order(
    &mut market,
    &account,
    account_id,
    &witness,
    order::bid(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::complete(&market, obligation, &witness);
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = matching::ENoPendingFill)]
fun settled_obligation_cannot_advance_twice() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let maker = margin::new(test.ctx());
  let taker = margin::new(test.ctx());

  let ask = instrument_market::place_limit_order(
    &mut market,
    &maker,
    object::id(&maker),
    &witness,
    order::ask(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::complete(&market, ask, &witness);
  let mut bid = instrument_market::place_limit_order(
    &mut market,
    &taker,
    object::id(&taker),
    &witness,
    order::bid(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::settle_next(&mut market, &mut bid, &witness);
  instrument_market::settle_next(&mut market, &mut bid, &witness);
  instrument_market::complete(&market, bid, &witness);
  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = matching::EZeroPrice)]
fun zero_price_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  let obligation = instrument_market::place_limit_order(
    &mut market,
    &account,
    object::id(&account),
    &witness,
    order::bid(),
    price::price(0),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, obligation, &witness);
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = matching::EZeroSize)]
fun zero_size_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  let obligation = instrument_market::place_limit_order(
    &mut market,
    &account,
    object::id(&account),
    &witness,
    order::bid(),
    price::price(1),
    size::size(0),
    test.ctx(),
  );
  instrument_market::complete(&market, obligation, &witness);
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = matching::EFillLimitExceeded)]
fun fill_batch_is_explicitly_bounded() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let maker = margin::new(test.ctx());
  let taker = margin::new(test.ctx());
  let maker_id = object::id(&maker);
  let mut count = 0;
  while (count < matching::max_fills_per_order() + 1) {
    let ask = instrument_market::place_limit_order(
      &mut market,
      &maker,
      maker_id,
      &witness,
      order::ask(),
      price::price(100),
      size::size(1),
      test.ctx(),
    );
    instrument_market::complete(&market, ask, &witness);
    count = count + 1;
  };

  let mut bid = instrument_market::place_limit_order(
    &mut market,
    &taker,
    object::id(&taker),
    &witness,
    order::bid(),
    price::price(100),
    size::size(matching::max_fills_per_order() + 1),
    test.ctx(),
  );
  while (bid.has_next_fill()) {
    instrument_market::settle_next(&mut market, &mut bid, &witness);
  };
  instrument_market::complete(&market, bid, &witness);
  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = matching::EOrderLimitExceeded)]
fun each_resting_side_has_an_explicit_storage_bound() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  let account_id = object::id(&account);
  instrument_market::fill_side_to_limit_for_testing(
    &mut market,
    account_id,
    account_id,
    order::bid(),
  );

  let obligation = instrument_market::place_limit_order(
    &mut market,
    &account,
    account_id,
    &witness,
    order::bid(),
    price::price(1),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, obligation, &witness);
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = matching::EOrderNotFound)]
fun account_cannot_cancel_another_accounts_order() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let maker = margin::new(test.ctx());
  let taker = margin::new(test.ctx());

  let ask = instrument_market::place_limit_order(
    &mut market,
    &maker,
    object::id(&maker),
    &witness,
    order::ask(),
    price::price(100),
    size::size(1),
    test.ctx(),
  );
  let order_id = ask.order_id();
  instrument_market::complete(&market, ask, &witness);
  let canceled = instrument_market::cancel_order(
    &mut market,
    &taker,
    &witness,
    order::ask(),
    order_id,
    test.ctx(),
  );
  instrument_market::complete_cancel(&market, canceled, &witness);
  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::EWrongVersion)]
fun unsupported_market_version_fails_closed() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  instrument_market::set_version_for_testing(&mut market, 2);

  let obligation = instrument_market::place_limit_order(
    &mut market,
    &account,
    object::id(&account),
    &witness,
    order::bid(),
    price::price(1),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, obligation, &witness);
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = position::EZeroTradeSize)]
fun zero_position_transition_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let account = margin::new(test.ctx());
  let account_id = object::id(&account);
  let mut position = position::new<Linear>(account_id);
  position::apply_trade(
    &mut position,
    account_id,
    order::order_id(1),
    order::order_id(2),
    order::bid(),
    size::size(0),
  );
  unit_test::destroy(position);
  margin::keep(account, test.ctx());
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::EInvalidAccountOwner)]
fun foreign_sender_cannot_place_for_an_account() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);

  test.next_tx(@0xB0B);
  let mut market = test.take_shared<Market<Linear>>();
  let account = test.take_from_address<MarginAccount>(ALICE);
  let obligation = instrument_market::place_limit_order(
    &mut market,
    &account,
    object::id(&account),
    &witness,
    order::bid(),
    price::price(1),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, obligation, &witness);
  test_scenario::return_shared(market);
  margin::keep(account, test.ctx());
  test.end();
}

#[test, expected_failure(arithmetic_error, location = units::size)]
fun increasing_position_past_u64_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let maker = margin::new(test.ctx());
  let taker = margin::new(test.ctx());
  let maker_id = object::id(&maker);
  let taker_id = object::id(&taker);

  let ask = instrument_market::place_limit_order(
    &mut market,
    &maker,
    maker_id,
    &witness,
    order::ask(),
    price::price(1),
    size::size(MAX_U64),
    test.ctx(),
  );
  instrument_market::complete(&market, ask, &witness);
  let mut bid = instrument_market::place_limit_order(
    &mut market,
    &taker,
    taker_id,
    &witness,
    order::bid(),
    price::price(1),
    size::size(MAX_U64),
    test.ctx(),
  );
  instrument_market::settle_next(&mut market, &mut bid, &witness);
  instrument_market::complete(&market, bid, &witness);

  let ask = instrument_market::place_limit_order(
    &mut market,
    &maker,
    maker_id,
    &witness,
    order::ask(),
    price::price(1),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, ask, &witness);
  let mut bid = instrument_market::place_limit_order(
    &mut market,
    &taker,
    taker_id,
    &witness,
    order::bid(),
    price::price(1),
    size::size(1),
    test.ctx(),
  );
  instrument_market::settle_next(&mut market, &mut bid, &witness);
  instrument_market::complete(&market, bid, &witness);
  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun equal_price_orders_fill_in_time_priority() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let first_maker = margin::new(test.ctx());
  let second_maker = margin::new(test.ctx());
  let taker = margin::new(test.ctx());
  let first_maker_id = object::id(&first_maker);
  let second_maker_id = object::id(&second_maker);

  let first = instrument_market::place_limit_order(
    &mut market,
    &first_maker,
    first_maker_id,
    &witness,
    order::ask(),
    price::price(100),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, first, &witness);
  let second = instrument_market::place_limit_order(
    &mut market,
    &second_maker,
    second_maker_id,
    &witness,
    order::ask(),
    price::price(100),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, second, &witness);

  let mut bid = instrument_market::place_limit_order(
    &mut market,
    &taker,
    object::id(&taker),
    &witness,
    order::bid(),
    price::price(100),
    size::size(2),
    test.ctx(),
  );
  assert_eq!(bid.next_fill().maker_margin_account_id(), first_maker_id);
  instrument_market::settle_next(&mut market, &mut bid, &witness);
  assert_eq!(bid.next_fill().maker_margin_account_id(), second_maker_id);
  instrument_market::settle_next(&mut market, &mut bid, &witness);
  instrument_market::complete(&market, bid, &witness);

  margin::keep(first_maker, test.ctx());
  margin::keep(second_maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun partial_fill_cancellation_releases_only_the_remainder() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let maker = margin::new(test.ctx());
  let taker = margin::new(test.ctx());
  let maker_id = object::id(&maker);

  let ask = instrument_market::place_limit_order(
    &mut market,
    &maker,
    maker_id,
    &witness,
    order::ask(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  let ask_id = ask.order_id();
  instrument_market::complete(&market, ask, &witness);
  assert!(!instrument_market::has_position(&market, maker_id), EUnexpectedValue);

  let mut bid = instrument_market::place_limit_order(
    &mut market,
    &taker,
    object::id(&taker),
    &witness,
    order::bid(),
    price::price(100),
    size::size(4),
    test.ctx(),
  );
  instrument_market::settle_next(&mut market, &mut bid, &witness);
  instrument_market::complete(&market, bid, &witness);

  let canceled = instrument_market::cancel_order(
    &mut market,
    &maker,
    &witness,
    order::ask(),
    ask_id,
    test.ctx(),
  );
  assert_eq!(canceled.canceled_remaining_size().value(), 6);
  assert_eq!(canceled.canceled_reservation_id(), maker_id);
  instrument_market::complete_cancel(&market, canceled, &witness);
  assert_eq!(instrument_market::ask_count(&market), 0);
  assert_eq!(instrument_market::position_state(&market, maker_id), position::short());
  assert_eq!(instrument_market::position_size(&market, maker_id).value(), 4);

  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

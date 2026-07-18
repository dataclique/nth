#[test_only]
module nth::instrument_market_tests;

use nth::instrument_market::{Self, Market};
use nth::margin::{Self, MarginAccount};
use nth::matching;
use nth::order;
use nth::position;
use std::unit_test;
use sui::coin;
use sui::test_scenario;
use units::price;
use units::size;
use units::usdc_amount;
use usdc::usdc::USDC;

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
  let ask_reservation_id = ask.reservation_id();
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
  assert!(canceled.canceled_reservation_id().eq(ask_reservation_id), EUnexpectedValue);
  instrument_market::complete_cancel(&market, canceled, &witness);
  assert_eq!(instrument_market::ask_count(&market), 0);
  assert_eq!(instrument_market::position_state(&market, maker_id), position::short());
  assert_eq!(instrument_market::position_size(&market, maker_id).value(), 4);

  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun collateral_round_trip_preserves_wallet_and_market_total() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(100, test.ctx()),
    test.ctx(),
  );
  let account_id = object::id(&account);

  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(60),
    &witness,
    test.ctx(),
  );
  assert_eq!(account.balance(), 40);
  assert_eq!(instrument_market::free_collateral(&market, account_id).value(), 60);
  assert_eq!(instrument_market::total_collateral(&market).value(), 60);

  instrument_market::withdraw_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(25),
    &witness,
    test.ctx(),
  );
  assert_eq!(account.balance(), 65);
  assert_eq!(instrument_market::free_collateral(&market, account_id).value(), 35);
  assert_eq!(instrument_market::total_collateral(&market).value(), 35);

  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun order_reservation_changes_collateral_but_not_position() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(60, test.ctx()),
    test.ctx(),
  );
  let account_id = object::id(&account);
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(60),
    &witness,
    test.ctx(),
  );

  let ask = instrument_market::place_collateralized_limit_order(
    &mut market,
    &account,
    usdc_amount::usdc(30),
    &witness,
    order::ask(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  let order_id = ask.order_id();
  let reservation_id = ask.reservation_id();
  instrument_market::complete(&mut market, ask, &witness);

  assert_eq!(instrument_market::free_collateral(&market, account_id).value(), 30);
  assert_eq!(
    instrument_market::reserved_collateral(&market, reservation_id).value(),
    30,
  );
  assert!(!instrument_market::has_position(&market, account_id), EUnexpectedValue);

  let canceled = instrument_market::cancel_order(
    &mut market,
    &account,
    &witness,
    order::ask(),
    order_id,
    test.ctx(),
  );
  instrument_market::complete_cancel(&mut market, canceled, &witness);
  assert_eq!(instrument_market::free_collateral(&market, account_id).value(), 60);
  assert!(
    !instrument_market::has_reservation(&market, reservation_id),
    EUnexpectedValue,
  );

  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun fill_consumes_reservations_into_isolated_position_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut maker = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(50, test.ctx()),
    test.ctx(),
  );
  let mut taker = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(50, test.ctx()),
    test.ctx(),
  );
  let maker_id = object::id(&maker);
  let taker_id = object::id(&taker);
  instrument_market::deposit_collateral(
    &mut market,
    &mut maker,
    usdc_amount::usdc(50),
    &witness,
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut taker,
    usdc_amount::usdc(50),
    &witness,
    test.ctx(),
  );

  let ask = instrument_market::place_collateralized_limit_order(
    &mut market,
    &maker,
    usdc_amount::usdc(10),
    &witness,
    order::ask(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::complete(&mut market, ask, &witness);
  let mut bid = instrument_market::place_collateralized_limit_order(
    &mut market,
    &taker,
    usdc_amount::usdc(10),
    &witness,
    order::bid(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::settle_next_with_collateral(
    &mut market,
    &mut bid,
    usdc_amount::usdc(10),
    usdc_amount::usdc(10),
    &witness,
  );
  instrument_market::complete(&mut market, bid, &witness);

  assert_eq!(instrument_market::position_collateral(&market, maker_id).value(), 10);
  assert_eq!(instrument_market::position_collateral(&market, taker_id).value(), 10);
  assert_eq!(instrument_market::total_collateral(&market).value(), 100);

  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun partial_fill_consumes_reserve_and_cancel_releases_only_remainder() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut maker = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(50, test.ctx()),
    test.ctx(),
  );
  let mut taker = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(50, test.ctx()),
    test.ctx(),
  );
  let maker_id = object::id(&maker);
  instrument_market::deposit_collateral(
    &mut market,
    &mut maker,
    usdc_amount::usdc(50),
    &witness,
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut taker,
    usdc_amount::usdc(50),
    &witness,
    test.ctx(),
  );

  let ask = instrument_market::place_collateralized_limit_order(
    &mut market,
    &maker,
    usdc_amount::usdc(10),
    &witness,
    order::ask(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  let ask_id = ask.order_id();
  let maker_reservation_id = ask.reservation_id();
  instrument_market::complete(&market, ask, &witness);
  let mut bid = instrument_market::place_collateralized_limit_order(
    &mut market,
    &taker,
    usdc_amount::usdc(4),
    &witness,
    order::bid(),
    price::price(100),
    size::size(4),
    test.ctx(),
  );
  instrument_market::settle_next_with_collateral(
    &mut market,
    &mut bid,
    usdc_amount::usdc(4),
    usdc_amount::usdc(4),
    &witness,
  );
  instrument_market::complete(&market, bid, &witness);

  assert_eq!(
    instrument_market::reserved_collateral(&market, maker_reservation_id).value(),
    6,
  );
  assert_eq!(instrument_market::free_collateral(&market, maker_id).value(), 40);
  assert_eq!(instrument_market::position_collateral(&market, maker_id).value(), 4);
  let canceled = instrument_market::cancel_order(
    &mut market,
    &maker,
    &witness,
    order::ask(),
    ask_id,
    test.ctx(),
  );
  instrument_market::complete_cancel(&market, canceled, &witness);
  assert!(
    !instrument_market::has_reservation(&market, maker_reservation_id),
    EUnexpectedValue,
  );
  assert_eq!(instrument_market::free_collateral(&market, maker_id).value(), 46);
  assert_eq!(instrument_market::total_collateral(&market).value(), 100);

  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EInsufficientReservedCollateral)]
fun fill_cannot_consume_more_than_order_reserved() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut maker = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(5, test.ctx()),
    test.ctx(),
  );
  let mut taker = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut maker,
    usdc_amount::usdc(5),
    &witness,
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut taker,
    usdc_amount::usdc(10),
    &witness,
    test.ctx(),
  );
  let ask = instrument_market::place_collateralized_limit_order(
    &mut market,
    &maker,
    usdc_amount::usdc(5),
    &witness,
    order::ask(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::complete(&market, ask, &witness);
  let mut bid = instrument_market::place_collateralized_limit_order(
    &mut market,
    &taker,
    usdc_amount::usdc(10),
    &witness,
    order::bid(),
    price::price(100),
    size::size(10),
    test.ctx(),
  );
  instrument_market::settle_next_with_collateral(
    &mut market,
    &mut bid,
    usdc_amount::usdc(6),
    usdc_amount::usdc(10),
    &witness,
  );
  instrument_market::complete(&market, bid, &witness);
  margin::keep(maker, test.ctx());
  margin::keep(taker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EInsufficientFreeCollateral)]
fun order_cannot_reserve_more_than_market_free_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  let obligation = instrument_market::place_collateralized_limit_order(
    &mut market,
    &account,
    usdc_amount::usdc(1),
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

#[test, expected_failure(abort_code = nth::collateral::EZeroDeposit)]
fun zero_market_collateral_deposit_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new(test.ctx());
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(0),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EZeroWithdrawal)]
fun zero_market_collateral_withdrawal_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new(test.ctx());
  instrument_market::withdraw_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(0),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EInsufficientWithdrawableCollateral)]
fun one_market_cannot_withdraw_another_markets_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut funded_market = instrument_market::new(&witness, test.ctx());
  let mut empty_market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut funded_market,
    &mut account,
    usdc_amount::usdc(10),
    &witness,
    test.ctx(),
  );

  instrument_market::withdraw_collateral(
    &mut empty_market,
    &mut account,
    usdc_amount::usdc(1),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(funded_market);
  transfer::public_share_object(empty_market);
  test.end();
}

#[test]
fun issuance_moves_free_collateral_into_a_long_claim() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let account_id = object::id(&account);
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(10),
    &witness,
    test.ctx(),
  );

  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(6),
    size::size(3),
    &witness,
    test.ctx(),
  );

  assert_eq!(instrument_market::position_state(&market, account_id), position::long());
  assert_eq!(instrument_market::position_size(&market, account_id).value(), 3);
  assert_eq!(instrument_market::free_collateral(&market, account_id).value(), 4);
  assert_eq!(instrument_market::position_collateral(&market, account_id).value(), 6);
  assert_eq!(instrument_market::total_collateral(&market).value(), 10);
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun redemption_reduces_claim_and_releases_exact_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let account_id = object::id(&account);
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(10),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(10),
    size::size(5),
    &witness,
    test.ctx(),
  );

  instrument_market::redeem_long_claim(
    &mut market,
    &account,
    size::size(2),
    usdc_amount::usdc(4),
    &witness,
    test.ctx(),
  );

  assert_eq!(instrument_market::position_state(&market, account_id), position::long());
  assert_eq!(instrument_market::position_size(&market, account_id).value(), 3);
  assert_eq!(instrument_market::free_collateral(&market, account_id).value(), 4);
  assert_eq!(instrument_market::position_collateral(&market, account_id).value(), 6);
  assert_eq!(instrument_market::total_collateral(&market).value(), 10);
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EInsufficientFreeCollateral)]
fun issuance_cannot_consume_unavailable_free_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(1),
    size::size(1),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::position::EInsufficientLongClaim)]
fun redemption_cannot_exceed_long_claim_size() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(2, test.ctx()),
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(2),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(2),
    size::size(1),
    &witness,
    test.ctx(),
  );
  instrument_market::redeem_long_claim(
    &mut market,
    &account,
    size::size(2),
    usdc_amount::usdc(2),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EInsufficientPositionCollateral)]
fun redemption_cannot_release_unavailable_position_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(2, test.ctx()),
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(2),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(2),
    size::size(2),
    &witness,
    test.ctx(),
  );
  instrument_market::redeem_long_claim(
    &mut market,
    &account,
    size::size(1),
    usdc_amount::usdc(3),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::EInvalidAccountOwner)]
fun foreign_sender_cannot_issue_an_accounts_claim() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);

  test.next_tx(@0xB0B);
  let mut market = test.take_shared<Market<Linear>>();
  let account = test.take_from_address<MarginAccount>(ALICE);
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(1),
    size::size(1),
    &witness,
    test.ctx(),
  );
  test_scenario::return_shared(market);
  margin::keep(account, test.ctx());
  test.end();
}

#[test, expected_failure(abort_code = nth::position::ENotLongClaim)]
fun one_market_cannot_redeem_another_markets_claim() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut funded_market = instrument_market::new(&witness, test.ctx());
  let mut empty_market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(1, test.ctx()),
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut funded_market,
    &mut account,
    usdc_amount::usdc(1),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut funded_market,
    &account,
    usdc_amount::usdc(1),
    size::size(1),
    &witness,
    test.ctx(),
  );
  instrument_market::redeem_long_claim(
    &mut empty_market,
    &account,
    size::size(1),
    usdc_amount::usdc(1),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(funded_market);
  transfer::public_share_object(empty_market);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::EZeroIssuanceCollateral)]
fun zero_collateral_claim_issuance_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(0),
    size::size(1),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::position::EZeroClaimSize)]
fun zero_claim_issuance_size_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(1),
    size::size(0),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::position::EZeroClaimSize)]
fun zero_claim_redemption_size_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  instrument_market::redeem_long_claim(
    &mut market,
    &account,
    size::size(0),
    usdc_amount::usdc(0),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun directed_carry_moves_position_collateral_without_changing_size() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut payer = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let mut receiver = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let payer_id = object::id(&payer);
  let receiver_id = object::id(&receiver);
  instrument_market::deposit_collateral(
    &mut market,
    &mut payer,
    usdc_amount::usdc(10),
    &witness,
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut receiver,
    usdc_amount::usdc(10),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &payer,
    usdc_amount::usdc(8),
    size::size(4),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &receiver,
    usdc_amount::usdc(4),
    size::size(2),
    &witness,
    test.ctx(),
  );

  instrument_market::apply_carry(
    &mut market,
    payer_id,
    receiver_id,
    usdc_amount::usdc(3),
    1,
    true,
    true,
    &witness,
  );

  assert_eq!(instrument_market::position_size(&market, payer_id).value(), 4);
  assert_eq!(instrument_market::position_size(&market, receiver_id).value(), 2);
  assert_eq!(instrument_market::position_collateral(&market, payer_id).value(), 5);
  assert_eq!(
    instrument_market::position_collateral(&market, receiver_id).value(),
    7,
  );
  assert_eq!(instrument_market::total_collateral(&market).value(), 20);
  margin::keep(payer, test.ctx());
  margin::keep(receiver, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun directed_carry_can_credit_free_collateral_from_a_reserve() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut reserve = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(5, test.ctx()),
    test.ctx(),
  );
  let mut holder = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(1, test.ctx()),
    test.ctx(),
  );
  let reserve_id = object::id(&reserve);
  let holder_id = object::id(&holder);
  instrument_market::deposit_collateral(
    &mut market,
    &mut reserve,
    usdc_amount::usdc(5),
    &witness,
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut holder,
    usdc_amount::usdc(1),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &holder,
    usdc_amount::usdc(1),
    size::size(1),
    &witness,
    test.ctx(),
  );

  instrument_market::apply_carry(
    &mut market,
    reserve_id,
    holder_id,
    usdc_amount::usdc(2),
    7,
    false,
    false,
    &witness,
  );

  assert_eq!(instrument_market::free_collateral(&market, reserve_id).value(), 3);
  assert_eq!(instrument_market::free_collateral(&market, holder_id).value(), 2);
  assert_eq!(instrument_market::position_size(&market, holder_id).value(), 1);
  assert_eq!(instrument_market::total_collateral(&market).value(), 6);
  margin::keep(reserve, test.ctx());
  margin::keep(holder, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EInsufficientPositionCollateral)]
fun carry_cannot_debit_unavailable_position_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut payer = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(1, test.ctx()),
    test.ctx(),
  );
  let mut receiver = margin::new(test.ctx());
  let payer_id = object::id(&payer);
  let receiver_id = object::id(&receiver);
  instrument_market::deposit_collateral(
    &mut market,
    &mut payer,
    usdc_amount::usdc(1),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &payer,
    usdc_amount::usdc(1),
    size::size(1),
    &witness,
    test.ctx(),
  );
  instrument_market::apply_carry(
    &mut market,
    payer_id,
    receiver_id,
    usdc_amount::usdc(2),
    1,
    true,
    true,
    &witness,
  );
  margin::keep(payer, test.ctx());
  margin::keep(receiver, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EInsufficientFreeCollateral)]
fun carry_cannot_debit_unavailable_free_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let payer = margin::new(test.ctx());
  let receiver = margin::new(test.ctx());
  instrument_market::apply_carry(
    &mut market,
    object::id(&payer),
    object::id(&receiver),
    usdc_amount::usdc(1),
    1,
    false,
    false,
    &witness,
  );
  margin::keep(payer, test.ctx());
  margin::keep(receiver, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::ESelfCarry)]
fun carry_cannot_transfer_to_the_same_account() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(1, test.ctx()),
    test.ctx(),
  );
  let account_id = object::id(&account);
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(1),
    &witness,
    test.ctx(),
  );
  instrument_market::apply_carry(
    &mut market,
    account_id,
    account_id,
    usdc_amount::usdc(1),
    1,
    false,
    false,
    &witness,
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EZeroCarryAmount)]
fun zero_carry_amount_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let payer = margin::new(test.ctx());
  let receiver = margin::new(test.ctx());
  instrument_market::apply_carry(
    &mut market,
    object::id(&payer),
    object::id(&receiver),
    usdc_amount::usdc(0),
    1,
    false,
    false,
    &witness,
  );
  margin::keep(payer, test.ctx());
  margin::keep(receiver, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EInsufficientFreeCollateral)]
fun one_market_cannot_carry_another_markets_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut funded = instrument_market::new(&witness, test.ctx());
  let mut empty = instrument_market::new(&witness, test.ctx());
  let mut payer = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(1, test.ctx()),
    test.ctx(),
  );
  let receiver = margin::new(test.ctx());
  instrument_market::deposit_collateral(
    &mut funded,
    &mut payer,
    usdc_amount::usdc(1),
    &witness,
    test.ctx(),
  );
  instrument_market::apply_carry(
    &mut empty,
    object::id(&payer),
    object::id(&receiver),
    usdc_amount::usdc(1),
    1,
    false,
    false,
    &witness,
  );
  margin::keep(payer, test.ctx());
  margin::keep(receiver, test.ctx());
  transfer::public_share_object(funded);
  transfer::public_share_object(empty);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::EAlreadyTerminal)]
fun terminal_entry_is_one_time() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  instrument_market::enter_terminal(&mut market, &witness);
  instrument_market::enter_terminal(&mut market, &witness);
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::ETerminalMarket)]
fun terminal_market_rejects_new_orders() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let account = margin::new(test.ctx());
  instrument_market::enter_terminal(&mut market, &witness);
  let obligation = instrument_market::place_limit_order(
    &mut market,
    &account,
    object::id(&account),
    &witness,
    order::bid(),
    price::price(100),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, obligation, &witness);
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::ETerminalMarket)]
fun terminal_market_rejects_new_claims() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(4, test.ctx()),
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(4),
    &witness,
    test.ctx(),
  );
  instrument_market::enter_terminal(&mut market, &witness);
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(4),
    size::size(2),
    &witness,
    test.ctx(),
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::ENotTerminal)]
fun terminal_settlement_requires_terminal_market() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(4, test.ctx()),
    test.ctx(),
  );
  let account_id = object::id(&account);
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(4),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(4),
    size::size(2),
    &witness,
    test.ctx(),
  );
  instrument_market::settle_terminal_position(&mut market, account_id, &witness);
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun terminal_settlement_closes_positions_and_releases_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut payer = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let mut receiver = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let payer_id = object::id(&payer);
  let receiver_id = object::id(&receiver);
  instrument_market::deposit_collateral(
    &mut market,
    &mut payer,
    usdc_amount::usdc(10),
    &witness,
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut receiver,
    usdc_amount::usdc(10),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &payer,
    usdc_amount::usdc(8),
    size::size(4),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &receiver,
    usdc_amount::usdc(4),
    size::size(2),
    &witness,
    test.ctx(),
  );

  instrument_market::enter_terminal(&mut market, &witness);
  assert_eq!(instrument_market::is_terminal(&market), true);
  instrument_market::apply_carry(
    &mut market,
    payer_id,
    receiver_id,
    usdc_amount::usdc(3),
    1,
    true,
    true,
    &witness,
  );
  instrument_market::settle_terminal_position(&mut market, payer_id, &witness);
  instrument_market::settle_terminal_position(
    &mut market,
    receiver_id,
    &witness,
  );

  assert_eq!(instrument_market::has_position(&market, payer_id), false);
  assert_eq!(instrument_market::has_position(&market, receiver_id), false);
  assert_eq!(instrument_market::position_count(&market), 0);
  assert_eq!(instrument_market::free_collateral(&market, payer_id).value(), 7);
  assert_eq!(
    instrument_market::free_collateral(&market, receiver_id).value(),
    13,
  );
  assert_eq!(instrument_market::position_collateral(&market, payer_id).value(), 0);
  assert_eq!(
    instrument_market::position_collateral(&market, receiver_id).value(),
    0,
  );
  assert_eq!(instrument_market::total_collateral(&market).value(), 20);
  margin::keep(payer, test.ctx());
  margin::keep(receiver, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::ENothingToSettle)]
fun terminal_settlement_cannot_apply_twice() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(4, test.ctx()),
    test.ctx(),
  );
  let account_id = object::id(&account);
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(4),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(4),
    size::size(2),
    &witness,
    test.ctx(),
  );
  instrument_market::enter_terminal(&mut market, &witness);
  instrument_market::settle_terminal_position(&mut market, account_id, &witness);
  instrument_market::settle_terminal_position(&mut market, account_id, &witness);
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun terminal_settlement_releases_reserve_collateral_without_a_position() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut holder = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(6, test.ctx()),
    test.ctx(),
  );
  let reserve = margin::new(test.ctx());
  let holder_id = object::id(&holder);
  let reserve_id = object::id(&reserve);
  instrument_market::deposit_collateral(
    &mut market,
    &mut holder,
    usdc_amount::usdc(6),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &holder,
    usdc_amount::usdc(6),
    size::size(3),
    &witness,
    test.ctx(),
  );
  instrument_market::apply_carry(
    &mut market,
    holder_id,
    reserve_id,
    usdc_amount::usdc(2),
    1,
    true,
    true,
    &witness,
  );
  instrument_market::enter_terminal(&mut market, &witness);
  instrument_market::settle_terminal_position(&mut market, reserve_id, &witness);

  assert_eq!(instrument_market::has_position(&market, reserve_id), false);
  assert_eq!(instrument_market::free_collateral(&market, reserve_id).value(), 2);
  assert_eq!(
    instrument_market::position_collateral(&market, reserve_id).value(),
    0,
  );
  assert_eq!(instrument_market::total_collateral(&market).value(), 6);
  margin::keep(holder, test.ctx());
  margin::keep(reserve, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun terminal_cleanup_releases_all_reservations() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut bidder = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(9, test.ctx()),
    test.ctx(),
  );
  let mut asker = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(10, test.ctx()),
    test.ctx(),
  );
  let bidder_id = object::id(&bidder);
  let asker_id = object::id(&asker);
  instrument_market::deposit_collateral(
    &mut market,
    &mut bidder,
    usdc_amount::usdc(9),
    &witness,
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut asker,
    usdc_amount::usdc(10),
    &witness,
    test.ctx(),
  );
  let bid = instrument_market::place_collateralized_limit_order(
    &mut market,
    &bidder,
    usdc_amount::usdc(9),
    &witness,
    order::bid(),
    price::price(90),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, bid, &witness);
  let ask = instrument_market::place_collateralized_limit_order(
    &mut market,
    &asker,
    usdc_amount::usdc(10),
    &witness,
    order::ask(),
    price::price(100),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, ask, &witness);

  instrument_market::enter_terminal(&mut market, &witness);
  let canceled_bids = instrument_market::cancel_terminal_orders(
    &mut market,
    order::bid(),
    10,
    &witness,
  );
  let canceled_asks = instrument_market::cancel_terminal_orders(
    &mut market,
    order::ask(),
    10,
    &witness,
  );

  assert_eq!(canceled_bids, 1);
  assert_eq!(canceled_asks, 1);
  assert_eq!(instrument_market::bid_count(&market), 0);
  assert_eq!(instrument_market::ask_count(&market), 0);
  assert_eq!(instrument_market::free_collateral(&market, bidder_id).value(), 9);
  assert_eq!(instrument_market::free_collateral(&market, asker_id).value(), 10);
  assert_eq!(instrument_market::total_collateral(&market).value(), 19);
  margin::keep(bidder, test.ctx());
  margin::keep(asker, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = instrument_market::ENotTerminal)]
fun terminal_cleanup_requires_terminal_market() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  instrument_market::cancel_terminal_orders(
    &mut market,
    order::bid(),
    1,
    &witness,
  );
  transfer::public_share_object(market);
  test.end();
}

fun claim_market_with_position(
  test: &mut test_scenario::Scenario,
  deposit: u64,
  claim_collateral: u64,
  claim_size: u64,
): (Market<Linear>, MarginAccount) {
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let mut account = margin::new_with_deposit(
    coin::mint_for_testing<USDC>(deposit, test.ctx()),
    test.ctx(),
  );
  instrument_market::deposit_collateral(
    &mut market,
    &mut account,
    usdc_amount::usdc(deposit),
    &witness,
    test.ctx(),
  );
  instrument_market::issue_long_claim(
    &mut market,
    &account,
    usdc_amount::usdc(claim_collateral),
    size::size(claim_size),
    &witness,
    test.ctx(),
  );
  (market, account)
}

#[test]
fun forced_reduction_reduces_then_closes_exposure_exactly() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let (mut market, account) = claim_market_with_position(&mut test, 10, 6, 6);
  let account_id = object::id(&account);

  instrument_market::force_reduce_position(
    &mut market,
    account_id,
    size::size(2),
    usdc_amount::usdc(2),
    &witness,
  );
  assert_eq!(
    instrument_market::position_state(&market, account_id),
    position::long(),
  );
  assert_eq!(instrument_market::position_size(&market, account_id).value(), 4);
  assert_eq!(instrument_market::free_collateral(&market, account_id).value(), 6);
  assert_eq!(
    instrument_market::position_collateral(&market, account_id).value(),
    4,
  );

  instrument_market::force_reduce_position(
    &mut market,
    account_id,
    size::size(4),
    usdc_amount::usdc(4),
    &witness,
  );
  assert_eq!(
    instrument_market::position_state(&market, account_id),
    position::flat(),
  );
  assert_eq!(instrument_market::position_size(&market, account_id).value(), 0);
  assert_eq!(
    instrument_market::free_collateral(&market, account_id).value(),
    10,
  );
  assert_eq!(
    instrument_market::position_collateral(&market, account_id).value(),
    0,
  );
  assert_eq!(instrument_market::total_collateral(&market).value(), 10);

  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::position::EForcedReductionExceedsPosition)]
fun forced_reduction_cannot_exceed_position() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let (mut market, account) = claim_market_with_position(&mut test, 6, 6, 6);
  instrument_market::force_reduce_position(
    &mut market,
    object::id(&account),
    size::size(7),
    usdc_amount::usdc(0),
    &witness,
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::position::ENoExposureToForceReduce)]
fun forced_reduction_cannot_apply_to_flat_exposure() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let (mut market, account) = claim_market_with_position(&mut test, 6, 6, 6);
  let account_id = object::id(&account);
  instrument_market::force_reduce_position(
    &mut market,
    account_id,
    size::size(6),
    usdc_amount::usdc(6),
    &witness,
  );
  instrument_market::force_reduce_position(
    &mut market,
    account_id,
    size::size(1),
    usdc_amount::usdc(0),
    &witness,
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::position::ENoExposureToForceReduce)]
fun one_market_cannot_force_reduce_another_markets_position() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let (mut funded, account) = claim_market_with_position(&mut test, 6, 6, 6);
  let mut empty = instrument_market::new(&witness, test.ctx());
  instrument_market::force_reduce_position(
    &mut empty,
    object::id(&account),
    size::size(1),
    usdc_amount::usdc(0),
    &witness,
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(funded);
  transfer::public_share_object(empty);
  test.end();
}

#[test, expected_failure(abort_code = nth::collateral::EInsufficientPositionCollateral)]
fun forced_reduction_cannot_release_unavailable_position_collateral() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let (mut market, account) = claim_market_with_position(&mut test, 6, 4, 6);
  instrument_market::force_reduce_position(
    &mut market,
    object::id(&account),
    size::size(6),
    usdc_amount::usdc(5),
    &witness,
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test, expected_failure(abort_code = nth::position::EZeroForcedReductionSize)]
fun zero_forced_reduction_size_aborts() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let (mut market, account) = claim_market_with_position(&mut test, 6, 6, 6);
  instrument_market::force_reduce_position(
    &mut market,
    object::id(&account),
    size::size(0),
    usdc_amount::usdc(0),
    &witness,
  );
  margin::keep(account, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test]
fun terminal_cleanup_respects_explicit_bound() {
  let mut test = test_scenario::begin(ALICE);
  let witness = witness();
  let mut market = instrument_market::new(&witness, test.ctx());
  let first = margin::new(test.ctx());
  let second = margin::new(test.ctx());
  let bid = instrument_market::place_limit_order(
    &mut market,
    &first,
    object::id(&first),
    &witness,
    order::bid(),
    price::price(90),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, bid, &witness);
  let other_bid = instrument_market::place_limit_order(
    &mut market,
    &second,
    object::id(&second),
    &witness,
    order::bid(),
    price::price(80),
    size::size(1),
    test.ctx(),
  );
  instrument_market::complete(&market, other_bid, &witness);
  instrument_market::enter_terminal(&mut market, &witness);

  assert_eq!(
    instrument_market::cancel_terminal_orders(
      &mut market,
      order::bid(),
      1,
      &witness,
    ),
    1,
  );
  assert_eq!(instrument_market::bid_count(&market), 1);
  assert_eq!(
    instrument_market::cancel_terminal_orders(
      &mut market,
      order::bid(),
      1,
      &witness,
    ),
    1,
  );
  assert_eq!(
    instrument_market::cancel_terminal_orders(
      &mut market,
      order::bid(),
      1,
      &witness,
    ),
    0,
  );
  assert_eq!(instrument_market::bid_count(&market), 0);
  margin::keep(first, test.ctx());
  margin::keep(second, test.ctx());
  transfer::public_share_object(market);
  test.end();
}

#[test_only]
module strike::orderbook_tests;

use strike::constants;
use strike::order::{Self, Order};
use strike::orderbook;
use strike::pool::{Self, Pool, PriceCap};
use strike::strike::{Self, MarginAccount};
use strike::units::{Self, Price, Size, Leverage};
use sui::coin::mint_for_testing;
use sui::test_scenario::{begin, end, next_tx, take_from_address, Scenario};
use usdc::usdc::USDC;

// Creating setup: Alice with 1000 USDC + Bob with 1000 USDC
// And pool with default token price 100 USDC
// and maintenance margin percentage 25%
const ALICE: address = @0xA;
const BOB: address = @0xB;
// Carol only appears in tests that need an account richer than setup's 1000
const CAROL: address = @0xC;

fun px(value: u64): Price { units::price(value*constants::float_scaling()) }

fun sz(value: u64): Size { units::size(value*constants::float_scaling()) }

fun lev(value: u64): Leverage {
  units::leverage(value*constants::float_scaling())
}

fun usdc_of(value: u64): u64 { value*constants::float_scaling() }

fun setup(test: &mut Scenario) {
  next_tx(test, ALICE);
  {
    let pool = pool::new(
      constants::default_maintance_margin_rate(),
      px(100),
      test.ctx(),
    );
    let alice_usdc = mint_for_testing<USDC>(usdc_of(1000), test.ctx());
    let alice_margin = strike::new_with_deposit(alice_usdc, test.ctx());

    transfer::public_transfer(pool, ALICE);
    alice_margin.keep(test.ctx());
  };

  next_tx(test, BOB);
  {
    let bob_usdc = mint_for_testing<USDC>(usdc_of(1000), test.ctx());
    let bob_margin = strike::new_with_deposit(bob_usdc, test.ctx());
    bob_margin.keep(test.ctx());
  };
}

#[test]
fun test_place_bid_order() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(10),
      lev(2),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 1, 1);
    let resting: &Order = orderbook::get_bid(orderbook, 0);
    assert!(resting.side().is_bid(), 2);
    assert!(resting.price().value() == px(100).value(), 3);
    assert!(resting.size().value() == sz(10).value(), 4);

    assert!(margin_account.balance() == usdc_of(500), 5);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_place_ask_order() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(100),
      sz(10),
      lev(4),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 1);
    assert!(orderbook::get_asks_length(orderbook) == 1, 2);
    let resting: &Order = orderbook::get_ask(orderbook, 0);
    assert!(!resting.side().is_bid(), 3);
    assert!(resting.price().value() == px(100).value(), 4);
    assert!(resting.size().value() == sz(10).value(), 5);

    assert!(margin_account.balance() == usdc_of(750), 6);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_place_and_cancel_orders() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // 100*10/2 = 500 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(10),
      lev(2),
      test.ctx(),
    );

    transfer::public_transfer(pool, BOB);
    margin_account.keep(test.ctx());
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, BOB);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    // Asks priced above Alice's bid at 100, so nothing crosses.
    // 110*5/2 = 275 margin required
    let ask_110 = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(110),
      sz(5),
      lev(2),
      test.ctx(),
    );

    // 120*2/1 = 240 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(120),
      sz(2),
      lev(1),
      test.ctx(),
    );

    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == usdc_of(500 + 275 + 240), 1);

    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::ask(),
      ask_110,
      test.ctx(),
    );

    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == usdc_of(500 + 240), 2);

    assert!(margin_account.balance() == usdc_of(1000 - 240), 3);

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_asks_length(orderbook) == 1, 4);
    assert!(orderbook::get_bids_length(orderbook) == 1, 5);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_orders_match() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Resting bid: 100 x 10, margin 500
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(10),
      lev(2),
      test.ctx(),
    );

    transfer::public_transfer(pool, BOB);
    margin_account.keep(test.ctx());
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, BOB);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    // Incoming ask at 95 x 4 crosses the bid at 100 and fully fills:
    // the taker never rests on the book.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(95),
      sz(4),
      lev(2),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_asks_length(orderbook) == 0, 1);
    assert!(orderbook::get_bids_length(orderbook) == 1, 2);

    // The maker bid is partially filled: 4 of 10.
    let resting: &Order = orderbook::get_bid(orderbook, 0);
    assert!(resting.filled_size().value() == sz(4).value(), 3);
    assert!(resting.unfilled_size().value() == sz(6).value(), 4);

    // Bob's margin (95*4/2 = 190) stays in the vault with the fill.
    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == usdc_of(500 + 190), 5);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Cancelling the partially filled bid refunds only the unfilled
    // part: 6*100/2 = 300 of the original 500.
    let orderbook = pool::get_orderbook(&pool);
    let resting: &Order = orderbook::get_bid(orderbook, 0);
    let bid_id = resting.order_id();

    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      bid_id,
      test.ctx(),
    );

    assert!(margin_account.balance() == usdc_of(500 + 300), 6);
    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 7);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInsufficientBalance)]
fun test_insufficient_balance() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // 1000*100/1 = 100_000 margin required, far above the 1000 deposited
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(1000),
      sz(100),
      lev(1),
      test.ctx(),
    );

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_liquidations() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // 100*2/2 = 100 margin required
    let bid_100 = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    // 95*5/4 = 118.75 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(5),
      lev(4),
      test.ctx(),
    );

    // 90*8/2 = 360 margin required
    let bid_90 = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(90),
      sz(8),
      lev(2),
      test.ctx(),
    );

    // 105*2/2 = 105 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(105),
      sz(2),
      lev(2),
      test.ctx(),
    );

    // 110*6/3 = 220 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(110),
      sz(6),
      lev(3),
      test.ctx(),
    );
    // In total we need 100 + 118.75 + 360 + 105 + 220 = 903.75 margin

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 3, 1);
    assert!(orderbook::get_asks_length(orderbook) == 2, 2);
    // 25*constants::float_scaling()/100 = 0.25 USDC
    assert!(
      margin_account.balance() == usdc_of(96) + usdc_of(25)/100,
      3,
    );

    // Drop price of token from 100 to 80
    pool::set_token_price(&mut pool, px(80), test.ctx());
    pool::check_liquidations(&mut pool);

    // Only bid order with price 95 and size 5 should be liquidated
    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 2, 4);
    assert!(orderbook::get_asks_length(orderbook) == 2, 5); // All asks remain

    let remaining_bid = orderbook::get_bid(orderbook, 0);
    assert!(remaining_bid.price().value() == px(100).value(), 6);

    let remaining_bid = orderbook::get_bid(orderbook, 1);
    assert!(remaining_bid.price().value() == px(90).value(), 7);

    // Let's close all bids positions
    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      bid_100,
      test.ctx(),
    );

    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      bid_90,
      test.ctx(),
    );

    // Check vault balance - should contain all the margin from liquidated
    // positions + asks orders
    let vault = pool::get_vault(&pool);
    // 75*constants::float_scaling()/100 = 0.75 USDC
    assert!(
      vault.balance() == usdc_of(118 + 105 + 220) + usdc_of(75)/100,
      8,
    );

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_liquidations_asks() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // 100*2/2 = 100 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    // 95*5/4 = 118.75 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(5),
      lev(4),
      test.ctx(),
    );

    // 90*8/2 = 360 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(90),
      sz(8),
      lev(2),
      test.ctx(),
    );

    // 105*2/2 = 105 margin required
    let ask_105 = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(105),
      sz(2),
      lev(2),
      test.ctx(),
    );

    // 110*6/3 = 220 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(110),
      sz(6),
      lev(3),
      test.ctx(),
    );
    // In total we need 100 + 118.75 + 360 + 105 + 220 = 903.75 margin

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 3, 1);
    assert!(orderbook::get_asks_length(orderbook) == 2, 2);
    // 25*constants::float_scaling()/100 = 0.25 USDC
    assert!(
      margin_account.balance() == usdc_of(96) + usdc_of(25)/100,
      3,
    );

    // Raise price of token from 100 to 120
    pool::set_token_price(&mut pool, px(120), test.ctx());
    pool::check_liquidations(&mut pool);

    // Only ask order with 110 price should be liquidated
    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 3, 4);
    assert!(orderbook::get_asks_length(orderbook) == 1, 5);

    let remaining_ask = orderbook::get_ask(orderbook, 0);
    assert!(remaining_ask.price().value() == px(105).value(), 6);

    // Let's close last ask position and check balance
    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::ask(),
      ask_105,
      test.ctx(),
    );

    // all 3 bids should be in vault + liquidated ask
    let vault = pool::get_vault(&pool);
    // 75*constants::float_scaling()/100 = 0.75 USDC
    assert!(
      vault.balance() == usdc_of(100+118+360+220) + usdc_of(75)/100,
      7,
    );

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Matching engine ===

#[test]
fun test_taker_partially_fills_and_rests() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Resting bid: 100 x 10, margin 500
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(10),
      lev(2),
      test.ctx(),
    );

    transfer::public_transfer(pool, BOB);
    margin_account.keep(test.ctx());
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, BOB);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    // Incoming ask at 95 x 15 crosses the bid at 100: 10 fills at the
    // maker's price, the remaining 5 rests as an ask at 95.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(95),
      sz(15),
      lev(2),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 1);
    assert!(orderbook::get_asks_length(orderbook) == 1, 2);

    // The resting remainder records its own filled part: 10 of 15.
    let resting: &Order = orderbook::get_ask(orderbook, 0);
    assert!(resting.price().value() == px(95).value(), 3);
    assert!(resting.size().value() == sz(15).value(), 4);
    assert!(resting.filled_size().value() == sz(10).value(), 5);
    assert!(resting.unfilled_size().value() == sz(5).value(), 6);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_taker_walks_multiple_price_levels() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Resting bids: 100 x 2 (margin 100) and 98 x 3 (margin 147)
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(98),
      sz(3),
      lev(2),
      test.ctx(),
    );

    transfer::public_transfer(pool, BOB);
    margin_account.keep(test.ctx());
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, BOB);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    // Ask at 97 x 5 crosses both levels: 2 fill at 100, 3 fill at 98,
    // and the fully consumed taker never rests.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(97),
      sz(5),
      lev(2),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 1);
    assert!(orderbook::get_asks_length(orderbook) == 0, 2);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_equal_price_orders_fill_in_time_priority() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  let (first_id, second_id) = {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Two bids at the same price level, 100 x 2 each (margin 100 each)
    let first_id = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    let second_id = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    transfer::public_transfer(pool, BOB);
    margin_account.keep(test.ctx());
    (first_id, second_id)
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, BOB);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    // Ask at 100 x 3: the first-placed bid fills fully (2) and is
    // removed, the second fills partially (1).
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(100),
      sz(3),
      lev(2),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 1, 1);
    assert!(orderbook::get_asks_length(orderbook) == 0, 2);

    // The survivor is the second-placed order: its id is the larger one.
    let resting: &Order = orderbook::get_bid(orderbook, 0);
    assert!(second_id.value() > first_id.value(), 3);
    assert!(resting.order_id().eq(second_id), 4);
    assert!(resting.filled_size().value() == sz(1).value(), 5);
    assert!(resting.unfilled_size().value() == sz(1).value(), 6);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_non_crossing_orders_rest() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // 90*2/2 = 90 margin required
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(90),
      sz(2),
      lev(2),
      test.ctx(),
    );

    transfer::public_transfer(pool, BOB);
    margin_account.keep(test.ctx());
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, BOB);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    // Ask at 110 sits above the bid at 90: nothing crosses, both rest
    // untouched.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(110),
      sz(2),
      lev(2),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 1, 1);
    assert!(orderbook::get_asks_length(orderbook) == 1, 2);

    let resting_bid: &Order = orderbook::get_bid(orderbook, 0);
    assert!(resting_bid.filled_size().value() == 0, 3);

    let resting_ask: &Order = orderbook::get_ask(orderbook, 0);
    assert!(resting_ask.filled_size().value() == 0, 4);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Cancellation / order ids ===

#[test]
fun test_duplicate_price_orders_cancel_individually() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Two bids at the SAME price level, 100 x 2 each (margin 100 each):
    // an (account, price) cancellation key could not tell them apart.
    let first_id = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    let second_id = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    assert!(!first_id.eq(second_id), 1);

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 2, 2);
    assert!(margin_account.balance() == usdc_of(800), 3);

    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      first_id,
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 1, 4);
    assert!(margin_account.balance() == usdc_of(900), 5);

    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      second_id,
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 6);
    assert!(margin_account.balance() == usdc_of(1000), 7);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = orderbook::EOrderNotFound)]
fun test_cancel_wrong_id_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    let bid_id = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      bid_id,
      test.ctx(),
    );

    // The id is gone from the book: closing it again must abort.
    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      bid_id,
      test.ctx(),
    );

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = orderbook::EOrderNotFound)]
fun test_cancel_other_account_order_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  let bid_id = {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    let bid_id = pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    transfer::public_transfer(pool, BOB);
    margin_account.keep(test.ctx());
    bid_id
  };

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, BOB);
    let mut margin_account = take_from_address<MarginAccount>(&test, BOB);

    // The id exists on the book but belongs to Alice's account: Bob's
    // scan (id AND account must match) misses and aborts.
    pool::close_position(
      &mut pool,
      &mut margin_account,
      order::bid(),
      bid_id,
      test.ctx(),
    );

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Placement validation ===

#[test, expected_failure(abort_code = pool::EInvalidPrice)]
fun test_zero_price_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      units::price(0),
      sz(2),
      lev(2),
      test.ctx(),
    );

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInvalidQuantity)]
fun test_zero_size_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      units::size(0),
      lev(2),
      test.ctx(),
    );

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInvalidLeverage)]
fun test_leverage_above_max_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // With the default 25% maintenance rate max leverage is 4x: at 5x
    // the initial margin is below maintenance and the position would be
    // born liquidatable.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(10),
      lev(5),
      test.ctx(),
    );

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInvalidLeverage)]
fun test_zero_leverage_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(10),
      units::leverage(0),
      test.ctx(),
    );

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EInvalidAccountOwner)]
fun test_place_on_foreign_account_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, BOB);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Bob is the sender but the margin account belongs to Alice.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(2),
      test.ctx(),
    );

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Sorting ===

#[test]
fun test_bids_sorted_descending_after_out_of_order_placement() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(90),
      sz(1),
      lev(2),
      test.ctx(),
    );

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(1),
      lev(2),
      test.ctx(),
    );

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(1),
      lev(2),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 3, 1);

    let best_bid = orderbook::get_bid(orderbook, 0);
    assert!(best_bid.price().value() == px(100).value(), 2);
    let second_bid = orderbook::get_bid(orderbook, 1);
    assert!(second_bid.price().value() == px(95).value(), 3);
    let third_bid = orderbook::get_bid(orderbook, 2);
    assert!(third_bid.price().value() == px(90).value(), 4);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_asks_sorted_ascending_after_out_of_order_placement() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(110),
      sz(1),
      lev(2),
      test.ctx(),
    );

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(105),
      sz(1),
      lev(2),
      test.ctx(),
    );

    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::ask(),
      px(120),
      sz(1),
      lev(2),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_asks_length(orderbook) == 3, 1);

    let best_ask = orderbook::get_ask(orderbook, 0);
    assert!(best_ask.price().value() == px(105).value(), 2);
    let second_ask = orderbook::get_ask(orderbook, 1);
    assert!(second_ask.price().value() == px(110).value(), 3);
    let third_ask = orderbook::get_ask(orderbook, 2);
    assert!(third_ask.price().value() == px(120).value(), 4);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Liquidation boundaries ===

#[test]
fun test_liquidation_at_exact_threshold_price() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // At max leverage (4x) the margin buffer is zero, so the liquidation
    // price equals the entry price: 95.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(5),
      lev(4),
      test.ctx(),
    );

    // Price exactly at entry: entry - 0 >= current holds, so the
    // position liquidates (<=, not <).
    pool::set_token_price(&mut pool, px(95), test.ctx());
    pool::check_liquidations(&mut pool);

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 1);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_no_liquidation_just_above_threshold() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // Same max-leverage position: liquidation price is exactly 95.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(5),
      lev(4),
      test.ctx(),
    );

    // One base unit above the threshold: the position survives.
    pool::set_token_price(
      &mut pool,
      units::price(95*constants::float_scaling() + 1),
      test.ctx(),
    );
    pool::check_liquidations(&mut pool);

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 1, 1);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_low_leverage_long_survives_crash_to_near_zero() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);

    // 1x long at 100 x 2: margin 200, maintenance 50, so the buffer is
    // (200-50)/2 = 75 and the liquidation price is 100-75 = 25.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100),
      sz(2),
      lev(1),
      test.ctx(),
    );

    // One dollar above the liquidation price: survives.
    pool::set_token_price(&mut pool, px(26), test.ctx());
    pool::check_liquidations(&mut pool);

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 1, 1);

    // Exactly at the liquidation price: liquidated.
    pool::set_token_price(&mut pool, px(25), test.ctx());
    pool::check_liquidations(&mut pool);

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 2);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test]
fun test_large_notional_does_not_overflow() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, CAROL);
  {
    let carol_usdc = mint_for_testing<USDC>(
      usdc_of(100_000_000),
      test.ctx(),
    );
    let carol_margin = strike::new_with_deposit(carol_usdc, test.ctx());
    carol_margin.keep(test.ctx());
  };

  next_tx(&mut test, CAROL);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, CAROL);

    // 100_000 * 1000 / 1 = 100_000_000 USDC margin. The double-scaled
    // price*size product is 1e11 * 1e9 = 1e20 > u64::MAX, so this order
    // aborts unless the margin math runs in u128.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(100_000),
      sz(1000),
      lev(1),
      test.ctx(),
    );

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 1, 1);
    let resting: &Order = orderbook::get_bid(orderbook, 0);
    assert!(resting.size().value() == sz(1000).value(), 2);

    // The margin charge is exact: the whole 100M USDC deposit.
    assert!(margin_account.balance() == 0, 3);
    let vault = pool::get_vault(&pool);
    assert!(vault.balance() == usdc_of(100_000_000), 4);

    transfer::public_transfer(pool, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

// === Oracle capability ===

#[test]
fun test_price_cap_updates_price() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, ALICE);
  {
    let mut pool = take_from_address<Pool>(&test, ALICE);
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);
    let cap = take_from_address<PriceCap>(&test, ALICE);

    // Max-leverage bid: liquidation price equals the entry price, 95.
    pool::place_leveraged_order(
      &mut pool,
      &mut margin_account,
      order::bid(),
      px(95),
      sz(5),
      lev(4),
      test.ctx(),
    );

    // Move the oracle through the capability-gated path and verify the
    // liquidation sweep runs against the NEW price.
    pool::update_price(&mut pool, &cap, px(80), test.ctx());
    pool::check_liquidations(&mut pool);

    let orderbook = pool::get_orderbook(&pool);
    assert!(orderbook::get_bids_length(orderbook) == 0, 1);

    transfer::public_transfer(pool, ALICE);
    transfer::public_transfer(cap, ALICE);
    margin_account.keep(test.ctx());
  };
  end(test);
}

#[test, expected_failure(abort_code = pool::EWrongPool)]
fun test_wrong_pool_cap_aborts() {
  let mut test = begin(@0xF);
  setup(&mut test);

  next_tx(&mut test, BOB);
  {
    // Bob creates a second pool: its PriceCap lands at BOB, distinct
    // from Alice's cap for the setup pool.
    let pool_b = pool::new(
      constants::default_maintance_margin_rate(),
      px(100),
      test.ctx(),
    );
    transfer::public_transfer(pool_b, BOB);
  };

  next_tx(&mut test, BOB);
  {
    let mut pool_a = take_from_address<Pool>(&test, ALICE);
    let cap_b = take_from_address<PriceCap>(&test, BOB);

    // Pool B's cap must not move pool A's price.
    pool::update_price(&mut pool_a, &cap_b, px(50), test.ctx());

    transfer::public_transfer(pool_a, ALICE);
    transfer::public_transfer(cap_b, BOB);
  };
  end(test);
}

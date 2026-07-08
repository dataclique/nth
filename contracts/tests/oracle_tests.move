#[test_only]
module strike::oracle_tests;

use strike::oracle;
use strike::units::{Self, Price};
use sui::test_scenario::{begin, end};
use std::unit_test::destroy;

const ALICE: address = @0xA;

fun px(value: u64): Price { units::price(value*units::float_scaling()) }

#[test]
fun test_update_price_overwrites() {
  let mut ctx = tx_context::dummy();
  let mut oracle = oracle::new(&mut ctx);

  oracle.update_price(px(100), &ctx);
  oracle.update_price(px(80), &ctx);

  assert!(oracle.price().value() == px(80).value(), 0);
  destroy(oracle);
}

/// A fresh oracle reports price 0 and update time 0 — stale-by-construction.
/// This is why `pool::new` must seed the price before trading can rely on it.
#[test]
fun test_new_oracle_price_is_zero_until_first_update() {
  let mut ctx = tx_context::dummy();
  let oracle = oracle::new(&mut ctx);

  assert!(oracle.price().value() == 0, 0);
  assert!(oracle.last_update_time() == 0, 1);
  destroy(oracle);
}

#[test]
fun test_update_price_stamps_time() {
  let mut test = begin(ALICE);
  let mut oracle = oracle::new(test.ctx());

  oracle.update_price(px(100), test.ctx());
  let first = oracle.last_update_time();
  assert!(first == test.ctx().epoch_timestamp_ms(), 0);

  test.later_epoch(1000, ALICE);
  oracle.update_price(px(120), test.ctx());
  let second = oracle.last_update_time();
  assert!(second == test.ctx().epoch_timestamp_ms(), 1);
  assert!(second > first, 2);

  destroy(oracle);
  end(test);
}

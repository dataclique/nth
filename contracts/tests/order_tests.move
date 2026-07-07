#[test_only]
module strike::order_tests;

use strike::constants;
use strike::order::{Self, Order};
use strike::units::{Self, Price, Size};

fun px(value: u64): Price { units::price(value*constants::float_scaling()) }

fun sz(value: u64): Size { units::size(value*constants::float_scaling()) }

fun new_order(size: Size, ctx: &TxContext): Order {
  order::new(
    object::id_from_address(@0xCAFE),
    order::bid(),
    px(100),
    size,
    units::leverage(2*constants::float_scaling()),
    units::usdc(500*constants::float_scaling()),
    ctx,
  )
}

#[test]
fun test_match_side_dispatches_bid_and_ask() {
  assert!(order::bid().match_side!(|| 1, || 2) == 1, 0);
  assert!(order::ask().match_side!(|| 1, || 2) == 2, 1);
}

#[test]
fun test_is_bid_projection() {
  assert!(order::bid().is_bid(), 0);
  assert!(!order::ask().is_bid(), 1);
}

#[test]
fun test_order_id_next_is_monotonic() {
  let id = order::order_id(1);
  assert!(id.next().value() == 2, 0);
  assert!(id.next().next().value() == 3, 1);
  assert!(id.next().next().next().value() == 4, 2);
}

#[test]
fun test_order_id_eq() {
  assert!(order::order_id(7).eq(order::order_id(7)), 0);
  assert!(!order::order_id(7).eq(order::order_id(8)), 1);
}

#[test]
fun test_unfilled_size_tracks_fills() {
  let ctx = tx_context::dummy();
  let mut order = new_order(sz(10), &ctx);

  order.set_filled_size(sz(3));

  assert!(order.unfilled_size().eq(sz(7)), 0);
}

#[test]
fun test_unfilled_size_zero_when_fully_filled() {
  let ctx = tx_context::dummy();
  let mut order = new_order(sz(10), &ctx);

  order.set_filled_size(sz(10));

  assert!(order.unfilled_size().is_zero(), 0);
}

/// `set_filled_size` does not validate against `size`; `Order` trusts its
/// callers on the `filled_size <= size` invariant, so a violation only
/// surfaces as an arithmetic underflow when `unfilled_size` is read.
#[test, expected_failure(arithmetic_error, location = strike::units)]
fun test_set_filled_beyond_size_underflows_on_read() {
  let ctx = tx_context::dummy();
  let mut order = new_order(sz(10), &ctx);

  order.set_filled_size(sz(11));

  let _ = order.unfilled_size();
}

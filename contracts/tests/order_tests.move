#[test_only]
module nth::order_tests;

use nth::order;

#[test]
fun test_match_side_dispatches_bid_and_ask() {
  assert!(order::bid().match_side!(|| 1u64, || 2u64) == 1, 0);
  assert!(order::ask().match_side!(|| 1u64, || 2u64) == 2, 1);
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

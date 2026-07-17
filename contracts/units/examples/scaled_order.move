/// Example: construct scaled quantities for a leveraged order.
///
/// A 100 USDC/token bid for 10 tokens at 2x leverage — the values a
/// frontend would pass to `nth::pool::place_leveraged_order`.
module units::scaled_order;

use units::leverage::{Self, Leverage};
use units::price::{Self, Price};
use units::scaling::float_scaling;
use units::size::{Self, Size};

// === Public Functions ===

/// Returns `(price, size, leverage)` for a 100 USDC/token, 10-token, 2x order.
public fun example_order_quantities(): (Price, Size, Leverage) {
  (
    price::price(100 * float_scaling()),
    size::size(10 * float_scaling()),
    leverage::leverage(2 * float_scaling()),
  )
}

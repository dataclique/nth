# Float Scaling in Strike Protocol

## Overview

The Strike Protocol uses a float scaling mechanism to handle decimal numbers
in Move, which doesn't natively support floating-point arithmetic. We use a
scaling factor of 1,000,000 (6 decimal places) to represent decimal values as
integers: `constants::FLOAT_SCALING = 10^6`, read via
`constants::float_scaling()`.

The factor is not arbitrary. It MUST equal 10^(USDC decimals): USDC has 6
decimals (see circlefin/stablecoin-sui, `packages/usdc/sources/usdc.move`,
where `create_currency` is called with `decimals = 6`), so one factor of
`FLOAT_SCALING` cancels exactly against USDC's base-unit denominator. This is
what lets `risk::margin_required` divide a double-scaled `price * size`
product by scaled leverage and land directly in `Balance<USDC>` base units.

## Why Float Scaling?

1. **Move Language Limitation**: Move doesn't support floating-point numbers,
   so decimal values are represented as scaled integers.

2. **Precision**: 6 decimal places provide sufficient precision for financial
   calculations.

3. **USDC coupling**: matching USDC's 6 decimals means scaled protocol
   quantities and USDC base units share one scale, so margin amounts convert
   to coin balances without a rescaling step.

## Typed Quantities

Scaled values never cross a function boundary as bare `u64`. `strike::units`
defines one newtype per quantity:

| Type         | Meaning                                          | Scale             |
| ------------ | ------------------------------------------------ | ----------------- |
| `Price`      | USDC-per-token price                             | `float_scaling()` |
| `Size`       | Token quantity                                   | `float_scaling()` |
| `Leverage`   | Position multiplier (2x = `2 * float_scaling()`) | `float_scaling()` |
| `UsdcAmount` | USDC amount in base units (1 USDC = 10^6)        | USDC's 6 decimals |

All four share the 10^6 scale but are **not interchangeable**: multiplying
two scaled values yields a double-scaled result, and mixing units silently
corrupts margin math. The separate types make such mixing a compile error
instead of a silent bug.

## Where the Arithmetic Lives

Every formula that combines quantities — and therefore juggles the scaling
factors — lives in `strike::risk`, and every intermediate product runs in
`u128`: a double-scaled product like `price * size` overflows `u64` for
realistic inputs. No other module multiplies, divides, or rescales these
quantities.

Examples from `strike::risk`:

```move
// margin_required: price * size is double-scaled; dividing by scaled
// leverage cancels one factor, landing in USDC base units.
let value =
  (price.value() as u128) * (size.value() as u128)
    / (leverage.value() as u128);

// maintenance_margin: divide one float scaling back out of the
// double-scaled size * price product.
let value =
  (size.value() as u128) * (price.value() as u128)
    * (maintenance_margin_rate as u128) / 100 / float_scaling;

// is_liquidated: dividing a base-unit margin by a scaled size loses the
// scaling, so multiply it back in to get a scaled price buffer.
let buffer =
  ((margin.value() - maintenance.value()) as u128) * float_scaling
    / (size.value() as u128);
```

## Scaling Rules

1. **Constructing scaled values**: multiply the human-readable number by the
   scaling factor, then wrap it in its type:

   ```move
   units::price(100 * constants::float_scaling())   // 100 USDC
   units::leverage(2 * constants::float_scaling())  // 2x
   ```

2. **Multiplying two scaled values** double-scales the result — divide by
   `float_scaling()` once (or by an equally-scaled divisor, as in
   `margin_required`) to return to a single scale.

3. **Dividing two equally-scaled values** cancels the scaling entirely —
   multiply by `float_scaling()` to restore it when the result should stay
   scaled (as in the `is_liquidated` buffer).

## Example: Placing an Order

```move
pool::place_leveraged_order(
    &mut pool,
    &mut margin_account,
    order::bid(),
    units::price(100 * constants::float_scaling()), // price: 100 USDC
    units::size(10 * constants::float_scaling()),   // size: 10 tokens
    units::leverage(2 * constants::float_scaling()), // leverage: 2x
    test.ctx(),
);
```

# Float Scaling in Nth Market

## Overview

Nth Market uses a float scaling mechanism to handle decimal numbers in Move,
which doesn't natively support floating-point arithmetic. We use a scaling
factor of 1,000,000 (6 decimal places) to represent decimal values as integers:
`scaling::float_scaling() = 10^6`.

The factor is not arbitrary. It MUST equal 10^(USDC decimals): USDC has 6
decimals (see
[`usdc.move` in circlefin/stablecoin-sui](https://github.com/circlefin/stablecoin-sui/blob/master/packages/usdc/sources/usdc.move),
where `create_currency` is called with `decimals = 6`), so one factor of
`FLOAT_SCALING` cancels exactly against USDC's base-unit denominator. This is
what lets `perpetual::risk::initial_margin` divide a double-scaled
`price * size` product by scaled leverage and land directly in USDC base units
as a `UsdcAmount` (which the caller deposits into a `Balance<USDC>` without
rescaling).

## Why Float Scaling?

1. **Move Language Limitation**: Move doesn't support floating-point numbers, so
   decimal values are represented as scaled integers.

2. **Precision**: 6 decimal places provide sufficient precision for financial
   calculations.

3. **USDC coupling**: matching USDC's 6 decimals means scaled protocol
   quantities and USDC base units share one scale, so margin amounts convert to
   coin balances without a rescaling step.

## Typed Quantities

Scaled values never cross a function boundary as bare `u64`. The `units` package
defines one newtype per quantity (see `contracts/units/examples/`):

| Type         | Meaning                                          | Scale             |
| ------------ | ------------------------------------------------ | ----------------- |
| `Price`      | USDC-per-token price                             | `float_scaling()` |
| `Size`       | Token quantity                                   | `float_scaling()` |
| `Leverage`   | Position multiplier (2x = `2 * float_scaling()`) | `float_scaling()` |
| `UsdcAmount` | USDC amount in base units (1 USDC = 10^6)        | USDC's 6 decimals |

All four share the 10^6 scale but are **not interchangeable**: multiplying two
scaled values yields a double-scaled result, and mixing units silently corrupts
margin math. The separate types make such mixing a compile error instead of a
silent bug.

## Where the Arithmetic Lives

Every formula that combines quantities — and therefore juggles the scaling
factors — lives in the owning instrument's risk module (`perpetual::risk` for
the perp), and every intermediate product runs in `u128`: a double-scaled
product like `price * size` overflows `u64` for realistic inputs. No other
module multiplies, divides, or rescales these quantities. Human-readable
formulas are in [margin.md](margin.md) and [liquidation.md](liquidation.md).

### Notation

| Symbol               | Meaning                                                             |
| -------------------- | ------------------------------------------------------------------- |
| $s$                  | Fixed-point scale, $10^6$ (`scaling::float_scaling()`)              |
| $x$, $\hat{x}$       | A human-readable value and its on-chain form, $\hat{x} = x \cdot s$ |
| $P$, $\hat{P}$       | Price (USDC per token)                                              |
| $S$, $\hat{S}$       | Position size (tokens)                                              |
| $L$, $\hat{L}$       | Leverage multiplier                                                 |
| $r_m$                | Maintenance margin rate, in percent                                 |
| $M$                  | Locked margin, in USDC base units                                   |
| $M_i$                | Initial margin, in USDC base units                                  |
| $M_{\mathrm{maint}}$ | Maintenance margin, in USDC base units                              |
| $\Delta P$           | Liquidation price buffer (see [liquidation.md](liquidation.md))     |

USDC amounts ($M$, $M_i$, $M_{\mathrm{maint}}$) are already integers in base
units at scale $s$ (1 USDC = $10^6$ base units) and carry no hat: they are never
rescaled, only produced by formulas that cancel the scaling factors.

### Initial margin

Human form: $M_i = P \cdot S / L$.

On-chain, each factor carries one factor of $s$, so the raw product is scaled by
$s^2$; dividing by $\hat{L}$ removes one $s$:

$$
M_i = \frac{\hat{P} \cdot \hat{S}}{\hat{L}}
$$

```move
let value =
  (price.value() as u128) * (size.value() as u128)
    / (leverage.value() as u128);
```

### Maintenance margin

Human form: $M_{\mathrm{maint}} = P \cdot S \cdot r_m / 100$.

The product $\hat{P} \cdot \hat{S}$ is scaled by $s^2$; dividing by $s$ restores
USDC base units:

$$
M_{\mathrm{maint}} =
  \frac{\hat{P} \cdot \hat{S} \cdot r_m}{100 \cdot s}
$$

```move
let value =
  (size.value() as u128) * (price.value() as u128)
    * (maintenance_margin_rate as u128) / 100 / float_scaling;
```

### Liquidation price buffer

Human form: $\Delta P = (M - M_{\mathrm{maint}}) / S$.

$M$ is in base units (scale $s$) while $\hat{S}$ is scaled by $s$, so multiply
by $s$ to recover a scaled price delta:

$$
\widehat{\Delta P} = \frac{(M - M_{\mathrm{maint}}) \cdot s}{\hat{S}}
$$

```move
let buffer =
  ((margin.value() - maintenance.value()) as u128) * float_scaling
    / (size.value() as u128);
```

## Scaling Rules

1. **Constructing scaled values**: multiply the human-readable number by the
   scaling factor, then wrap it in its type:

   ```move
   price::price(100 * scaling::float_scaling())   // 100 USDC
   leverage::leverage(2 * scaling::float_scaling())  // 2x
   ```

2. **Multiplying two scaled values** double-scales the result — divide by
   `float_scaling()` once (or by an equally-scaled divisor, as in
   `initial_margin`) to return to a single scale.

3. **Dividing two equally-scaled values** cancels the scaling entirely —
   multiply by `float_scaling()` to restore it when the result should stay
   scaled (as in the liquidation buffer).

## Example: Placing an Order

```move
perp::place_limit_order(
    &mut market,
    &margin_account,
    order::bid(),
    price::price(100 * scaling::float_scaling()), // price: 100 USDC
    size::size(10 * scaling::float_scaling()),   // size: 10 tokens
    leverage::leverage(2 * scaling::float_scaling()), // leverage: 2x
    test.ctx(),
);
```

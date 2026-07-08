# Liquidation Price Calculation

Used formulas from
[ByBit's liquidation-price article (USDT contracts)](https://www.bybit.com/en/help-center/article/Liquidation-Price-USDT-Contract).

Liquidation occurs when the current price reaches the liquidation price, causing
the position's margin to fall below the required maintenance margin level. The
position is then closed at the bankruptcy price (0% margin level).

## Formulas

### For Long (Bid) Positions

The liquidation price for a long position is calculated as:

$$LiquidationPrice_{long} = EntryPrice - \frac{InitialMargin - MaintenanceMargin}{PositionSize}$$

Where:

- $InitialMargin = \frac{PositionSize \times EntryPrice}{Leverage}$
- $MaintenanceMargin = PositionSize \times EntryPrice \times \frac{MaintenanceMarginRate}{100}$

### For Short (Ask) Positions

The liquidation price for a short position is calculated same like for long, but
with another sign:

$$LiquidationPrice_{short} = EntryPrice + \frac{InitialMargin - MaintenanceMargin}{PositionSize}$$

## Leverage Cap

Initial margin covers the maintenance margin exactly when:

$$Leverage \le \frac{100}{MaintenanceMarginRate}$$

`risk::max_leverage` computes this bound, and `pool::place_leveraged_order`
enforces it at order placement: zero leverage or leverage above the cap aborts
with `EInvalidLeverage`. Above the cap the initial margin is below the
maintenance margin, so the position would be born past its liquidation
threshold.

At **exactly** the maximum leverage the initial and maintenance margins are
equal, the margin buffer is zero, and the liquidation price equals the entry
price: the position liquidates the moment the price touches entry.

## Example Calculations

### Mid-Range: 2x Long Position

Given:

- Entry Price = 100 USDC
- Position Size = 2
- Leverage = 2
- Maintenance Margin Rate = 25% (max leverage = 100 / 25 = 4)

Calculations:

1. Initial Margin = $\frac{2 \times 100}{2} = 100$ USDC
2. Maintenance Margin = $2 \times 100 \times \frac{25}{100} = 50$ USDC
3. Liquidation Price = $100 - \frac{100 - 50}{2} = 75$ USDC

The position carries a 25-USDC-per-unit buffer below entry and is liquidated
when the price drops to 75 USDC.

### Boundary: 4x Long Position at Maximum Leverage

Given:

- Entry Price = 95 USDC
- Position Size = 5
- Leverage = 4 (exactly the maximum for a 25% maintenance margin rate)
- Maintenance Margin Rate = 25%

Calculations:

1. Initial Margin = $\frac{5 \times 95}{4} = 118.75$ USDC
2. Maintenance Margin = $5 \times 95 \times \frac{25}{100} = 118.75$ USDC
3. Liquidation Price = $95 - \frac{118.75 - 118.75}{5} = 95$ USDC

This is the boundary case: initial margin equals maintenance margin, the buffer
is zero, and the liquidation price equals the entry price. Any price at or below
95 USDC liquidates the position immediately. One step of leverage above this is
rejected at placement with `EInvalidLeverage`.

## Implementation Notes

All margin and liquidation formulas live in `strike::risk` (`margin_required`,
`maintenance_margin`, `max_leverage`, `is_liquidated`). Every intermediate
product runs in `u128`: double-scaled values like $Price \times Size$ overflow
`u64` for realistic inputs.

`risk::is_liquidated` evaluates the formulas as follows:

1. If the margin is **strictly below** the maintenance margin, the position is
   liquidated at any price. (The naive $InitialMargin - MaintenanceMargin$
   subtraction would underflow-abort here; the guard makes the degenerate case
   explicit instead.) A margin exactly equal to maintenance falls through with a
   zero buffer, which is what makes the max-leverage boundary case liquidate at
   the entry price.
2. Otherwise it computes the per-unit price buffer
   $\frac{Margin - MaintenanceMargin}{PositionSize}$ and compares:
   - **Long**: liquidated when $CurrentPrice \le EntryPrice - Buffer$. If the
     buffer is at or above the entry price, the liquidation price would be at or
     below zero — no price drop can ever reach it, so the long is never
     liquidated on the downside.
   - **Short**: liquidated when $CurrentPrice \ge EntryPrice + Buffer$.

`pool::check_liquidations` drives the sweep: it reads the current price from the
pool's oracle and calls `orderbook::remove_liquidated_bids` /
`remove_liquidated_asks`, each a single O(n) pass that removes every position
past its threshold. Each removal emits a `PositionLiquidated` event carrying
both the position's entry price and the oracle price that triggered it. The
oracle price itself only moves through `pool::update_price`, which is gated by
the pool's `PriceCap` capability.

The maintenance margin rate is a per-pool parameter that can be adjusted based
on market conditions and risk management requirements.

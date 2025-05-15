# Liquidation Price Calculation

Used formulas from ByBit: https://www.bybit.com/en/help-center/article/Liquidation-Price-USDT-Contract

Liquidation occurs when the current price reaches the liquidation price, causing the position's margin to fall below the required maintenance margin level. The position is then closed at the bankruptcy price (0% margin level).

## Formulas

### For Long (Bid) Positions

The liquidation price for a long position is calculated as:

$$LiquidationPrice_{long} = EntryPrice - \frac{InitialMargin - MaintenanceMargin}{PositionSize}$$

Where:
- $InitialMargin = \frac{PositionSize \times EntryPrice}{Leverage}$
- $MaintenanceMargin = PositionSize \times EntryPrice \times \frac{MaintenanceMarginRate}{100}$

### For Short (Ask) Positions

The liquidation price for a short position is calculated same like for long, but with another sign:

$$LiquidationPrice_{short} = EntryPrice + \frac{InitialMargin - MaintenanceMargin}{PositionSize}$$

## Example Calculation

Let's walk through an example from the test case:

### Long Position Example

Given:
- Entry Price = 95 USDC
- Position Size = 5
- Leverage = 4
- Maintenance Margin Rate = 25%

Calculations:
1. Initial Margin = $\frac{5 \times 95}{4} = 118.75$ USDC
2. Maintenance Margin = $5 \times 95 \times \frac{25}{100} = 118.75$ USDC
3. Liquidation Price = $95 - \frac{118.75 - 118.75}{5} = 95$ USDC

This means the position will be liquidated when the price drops to 95 USDC.

## Implementation Notes

The liquidation check is performed in the `check_and_remove_liquidated_bid` and `check_and_remove_liquidated_ask` functions. These functions:

1. Iterate through all orders in the orderbook
2. Calculate the liquidation price for each position
3. Compare the current price with the liquidation price
4. If the position should be liquidated:
   - Remove the order from the orderbook
   - Emit a `PositionLiquidated` event

The maintenance margin rate is a parameter that can be adjusted based on market conditions and risk management requirements. 
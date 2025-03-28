# Perpetual futures

## Margin

After you sign in, you will need to acquire Arbitrum Ethereum (ETH) and USDC for transactions and trades. ETH will only be used to pay gas fees for depositing USDC. USDC will be used as collateral or margin for your Hyperliquid trading account.

### isolated vs cross

In **isolated margin** mode, the margin allocated to a specific position is separate from the rest of your account balance. If the position is liquidated, only the margin allocated to that position is lost.

$$
Isolated Margin = \frac{Position Size}{Leverage}
$$

_For hyperliquid_: `position_size * mark_price / leverage`
The initial margin is used by the position and cannot be withdrawn for cross margin positions.

In **cross margin** mode, the entire account balance is used as margin for all open positions. This means that if one position faces a margin call, the entire account balance can be used to cover the loss.

$$
Cross Margin = Total Account Balance
$$

hyperliquid: https://hyperliquid.gitbook.io/hyperliquid-docs/trading/margining

### initial vs maintenance

**The initial margin** is the amount of collateral required to open a new position. It is a percentage of the total position value and is determined by the leverage chosen by the trader.

The higher the leverage, the lower the initial margin required, but the higher the risk of liquidation.

$$
Initial margin = \frac{Position Size}{Leverage}
$$

**The maintenance margin**. A liquidation event occurs when a trader's positions move against them to the point where the account equity falls below the maintenance margin.

The maintenance margin is half of the initial margin at max leverage, which varies from 3-40x. In other words, the maintenance margin is between 1.25% (for 40x max leverage assets) and 16.7% (for 3x max leverage assets) depending on the asset.

hyperliquid: https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations

## Leverage

### position leverage

Leverage is a mechanism that allows traders to control a larger position size with a smaller amount of capital (margin). It is expressed as a ratio (e.g., 10x, 20x, 50x).

$$
Position Leverage = \frac{Position Size}{Margin}
$$

### cross account leverage

No info in the internet. Deepseek: Cross account leverage is a feature used in perpetual futures trading that applies a single leverage setting across all open positions in a trading account.

## liquidations

### liquidation price

When entering a trade, an estimated liquidation price is shown. This estimation may be inaccurate compared to the position's estimated liquidation price due to changing liquidity on the book.

Once a position is opened, a liquidation price is shown. This price has the certainty of the entry price, but still may not be the actual liquidation price due to funding payments or changes in unrealized pnl in other positions (for cross margin positions).

The actual liquidation price is independent on the leverage set for cross margin positions. A cross margin position at lower leverage simply uses more collateral.

The liquidation price does depend on leverage set for isolated margin positions, because the amount of isolated margin allocated depends on the initial margin set.

The precise formula for the liquidation price of a position is

$$
liq\_price = price - \frac{side}{margin\_available / position\_size / (1 - l * side)}
$$

where

$l = \frac{1}{MAINTENANCE\_LEVERAGE}$

Side: $1$ for long and $-1$ for short

Margin available:

$$
margin\_available (cross) = account\_value - maintenance\_margin\_required
$$

$$
margin\_available (isolated) = isolated\_margin - maintenance\_margin\_required
$$

Hyperliquid: https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations#computing-liquidation-price

### liquidation mechanism

Copypaste from: https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations

A liquidation event occurs when a trader's positions move against them to the point where the account equity falls below the maintenance margin. The maintenance margin is half of the initial margin at max leverage, which varies from 3-40x. In other words, the maintenance margin is between 1.25% (for 40x max leverage assets) and 16.7% (for 3x max leverage assets) depending on the asset.

When the account equity drops below maintenance margin, the positions are first attempted to be entirely closed by sending market orders to the book. The orders are for the full size of the position, and may be fully or partially closed. If the positions are entirely or partially closed such that the maintenance margin requirements are met, any remaining collateral remains with the trader.

If the account equity drops below 2/3 of the maintenance margin without successful liquidation through the book, a backstop liquidation happens through the liquidator vault. See Liquidator Vault explanation below for more details.

When a cross position is backstop liquidated, the trader's cross positions and cross margin are all transferred to the liquidator. In particular, if the trader has no isolated positions, the trader ends up with zero account equity.

When an isolated position is backstop liquidated, that isolated position and isolated margin are transferred to the liquidator. The user's cross margin and positions are untouched.

During backstop liquidation, the maintenance margin is not returned to the user. This is because the liquidator vault requires a buffer to make sure backstop liquidations are profitable on average. In order to avoid losing the maintenance margin, traders can place stop loss orders or exit the positions before the mark price reaches the liquidation price.

Liquidations use the mark price, which combines external CEX prices with Hyperliquid's book state. This makes liquidations more robust than using a single instantaneous book price. During times of high volatility or on highly leveraged positions, mark price may be significantly different from book price. It is recommended to use the exact formula for precise monitoring of liquidations.

## More links

https://www.binance.com/en/futures/trading-rules/perpetual/leverage-margin — binance leverage and margin table

https://www.okx.com/help/ii-what-is-margin-in-perpetual-swaps — what is margin in futures trading

https://www.tradingview.com/news/cointelegraph:f14103046094b:0-hyperliquid-ups-margin-requirements-after-4-million-liquidation-loss/ - Hyperliquid ups margin requirements after $4 million liquidation loss (only for big boys)

https://help.coinbase.com/en/coinbase/trading-and-funding/derivatives/pf-liquidation-mgmt - coinbase table of liquidation stages

https://help.coinbase.com/en/coinbase/trading-and-funding/derivatives/pf-terms-defs - base terms

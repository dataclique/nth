# Liquidation Price Calculation

Liquidation occurs when the oracle price crosses a position's liquidation
threshold: locked margin falls to the maintenance margin level (or below). The
position is then removed from the book; its collateral stays in the pool vault.

Formulas follow
[ByBit's liquidation-price article (USDT contracts)](https://www.bybit.com/en/help-center/article/Liquidation-Price-USDT-Contract).
Initial and maintenance margin definitions, collateral flow, and the leverage
cap are in [margin.md](margin.md).

## Notation

| Symbol               | Meaning                           |
| -------------------- | --------------------------------- |
| $P_e$                | Entry price                       |
| $P$                  | Current (oracle) price            |
| $S$                  | Position size                     |
| $L$                  | Leverage                          |
| $r_m$                | Maintenance margin rate (percent) |
| $M$                  | Locked margin (USDC)              |
| $M_i$                | Initial margin at entry           |
| $M_{\mathrm{maint}}$ | Maintenance margin                |
| $\Delta P$           | Price buffer above maintenance (defined below) |
| $L_{\max}$           | Highest leverage whose $M_i$ covers $M_{\mathrm{maint}}$, $100 / r_m$ |

$$
M_i = \frac{P_e \cdot S}{L}
\qquad
M_{\mathrm{maint}} = P_e \cdot S \cdot \frac{r_m}{100}
$$

## Price Buffer

The margin cushion above maintenance, spread per unit of size:

$$
\Delta P = \frac{M - M_{\mathrm{maint}}}{S}
$$

For a freshly opened position with full initial margin, $M = M_i$ and
$\Delta P = (M_i - M_{\mathrm{maint}}) / S$.

## Liquidation Prices

### Long (bid)

$$
P_{\mathrm{liq, long}} = P_e - \Delta P
= P_e - \frac{M_i - M_{\mathrm{maint}}}{S}
$$

Substituting the margin formulas:

$$
P_{\mathrm{liq, long}}
= P_e - \frac{P_e \cdot S / L - P_e \cdot S \cdot r_m / 100}{S}
= P_e \left(1 - \frac{1}{L} + \frac{r_m}{100}\right)
$$

### Short (ask)

$$
P_{\mathrm{liq, short}} = P_e + \Delta P
= P_e + \frac{M_i - M_{\mathrm{maint}}}{S}
$$

## Liquidation Condition

`risk::is_liquidated` evaluates in two stages:

1. **Margin below maintenance** — if $M < M_{\mathrm{maint}}$, liquidate at any
   price. (This guards the degenerate case where $M_i - M_{\mathrm{maint}}$
   would underflow for $L > L_{\max}$.)
2. **Price threshold** — otherwise compute $\Delta P$ and compare:
   - **Long:** liquidated when $P \le P_e - \Delta P$.
   - **Short:** liquidated when $P \ge P_e + \Delta P$.

For a long, if $\Delta P \ge P_e$ the liquidation price would be at or below
zero — no downward move can reach it, so the position is never liquidated on the
downside.

## Leverage Cap

Initial margin covers maintenance exactly when:

$$
L \le \frac{100}{r_m} = L_{\max}
$$

`risk::max_leverage` computes this bound; `pool::place_leveraged_order` enforces
it at placement. Above the cap, $M_i < M_{\mathrm{maint}}$ and the position
would be born past its liquidation threshold (`EInvalidLeverage`).

At **exactly** $L_{\max}$:

$$
M_i = M_{\mathrm{maint}}
\quad\Longrightarrow\quad
\Delta P = 0
\quad\Longrightarrow\quad
P_{\mathrm{liq}} = P_e
$$

The position liquidates the moment price touches entry.

## Example Calculations

### Mid-range: 2× long

Given: $P_e = 100$, $S = 2$, $L = 2$, $r_m = 25$ ($L_{\max} = 4$).

$$
M_i = \frac{2 \times 100}{2} = 100\,\text{USDC}
$$

$$
M_{\mathrm{maint}} = 2 \times 100 \times \frac{25}{100} = 50\,\text{USDC}
$$

$$
P_{\mathrm{liq, long}} = 100 - \frac{100 - 50}{2} = 75\,\text{USDC}
$$

The position carries a 25 USDC-per-unit buffer below entry.

### Boundary: 4× long at maximum leverage

Given: $P_e = 95$, $S = 5$, $L = 4$, $r_m = 25$.

$$
M_i = \frac{5 \times 95}{4} = 118.75\,\text{USDC}
$$

$$
M_{\mathrm{maint}} = 5 \times 95 \times \frac{25}{100} = 118.75\,\text{USDC}
$$

$$
P_{\mathrm{liq, long}} = 95 - \frac{118.75 - 118.75}{5} = 95\,\text{USDC}
$$

Initial margin equals maintenance; any price at or below entry liquidates
immediately. One step of leverage above this is rejected at placement.

## Implementation Notes

All margin and liquidation formulas live in `strike::risk` (`margin_required`,
`maintenance_margin`, `max_leverage`, `is_liquidated`). Every intermediate
product runs in `u128`: double-scaled values like $P \cdot S$ overflow `u64` for
realistic inputs.

`pool::check_liquidations` drives the sweep: it rejects stale oracle prices
(older than `pool::max_oracle_staleness_ms()`), then reads the current price
from the pool's oracle and calls `orderbook::remove_liquidated_bids` /
`remove_liquidated_asks`, each a single $O(n)$ pass that removes every position
past its threshold. Each removal emits a `PositionLiquidated` event carrying
both the position's entry price and the oracle price that triggered it. The
oracle price only moves through `pool::update_price`, gated by the pool's
`PriceCap` capability.

The maintenance margin rate $r_m$ is a per-pool parameter adjustable for risk
management. See [margin.md](margin.md) for how margin is locked, refunded, and
swept.

# Funding Rate Mechanism

Perpetual positions never expire, so a funding mechanism tethers the book's
traded price to the mark price: when the book trades above the mark, longs pay
shorts; when below, shorts pay longs. The payment scales with how far the book
has drifted, which pushes traders to close the gap.

Positions on the composable instrument standard are account-bound entries in a
table and cannot be enumerated on-chain, so funding settles through a **lazy
funding index** (`perpetual::funding`) rather than an eager per-position sweep.

Margin and liquidation definitions are in [margin.md](margin.md) and
[liquidation.md](liquidation.md).

## Notation

| Symbol     | Meaning                                                               |
| ---------- | --------------------------------------------------------------------- |
| $P_b$      | Best bid price (highest resting buy)                                  |
| $P_a$      | Best ask price (lowest resting sell)                                  |
| $P_m$      | Book mid price, $(P_b + P_a) / 2$                                     |
| $P_o$      | Mark price (staleness-checked oracle)                                 |
| $r$        | Funding rate for one round, in basis points (1 bp = 0.01%)            |
| $r_{\max}$ | Per-round rate cap, 100 bps (`perpetual::risk::max_funding_rate_bps`) |
| $S$        | Position size                                                         |
| $T$        | Period interval, set per market at `perp::register_funding`           |
| $\Delta$   | Cumulative index delta since an account's last accrual                |

## Rate

The round's rate is the book's divergence from the mark, capped:

$$
r = \min\!\left(\left\lfloor \frac{\lvert P_m - P_o \rvert}{P_o} \cdot 10^4 \right\rfloor,\; r_{\max}\right)
$$

The **paying side** is whichever side pushed the book away from the mark:

- $P_m > P_o$ — the book trades above the mark, longs (bids) pay.
- $P_m < P_o$ — the book trades below the mark, shorts (asks) pay.
- $P_m = P_o$ — $r = 0$; no funding flows this round.

The cap $r_{\max}$ bounds the margin a single round can move regardless of how
far the mid drifts, so a manipulated or thin book cannot force an arbitrarily
large transfer. (`perpetual::risk::funding_rate_bps`.)

## Rounds and the cumulative index

`perp::settle_funding_round` is **permissionless** — anyone may settle a due
round and earn a capped keeper reward from the market's pre-funded reserve
through the kernel's maintenance bookkeeping: periods apply sequentially and
exactly once, become claimable only at their wall-clock start (past periods
catch up immediately), and the mark price must be fresh. An empty book side or
zero divergence advances the cadence without moving the index.

Each non-zero round adds $P_o \cdot r$ — deliberately undivided, to keep
precision — to the paying side's cumulative index (`long_pays` or `short_pays`).
`FundingRoundSettled` records the period, rate, paying side, and mark price.

## Accrual and settlement

Each account carries a cursor snapshotted at every position change. The amount
accrued over an index delta $\Delta$ is:

$$
f = S \cdot \Delta \,/\, 10^6 \,/\, 10^4
$$

using the mark price of each round rather than the entry price. Longs accrue
`long_pays` deltas as payable and `short_pays` deltas as receivable; shorts the
reverse. Accrual is pure bookkeeping and happens automatically before every
fill, liquidation, and explicit settlement, so a position's funding is always
measured at the size it actually held.

`perp::settle_account_funding` is permissionless: it nets both directions and
moves collateral through the kernel's carry transition against the pre-funded
reserve account —

- **payments** debit the payer's position collateral, capped at what the
  position holds; the remainder is forgiven ("pays what it has, never driven
  below zero") and the under-margined position is left for liquidation;
- **receivables** credit from the reserve's free collateral into the account's
  position collateral (or free collateral for a flat account), so the reserve
  absorbs timing gaps and forgiven shortfalls.

Funding is **margin bookkeeping, not a coin transfer** — carry conserves USDC
inside the market silo, so the market total is invariant across settlement.

## Example

Given: $P_b = 99$, $P_a = 103$, $P_o = 100$, both sides holding $S = 4$ at 2×
leverage.

$$
P_m = \frac{99 + 103}{2} = 101
\qquad
r = \left\lfloor \frac{101 - 100}{100} \cdot 10^4 \right\rfloor = 100\ \text{bps}
$$

The mid is above the mark, so longs pay. One round adds $100 \cdot 100$ to the
`long_pays` index; the long's accrued payable is
$4 \cdot 100 \cdot 100 / 10^4 = 4$ USDC, and settlement moves 4 USDC of its
position collateral to the reserve while the short's settlement draws 4 USDC
from the reserve into its margin. The market total is unchanged.

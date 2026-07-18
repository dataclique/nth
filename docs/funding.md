# Funding Rate Mechanism

Perpetual positions never expire, so a funding mechanism tethers the book's
traded price to the oracle's spot price: when the book trades above spot, longs
pay shorts; when below, shorts pay longs. The payment scales with how far the
book has drifted, which pushes traders to close the gap.

Margin and liquidation definitions are in [margin.md](margin.md) and
[liquidation.md](liquidation.md).

## Notation

| Symbol     | Meaning                                                      |
| ---------- | ------------------------------------------------------------ |
| $P_b$      | Best bid price (highest resting buy)                         |
| $P_a$      | Best ask price (lowest resting sell)                         |
| $P_m$      | Book mid price, $(P_b + P_a) / 2$                            |
| $P_o$      | Oracle (spot) price                                          |
| $r$        | Funding rate for one round, in basis points (1 bp = 0.01%)   |
| $r_{\max}$ | Per-round rate cap, 100 bps (`risk::max_funding_rate_bps()`) |
| $P_i$      | Entry price of position $i$                                  |
| $S_i$      | Size of position $i$                                         |
| $N_i$      | Notional of position $i$, $P_i \cdot S_i$                    |
| $f_i$      | Funding payment for position $i$                             |
| $T$        | Funding interval, 1 hour (`pool::funding_interval_ms()`)     |

## Rate

The round's rate is the book's divergence from spot, capped:

$$
r = \min\!\left(\left\lfloor \frac{\lvert P_m - P_o \rvert}{P_o} \cdot 10^4 \right\rfloor,\; r_{\max}\right)
$$

The **paying side** is whichever side pushed the book away from spot:

- $P_m > P_o$ — the book trades above spot, longs (bids) pay.
- $P_m < P_o$ — the book trades below spot, shorts (asks) pay.
- $P_m = P_o$ — $r = 0$; no funding flows this round.

The cap $r_{\max}$ bounds the margin a single round can move regardless of how
far the mid drifts, so a manipulated or thin book cannot force an arbitrarily
large transfer. (`risk::funding_rate_bps`.)

## Payment

Each position on the paying side owes its notional scaled by the rate:

$$
f_i = N_i \cdot \frac{r}{10^4} = P_i \cdot S_i \cdot \frac{r}{10^4}
$$

The payment is capped at the position's remaining margin — a position whose
margin would go negative pays what it has and is left for the next liquidation
sweep, never driven below zero. (`risk::funding_payment`, capped in
`orderbook::apply_funding`.)

## Distribution

The total collected from the paying side is distributed to the receiving side
**pro-rata by notional**: a position holding a larger share of the opposing
notional receives a proportionally larger share of the funding.

$$
\text{receipt}_i = \left(\sum_j f_j\right) \cdot \frac{N_i}{\sum_k N_k}
$$

where $j$ ranges over payers and $k$ over receivers. Integer truncation can
leave a few base units of dust (strictly less than the receiver count)
unassigned; that dust stays in the vault.

Funding is **margin bookkeeping, not a coin transfer** — it adjusts the margin
field of resting orders and moves no USDC in or out of the vault, so the vault
total is invariant across a round.

## Cadence

`pool::update_funding` is **permissionless** — anyone may call it, once per
interval $T$. A call before $T$ has elapsed since the last round aborts with
`EFundingTooSoon`. Each round stamps the pool's `last_funding_time` and emits
`FundingApplied` (rate, paying side, collected, distributed, timestamp),
including zero-flow rounds that only advance the clock (empty book side or
$r = 0$).

Permissionless triggering with a fixed cadence means no privileged keeper is
required and no party can run funding more often than $T$ to bleed the other
side.

## Example

Given: $P_b = 99$, $P_a = 103$, $P_o = 100$, both sides holding $S = 4$ at 2×
leverage.

$$
P_m = \frac{99 + 103}{2} = 101
\qquad
r = \left\lfloor \frac{101 - 100}{100} \cdot 10^4 \right\rfloor = 100\ \text{bps}
$$

The mid is above spot, so the long pays. Its notional is $99 \cdot 4 = 396$
USDC, so:

$$
f = 396 \cdot \frac{100}{10^4} = 3.96\ \text{USDC}
$$

The long's margin ($99 \cdot 4 / 2 = 198$) becomes $194.04$; the short's
($103 \cdot 4 / 2 = 206$) becomes $209.96$. The vault total, $404$ USDC, is
unchanged.

## Funding on the instrument standard

The perpetual reference instrument (`contracts/perpetual`) keeps the rate
formula above but replaces the eager per-order sweep with a **lazy funding
index**, because positions on the standard are account-bound entries in a table
and cannot be enumerated on-chain.

- Each permissionless round (a keeper-rewarded maintenance claim through the
  kernel's sequential one-time periods) computes $r$ from the live book mid and
  a staleness-checked mark price, then adds $P_o \cdot r$ to the paying side's
  cumulative index (`long_pays` or `short_pays`), undivided to keep precision.
- Each account carries a cursor snapshotted at every position change; the amount
  accrued over an index delta $\Delta$ is $S \cdot \Delta / 10^6 /
  10^4$, using the mark price of each round rather than the entry price.
- Accrual is pure bookkeeping. `settle_account_funding` is permissionless: it
  nets both directions and moves collateral through the kernel's carry
  transition against a pre-funded reserve account — payments debit position
  collateral (capped at what the position holds, remainder forgiven, exactly as
  above), receivables credit from the reserve's free collateral, so the reserve
  absorbs timing gaps and forgiven shortfalls.

# 02. Composable instrument standard for orderbook markets

- Status: Proposed
- Date: 2026-07-17
- Issue: none — protocol direction shaped directly before implementation

## Context

Nth Market currently implements a prototype orderbook with early
perpetual-specific work, not a complete perpetuals protocol. `Order` already
contains leverage, margin, entry price, and funding state. `OrderBook` matches
orders, but also contains initial funding and liquidation behavior. `Pool` owns
an oracle, margin formulas, funding cadence, vault, and lifecycle entry points.
Position realization, complete PnL settlement, production liquidation, and the
other parts of a full perpetual lifecycle are not finished.

This is the right point to establish the standard: the CLOB is concrete enough
to reveal the boundary, while no complete perpetual implementation or deployed
liquidity has to be migrated. The current coupling was useful while proving the
CLOB, but it prevents the intended product:

- the same matching engine should trade perpetuals, dated futures, options, fund
  and index products, leveraged products, and managed strategies;
- an instrument should be usable as the economic reference for another
  instrument without modifying the orderbook;
- third-party packages should be able to define instruments without asking Nth
  Market to add a variant to a closed product enum;
- community-funded and proprietary market-making strategies should be investable
  instruments under the same standard, not privileged venue infrastructure
  bolted on beside it;
- on-chain access should remain permissionless even when the Nth Market API and
  frontend apply risk labels, warnings, simulation, and default filtering.

Sui's `Coin<T>` is not sufficient. A coin is a freely transferable positive
balance. A derivative position can be a liability, can require collateral, can
receive or pay carry, can expire, and can be forcibly reduced or closed.
Unrestrictedly transferring a short or under-margined position would transfer an
obligation without recipient consent or a solvency check. If ordinary coins were
sufficient, the product could use a spot venue such as DeepBook instead of
maintaining a derivative-aware orderbook.

The orderbook must nevertheless remain economically ignorant. It is not an AMM,
an oracle, a valuation engine, a payoff language, or a risk model. Market
participants price orders. An instrument implementation decides whether it needs
an oracle and, if so, which oracle and formula determine funding, settlement, or
liquidation.

Four reference instruments expose the required range of behavior:

1. a spot-like fund or strategy share with issuance, redemption, and
   distributions;
2. a linear perpetual with recurring funding and liquidation;
3. a European cash-settled option with terminal settlement;
4. a community-funded, non-custodial market-making strategy whose manager can
   trade pooled capital within on-chain limits.

The standard must serve all four without pretending their economic formulas are
the same.

## Decision

Define a type-parameterized, account-bound position standard and make the CLOB a
headless matching kernel over that instrument type.

Conceptually, the common types are:

- `Market<Instrument>`: one isolated market instance and one orderbook for a
  fungible unit of exposure;
- `Order<Instrument>`: a resting or incoming request containing only matching
  data and references to reserved resources;
- `Position<Instrument>`: one net, account-bound exposure for one margin account
  in one market;
- a non-droppable fill obligation: the complete batch of matched deltas that
  must be settled atomically before the transaction can finish;
- an instrument witness: a type whose private construction lets the defining
  package invoke lifecycle transitions for its own markets.

These names describe responsibilities, not frozen Move signatures. Exact public
types and functions are decided only after cross-package feasibility spikes.
Published Move APIs and event layouts are effectively permanent, so this ADR
deliberately specifies behavior before ABI.

### Position model

A margin account has at most one net position per market. The position is a
discriminated state:

- `Flat`;
- `Long { size }`;
- `Short { size }`.

It is not a signed integer, two unrelated balances, or a vector of fill lots.
Opposing fills reduce, close, or flip the existing exposure. Distinct strikes,
expiries, basket definitions, or other contract terms are distinct markets and
therefore distinct positions.

One net position gives users one exposure, collateral requirement, and
liquidation state per market. Fill-level cost basis and history are
reconstructed off-chain from immutable fill events. Users who later need
strategy isolation can use separate margin accounts; v1 does not add a hedge
mode that holds economically cancelling long and short positions in one account.

`Position<Instrument>` is logically bound to its margin-account ID but
physically stored in the shared market's keyed position table. A later taker
transaction cannot include the address-owned margin account of a resting maker,
so storing maker exposure under that owned object would make automatic
settlement impossible. Making every margin account shared would instead add
global contention and expose a much broader mutation surface.

The market table is keyed by margin-account ID and contains at most one
`Position<Instrument>` for that account and market. The position has no `key`,
the standard exposes no extraction function, and external packages can neither
transfer it nor mutate the table directly. Voluntary actions still require the
address-owned margin account and sender authorization; a later fill uses the
already-recorded account ID to update both shared-market positions atomically.

Position exposure changes only through standardized lifecycle transitions. A
future liability transfer is a novation requiring recipient consent and a
post-transfer solvency check, not a generic `transfer`. Novation is outside v1.

### Orders are not positions

An order is an instruction plus a reservation. A position is settled exposure.
Placing or cancelling a resting order changes reserved capacity, not filled
exposure. A fill changes positions and consumes the corresponding reservation.

The generic orderbook owns only:

- order identity;
- margin-account identity;
- side;
- limit price;
- quantity and remaining quantity;
- price-time priority;
- reservation identity;
- matching, fill production, and cancellation.

It does not own leverage, collateral formulas, entry-price accounting, funding
state, oracle state, expiry, exercise, NAV, rebalancing, or liquidation rules.

### Atomic fill obligations

The instrument package wraps the matching kernel:

1. It validates the caller and instrument-specific order requirements.
2. It supplies the required amount to the standard-owned reservation transition
   in that isolated market.
3. It calls the generic matching kernel.
4. The kernel updates the book and returns a non-droppable batch describing
   every maker/taker fill and any resting remainder.
5. The instrument implementation inspects the next fill and supplies the
   instrument-calculated reservation amounts to consume for each side.
6. A standard-owned settlement transition moves those amounts into position
   collateral, updates both generic net positions, and advances a private
   settlement cursor exactly once.
7. The instrument consumes the obligation only after the cursor proves every
   fill settled and all post-trade checks succeed.

An unconsumed obligation aborts the whole transaction. Matching can therefore
remain reusable without allowing a caller to keep a fill while skipping its
generic position settlement. Merely requiring an instrument witness when
destroying the hot potato is insufficient: the instrument package can construct
its own witness and could consume immediately. Completion therefore checks
standard-owned progress rather than trusting the wrapper.

Move has static generic dispatch rather than an EVM-style runtime interface
call. The kernel does not discover and call an unknown package. A third-party
instrument package defines its witness and calls the kernel around its own
logic. Feasibility spikes must prove that private witnesses, phantom type
parameters, wrapped positions or dynamic fields, and hot-potato obligations
compose safely across package boundaries before signatures are published.

### Lifecycle transitions

The standard provides constrained state and collateral transitions. The
instrument implementation supplies the amount, timing, formula, and any oracle
evidence.

#### Trade

A matched fill opens, increases, reduces, closes, or flips net exposure. The
transition consumes reservations, updates both counterparties, moves any
immediate premium or collateral, and proves post-trade solvency according to the
instrument implementation.

#### Issuance and redemption

An implementation can issue exposure against deposited assets and redeem
exposure back into assets. This supports fund shares, index products, strategy
vaults, and other positive claims without forcing their positions to become
freely transferable coins.

The kernel exposes these as `instrument_market::issue_long_claim` and
`redeem_long_claim`. The instrument supplies claim size and collateral amounts
while holding its private witness; the standard verifies ownership, requires a
flat or long claim, moves free ↔ position collateral without minting USDC, and
emits primitive events. NAV-to-share math, minimum-output bounds, and
first-depositor defenses remain instrument responsibilities.

The transition includes caller-provided minimum-output or maximum-input bounds.
Implementations that calculate shares from NAV must define rounding and defend
the empty-vault and first-depositor cases. Direct asset donations cannot
silently let an existing holder capture a later depositor through share-price
inflation.

#### Carry

A carry transition applies a directed cash flow without changing position
quantity. It can represent:

- perpetual funding;
- dividends;
- coupons;
- interest or yield distributions;
- streaming or performance fees;
- other periodic debits or credits.

The kernel exposes this as `instrument_market::apply_carry`. The instrument
supplies payer, receiver, amount, accounting period, and whether each side
debits or credits position versus free collateral while holding its private
witness. The standard enforces market isolation, positive amount, distinct
accounts, available collateral, conservation, and a `CarryApplied` event. Period
idempotence and funding formulas remain instrument responsibilities.

The standard does not require these cash flows to share a calculation. Every
cash flow identifies its source, recipients, amount, direction, accounting
period, and any explicit rounding remainder. A funding implementation may
transfer between longs and shorts; a dividend implementation may distribute from
an issuer reserve; a vault may reinvest PnL instead of distributing it.

#### Permissionless maintenance

The standard does not define a dynamically dispatched `tick` callback. Move
cannot discover and invoke arbitrary instrument code, and one generic name would
hide materially different oracle, funding, expiry, NAV, and distress semantics.
Each implementation instead exposes explicit maintenance functions such as
`settle_funding`, `settle_expiry`, or `reconcile_nav`.

An implementation can make maintenance permissionless and reward the caller. The
standard supplies common bookkeeping rather than the calculation:

- a unique action key containing the market, action kind, and period or nonce;
- idempotence and minimum-time checks;
- bounded catch-up work and an explicit continuation when more work remains;
- a reward paid only when authoritative state advances;
- an explicit, pre-funded reward source and maximum reward;
- the transaction sender as the default recipient, avoiding arbitrary
  redirection of a keeper payment;
- primitive events identifying the action, period, caller, and reward.

Keeper rewards are conserved cash flows. They come from an instrument reserve,
collected fees, or an explicitly disclosed participant charge; maintenance never
mints collateral or silently socializes an unfunded payment.

A perpetual should normally update one cumulative funding index per period
rather than iterate every position hourly. Positions realize the index delta
when they are next touched, or through separately bounded maintenance batches.
The perpetual implementation still chooses the oracle, observation rules,
cadence, funding formula, catch-up policy, and whether anyone can invoke the
transition.

#### Terminal settlement

An instrument can enter a terminal state that stops new trading and settles open
positions. This covers option expiry or exercise, futures maturity, fund
termination, and final redemption. The implementation computes the payout; the
standard enforces one-time application, collateral conservation, position
closure, and terminal-state finality.

#### Forced settlement

An instrument can force-reduce or close a position through liquidation, backstop
transfer, or another explicitly defined distress path. The implementation proves
that its trigger is satisfied and computes penalties and payouts. The standard
enforces market identity, authorized transition shape, available collateral,
exact accounting, and event emission.

Liquidation is a lifecycle capability, not an orderbook responsibility.

### Instrument responsibility

Each instrument package owns:

- contract terms and market construction parameters;
- initial and maintenance margin formulas;
- collateral reservation requirements;
- oracle selection, validation, staleness, and dispute behavior;
- funding, dividend, coupon, fee, and other carry formulas;
- exercise, expiry, redemption, and terminal payout formulas;
- liquidation eligibility, penalty, and backstop behavior;
- any instrument-specific state that is not part of the minimal position;
- whether an instrument references another market, a basket, an external asset,
  a strategy NAV, or another transparent value source.

The standard and orderbook do not certify that these economics are sound. A
permissionless implementation can be malicious or incompetent. Its authority is
confined to its own market and collateral silo. The frontend and API can assess,
simulate, rank, warn about, or hide it by default without preventing direct
on-chain use.

### Market isolation

V1 collateral and solvency are isolated per market. No market can debit another
market's collateral, count another market's unrealized profit, or rely on an
offsetting position elsewhere.

This sacrifices portfolio-margin efficiency in exchange for containing an
untrusted instrument implementation. A faulty option or strategy cannot make a
perpetual market insolvent.

The data model reserves an additive path to explicit risk domains in v2. A risk
domain can later admit multiple markets under one risk model and recognize
cross-market or cross-account offsets. New permissionless markets still begin
isolated; joining a shared collateral domain must be an explicit act by that
domain, never an automatic consequence of implementing the position standard.

### Strategy and market-making vaults are instruments

A strategy vault is not a separate venue-level subsystem. It is an instrument
implementation under this standard:

- a deposit issues a long net position representing the depositor's claim;
- redemption reduces that position and returns its share of realizable assets;
- strategy PnL changes NAV and can be retained or distributed through carry;
- disclosed fees are carry debits or NAV charges under the implementation;
- forced unwind or insolvency uses the same terminal or forced-settlement
  transitions;
- the strategy controls a margin account that submits orders to the same market
  instances and matching kernel as every other participant.

An HLP-like community vault and a proprietary market-making vault therefore fit
the same position and lifecycle standard as perps and options. They are not
special liquidity pools and do not receive a private matching path.

The strategy operator has bounded, non-custodial authority. It may quote,
cancel, rebalance, and trade within on-chain exposure, market, loss, rate, and
withdrawal constraints. It cannot transfer depositor principal to itself.
Manager fees and emergency powers are explicit and observable.

A prop-market-making engine may compute fair value, inventory skew, spreads, and
defensive controls off-chain, then place or update orders on-chain. That is a
strategy participating in a CLOB, not an AMM embedded in the protocol.

In industry terminology these systems are often called `PropAMMs`. In Nth
Market, the term describes the active pricing and inventory strategy, not its
execution venue: the strategy expresses executable liquidity as ordinary orders
in the shared CLOB.

### Relationship to Moneymentum and Fund

Nth Market owns the on-chain instrument, position, lifecycle, strategy-vault,
and orderbook standards. Perpetuals, options, and prop-market-making strategy
vaults are sibling implementations of those standards.

Moneymentum remains an optional tool for discretionary managers. Its portfolio
analytics, current-to-target diff, staged preview, reduction-before-expansion
planning, and venue clients can construct actions for a self-custodied account
or exercise a policy-bounded strategy-manager capability. Neither the standard
nor a vault depends on Moneymentum, trusts its calculations, or grants it a
privileged execution path. Other manager tools can implement the same public
flows.

Prior research in the `dataclique/fund` repository remains useful input,
especially its separation of execution authority from pooled custody,
donation-resistant share pricing, reconcile-or-floor accounting, and
permissionless NAV-attestation research. The generic on-chain design belongs in
Nth Market because managed strategy claims are instruments traded and settled by
this protocol, rather than a separate venue-layer product. Those proposed Fund
ADRs are research sources, not dependencies or automatically adopted
specifications; each invariant must be re-derived and tested against Sui and
this standard.

## V1, V2, and longer-term intent

### V1

V1 standardizes:

- one reusable price-time-priority orderbook implementation instantiated per
  market;
- one account-bound net position per margin account and market;
- USDC collateral and quote accounting at the existing \(10^6\) scale;
- atomic trade settlement;
- issuance and redemption;
- directed carry;
- terminal settlement;
- forced settlement and liquidation;
- strictly isolated market collateral;
- permissionless instrument and strategy-vault implementations;
- bounded manager authority for community-funded strategies;
- primitive, immutable event envelopes suitable for indexers.

The conformance set is a fund or strategy claim, a linear perpetual, a European
cash-settled option, and a community-funded market-making strategy.

The existing perpetual-specific code is not treated as the standard. After the
kernel boundary is proven, a complete perpetual, a complete option product, and
a prop-market-making strategy vault are built as standard implementations.

### V2-compatible seams

V1 must not prevent, but does not specify or implement:

- explicit multi-market risk domains and cross-account or portfolio margin;
- checked position novation;
- cross-chain strategy execution and hedging.

Cross-chain strategy support should preserve the same end state as the rest of
the protocol: permissionless participation, non-custodial control,
cryptographically or economically enforced authority, and minimized trust.

Candidate mechanisms are deliberately non-binding:

- an Ika dWallet controlled by Sui Move policy could authorize native
  transactions on another chain through programmable 2PC-MPC signing;
- an external operator could trade only its own off-protocol capital while
  posting an insurance bond to the Sui vault, limiting depositor loss to
  enforceable on-chain exposure;
- other remote-account, intent, or proof systems may satisfy the same
  invariants.

The standard reserves executor identity, pending-operation, reconciliation, and
unavailable-asset states so that an asynchronous hedge is never represented as
settled Sui collateral. It does not choose a bridge, signer, remote account,
attestation format, or NAV-credit rule.

A later decentralized, permissionless NAV-attestation or keeper network may
reduce reliance on an operator or a single reporter. That is one possible
implementation, not a committed v3 architecture. If Ika or another primitive
makes trust-minimized cross-chain control sufficiently small and auditable, the
capability may be practical in v2 without such a network.

## Permanent non-goal: AMMs

Nth Market will not implement a passive curve AMM, concentrated-liquidity AMM,
or instrument-specific AMM as a venue.

The protocol is an orderbook engine. Passive AMM designs expose liquidity
providers to loss-versus-rebalancing and related adverse-selection costs.
Contemporary proprietary market makers have demonstrated that active,
inventory-aware, off-chain pricing with on-chain execution can produce very
tight spreads in liquid spot markets. Nth Market should enable those strategies
to compete on one permissionless CLOB and package their returns as standard
instruments; it should not recreate a 2021-era passive liquidity design.

An externally developed strategy may use any model it wants to decide which
orders to place. That does not make the Nth Market protocol an AMM and does not
add AMM logic to the standard.

## Invariants

Every conforming implementation and every kernel transition preserves:

1. **Atomic fills.** A book mutation caused by a fill cannot commit unless every
   corresponding position and collateral mutation commits.
2. **Collateral conservation.** USDC entering, leaving, reserved by, or moving
   within a market is exactly accounted for. No transition mints collateral.
3. **Market isolation.** An instrument witness, manager, liquidation caller, or
   settlement path for market A cannot debit or reserve collateral in market B.
4. **Single net exposure.** An account has exactly one of flat, long, or short
   exposure in a market after every transition.
5. **Reservation coverage.** Every resting order has sufficient
   instrument-defined reserved capacity; cancellation releases no more than its
   unconsumed reservation.
6. **No unrestricted liability transfer.** There is no generic operation that
   transfers a position to another account.
7. **No negative collateral.** Carry, settlement, fees, and penalties cannot
   underflow a balance. An implementation must choose a forced-settlement or
   insolvency path when an obligation exceeds available collateral.
8. **One-time periods and terminal actions.** A carry period, expiry settlement,
   redemption, or forced close cannot be applied twice.
9. **Terminal finality.** A terminal market accepts no new orders or exposure,
   and all remaining reservations have an explicit cancel or settlement path.
10. **Explicit cash-flow source.** Every credit names a debited source or
    pre-funded reserve; every rounding remainder has a specified owner.
11. **Bounded authority.** A strategy manager can perform only the actions and
    exposure allowed by its on-chain policy and cannot withdraw depositor
    principal.
12. **Bounded work.** Public transitions bound loops, fill batches, dynamic
    growth, and cleanup so one user cannot make a market permanently
    unserviceable.
13. **Observable mutation.** Orders, fills, position changes, carry, issuance,
    redemption, liquidation, settlement, fees, and manager-policy changes emit
    stable primitive event data.

## Threat boundaries

### Untrusted instrument package to standard kernel

The instrument supplies economic calculations and invokes lifecycle transitions.
It may lie about value or intentionally confiscate its own users' isolated
collateral.

Controls:

- type and market identity on every operation;
- private construction of the instrument witness;
- per-market collateral silos;
- standard-owned balance arithmetic and lifecycle state transitions;
- no access to another market or a protocol-wide credit pool;
- frontend source, audit, oracle, and risk disclosure.

### Public caller to market and margin account

Any address can call public market functions, carry keepers, settlement, or
liquidation entry points.

Controls:

- margin-account owner verification for voluntary actions;
- instrument-witness authorization for economic state transitions;
- named aborts for every invalid boundary condition;
- idempotence guards for periods and settlement epochs;
- capability-gated manager actions;
- permissionless liquidation only after implementation-defined proof.

### Off-chain strategy operator to community vault

The operator submits quotes and trade actions derived from proprietary code. It
can be compromised, censor updates, overtrade, or attempt to extract principal.

Controls:

- non-custodial on-chain assets;
- action allowlists and market/exposure/loss/rate bounds;
- replay-resistant order identifiers and deadlines where signed instructions are
  used;
- withdrawal separation: the manager cannot call depositor redemption as itself
  or transfer principal to itself;
- permissionless pause or unwind only under explicit, testable conditions;
- complete manager-action and fee events.

### Instrument oracle to instrument implementation

Oracles are not standardized, but their outputs can trigger funding,
liquidation, or settlement.

Controls required from each implementation:

- typed units and scale;
- positive, bounded values where applicable;
- freshness and monotonic-time checks;
- explicit behavior for unavailable, disputed, or stale data;
- one-time binding of an expiry settlement value;
- adversarial oracle tests in that implementation's conformance suite.

### Event stream to API and frontend

Indexers and user interfaces reconstruct positions, history, NAV, and warnings
from immutable events and on-chain state.

Controls:

- primitive fields with documented scale and meaning;
- stable ordering and versioning;
- reconciliation against authoritative on-chain balances;
- API calculations are informational and cannot authorize settlement.

### Future Sui-to-external-chain executor

This boundary does not exist in v1. It will introduce asynchronous finality,
remote-chain reorgs, signer or MPC liveness, transaction censorship, stale NAV,
and reconciliation risk.

V1 must not treat a requested or reported external hedge as settled collateral.
The v2 design requires its own threat model before any cross-chain value is
credited.

## STRIDE summary

| Threat                 | Concrete failure                                                  | Required control                                                     |
| ---------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| Spoofing               | Caller impersonates an account, instrument, or manager            | owner checks, private witnesses, capabilities                        |
| Tampering              | Quantity, scale, collateral, period, or market ID is altered      | domain newtypes, checked `u128` arithmetic, identity binding         |
| Repudiation            | Manager or keeper denies a trade, fee, carry round, or settlement | immutable primitive events for every mutation                        |
| Information disclosure | Proprietary quote logic or signing material is exposed            | keep models and keys off-chain; never emit secrets                   |
| Denial of service      | Unbounded fills, positions, or cleanup wedge a shared market      | bounded batches, growth limits, resumable permissionless maintenance |
| Elevation of privilege | Instrument or manager reaches unrelated collateral                | per-market silos and least-authority capabilities                    |

## First failing conformance tests

These tests are the specification for implementation. They are written before
production modules.

### Matching and net positions

- `fill_opens_one_net_position_per_side`: a fill opens equal long and short
  quantities for two flat accounts and consumes exactly the matched
  reservations.
- `opposing_fill_reduces_then_closes_position`: an opposing fill reduces an
  existing position and reaches `Flat` at equality.
- `oversized_opposing_fill_flips_position`: an opposing fill larger than the
  existing position closes it and opens only the residual direction.
- `orders_do_not_change_filled_exposure`: placing and cancelling an unfilled
  order changes reservation state but not `Position`.
- `equal_price_orders_keep_time_priority`: genericizing the orderbook preserves
  the accepted FIFO invariant from ADR 01.
- `unconsumed_fill_obligation_aborts`: matching without complete instrument
  settlement cannot commit the book mutation.

### Collateral and isolation

- `trade_conserves_market_collateral`: wallet, free, reserved, position, fee,
  and vault balances reconcile exactly before and after a fill.
- `cancel_releases_only_unfilled_reservation`: partial-fill cancellation cannot
  release collateral backing settled exposure.
- `instrument_cannot_debit_another_market`: an adversarial implementation using
  its valid witness for market A cannot access market B.
- `large_values_do_not_overflow_u64_intermediates`: realistic high price and
  quantity values succeed through checked `u128` arithmetic or abort before
  state mutation.
- `dust_transition_has_explicit_rounding_owner`: a cash flow below one USDC base
  unit cannot disappear from reconciliation.

### Transfer and authority

- `position_has_no_public_transfer_path`: external code cannot extract or
  transfer an account-bound `Position<Instrument>`.
- `foreign_account_cannot_place_cancel_or_redeem`: voluntary actions require
  margin-account ownership.
- `wrong_instrument_witness_cannot_settle`: an unrelated package or market type
  cannot invoke lifecycle transitions.

### Carry

- `perp_funding_moves_cash_without_changing_quantity`: a positive funding round
  debits the paying side and credits the receiving side while both position
  sizes remain unchanged.
- `funding_cannot_be_applied_twice_for_period`: the same funding epoch cannot be
  collected twice.
- `dividend_distributes_from_prefunded_reserve`: a dividend implementation
  distributes pro rata from an identified reserve without changing quantities or
  minting collateral.
- `carry_shortfall_uses_declared_distress_path`: a debit larger than available
  collateral cannot underflow or silently clamp.
- `duplicate_maintenance_cannot_claim_reward`: one action key advances state and
  pays at most once even when multiple keepers race.
- `maintenance_reward_requires_state_advance`: a no-op, stale, or premature call
  cannot drain the maintenance reserve.
- `funding_index_update_is_bounded`: advancing a perpetual's global funding
  index does not iterate all open positions, and catch-up work respects an
  explicit per-call limit.

### Option and terminal settlement

- `option_expiry_settles_long_and_short_once`: a European option implementation
  applies its payout, closes both exposures, and conserves collateral.
- `settled_market_rejects_new_orders`: no exposure can be opened after terminal
  settlement begins.
- `expiry_value_is_bound_once`: a second or conflicting expiry value cannot
  alter completed settlement.
- `terminal_cleanup_releases_all_reservations`: every resting order has an
  explicit terminal cancel or settlement path.

### Liquidation

- `liquidation_uses_standard_forced_close`: an implementation-proven unsafe
  position closes through the generic forced-settlement transition.
- `safe_position_cannot_be_forced_closed`: a caller cannot bypass the
  implementation's liquidation proof.
- `liquidation_cannot_seize_unrelated_market_collateral`: penalties and backstop
  transfers remain inside the market silo.

### Issuance, redemption, and strategy instruments

- `vault_deposit_issues_net_claim_at_bounded_rate`: a deposit creates or
  increases one long strategy position and respects minimum shares.
- `first_depositor_cannot_capture_later_deposit`: direct donation or initial
  rounding cannot cause a later depositor to receive zero or unfair shares.
- `redemption_respects_realizable_assets`: redemption cannot credit unavailable,
  pending, or merely reported assets as settled USDC.
- `strategy_manager_can_trade_but_not_withdraw_principal`: the manager can place
  bounded orders from the strategy account and cannot transfer depositor assets
  to itself.
- `strategy_limit_breach_aborts_before_trade`: market, exposure, loss, or rate
  policy violations abort before book or collateral mutation.
- `two_external_instruments_share_kernel_without_imports`: independent packages
  use the same matching and position primitives without the kernel importing
  either implementation.

## Feasibility spikes before ABI

Each spike runs on a throwaway branch and is deleted after recording the result.

1. **External witness:** prove that a third-party Move package can define a
   private witness, instantiate a generic market, and authorize only its own
   lifecycle calls.
2. **Atomic obligation:** prove that a no-ability fill batch can cross the
   kernel/instrument package boundary, expose all required fill data, and make
   incomplete settlement fail at transaction completion.
3. **Account-bound storage:** compare address-owned account storage with a
   shared-market keyed position table; prove external code cannot extract or
   transfer positions and that a taker can settle a resting maker.
4. **Multiple instrument packages:** implement minimal linear and expiring test
   instruments in separate packages and run them against one unchanged kernel.
5. **Event envelope:** compile and BCS-test primitive generic-event projections
   without placing package-specific structs in external event layouts.
6. **Shared-object cost:** measure bounded fill-batch and net-position updates
   against Sui object and transaction limits.

All six spikes compiled and ran against Sui v1.75.1. They changed two conceptual
mechanisms before publication:

- positions are logically account-bound but physically stored in the shared
  market, because the maker's address-owned account cannot be an input to a
  later taker transaction;
- a fill obligation owns a private settlement cursor, and only the standard's
  two-sided net-position transition advances it.

The spikes also established that private external witnesses, two independent
instrument types, no-ability cross-package obligations, phantom-typed primitive
events, keyed position access, and bounded fill batches compile together. Fill
batches are explicitly capped rather than relying on transaction gas as an
implicit bound. Failure of a future spike changes the conceptual mechanism, not
the accepted separation of matching, positions, and instrument economics.

## Validation of assumptions

| Assumption                                                                                       | Validation                                                                                                      |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Move witnesses can identify an external instrument implementation                                | compile spike against the pinned Sui v1.75.1 toolchain and official witness/capability patterns                 |
| A fill can require same-transaction settlement across packages                                   | hot-potato compile/test spike with an intentionally incomplete transaction                                      |
| One generic position is account-bound without requiring its owned object during maker settlement | market-owned keyed-table prototype; test maker updates, ownership, and extraction failures                      |
| USDC \(10^6\) scaling is conserved                                                               | property and boundary tests over every standard collateral transition                                           |
| Instrument packages cannot cross market silos                                                    | adversarial Move package test attempting wrong-market debit and settlement                                      |
| Carry can model funding and distributions without shared formulas                                | linear-perp and dividend reference tests using the same transition                                              |
| Terminal settlement can model European options                                                   | cash-settled option reference test at zero, at-the-money, and in-the-money boundaries                           |
| A strategy vault fits the same position lifecycle                                                | deposit, trade, carry, fee, redemption, and forced-unwind conformance test                                      |
| Manager authority is non-custodial                                                               | adversarial manager tests for direct withdrawal, self-payment, policy bypass, and replay                        |
| Event layouts support independent indexers                                                       | BCS fixture tests and indexer reconciliation against on-chain balances                                          |
| V2 cross-chain control can remain additive                                                       | read the actual Ika Move contracts and another candidate design before specifying an executor; no v1 dependency |

Primary references to validate design details:

- [Sui dynamic fields](https://docs.sui.io/develop/objects/dynamic-fields)
- [Sui transfer policy witness and capability patterns](https://docs.sui.io/develop/objects/transfers/transfer-policies)
- [DeepBook V3 design](https://docs.sui.io/onchain-finance/deepbookv3/design)
- [Pendle Standardized Yield](https://docs.pendle.finance/pendle-v2-dev/Contracts/StandardizedYield)
- [ERC-4626 tokenized vault standard](https://eips.ethereum.org/EIPS/eip-4626)
- [OpenZeppelin ERC-4626 inflation-attack analysis](https://docs.openzeppelin.com/contracts/5.x/erc4626)
- [Synthetix V3 market abstraction](https://sips.synthetix.io/sips/sip-303/)
- [Opyn Gamma options architecture](https://github.com/opynfinance/GammaProtocol)
- [Enzyme external positions and policy hooks](https://docs.enzyme.finance/enzyme-blue-protocol/topics/external-positions)
- [Hyperliquid protocol vaults](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/vaults/protocol-vaults)
- [Ika dWallet core concepts](https://docs.ika.xyz/docs/core-concepts/dwallets)
- [Ika Move integration](https://docs.ika.xyz/docs/move-integration)
- [PropAMMs and permissionless market structure](https://jumpcrypto.com/resources/propamms-and-the-next-chapter-of-permissionless-market-structure)
- [Solana overview of proprietary AMMs](https://solana.com/news/understanding-proprietary-amms)

ERC-6123, ERC-3475, and ERC-3525 remain useful research references for
derivative lifecycle, obligations, and semi-fungible representation, but they
are not adopted as the standard. They are EVM-oriented, remain draft or niche,
and do not solve account-bound liability settlement through a Sui CLOB.

## Alternatives rejected

### Use `Coin<T>` and DeepBook for every instrument

Rejected because freely transferable positive balances cannot represent
account-bound liabilities, collateral reservations, funding debits, liquidation,
or terminal settlement. Tokenized claims remain useful inside individual
implementations, but they are not the derivative standard.

### Put every product in a core enum or payoff DSL

Rejected because new instrument classes would require core upgrades and a
generic payoff expression cannot encode operational behavior such as
rebalancing, manager authority, oracle disputes, or liquidation. This would
create the closed ecosystem the standard is intended to avoid.

### Runtime callback interface

Rejected because Move does not provide the required open-ended runtime dynamic
dispatch. It would also make an unknown package execute inside the kernel's
collateral authority. Static, inverted composition through witnesses and atomic
obligations gives stronger type and isolation boundaries.

### Separate filled lots or hedge mode

Rejected for v1 because one net position is simpler, cheaper, and clearer to
users. Distinct contract terms are separate markets, history is indexed from
fills, and strategy isolation belongs in separate margin accounts.

### Protocol-wide portfolio margin in v1

Rejected because an incorrect permissionless instrument could understate
liability and consume collateral backing unrelated products. Explicit risk
domains are the future opt-in path.

### Make strategy vaults privileged venue infrastructure

Rejected because vault claims, carry, fees, redemption, distress, and manager
authority are instrument lifecycle concerns. A prop-market-making vault should
trade through the same CLOB and conform to the same position standard.

### Add an AMM

Permanently rejected. Nth Market is an orderbook protocol. Market-making
strategies can be permissionless, proprietary, community-funded, or fully
on-chain, but they express liquidity as orders through the common engine.

## Consequences

- The current `Order` and `OrderBook` responsibilities must eventually be split:
  matching data remains generic; leverage, margin, funding, and liquidation move
  into the perpetual implementation.
- A third-party instrument can reuse the CLOB without the CLOB importing or
  valuing that instrument.
- Positive claims may be wrapped or mirrored as coins by an implementation, but
  the canonical derivative position remains account-bound.
- Permissionless extensibility is compatible with safety only because v1
  collateral is isolated. Users still bear implementation and oracle risk inside
  the chosen market.
- One net position improves UX and gas use but postpones hedge mode, lot-level
  on-chain accounting, portfolio margin, and checked novation.
- Strategy vaults become first-class instruments. Their operators gain bounded
  trading authority, not custody or a private venue.
- The standard supports options, funding, dividends, and fund products through
  common transitions without standardizing their valuation.
- Cross-chain strategy support remains possible without contaminating v1 with a
  speculative bridge, keeper, signer, or NAV design.
- Public APIs and events are delayed until the cross-package spikes succeed,
  reducing the risk of freezing the wrong Sui interface.

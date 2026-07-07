# AGENTS.md — Sui Move Contracts

Standards for the `strike` Move package. This code moves user collateral;
correctness requirements are absolute. Repo-wide rules (dev shell, GitButler,
commit style) live in the root [AGENTS.md](../AGENTS.md).

## Package Layout

Move package `strike`, edition `2024`. The Sui framework dependency is pinned to
`testnet-v1.75.1` — the same release as the `sui` CLI in `flake.nix` and the
backend `sui-sdk`. Bump all three together, never one alone.

| File                     | Module              | Contents                                                     |
| ------------------------ | ------------------- | ------------------------------------------------------------ |
| `sources/units.move`     | `strike::units`     | `Price`/`Size`/`Leverage`/`UsdcAmount` fixed-point newtypes  |
| `sources/risk.move`      | `strike::risk`      | Margin/liquidation formulas; ALL u128 scaling arithmetic     |
| `sources/constants.move` | `strike::constants` | `FLOAT_SCALING` (10^6, USDC's 6 decimals), margin rate       |
| `sources/margin.move`    | `strike::strike`    | `MarginAccount`: USDC deposits/withdrawals, owner checks     |
| `sources/order.move`     | `strike::order`     | `Side` enum + `match_side!`, `OrderId`, `Order` struct       |
| `sources/orderbook.move` | `strike::orderbook` | CLOB: matching, cancellation, liquidation sweep, events      |
| `sources/pool.move`      | `strike::pool`      | `Pool`: vault + orderbook + oracle, entry points for trading |
| `sources/vault.move`     | `strike::vault`     | Pooled USDC collateral                                       |
| `sources/oracle.move`    | `strike::oracle`    | Price oracle object                                          |
| `tests/`                 | `strike::*_tests`   | One `#[test_only]` module per source module                  |

Build and test from `contracts/`, inside the dev shell:

```sh
sui move build
sui move test            # must be green ALWAYS — this is what CI runs
sui move test <filter>   # run matching tests during iteration
```

## Type Modeling (non-negotiable)

`strike::units` and `strike::order` exist to make unit-mixing and boolean
blindness unrepresentable. Domain logic operates on domain types end to end:

- **`Side` enum (`strike::order`), never `is_bid: bool`.** Construct with
  `order::bid()` / `order::ask()`. Cross-module dispatch on `Side` goes through
  `side.match_side!(|| ..., || ...)` — both arms required at every call site.
  The `side.is_bid()` projection is reserved for event payload projection; using
  it for domain branching is a violation.
- **`Price`, `Size`, `Leverage`, `UsdcAmount` (`strike::units`), never bare
  `u64`.** All four are fixed-point values scaled by
  `constants::float_scaling()` (or USDC base units, which share the 10^6 scale —
  `units.move` documents the coupling). They are NOT interchangeable:
  multiplying two scaled values double-scales, and mixing units silently
  corrupts margin math. A bare `u64` crossing a function boundary for any of
  these quantities is a bug.
- **`OrderId` (`strike::order`) is the cancellation key.** Unlike
  `(account, price)` it stays unique when one account rests several orders at
  the same price level. Never key order lookup on anything else.
- **ALL cross-quantity scaling arithmetic lives in `risk.move` (`strike::risk`)
  and runs in `u128`.** Double-scaled products overflow `u64` for realistic
  inputs. No other module multiplies, divides, or rescales these quantities — it
  calls `margin_required`, `maintenance_margin`, `max_leverage`,
  `is_liquidated`, `refund_for_unfilled`, or adds a new function HERE.
- **Events carry primitive fields.** An event's BCS layout is the external
  serialization contract consumed by indexers, so event structs hold `u64` /
  `bool` / `ID` and the domain types are projected at the emit site via
  `.value()` / `is_bid()` — exactly like `OrderCreated` in `orderbook.move`.
  Never put a domain newtype in an event struct.

## Move 2024 Idioms (mandatory)

- **Method syntax** everywhere the receiver is unambiguous:
  `order.unfilled_size()`, `margin_account.balance()`,
  `orderbook.bids.push_back(order)` — not `order::unfilled_size(&order)`.
- **`public use fun` aliases** for every newtype operation, following
  `units.move` (`public use fun size_sub as Size.sub;`). A newtype without
  method aliases is incomplete.
- **`enum` + `match`** for finite states. `match` is exhaustive — rely on it; no
  boolean flag encodes what an enum variant should.
- **Stdlib macros over hand-rolled loops**: `vector::insertion_sort_by!`, `do!`,
  `map!`, `fold!` etc. before writing a `while` loop. A `while` loop is
  acceptable only when no stdlib macro expresses the operation (e.g. the
  early-exit scan in `cancel_order`).
- **Custom macros where they remove duplication** — `order::match_side!` is the
  model. Move 2024 macro bodies resolve visibility in the caller's scope, so a
  macro body must only touch public API.
- **Doc comments (`///`) on every public and `public(package)` function**,
  stating the units/scaling of every quantity it touches and every condition
  under which it aborts. `units.move`, `risk.move`, and `orderbook.move` set the
  bar.

## Sui Move Best Practices

Distilled from the Sui docs conventions and The Move Book; each is binding.

### Module and function design

- **One object or data structure per module.** `vault.move` owns `Vault`; don't
  let another module reach into its fields.
- **Section headers** `// === Name ===` group code in order: errors, constants,
  structs, events, public functions, view functions, package functions, private
  functions, test-only functions.
- **Keep core functions pure and composable: do not `transfer` inside them.**
  Return the object and let the caller (or a PTB) decide where it goes.
  Constructors return the object (`strike::new`, `pool::new`); a separate
  function places it (`keep`). The only sanctioned in-module transfer is for
  types that deliberately lack `store` (see `MarginAccount.keep`).
- **Prefer `public fun` over `entry fun`.** `public` is callable both from PTBs
  and from other packages; `entry` blocks cross-package composition. Use `entry`
  only to deliberately forbid other Move code from wrapping a call.
- **Take `Coin` by value with the exact amount**, not `&mut Coin` — the caller
  splits in the PTB. `deposit(coin: Coin<USDC>)` is the model.
- **CRUD naming**: `new`, `empty`, `add`, `remove`, `contains`, `borrow`,
  `borrow_mut`, `destroy`, plus bare field names for getters. No `get_` prefix
  on new code.
- **Minimal visibility**: private > `public(package)` > `public`. Everything
  crossing module boundaries inside the package is `public(package)`.

### Ownership and capabilities

- **Owned objects for 1-to-1 relationships** (a user's `MarginAccount`),
  **shared objects only when multiple parties must mutate** (a `Pool` once
  trading opens). Withholding `store` (as `MarginAccount` does) pins an object
  to this module's transfer functions — preserve that property.
- **Admin functions are capability-gated.** Authority is an object with a `Cap`
  suffix (e.g. a `PriceCap` gating `pool::update_price`), created in `init` and
  transferred to the publisher, then passed by reference right after the object
  it guards: `fun update_price(oracle: &mut Oracle, _cap: &PriceCap, ...)`.
  Never gate admin paths on hardcoded addresses or sender allowlists.
- **Hot potato for must-complete flows**: a struct with no abilities cannot be
  stored, copied, or dropped, so the transaction aborts unless the module
  consumes it — the right tool for flash-loan-style "borrow now, settle in the
  same PTB" obligations.

### Aborts and errors

- **One error constant per abort scenario**, `E` + PascalCase
  (`EInsufficientBalance`), doc-commented, unique code within the module. Codes
  are module-local; never reuse one constant for two conditions.
- **Every `assert!` uses a named constant** — no bare numeric abort codes.
- **Validate at the boundary**: public functions assert ownership
  (`verify_owner`), positive prices/sizes, and leverage bounds BEFORE any state
  change, so aborts can never leave partial state.

### Upgrade discipline

Published `public` structs and `public fun` signatures are **frozen forever** —
they can never be removed or changed, only reimplemented. `public(package)`,
`entry`, and private items stay flexible. Therefore:

- Default to `public(package)`; promote to `public` only what external packages
  genuinely need.
- Event structs are public structs: adding/removing/reordering fields after
  publication breaks indexers. Design event payloads deliberately.
- When a shared object must survive upgrades, embed a `version: u64` field and
  assert it in every mutator, bumping via an admin migration function.

## Testing Standards (financial math)

`sui move test` is green always — a red test blocks everything else.

- **Every abort path has a test** using
  `#[expected_failure(abort_code = module::EConstant)]`. An assert without a
  test proving it fires is unverified access control.
- **Boundary tests are mandatory for liquidation and margin math.** The bugs in
  this domain live exactly at the edges; each new formula ships with, at
  minimum:
  - margin **exactly at** the maintenance threshold (liquidates — `<=`, not
    `<`);
  - leverage exactly at `max_leverage` and one step above;
  - the empty book (place, cancel, best-bid/ask against no resting orders);
  - fills with zero remainder (taker fully consumed, maker fully consumed, and
    both simultaneously);
  - values large enough to overflow `u64` if the math dropped to 64 bits.
- **No tests that restate constructors.** Asserting that a struct holds what you
  just put in it tests the language, not the protocol. Tests exercise matching,
  margin flows, refunds, liquidations — behavior with a computed outcome.
- **Use `test_scenario`** (`begin` / `next_tx` / `end`) for multi-transaction,
  multi-sender flows, `mint_for_testing<USDC>` for collateral, and shared setup
  helpers per test module (see `orderbook_tests::setup`).
- **`#[test_only]` for all test scaffolding** — helper functions, state poking
  like `pool::set_token_price`, extra accessors. Test-only code never widens the
  production API.
- **Never weaken an assertion, tolerance, or expected abort code to make a test
  pass.** If the test disagrees with the code, one of them is wrong — determine
  which against [docs/liquidation.md](../docs/liquidation.md) and fix that one.

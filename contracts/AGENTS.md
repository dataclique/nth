# AGENTS.md — Sui Move Contracts

Standards for the `nth` Move package. This code moves user collateral;
correctness requirements are absolute. Repo-wide rules (dev shell, GitButler,
commit style) live in the root [AGENTS.md](../AGENTS.md).

## Package Layout

Three Move packages under `contracts/`, all edition `2024`. The Sui framework
dependency is pinned to `testnet-v1.75.1` — the same release as the `sui` CLI in
`flake.nix` and the backend `sui-sdk`. Bump all three together, never one alone.

### `units/` (`units::*`)

Typed fixed-point quantities — one module per type. See `units/README.md` and
`units/examples/` (compiled locally, not published on chain).

| File                                         | Module                           | Contents                                |
| -------------------------------------------- | -------------------------------- | --------------------------------------- |
| `units/sources/scaling.move`                 | `units::scaling`                 | `float_scaling()` ($10^6$)              |
| `units/sources/price.move`                   | `units::price`                   | `Price` newtype                         |
| `units/sources/size.move`                    | `units::size`                    | `Size` newtype                          |
| `units/sources/leverage.move`                | `units::leverage`                | `Leverage` newtype                      |
| `units/sources/usdc_amount.move`             | `units::usdc_amount`             | `UsdcAmount` newtype                    |
| `units/sources/maintenance_margin_rate.move` | `units::maintenance_margin_rate` | `MaintenanceMarginRate` (plain percent) |
| `units/examples/`                            | `units::scaled_order`, etc.      | Usage examples (not published on chain) |
| `units/tests/`                               | `units::*_tests`                 | Per-module tests + `examples_tests`     |

### `nth` (`nth::*`)

| File                             | Module                   | Contents                                                   |
| -------------------------------- | ------------------------ | ---------------------------------------------------------- |
| `sources/risk.move`              | `nth::risk`              | Margin/liquidation/funding formulas; ALL u128 scaling math |
| `sources/margin.move`            | `nth::margin`            | `MarginAccount`: USDC deposits/withdrawals, owner checks   |
| `sources/order.move`             | `nth::order`             | `Side` enum + `match_side!`, `OrderId`, `Order` struct     |
| `sources/position.move`          | `nth::position`          | Account-bound generic net exposure                         |
| `sources/collateral.move`        | `nth::collateral`        | Market-isolated USDC balances and order reservations       |
| `sources/matching.move`          | `nth::matching`          | Generic CLOB + fill and cancellation obligations           |
| `sources/instrument_market.move` | `nth::instrument_market` | Market-owned positions + cursor-checked settlement         |
| `sources/orderbook.move`         | `nth::orderbook`         | CLOB: matching, cancellation, liquidation sweep, funding   |
| `sources/pool.move`              | `nth::pool`              | `Pool`: vault + orderbook + oracle, entry points, cadence  |
| `sources/vault.move`             | `nth::vault`             | Pooled USDC collateral                                     |
| `sources/oracle.move`            | `nth::oracle`            | Price oracle object                                        |
| `tests/`                         | `nth::*_tests`           | One `#[test_only]` module per source module                |

### `conformance/` (`instrument_conformance::*`)

External linear and expiring fixture instruments. This package depends on `nth`,
while `nth` imports neither fixture; its tests prove private witnesses,
wrapper-owned markets, typed obligations, cancellation, and isolated positions
across the public package boundary.

## Module Organization

Package by domain, never by kind. A module is one domain concept with its data,
its operations, and its constants together:

- **No grab-bag modules.** `types`, `constants`, `utils`, `helpers`, `common`
  are banned names and banned concepts — they scale into dumping grounds where
  nothing can be found. This package already dissolved both a `types` and a
  `constants` module.
- **Constants live with the code that owns their meaning.** `float_scaling()` is
  the unit system's, so it lives in `units::scaling`; the funding rate cap is
  applied inside `risk::funding_rate_bps`, so it lives in `risk`; the funding
  interval and default margin rate parameterize `Pool`, so they live in `pool`.
  Placement follows the consumer that defines the semantics, not the syntactic
  category "constant".
- **The test for a new item's home:** which module's doc comment would have to
  explain it? That module owns it. If no existing module's domain covers it, the
  item is a new domain — give it a new, domain-named module.

Build and test inside the dev shell:

```sh
cd contracts/units && sui move test   # units package
cd contracts && sui move test          # nth package — must be green ALWAYS
cd contracts/conformance && sui move test # external instrument fixtures
sui move test <filter>                 # run matching tests during iteration
```

## Type Modeling (non-negotiable)

`units::*` and `nth::order` exist to make unit-mixing and boolean blindness
unrepresentable. Domain logic operates on domain types end to end:

- **`Side` enum (`nth::order`), never `is_bid: bool`.** Construct with
  `order::bid()` / `order::ask()`. Cross-module dispatch on `Side` goes through
  `side.match_side!(|| ..., || ...)` — both arms required at every call site.
  The `side.is_bid()` projection is reserved for event payload projection; using
  it for domain branching is a violation.
- **`Price`, `Size`, `Leverage`, `UsdcAmount`, `MaintenanceMarginRate`
  (`units::*`), never bare `u64`.** All four scaled quantities use
  `scaling::float_scaling()` (or USDC base units, which share the $10^6$ scale —
  `scaling.move` documents the coupling). `MaintenanceMarginRate` is the
  exception: a plain percent (25 = 25%), not scaled. They are NOT
  interchangeable: multiplying two scaled values double-scales, and mixing units
  silently corrupts margin math. A bare `u64` crossing a function boundary for
  any of these quantities is a bug.
- **`OrderId` (`nth::order`) is the cancellation key.** Unlike
  `(account, price)` it stays unique when one account rests several orders at
  the same price level. Never key order lookup on anything else.
- **ALL cross-quantity scaling arithmetic lives in `risk.move` (`nth::risk`) and
  runs in `u128`.** Double-scaled products overflow `u64` for realistic inputs.
  No other module multiplies, divides, or rescales these quantities — it calls
  `margin_required`, `maintenance_margin`, `max_leverage`, `is_liquidated`,
  `refund_for_unfilled`, or adds a new function HERE.
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
  `units::size` (`public use fun size_sub as Size.sub;`). A newtype without
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
  under which it aborts. `units::price`, `risk.move`, and `orderbook.move` set
  the bar.

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
  Constructors return the object (`margin::new`, `pool::new`); a separate
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

- **Clever errors (`#[error]`) on every abort constant.** Annotate with
  `#[error]` and type the constant as `vector<u8>` with a `b"..."` message
  instead of a bare `u64` code. Tooling decodes the name, message, and source
  line on abort; tests still reference the constant by name in
  `#[expected_failure(abort_code = module::EConstant)]`.
- **One error constant per abort scenario**, `E` + PascalCase
  (`EInsufficientBalance`), unique within the module. Never reuse one constant
  for two conditions.
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
  which against [docs/margin.md](../docs/margin.md) and
  [docs/liquidation.md](../docs/liquidation.md) and fix that one.

## Code Quality Checklist

Binding standards from
[The Move Book code quality checklist](https://move-book.com/guides/code-quality-checklist).
Review every change against this list; fix violations in touched code.

### Package manifest

| Item                                           | Status                                        |
| ---------------------------------------------- | --------------------------------------------- |
| `edition = "2024"` in every `Move.toml`        | Done                                          |
| Explicit Sui framework pin (`testnet-v1.75.1`) | Done — must move with `flake.nix` / `sui-sdk` |
| Prefixed named addresses for generic names     | N/A — `nth` and `units` are project-specific  |

### Imports, modules, and constants

| Item                                                | Status                                       |
| --------------------------------------------------- | -------------------------------------------- |
| Module labels (`module pkg::mod;` at file scope)    | Open — legacy braced modules remain          |
| No `{Self}`-only imports; group `Self` with members | Enforced in new code                         |
| Error constants: `EPascalCase` with `#[error]`      | Done in production modules                   |
| Regular constants: `ALL_CAPS`                       | Done (`POOL_VERSION`, `FLOAT_SCALING`, etc.) |

### Structs and events

| Item                                                            | Status |
| --------------------------------------------------------------- | ------ |
| Capabilities suffixed with `Cap` (`PriceCap`)                   | Done   |
| Events named in past tense (`PositionOpened`, `FundingApplied`) | Done   |
| No `Potato` suffix on hot-potato types                          | N/A    |

### Functions

| Item                                                       | Status                             |
| ---------------------------------------------------------- | ---------------------------------- |
| No `public entry` — `public` or `entry` only               | Done                               |
| Composable PTB functions (return values, caller transfers) | Done (`new` + `keep`)              |
| Objects first, capabilities second, `Clock`/`ctx` last     | Done in pool admin paths           |
| Getters named after fields, no `get_` prefix               | Done (`balance`, `owner`, `price`) |

### Function body (Move 2024)

| Item                                                    | Status                                     |
| ------------------------------------------------------- | ------------------------------------------ |
| Method syntax (`ctx.sender()`, `order.unfilled_size()`) | Done in production sources                 |
| Stdlib macros over hand-rolled loops where applicable   | Done (`match_side!`, `insertion_sort_by!`) |
| `vector[]` / index syntax over `vector::borrow`         | Prefer in new code                         |
| `..` unpack for ignored fields                          | Prefer in new code                         |

### Testing

| Item                                                          | Status                                  |
| ------------------------------------------------------------- | --------------------------------------- |
| `#[test, expected_failure(...)]` on one line                  | Done                                    |
| No cleanup after `expected_failure` tests                     | Done                                    |
| No `test_` prefix in `*_tests` modules                        | Open — rename opportunistically         |
| `assert!` without numeric abort codes in tests                | Open — prefer `assert_eq!` in new tests |
| `sui::test_utils::destroy` over bespoke `destroy_for_testing` | Prefer in new tests                     |
| `test_scenario` only when multi-tx / multi-sender needed      | Done                                    |

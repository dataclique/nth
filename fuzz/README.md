# strike-fuzz

Property-based fuzzing for the strike Move contracts. Two layers share one
operation model (`src/model.rs`) and one invariant set.

## Layer 1 — model proptests (always available)

`tests/model_props.rs` drives randomized operation sequences (`src/strategy.rs`)
through a faithful Rust reimplementation of the contract semantics and asserts
the protocol invariants after every step:

- **conservation** — every USDC base unit is in an account or the vault.
- **vault-backed** — vault balance equals resting-order margins plus escrowed
  (filled/liquidated margins and funding dust).
- **sorted** — bids price-descending, asks price-ascending.
- **fill-bounded** — no order filled beyond its size.
- **atomicity** — a rejected op leaves state untouched.

Run it (only needs `proptest`):

```sh
cargo test -p strike-fuzz --test model_props
```

The model mirrors `strike::risk` arithmetic in `u128`, so it doubles as the
differential oracle for Layer 2.

## Layer 2 — on-chain differential (feature `simulacrum`)

`tests/onchain_props.rs` (behind `--features simulacrum`) publishes the real
compiled package into an in-memory Sui (`simulacrum`) and replays the same
sequences against it, cross-checking on-chain state against the model. It pulls
the sui execution stack, so it is gated to keep Layer 1 lightweight:

```sh
cargo test -p strike-fuzz --features simulacrum --test onchain_props
```

### PTB construction note

The trading entry points take domain newtypes (`units::Price`, `units::Size`,
`units::Leverage`) and `order::Side`, which are not primitives. A programmable
transaction therefore constructs them as prior commands and feeds the results
in: `units::price(x)` / `units::size(x)` / `units::leverage(x)` / `order::bid()`
each become a `MoveCall` whose result is an argument to
`pool::place_leveraged_order`. Funding cadence is advanced with
`Simulacrum::advance_clock`; on-chain state is read back through
`Simulacrum::store` to compare against the model.

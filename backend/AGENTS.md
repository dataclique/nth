# AGENTS.md — Backend

Standards for the `strikefi` Rust crate. Repo-wide rules (dev shell, GitButler,
commit style) live in the root [AGENTS.md](../AGENTS.md).

## What This Is

The non-custodial platform surface specified in SPEC.md: an event indexer, a
versioned REST/WebSocket market-data API, and unsigned-transaction templates. It
holds no keys and cannot move funds. Stack (see `Cargo.toml`):

- **Rocket 0.5** HTTP server + **rocket_ws**, run through **Shuttle**
  (`shuttle-rocket` / `shuttle-runtime` 0.52, `#[shuttle_runtime::main]`,
  `shuttle-shared-db` Postgres)
- **sqlx 0.8** with Postgres (`runtime-tokio`, native TLS) — durable raw event
  log + indexer cursors, migrated by `sqlx::migrate!`
- **sui-sdk** as a git dependency pinned to tag `testnet-v1.75.1`

Package by feature:

| File             | Contents                                                          |
| ---------------- | ----------------------------------------------------------------- |
| `src/events.rs`  | Typed decode of every tracked on-chain event from RPC JSON        |
| `src/state.rs`   | Pure projections: books, trades, candles, accounts, registry      |
| `src/indexer.rs` | Sui polling, Postgres persistence, replay-on-boot, WS fan-out     |
| `src/api.rs`     | `/v1` REST + WebSocket routes                                     |
| `src/tx.rs`      | `CallSpec` builders: PTB-shaped Move-call templates, never signed |
| `src/main.rs`    | Shuttle wiring: migrations, replay, indexer task, mounts          |

Deployment secrets: `SUI_RPC_URL`, `TRACKED_MODULES` (`0xpkg::module,...`), and
`*_PACKAGE_ID` entries for the tx builders. All optional — without them the
service serves an empty index and declines tx endpoints.

## The sui-sdk Pin

`sui-sdk` is pinned to the **same Sui release tag as the CLI in `flake.nix` and
the Move framework dep in `contracts/Move.toml`** (`testnet-v1.75.1`). Never
bump the tag here without bumping the other two in the same change — a version
skew between the SDK, the CLI, and the framework is a correctness bug, not a
style issue.

## Commands

All inside the dev shell, from `backend/`:

- `cargo check` — fast verification after every edit
- `cargo test` — run tests
- `cargo clippy` — lint; run as the final polish pass, fix every warning
- `cargo fmt` — format before committing
- `cargo add <crate>` — the ONLY way to add dependencies; never hand-write
  version numbers into `Cargo.toml`

**Never use `cargo build` for verification** — `cargo check` is faster and
`cargo test` is more useful. Never run the server speculatively; read the code
or write a test instead.

## CI Reality

`.github/workflows/backend.yaml` only **deploys to Shuttle** on pushes to master
touching `backend/` — there is no test/lint gate in CI. That makes local
verification the only gate: `cargo check`, `cargo test`, and `cargo clippy` must
all be clean before every commit. A broken commit on master deploys.

## Code Standards

- **Zero warnings.** Compiler and clippy output must be clean. Never add
  `#[allow(...)]` without explicit user permission — fix the root cause.
- **No panics in production paths.** `unwrap()`, `expect()`, `panic!()`,
  panicking indexing — forbidden outside `#[cfg(test)]`. Fallible operations
  return `Result` and propagate with `?`.
- **Typed errors.** Define thiserror-style error enums with `#[from]`
  conversions for library/domain logic; never `SomeError(String)` variants or
  `.map_err(|e| ...to_string())`. `anyhow` is tolerable only at the binary's top
  level, never inside logic you want to test.
- **Newtypes over primitives.** Values coming from or going to the chain (object
  IDs, order ids, prices, sizes, USDC amounts) get newtypes mirroring
  `strike::units` — a bare `u64` price and a bare `u64` size must not be
  interchangeable here either. Same scaling rules apply: on-chain values are
  fixed-point with 10^6 scaling; document the unit on every field.
- **No boolean blindness.** Order side is an enum (`Side::Bid | Side::Ask`), not
  `is_bid: bool`, except at the serialization boundary where the on-chain event
  layout dictates the shape.
- **Make invalid states unrepresentable.** Enums with state-specific data over
  structs of `Option`s; smart constructors over `validate()` methods.
- **Package by feature, not by layer.** As the crate grows, split by domain
  (`orderbook.rs`, `positions.rs`), never into `types.rs` / `models.rs` /
  `utils.rs` catch-alls.
- **Tests accompany every logic change.** Behavior ships with the test that
  proves it; abort/error paths included.

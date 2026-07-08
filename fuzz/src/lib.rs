//! Property-based fuzzing harness for the strike Move contracts.
//!
//! Two layers share one operation model and one set of invariants:
//!
//! - **model** — a faithful Rust reimplementation of the contract semantics.
//!   `tests/model_props.rs` drives random operation sequences through it and
//!   asserts the state invariants hold after every step. Builds and runs with
//!   only `proptest`.
//! - **sim** (feature `simulacrum`) — publishes the real compiled package into
//!   an in-memory Sui and replays the same sequences, cross-checking on-chain
//!   state against the model. Gated because it pulls the heavy sui execution
//!   stack; see `tests/onchain_props.rs`.

pub mod model;
pub mod strategy;

#[cfg(feature = "simulacrum")]
pub mod sim;

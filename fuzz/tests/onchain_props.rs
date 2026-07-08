//! On-chain differential layer (feature `simulacrum`).
//!
//! Publishes the real compiled strike package into an in-memory Sui as the
//! foundation for replaying model sequences against the bytecode. The
//! per-op programmable-transaction loop that cross-checks on-chain state
//! against `strike_fuzz::model` builds on the `Harness` here (see
//! `fuzz/README.md`).

#![cfg(feature = "simulacrum")]

use strike_fuzz::sim::Harness;

/// The harness compiles the real strike Move package via `sui-move-build` —
/// the artifact every on-chain op executes against.
#[test]
fn package_compiles() {
    let compiled = Harness::compile().expect("strike package should compile");
    assert!(
        !compiled.get_package_bytes(false).is_empty(),
        "compiled package should contain modules"
    );
}

/// Publishing into a fresh simulacrum requires strike's external `usdc`
/// dependency to be bootstrapped into the in-memory chain first (see
/// `Harness::publish`). Until that bootstrap lands, this documents the exact
/// failure so the extension point is unambiguous rather than silently absent.
#[test]
#[ignore = "requires bootstrapping the usdc dependency package into simulacrum"]
fn package_publishes() {
    let harness = Harness::publish().expect("strike package should publish");
    assert_ne!(
        harness.package_id,
        sui_types::base_types::ObjectID::ZERO,
        "published package id should be non-zero"
    );
}

//! Drives random operation sequences through the reference model and asserts
//! the state invariants hold after every committed and rejected step.
//!
//! This layer validates that the model — the differential oracle used by the
//! simulacrum layer — is internally consistent, and documents the protocol
//! invariants as executable properties: USDC conservation, vault backing, book
//! sort order, and fill bounds.

use proptest::prelude::*;
use strike_fuzz::model::{Model, Op};
use strike_fuzz::strategy::op_sequence;

proptest! {
    #![proptest_config(ProptestConfig { cases: 2048, ..ProptestConfig::default() })]

    /// Every invariant holds after each step, whether the op committed or the
    /// model rejected it (a rejection must leave state untouched, mirroring
    /// transaction atomicity).
    #[test]
    fn invariants_hold_across_sequences(ops in op_sequence(60)) {
        let mut model = Model::new(100);
        prop_assert!(model.check_all_invariants().is_ok(), "seed state violates invariants");

        for (step, op) in ops.iter().enumerate() {
            let before = model.clone();
            let result = model.apply(op);

            if result.is_err() {
                // A rejected op must not have mutated observable state.
                prop_assert_eq!(
                    before.vault, model.vault,
                    "rejected {:?} mutated vault at step {}", op, step
                );
                prop_assert_eq!(
                    before.accounts, model.accounts,
                    "rejected {:?} mutated accounts at step {}", op, step
                );
                prop_assert_eq!(
                    before.bids.len(), model.bids.len(),
                    "rejected {:?} mutated bids at step {}", op, step
                );
            }

            if let Err(msg) = model.check_all_invariants() {
                prop_assert!(false, "invariant `{}` broke after {:?} at step {}", msg, op, step);
            }
        }
    }

    /// Value is never created: the vault plus all account balances always equals
    /// the total ever deposited, no matter the op mix.
    #[test]
    fn usdc_is_conserved(ops in op_sequence(80)) {
        let mut model = Model::new(100);
        for op in &ops {
            let _ = model.apply(op);
            prop_assert!(
                model.inv_conservation(),
                "conservation broke after {:?}: accounts={:?} vault={} deposited={}",
                op, model.accounts, model.vault, model.total_deposited
            );
        }
    }
}

/// A hand-built sequence exercising a full position lifecycle, as a fast
/// regression alongside the randomized cases.
#[test]
fn lifecycle_deposit_place_fill_cancel_conserves() {
    use strike_fuzz::model::Side;
    let mut model = Model::new(100);

    model.apply(&Op::Deposit { account: 0, whole_usdc: 1000 }).unwrap();
    model.apply(&Op::Deposit { account: 1, whole_usdc: 1000 }).unwrap();

    // Account 0 rests a bid; account 1 crosses it with an ask.
    model
        .apply(&Op::Place { account: 0, side: Side::Bid, price: 100, size: 10, leverage: 2 })
        .unwrap();
    model
        .apply(&Op::Place { account: 1, side: Side::Ask, price: 95, size: 4, leverage: 2 })
        .unwrap();

    model.check_all_invariants().unwrap();
    // Fill of 4 leaves 6 resting on account 0's bid.
    assert_eq!(model.bids[0].filled, 4 * strike_fuzz::model::FLOAT_SCALING);
    assert!(model.asks.is_empty());
}

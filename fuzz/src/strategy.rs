//! Proptest strategies that generate operation sequences biased toward
//! interesting states — orders that actually cross, prices near the oracle,
//! leverage near the cap, and clock jumps that unlock funding.

use crate::model::{Op, Side, FUNDING_INTERVAL_MS, NUM_ACCOUNTS};
use proptest::prelude::*;

fn account() -> impl Strategy<Value = u8> {
    0u8..(NUM_ACCOUNTS as u8)
}

fn side() -> impl Strategy<Value = Side> {
    prop_oneof![Just(Side::Bid), Just(Side::Ask)]
}

/// Whole-unit prices clustered around the seeded oracle (100) so bids and asks
/// frequently cross and funding divergence stays in an interesting range.
fn price() -> impl Strategy<Value = u64> {
    prop_oneof![
        5 => 90u64..=110,
        1 => 1u64..=1_000,
    ]
}

fn size() -> impl Strategy<Value = u64> {
    1u64..=20
}

/// Leverage in whole units; the model's max is 4x, so this deliberately
/// straddles the cap to exercise the `EInvalidLeverage` boundary.
fn leverage() -> impl Strategy<Value = u64> {
    0u64..=6
}

fn op() -> impl Strategy<Value = Op> {
    prop_oneof![
        // Deposits are common so accounts can afford orders.
        3 => (account(), 1u64..=10_000).prop_map(|(account, whole_usdc)| Op::Deposit {
            account,
            whole_usdc
        }),
        6 => (account(), side(), price(), size(), leverage()).prop_map(
            |(account, side, price, size, leverage)| Op::Place {
                account,
                side,
                price,
                size,
                leverage
            }
        ),
        3 => (account(), 1u64..=40).prop_map(|(account, order_id)| Op::Cancel {
            account,
            order_id
        }),
        2 => price().prop_map(|price| Op::UpdatePrice { price }),
        2 => Just(Op::CheckLiquidations),
        2 => Just(Op::UpdateFunding),
        // Clock jumps sized around the funding interval so `UpdateFunding`
        // sometimes passes the cadence gate and sometimes trips it.
        2 => (0u64..=2).prop_map(|k| Op::AdvanceClock {
            ms: k * FUNDING_INTERVAL_MS
        }),
    ]
}

/// A sequence of up to `max_len` operations.
pub fn op_sequence(max_len: usize) -> impl Strategy<Value = Vec<Op>> {
    prop::collection::vec(op(), 1..=max_len)
}

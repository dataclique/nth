/// Funding-index bookkeeping for the perpetual instrument. Positions are
/// account-bound and not enumerable on-chain, so funding settles lazily
/// against two cumulative indexes: `long_pays` accumulates
/// `mark_price * rate_bps` for every round longs paid, `short_pays` for
/// every round shorts paid. Each account carries a cursor snapshotted at
/// its last position change plus accrued payable/receivable balances; the
/// market wrapper turns accruals into collateral moves through the
/// standard's carry transition against a pre-funded reserve account.
///
/// This module mutates no collateral — it is pure bookkeeping the wrapper
/// composes with the kernel.
module perpetual::funding;

use perpetual::risk;
use sui::table::{Self, Table};
use units::price::Price;
use units::size::Size;
use units::usdc_amount::UsdcAmount;

// === Structs ===

/// Cumulative funding indexes and per-account cursors for one market.
public struct FundingState has store {
  long_pays: u128,
  short_pays: u128,
  cursors: Table<ID, Cursor>,
}

/// One account's funding bookkeeping: index snapshots at the last accrual
/// and the USDC base units accrued but not yet settled in each direction.
public struct Cursor has store {
  long_pays: u128,
  short_pays: u128,
  payable: u64,
  receivable: u64,
}

/// One account's net exposure as seen by funding accrual.
public enum Exposure has copy, drop {
  Flat,
  Long { size: Size },
  Short { size: Size },
}

// === Package Functions ===

/// Empty funding state for one market: both indexes at zero, no cursors.
public(package) fun new(ctx: &mut TxContext): FundingState {
  FundingState {
    long_pays: 0,
    short_pays: 0,
    cursors: table::new(ctx),
  }
}

public(package) fun flat(): Exposure { Exposure::Flat }

public(package) fun long(size: Size): Exposure { Exposure::Long { size } }

public(package) fun short(size: Size): Exposure { Exposure::Short { size } }

/// Advance the paying side's index by one round's increment
/// (`mark_price * rate_bps`, undivided). The wrapper selects the index by
/// dispatching on the round's paying `Side`.
public(package) fun advance_long_pays(
  state: &mut FundingState,
  mark_price: Price,
  rate_bps: u64,
) {
  state.long_pays =
    state.long_pays + risk::funding_index_increment(mark_price, rate_bps);
}

/// Advance the short-paying index by one round's increment.
public(package) fun advance_short_pays(
  state: &mut FundingState,
  mark_price: Price,
  rate_bps: u64,
) {
  state.short_pays =
    state.short_pays + risk::funding_index_increment(mark_price, rate_bps);
}

/// Bring one account's accruals current for its exposure at THIS moment
/// and snapshot its cursor at today's indexes. The wrapper must call this
/// with the pre-change exposure before any transition that changes the
/// account's position size, and may call it any time (idempotent at an
/// unchanged index). A first touch creates the cursor at the current
/// indexes: an account accrues funding only from its first position change
/// onward, which is exactly when it first gains exposure.
public(package) fun accrue(
  state: &mut FundingState,
  margin_account_id: ID,
  exposure: Exposure,
) {
  state.ensure_cursor(margin_account_id);
  let long_pays = state.long_pays;
  let short_pays = state.short_pays;
  let cursor = &mut state.cursors[margin_account_id];
  let long_delta = long_pays - cursor.long_pays;
  let short_delta = short_pays - cursor.short_pays;
  match (exposure) {
    Exposure::Flat => (),
    Exposure::Long { size } => {
      cursor.payable =
        cursor.payable + risk::funding_owed(size, long_delta).value();
      cursor.receivable =
        cursor.receivable + risk::funding_owed(size, short_delta).value();
    },
    Exposure::Short { size } => {
      cursor.payable =
        cursor.payable + risk::funding_owed(size, short_delta).value();
      cursor.receivable =
        cursor.receivable + risk::funding_owed(size, long_delta).value();
    },
  };
  cursor.long_pays = long_pays;
  cursor.short_pays = short_pays;
}

/// Net one account's accrued balances against each other, zero them, and
/// return `(payable, receivable)` — at most one is positive. The wrapper
/// immediately turns the result into carry transfers; an abort in that
/// transfer rolls this take back atomically.
public(package) fun take_net(
  state: &mut FundingState,
  margin_account_id: ID,
): (u64, u64) {
  state.ensure_cursor(margin_account_id);
  let cursor = &mut state.cursors[margin_account_id];
  let offset = if (cursor.payable < cursor.receivable) {
    cursor.payable
  } else {
    cursor.receivable
  };
  let payable = cursor.payable - offset;
  let receivable = cursor.receivable - offset;
  cursor.payable = 0;
  cursor.receivable = 0;
  (payable, receivable)
}

/// Reduce a just-taken payable by the standard cap: a payer transfers at
/// most its position collateral; the remainder is forgiven, matching
/// docs/funding.md ("pays what it has, never driven below zero").
public(package) fun capped_payment(
  payable: u64,
  position_collateral: UsdcAmount,
): u64 {
  if (payable > position_collateral.value()) {
    position_collateral.value()
  } else {
    payable
  }
}

// === View Functions ===

/// Cumulative index of rounds longs paid (`mark_price * rate_bps` units).
public(package) fun long_pays_index(state: &FundingState): u128 {
  state.long_pays
}

/// Cumulative index of rounds shorts paid.
public(package) fun short_pays_index(state: &FundingState): u128 {
  state.short_pays
}

/// Accrued unsettled USDC base units owed BY the account, `0` untouched.
public(package) fun payable(
  state: &FundingState,
  margin_account_id: ID,
): u64 {
  if (state.cursors.contains(margin_account_id)) {
    state.cursors[margin_account_id].payable
  } else {
    0
  }
}

/// Accrued unsettled USDC base units owed TO the account, `0` untouched.
public(package) fun receivable(
  state: &FundingState,
  margin_account_id: ID,
): u64 {
  if (state.cursors.contains(margin_account_id)) {
    state.cursors[margin_account_id].receivable
  } else {
    0
  }
}

// === Private Functions ===

fun ensure_cursor(state: &mut FundingState, margin_account_id: ID) {
  if (!state.cursors.contains(margin_account_id)) {
    state.cursors.add(
      margin_account_id,
      Cursor {
        long_pays: state.long_pays,
        short_pays: state.short_pays,
        payable: 0,
        receivable: 0,
      },
    );
  };
}

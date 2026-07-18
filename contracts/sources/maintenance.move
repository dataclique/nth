module nth::maintenance;

use sui::clock::Clock;
use sui::event;
use sui::table::{Self, Table};
use units::usdc_amount::UsdcAmount;

// === Constants ===

const EVENT_SCHEMA_VERSION: u16 = 1;

// === Errors ===

#[error]
const EActionKindExists: vector<u8> =
  b"a maintenance action kind can be registered exactly once per market";

#[error]
const EActionUnknown: vector<u8> =
  b"maintenance action kind is not registered for this market";

#[error]
const EPeriodNotNext: vector<u8> =
  b"maintenance periods advance sequentially and apply exactly once";

#[error]
const EPeriodNotDue: vector<u8> =
  b"maintenance period has not reached its wall-clock start";

#[error]
const ERewardExceedsCap: vector<u8> =
  b"maintenance reward exceeds the action's registered maximum";

// === Structs ===

/// Per-market bookkeeping for permissionless maintenance actions. The
/// containing market owns one schedule; each instrument-defined action kind
/// registers exactly once.
public struct Schedule<phantom Instrument> has store {
  actions: Table<u64, Action>,
}

/// One registered maintenance action. `last_period` is `0` until the first
/// claim; periods start at `1` and advance sequentially. Period `p` becomes
/// claimable at `registered_at_ms + p * period_interval_ms`, so catching up
/// past periods is immediate while future periods stay locked.
public struct Action has store {
  last_period: u64,
  registered_at_ms: u64,
  period_interval_ms: u64,
  reserve_account_id: ID,
  max_reward: u64,
}

// === Events ===

/// Emitted once when an instrument registers a maintenance action kind.
public struct ActionRegistered<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  kind: u64,
  period_interval_ms: u64,
  reserve_account_id: ID,
  max_reward: u64,
}

/// Emitted when one maintenance period is claimed. `reward` is USDC base
/// units paid from the registered reserve to the claiming keeper account.
public struct PeriodClaimed<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  kind: u64,
  period: u64,
  keeper_account_id: ID,
  reward: u64,
}

// === Package Functions ===

/// Create an empty maintenance schedule for one market.
public(package) fun new<Instrument>(ctx: &mut TxContext): Schedule<Instrument> {
  Schedule { actions: table::new(ctx) }
}

/// Register one maintenance action kind exactly once. `period_interval_ms`
/// spaces period start times from registration; `max_reward` caps every
/// per-period keeper payment from `reserve_account_id`'s free collateral.
public(package) fun register<Instrument>(
  schedule: &mut Schedule<Instrument>,
  market_id: ID,
  kind: u64,
  period_interval_ms: u64,
  reserve_account_id: ID,
  max_reward: UsdcAmount,
  clock: &Clock,
) {
  assert!(!schedule.actions.contains(kind), EActionKindExists);
  schedule.actions.add(
    kind,
    Action {
      last_period: 0,
      registered_at_ms: clock.timestamp_ms(),
      period_interval_ms,
      reserve_account_id,
      max_reward: max_reward.value(),
    },
  );
  event::emit(ActionRegistered<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    kind,
    period_interval_ms,
    reserve_account_id,
    max_reward: max_reward.value(),
  });
}

/// Validate one period claim without mutating: the action exists, `period`
/// is exactly the next unclaimed period, its wall-clock start has passed,
/// and `reward` respects the registered cap.
public(package) fun validate_claim<Instrument>(
  schedule: &Schedule<Instrument>,
  kind: u64,
  period: u64,
  reward: UsdcAmount,
  clock: &Clock,
) {
  assert!(schedule.actions.contains(kind), EActionUnknown);
  let action = &schedule.actions[kind];
  assert!(period == action.last_period + 1, EPeriodNotNext);
  let due_at_ms =
    action.registered_at_ms + period * action.period_interval_ms;
  assert!(clock.timestamp_ms() >= due_at_ms, EPeriodNotDue);
  assert!(reward.value() <= action.max_reward, ERewardExceedsCap);
}

/// Advance the action's period cursor after validation and payment, emitting
/// the primitive claim event.
public(package) fun record_claim<Instrument>(
  schedule: &mut Schedule<Instrument>,
  market_id: ID,
  kind: u64,
  period: u64,
  keeper_account_id: ID,
  reward: UsdcAmount,
) {
  assert!(schedule.actions.contains(kind), EActionUnknown);
  let action = &mut schedule.actions[kind];
  assert!(period == action.last_period + 1, EPeriodNotNext);
  action.last_period = period;
  event::emit(PeriodClaimed<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    kind,
    period,
    keeper_account_id,
    reward: reward.value(),
  });
}

/// The registered reward reserve for one action kind. Aborts when the kind
/// is not registered.
public(package) fun reserve_account_id<Instrument>(
  schedule: &Schedule<Instrument>,
  kind: u64,
): ID {
  assert!(schedule.actions.contains(kind), EActionUnknown);
  schedule.actions[kind].reserve_account_id
}

/// The last claimed period for one action kind, `0` before the first claim.
/// Aborts when the kind is not registered.
public(package) fun last_period<Instrument>(
  schedule: &Schedule<Instrument>,
  kind: u64,
): u64 {
  assert!(schedule.actions.contains(kind), EActionUnknown);
  schedule.actions[kind].last_period
}

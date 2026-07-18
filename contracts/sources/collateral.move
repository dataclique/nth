module nth::collateral;

use sui::balance::{Self, Balance};
use sui::event;
use sui::table::{Self, Table};
use units::usdc_amount::{Self, UsdcAmount};
use usdc::usdc::USDC;

// === Errors ===

#[error]
const EInsufficientFreeCollateral: vector<u8> =
  b"market account has insufficient free collateral";

#[error]
const EInsufficientWithdrawableCollateral: vector<u8> =
  b"market account has insufficient withdrawable collateral";

#[error]
const EInsufficientReservedCollateral: vector<u8> =
  b"order reservation has insufficient collateral";

#[error]
const EInsufficientPositionCollateral: vector<u8> =
  b"claim redemption exceeds the account's position collateral";

#[error]
const EReservationNotFound: vector<u8> =
  b"order collateral reservation does not exist";

#[error]
const EReservationOwnerMismatch: vector<u8> =
  b"order collateral reservation belongs to another margin account";

#[error]
const EZeroDeposit: vector<u8> = b"market collateral deposit must be positive";

#[error]
const EZeroWithdrawal: vector<u8> =
  b"market collateral withdrawal must be positive";

// === Constants ===

const EVENT_SCHEMA_VERSION: u16 = 1;

// === Structs ===

/// Typed identity for one market-local order collateral reservation.
public struct ReservationId has copy, drop, store {
  value: u64,
}

/// Market-isolated USDC custody. Values are physically stored under the shared
/// market so fills can settle resting makers without their owned accounts.
public struct Silo<phantom Instrument> has store {
  accounts: Table<ID, AccountCollateral>,
  reservations: Table<ReservationId, Reservation>,
  next_reservation_id: u64,
  total_collateral: u64,
}

public struct AccountCollateral has store {
  free: Balance<USDC>,
  position: Balance<USDC>,
  reservation_count: u64,
}

public struct Reservation has store {
  account_id: ID,
  balance: Balance<USDC>,
}

// === Events ===

public struct CollateralDeposited<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  amount: u64,
}

public struct CollateralWithdrawn<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  amount: u64,
}

public struct CollateralReserved<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  reservation_id: u64,
  amount: u64,
}

public struct ReservationConsumed<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  reservation_id: u64,
  amount: u64,
}

public struct ReservationReleased<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  margin_account_id: ID,
  reservation_id: u64,
  amount: u64,
}

// === Method Aliases ===

public use fun reservation_id_value as ReservationId.value;
public use fun reservation_id_eq as ReservationId.eq;

// === Public Functions ===

/// Primitive market-local reservation sequence number.
public fun reservation_id_value(id: ReservationId): u64 { id.value }

public fun reservation_id_eq(id: ReservationId, other: ReservationId): bool {
  id.value == other.value
}

// === Package Functions ===

/// Create an empty market-isolated USDC silo.
public(package) fun new<Instrument>(ctx: &mut TxContext): Silo<Instrument> {
  Silo {
    accounts: table::new(ctx),
    reservations: table::new(ctx),
    next_reservation_id: 0,
    total_collateral: 0,
  }
}

/// Credit an exact USDC balance to one account's free market collateral.
public(package) fun deposit<Instrument>(
  silo: &mut Silo<Instrument>,
  market_id: ID,
  margin_account_id: ID,
  collateral: Balance<USDC>,
) {
  let amount = collateral.value();
  assert!(amount > 0, EZeroDeposit);
  let account = silo.ensure_account(margin_account_id);
  account.free.join(collateral);
  silo.total_collateral = silo.total_collateral + amount;

  event::emit(CollateralDeposited<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    margin_account_id,
    amount,
  });
}

/// Remove an exact USDC amount from one account's free market collateral.
/// Aborts before mutation when the market-local free balance is insufficient.
public(package) fun withdraw<Instrument>(
  silo: &mut Silo<Instrument>,
  market_id: ID,
  margin_account_id: ID,
  amount: UsdcAmount,
): Balance<USDC> {
  let value = amount.value();
  assert!(value > 0, EZeroWithdrawal);
  assert!(
    silo.free(margin_account_id).ge(amount),
    EInsufficientWithdrawableCollateral,
  );
  let collateral = silo.accounts[margin_account_id].free.split(value);
  silo.total_collateral = silo.total_collateral - value;
  silo.remove_empty_account(margin_account_id);

  event::emit(CollateralWithdrawn<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    margin_account_id,
    amount: value,
  });
  collateral
}

/// Move an instrument-defined USDC amount from free collateral into a unique
/// order reservation. Zero is valid for an instrument that requires no reserve.
public(package) fun reserve<Instrument>(
  silo: &mut Silo<Instrument>,
  market_id: ID,
  margin_account_id: ID,
  amount: UsdcAmount,
): ReservationId {
  assert!(silo.free(margin_account_id).ge(amount), EInsufficientFreeCollateral);
  let reservation_id = ReservationId {
    value: silo.next_reservation_id,
  };
  silo.next_reservation_id = silo.next_reservation_id + 1;
  let account = silo.ensure_account(margin_account_id);
  let collateral = account.free.split(amount.value());
  account.reservation_count = account.reservation_count + 1;
  silo.reservations.add(
    reservation_id,
    Reservation {
      account_id: margin_account_id,
      balance: collateral,
    },
  );

  event::emit(CollateralReserved<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    margin_account_id,
    reservation_id: reservation_id.value(),
    amount: amount.value(),
  });
  reservation_id
}

/// Move an exact USDC amount from an order reservation into the account's
/// position collateral. Aborts on a missing, foreign, or insufficient reserve.
public(package) fun consume<Instrument>(
  silo: &mut Silo<Instrument>,
  market_id: ID,
  reservation_id: ReservationId,
  margin_account_id: ID,
  amount: UsdcAmount,
) {
  silo.validate_consume(reservation_id, margin_account_id, amount);
  let collateral = silo.reservations[reservation_id].balance.split(amount.value());
  silo.ensure_account(margin_account_id).position.join(collateral);

  event::emit(ReservationConsumed<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    margin_account_id,
    reservation_id: reservation_id.value(),
    amount: amount.value(),
  });
}

/// Validate a reservation debit before any collateral or position mutation.
public(package) fun validate_consume<Instrument>(
  silo: &Silo<Instrument>,
  reservation_id: ReservationId,
  margin_account_id: ID,
  amount: UsdcAmount,
) {
  assert!(silo.reservations.contains(reservation_id), EReservationNotFound);
  let reservation = &silo.reservations[reservation_id];
  assert!(
    reservation.account_id == margin_account_id,
    EReservationOwnerMismatch,
  );
  assert!(
    reservation.balance.value() >= amount.value(),
    EInsufficientReservedCollateral,
  );
}

/// Remove a reservation and return all unconsumed USDC to its owner's free
/// collateral. Aborts when the reservation does not belong to this market.
public(package) fun release<Instrument>(
  silo: &mut Silo<Instrument>,
  market_id: ID,
  reservation_id: ReservationId,
): UsdcAmount {
  assert!(silo.reservations.contains(reservation_id), EReservationNotFound);
  let Reservation {
    account_id,
    balance,
  } = silo.reservations.remove(reservation_id);
  let amount = usdc_amount::usdc(balance.value());
  let account = silo.ensure_account(account_id);
  account.reservation_count = account.reservation_count - 1;
  account.free.join(balance);
  silo.remove_empty_account(account_id);

  event::emit(ReservationReleased<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    margin_account_id: account_id,
    reservation_id: reservation_id.value(),
    amount: amount.value(),
  });
  amount
}

/// Validate moving free collateral into position collateral without mutation.
public(package) fun validate_free<Instrument>(
  silo: &Silo<Instrument>,
  margin_account_id: ID,
  amount: UsdcAmount,
) {
  assert!(silo.free(margin_account_id).ge(amount), EInsufficientFreeCollateral);
}

/// Move collateral from an account's free bucket into its position bucket.
public(package) fun move_free_to_position<Instrument>(
  silo: &mut Silo<Instrument>,
  margin_account_id: ID,
  amount: UsdcAmount,
) {
  silo.validate_free(margin_account_id, amount);
  let collateral = silo.accounts[margin_account_id].free.split(amount.value());
  silo.accounts[margin_account_id].position.join(collateral);
}

/// Validate releasing position collateral without mutation.
public(package) fun validate_position<Instrument>(
  silo: &Silo<Instrument>,
  margin_account_id: ID,
  amount: UsdcAmount,
) {
  assert!(
    silo.position(margin_account_id).ge(amount),
    EInsufficientPositionCollateral,
  );
}

/// Move collateral from an account's position bucket back into its free bucket.
/// A zero payout is valid when an instrument's realizable assets are exhausted.
public(package) fun move_position_to_free<Instrument>(
  silo: &mut Silo<Instrument>,
  margin_account_id: ID,
  amount: UsdcAmount,
) {
  silo.validate_position(margin_account_id, amount);
  if (amount.value() > 0) {
    let collateral = silo.accounts[margin_account_id]
      .position
      .split(amount.value());
    silo.accounts[margin_account_id].free.join(collateral);
  };
}

public(package) fun free<Instrument>(
  silo: &Silo<Instrument>,
  margin_account_id: ID,
): UsdcAmount {
  if (silo.accounts.contains(margin_account_id)) {
    usdc_amount::usdc(silo.accounts[margin_account_id].free.value())
  } else {
    usdc_amount::usdc(0)
  }
}

public(package) fun position<Instrument>(
  silo: &Silo<Instrument>,
  margin_account_id: ID,
): UsdcAmount {
  if (silo.accounts.contains(margin_account_id)) {
    usdc_amount::usdc(silo.accounts[margin_account_id].position.value())
  } else {
    usdc_amount::usdc(0)
  }
}

public(package) fun has_reservation<Instrument>(
  silo: &Silo<Instrument>,
  reservation_id: ReservationId,
): bool {
  silo.reservations.contains(reservation_id)
}

public(package) fun reserved<Instrument>(
  silo: &Silo<Instrument>,
  reservation_id: ReservationId,
): UsdcAmount {
  assert!(silo.reservations.contains(reservation_id), EReservationNotFound);
  usdc_amount::usdc(silo.reservations[reservation_id].balance.value())
}

public(package) fun total<Instrument>(silo: &Silo<Instrument>): UsdcAmount {
  usdc_amount::usdc(silo.total_collateral)
}

// === Private Functions ===

fun ensure_account<Instrument>(
  silo: &mut Silo<Instrument>,
  margin_account_id: ID,
): &mut AccountCollateral {
  if (!silo.accounts.contains(margin_account_id)) {
    silo.accounts.add(
      margin_account_id,
      AccountCollateral {
        free: balance::zero(),
        position: balance::zero(),
        reservation_count: 0,
      },
    );
  };
  &mut silo.accounts[margin_account_id]
}

fun remove_empty_account<Instrument>(
  silo: &mut Silo<Instrument>,
  margin_account_id: ID,
) {
  if (silo.accounts.contains(margin_account_id)) {
    let account = &silo.accounts[margin_account_id];
    if (
      account.free.value() == 0 &&
      account.position.value() == 0 &&
      account.reservation_count == 0
    ) {
      let AccountCollateral {
        free,
        position,
        reservation_count: _,
      } = silo.accounts.remove(margin_account_id);
      free.destroy_zero();
      position.destroy_zero();
    };
  };
}

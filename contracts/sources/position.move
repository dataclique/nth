module nth::position;

use nth::order::{OrderId, Side};
use sui::event;
use units::size::{Self, Size};

// === Constants ===

const STATE_FLAT: u8 = 0;
const STATE_LONG: u8 = 1;
const STATE_SHORT: u8 = 2;
const EVENT_SCHEMA_VERSION: u16 = 1;

// === Errors ===

#[error]
const EZeroTradeSize: vector<u8> = b"trade size must be positive";

#[error]
const ENotLongClaim: vector<u8> =
  b"issuance and redemption require a flat or long claim position";

#[error]
const EInsufficientLongClaim: vector<u8> =
  b"redemption exceeds the account's long claim";

#[error]
const EZeroClaimSize: vector<u8> = b"claim size must be positive";

// === Structs ===

/// The only representable net exposure states for one account in one market.
public enum Exposure has copy, drop, store {
  Flat,
  Long { size: Size },
  Short { size: Size },
}

/// One net exposure logically bound to `account_id` and to the containing
/// `instrument_market::Market<Instrument>`. The value has no `key`, so it
/// cannot be independently transferred as a Sui object.
public struct Position<phantom Instrument> has store {
  account_id: ID,
  exposure: Exposure,
}

// === Events ===

/// Emitted after one side of a trade mutates its net position. State codes are
/// flat `0`, long `1`, and short `2`; sizes use the shared `10^6` scale.
public struct PositionChanged<phantom Instrument> has copy, drop {
  schema_version: u16,
  market_id: ID,
  account_id: ID,
  maker_order_id: u64,
  taker_order_id: u64,
  is_buy: bool,
  previous_state: u8,
  previous_size: u64,
  current_state: u8,
  current_size: u64,
}

// === View Functions ===

/// The margin-account object ID to which this position is logically bound.
public fun account_id<Instrument>(position: &Position<Instrument>): ID {
  position.account_id
}

/// Primitive state code: flat `0`, long `1`, or short `2`.
public fun state<Instrument>(position: &Position<Instrument>): u8 {
  exposure_state(&position.exposure)
}

/// Absolute position size at the shared `10^6` scale; zero only when flat.
public fun size<Instrument>(position: &Position<Instrument>): Size {
  exposure_size(&position.exposure)
}

/// Primitive state code for a flat position.
public fun flat(): u8 {
  STATE_FLAT
}

/// Primitive state code for a long position.
public fun long(): u8 {
  STATE_LONG
}

/// Primitive state code for a short position.
public fun short(): u8 {
  STATE_SHORT
}

// === Package Functions ===

/// Create a flat position logically bound to `account_id`.
public(package) fun new<Instrument>(account_id: ID): Position<Instrument> {
  Position {
    account_id,
    exposure: Exposure::Flat,
  }
}

/// Apply a positive trade size to one account's net exposure and emit the
/// resulting primitive event envelope. Aborts if `trade_size` is zero or if
/// increasing an exposure overflows `u64`.
public(package) fun apply_trade<Instrument>(
  position: &mut Position<Instrument>,
  market_id: ID,
  maker_order_id: OrderId,
  taker_order_id: OrderId,
  side: Side,
  trade_size: Size,
) {
  assert!(!trade_size.is_zero(), EZeroTradeSize);

  let previous_state = position.state();
  let previous_size = position.size();
  let exposure = position.exposure;
  position.exposure = side.match_side!(
    || apply_buy(exposure, trade_size),
    || apply_sell(exposure, trade_size),
  );

  event::emit(PositionChanged<Instrument> {
    schema_version: EVENT_SCHEMA_VERSION,
    market_id,
    account_id: position.account_id,
    maker_order_id: maker_order_id.value(),
    taker_order_id: taker_order_id.value(),
    is_buy: side.is_bid(),
    previous_state,
    previous_size: previous_size.value(),
    current_state: position.state(),
    current_size: position.size().value(),
  });
}

/// Validate issuance of a positive claim without mutating exposure.
public(package) fun validate_issue_long_claim<Instrument>(
  position: &Position<Instrument>,
  claim_size: Size,
) {
  assert!(!claim_size.is_zero(), EZeroClaimSize);
  match (&position.exposure) {
    Exposure::Flat => (),
    Exposure::Long { size } => {
      let _ = (*size).add(claim_size);
    },
    Exposure::Short { size: _ } => abort ENotLongClaim,
  };
}

/// Increase a flat or long positive claim after validation.
public(package) fun issue_long_claim<Instrument>(
  position: &mut Position<Instrument>,
  claim_size: Size,
) {
  position.validate_issue_long_claim(claim_size);
  position.exposure = match (position.exposure) {
    Exposure::Flat => Exposure::Long { size: claim_size },
    Exposure::Long { size } => Exposure::Long {
      size: size.add(claim_size),
    },
    Exposure::Short { size: _ } => abort ENotLongClaim,
  };
}

/// Validate reduction of an existing long claim without mutating exposure.
public(package) fun validate_redeem_long_claim<Instrument>(
  position: &Position<Instrument>,
  claim_size: Size,
) {
  assert!(!claim_size.is_zero(), EZeroClaimSize);
  match (&position.exposure) {
    Exposure::Long { size } => {
      assert!(!(*size).lt(claim_size), EInsufficientLongClaim);
    },
    Exposure::Flat | Exposure::Short { size: _ } => abort ENotLongClaim,
  };
}

/// Reduce an existing long claim after validation, becoming flat at zero.
public(package) fun redeem_long_claim<Instrument>(
  position: &mut Position<Instrument>,
  claim_size: Size,
) {
  position.validate_redeem_long_claim(claim_size);
  position.exposure = match (position.exposure) {
    Exposure::Long { size } => {
      if (size.eq(claim_size)) {
        Exposure::Flat
      } else {
        Exposure::Long {
          size: size.sub(claim_size),
        }
      }
    },
    Exposure::Flat | Exposure::Short { size: _ } => abort ENotLongClaim,
  };
}

/// Consume one position during terminal settlement. Only the containing
/// market's terminal transition may close exposure this way.
public(package) fun destroy<Instrument>(position: Position<Instrument>) {
  let Position { account_id: _, exposure: _ } = position;
}

/// Preserve a named position-module abort when a market has no materialized
/// positive claim for an account.
public(package) fun assert_long_claim_materialized(materialized: bool) {
  assert!(materialized, ENotLongClaim);
}

public(package) fun assert_claim_size_positive(claim_size: Size) {
  assert!(!claim_size.is_zero(), EZeroClaimSize);
}

// === Private Functions ===

fun apply_buy(exposure: Exposure, trade_size: Size): Exposure {
  match (exposure) {
    Exposure::Flat => Exposure::Long { size: trade_size },
    Exposure::Long { size } => Exposure::Long {
      size: size.add(trade_size),
    },
    Exposure::Short { size } => {
      if (trade_size.lt(size)) {
        Exposure::Short {
          size: size.sub(trade_size),
        }
      } else if (trade_size.eq(size)) {
        Exposure::Flat
      } else {
        Exposure::Long {
          size: trade_size.sub(size),
        }
      }
    },
  }
}

fun apply_sell(exposure: Exposure, trade_size: Size): Exposure {
  match (exposure) {
    Exposure::Flat => Exposure::Short { size: trade_size },
    Exposure::Short { size } => Exposure::Short {
      size: size.add(trade_size),
    },
    Exposure::Long { size } => {
      if (trade_size.lt(size)) {
        Exposure::Long {
          size: size.sub(trade_size),
        }
      } else if (trade_size.eq(size)) {
        Exposure::Flat
      } else {
        Exposure::Short {
          size: trade_size.sub(size),
        }
      }
    },
  }
}

fun exposure_state(exposure: &Exposure): u8 {
  match (exposure) {
    Exposure::Flat => STATE_FLAT,
    Exposure::Long { size: _ } => STATE_LONG,
    Exposure::Short { size: _ } => STATE_SHORT,
  }
}

fun exposure_size(exposure: &Exposure): Size {
  match (exposure) {
    Exposure::Flat => size::size_zero(),
    Exposure::Long { size } => *size,
    Exposure::Short { size } => *size,
  }
}

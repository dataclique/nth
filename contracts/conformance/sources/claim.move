module instrument_conformance::claim;

use nth::instrument_market::{Self, Market};
use nth::margin::MarginAccount;
use units::size::{Self, Size};
use units::usdc_amount::UsdcAmount;

// === Structs ===

/// Type-level identity for a positive-claim instrument implementation.
public struct Claim has drop {
  private: bool,
}

/// External wrapper that issues and redeems long claims through the kernel.
public struct ClaimMarket has key {
  id: UID,
  kernel: Market<Claim>,
}

// === Public Functions ===

/// Create a claim market without exposing its private witness.
public fun new(ctx: &mut TxContext): ClaimMarket {
  let witness = witness();
  ClaimMarket {
    id: object::new(ctx),
    kernel: instrument_market::new(&witness, ctx),
  }
}

/// Share the wrapper object that owns generic and instrument-specific state.
public fun share(market: ClaimMarket) {
  transfer::share_object(market);
}

/// Move USDC base units into this claim market's isolated collateral.
public fun deposit_collateral(
  market: &mut ClaimMarket,
  margin_account: &mut MarginAccount,
  amount: UsdcAmount,
  ctx: &mut TxContext,
) {
  let witness = witness();
  instrument_market::deposit_collateral(
    &mut market.kernel,
    margin_account,
    amount,
    &witness,
    ctx,
  );
}

/// Issue a long claim by locking instrument-supplied free collateral 1:1.
public fun issue(
  market: &mut ClaimMarket,
  margin_account: &MarginAccount,
  amount: UsdcAmount,
  ctx: &TxContext,
) {
  let witness = witness();
  instrument_market::issue_long_claim(
    &mut market.kernel,
    margin_account,
    amount,
    size_from_usdc(amount),
    &witness,
    ctx,
  );
}

/// Redeem a long claim and release the same USDC amount to free collateral.
public fun redeem(
  market: &mut ClaimMarket,
  margin_account: &MarginAccount,
  amount: UsdcAmount,
  ctx: &TxContext,
) {
  let witness = witness();
  instrument_market::redeem_long_claim(
    &mut market.kernel,
    margin_account,
    size_from_usdc(amount),
    amount,
    &witness,
    ctx,
  );
}

/// Primitive net-position state for one account in this claim market.
public fun position_state(
  market: &ClaimMarket,
  margin_account_id: ID,
): u8 {
  instrument_market::position_state(&market.kernel, margin_account_id)
}

/// Absolute net-position size at the shared `10^6` scale.
public fun position_size(
  market: &ClaimMarket,
  margin_account_id: ID,
): Size {
  instrument_market::position_size(&market.kernel, margin_account_id)
}

/// Free USDC base units available to the account in this market.
public fun free_collateral(
  market: &ClaimMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::free_collateral(&market.kernel, margin_account_id)
}

/// USDC base units backing the account's issued claim.
public fun position_collateral(
  market: &ClaimMarket,
  margin_account_id: ID,
): UsdcAmount {
  instrument_market::position_collateral(&market.kernel, margin_account_id)
}

/// Total USDC base units isolated inside this claim market.
public fun total_collateral(market: &ClaimMarket): UsdcAmount {
  instrument_market::total_collateral(&market.kernel)
}

// === Private Functions ===

fun witness(): Claim {
  Claim { private: true }
}

/// Fixture mapping: one USDC base unit backs one size base unit.
fun size_from_usdc(amount: UsdcAmount): Size {
  size::size(amount.value())
}

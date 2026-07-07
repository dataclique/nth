#[test_only]
module strike::vault_tests;

use strike::constants;
use strike::vault;
use sui::coin::mint_for_testing;
use sui::test_utils::destroy;
use usdc::usdc::USDC;

/// Scale a whole-USDC amount into base units (see docs/float_scaling.md).
fun scaled(amount: u64): u64 {
  amount * constants::float_scaling()
}

#[test]
fun test_deposit_accumulates() {
  let mut ctx = tx_context::dummy();
  let mut vault = vault::empty(&mut ctx);

  vault.deposit(mint_for_testing<USDC>(scaled(100), &mut ctx));
  vault.deposit(mint_for_testing<USDC>(scaled(50), &mut ctx));

  assert!(vault.balance() == scaled(150), 0);
  destroy(vault);
}

#[test]
fun test_withdraw_reduces_balance_and_returns_coin() {
  let mut ctx = tx_context::dummy();
  let mut vault = vault::empty(&mut ctx);
  vault.deposit(mint_for_testing<USDC>(scaled(100), &mut ctx));

  let coin = vault.withdraw(scaled(40), &mut ctx);

  assert!(vault.balance() == scaled(60), 0);
  assert!(coin.burn_for_testing() == scaled(40), 1);
  destroy(vault);
}

#[test]
fun test_withdraw_full_balance_empties_vault() {
  let mut ctx = tx_context::dummy();
  let mut vault = vault::empty(&mut ctx);
  vault.deposit(mint_for_testing<USDC>(scaled(100), &mut ctx));

  let coin = vault.withdraw(scaled(100), &mut ctx);

  assert!(vault.balance() == 0, 0);
  assert!(coin.burn_for_testing() == scaled(100), 1);
  destroy(vault);
}

/// The vault has no over-withdrawal guard of its own; the abort comes from
/// `sui::balance::split`.
#[test, expected_failure(abort_code = sui::balance::ENotEnough)]
fun test_withdraw_more_than_balance_aborts() {
  let mut ctx = tx_context::dummy();
  let mut vault = vault::empty(&mut ctx);
  vault.deposit(mint_for_testing<USDC>(scaled(100), &mut ctx));

  let coin = vault.withdraw(scaled(100) + 1, &mut ctx);

  coin.burn_for_testing();
  destroy(vault);
}

/// Documents that there is no minimum withdrawal: a zero-amount withdraw
/// succeeds, returns a zero coin, and leaves the balance untouched.
#[test]
fun test_zero_amount_withdraw_returns_zero_coin() {
  let mut ctx = tx_context::dummy();
  let mut vault = vault::empty(&mut ctx);
  vault.deposit(mint_for_testing<USDC>(scaled(100), &mut ctx));

  let coin = vault.withdraw(0, &mut ctx);

  assert!(coin.burn_for_testing() == 0, 0);
  assert!(vault.balance() == scaled(100), 1);
  destroy(vault);
}

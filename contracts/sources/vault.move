module nth::vault;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use usdc::usdc::USDC;

// === Structs ===

/// Pooled USDC collateral backing every order and position in a pool.
/// Only `nth::pool` moves value in or out.
public struct Vault has key, store {
  id: UID,
  balance: Balance<USDC>,
}

// === Package Functions ===

/// A vault holding zero USDC.
public(package) fun empty(ctx: &mut TxContext): Vault {
  Vault {
    id: object::new(ctx),
    balance: balance::zero(),
  }
}

/// Current holdings in USDC base units.
public(package) fun balance(self: &Vault): u64 {
  balance::value(&self.balance)
}

/// Absorb the full value of `coin` into the vault.
public(package) fun deposit(self: &mut Vault, coin: Coin<USDC>) {
  let balance = coin::into_balance(coin);
  balance::join(&mut self.balance, balance);
}

/// Split `amount` USDC base units out of the vault as a Coin. Aborts (in
/// `sui::balance::split`, `ENotEnough`) when the vault holds less than
/// `amount`.
public(package) fun withdraw(
  self: &mut Vault,
  amount: u64,
  ctx: &mut TxContext,
): Coin<USDC> {
  let balance = balance::split(&mut self.balance, amount);
  coin::from_balance(balance, ctx)
}

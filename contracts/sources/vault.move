module strike::vault;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use usdc::usdc::USDC;

public struct Vault has key, store {
  id: UID,
  balance: Balance<USDC>,
}

public(package) fun empty(ctx: &mut TxContext): Vault {
  Vault {
    id: object::new(ctx),
    balance: balance::zero(),
  }
}

public(package) fun balance(self: &Vault): u64 {
  balance::value(&self.balance)
}

public(package) fun deposit(self: &mut Vault, coin: Coin<USDC>) {
  let balance = coin::into_balance(coin);
  balance::join(&mut self.balance, balance);
}

public(package) fun withdraw(
  self: &mut Vault,
  amount: u64,
  ctx: &mut TxContext,
): Coin<USDC> {
  let balance = balance::split(&mut self.balance, amount);
  coin::from_balance(balance, ctx)
}

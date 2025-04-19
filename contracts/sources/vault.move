// module strike::vault;

// use sui::balance::{Self, Balance};
// use sui::coin::{Self, Coin};
// use usdc::usdc::USDC;

// /// Vault holds balance of USDC
// public struct Vault has store {
//   balance: Balance<USDC>,
// }

// public fun empty(): Vault {
//   Vault {
//     balance: balance::zero(),
//   }
// }

// public fun balance(self: &Vault): u64 {
//   balance::value(&self.balance)
// }

// public fun deposit(self: &mut Vault, coin: Coin<USDC>) {
//   let balance = coin::into_balance(coin);
//   balance::join(&mut self.balance, balance);
// }

// public fun withdraw(
//   self: &mut Vault,
//   amount: u64,
//   ctx: &mut TxContext,
// ): Coin<USDC> {
//   let balance = balance::split(&mut self.balance, amount);
//   coin::from_balance(balance, ctx)
// }

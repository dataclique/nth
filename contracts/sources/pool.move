// module strike::pool;

// use strike::order::{Self, Order};
// use strike::orderbook::{Self, OrderBook};
// use strike::strike::{Self, MarginAccount};
// use strike::vault::{Self, Vault};
// use sui::balance::{Self, Balance};
// use sui::coin::{Self as CoinModule, Coin};
// use sui::event;
// use sui::object::{Self, ID, UID};
// use sui::tx_context::{Self, TxContext};
// use usdc::usdc::USDC;

// // Error constants
// const EInsufficientBalance: u64 = 1;
// const EInvalidPrice: u64 = 2;
// const EInvalidQuantity: u64 = 3;
// const EInvalidAccountOwner: u64 = 4;

// /// Pool holds the vault and orderbook for a trading pair
// public struct Pool<phantom BaseAsset, phantom QuoteAsset> has key, store {
//   id: UID,
//   vault: Vault<BaseAsset, QuoteAsset>,
//   orderbook: OrderBook,
// }

// /// Events
// public struct PoolCreated has copy, drop {
//   pool_id: ID,
// }

// public struct PoolDepositedBase has copy, drop {
//   pool_id: ID,
//   base_amount: u64,
// }

// public struct PoolDepositedQuote has copy, drop {
//   pool_id: ID,
//   quote_amount: u64,
// }

// public fun new<BaseAsset, QuoteAsset>(
//   ctx: &mut TxContext,
// ): Pool<BaseAsset, QuoteAsset> {
//   let id = object::new(ctx);
//   let vault = vault::empty();
//   let orderbook = orderbook::empty(ctx);

//   event::emit(PoolCreated {
//     pool_id: object::uid_to_inner(&id),
//   });

//   Pool {
//     id,
//     vault,
//     orderbook,
//   }
// }

// public fun vault(self: &Pool): &Vault {
//   &self.vault
// }

// public fun deposit(self: &mut Pool, coin: Coin<USDC>) {
//   vault::deposit(&mut self.vault, coin);

//   event::emit(PoolDepositedBase {
//     pool_id: object::uid_to_inner(&self.id),
//     base_amount: CoinModule::value(&base_coin),
//   });
// }

// public fun deposit_quote<BaseAsset, QuoteAsset>(
//   self: &mut Pool<BaseAsset, QuoteAsset>,
//   quote_coin: Coin<QuoteAsset>,
// ) {
//   vault::deposit(&mut self.vault, quote_coin);

//   event::emit(PoolDepositedQuote {
//     pool_id: object::uid_to_inner(&self.id),
//     quote_amount: CoinModule::value(&quote_coin),
//   });
// }

// public fun balance(self: &Pool): u64 {
//   vault::balance(&self.vault)
// }

// public fun place_limit_order<BaseAsset, QuoteAsset>(
//   self: &mut Pool<BaseAsset, QuoteAsset>,
//   margin_account: &mut MarginAccount,
//   order: Order,
//   ctx: &mut TxContext,
// ) {
//   let sender = tx_context::sender(ctx);
//   assert!(order.price() > 0, EInvalidPrice);
//   assert!(order.size() > 0, EInvalidQuantity);
//   assert!(sender == margin_account.owner(), EInvalidAccountOwner);
//   let required_amount = order.price()*order.size();

//   if (order.is_bid()) {
//     let available_balance = margin_account.balance();
//     assert!(available_balance >= required_amount, EInsufficientBalance);

//     let balance: Coin<USDC> = strike::withdraw(
//       margin_account,
//       required_amount,
//       ctx,
//     );
//     vault::deposit(&mut self.vault, balance);
//   } else {
//     let available_balance = margin_account.balance();
//     assert!(available_balance >= required_amount, EInsufficientBalance);

//     let balance: Coin<USDC> = strike::withdraw(
//       margin_account,
//       required_amount,
//       ctx,
//     );
//     vault::deposit(&mut self.vault, balance);
//   };

//   orderbook::place_limit_order(
//     &mut self.orderbook,
//     margin_account,
//     order,
//     ctx,
//   );
// }

// public fun cancel_order<BaseAsset, QuoteAsset>(
//   self: &mut Pool<BaseAsset, QuoteAsset>,
//   margin_account: &MarginAccount,
//   is_bid: bool,
//   price: u64,
//   ctx: &mut TxContext,
// ) {
//   orderbook::cancel_order(
//     &mut self.orderbook,
//     margin_account,
//     is_bid,
//     price,
//     ctx,
//   );
// }

// public fun get_best_bid<BaseAsset, QuoteAsset>(
//   self: &Pool<BaseAsset, QuoteAsset>,
// ): (u64, u64) {
//   orderbook::get_best_bid(&self.orderbook)
// }

// public fun get_best_ask<BaseAsset, QuoteAsset>(
//   self: &Pool<BaseAsset, QuoteAsset>,
// ): (u64, u64) {
//   orderbook::get_best_ask(&self.orderbook)
// }

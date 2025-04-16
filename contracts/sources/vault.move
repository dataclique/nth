module strike::vault;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;

/// Vault holds balances of base and quote assets
public struct Vault<phantom BaseAsset, phantom QuoteAsset> has store {
  base_balance: Balance<BaseAsset>,
  quote_balance: Balance<QuoteAsset>,
}

public fun empty<BaseAsset, QuoteAsset>(): Vault<BaseAsset, QuoteAsset> {
  Vault {
    base_balance: balance::zero(),
    quote_balance: balance::zero(),
  }
}

public fun balances<BaseAsset, QuoteAsset>(
  self: &Vault<BaseAsset, QuoteAsset>,
): (u64, u64) {
  (self.base_balance.value(), self.quote_balance.value())
}

public fun deposit_base<BaseAsset, QuoteAsset>(
  self: &mut Vault<BaseAsset, QuoteAsset>,
  coin: Coin<BaseAsset>,
) {
  let balance = coin::into_balance(coin);
  self.base_balance.join(balance);
}

public fun deposit_quote<BaseAsset, QuoteAsset>(
  self: &mut Vault<BaseAsset, QuoteAsset>,
  coin: Coin<QuoteAsset>,
) {
  let balance = coin::into_balance(coin);
  self.quote_balance.join(balance);
}

public fun withdraw_base<BaseAsset, QuoteAsset>(
  self: &mut Vault<BaseAsset, QuoteAsset>,
  amount: u64,
): Balance<BaseAsset> {
  self.base_balance.split(amount)
}

public fun withdraw_quote<BaseAsset, QuoteAsset>(
  self: &mut Vault<BaseAsset, QuoteAsset>,
  amount: u64,
): Balance<QuoteAsset> {
  self.quote_balance.split(amount)
}

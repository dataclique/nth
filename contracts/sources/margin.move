module strike::strike;

use sui::bag::{Self, Bag};
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;

// Error constants
const ENotOwner: u64 = 1;
const EInsufficientBalance: u64 = 2;

/// Balance identifier.
public struct BalanceKey<phantom T> has copy, drop, store {}

// MarginAccount has key but not store, so only this module can transfer it
// and we don't provide any transfer function, making it non-transferrable
public struct MarginAccount has key, store {
  id: UID,
  owner: address,
  balances: Bag,
}

public enum MarginAccountEventKind has copy, drop {
  Creation,
  Deposit { amount: u64 },
  Withdrawal { withdraw_amount: u64 },
}

public struct MarginAccountEvent has copy, drop {
  margin_account_id: ID,
  kind: MarginAccountEventKind,
}

public fun new(ctx: &mut TxContext): MarginAccount {
  let sender = tx_context::sender(ctx);
  let id = object::new(ctx);

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&id),
    kind: MarginAccountEventKind::Creation,
  });

  MarginAccount {
    id,
    owner: sender,
    balances: bag::new(ctx),
  }
}

public fun new_with_deposit<T>(
  deposit: Coin<T>,
  ctx: &mut TxContext,
): MarginAccount {
  let sender = tx_context::sender(ctx);
  let id = object::new(ctx);
  let deposit_amount = coin::value(&deposit);

  let mut margin_account = MarginAccount {
    id,
    owner: sender,
    balances: bag::new(ctx),
  };

  deposit(&mut margin_account, deposit);

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&margin_account.id),
    kind: MarginAccountEventKind::Creation,
  });

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&margin_account.id),
    kind: MarginAccountEventKind::Deposit { amount: deposit_amount },
  });

  margin_account
}

public fun deposit<T>(margin_account: &mut MarginAccount, coin: Coin<T>) {
  // TODO: make verification of account owner

  let deposit_amount = coin::value(&coin);
  let deposit_balance = coin::into_balance(coin);
  let key = BalanceKey<T> {};

  if (margin_account.balances.contains(key)) {
    let balance: &mut Balance<T> = &mut margin_account.balances[key];
    balance.join(deposit_balance);
  } else {
    margin_account.balances.add(key, deposit_balance);
  };

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&margin_account.id),
    kind: MarginAccountEventKind::Deposit { amount: deposit_amount },
  });
}

public fun withdraw<T>(
  margin_account: &mut MarginAccount,
  withdraw_amount: u64,
  ctx: &mut TxContext,
): Balance<T> {
  assert!(tx_context::sender(ctx) == margin_account.owner, ENotOwner);

  let key = BalanceKey<T> {};

  let key_exists = margin_account.balances.contains(key);
  assert!(key_exists, EInsufficientBalance);

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&margin_account.id),
    kind: MarginAccountEventKind::Withdrawal { withdraw_amount },
  });

  let acc_balance: &mut Balance<T> = &mut margin_account.balances[key];
  let acc_value = acc_balance.value();
  assert!(acc_value >= withdraw_amount, EInsufficientBalance);
  if (withdraw_amount == acc_value) {
    margin_account.balances.remove(key)
  } else {
    acc_balance.split(withdraw_amount)
  }
}

public fun balance<T>(margin_account: &MarginAccount): u64 {
  let key = BalanceKey<T> {};
  let balance: &Balance<T> = &margin_account.balances[key];
  balance.value()
}

public fun owner(margin_account: &MarginAccount): address {
  margin_account.owner
}

module strike::strike;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use usdc::usdc::USDC;

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
  balance: Balance<USDC>,
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
    balance: balance::zero<USDC>(),
  }
}

public fun new_with_deposit(
  deposit: Coin<USDC>,
  ctx: &mut TxContext,
): MarginAccount {
  let sender = tx_context::sender(ctx);
  let id = object::new(ctx);
  let deposit_amount = coin::value(&deposit);

  let mut margin_account = MarginAccount {
    id,
    owner: sender,
    balance: balance::zero<USDC>(),
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

public fun deposit(margin_account: &mut MarginAccount, coin: Coin<USDC>) {
  // TODO: make verification of account owner

  let deposit_amount = coin::value(&coin);
  let deposit_balance = coin::into_balance(coin);

  margin_account.balance.join(deposit_balance);

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&margin_account.id),
    kind: MarginAccountEventKind::Deposit { amount: deposit_amount },
  });
}

public fun withdraw(
  margin_account: &mut MarginAccount,
  withdraw_amount: u64,
  ctx: &mut TxContext,
): Coin<USDC> {
  assert!(tx_context::sender(ctx) == margin_account.owner, ENotOwner);
  assert!(
    balance::value(&margin_account.balance) >= withdraw_amount,
    EInsufficientBalance,
  );

  let withdraw_balance = balance::split(
    &mut margin_account.balance,
    withdraw_amount,
  );
  let withdraw_coin = coin::from_balance(withdraw_balance, ctx);

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&margin_account.id),
    kind: MarginAccountEventKind::Withdrawal { withdraw_amount },
  });

  withdraw_coin
}

public fun balance(margin_account: &MarginAccount): u64 {
  balance::value(&margin_account.balance)
}

public fun owner(margin_account: &MarginAccount): address {
  margin_account.owner
}

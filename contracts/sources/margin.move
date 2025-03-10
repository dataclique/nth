module strike::strike;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use usdc::usdc::USDC;

// Error constants
const ENotOwner: u64 = 1;
const EInsufficientBalance: u64 = 2;

// MarginAccount has key but not store, so only this module can transfer it
// and we don't provide any transfer function, making it non-transferrable
public struct MarginAccount has key {
  id: UID,
  owner: address,
  balance: Balance<USDC>,
}

public enum MarginAccountEventKind has copy, drop {
  Creation,
  Deposit { amount: u64 },
  Withdrawal { amount: u64 },
}

public struct MarginAccountEvent has copy, drop {
  margin_account_id: ID,
  kind: MarginAccountEventKind,
}

/// Create a new empty margin account
public fun new(ctx: &mut TxContext) {
  let sender = tx_context::sender(ctx);
  let id = object::new(ctx);

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&id),
    kind: MarginAccountEventKind::Creation,
  });

  let margin_account = MarginAccount {
    id,
    owner: sender,
    balance: balance::zero<USDC>(),
  };

  // Transfer the margin account to the sender
  transfer::transfer(margin_account, sender);
}

/// Create a new margin account with an initial deposit
public fun new_with_deposit(deposit: Coin<USDC>, ctx: &mut TxContext) {
  let sender = tx_context::sender(ctx);
  let id = object::new(ctx);
  let deposit_amount = coin::value(&deposit);

  // Convert Coin to Balance
  let deposit_balance = coin::into_balance(deposit);

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&id),
    kind: MarginAccountEventKind::Creation,
  });

  // Also emit a deposit event
  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&id),
    kind: MarginAccountEventKind::Deposit { amount: deposit_amount },
  });

  let margin_account = MarginAccount {
    id,
    owner: sender,
    balance: deposit_balance,
  };

  // Transfer the margin account to the sender
  transfer::transfer(margin_account, sender);
}

/// Deposit USDC into a margin account
/// Only the owner of the margin account can deposit
public fun deposit(
  margin_account: &mut MarginAccount,
  coin: Coin<USDC>,
  ctx: &mut TxContext,
) {
  // Verify that the sender is the owner of the margin account
  assert!(tx_context::sender(ctx) == margin_account.owner, ENotOwner);

  // Get the deposit amount for the event
  let deposit_amount = coin::value(&coin);

  // Convert Coin to Balance and add it to the margin account's balance
  let deposit_balance = coin::into_balance(coin);
  balance::join(&mut margin_account.balance, deposit_balance);

  // Emit deposit event
  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&margin_account.id),
    kind: MarginAccountEventKind::Deposit { amount: deposit_amount },
  });
}

/// Withdraw USDC from a margin account
/// Only the owner of the margin account can withdraw
public fun withdraw(
  margin_account: &mut MarginAccount,
  amount: u64,
  ctx: &mut TxContext,
): Coin<USDC> {
  // Verify that the sender is the owner of the margin account
  assert!(tx_context::sender(ctx) == margin_account.owner, ENotOwner);

  // Verify that the margin account has enough balance
  assert!(
    balance::value(&margin_account.balance) >= amount,
    EInsufficientBalance,
  );

  // Split the balance and convert to Coin
  let withdraw_balance = balance::split(&mut margin_account.balance, amount);
  let withdraw_coin = coin::from_balance(withdraw_balance, ctx);

  // Emit withdrawal event
  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&margin_account.id),
    kind: MarginAccountEventKind::Withdrawal { amount },
  });

  withdraw_coin
}

/// Get the current balance of the margin account
public fun balance(margin_account: &MarginAccount): u64 {
  balance::value(&margin_account.balance)
}

/// Get the owner of the margin account
public fun owner(margin_account: &MarginAccount): address {
  margin_account.owner
}

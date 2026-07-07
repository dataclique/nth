module strike::strike;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use usdc::usdc::USDC;

// Error constants
const ENotOwner: u64 = 1;
const EInsufficientBalance: u64 = 2;

/// MarginAccount has `key` but deliberately NOT `store`: without `store`,
/// `transfer::public_transfer` and embedding in other modules' structs are
/// impossible, so the account can only move via this module's `keep`. This
/// keeps the account bound to `owner`, which `deposit`/`withdraw` verify
/// against the transaction sender.
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

/// Create an empty margin account owned by the sender. Place it with
/// `keep` (the type lacks `store`, so nothing else can move it).
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

/// Create a margin account owned by the sender, seeded with the full
/// value of `deposit` (USDC base units). Emits Creation then Deposit.
public fun new_with_deposit(
  deposit: Coin<USDC>,
  ctx: &mut TxContext,
): MarginAccount {
  let sender = tx_context::sender(ctx);
  let id = object::new(ctx);
  let deposit_amount = coin::value(&deposit);

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&id),
    kind: MarginAccountEventKind::Creation,
  });

  let mut margin_account = MarginAccount {
    id,
    owner: sender,
    balance: balance::zero<USDC>(),
  };

  margin_account.balance.join(coin::into_balance(deposit));

  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&margin_account.id),
    kind: MarginAccountEventKind::Deposit { amount: deposit_amount },
  });

  margin_account
}

/// Add the full value of `coin` (USDC base units) to the account.
/// Aborts with `ENotOwner` unless the sender owns the account.
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

/// Split `withdraw_amount` USDC base units out of the account as a Coin.
/// Aborts with `ENotOwner` for a foreign sender and
/// `EInsufficientBalance` when the balance is smaller than the request.
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

/// Current balance in USDC base units.
public fun balance(margin_account: &MarginAccount): u64 {
  balance::value(&margin_account.balance)
}

/// The address whose transactions may deposit and withdraw.
public fun owner(margin_account: &MarginAccount): address {
  margin_account.owner
}

/// Whether `sender` is the account owner; every mutating entry point
/// gates on this.
public fun verify_owner(margin_account: &MarginAccount, sender: address): bool {
  margin_account.owner == sender
}

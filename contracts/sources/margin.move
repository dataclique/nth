module strike::strike;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use usdc::usdc::USDC;

// === Errors ===

const ENotOwner: u64 = 1;
const EInsufficientBalance: u64 = 2;

// === Structs ===

/// MarginAccount has `key` but deliberately NOT `store`: without `store`,
/// `transfer::public_transfer` and embedding in other modules' structs are
/// impossible, so the account can only move via this module's `keep`. This
/// keeps the account bound to `owner`, which `deposit`/`withdraw` verify
/// against the transaction sender.
public struct MarginAccount has key {
  id: UID,
  owner: address,
  balance: Balance<USDC>,
}

// === Events ===

public enum MarginAccountEventKind has copy, drop {
  Creation,
  Deposit { amount: u64 },
  Withdrawal { amount: u64 },
}

public struct MarginAccountEvent has copy, drop {
  margin_account_id: ID,
  kind: MarginAccountEventKind,
}

// === Public Functions ===

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

/// Transfer the account to the transaction sender. The only way to place a
/// MarginAccount at an address: the struct lacks `store`, so external code
/// cannot call `transfer::public_transfer` on it.
public fun keep(margin_account: MarginAccount, ctx: &TxContext) {
  transfer::transfer(margin_account, tx_context::sender(ctx));
}

/// Add the full value of `coin` (USDC base units) to the account.
/// Aborts with `ENotOwner` unless the sender owns the account.
public fun deposit(
  margin_account: &mut MarginAccount,
  coin: Coin<USDC>,
  ctx: &mut TxContext,
) {
  assert!(verify_owner(margin_account, tx_context::sender(ctx)), ENotOwner);
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
  assert!(verify_owner(margin_account, tx_context::sender(ctx)), ENotOwner);
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
    kind: MarginAccountEventKind::Withdrawal { amount: withdraw_amount },
  });

  withdraw_coin
}

// === View Functions ===

/// Current balance in USDC base units.
public fun balance(margin_account: &MarginAccount): u64 {
  balance::value(&margin_account.balance)
}

/// The address whose transactions may deposit and withdraw.
public fun owner(margin_account: &MarginAccount): address {
  margin_account.owner
}

// === Package Functions ===

/// Whether `sender` is the account owner; every mutating entry point
/// gates on this.
public(package) fun verify_owner(
  margin_account: &MarginAccount,
  sender: address,
): bool {
  margin_account.owner == sender
}

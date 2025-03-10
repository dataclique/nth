module strike::strike;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use usdc::usdc::USDC;

public struct MarginAccount has key, store {
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
public fun new(ctx: &mut TxContext): MarginAccount {
  let id = object::new(ctx);
  event::emit(MarginAccountEvent {
    margin_account_id: object::uid_to_inner(&id),
    kind: MarginAccountEventKind::Creation,
  });

  MarginAccount {
    id,
    owner: tx_context::sender(ctx),
    balance: balance::zero<USDC>(),
  }
}

/// Create a new margin account with an initial deposit
public fun new_with_deposit(
  deposit: Coin<USDC>,
  ctx: &mut TxContext,
): MarginAccount {
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

  MarginAccount {
    id,
    owner: tx_context::sender(ctx),
    balance: deposit_balance,
  }
}

#[test_only]
use sui::test_scenario;

#[test]
fun test_margin_account_creation() {
  // Create test address representing the user
  let alice = @0xA;

  // First transaction: Create a margin account
  let mut scenario = test_scenario::begin(alice);
  {
    // Create a new margin account
    let margin_account = new(scenario.ctx());

    // Verify the margin account properties
    assert!(margin_account.owner == alice, 0);
    assert!(balance::value(&margin_account.balance) == 0, 1);

    // Transfer the margin account to the sender
    transfer::transfer(margin_account, alice);
  };

  // Second transaction: Verify the margin account exists in storage
  scenario.next_tx(alice);
  {
    // Check that the margin account exists and is owned by alice
    assert!(
      test_scenario::has_most_recent_for_address<MarginAccount>(alice),
      2,
    );
  };

  test_scenario::end(scenario);
}

#[test]
fun test_margin_account_with_deposit() {
  // Create test address representing the user
  let alice = @0xA;
  let deposit_amount = 1000;

  // First transaction: Create a margin account with deposit
  let mut scenario = test_scenario::begin(alice);
  {
    // Create a test USDC coin
    let usdc_coin = coin::mint_for_testing<USDC>(
      deposit_amount,
      scenario.ctx(),
    );

    // Create a new margin account with deposit
    let margin_account = new_with_deposit(usdc_coin, scenario.ctx());

    // Verify the margin account properties
    assert!(margin_account.owner == alice, 0);
    assert!(balance::value(&margin_account.balance) == deposit_amount, 1);

    // Transfer the margin account to the sender
    transfer::transfer(margin_account, alice);
  };

  // Second transaction: Verify the margin account exists in storage
  scenario.next_tx(alice);
  {
    // Check that the margin account exists and is owned by alice
    assert!(
      test_scenario::has_most_recent_for_address<MarginAccount>(alice),
      2,
    );
  };

  test_scenario::end(scenario);
}

#[test_only]
module strike::margin_tests;

use strike::strike::{Self, MarginAccount};
use strike::units;
use sui::coin::mint_for_testing;
use sui::test_scenario::{begin, end, take_from_address, return_to_address};
use usdc::usdc::USDC;

const ALICE: address = @0xA;
const BOB: address = @0xB;

/// Scale a whole-USDC amount into base units (see docs/float_scaling.md).
fun scaled(amount: u64): u64 {
  amount * units::float_scaling()
}

#[test]
fun test_margin_account_creation() {
  let mut test = begin(@0xF);
  let alice = @0xA;
  test.next_tx(alice);
  {
    let mut margin_account = strike::new(test.ctx());
    assert!(margin_account.owner() == alice, 0);
    margin_account.deposit(
      mint_for_testing<USDC>(100*units::float_scaling(), test.ctx()),
      test.ctx(),
    );

    let balance = margin_account.balance();
    assert!(balance == 100*units::float_scaling(), 0);

    margin_account.deposit(
      mint_for_testing<USDC>(100*units::float_scaling(), test.ctx()),
      test.ctx(),
    );
    let balance = margin_account.balance();
    assert!(balance == 200*units::float_scaling(), 0);

    margin_account.keep(test.ctx());
  };

  end(test);
}

#[test]
fun test_withdraw_ok() {
  let mut test = begin(@0xF);
  let alice = @0xA;
  test.next_tx(alice);
  {
    let mut margin_account = strike::new(test.ctx());
    margin_account.deposit(
      mint_for_testing<USDC>(100*units::float_scaling(), test.ctx()),
      test.ctx(),
    );

    let balance = margin_account.balance();
    assert!(balance == 100*units::float_scaling(), 0);

    let coin = margin_account.withdraw(
      50*units::float_scaling(),
      test.ctx(),
    );
    let balance = margin_account.balance();
    assert!(balance == 50*units::float_scaling(), 0);
    coin.burn_for_testing();

    margin_account.keep(test.ctx());
  };

  end(test);
}

#[test, expected_failure(abort_code = strike::ENotOwner)]
fun test_deposit_by_non_owner_aborts() {
  let mut test = begin(ALICE);
  {
    let margin_account = strike::new(test.ctx());
    margin_account.keep(test.ctx());
  };

  test.next_tx(BOB);
  {
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);
    margin_account.deposit(
      mint_for_testing<USDC>(scaled(100), test.ctx()),
      test.ctx(),
    );
    // keep() would transfer to the sender (Bob); hand the account back to
    // Alice's inventory instead.
    return_to_address(ALICE, margin_account);
  };

  end(test);
}

#[test, expected_failure(abort_code = strike::ENotOwner)]
fun test_withdraw_by_non_owner_aborts() {
  let mut test = begin(ALICE);
  {
    let margin_account = strike::new_with_deposit(
      mint_for_testing<USDC>(scaled(100), test.ctx()),
      test.ctx(),
    );
    margin_account.keep(test.ctx());
  };

  test.next_tx(BOB);
  {
    let mut margin_account = take_from_address<MarginAccount>(&test, ALICE);
    let coin = margin_account.withdraw(scaled(50), test.ctx());
    coin.burn_for_testing();
    return_to_address(ALICE, margin_account);
  };

  end(test);
}

#[test, expected_failure(abort_code = strike::EInsufficientBalance)]
fun test_withdraw_more_than_balance_aborts() {
  let mut test = begin(ALICE);
  {
    let mut margin_account = strike::new_with_deposit(
      mint_for_testing<USDC>(scaled(100), test.ctx()),
      test.ctx(),
    );
    let coin = margin_account.withdraw(scaled(100) + 1, test.ctx());
    coin.burn_for_testing();
    margin_account.keep(test.ctx());
  };

  end(test);
}

#[test]
fun test_withdraw_full_balance() {
  let mut test = begin(ALICE);
  {
    let mut margin_account = strike::new_with_deposit(
      mint_for_testing<USDC>(scaled(100), test.ctx()),
      test.ctx(),
    );
    let coin = margin_account.withdraw(scaled(100), test.ctx());
    assert!(margin_account.balance() == 0, 0);
    coin.burn_for_testing();
    margin_account.keep(test.ctx());
  };

  end(test);
}

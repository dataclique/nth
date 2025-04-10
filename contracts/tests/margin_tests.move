#[test_only]
module strike::margin_tests;

use strike::strike;
use sui::coin::mint_for_testing;
use sui::test_scenario::{begin, end};
use usdc::usdc::USDC;

#[test]
fun test_margin_account_creation() {
  let mut test = begin(@0xF);
  let alice = @0xA;
  test.next_tx(alice);
  {
    let mut margin_account = strike::new(test.ctx());
    assert!(margin_account.owner() == alice, 0);
    margin_account.deposit(
      mint_for_testing<USDC>(100, test.ctx()),
      test.ctx(),
    );

    let balance = margin_account.balance();
    assert!(balance == 100, 0);

    margin_account.deposit(
      mint_for_testing<USDC>(100, test.ctx()),
      test.ctx(),
    );
    let balance = margin_account.balance();
    assert!(balance == 200, 0);

    transfer::public_share_object(margin_account);
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
      mint_for_testing<USDC>(100, test.ctx()),
      test.ctx(),
    );

    let balance = margin_account.balance();
    assert!(balance == 100, 0);

    let coin = margin_account.withdraw(
      50,
      test.ctx(),
    );
    let balance = margin_account.balance();
    assert!(balance == 50, 0);
    coin.burn_for_testing();

    transfer::public_share_object(margin_account);
  };

  end(test);
}

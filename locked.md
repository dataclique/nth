# Balance Locking Mechanism in DeepBook

## Overview
The balance locking mechanism in DeepBook ensures that users can't spend more than their available balance while maintaining efficient balance management.

## Balance Storage Structure
- The system uses a `BalanceManager` to store and manage user balances
- Each user's balance is stored in a `Balance<T>` struct that tracks:
  - Base asset amount
  - Quote asset amount
  - DEEP token amount
- The balances are stored in a `bag` data structure within the `BalanceManager`

## Locking Mechanism
When a user places an order, the following happens:

1. The `locked_balance` function in `order.move` calculates how much of each asset needs to be locked:
```move
public(package) fun locked_balance(self: &Order, maker_fee: u64): Balances {
    let (is_bid, order_price, _) = utils::decode_order_id(self.order_id());
    let mut base_quantity = 0;
    let mut quote_quantity = 0;
    let remaining_base_quantity = self.quantity() - self.filled_quantity();
    let remaining_quote_quantity = math::mul(
        remaining_base_quantity,
        order_price,
    );

    if (is_bid) {
        quote_quantity = quote_quantity + remaining_quote_quantity;
    } else {
        base_quantity = base_quantity + remaining_base_quantity;
    };
    // Calculate fee quantities
    let mut fee_quantity = self
        .order_deep_price()
        .fee_quantity(
            remaining_base_quantity,
            remaining_quote_quantity,
            is_bid,
        );
    fee_quantity.mul(maker_fee);

    let mut locked_balance = balances::new(base_quantity, quote_quantity, 0);
    locked_balance.add_balances(fee_quantity);

    locked_balance
}
```

2. The system doesn't actually subtract the locked amount from the total balance. Instead:
   - It keeps track of open orders in the `Account` struct
   - The `locked_balance` function calculates what portion of the balance is currently locked in open orders
   - When checking available balance, it subtracts the locked amount from the total balance

## Balance Management
- When a user places an order, the required assets are locked but remain in their balance
- The `Account` struct maintains:
  - `settled_balances`: Balances that are ready to be withdrawn
  - `owed_balances`: Balances that are owed to the account
  - `open_orders`: List of active orders that have locked balances

## Settlement Process
When orders are filled or cancelled, the `process_maker_fill` function in `account.move` updates the settled balances:
```move
public(package) fun process_maker_fill(self: &mut Account, fill: &Fill) {
    let settled_balances = fill.get_settled_maker_quantities();
    self.settled_balances.add_balances(settled_balances);
    if (!fill.expired()) {
        self.maker_volume = self.maker_volume + (fill.base_quantity() as u128);
    };
    if (fill.expired() || fill.completed()) {
        self.open_orders.remove(&fill.maker_order_id());
    }
}
```

## Key Points
1. The system doesn't actually subtract the frozen balance from the total balance - it keeps track of what portion is locked through the open orders tracking
2. The locked balances are stored in the same balance structure as the total balance, but the system maintains a separate record of what portion is locked through the open orders tracking
3. When checking available balance, the system calculates the locked amount by summing up the locked amounts from all open orders and subtracts that from the total balance

This approach allows for efficient balance management while ensuring that users can't spend more than their available (unlocked) balance. 
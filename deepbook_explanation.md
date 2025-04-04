# DeepBook System Explanation
https://github.com/MystenLabs/deepbookv3/tree/main/packages/deepbook/sources

## Money Transfers and Order System

### 1. Balance Management
- The system uses a `BalanceManager` which is a shared object that holds all balances for different assets
- Users need to deposit their funds into the `BalanceManager` before they can trade
- The `BalanceManager` maintains separate balances for different types of coins/assets

### 2. Order Creation Process
When a user wants to create an order, they need:
1. A `BalanceManager` with sufficient funds
2. A `TradeProof` (which can be obtained either as an owner or through a `TradeCap`)
3. The order details (price, quantity, etc.)

*Actually in our system we don't need TradeProof and TradeCaps. Here it's exists only to manage one account from several addresses*

### 3. Money Flow During Orders
- When a user places an order:
  - For a buy order: The quote currency (e.g., USDC) is locked in the `BalanceManager`
  - For a sell order: The base currency (e.g., SUI) is locked in the `BalanceManager`
- The funds remain in the `BalanceManager` until:
  - The order is filled (funds are transferred to the counterparty)
  - The order is canceled (funds are returned to the user)
  - The order expires (funds are returned to the user)

*I didn't understand how order can expire and where is timestamps for it, so we can miss this for a moment*

### 4. Order States
- Orders can be in different states:
  - `filled`: Order is completely executed
  - `partially_filled`: Order is partially executed
  - `expired`: Order has expired
  - The system tracks both the original quantity and filled quantity

### 5. Security and Access Control
*We don't care about it, but i will keep it here for future*
- The system uses different types of capabilities:
  - `TradeCap`: Allows trading
  - `DepositCap`: Allows depositing funds
  - `WithdrawCap`: Allows withdrawing funds
- Only the owner can mint these capabilities
- Each capability is tied to a specific `BalanceManager`

### 6. Fee Handling
- The system supports both maker and taker fees
- Fees are calculated based on the order type (bid/ask) and whether it's a deep order
- Fees are also managed through the `BalanceManager`

## Money Locking System

### 1. Order Creation and Money Locking
When a user creates an order, the system calculates and locks the required funds in the `BalanceManager`. The locking process works differently for buy and sell orders:

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
        // For buy orders, lock quote currency (e.g., USDC)
        quote_quantity = quote_quantity + remaining_quote_quantity;
    } else {
        // For sell orders, lock base currency (e.g., SUI)
        base_quantity = base_quantity + remaining_base_quantity;
    };
```

### 2. Fee Locking
The system also locks fees for the order:
```move
    let mut fee_quantity = self
        .order_deep_price()
        .fee_quantity(
            remaining_base_quantity,
            remaining_quote_quantity,
            is_bid,
        );
    fee_quantity.mul(maker_fee);
```

### 3. Balance Management
The locked funds are managed by the `BalanceManager` which:
- Tracks all balances for different assets
- Handles deposits and withdrawals
- Ensures funds are properly locked when orders are placed
- Manages the release of funds when orders are filled or canceled

### 4. Order States and Fund Locking
The funds remain locked until one of these events occurs:
- Order is filled (funds are transferred to counterparty)
- Order is canceled (funds are returned to user)
- Order expires (funds are returned to user)

### 5. Settlement Process
When an order is filled or canceled, the `settle_balance_manager` function in `vault.move` handles the transfer of funds:
```move
public(package) fun settle_balance_manager<BaseAsset, QuoteAsset>(
    self: &mut Vault<BaseAsset, QuoteAsset>,
    balances_out: Balances,
    balances_in: Balances,
    balance_manager: &mut BalanceManager,
    trade_proof: &TradeProof,
) {
    // ... handles the actual transfer of funds between accounts
}
```

### 6. Security Measures
- All operations require proper authorization through `TradeProof`
- The system prevents double-spending by locking funds
- Balance checks are performed before any operation
- The `BalanceManager` maintains strict accounting of all locked and available funds

## Key Points Summary
1. The main function that blocks money is `locked_balance` in the order module
2. The money stays in the `BalanceManager` account but is marked as locked and unavailable for other operations
3. The locking process ensures that users can't spend the same funds multiple times
4. The system maintains separate balances for base currency, quote currency, and DEEP tokens
5. All fund movements are tracked and verified through the `BalanceManager` and `Vault` system

This design ensures that the trading system is secure and prevents any potential double-spending or unauthorized access to funds while maintaining a clear record of all transactions and balances. 
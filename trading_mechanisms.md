# DeepBook Trading Mechanisms

## Money Transfer Between Balance Managers

When orders match, the system follows this process:

1. **Order Matching Process**:
   - Creates a `Fill` object containing:
     - Maker and taker order details
     - Execution price
     - Quantities
     - Fees
     - Order status

2. **Balance Settlement**:
   a. **Maker Settlement**:
   ```move
   public(package) fun get_settled_maker_quantities(self: &Fill): Balances {
       let (base, quote) = if (self.expired) {
           if (self.taker_is_bid) {
               (self.base_quantity, 0)
           } else {
               (0, self.quote_quantity)
           }
       } else {
           if (self.taker_is_bid) {
               (0, self.quote_quantity)
           } else {
               (self.base_quantity, 0)
           }
       };
       balances::new(base, quote, 0)
   }
   ```

   b. **Taker Settlement**:
   ```move
   public(package) fun calculate_partial_fill_balances(
       self: &mut OrderInfo,
       taker_fee: u64,
       maker_fee: u64,
   ): (Balances, Balances) {
       // Calculate taker fees
       let mut taker_fee_quantity = self
           .order_deep_price
           .fee_quantity(
               self.executed_quantity,
               self.cumulative_quote_quantity,
               self.is_bid,
           );
       taker_fee_quantity.mul(taker_fee);
       
       // Calculate settled and owed balances
       let mut settled_balances = balances::new(0, 0, 0);
       let mut owed_balances = balances::new(0, 0, 0);
       
       if (self.is_bid) {
           settled_balances.add_base(self.executed_quantity);
           owed_balances.add_quote(self.cumulative_quote_quantity);
       } else {
           settled_balances.add_quote(self.cumulative_quote_quantity);
           owed_balances.add_base(self.executed_quantity);
       };
       
       (settled_balances, owed_balances)
   }
   ```

3. **Balance Manager Operations**:
   ```move
   public(package) fun deposit_with_proof<T>(
       balance_manager: &mut BalanceManager,
       proof: &TradeProof,
       to_deposit: Balance<T>,
   ) {
       balance_manager.validate_proof(proof);
       let key = BalanceKey<T> {};
       if (balance_manager.balances.contains(key)) {
           let balance: &mut Balance<T> = &mut balance_manager.balances[key];
           balance.join(to_deposit);
       } else {
           balance_manager.balances.add(key, to_deposit);
       }
   }
   ```

4. **Final Settlement Flow**:
   1. When orders match:
      - Creates `Fill` object with matched quantities
      - Calculates fees for both maker and taker
      - Determines settled and owed balances
   
   2. Settlement process:
      - Withdraws funds from taker's balance manager
      - Deposits funds to maker's balance manager
      - Handles fee transfers to pool
      - Updates order statuses and quantities

## Proof Creation and Verification

1. **Proof Creation**:
   Two ways to create a `TradeProof`:

   a. **As Owner**:
   ```move
   public fun generate_proof_as_owner(
       balance_manager: &mut BalanceManager,
       ctx: &TxContext,
   ): TradeProof {
       balance_manager.validate_owner(ctx);
       TradeProof {
           balance_manager_id: object::id(balance_manager),
           trader: ctx.sender(),
       }
   }
   ```

   b. **As Trader (with TradeCap)**:
   ```move
   public fun generate_proof_as_trader(
       balance_manager: &mut BalanceManager,
       trade_cap: &TradeCap,
       ctx: &TxContext,
   ): TradeProof {
       balance_manager.validate_trader(trade_cap);
       TradeProof {
           balance_manager_id: object::id(balance_manager),
           trader: ctx.sender(),
       }
   }
   ```

2. **Proof Structure**:
   ```move
   public struct TradeProof has drop {
       balance_manager_id: ID,
       trader: address,
   }
   ```

3. **Proof Verification**:
   ```move
   public fun validate_proof(balance_manager: &BalanceManager, proof: &TradeProof) {
       assert!(object::id(balance_manager) == proof.balance_manager_id, EInvalidProof);
   }
   ```

4. **Authorization Levels**:
   - **Owner**: Can create proofs directly
   - **Trader**: Needs `TradeCap`
   - **Depositor**: Needs `DepositCap`
   - **Withdrawer**: Needs `WithdrawCap`

5. **Capability Management**:
   ```move
   public fun mint_trade_cap(balance_manager: &mut BalanceManager, ctx: &mut TxContext): TradeCap {
       balance_manager.validate_owner(ctx);
       assert!(balance_manager.allow_listed.size() < MAX_TRADE_CAPS, EMaxCapsReached);
       let id = object::new(ctx);
       balance_manager.allow_listed.insert(id.to_inner());
       TradeCap {
           id,
           balance_manager_id: object::id(balance_manager),
       }
   }
   ```

6. **Security Features**:
   - Each proof tied to specific `balance_manager_id`
   - Proofs include trader's address
   - Capabilities can be revoked
   - Maximum capabilities limited
   - All operations require proof validation 
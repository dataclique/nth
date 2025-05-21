# Strike Protocol Architecture

## Overview
Strike Protocol is a decentralized trading platform that enables leveraged trading of various tokens. Each tradable token has its own setup consisting of several key components that work together to provide a secure and efficient trading environment.

## Core Components

### Pool
The Pool is the central component that orchestrates all trading activities for a specific token. It serves as the main interface for:
- Order placement and management
- Fund handling through the vault
- Oracle price feed integration
- Liquidation management

### OrderBook
The OrderBook maintains the order book for a specific token, containing:
- Buy orders (bids)
- Sell orders (asks)
- Order matching logic (under construction)
- Price-time priority (under construction)

### Vault
The Vault is responsible for:
- Holding all deposited funds
- Processing withdrawals
- Storing liquidated funds

### Oracle (under construction)
<!-- The Oracle provides:
- Real-time price feeds
- Price updates for funding rate calculations
- Trigger signals for liquidation events -->

## User Flow

### Account Setup
1. Users create margin accounts
2. Deposit funds into their margin accounts
3. Funds are secured by the user's signature

### Order Placement
1. User specifies:
   - Target token (pool)
   - Order size
   - Price
   - Leverage
2. Pool calculates:
   - Required margin
   - Fees (under construction)
3. Funds are transferred:
   - From user's margin account
   - To pool's vault
   - Using user's signature for security

### Funding Rate Mechanism (under construction)
<!-- - No physical movement of funds
- Oracle price updates trigger funding rate calculations
- Margin adjustments are made in-place
- Changes reflected in order margins -->

### Liquidation Process
1. Oracle price updates trigger margin checks (under construction)
2. If margin falls below maintenance level:
   - Order is removed from orderbook
   - Funds remain in vault
   - Position is liquidated

### Withdrawal Process
1. User closes their order
2. Funds are transferred:
   - From vault
   - To user's margin account
   - Using user's signature for security

## Security Features

### Signature-based Security
- All fund movements require user signature
- Ensures only account owner can:
  - Place orders
  - Withdraw funds
  - Close positions

### Fund Protection
- Funds are always held in vault
- No direct fund movement between users
- All transactions require proper authorization
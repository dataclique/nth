# Nth Market

Nth Market is a permissionless orderbook protocol for composable financial
instruments on Sui. A shared matching kernel supports instrument-defined
positions, collateral, carry, settlement, and liquidation without embedding
those economics in the orderbook.

The protocol is being specified in
[ADR 02](adrs/02-composable-instrument-standard.md).

## Project structure

- `./` - The repository root directory
  - `./contracts/` - The Move smart contracts
  - `./frontend/` - The application frontend
  - `./backend/` - The supporting backend for indexing and caching data

## Getting started

Clone the repository:

```sh
git clone https://github.com/dataclique/nth.git
```

Set up the development environment:

```sh
direnv allow
```

### Running the frontend

```sh
cd frontend
pnpm install
pnpm dev
```

### Building the contracts

```sh
cd contracts
```

Building the contracts:

```sh
sui move build
```

Running tests:

```sh
sui move test
```

## Dev Resources

- [Sui Guides](https://docs.sui.io/guides)
- [Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Pyth JS Client](https://github.com/pyth-network/pyth-crosschain/tree/main/apps/hermes/client/js)
- [Pyth Price Feeds](https://docs.pyth.network/price-feeds)
- [Stork Price Feeds](https://docs.stork.network/resources/asset-id-registry)
- [Supra Price Feeds](https://supra.com/data)
- [The Move Book](https://move-book.com/index.html)

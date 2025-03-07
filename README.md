# Strike Finance

## Project structure

- `./` - The repository root directory
  - `./contracts/` - The Move smart contracts
  - `./frontend/` - The application frontend
  - `./backend/` - The supporting backend for indexing and caching data

## Getting started

Configure git to handle large repositories:

```sh
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

Clone the repository with submodules:

```sh
git clone --recurse-submodules https://github.com/data-cartel/strike.git
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

## Backlog

- [ ] Come up with a different name (there's already a "Stryke" options platform)
- [ ] Connect Pyth price feeds to the UI
- [ ] Display the price of an underlying asset (e.g. SOL/USDC)
- [ ] Connect SUI wallet to the UI
- [ ] Implement a CLOB (Central Limit Order Book)

## Market Research

### Existing Decentralized Crypto Options Platforms

- [Derive](https://www.derive.xyz/)
- [SynQuote](https://www.synquote.com/options/BTC)
  - Seems like more or less the same as derive
- [Stryke](https://www.stryke.xyz/en/dashboard)
  - Has options for a wider range of tokens, that's nice
- [Hegic](https://www.hegic.co/app#/arbitrum/trade/new)
  - Has some nice UI elements, I gotta take note of that
- Cega (deprecated)
  - Had exotic options, which is interesting, but i only see vault stuff in the app. i guess i gotta look into that more

### Existing Centralized Crypto Options Platforms

- [CoinCall](https://www.coincall.com/)
  - Seems like the only place where you can trade SUI options currently
- [Binance](https://www.binance.com/en/futures/BTCUSDT_PERP)
- [Bybit](https://www.bybit.com/en-US/option/BTC)
- [Delta](https://delta.exchange/)

## Dev Resources

- [Sui Guides](https://docs.sui.io/guides)
- [Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Pyth JS Client](https://github.com/pyth-network/pyth-crosschain/tree/main/apps/hermes/client/js)
- [Pyth Price Feeds](https://docs.pyth.network/price-feeds)
- [Stork Price Feeds](https://docs.stork.network/resources/asset-id-registry)
- [Supra Price Feeds](https://supra.com/data)
- [The Move Book](https://move-book.com/index.html)

## Miscellaneous

### Cool TLDs (top level domains)

- \_.land
- \_.finance
- \_.money
- \_.cash
- \_.fund
- \_.xyz
- \_.fun
- \_.club
- \_.house
- \_.studio

### Brand/Domain Name ideas

- theta.land
- payoff.studio
- volatility.studio
- scholes.house
- drisk.finance
- spread.finance

# Nth Finance

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
git clone --recurse-submodules https://github.com/dataclique/nth.git
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

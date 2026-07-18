# AGENTS.md — Frontend

Standards for the frontend app. Repo-wide rules (dev shell, GitButler, commit
style) live in the root [AGENTS.md](../AGENTS.md).

## Stack

Vite 6 + **SolidJS** + TypeScript 5.7 (see `package.json`). The dataclique org
does not use React — never add React, dapp-kit, or Radix React packages.

- **solid-js** + **@solidjs/router** — UI and routing; server state lives in
  `createResource`
- **@mysten/wallet-standard** — framework-agnostic wallet discovery, connection,
  and signing (`src/wallet.ts`); **@mysten/sui** for the `Transaction` builder
  (`src/tx.ts` maps API `CallSpec`s onto PTBs)
- **lightweight-charts** — price charts (`src/components/CandleChart.tsx`)
- `src/api.ts` — typed client for the backend `/v1` API; `src/scale.ts` —
  branded `10^6` fixed-point units, the only place display conversion happens

## Commands

All inside the dev shell, from `frontend/`, using **pnpm only** (provided by
devenv — never npm, yarn, or bun):

- `pnpm install` — install dependencies
- `pnpm dev` — dev server (only when explicitly asked to run the app)
- `pnpm build` — `tsc && vite build`; type errors fail the build
- `pnpm lint` — eslint with `--max-warnings 0`; a single warning is a failure
- `pnpm preview` — preview a production build
- `pnpm add <pkg>` — the only way to add dependencies; never hand-write version
  numbers (they get hallucinated)

Verification before handover: `pnpm build` and `pnpm lint`, both clean.

## TypeScript Standards

- **Strict typing, no `any`.** No `as any`, no `@ts-ignore` /
  `@ts-expect-error`, no non-null assertions (`!`) in new code — model the type
  so the assertion is unnecessary, or narrow explicitly.
- **Discriminated unions over booleans and enums.** Order side is
  `"bid" | "ask"`, a request is
  `{ status: "loading" } | { status: "loaded"; data: T } | { status: "error"; error: E }`
  — never parallel `isLoading` / `isError` flags that can contradict.
- **Mirror on-chain units explicitly.** Prices, sizes, and USDC amounts from
  events are fixed-point `u64` scaled by 10^6. Wrap them in branded/named types
  or convert at the boundary in one place — never pass raw scaled numbers around
  unlabeled.
- **Server state lives in React Query** (and dapp-kit hooks); don't duplicate it
  into `useState`/`useEffect`. Derive, don't sync.
- **Colocate types with the code that uses them** — no catch-all `types.ts`.
- **Descriptive names, no single-letter variables**, including in closures.

## Formatting and Linting

Prettier config is embedded in `package.json` (2-space, no semicolons,
`arrowParens: "avoid"`) and runs — along with eslint — via the repo pre-commit
hooks on every `but commit`. Never fight or override the config, and never
disable an eslint rule without explicit user permission.

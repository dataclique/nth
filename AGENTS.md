# AGENTS.md

Rules for AI agents working in this repository. Everything in this document is a
directive, not a suggestion. Per-directory standards live next to the code they
govern — read the relevant one before touching that directory.

## What This Repo Is

Strike is a prototype perpetuals DEX on Sui: a central-limit orderbook with
leveraged, margin-backed orders, USDC collateral, and liquidation math (see
[docs/margin.md](docs/margin.md) and
[docs/liquidation.md](docs/liquidation.md)).

| Directory    | Contents                                                                 | Standards                                  |
| ------------ | ------------------------------------------------------------------------ | ------------------------------------------ |
| `contracts/` | Sui Move package `strike`: margin accounts, orderbook, pool, oracle      | [contracts/AGENTS.md](contracts/AGENTS.md) |
| `backend/`   | Rust crate `strikefi`: Rocket on Shuttle, sqlx, sui-sdk (indexing/cache) | [backend/AGENTS.md](backend/AGENTS.md)     |
| `frontend/`  | Vite + React + TypeScript dApp using @mysten/dapp-kit                    | [frontend/AGENTS.md](frontend/AGENTS.md)   |
| `docs/`      | Protocol math and design notes                                           | —                                          |

## Development Environment

The dev environment is Nix + devenv + direnv (`.envrc` runs
`use flake . --impure --accept-flake-config`; `direnv allow` activates it). The
flake provides everything:

- `sui` CLI **v1.75.1** (prebuilt binary pinned in `flake.nix`) — the same
  release tag the Move framework dep and the backend `sui-sdk` are pinned to.
  These three MUST move together; never bump one alone.
- Rust toolchain, Node + pnpm + TypeScript via devenv `languages`.
- Formatters/linters wired as pre-commit hooks.

**NEVER install toolchains manually** — no rustup, no npm-global installs, no
`brew install sui`. If a tool is missing, it belongs in `flake.nix`. All build,
test, and lint commands run inside the dev shell (via direnv or
`nix develop --impure --accept-flake-config --command ...`).

## Verification

- **Repo-wide check (what CI runs):**
  `nix flake check --impure --accept-flake-config` — evaluates the flake and
  runs the git-hooks check (nil, nixfmt, eslint, prettier, taplo).
- **Contracts CI** (`.github/workflows/contracts.yaml`): flake check plus
  `sui move test` inside the dev shell. Both must pass.
- **Pre-commit hooks** run via prek on every `but commit`. Never commit with
  hooks skipped; if a hook fails, fix the code, not the hook.
- **Backend has no CI test gate** (its workflow only deploys to Shuttle), so
  local `cargo check` / `cargo test` / `cargo clippy` ARE the gate. Run them
  before every backend commit.

## Hard Correctness Requirements

- **Zero tolerance for warnings and errors.** Nothing ships with a compiler
  warning, lint violation, or failing check — regardless of whether you think
  you introduced it. If it appears in your output, you fix it.
- **Verify before handing over.** Every change is verified by running the
  relevant checks (`sui move test`, `cargo check`/`test`/`clippy`,
  `pnpm build`/`lint`, `nix flake check`) before you declare the work done. "It
  should compile" is not verification.
- **Tests accompany every logic change.** New behavior gets new tests; changed
  behavior gets updated tests that assert the new correct behavior. Do not move
  on from a piece of logic until it is covered.
- **Never weaken an assert, test, or check to make it pass.** Tests are
  correctness constraints. If your change can't satisfy them, the change is
  wrong — adapt the design, or stop and ask. Deleting, skipping, or loosening a
  test to ease a refactor is forbidden.
- **Never suppress lints or disable hooks without explicit user permission.**
  Fix the root cause.

## Documentation Standards

- **Docs read standalone.** A future reader has the doc and nothing else — no PR
  threads, no chat, no process narration.
- **Every mathematical symbol is defined before first use.** A math-bearing doc
  opens with a Notation table covering every symbol its formulas use; never
  introduce a letter mid-derivation. Formulas use GitHub-rendered LaTeX (`$...$`
  / `$$...$$`).
- **No code identifiers inside math mode.** GitHub's markdown layer strips `\_`
  escapes before MathJax parses, so `\texttt{a_b}` breaks rendering — keep
  identifiers in code spans outside the math.
- **Cite sources as clickable links**, never as bare prose references.

## Version Control: GitButler

This repo uses GitButler in **workspace mode** — HEAD sits on the
`gitbutler/workspace` branch and GitButler manages virtual branches on top.

- Commit with `but commit <branch> -m "message"`, push with `but push <branch>`.
- **NEVER run plain `git commit`, `git checkout`, `git rebase`, or any other git
  write while on the workspace branch** — it corrupts GitButler's state.
  Read-only git (`git status`, `git log`, `git diff`) is fine.
- Pre-commit hooks (prek) run as part of `but commit`.

### Commit and branch conventions

- **Commit messages:** short, lowercase, imperative, no conventional-commit
  prefixes — e.g. `pull sui deps from upstream instead of the submodule`,
  `deposits, withdrawals, and tests`.
- **Branch names:** `<type>/<kebab-description>` — e.g. `feat/orderbook`,
  `fix/nix-setup`, `chore/rename-data-cartel-to-dataclique`.

### PR format

Two sections, nothing else:

```
## Motivation

Why this change is needed — the problem and desired end state, not the diff.

## Solution

How the PR solves it — approach and key decisions, one line per bullet.
```

Titles match commit style: lowercase, imperative, outcome-oriented.

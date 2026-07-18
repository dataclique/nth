// Wallet integration through the framework-agnostic Sui wallet standard —
// the dataclique org does not use React, so the React-only dapp-kit is
// deliberately absent. Connection state lives in a Solid signal; signing
// goes through the wallet's own standard features.

import {
  getWallets,
  isWalletWithRequiredFeatureSet,
  type WalletWithRequiredFeatures,
  type WalletAccount,
} from "@mysten/wallet-standard"
import type { Transaction } from "@mysten/sui/transactions"
import { createSignal } from "solid-js"

export type WalletConnection =
  | { status: "disconnected" }
  | { status: "connecting" }
  | {
      status: "connected"
      wallet: WalletWithRequiredFeatures
      account: WalletAccount
    }

const [connection, setConnection] = createSignal<WalletConnection>({
  status: "disconnected",
})

export { connection }

/** Wallets present in the page that implement the required Sui features. */
export function availableWallets(): WalletWithRequiredFeatures[] {
  return getWallets()
    .get()
    .filter((wallet): wallet is WalletWithRequiredFeatures =>
      isWalletWithRequiredFeatureSet(wallet),
    )
}

export async function connect(
  wallet: WalletWithRequiredFeatures,
): Promise<void> {
  setConnection({ status: "connecting" })
  try {
    const result = await wallet.features["standard:connect"].connect()
    const account = result.accounts[0]
    if (!account) {
      setConnection({ status: "disconnected" })
      return
    }
    setConnection({ status: "connected", wallet, account })
  } catch {
    setConnection({ status: "disconnected" })
  }
}

export function disconnect(): void {
  setConnection({ status: "disconnected" })
}

/** Sign and execute a transaction with the connected wallet. */
export async function signAndExecute(transaction: Transaction): Promise<void> {
  const current = connection()
  if (current.status !== "connected") {
    throw new Error("no wallet connected")
  }
  const feature = current.wallet.features["sui:signAndExecuteTransaction"]
  if (!feature) {
    throw new Error("wallet does not support transaction execution")
  }
  await feature.signAndExecuteTransaction({
    transaction,
    account: current.account,
    chain: current.account.chains[0] ?? "sui:testnet",
  })
}

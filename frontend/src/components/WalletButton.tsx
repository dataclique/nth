import { createSignal, For, Show } from "solid-js"
import { availableWallets, connect, connection, disconnect } from "../wallet"

const shorten = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`

export default function WalletButton() {
  const [picking, setPicking] = createSignal(false)

  return (
    <Show
      when={connection().status === "connected" ? connection() : null}
      fallback={
        <span style={{ position: "relative" }}>
          <button onClick={() => setPicking(current => !current)}>
            Connect wallet
          </button>
          <Show when={picking()}>
            <span
              class="panel"
              style={{
                "position": "absolute",
                "right": "0",
                "top": "42px",
                "min-width": "200px",
                "z-index": "10",
                "display": "block",
              }}
            >
              <For
                each={availableWallets()}
                fallback={<span class="muted">No Sui wallets detected</span>}
              >
                {wallet => (
                  <button
                    class="secondary"
                    style={{ display: "block", width: "100%", margin: "4px 0" }}
                    onClick={() => {
                      setPicking(false)
                      void connect(wallet)
                    }}
                  >
                    {wallet.name}
                  </button>
                )}
              </For>
            </span>
          </Show>
        </span>
      }
    >
      {connected => (
        <button
          class="secondary"
          onClick={disconnect}
          title="Click to disconnect"
        >
          {(() => {
            const current = connected()
            return current.status === "connected"
              ? shorten(current.account.address)
              : ""
          })()}
        </button>
      )}
    </Show>
  )
}

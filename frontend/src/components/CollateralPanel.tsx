import { createMemo, createSignal, Show } from "solid-js"
import type { MarketSummary } from "../api"
import { buildPerpDeposit, buildPerpWithdraw } from "../api"
import { parseScaled } from "../scale"
import { specToTransaction } from "../tx"
import { connection, signAndExecute } from "../wallet"

/** Margin deposit/withdraw between the margin account and the market's
 * isolated free collateral. Reserved and position collateral never move
 * through this path. */
export default function CollateralPanel(props: {
  market: MarketSummary
  marginAccountId: string
}) {
  const [amountText, setAmountText] = createSignal("")
  const [message, setMessage] = createSignal<string | null>(null)

  const amount = createMemo(() => parseScaled(amountText()))
  const ready = createMemo(
    () =>
      connection().status === "connected" &&
      props.marginAccountId.length > 0 &&
      amount() !== null,
  )

  const run = async (action: "deposit" | "withdraw") => {
    const parsed = amount()
    if (parsed === null) return
    setMessage(null)
    try {
      const request = {
        market_id: props.market.market_id,
        margin_account_id: props.marginAccountId,
        amount: parsed,
      }
      const spec =
        action === "deposit"
          ? await buildPerpDeposit(request)
          : await buildPerpWithdraw(request)
      await signAndExecute(specToTransaction(spec))
      setMessage(`${action} submitted`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "failed")
    }
  }

  return (
    <Show when={props.market.instrument.instrument === "perpetual"}>
      <div class="panel">
        <h2>Collateral</h2>
        <label class="field">
          <span>Amount (USDC)</span>
          <input
            value={amountText()}
            onInput={event => setAmountText(event.currentTarget.value)}
            placeholder="100.00"
          />
        </label>
        <div class="row">
          <button disabled={!ready()} onClick={() => void run("deposit")}>
            Deposit
          </button>
          <button
            class="secondary"
            disabled={!ready()}
            onClick={() => void run("withdraw")}
          >
            Withdraw
          </button>
        </div>
        <Show when={message()}>{text => <p class="muted">{text()}</p>}</Show>
      </div>
    </Show>
  )
}

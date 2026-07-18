import { createMemo, createSignal, Show } from "solid-js"
import type { MarketSummary } from "../api"
import { buildVaultDeposit, buildVaultRedeem } from "../api"
import { formatUsdc, parseScaled, usdcBaseUnits } from "../scale"
import { specToTransaction } from "../tx"
import { connection, signAndExecute } from "../wallet"

/** Vault deposit/redeem with the manager's policy and fees disclosed
 * before anything is signed. */
export default function VaultPanel(props: {
  market: MarketSummary
  marginAccountId: string
}) {
  const [amountText, setAmountText] = createSignal("")
  const [message, setMessage] = createSignal<string | null>(null)

  const amount = createMemo(() => parseScaled(amountText()))
  const vaultInfo = createMemo(() => {
    const info = props.market.instrument
    return info.instrument === "vault" ? info : null
  })
  const feePreview = createMemo(() => {
    const info = vaultInfo()
    const parsed = amount()
    if (!info || parsed === null) return null
    return Math.floor((parsed * info.deposit_fee_bps) / 10_000)
  })
  const ready = createMemo(
    () =>
      connection().status === "connected" &&
      props.marginAccountId.length > 0 &&
      amount() !== null,
  )

  const run = async (action: "deposit" | "redeem") => {
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
          ? await buildVaultDeposit(request)
          : await buildVaultRedeem(request)
      await signAndExecute(specToTransaction(spec))
      setMessage(`${action} submitted`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "failed")
    }
  }

  return (
    <Show when={vaultInfo()}>
      {info => (
        <div class="panel">
          <h2>Vault</h2>
          <p class="muted">
            Manager policy, fixed at creation: deposit fee{" "}
            {info().deposit_fee_bps} bps, buyback orders capped at{" "}
            {formatUsdc(usdcBaseUnits(info().max_order_notional))} each, at most{" "}
            {info().max_open_orders} resting. The treasury has no withdrawal
            path — for anyone, including the manager.
          </p>
          <label class="field">
            <span>Amount (USDC to deposit / shares to redeem)</span>
            <input
              value={amountText()}
              onInput={event => setAmountText(event.currentTarget.value)}
              placeholder="100.00"
            />
          </label>
          <Show when={feePreview() !== null}>
            <div class="simulation">
              <div>
                <span class="muted">Deposit fee</span>
                <span>{formatUsdc(usdcBaseUnits(feePreview() ?? 0))}</span>
              </div>
            </div>
          </Show>
          <div class="row" style={{ "margin-top": "8px" }}>
            <button disabled={!ready()} onClick={() => void run("deposit")}>
              Deposit
            </button>
            <button
              class="secondary"
              disabled={!ready()}
              onClick={() => void run("redeem")}
            >
              Redeem
            </button>
          </div>
          <Show when={message()}>{text => <p class="muted">{text()}</p>}</Show>
        </div>
      )}
    </Show>
  )
}

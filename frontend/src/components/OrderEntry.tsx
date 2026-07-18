import { createMemo, createSignal, Match, Show, Switch } from "solid-js"
import type { CallSpec, MarketSummary } from "../api"
import { buildOptionOrder, buildPerpOrder } from "../api"
import {
  FLOAT_SCALING,
  formatPrice,
  formatUsdc,
  parseScaled,
  scaledPrice,
  usdcBaseUnits,
} from "../scale"
import { specToTransaction } from "../tx"
import { connection, signAndExecute } from "../wallet"

type Submission =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "done" }
  | { status: "error"; message: string }

/** Order entry with pre-sign simulation: margin impact, liquidation
 * distance, and expiry worst case are shown before anything is signed. */
export default function OrderEntry(props: {
  market: MarketSummary
  marginAccountId: string
}) {
  const [side, setSide] = createSignal<"bid" | "ask">("bid")
  const [priceText, setPriceText] = createSignal("")
  const [sizeText, setSizeText] = createSignal("")
  const [leverageText, setLeverageText] = createSignal("2")
  const [submission, setSubmission] = createSignal<Submission>({
    status: "idle",
  })

  const price = createMemo(() => parseScaled(priceText()))
  const size = createMemo(() => parseScaled(sizeText()))
  const leverage = createMemo(() => parseScaled(leverageText()))

  const notional = createMemo(() => {
    const parsedPrice = price()
    const parsedSize = size()
    if (parsedPrice === null || parsedSize === null) return null
    return Math.floor((parsedPrice * parsedSize) / FLOAT_SCALING)
  })

  /** Initial margin for a perp order: notional / leverage. */
  const marginImpact = createMemo(() => {
    const parsedNotional = notional()
    const parsedLeverage = leverage()
    if (
      parsedNotional === null ||
      parsedLeverage === null ||
      parsedLeverage === 0
    )
      return null
    return Math.floor((parsedNotional * FLOAT_SCALING) / parsedLeverage)
  })

  /** Liquidation price from the maintenance rate, per docs/liquidation.md:
   * entry ± (initial - maintenance) / size. */
  const liquidationPrice = createMemo(() => {
    const info = props.market.instrument
    if (info.instrument !== "perpetual") return null
    const parsedPrice = price()
    const parsedSize = size()
    const margin = marginImpact()
    if (parsedPrice === null || parsedSize === null || margin === null)
      return null
    if (parsedSize === 0) return null
    const maintenance = Math.floor(
      (((parsedPrice * parsedSize) / FLOAT_SCALING) *
        info.maintenance_margin_rate_percent) /
        100,
    )
    const buffer = Math.floor(
      ((margin - maintenance) * FLOAT_SCALING) / parsedSize,
    )
    return side() === "bid"
      ? Math.max(parsedPrice - buffer, 0)
      : parsedPrice + buffer
  })

  /** For an option seller the escrow is the full capped payout; for a
   * buyer the worst case at expiry is the premium. */
  const optionWorstCase = createMemo(() => {
    const info = props.market.instrument
    if (info.instrument !== "option") return null
    const parsedSize = size()
    const parsedNotional = notional()
    if (parsedSize === null || parsedNotional === null) return null
    if (side() === "bid") return parsedNotional
    return Math.floor((info.cap * parsedSize) / FLOAT_SCALING)
  })

  const ready = createMemo(
    () =>
      connection().status === "connected" &&
      props.marginAccountId.length > 0 &&
      price() !== null &&
      size() !== null &&
      !props.market.terminal,
  )

  const submit = async () => {
    const parsedPrice = price()
    const parsedSize = size()
    if (parsedPrice === null || parsedSize === null) return
    setSubmission({ status: "submitting" })
    try {
      const info = props.market.instrument
      let spec: CallSpec
      if (info.instrument === "perpetual") {
        const parsedLeverage = leverage()
        if (parsedLeverage === null) throw new Error("invalid leverage")
        spec = await buildPerpOrder({
          market_id: props.market.market_id,
          margin_account_id: props.marginAccountId,
          side: side(),
          price: parsedPrice,
          size: parsedSize,
          leverage: parsedLeverage,
        })
      } else if (info.instrument === "option") {
        spec = await buildOptionOrder({
          style: info.style,
          market_id: props.market.market_id,
          margin_account_id: props.marginAccountId,
          side: side(),
          price: parsedPrice,
          size: parsedSize,
        })
      } else {
        throw new Error("order entry is not available for this instrument")
      }
      await signAndExecute(specToTransaction(spec))
      setSubmission({ status: "done" })
    } catch (error) {
      setSubmission({
        status: "error",
        message: error instanceof Error ? error.message : "failed",
      })
    }
  }

  return (
    <div class="panel">
      <h2>Place order</h2>
      <div class="row" style={{ "margin-bottom": "10px" }}>
        <button
          class={side() === "bid" ? "buy" : "secondary"}
          onClick={() => setSide("bid")}
        >
          Buy
        </button>
        <button
          class={side() === "ask" ? "sell" : "secondary"}
          onClick={() => setSide("ask")}
        >
          Sell
        </button>
      </div>
      <label class="field">
        <span>
          {props.market.instrument.instrument === "option"
            ? "Premium (USDC per unit)"
            : "Price (USDC per unit)"}
        </span>
        <input
          value={priceText()}
          onInput={event => setPriceText(event.currentTarget.value)}
          placeholder="100.00"
        />
      </label>
      <label class="field">
        <span>Size (units)</span>
        <input
          value={sizeText()}
          onInput={event => setSizeText(event.currentTarget.value)}
          placeholder="1.0"
        />
      </label>
      <Show when={props.market.instrument.instrument === "perpetual"}>
        <label class="field">
          <span>Leverage (x)</span>
          <input
            value={leverageText()}
            onInput={event => setLeverageText(event.currentTarget.value)}
          />
        </label>
      </Show>

      <div class="simulation">
        <Switch>
          <Match when={props.market.instrument.instrument === "perpetual"}>
            <div>
              <span class="muted">Margin impact</span>
              <span>
                {marginImpact() === null
                  ? "—"
                  : formatUsdc(usdcBaseUnits(marginImpact() ?? 0))}
              </span>
            </div>
            <div>
              <span class="muted">Est. liquidation price</span>
              <span>
                {liquidationPrice() === null
                  ? "—"
                  : formatPrice(scaledPrice(liquidationPrice() ?? 0))}
              </span>
            </div>
          </Match>
          <Match when={props.market.instrument.instrument === "option"}>
            <div>
              <span class="muted">
                {side() === "bid"
                  ? "Premium paid (worst case at expiry)"
                  : "Escrow locked (max payout)"}
              </span>
              <span>
                {optionWorstCase() === null
                  ? "—"
                  : formatUsdc(usdcBaseUnits(optionWorstCase() ?? 0))}
              </span>
            </div>
          </Match>
        </Switch>
        <div>
          <span class="muted">Notional</span>
          <span>
            {notional() === null
              ? "—"
              : formatUsdc(usdcBaseUnits(notional() ?? 0))}
          </span>
        </div>
      </div>

      <button
        style={{ "width": "100%", "margin-top": "8px" }}
        class={side() === "bid" ? "buy" : "sell"}
        disabled={!ready() || submission().status === "submitting"}
        onClick={() => void submit()}
      >
        {submission().status === "submitting"
          ? "Confirm in wallet…"
          : `${side() === "bid" ? "Buy" : "Sell"} ${
              props.market.instrument.instrument === "option" ? "option" : ""
            }`}
      </button>
      <Show when={submission().status === "error" ? submission() : null}>
        {failed => (
          <div class="notice">
            {(() => {
              const current = failed()
              return current.status === "error" ? current.message : ""
            })()}
          </div>
        )}
      </Show>
      <Show when={connection().status !== "connected"}>
        <p class="muted">Connect a wallet to place orders.</p>
      </Show>
      <Show when={props.market.terminal}>
        <p class="muted">This market is terminal and accepts no new orders.</p>
      </Show>
    </div>
  )
}

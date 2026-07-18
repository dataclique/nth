import { createResource, createSignal, For, Show } from "solid-js"
import { useParams } from "@solidjs/router"
import {
  fetchBook,
  fetchCandles,
  fetchFunding,
  fetchMarket,
  fetchTrades,
} from "../api"
import AccountPanel from "../components/AccountPanel"
import CandleChart from "../components/CandleChart"
import OrderBook from "../components/OrderBook"
import OrderEntry from "../components/OrderEntry"
import RiskBadge, { instrumentName } from "../components/RiskBadge"
import TradeList from "../components/TradeList"
import VaultPanel from "../components/VaultPanel"
import { formatPrice, scaledPrice } from "../scale"

const ACCOUNT_STORAGE_KEY = "nth-margin-account-id"

export default function Market() {
  const params = useParams<{ id: string }>()
  const [market] = createResource(() => params.id, fetchMarket)
  const [book] = createResource(() => params.id, fetchBook)
  const [trades] = createResource(() => params.id, fetchTrades)
  const [candles] = createResource(() => params.id, fetchCandles)
  const [funding] = createResource(() => params.id, fetchFunding)

  const [marginAccountId, setMarginAccountId] = createSignal(
    localStorage.getItem(ACCOUNT_STORAGE_KEY) ?? "",
  )
  const updateAccount = (value: string) => {
    setMarginAccountId(value)
    localStorage.setItem(ACCOUNT_STORAGE_KEY, value)
  }

  return (
    <Show when={market()} fallback={<p class="muted">Loading market…</p>}>
      {summary => (
        <>
          <h1>
            {instrumentName(summary())} <RiskBadge market={summary()} />
          </h1>
          <p class="muted">
            {summary().market_id}
            {summary().reference_price === null
              ? ""
              : ` · reference price ${formatPrice(
                  scaledPrice(summary().reference_price ?? 0),
                )}`}
          </p>
          <Show when={summary().risk_label === "unranked"}>
            <div class="notice">
              This market comes from an unknown package. Nothing about it has
              been reviewed — interact only if you have verified the package
              yourself.
            </div>
          </Show>

          <div class="grid market-grid">
            <div class="grid">
              <div class="panel">
                <h2>Price</h2>
                <CandleChart candles={candles()} />
              </div>
              <div class="grid" style={{ "grid-template-columns": "1fr 1fr" }}>
                <OrderBook book={book()} />
                <TradeList trades={trades()} />
              </div>
              <Show when={(funding() ?? []).length > 0}>
                <div class="panel">
                  <h2>Funding history</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Rate (bps)</th>
                        <th>Paying side</th>
                        <th>Mark price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={funding() ?? []}>
                        {round => (
                          <tr>
                            <td>{round.period}</td>
                            <td>{round.rate_bps}</td>
                            <td>{round.longs_pay ? "longs" : "shorts"}</td>
                            <td>
                              {formatPrice(scaledPrice(round.mark_price))}
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </div>

            <div class="grid">
              <div class="panel">
                <h2>Margin account</h2>
                <label class="field">
                  <span>Margin account object ID</span>
                  <input
                    value={marginAccountId()}
                    onInput={event => updateAccount(event.currentTarget.value)}
                    placeholder="0x…"
                  />
                </label>
              </div>
              <Show when={summary().instrument.instrument !== "vault"}>
                <OrderEntry
                  market={summary()}
                  marginAccountId={marginAccountId()}
                />
              </Show>
              <VaultPanel
                market={summary()}
                marginAccountId={marginAccountId()}
              />
              <AccountPanel
                marketId={params.id}
                marginAccountId={marginAccountId()}
              />
            </div>
          </div>
        </>
      )}
    </Show>
  )
}

import { createResource, createSignal, For, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { fetchMarkets } from "../api"
import RiskBadge, { instrumentName } from "../components/RiskBadge"
import { formatPrice, formatSize, scaledPrice, scaledSize } from "../scale"

export default function Markets() {
  const [includeUnranked, setIncludeUnranked] = createSignal(false)
  const [markets] = createResource(includeUnranked, fetchMarkets)
  const navigate = useNavigate()

  return (
    <>
      <h1>Markets</h1>
      <Show when={includeUnranked()}>
        <div class="notice">
          Unranked markets come from unknown, unaudited packages. Anyone can
          publish an instrument here — trade them only if you have verified the
          package yourself.
        </div>
      </Show>
      <div class="panel">
        <table>
          <thead>
            <tr>
              <th>Market</th>
              <th>Instrument</th>
              <th>Risk</th>
              <th>Reference price</th>
              <th>Best bid</th>
              <th>Best ask</th>
              <th>Last trade</th>
              <th>Open interest</th>
            </tr>
          </thead>
          <tbody>
            <For
              each={markets() ?? []}
              fallback={
                <tr>
                  <td colspan="8" class="muted">
                    {markets.loading
                      ? "Loading markets…"
                      : "No markets indexed yet"}
                  </td>
                </tr>
              }
            >
              {market => (
                <tr
                  class="clickable"
                  onClick={() => navigate(`/markets/${market.market_id}`)}
                >
                  <td>{market.market_id.slice(0, 10)}…</td>
                  <td>{instrumentName(market)}</td>
                  <td>
                    <RiskBadge market={market} />
                  </td>
                  <td>
                    {market.reference_price === null
                      ? "—"
                      : formatPrice(scaledPrice(market.reference_price))}
                  </td>
                  <td class="bid">
                    {market.best_bid === null
                      ? "—"
                      : formatPrice(scaledPrice(market.best_bid))}
                  </td>
                  <td class="ask">
                    {market.best_ask === null
                      ? "—"
                      : formatPrice(scaledPrice(market.best_ask))}
                  </td>
                  <td>
                    {market.last_trade_price === null
                      ? "—"
                      : formatPrice(scaledPrice(market.last_trade_price))}
                  </td>
                  <td>{formatSize(scaledSize(market.open_interest))}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <div style={{ "margin-top": "12px" }}>
          <button
            class="secondary"
            onClick={() => setIncludeUnranked(current => !current)}
          >
            {includeUnranked()
              ? "Hide unranked markets"
              : "Show unranked markets (opt in)"}
          </button>
        </div>
      </div>
    </>
  )
}

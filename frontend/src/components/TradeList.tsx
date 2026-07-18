import { For } from "solid-js"
import type { Trade } from "../api"
import { formatPrice, formatSize, scaledPrice, scaledSize } from "../scale"

export default function TradeList(props: { trades: Trade[] | undefined }) {
  const newestFirst = () => [...(props.trades ?? [])].reverse()
  return (
    <div class="panel">
      <h2>Recent trades</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Price</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          <For
            each={newestFirst()}
            fallback={
              <tr>
                <td colspan="3" class="muted">
                  No trades yet
                </td>
              </tr>
            }
          >
            {trade => (
              <tr>
                <td class="muted">
                  {new Date(trade.timestamp_ms).toLocaleTimeString()}
                </td>
                <td class={trade.maker_is_bid ? "ask" : "bid"}>
                  {formatPrice(scaledPrice(trade.price))}
                </td>
                <td>{formatSize(scaledSize(trade.size))}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

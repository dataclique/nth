import { For } from "solid-js"
import type { BookSnapshot } from "../api"
import { formatPrice, formatSize, scaledPrice, scaledSize } from "../scale"

export default function OrderBook(props: { book: BookSnapshot | undefined }) {
  return (
    <div class="panel">
      <h2>Order book</h2>
      <table>
        <thead>
          <tr>
            <th>Bid size</th>
            <th>Bid</th>
            <th>Ask</th>
            <th>Ask size</th>
          </tr>
        </thead>
        <tbody>
          <For
            each={Array.from({
              length: Math.max(
                props.book?.bids.length ?? 0,
                props.book?.asks.length ?? 0,
              ),
            })}
            fallback={
              <tr>
                <td colspan="4" class="muted">
                  Empty book
                </td>
              </tr>
            }
          >
            {(_, index) => {
              const bid = () => props.book?.bids[index()]
              const ask = () => props.book?.asks[index()]
              return (
                <tr>
                  <td>
                    {bid() ? formatSize(scaledSize(bid()?.size ?? 0)) : ""}
                  </td>
                  <td class="bid">
                    {bid() ? formatPrice(scaledPrice(bid()?.price ?? 0)) : ""}
                  </td>
                  <td class="ask">
                    {ask() ? formatPrice(scaledPrice(ask()?.price ?? 0)) : ""}
                  </td>
                  <td>
                    {ask() ? formatSize(scaledSize(ask()?.size ?? 0)) : ""}
                  </td>
                </tr>
              )
            }}
          </For>
        </tbody>
      </table>
    </div>
  )
}

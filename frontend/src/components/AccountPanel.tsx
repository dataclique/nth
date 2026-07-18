import { createResource, Show } from "solid-js"
import { fetchAccount } from "../api"
import { formatSize, formatUsdc, scaledSize, usdcBaseUnits } from "../scale"

/** One account's projected state in this market, straight from indexed
 * chain events — every number traces to on-chain state. */
export default function AccountPanel(props: {
  marketId: string
  marginAccountId: string
}) {
  const [account] = createResource(
    () =>
      props.marginAccountId.length > 0
        ? { market: props.marketId, account: props.marginAccountId }
        : null,
    request => fetchAccount(request.market, request.account),
  )

  return (
    <div class="panel">
      <h2>Account</h2>
      <Show
        when={account()}
        fallback={
          <p class="muted">
            {props.marginAccountId.length === 0
              ? "Enter your margin account object ID to see balances."
              : "No activity indexed for this account in this market."}
          </p>
        }
      >
        {state => (
          <table>
            <tbody>
              <tr>
                <td class="muted">Free collateral</td>
                <td>{formatUsdc(usdcBaseUnits(state().free_collateral))}</td>
              </tr>
              <tr>
                <td class="muted">Position collateral</td>
                <td>
                  {formatUsdc(usdcBaseUnits(state().position_collateral))}
                </td>
              </tr>
              <tr>
                <td class="muted">Position</td>
                <td>
                  {state().exposure ?? "flat"}{" "}
                  {formatSize(scaledSize(state().position_size))}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Show>
    </div>
  )
}

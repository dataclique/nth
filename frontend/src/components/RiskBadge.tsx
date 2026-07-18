import { Show } from "solid-js"
import type { MarketSummary } from "../api"

export default function RiskBadge(props: { market: MarketSummary }) {
  return (
    <>
      <span class={`badge ${props.market.risk_label}`}>
        {props.market.risk_label}
      </span>{" "}
      <Show when={props.market.terminal}>
        <span class="badge terminal">terminal</span>
      </Show>
    </>
  )
}

export function instrumentName(market: MarketSummary): string {
  const info = market.instrument
  switch (info.instrument) {
    case "perpetual":
      return `Perpetual (${info.maintenance_margin_rate_percent}% maintenance)`
    case "option":
      return `${info.style[0]?.toUpperCase()}${info.style.slice(1)} option`
    case "vault":
      return `Community vault (${info.deposit_fee_bps} bps fee)`
    case "unknown":
      return "Unknown instrument"
  }
}

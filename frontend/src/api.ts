// Typed client for the platform API (backend/src/api.rs). Every number is
// a fixed-point integer at the 10^6 scale, served verbatim from chain
// events; rescaling for display happens through src/scale.ts.

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export type InstrumentInfo =
  | { instrument: "unknown" }
  | { instrument: "perpetual"; maintenance_margin_rate_percent: number }
  | {
      instrument: "option"
      style: "european" | "american" | "cliquet"
      strike: number
      expiry_ms: number | null
      cap: number
    }
  | {
      instrument: "vault"
      deposit_fee_bps: number
      max_order_notional: number
      max_open_orders: number
    }

export interface MarketSummary {
  market_id: string
  instrument: InstrumentInfo
  risk_label: "reference" | "unranked"
  terminal: boolean
  reference_price: number | null
  open_interest: number
  best_bid: number | null
  best_ask: number | null
  last_trade_price: number | null
}

export interface BookLevel {
  price: number
  size: number
}

export interface BookSnapshot {
  market_id: string
  bids: BookLevel[]
  asks: BookLevel[]
}

export interface Trade {
  timestamp_ms: number
  price: number
  size: number
  maker_is_bid: boolean
  tx_digest: string
}

export interface Candle {
  open_ms: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface FundingRound {
  timestamp_ms: number
  period: number
  rate_bps: number
  longs_pay: boolean
  mark_price: number
}

export interface AccountState {
  free_collateral: number
  position_collateral: number
  position_size: number
  exposure?: "flat" | "long" | "short"
}

export type CallSpecArg =
  | { kind: "object"; object_id: string }
  | { kind: "pure"; value_type: string; value: string }
  | { kind: "result"; call: number }
  | { kind: "clock" }

export interface CallSpecMoveCall {
  package: string
  module: string
  function: string
  type_arguments: string[]
  arguments: CallSpecArg[]
}

export interface CallSpec {
  description: string
  calls: CallSpecMoveCall[]
}

async function getJson<Response>(path: string): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) throw new Error(`${path}: ${response.status}`)
  return (await response.json()) as Response
}

async function postJson<Response>(
  path: string,
  body: unknown,
): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`${path}: ${response.status}`)
  return (await response.json()) as Response
}

export const fetchMarkets = (includeUnranked: boolean) =>
  getJson<MarketSummary[]>(`/v1/markets?include_unranked=${includeUnranked}`)

export const fetchMarket = (marketId: string) =>
  getJson<MarketSummary>(`/v1/markets/${marketId}`)

export const fetchBook = (marketId: string) =>
  getJson<BookSnapshot>(`/v1/markets/${marketId}/book?depth=25`)

export const fetchTrades = (marketId: string) =>
  getJson<Trade[]>(`/v1/markets/${marketId}/trades?limit=50`)

export const fetchCandles = (marketId: string) =>
  getJson<Candle[]>(`/v1/markets/${marketId}/candles`)

export const fetchFunding = (marketId: string) =>
  getJson<FundingRound[]>(`/v1/markets/${marketId}/funding`)

export const fetchAccount = (marketId: string, accountId: string) =>
  getJson<AccountState>(`/v1/markets/${marketId}/accounts/${accountId}`)

export interface PerpOrderRequest {
  market_id: string
  margin_account_id: string
  side: "bid" | "ask"
  price: number
  size: number
  leverage: number
}

export const buildPerpOrder = (request: PerpOrderRequest) =>
  postJson<CallSpec>("/v1/tx/perp/place-order", request)

export const buildPerpDeposit = (request: {
  market_id: string
  margin_account_id: string
  amount: number
}) => postJson<CallSpec>("/v1/tx/perp/deposit", request)

export const buildPerpWithdraw = (request: {
  market_id: string
  margin_account_id: string
  amount: number
}) => postJson<CallSpec>("/v1/tx/perp/withdraw", request)

export const buildVaultDeposit = (request: {
  market_id: string
  margin_account_id: string
  amount: number
}) => postJson<CallSpec>("/v1/tx/vault/deposit", request)

export const buildVaultRedeem = (request: {
  market_id: string
  margin_account_id: string
  amount: number
}) => postJson<CallSpec>("/v1/tx/vault/redeem", request)

export const buildOptionOrder = (request: {
  style: "european" | "american" | "cliquet"
  market_id: string
  margin_account_id: string
  side: "bid" | "ask"
  price: number
  size: number
}) => postJson<CallSpec>("/v1/tx/option/place-order", request)

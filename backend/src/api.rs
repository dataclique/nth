//! The versioned platform API: REST market data, the WebSocket event
//! stream, and transaction-building endpoints.
//!
//! Every calculation served here is informational and cannot authorize
//! settlement: the API holds no keys and never signs. Numbers keep the
//! on-chain `10^6` fixed-point scale.

use crate::events::ObjectId;
use crate::state::{BookLevel, Candle, CarryRecord, FundingRound, Platform, RiskLabel, Trade};
use crate::tx::{self, TxRegistry};
use rocket::serde::json::Json;
use rocket::{get, post, routes, Route, State};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, RwLock};
use tokio::sync::broadcast;

/// Shared, indexer-updated platform state.
pub type SharedPlatform = Arc<RwLock<Platform>>;

/// Broadcast channel carrying every decoded event as JSON for WS clients.
#[derive(Clone)]
pub struct EventStream(pub broadcast::Sender<String>);

/// Read the shared platform, recovering from lock poisoning rather than
/// panicking — the projections stay serviceable even if a writer panicked.
fn read_platform(platform: &SharedPlatform) -> std::sync::RwLockReadGuard<'_, Platform> {
    match platform.read() {
        Ok(guard) => guard,
        Err(poisoned) => poisoned.into_inner(),
    }
}

/// All `/v1` routes.
pub fn v1_routes() -> Vec<Route> {
    routes![
        schema,
        markets,
        market_detail,
        market_book,
        market_trades,
        market_candles,
        market_funding,
        market_carry,
        market_account,
        stream,
        tx_perp_deposit,
        tx_perp_withdraw,
        tx_perp_place_order,
        tx_perp_cancel_order,
        tx_vault_deposit,
        tx_vault_redeem,
        tx_option_place_order,
        tx_option_exercise,
    ]
}

#[derive(Serialize)]
struct MarketSummary {
    market_id: ObjectId,
    instrument: crate::state::InstrumentInfo,
    risk_label: RiskLabel,
    terminal: bool,
    reference_price: Option<u64>,
    open_interest: u64,
    best_bid: Option<u64>,
    best_ask: Option<u64>,
    last_trade_price: Option<u64>,
}

fn summarize(market: &crate::state::MarketState) -> MarketSummary {
    let (bids, asks) = market.book_snapshot(1);
    MarketSummary {
        market_id: market.market_id.clone(),
        instrument: market.instrument.clone(),
        risk_label: market.risk_label,
        terminal: market.terminal,
        reference_price: market.reference_price,
        open_interest: market.open_interest,
        best_bid: bids.first().map(|level| level.price),
        best_ask: asks.first().map(|level| level.price),
        last_trade_price: market.trades.last().map(|trade| trade.price),
    }
}

/// Machine-readable description of the API surface.
#[get("/schema")]
fn schema() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "name": "nth-market-api",
        "version": "v1",
        "scale": "all prices, sizes, and USDC amounts are fixed-point integers at 10^6",
        "routes": {
            "GET /v1/markets?include_unranked=<bool>": "instrument registry with risk labels",
            "GET /v1/markets/<id>": "one market summary (kernel or wrapper id)",
            "GET /v1/markets/<id>/book?depth=<n>": "order book snapshot",
            "GET /v1/markets/<id>/trades?limit=<n>": "recent trades, newest last",
            "GET /v1/markets/<id>/candles?from_ms=<t>&to_ms=<t>": "1m OHLCV candles",
            "GET /v1/markets/<id>/funding": "settled funding rounds",
            "GET /v1/markets/<id>/carry": "funding/carry transfer history",
            "GET /v1/markets/<id>/accounts/<account>": "one account's projected state",
            "GET /v1/stream": "WebSocket: every decoded chain event as JSON",
            "POST /v1/tx/*": "unsigned transaction call specs for client-side signing",
        },
    }))
}

/// The instrument registry. Unranked (unknown-package) markets are hidden
/// unless explicitly requested — labeling, never delisting.
#[get("/markets?<include_unranked>")]
fn markets(
    platform: &State<SharedPlatform>,
    include_unranked: Option<bool>,
) -> Json<Vec<MarketSummary>> {
    let platform = read_platform(platform);
    let include_unranked = include_unranked.unwrap_or(false);
    let mut summaries: Vec<MarketSummary> = platform
        .markets
        .values()
        .filter(|market| include_unranked || market.risk_label == RiskLabel::Reference)
        .map(summarize)
        .collect();
    summaries.sort_by(|left, right| left.market_id.0.cmp(&right.market_id.0));
    Json(summaries)
}

#[get("/markets/<id>")]
fn market_detail(platform: &State<SharedPlatform>, id: &str) -> Option<Json<MarketSummary>> {
    let platform = read_platform(platform);
    platform
        .market(&ObjectId(id.to_string()))
        .map(|market| Json(summarize(market)))
}

#[derive(Serialize)]
struct BookResponse {
    market_id: String,
    bids: Vec<BookLevel>,
    asks: Vec<BookLevel>,
}

#[get("/markets/<id>/book?<depth>")]
fn market_book(
    platform: &State<SharedPlatform>,
    id: &str,
    depth: Option<usize>,
) -> Option<Json<BookResponse>> {
    let platform = read_platform(platform);
    let market = platform.market(&ObjectId(id.to_string()))?;
    let (bids, asks) = market.book_snapshot(depth.unwrap_or(50).min(500));
    Some(Json(BookResponse {
        market_id: id.to_string(),
        bids,
        asks,
    }))
}

#[get("/markets/<id>/trades?<limit>")]
fn market_trades(
    platform: &State<SharedPlatform>,
    id: &str,
    limit: Option<usize>,
) -> Option<Json<Vec<Trade>>> {
    let platform = read_platform(platform);
    let market = platform.market(&ObjectId(id.to_string()))?;
    let limit = limit.unwrap_or(100).min(1000);
    let start = market.trades.len().saturating_sub(limit);
    Some(Json(market.trades[start..].to_vec()))
}

#[get("/markets/<id>/candles?<from_ms>&<to_ms>")]
fn market_candles(
    platform: &State<SharedPlatform>,
    id: &str,
    from_ms: Option<u64>,
    to_ms: Option<u64>,
) -> Option<Json<Vec<Candle>>> {
    let platform = read_platform(platform);
    let market = platform.market(&ObjectId(id.to_string()))?;
    let from_ms = from_ms.unwrap_or(0);
    let to_ms = to_ms.unwrap_or(u64::MAX);
    Some(Json(
        market
            .candles
            .range(from_ms..=to_ms)
            .map(|(_, candle)| candle.clone())
            .collect(),
    ))
}

#[get("/markets/<id>/funding")]
fn market_funding(platform: &State<SharedPlatform>, id: &str) -> Option<Json<Vec<FundingRound>>> {
    let platform = read_platform(platform);
    let market = platform.market(&ObjectId(id.to_string()))?;
    Some(Json(market.funding_rounds.clone()))
}

#[get("/markets/<id>/carry")]
fn market_carry(platform: &State<SharedPlatform>, id: &str) -> Option<Json<Vec<CarryRecord>>> {
    let platform = read_platform(platform);
    let market = platform.market(&ObjectId(id.to_string()))?;
    Some(Json(market.carry_history.clone()))
}

#[get("/markets/<id>/accounts/<account>")]
fn market_account(
    platform: &State<SharedPlatform>,
    id: &str,
    account: &str,
) -> Option<Json<crate::state::AccountState>> {
    let platform = read_platform(platform);
    let market = platform.market(&ObjectId(id.to_string()))?;
    market
        .accounts
        .get(&ObjectId(account.to_string()))
        .cloned()
        .map(Json)
}

/// WebSocket stream of every decoded chain event, one JSON object per
/// message, in chain order. Optional `?market=<id>` filters by market.
#[get("/stream?<market>")]
fn stream(
    events: &State<EventStream>,
    market: Option<String>,
    ws: rocket_ws::WebSocket,
) -> rocket_ws::Channel<'static> {
    use rocket::futures::SinkExt;
    let mut receiver = events.0.subscribe();
    ws.channel(move |mut channel| {
        Box::pin(async move {
            while let Ok(message) = receiver.recv().await {
                let keep = match &market {
                    None => true,
                    Some(filter) => message.contains(filter.as_str()),
                };
                if keep
                    && channel
                        .send(rocket_ws::Message::Text(message))
                        .await
                        .is_err()
                {
                    break;
                }
            }
            Ok(())
        })
    })
}

#[derive(Deserialize)]
struct PerpDepositRequest {
    market_id: String,
    margin_account_id: String,
    /// USDC base units at the shared `10^6` scale.
    amount: u64,
}

#[post("/tx/perp/deposit", data = "<request>")]
fn tx_perp_deposit(
    registry: &State<TxRegistry>,
    request: Json<PerpDepositRequest>,
) -> Option<Json<tx::CallSpec>> {
    registry
        .perp_deposit(
            &request.market_id,
            &request.margin_account_id,
            request.amount,
        )
        .map(Json)
}

#[post("/tx/perp/withdraw", data = "<request>")]
fn tx_perp_withdraw(
    registry: &State<TxRegistry>,
    request: Json<PerpDepositRequest>,
) -> Option<Json<tx::CallSpec>> {
    registry
        .perp_withdraw(
            &request.market_id,
            &request.margin_account_id,
            request.amount,
        )
        .map(Json)
}

#[derive(Deserialize)]
struct PerpOrderRequest {
    market_id: String,
    margin_account_id: String,
    side: tx::OrderSide,
    /// `10^6`-scaled price.
    price: u64,
    /// `10^6`-scaled size.
    size: u64,
    /// `10^6`-scaled leverage (2x = 2_000_000).
    leverage: u64,
}

#[post("/tx/perp/place-order", data = "<request>")]
fn tx_perp_place_order(
    registry: &State<TxRegistry>,
    request: Json<PerpOrderRequest>,
) -> Option<Json<tx::CallSpec>> {
    registry
        .perp_place_order(
            &request.market_id,
            &request.margin_account_id,
            request.side,
            request.price,
            request.size,
            request.leverage,
        )
        .map(Json)
}

#[derive(Deserialize)]
struct CancelRequest {
    market_id: String,
    margin_account_id: String,
    side: tx::OrderSide,
    order_id: u64,
}

#[post("/tx/perp/cancel-order", data = "<request>")]
fn tx_perp_cancel_order(
    registry: &State<TxRegistry>,
    request: Json<CancelRequest>,
) -> Option<Json<tx::CallSpec>> {
    registry
        .perp_cancel_order(
            &request.market_id,
            &request.margin_account_id,
            request.side,
            request.order_id,
        )
        .map(Json)
}

#[derive(Deserialize)]
struct VaultFlowRequest {
    market_id: String,
    margin_account_id: String,
    /// Deposit: USDC base units. Redeem: `10^6`-scaled share size.
    amount: u64,
}

#[post("/tx/vault/deposit", data = "<request>")]
fn tx_vault_deposit(
    registry: &State<TxRegistry>,
    request: Json<VaultFlowRequest>,
) -> Option<Json<tx::CallSpec>> {
    registry
        .vault_deposit(
            &request.market_id,
            &request.margin_account_id,
            request.amount,
        )
        .map(Json)
}

#[post("/tx/vault/redeem", data = "<request>")]
fn tx_vault_redeem(
    registry: &State<TxRegistry>,
    request: Json<VaultFlowRequest>,
) -> Option<Json<tx::CallSpec>> {
    registry
        .vault_redeem(
            &request.market_id,
            &request.margin_account_id,
            request.amount,
        )
        .map(Json)
}

#[derive(Deserialize)]
struct OptionOrderRequest {
    style: crate::events::OptionStyle,
    market_id: String,
    margin_account_id: String,
    side: tx::OrderSide,
    /// `10^6`-scaled premium.
    price: u64,
    /// `10^6`-scaled size.
    size: u64,
}

#[post("/tx/option/place-order", data = "<request>")]
fn tx_option_place_order(
    registry: &State<TxRegistry>,
    request: Json<OptionOrderRequest>,
) -> Option<Json<tx::CallSpec>> {
    registry
        .option_place_order(
            request.style,
            &request.market_id,
            &request.margin_account_id,
            request.side,
            request.price,
            request.size,
        )
        .map(Json)
}

#[derive(Deserialize)]
struct ExerciseRequest {
    market_id: String,
    holder_account_id: String,
    assigned_account_id: String,
    /// `10^6`-scaled size.
    size: u64,
}

#[post("/tx/option/exercise", data = "<request>")]
fn tx_option_exercise(
    registry: &State<TxRegistry>,
    request: Json<ExerciseRequest>,
) -> Option<Json<tx::CallSpec>> {
    registry
        .option_exercise(
            &request.market_id,
            &request.holder_account_id,
            &request.assigned_account_id,
            request.size,
        )
        .map(Json)
}

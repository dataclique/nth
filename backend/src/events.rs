//! Typed models of every on-chain event the platform indexes, decoded from
//! Sui RPC event JSON.
//!
//! On-chain event structs carry only primitive fields (`u64` / `bool` / `ID`)
//! by design — their BCS/JSON layout is the external serialization contract.
//! Sui's JSON-RPC renders `u64` as a decimal string and `ID` as a `0x` hex
//! string; the flexible deserializers here accept both string and number
//! encodings so fixtures and RPC output decode identically.
//!
//! All prices, sizes, and USDC amounts are fixed-point integers at the shared
//! `10^6` scale documented in `docs/float_scaling.md`.

use serde::de::Error as DeError;
use serde::{Deserialize, Deserializer, Serialize};

/// A Sui object ID as a `0x`-prefixed hex string.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ObjectId(pub String);

/// One decoded on-chain event with its chain coordinates.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct ChainEvent {
    pub tx_digest: String,
    pub event_seq: u64,
    pub timestamp_ms: u64,
    pub kind: EventKind,
}

/// Every event family the indexer understands.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(tag = "family", rename_all = "snake_case")]
pub enum EventKind {
    Kernel(KernelEvent),
    Perp(PerpEvent),
    Option(OptionEvent),
    Vault(VaultEvent),
}

/// Primitive kernel events shared by every instrument market.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum KernelEvent {
    MarketCreated(MarketCreated),
    OrderRested(OrderRested),
    OrderFilled(OrderFilled),
    OrderCanceled(OrderCanceled),
    CollateralDeposited(CollateralFlow),
    CollateralWithdrawn(CollateralFlow),
    ClaimIssued(ClaimFlow),
    ClaimRedeemed(ClaimFlow),
    CarryApplied(CarryApplied),
    MarketTerminated(MarketTerminated),
    PositionChanged(PositionChanged),
    PositionSettled(PositionSettled),
    PositionForceReduced(PositionForceReduced),
    PeriodClaimed(PeriodClaimed),
}

/// Perpetual-package events.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum PerpEvent {
    PerpMarketCreated(PerpMarketCreated),
    MarkPriceUpdated(PriceUpdated),
    FundingRoundSettled(FundingRoundSettled),
    FundingSettled(FundingSettled),
    PositionLiquidated(PositionLiquidated),
}

/// Options-package events, shared by the European, American, and cliquet
/// modules; `module` records which one emitted it.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum OptionEvent {
    MarketCreated(OptionMarketCreated),
    UnderlyingPriceUpdated(PriceUpdated),
    PremiumPaid(PremiumPaid),
    OptionExercised(OptionExercised),
    SettlementBound(SettlementBound),
    StrikeReset(StrikeReset),
}

/// Funds-package events.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum VaultEvent {
    VaultCreated(VaultCreated),
    VaultDeposited(VaultDeposited),
    VaultRedeemed(VaultRedeemed),
    SharesTraded(SharesTraded),
    SharesBurned(SharesBurned),
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MarketCreated {
    pub market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub version: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OrderRested {
    pub market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub order_id: u64,
    pub margin_account_id: ObjectId,
    pub is_bid: bool,
    #[serde(deserialize_with = "u64_flex")]
    pub price: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub remaining_size: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OrderFilled {
    pub market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub maker_order_id: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub taker_order_id: u64,
    pub maker_margin_account_id: ObjectId,
    pub taker_margin_account_id: ObjectId,
    pub maker_is_bid: bool,
    #[serde(deserialize_with = "u64_flex")]
    pub price: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub size: u64,
    pub maker_fully_filled: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OrderCanceled {
    pub market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub order_id: u64,
    pub margin_account_id: ObjectId,
    pub is_bid: bool,
    #[serde(deserialize_with = "u64_flex")]
    pub remaining_size: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CollateralFlow {
    pub market_id: ObjectId,
    pub margin_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub amount: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ClaimFlow {
    pub market_id: ObjectId,
    pub margin_account_id: ObjectId,
    #[serde(default, deserialize_with = "u64_flex_opt")]
    pub issued_size: Option<u64>,
    #[serde(default, deserialize_with = "u64_flex_opt")]
    pub redeemed_size: Option<u64>,
    #[serde(deserialize_with = "u64_flex")]
    pub collateral_amount: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CarryApplied {
    pub market_id: ObjectId,
    pub from_account_id: ObjectId,
    pub to_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub amount: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub period: u64,
    pub from_position: bool,
    pub to_position: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MarketTerminated {
    pub market_id: ObjectId,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PositionChanged {
    pub market_id: ObjectId,
    pub account_id: ObjectId,
    pub is_buy: bool,
    pub previous_state: u8,
    #[serde(deserialize_with = "u64_flex")]
    pub previous_size: u64,
    pub current_state: u8,
    #[serde(deserialize_with = "u64_flex")]
    pub current_size: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PositionSettled {
    pub market_id: ObjectId,
    pub margin_account_id: ObjectId,
    pub previous_state: u8,
    #[serde(deserialize_with = "u64_flex")]
    pub previous_size: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub released_collateral: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PositionForceReduced {
    pub market_id: ObjectId,
    pub margin_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub reduced_size: u64,
    pub current_state: u8,
    #[serde(deserialize_with = "u64_flex")]
    pub current_size: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub released_collateral: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PeriodClaimed {
    pub market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub kind: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub period: u64,
    pub keeper_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub reward: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PerpMarketCreated {
    pub market_id: ObjectId,
    pub kernel_market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub maintenance_margin_rate_percent: u64,
}

/// Shared shape of `MarkPriceUpdated` and `UnderlyingPriceUpdated`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PriceUpdated {
    pub market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub price: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub timestamp_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FundingRoundSettled {
    pub market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub period: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub rate_bps: u64,
    pub longs_pay: bool,
    #[serde(deserialize_with = "u64_flex")]
    pub mark_price: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FundingSettled {
    pub market_id: ObjectId,
    pub margin_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub paid: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub received: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PositionLiquidated {
    pub market_id: ObjectId,
    pub margin_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub size: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub entry_price: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub mark_price: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub penalty: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub released_collateral: u64,
}

/// Which options module a market belongs to.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OptionStyle {
    European,
    American,
    Cliquet,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct OptionMarketCreated {
    pub style: OptionStyle,
    pub market_id: ObjectId,
    pub kernel_market_id: ObjectId,
    /// Strike for vanilla options; the initial strike for a cliquet.
    pub strike: u64,
    /// Expiry for vanilla options; `None` for a cliquet (schedule-driven).
    pub expiry_ms: Option<u64>,
    /// Per-unit payout cap for vanilla options; per-period cap for a cliquet.
    pub cap: u64,
    pub settlement_reserve: ObjectId,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PremiumPaid {
    pub market_id: ObjectId,
    pub buyer_account_id: ObjectId,
    pub seller_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub premium: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub size: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OptionExercised {
    pub market_id: ObjectId,
    pub holder_account_id: ObjectId,
    pub assigned_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub size: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub underlying_price: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub payoff_per_unit: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SettlementBound {
    pub market_id: ObjectId,
    #[serde(default, deserialize_with = "u64_flex_opt")]
    pub underlying_price: Option<u64>,
    #[serde(deserialize_with = "u64_flex")]
    pub payoff_per_unit: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StrikeReset {
    pub market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub period: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub underlying_price: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub gain_per_unit: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub new_strike: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub accrued_payoff_per_unit: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct VaultCreated {
    pub market_id: ObjectId,
    pub kernel_market_id: ObjectId,
    pub manager_fee_account: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub deposit_fee_bps: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub max_order_notional: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub max_open_orders: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct VaultDeposited {
    pub market_id: ObjectId,
    pub margin_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub amount: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub fee: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub shares: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub nav_before: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct VaultRedeemed {
    pub market_id: ObjectId,
    pub margin_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub shares: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub value: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SharesTraded {
    pub market_id: ObjectId,
    pub buyer_account_id: ObjectId,
    pub seller_account_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub premium: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub size: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SharesBurned {
    pub market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    pub size: u64,
    #[serde(deserialize_with = "u64_flex")]
    pub premium: u64,
}

/// Errors decoding one Sui RPC event payload.
#[derive(Debug, thiserror::Error)]
pub enum DecodeError {
    #[error("malformed event type string: {0}")]
    MalformedType(String),
    #[error("payload for {event}: {source}")]
    Payload {
        event: String,
        source: serde_json::Error,
    },
}

/// Decode one event by its full Move type string (`0xPKG::module::Name`)
/// and its `parsedJson` payload. Returns `Ok(None)` for event types the
/// platform does not track.
pub fn decode_event(
    event_type: &str,
    payload: &serde_json::Value,
) -> Result<Option<EventKind>, DecodeError> {
    let mut segments = event_type.splitn(3, "::");
    let _package = segments
        .next()
        .ok_or_else(|| DecodeError::MalformedType(event_type.to_string()))?;
    let module = segments
        .next()
        .ok_or_else(|| DecodeError::MalformedType(event_type.to_string()))?;
    let name_with_generics = segments
        .next()
        .ok_or_else(|| DecodeError::MalformedType(event_type.to_string()))?;
    let name = name_with_generics
        .split('<')
        .next()
        .unwrap_or(name_with_generics);

    fn parse<T: for<'de> Deserialize<'de>>(
        event: &str,
        payload: &serde_json::Value,
    ) -> Result<T, DecodeError> {
        serde_json::from_value(payload.clone()).map_err(|source| DecodeError::Payload {
            event: event.to_string(),
            source,
        })
    }

    let kind = match (module, name) {
        ("instrument_market", "MarketCreated") => {
            EventKind::Kernel(KernelEvent::MarketCreated(parse(name, payload)?))
        }
        ("matching", "OrderRested") => {
            EventKind::Kernel(KernelEvent::OrderRested(parse(name, payload)?))
        }
        ("matching", "OrderFilled") => {
            EventKind::Kernel(KernelEvent::OrderFilled(parse(name, payload)?))
        }
        ("matching", "OrderCanceled") => {
            EventKind::Kernel(KernelEvent::OrderCanceled(parse(name, payload)?))
        }
        ("collateral", "CollateralDeposited") => {
            EventKind::Kernel(KernelEvent::CollateralDeposited(parse(name, payload)?))
        }
        ("collateral", "CollateralWithdrawn") => {
            EventKind::Kernel(KernelEvent::CollateralWithdrawn(parse(name, payload)?))
        }
        ("instrument_market", "ClaimIssued") => {
            EventKind::Kernel(KernelEvent::ClaimIssued(parse(name, payload)?))
        }
        ("instrument_market", "ClaimRedeemed") => {
            EventKind::Kernel(KernelEvent::ClaimRedeemed(parse(name, payload)?))
        }
        ("instrument_market", "CarryApplied") => {
            EventKind::Kernel(KernelEvent::CarryApplied(parse(name, payload)?))
        }
        ("instrument_market", "MarketTerminated") => {
            EventKind::Kernel(KernelEvent::MarketTerminated(parse(name, payload)?))
        }
        ("position", "PositionChanged") => {
            EventKind::Kernel(KernelEvent::PositionChanged(parse(name, payload)?))
        }
        ("instrument_market", "PositionSettled") => {
            EventKind::Kernel(KernelEvent::PositionSettled(parse(name, payload)?))
        }
        ("instrument_market", "PositionForceReduced") => {
            EventKind::Kernel(KernelEvent::PositionForceReduced(parse(name, payload)?))
        }
        ("maintenance", "PeriodClaimed") => {
            EventKind::Kernel(KernelEvent::PeriodClaimed(parse(name, payload)?))
        }
        ("perp", "PerpMarketCreated") => {
            EventKind::Perp(PerpEvent::PerpMarketCreated(parse(name, payload)?))
        }
        ("perp", "MarkPriceUpdated") => {
            EventKind::Perp(PerpEvent::MarkPriceUpdated(parse(name, payload)?))
        }
        ("perp", "FundingRoundSettled") => {
            EventKind::Perp(PerpEvent::FundingRoundSettled(parse(name, payload)?))
        }
        ("perp", "FundingSettled") => {
            EventKind::Perp(PerpEvent::FundingSettled(parse(name, payload)?))
        }
        ("perp", "PositionLiquidated") => {
            EventKind::Perp(PerpEvent::PositionLiquidated(parse(name, payload)?))
        }
        ("european", "EuropeanMarketCreated") => EventKind::Option(OptionEvent::MarketCreated(
            vanilla_market_created(OptionStyle::European, name, payload)?,
        )),
        ("american", "AmericanMarketCreated") => EventKind::Option(OptionEvent::MarketCreated(
            vanilla_market_created(OptionStyle::American, name, payload)?,
        )),
        ("cliquet", "CliquetMarketCreated") => {
            let raw: CliquetCreatedRaw = parse(name, payload)?;
            EventKind::Option(OptionEvent::MarketCreated(OptionMarketCreated {
                style: OptionStyle::Cliquet,
                market_id: raw.market_id,
                kernel_market_id: raw.kernel_market_id,
                strike: raw.initial_strike,
                expiry_ms: None,
                cap: raw.local_cap,
                settlement_reserve: raw.settlement_reserve,
            }))
        }
        ("european", "UnderlyingPriceUpdated")
        | ("american", "UnderlyingPriceUpdated")
        | ("cliquet", "UnderlyingPriceUpdated") => {
            EventKind::Option(OptionEvent::UnderlyingPriceUpdated(parse(name, payload)?))
        }
        ("european", "PremiumPaid") | ("american", "PremiumPaid") | ("cliquet", "PremiumPaid") => {
            EventKind::Option(OptionEvent::PremiumPaid(parse(name, payload)?))
        }
        ("american", "OptionExercised") => {
            EventKind::Option(OptionEvent::OptionExercised(parse(name, payload)?))
        }
        ("european", "SettlementBound")
        | ("american", "SettlementBound")
        | ("cliquet", "SettlementBound") => {
            EventKind::Option(OptionEvent::SettlementBound(parse(name, payload)?))
        }
        ("cliquet", "StrikeReset") => {
            EventKind::Option(OptionEvent::StrikeReset(parse(name, payload)?))
        }
        ("vault", "VaultCreated") => {
            EventKind::Vault(VaultEvent::VaultCreated(parse(name, payload)?))
        }
        ("vault", "VaultDeposited") => {
            EventKind::Vault(VaultEvent::VaultDeposited(parse(name, payload)?))
        }
        ("vault", "VaultRedeemed") => {
            EventKind::Vault(VaultEvent::VaultRedeemed(parse(name, payload)?))
        }
        ("vault", "SharesTraded") => {
            EventKind::Vault(VaultEvent::SharesTraded(parse(name, payload)?))
        }
        ("vault", "SharesBurned") => {
            EventKind::Vault(VaultEvent::SharesBurned(parse(name, payload)?))
        }
        _ => return Ok(None),
    };
    Ok(Some(kind))
}

#[derive(Deserialize)]
struct VanillaCreatedRaw {
    market_id: ObjectId,
    kernel_market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    strike: u64,
    #[serde(deserialize_with = "u64_flex")]
    expiry_ms: u64,
    #[serde(deserialize_with = "u64_flex")]
    payout_cap: u64,
    settlement_reserve: ObjectId,
}

#[derive(Deserialize)]
struct CliquetCreatedRaw {
    market_id: ObjectId,
    kernel_market_id: ObjectId,
    #[serde(deserialize_with = "u64_flex")]
    initial_strike: u64,
    #[serde(deserialize_with = "u64_flex")]
    local_cap: u64,
    settlement_reserve: ObjectId,
}

fn vanilla_market_created(
    style: OptionStyle,
    event: &str,
    payload: &serde_json::Value,
) -> Result<OptionMarketCreated, DecodeError> {
    let raw: VanillaCreatedRaw =
        serde_json::from_value(payload.clone()).map_err(|source| DecodeError::Payload {
            event: event.to_string(),
            source,
        })?;
    Ok(OptionMarketCreated {
        style,
        market_id: raw.market_id,
        kernel_market_id: raw.kernel_market_id,
        strike: raw.strike,
        expiry_ms: Some(raw.expiry_ms),
        cap: raw.payout_cap,
        settlement_reserve: raw.settlement_reserve,
    })
}

/// Accept a `u64` rendered as either a JSON number or a decimal string —
/// Sui's JSON-RPC uses strings for `u64`.
fn u64_flex<'de, D: Deserializer<'de>>(deserializer: D) -> Result<u64, D::Error> {
    #[derive(Deserialize)]
    #[serde(untagged)]
    enum Flex {
        Number(u64),
        Text(String),
    }
    match Flex::deserialize(deserializer)? {
        Flex::Number(value) => Ok(value),
        Flex::Text(text) => text.parse().map_err(DeError::custom),
    }
}

fn u64_flex_opt<'de, D: Deserializer<'de>>(deserializer: D) -> Result<Option<u64>, D::Error> {
    #[derive(Deserialize)]
    #[serde(untagged)]
    enum Flex {
        Number(u64),
        Text(String),
    }
    match Option::<Flex>::deserialize(deserializer)? {
        None => Ok(None),
        Some(Flex::Number(value)) => Ok(Some(value)),
        Some(Flex::Text(text)) => text.parse().map(Some).map_err(DeError::custom),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn decodes_order_filled_with_string_u64s() {
        let payload = json!({
            "schema_version": 1,
            "market_id": "0xabc",
            "maker_order_id": "7",
            "taker_order_id": "9",
            "maker_margin_account_id": "0x1",
            "taker_margin_account_id": "0x2",
            "maker_reservation_id": "3",
            "taker_reservation_id": "4",
            "maker_is_bid": false,
            "price": "100000000",
            "size": "2000000",
            "maker_fully_filled": true,
        });
        let decoded = decode_event("0xdead::matching::OrderFilled<0xdead::x::Y>", &payload)
            .expect("decode")
            .expect("tracked");
        match decoded {
            EventKind::Kernel(KernelEvent::OrderFilled(fill)) => {
                assert_eq!(fill.maker_order_id, 7);
                assert_eq!(fill.price, 100_000_000);
                assert_eq!(fill.size, 2_000_000);
                assert!(fill.maker_fully_filled);
                assert!(!fill.maker_is_bid);
            }
            other => panic!("wrong variant: {other:?}"),
        }
    }

    #[test]
    fn decodes_order_rested_with_numeric_u64s() {
        let payload = json!({
            "schema_version": 1,
            "market_id": "0xabc",
            "order_id": 12,
            "margin_account_id": "0x1",
            "reservation_id": 5,
            "is_bid": true,
            "price": 99_000_000u64,
            "remaining_size": 1_000_000u64,
        });
        let decoded = decode_event("0xdead::matching::OrderRested<0xdead::x::Y>", &payload)
            .expect("decode")
            .expect("tracked");
        match decoded {
            EventKind::Kernel(KernelEvent::OrderRested(rested)) => {
                assert_eq!(rested.order_id, 12);
                assert!(rested.is_bid);
                assert_eq!(rested.remaining_size, 1_000_000);
            }
            other => panic!("wrong variant: {other:?}"),
        }
    }

    #[test]
    fn decodes_each_option_style_into_one_created_shape() {
        let european = json!({
            "schema_version": 1,
            "market_id": "0xe",
            "kernel_market_id": "0xk",
            "strike": "100000000",
            "expiry_ms": "10000",
            "payout_cap": "50000000",
            "settlement_reserve": "0xr",
        });
        let decoded = decode_event("0xd::european::EuropeanMarketCreated", &european)
            .expect("decode")
            .expect("tracked");
        match decoded {
            EventKind::Option(OptionEvent::MarketCreated(created)) => {
                assert_eq!(created.style, OptionStyle::European);
                assert_eq!(created.expiry_ms, Some(10_000));
                assert_eq!(created.cap, 50_000_000);
            }
            other => panic!("wrong variant: {other:?}"),
        }

        let cliquet = json!({
            "schema_version": 1,
            "market_id": "0xc",
            "kernel_market_id": "0xk",
            "initial_strike": "100000000",
            "local_cap": "20000000",
            "periods": "3",
            "period_interval_ms": "1000",
            "settlement_reserve": "0xr",
        });
        let decoded = decode_event("0xd::cliquet::CliquetMarketCreated", &cliquet)
            .expect("decode")
            .expect("tracked");
        match decoded {
            EventKind::Option(OptionEvent::MarketCreated(created)) => {
                assert_eq!(created.style, OptionStyle::Cliquet);
                assert_eq!(created.expiry_ms, None);
                assert_eq!(created.cap, 20_000_000);
            }
            other => panic!("wrong variant: {other:?}"),
        }
    }

    #[test]
    fn decodes_funding_and_liquidation_events() {
        let round = json!({
            "schema_version": 1,
            "market_id": "0xp",
            "period": "3",
            "rate_bps": "100",
            "longs_pay": true,
            "mark_price": "100000000",
        });
        let decoded = decode_event("0xd::perp::FundingRoundSettled", &round)
            .expect("decode")
            .expect("tracked");
        assert!(matches!(
            decoded,
            EventKind::Perp(PerpEvent::FundingRoundSettled(FundingRoundSettled {
                period: 3,
                rate_bps: 100,
                longs_pay: true,
                ..
            }))
        ));

        let liquidation = json!({
            "schema_version": 1,
            "market_id": "0xp",
            "margin_account_id": "0xa",
            "size": "2000000",
            "entry_price": "100000000",
            "mark_price": "75000000",
            "penalty": "5000000",
            "released_collateral": "95000000",
        });
        let decoded = decode_event("0xd::perp::PositionLiquidated", &liquidation)
            .expect("decode")
            .expect("tracked");
        assert!(matches!(
            decoded,
            EventKind::Perp(PerpEvent::PositionLiquidated(PositionLiquidated {
                penalty: 5_000_000,
                ..
            }))
        ));
    }

    #[test]
    fn decodes_vault_lifecycle_events() {
        let deposited = json!({
            "schema_version": 1,
            "market_id": "0xv",
            "margin_account_id": "0xa",
            "amount": "100000000",
            "fee": "1000000",
            "shares": "98999000",
            "nav_before": "0",
        });
        let decoded = decode_event("0xd::vault::VaultDeposited", &deposited)
            .expect("decode")
            .expect("tracked");
        assert!(matches!(
            decoded,
            EventKind::Vault(VaultEvent::VaultDeposited(VaultDeposited {
                shares: 98_999_000,
                ..
            }))
        ));
    }

    #[test]
    fn untracked_event_types_decode_to_none() {
        let decoded =
            decode_event("0xd::somewhere::Else", &json!({})).expect("decode should not error");
        assert!(decoded.is_none());
    }

    #[test]
    fn malformed_type_strings_error() {
        assert!(decode_event("nonsense", &json!({})).is_err());
    }
}

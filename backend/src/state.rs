//! In-memory market-data projections built by folding decoded chain events.
//!
//! The indexer persists raw events durably and replays them through
//! [`Platform::apply`] on boot, so every projection here is derived state:
//! order books, trades, candles, positions, balances, funding and carry
//! history, and the instrument registry. All quantities keep the on-chain
//! `10^6` fixed-point scale; the API serves them verbatim and clients
//! rescale for display.

use crate::events::*;
use serde::Serialize;
use std::collections::{BTreeMap, HashMap};

/// Candle bucket width in milliseconds (1 minute base resolution).
pub const CANDLE_INTERVAL_MS: u64 = 60_000;

/// How a market is implemented, for the instrument registry.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(tag = "instrument", rename_all = "snake_case")]
pub enum InstrumentInfo {
    /// A kernel market not (yet) claimed by a known instrument package.
    Unknown,
    Perpetual {
        maintenance_margin_rate_percent: u64,
    },
    Option {
        style: OptionStyle,
        strike: u64,
        expiry_ms: Option<u64>,
        cap: u64,
    },
    Vault {
        deposit_fee_bps: u64,
        max_order_notional: u64,
        max_open_orders: u64,
    },
}

/// Risk label surfaced by the registry. The API can label and filter by
/// default; it cannot delist anything from the chain.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum RiskLabel {
    /// Instrument package known to this deployment's registry.
    Reference,
    /// Permissionless market from an unknown package — hidden by default.
    Unranked,
}

/// One price level of a book side.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct BookLevel {
    pub price: u64,
    pub size: u64,
}

/// One executed trade at the maker's price.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Trade {
    pub timestamp_ms: u64,
    pub price: u64,
    pub size: u64,
    pub maker_is_bid: bool,
    pub tx_digest: String,
}

/// One OHLCV candle at [`CANDLE_INTERVAL_MS`] resolution.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Candle {
    pub open_ms: u64,
    pub open: u64,
    pub high: u64,
    pub low: u64,
    pub close: u64,
    pub volume: u64,
}

/// Net exposure direction as reported by kernel state codes.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Exposure {
    Flat,
    Long,
    Short,
}

/// One account's projected state in one market.
#[derive(Debug, Clone, PartialEq, Serialize, Default)]
pub struct AccountState {
    pub free_collateral: u64,
    pub position_collateral: u64,
    pub position_size: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exposure: Option<Exposure>,
}

/// One funding or carry flow, kept as history.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct CarryRecord {
    pub timestamp_ms: u64,
    pub from_account_id: ObjectId,
    pub to_account_id: ObjectId,
    pub amount: u64,
    pub period: u64,
}

/// One settled funding round.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct FundingRound {
    pub timestamp_ms: u64,
    pub period: u64,
    pub rate_bps: u64,
    pub longs_pay: bool,
    pub mark_price: u64,
}

/// Full projected state of one market.
#[derive(Debug, Clone, Serialize)]
pub struct MarketState {
    pub market_id: ObjectId,
    pub instrument: InstrumentInfo,
    pub risk_label: RiskLabel,
    pub terminal: bool,
    /// Latest instrument-reported reference price (mark or underlying).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference_price: Option<u64>,
    /// Bids keyed by price; served highest-first.
    #[serde(skip)]
    pub bids: BTreeMap<u64, u64>,
    /// Asks keyed by price; served lowest-first.
    #[serde(skip)]
    pub asks: BTreeMap<u64, u64>,
    #[serde(skip)]
    pub resting_orders: HashMap<u64, RestingOrder>,
    #[serde(skip)]
    pub trades: Vec<Trade>,
    #[serde(skip)]
    pub candles: BTreeMap<u64, Candle>,
    #[serde(skip)]
    pub accounts: HashMap<ObjectId, AccountState>,
    #[serde(skip)]
    pub carry_history: Vec<CarryRecord>,
    #[serde(skip)]
    pub funding_rounds: Vec<FundingRound>,
    /// Sum of open long exposure, at the `10^6` scale.
    pub open_interest: u64,
}

/// One resting order tracked for book maintenance.
#[derive(Debug, Clone, PartialEq)]
pub struct RestingOrder {
    pub is_bid: bool,
    pub price: u64,
    pub remaining_size: u64,
}

/// The whole indexed platform: every market keyed by kernel market ID.
#[derive(Debug, Default)]
pub struct Platform {
    pub markets: HashMap<ObjectId, MarketState>,
    /// Wrapper-object → kernel-market aliases from instrument creation
    /// events, so instrument events (keyed by wrapper ID) resolve to the
    /// kernel market they describe.
    aliases: HashMap<ObjectId, ObjectId>,
}

impl Platform {
    /// Fold one decoded chain event into the projections. Unknown markets
    /// materialize on first sight so replay order never matters more than
    /// the chain's own event order.
    pub fn apply(&mut self, event: &ChainEvent) {
        match &event.kind {
            EventKind::Kernel(kernel) => self.apply_kernel(event, kernel),
            EventKind::Perp(perp) => self.apply_perp(event, perp),
            EventKind::Option(option) => self.apply_option(event, option),
            EventKind::Vault(vault) => self.apply_vault(event, vault),
        }
    }

    /// Immutable view of one market by kernel ID or wrapper alias.
    pub fn market(&self, id: &ObjectId) -> Option<&MarketState> {
        let resolved = self.aliases.get(id).unwrap_or(id);
        self.markets.get(resolved)
    }

    fn market_mut(&mut self, id: &ObjectId) -> &mut MarketState {
        let resolved = self.aliases.get(id).cloned().unwrap_or_else(|| id.clone());
        self.markets
            .entry(resolved.clone())
            .or_insert_with(|| MarketState::new(resolved))
    }

    fn alias(&mut self, wrapper: &ObjectId, kernel: &ObjectId) {
        self.aliases.insert(wrapper.clone(), kernel.clone());
    }

    fn apply_kernel(&mut self, event: &ChainEvent, kernel: &KernelEvent) {
        match kernel {
            KernelEvent::MarketCreated(created) => {
                self.market_mut(&created.market_id);
            }
            KernelEvent::OrderRested(rested) => {
                let market = self.market_mut(&rested.market_id);
                market.resting_orders.insert(
                    rested.order_id,
                    RestingOrder {
                        is_bid: rested.is_bid,
                        price: rested.price,
                        remaining_size: rested.remaining_size,
                    },
                );
                let side = if rested.is_bid {
                    &mut market.bids
                } else {
                    &mut market.asks
                };
                *side.entry(rested.price).or_insert(0) += rested.remaining_size;
            }
            KernelEvent::OrderFilled(filled) => {
                let market = self.market_mut(&filled.market_id);
                market.reduce_resting(filled.maker_order_id, filled.size);
                market.trades.push(Trade {
                    timestamp_ms: event.timestamp_ms,
                    price: filled.price,
                    size: filled.size,
                    maker_is_bid: filled.maker_is_bid,
                    tx_digest: event.tx_digest.clone(),
                });
                market.fold_candle(event.timestamp_ms, filled.price, filled.size);
            }
            KernelEvent::OrderCanceled(canceled) => {
                let market = self.market_mut(&canceled.market_id);
                market.remove_resting(canceled.order_id);
            }
            KernelEvent::CollateralDeposited(flow) => {
                let account = self.account_mut(&flow.market_id, &flow.margin_account_id);
                account.free_collateral += flow.amount;
            }
            KernelEvent::CollateralWithdrawn(flow) => {
                let account = self.account_mut(&flow.market_id, &flow.margin_account_id);
                account.free_collateral = account.free_collateral.saturating_sub(flow.amount);
            }
            KernelEvent::ClaimIssued(claim) => {
                let account = self.account_mut(&claim.market_id, &claim.margin_account_id);
                account.free_collateral = account
                    .free_collateral
                    .saturating_sub(claim.collateral_amount);
                account.position_collateral += claim.collateral_amount;
                account.position_size += claim.issued_size.unwrap_or(0);
                account.exposure = Some(Exposure::Long);
            }
            KernelEvent::ClaimRedeemed(claim) => {
                let account = self.account_mut(&claim.market_id, &claim.margin_account_id);
                account.position_collateral = account
                    .position_collateral
                    .saturating_sub(claim.collateral_amount);
                account.free_collateral += claim.collateral_amount;
                account.position_size = account
                    .position_size
                    .saturating_sub(claim.redeemed_size.unwrap_or(0));
                if account.position_size == 0 {
                    account.exposure = Some(Exposure::Flat);
                }
            }
            KernelEvent::CarryApplied(carry) => {
                {
                    let from = self.account_mut(&carry.market_id, &carry.from_account_id);
                    if carry.from_position {
                        from.position_collateral =
                            from.position_collateral.saturating_sub(carry.amount);
                    } else {
                        from.free_collateral = from.free_collateral.saturating_sub(carry.amount);
                    }
                }
                {
                    let to = self.account_mut(&carry.market_id, &carry.to_account_id);
                    if carry.to_position {
                        to.position_collateral += carry.amount;
                    } else {
                        to.free_collateral += carry.amount;
                    }
                }
                let market = self.market_mut(&carry.market_id);
                market.carry_history.push(CarryRecord {
                    timestamp_ms: event.timestamp_ms,
                    from_account_id: carry.from_account_id.clone(),
                    to_account_id: carry.to_account_id.clone(),
                    amount: carry.amount,
                    period: carry.period,
                });
            }
            KernelEvent::MarketTerminated(terminated) => {
                self.market_mut(&terminated.market_id).terminal = true;
            }
            KernelEvent::PositionSettled(settled) => {
                let account = self.account_mut(&settled.market_id, &settled.margin_account_id);
                account.position_collateral = 0;
                account.free_collateral += settled.released_collateral;
                account.position_size = 0;
                account.exposure = Some(Exposure::Flat);
            }
            KernelEvent::PositionForceReduced(reduced) => {
                let account = self.account_mut(&reduced.market_id, &reduced.margin_account_id);
                account.position_collateral = account
                    .position_collateral
                    .saturating_sub(reduced.released_collateral);
                account.free_collateral += reduced.released_collateral;
                account.position_size = reduced.current_size;
                account.exposure = Some(match reduced.current_state {
                    1 => Exposure::Long,
                    2 => Exposure::Short,
                    _ => Exposure::Flat,
                });
            }
            KernelEvent::PeriodClaimed(_) => {}
        }
    }

    fn apply_perp(&mut self, event: &ChainEvent, perp: &PerpEvent) {
        match perp {
            PerpEvent::PerpMarketCreated(created) => {
                self.alias(&created.market_id, &created.kernel_market_id);
                let market = self.market_mut(&created.kernel_market_id);
                market.instrument = InstrumentInfo::Perpetual {
                    maintenance_margin_rate_percent: created.maintenance_margin_rate_percent,
                };
                market.risk_label = RiskLabel::Reference;
            }
            PerpEvent::MarkPriceUpdated(update) => {
                self.market_mut(&update.market_id).reference_price = Some(update.price);
            }
            PerpEvent::FundingRoundSettled(round) => {
                let market = self.market_mut(&round.market_id);
                market.funding_rounds.push(FundingRound {
                    timestamp_ms: event.timestamp_ms,
                    period: round.period,
                    rate_bps: round.rate_bps,
                    longs_pay: round.longs_pay,
                    mark_price: round.mark_price,
                });
            }
            PerpEvent::FundingSettled(_) => {}
            PerpEvent::PositionLiquidated(_) => {}
        }
    }

    fn apply_option(&mut self, _event: &ChainEvent, option: &OptionEvent) {
        match option {
            OptionEvent::MarketCreated(created) => {
                self.alias(&created.market_id, &created.kernel_market_id);
                let market = self.market_mut(&created.kernel_market_id);
                market.instrument = InstrumentInfo::Option {
                    style: created.style,
                    strike: created.strike,
                    expiry_ms: created.expiry_ms,
                    cap: created.cap,
                };
                market.risk_label = RiskLabel::Reference;
            }
            OptionEvent::UnderlyingPriceUpdated(update) => {
                self.market_mut(&update.market_id).reference_price = Some(update.price);
            }
            OptionEvent::StrikeReset(reset) => {
                let market = self.market_mut(&reset.market_id);
                if let InstrumentInfo::Option { strike, .. } = &mut market.instrument {
                    *strike = reset.new_strike;
                }
            }
            OptionEvent::PremiumPaid(_)
            | OptionEvent::OptionExercised(_)
            | OptionEvent::SettlementBound(_) => {}
        }
    }

    fn apply_vault(&mut self, _event: &ChainEvent, vault: &VaultEvent) {
        match vault {
            VaultEvent::VaultCreated(created) => {
                self.alias(&created.market_id, &created.kernel_market_id);
                let market = self.market_mut(&created.kernel_market_id);
                market.instrument = InstrumentInfo::Vault {
                    deposit_fee_bps: created.deposit_fee_bps,
                    max_order_notional: created.max_order_notional,
                    max_open_orders: created.max_open_orders,
                };
                market.risk_label = RiskLabel::Reference;
            }
            VaultEvent::VaultDeposited(_)
            | VaultEvent::VaultRedeemed(_)
            | VaultEvent::SharesTraded(_)
            | VaultEvent::SharesBurned(_) => {}
        }
    }

    fn account_mut(&mut self, market_id: &ObjectId, account_id: &ObjectId) -> &mut AccountState {
        self.market_mut(market_id)
            .accounts
            .entry(account_id.clone())
            .or_default()
    }
}

impl MarketState {
    fn new(market_id: ObjectId) -> Self {
        MarketState {
            market_id,
            instrument: InstrumentInfo::Unknown,
            risk_label: RiskLabel::Unranked,
            terminal: false,
            reference_price: None,
            bids: BTreeMap::new(),
            asks: BTreeMap::new(),
            resting_orders: HashMap::new(),
            trades: Vec::new(),
            candles: BTreeMap::new(),
            accounts: HashMap::new(),
            carry_history: Vec::new(),
            funding_rounds: Vec::new(),
            open_interest: 0,
        }
    }

    /// Book snapshot: bids highest-first, asks lowest-first, both truncated
    /// to `depth` levels.
    pub fn book_snapshot(&self, depth: usize) -> (Vec<BookLevel>, Vec<BookLevel>) {
        let bids = self
            .bids
            .iter()
            .rev()
            .take(depth)
            .map(|(price, size)| BookLevel {
                price: *price,
                size: *size,
            })
            .collect();
        let asks = self
            .asks
            .iter()
            .take(depth)
            .map(|(price, size)| BookLevel {
                price: *price,
                size: *size,
            })
            .collect();
        (bids, asks)
    }

    fn fold_candle(&mut self, timestamp_ms: u64, price: u64, size: u64) {
        let open_ms = timestamp_ms - (timestamp_ms % CANDLE_INTERVAL_MS);
        let candle = self.candles.entry(open_ms).or_insert(Candle {
            open_ms,
            open: price,
            high: price,
            low: price,
            close: price,
            volume: 0,
        });
        candle.high = candle.high.max(price);
        candle.low = candle.low.min(price);
        candle.close = price;
        candle.volume += size;
    }

    fn reduce_resting(&mut self, order_id: u64, size: u64) {
        if let Some(order) = self.resting_orders.get_mut(&order_id) {
            let reduced = order.remaining_size.min(size);
            order.remaining_size -= reduced;
            let (is_bid, price, empty) = (order.is_bid, order.price, order.remaining_size == 0);
            let side = if is_bid {
                &mut self.bids
            } else {
                &mut self.asks
            };
            if let Some(level) = side.get_mut(&price) {
                *level = level.saturating_sub(reduced);
                if *level == 0 {
                    side.remove(&price);
                }
            }
            if empty {
                self.resting_orders.remove(&order_id);
            }
        }
    }

    fn remove_resting(&mut self, order_id: u64) {
        if let Some(order) = self.resting_orders.remove(&order_id) {
            let side = if order.is_bid {
                &mut self.bids
            } else {
                &mut self.asks
            };
            if let Some(level) = side.get_mut(&order.price) {
                *level = level.saturating_sub(order.remaining_size);
                if *level == 0 {
                    side.remove(&order.price);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn id(text: &str) -> ObjectId {
        ObjectId(text.to_string())
    }

    fn at(timestamp_ms: u64, kind: EventKind) -> ChainEvent {
        ChainEvent {
            tx_digest: "digest".to_string(),
            event_seq: 0,
            timestamp_ms,
            kind,
        }
    }

    fn rested(market: &str, order_id: u64, is_bid: bool, price: u64, size: u64) -> EventKind {
        EventKind::Kernel(KernelEvent::OrderRested(OrderRested {
            market_id: id(market),
            order_id,
            margin_account_id: id("0xa"),
            is_bid,
            price,
            remaining_size: size,
        }))
    }

    fn filled(market: &str, maker_order_id: u64, price: u64, size: u64) -> EventKind {
        EventKind::Kernel(KernelEvent::OrderFilled(OrderFilled {
            market_id: id(market),
            maker_order_id,
            taker_order_id: 99,
            maker_margin_account_id: id("0xa"),
            taker_margin_account_id: id("0xb"),
            maker_is_bid: false,
            price,
            size,
            maker_fully_filled: false,
        }))
    }

    #[test]
    fn book_levels_track_rests_fills_and_cancels() {
        let mut platform = Platform::default();
        platform.apply(&at(0, rested("0xm", 1, false, 100, 10)));
        platform.apply(&at(0, rested("0xm", 2, false, 100, 5)));
        platform.apply(&at(0, rested("0xm", 3, true, 90, 7)));

        let market = platform.market(&id("0xm")).expect("market");
        let (bids, asks) = market.book_snapshot(10);
        assert_eq!(
            asks,
            vec![BookLevel {
                price: 100,
                size: 15
            }]
        );
        assert_eq!(bids, vec![BookLevel { price: 90, size: 7 }]);

        platform.apply(&at(1, filled("0xm", 1, 100, 6)));
        let market = platform.market(&id("0xm")).expect("market");
        let (_, asks) = market.book_snapshot(10);
        assert_eq!(
            asks,
            vec![BookLevel {
                price: 100,
                size: 9
            }]
        );

        platform.apply(&at(
            2,
            EventKind::Kernel(KernelEvent::OrderCanceled(OrderCanceled {
                market_id: id("0xm"),
                order_id: 2,
                margin_account_id: id("0xa"),
                is_bid: false,
                remaining_size: 5,
            })),
        ));
        let market = platform.market(&id("0xm")).expect("market");
        let (_, asks) = market.book_snapshot(10);
        assert_eq!(
            asks,
            vec![BookLevel {
                price: 100,
                size: 4
            }]
        );
    }

    #[test]
    fn trades_aggregate_into_minute_candles() {
        let mut platform = Platform::default();
        platform.apply(&at(0, rested("0xm", 1, false, 100, 100)));
        platform.apply(&at(10_000, filled("0xm", 1, 100, 10)));
        platform.apply(&at(20_000, filled("0xm", 1, 120, 5)));
        platform.apply(&at(30_000, filled("0xm", 1, 90, 5)));
        platform.apply(&at(70_000, filled("0xm", 1, 95, 1)));

        let market = platform.market(&id("0xm")).expect("market");
        assert_eq!(market.trades.len(), 4);
        let first = market.candles.get(&0).expect("first candle");
        assert_eq!(first.open, 100);
        assert_eq!(first.high, 120);
        assert_eq!(first.low, 90);
        assert_eq!(first.close, 90);
        assert_eq!(first.volume, 20);
        let second = market.candles.get(&60_000).expect("second candle");
        assert_eq!(second.open, 95);
        assert_eq!(second.volume, 1);
    }

    #[test]
    fn collateral_claims_and_carry_project_account_state() {
        let mut platform = Platform::default();
        platform.apply(&at(
            0,
            EventKind::Kernel(KernelEvent::CollateralDeposited(CollateralFlow {
                market_id: id("0xm"),
                margin_account_id: id("0xa"),
                amount: 100,
            })),
        ));
        platform.apply(&at(
            0,
            EventKind::Kernel(KernelEvent::ClaimIssued(ClaimFlow {
                market_id: id("0xm"),
                margin_account_id: id("0xa"),
                issued_size: Some(40),
                redeemed_size: None,
                collateral_amount: 40,
            })),
        ));
        platform.apply(&at(
            1,
            EventKind::Kernel(KernelEvent::CarryApplied(CarryApplied {
                market_id: id("0xm"),
                from_account_id: id("0xa"),
                to_account_id: id("0xb"),
                amount: 10,
                period: 1,
                from_position: true,
                to_position: false,
            })),
        ));

        let market = platform.market(&id("0xm")).expect("market");
        let alice = market.accounts.get(&id("0xa")).expect("alice");
        assert_eq!(alice.free_collateral, 60);
        assert_eq!(alice.position_collateral, 30);
        assert_eq!(alice.position_size, 40);
        let bob = market.accounts.get(&id("0xb")).expect("bob");
        assert_eq!(bob.free_collateral, 10);
        assert_eq!(market.carry_history.len(), 1);
    }

    #[test]
    fn instrument_creation_aliases_wrapper_ids_and_labels_markets() {
        let mut platform = Platform::default();
        platform.apply(&at(
            0,
            EventKind::Kernel(KernelEvent::MarketCreated(MarketCreated {
                market_id: id("0xkernel"),
                version: 1,
            })),
        ));
        platform.apply(&at(
            0,
            EventKind::Perp(PerpEvent::PerpMarketCreated(PerpMarketCreated {
                market_id: id("0xwrapper"),
                kernel_market_id: id("0xkernel"),
                maintenance_margin_rate_percent: 25,
            })),
        ));
        platform.apply(&at(
            1,
            EventKind::Perp(PerpEvent::MarkPriceUpdated(PriceUpdated {
                market_id: id("0xwrapper"),
                price: 100_000_000,
                timestamp_ms: 1,
            })),
        ));

        assert_eq!(platform.markets.len(), 1);
        let market = platform.market(&id("0xwrapper")).expect("aliased");
        assert_eq!(market.risk_label, RiskLabel::Reference);
        assert_eq!(market.reference_price, Some(100_000_000));
        assert!(matches!(
            market.instrument,
            InstrumentInfo::Perpetual {
                maintenance_margin_rate_percent: 25
            }
        ));
    }

    #[test]
    fn unknown_markets_stay_unranked() {
        let mut platform = Platform::default();
        platform.apply(&at(0, rested("0xmystery", 1, true, 10, 1)));
        let market = platform.market(&id("0xmystery")).expect("market");
        assert_eq!(market.risk_label, RiskLabel::Unranked);
        assert!(matches!(market.instrument, InstrumentInfo::Unknown));
    }
}

//! A faithful Rust reimplementation of the strike contract semantics.
//!
//! The model is the differential oracle: generated operation sequences run
//! against it (in `tests/model_props.rs`) to prove the state invariants hold,
//! and against the real compiled package via simulacrum (in
//! `tests/onchain_props.rs`, feature `simulacrum`) with the two cross-checked
//! step by step. Every transition mirrors a `strike::*` entry point, computing
//! in `u128` exactly as `strike::risk` does.

pub const FLOAT_SCALING: u64 = 1_000_000;
pub const MAINTENANCE_RATE: u64 = 25; // percent; max leverage 4x
pub const MAX_FUNDING_RATE_BPS: u64 = 100;
pub const FUNDING_INTERVAL_MS: u64 = 3_600_000;
pub const NUM_ACCOUNTS: usize = 3;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Side {
    Bid,
    Ask,
}

/// Why a transition did not commit. Each maps to a contract abort code, so the
/// on-chain differential can confirm the same rejection fires for the same
/// input.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Reject {
    InvalidPrice,
    InvalidQuantity,
    InvalidLeverage,
    ZeroMargin,
    InsufficientBalance,
    SelfMatch,
    OrderNotFound,
    FundingTooSoon,
    Overflow,
}

/// One generated action. Amounts are in whole (unscaled) units; the model
/// scales them, exactly as a caller would with `units::price(x * FS)`.
#[derive(Clone, Debug)]
pub enum Op {
    Deposit { account: u8, whole_usdc: u64 },
    Place { account: u8, side: Side, price: u64, size: u64, leverage: u64 },
    Cancel { account: u8, order_id: u64 },
    UpdatePrice { price: u64 },
    CheckLiquidations,
    UpdateFunding,
    AdvanceClock { ms: u64 },
}

#[derive(Clone, Debug)]
pub struct Order {
    pub id: u64,
    pub account: u8,
    pub side: Side,
    pub price: u64,    // scaled
    pub size: u64,     // scaled
    pub leverage: u64, // scaled
    pub margin: u64,   // USDC base units
    pub filled: u64,   // scaled
}

impl Order {
    fn unfilled(&self) -> u64 {
        self.size - self.filled
    }
}

#[derive(Clone, Debug)]
pub struct Model {
    pub accounts: [u64; NUM_ACCOUNTS], // balances, base units
    pub vault: u64,                    // base units
    /// Margin that entered the vault and can never leave through a resting
    /// order: fully-filled and liquidated positions' collateral, plus funding
    /// distribution dust. Tracked so vault conservation is exact.
    pub escrowed: u64,
    pub bids: Vec<Order>, // sorted price-descending
    pub asks: Vec<Order>, // sorted price-ascending
    pub oracle_price: u64,
    pub next_order_id: u64,
    pub last_funding_ms: u64,
    pub clock_ms: u64,
    /// Running sum of every deposit — the conserved total of USDC in the system.
    pub total_deposited: u64,
}

impl Model {
    /// A fresh pool seeded with `initial_price` (whole USDC), mirroring
    /// `pool::new`.
    pub fn new(initial_price_whole: u64) -> Self {
        Model {
            accounts: [0; NUM_ACCOUNTS],
            vault: 0,
            escrowed: 0,
            bids: Vec::new(),
            asks: Vec::new(),
            oracle_price: initial_price_whole.max(1) * FLOAT_SCALING,
            next_order_id: 1,
            last_funding_ms: 0,
            clock_ms: 0,
            total_deposited: 0,
        }
    }

    /// Apply one op. Returns `Ok(())` on commit or `Err(reason)` when the
    /// contract would abort (state left unchanged, mirroring transaction
    /// atomicity).
    pub fn apply(&mut self, op: &Op) -> Result<(), Reject> {
        match *op {
            Op::Deposit { account, whole_usdc } => self.deposit(account, whole_usdc),
            Op::Place { account, side, price, size, leverage } => {
                self.place(account, side, price, size, leverage)
            }
            Op::Cancel { account, order_id } => self.cancel(account, order_id),
            Op::UpdatePrice { price } => self.update_price(price),
            Op::CheckLiquidations => {
                self.check_liquidations();
                Ok(())
            }
            Op::UpdateFunding => self.update_funding(),
            Op::AdvanceClock { ms } => {
                self.clock_ms = self.clock_ms.saturating_add(ms);
                Ok(())
            }
        }
    }

    fn deposit(&mut self, account: u8, whole_usdc: u64) -> Result<(), Reject> {
        let idx = (account as usize) % NUM_ACCOUNTS;
        let amount = whole_usdc.saturating_mul(FLOAT_SCALING);
        self.accounts[idx] += amount;
        self.total_deposited += amount;
        Ok(())
    }

    fn place(
        &mut self,
        account: u8,
        side: Side,
        price_whole: u64,
        size_whole: u64,
        leverage_whole: u64,
    ) -> Result<(), Reject> {
        let idx = (account as usize) % NUM_ACCOUNTS;
        let price = price_whole * FLOAT_SCALING;
        let size = size_whole * FLOAT_SCALING;
        let leverage = leverage_whole * FLOAT_SCALING;

        // Boundary validation, in the same order as pool::place_leveraged_order.
        if price == 0 {
            return Err(Reject::InvalidPrice);
        }
        if size == 0 {
            return Err(Reject::InvalidQuantity);
        }
        if leverage == 0 || leverage > max_leverage() {
            return Err(Reject::InvalidLeverage);
        }
        let margin = margin_required(price, size, leverage)?;
        if margin == 0 {
            return Err(Reject::ZeroMargin);
        }
        if self.accounts[idx] < margin {
            return Err(Reject::InsufficientBalance);
        }

        // Simulate matching on a scratch copy so an abort (self-match) leaves
        // the committed state untouched.
        let mut scratch = self.clone();
        let order_id = scratch.next_order_id;
        scratch.next_order_id += 1;
        scratch.accounts[idx] -= margin;
        scratch.vault += margin;

        let mut order = Order {
            id: order_id,
            account,
            side,
            price,
            size,
            leverage,
            margin,
            filled: 0,
        };
        scratch.match_against_book(&mut order)?;

        if order.unfilled() > 0 {
            match side {
                Side::Bid => {
                    scratch.bids.push(order);
                    scratch.bids.sort_by(|a, b| b.price.cmp(&a.price));
                }
                Side::Ask => {
                    scratch.asks.push(order);
                    scratch.asks.sort_by(|a, b| a.price.cmp(&b.price));
                }
            }
        } else {
            // Fully consumed against the book — its margin stays in the vault
            // with no resting order.
            scratch.escrowed += order.margin;
        }

        *self = scratch;
        Ok(())
    }

    /// Cross `taker` against the opposite book side in price priority. Fills at
    /// the maker's price; aborts on a same-account crossing (self-match).
    fn match_against_book(&mut self, taker: &mut Order) -> Result<(), Reject> {
        loop {
            let makers = match taker.side {
                Side::Bid => &mut self.asks,
                Side::Ask => &mut self.bids,
            };
            if makers.is_empty() || taker.unfilled() == 0 {
                break;
            }
            let crosses = match taker.side {
                Side::Bid => makers[0].price <= taker.price,
                Side::Ask => makers[0].price >= taker.price,
            };
            if !crosses {
                break;
            }
            if makers[0].account == taker.account {
                return Err(Reject::SelfMatch);
            }
            let maker = &mut makers[0];
            let fill = taker.unfilled().min(maker.unfilled());
            maker.filled += fill;
            taker.filled += fill;
            if maker.unfilled() == 0 {
                // Fully-filled maker leaves the book; its margin stays escrowed.
                let m = makers.remove(0);
                self.escrowed += m.margin;
            }
        }
        Ok(())
    }

    fn cancel(&mut self, account: u8, order_id: u64) -> Result<(), Reject> {
        for side in [Side::Bid, Side::Ask] {
            let book = match side {
                Side::Bid => &mut self.bids,
                Side::Ask => &mut self.asks,
            };
            if let Some(pos) = book
                .iter()
                .position(|o| o.id == order_id && o.account == account)
            {
                let order = book.remove(pos);
                let refund = refund_for_unfilled(order.margin, order.unfilled(), order.size)?;
                // The filled part of the margin stays behind in the vault.
                self.escrowed += order.margin - refund;
                self.vault -= refund;
                self.accounts[(account as usize) % NUM_ACCOUNTS] += refund;
                return Ok(());
            }
        }
        Err(Reject::OrderNotFound)
    }

    fn update_price(&mut self, price_whole: u64) -> Result<(), Reject> {
        let price = price_whole * FLOAT_SCALING;
        if price == 0 {
            return Err(Reject::InvalidPrice);
        }
        self.oracle_price = price;
        Ok(())
    }

    fn check_liquidations(&mut self) {
        let price = self.oracle_price;
        for side in [Side::Bid, Side::Ask] {
            let book = match side {
                Side::Bid => &mut self.bids,
                Side::Ask => &mut self.asks,
            };
            let mut i = 0;
            while i < book.len() {
                if is_liquidated(&book[i], price) {
                    let o = book.remove(i);
                    self.escrowed += o.margin; // liquidated margin stays in vault
                } else {
                    i += 1;
                }
            }
        }
    }

    fn update_funding(&mut self) -> Result<(), Reject> {
        if self.clock_ms - self.last_funding_ms < FUNDING_INTERVAL_MS {
            return Err(Reject::FundingTooSoon);
        }
        self.last_funding_ms = self.clock_ms;

        if self.bids.is_empty() || self.asks.is_empty() {
            return Ok(());
        }
        let best_bid = self.bids[0].price;
        let best_ask = self.asks[0].price;
        let (rate_bps, paying_bid) = funding_rate_bps(best_bid, best_ask, self.oracle_price);
        if rate_bps == 0 {
            return Ok(());
        }

        let (payers, receivers) = if paying_bid {
            (&mut self.bids as *mut Vec<Order>, &self.asks as *const Vec<Order>)
        } else {
            (&mut self.asks as *mut Vec<Order>, &self.bids as *const Vec<Order>)
        };
        // SAFETY: payers and receivers are disjoint book sides.
        let payers = unsafe { &mut *payers };
        let receivers = unsafe { &*receivers };

        let mut collected: u64 = 0;
        for o in payers.iter_mut() {
            let payment = funding_payment(o.price, o.size, rate_bps).min(o.margin);
            o.margin -= payment;
            collected += payment;
        }
        let total_notional: u128 = receivers
            .iter()
            .map(|o| notional(o.price, o.size) as u128)
            .sum();
        let mut distributed: u64 = 0;
        let shares: Vec<u64> = receivers
            .iter()
            .map(|o| {
                let n = notional(o.price, o.size) as u128;
                (collected as u128 * n / total_notional) as u64
            })
            .collect();
        let recv_side = if paying_bid { Side::Ask } else { Side::Bid };
        let book = match recv_side {
            Side::Bid => &mut self.bids,
            Side::Ask => &mut self.asks,
        };
        for (o, share) in book.iter_mut().zip(shares) {
            o.margin += share;
            distributed += share;
        }
        // Distribution dust stays in the vault, unattached to any order.
        self.escrowed += collected - distributed;
        Ok(())
    }

    // === Invariants ===

    /// USDC is conserved: every base unit is either in an account or the vault.
    pub fn inv_conservation(&self) -> bool {
        let in_accounts: u64 = self.accounts.iter().sum();
        in_accounts + self.vault == self.total_deposited
    }

    /// The vault holds exactly the resting orders' margins plus what is escrowed
    /// (filled/liquidated margins and funding dust).
    pub fn inv_vault_backed(&self) -> bool {
        let resting: u64 = self
            .bids
            .iter()
            .chain(self.asks.iter())
            .map(|o| o.margin)
            .sum();
        resting + self.escrowed == self.vault
    }

    /// Bids are price-descending, asks price-ascending.
    pub fn inv_sorted(&self) -> bool {
        self.bids.windows(2).all(|w| w[0].price >= w[1].price)
            && self.asks.windows(2).all(|w| w[0].price <= w[1].price)
    }

    /// No resting order is over-filled.
    pub fn inv_fill_bounded(&self) -> bool {
        self.bids
            .iter()
            .chain(self.asks.iter())
            .all(|o| o.filled <= o.size)
    }

    pub fn check_all_invariants(&self) -> Result<(), &'static str> {
        if !self.inv_conservation() {
            return Err("conservation: accounts + vault != total_deposited");
        }
        if !self.inv_vault_backed() {
            return Err("vault_backed: resting margins + escrowed != vault");
        }
        if !self.inv_sorted() {
            return Err("sorted: book order violated");
        }
        if !self.inv_fill_bounded() {
            return Err("fill_bounded: order filled beyond size");
        }
        Ok(())
    }
}

// === Formulas (mirror strike::risk, computed in u128) ===

pub fn max_leverage() -> u64 {
    100 * FLOAT_SCALING / MAINTENANCE_RATE
}

fn checked_u64(value: u128) -> Result<u64, Reject> {
    u64::try_from(value).map_err(|_| Reject::Overflow)
}

pub fn margin_required(price: u64, size: u64, leverage: u64) -> Result<u64, Reject> {
    checked_u64(price as u128 * size as u128 / leverage as u128)
}

pub fn maintenance_margin(price: u64, size: u64) -> Result<u64, Reject> {
    checked_u64(size as u128 * price as u128 * MAINTENANCE_RATE as u128 / 100 / FLOAT_SCALING as u128)
}

pub fn refund_for_unfilled(margin: u64, unfilled: u64, size: u64) -> Result<u64, Reject> {
    checked_u64(margin as u128 * unfilled as u128 / size as u128)
}

fn notional(price: u64, size: u64) -> u64 {
    (price as u128 * size as u128 / FLOAT_SCALING as u128) as u64
}

pub fn is_liquidated(order: &Order, current_price: u64) -> bool {
    let maint = match maintenance_margin(order.price, order.size) {
        Ok(m) => m,
        Err(_) => return false,
    };
    if order.margin < maint {
        return true;
    }
    let buffer =
        (order.margin - maint) as u128 * FLOAT_SCALING as u128 / order.size as u128;
    let entry = order.price as u128;
    let current = current_price as u128;
    match order.side {
        Side::Bid => buffer < entry && entry - buffer >= current,
        Side::Ask => entry + buffer <= current,
    }
}

/// Returns (rate_bps, paying_side_is_bid).
pub fn funding_rate_bps(best_bid: u64, best_ask: u64, oracle: u64) -> (u64, bool) {
    let mid = (best_bid as u128 + best_ask as u128) / 2;
    let oracle = oracle as u128;
    let (divergence, paying_bid) = if mid > oracle {
        (mid - oracle, true)
    } else {
        (oracle - mid, false)
    };
    let bps = divergence * 10_000 / oracle;
    let cap = MAX_FUNDING_RATE_BPS as u128;
    ((if bps > cap { cap } else { bps }) as u64, paying_bid)
}

pub fn funding_payment(price: u64, size: u64, rate_bps: u64) -> u64 {
    (price as u128 * size as u128 / FLOAT_SCALING as u128 * rate_bps as u128 / 10_000) as u64
}

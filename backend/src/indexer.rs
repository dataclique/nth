//! The event indexer: polls Sui JSON-RPC for events emitted by the tracked
//! packages, persists them durably in Postgres, folds them into the shared
//! in-memory projections, and fans them out to WebSocket subscribers.
//!
//! Restarts replay the persisted log through [`crate::state::Platform`], so
//! projections always reflect the full event history; per-package cursors
//! make polling resume exactly where it stopped.

use crate::events::{decode_event, ChainEvent};
use crate::state::Platform;
use sqlx::PgPool;
use sqlx::Row;
use std::str::FromStr;
use std::sync::{Arc, RwLock};
use std::time::Duration;
use sui_sdk::rpc_types::EventFilter;
use sui_sdk::types::base_types::ObjectID;
use sui_sdk::types::event::EventID;
use sui_sdk::types::Identifier;
use tokio::sync::broadcast;

/// Indexer configuration resolved from deployment secrets.
#[derive(Debug, Clone)]
pub struct IndexerConfig {
    pub rpc_url: String,
    /// Tracked event sources as `0xpackage::module` entries — one per
    /// event-emitting module (kernel: `instrument_market`, `matching`,
    /// `collateral`, `maintenance`; instruments: `perp`, `european`,
    /// `american`, `cliquet`, `vault`).
    pub modules: Vec<String>,
    pub poll_interval: Duration,
}

#[derive(Debug, thiserror::Error)]
pub enum IndexerError {
    #[error("database: {0}")]
    Database(#[from] sqlx::Error),
    #[error("sui rpc: {0}")]
    Rpc(#[from] sui_sdk::error::Error),
    #[error("invalid tracked module entry {0}, expected 0xpackage::module")]
    InvalidModule(String),
}

/// Replay every persisted event through the projections, in chain order.
/// Returns how many events were applied.
pub async fn replay(pool: &PgPool, platform: &Arc<RwLock<Platform>>) -> Result<u64, IndexerError> {
    let rows = sqlx::query(
        "SELECT tx_digest, event_seq, timestamp_ms, event_type, payload \
         FROM chain_events ORDER BY seq",
    )
    .fetch_all(pool)
    .await?;
    let mut applied = 0;
    for row in rows {
        let event_type: String = row.get("event_type");
        let payload: serde_json::Value = row.get("payload");
        let Ok(Some(kind)) = decode_event(&event_type, &payload) else {
            continue;
        };
        let event = ChainEvent {
            tx_digest: row.get("tx_digest"),
            event_seq: row.get::<i64, _>("event_seq") as u64,
            timestamp_ms: row.get::<i64, _>("timestamp_ms") as u64,
            kind,
        };
        apply(platform, &event);
        applied += 1;
    }
    Ok(applied)
}

/// Run the polling loop forever. Errors are logged and retried on the next
/// tick rather than crashing the service.
pub async fn run(
    config: IndexerConfig,
    pool: PgPool,
    platform: Arc<RwLock<Platform>>,
    stream: broadcast::Sender<String>,
) {
    loop {
        if let Err(error) = poll_once(&config, &pool, &platform, &stream).await {
            rocket::warn!("indexer poll failed: {error}");
        }
        tokio::time::sleep(config.poll_interval).await;
    }
}

async fn poll_once(
    config: &IndexerConfig,
    pool: &PgPool,
    platform: &Arc<RwLock<Platform>>,
    stream: &broadcast::Sender<String>,
) -> Result<(), IndexerError> {
    let client = sui_sdk::SuiClientBuilder::default()
        .build(&config.rpc_url)
        .await?;
    for entry in &config.modules {
        let (package, module) = entry
            .split_once("::")
            .ok_or_else(|| IndexerError::InvalidModule(entry.clone()))?;
        let package_id =
            ObjectID::from_str(package).map_err(|_| IndexerError::InvalidModule(entry.clone()))?;
        let module =
            Identifier::new(module).map_err(|_| IndexerError::InvalidModule(entry.clone()))?;
        let mut cursor = load_cursor(pool, entry).await?;
        loop {
            let page = client
                .event_api()
                .query_events(
                    EventFilter::MoveEventModule {
                        package: package_id,
                        module: module.clone(),
                    },
                    cursor,
                    Some(100),
                    false,
                )
                .await?;
            for event in &page.data {
                let event_type = event.type_.to_string();
                let tx_digest = event.id.tx_digest.to_string();
                let event_seq = event.id.event_seq;
                let timestamp_ms = event.timestamp_ms.unwrap_or(0);
                let inserted = sqlx::query(
                    "INSERT INTO chain_events \
                     (tx_digest, event_seq, timestamp_ms, event_type, payload) \
                     VALUES ($1, $2, $3, $4, $5) \
                     ON CONFLICT (tx_digest, event_seq) DO NOTHING",
                )
                .bind(&tx_digest)
                .bind(event_seq as i64)
                .bind(timestamp_ms as i64)
                .bind(&event_type)
                .bind(&event.parsed_json)
                .execute(pool)
                .await?
                .rows_affected();
                if inserted == 0 {
                    continue;
                }
                if let Ok(Some(kind)) = decode_event(&event_type, &event.parsed_json) {
                    let chain_event = ChainEvent {
                        tx_digest,
                        event_seq,
                        timestamp_ms,
                        kind,
                    };
                    apply(platform, &chain_event);
                    if let Ok(json) = serde_json::to_string(&chain_event) {
                        let _ = stream.send(json);
                    }
                }
            }
            cursor = page.next_cursor;
            if let Some(next) = &cursor {
                save_cursor(pool, entry, next).await?;
            }
            if !page.has_next_page {
                break;
            }
        }
    }
    Ok(())
}

fn apply(platform: &Arc<RwLock<Platform>>, event: &ChainEvent) {
    let mut guard = match platform.write() {
        Ok(guard) => guard,
        Err(poisoned) => poisoned.into_inner(),
    };
    guard.apply(event);
}

async fn load_cursor(pool: &PgPool, package: &str) -> Result<Option<EventID>, IndexerError> {
    let row = sqlx::query("SELECT tx_digest, event_seq FROM indexer_cursors WHERE package = $1")
        .bind(package)
        .fetch_optional(pool)
        .await?;
    let Some(row) = row else {
        return Ok(None);
    };
    let digest: String = row.get("tx_digest");
    let event_seq: i64 = row.get("event_seq");
    let Ok(tx_digest) = digest.parse() else {
        return Ok(None);
    };
    Ok(Some(EventID {
        tx_digest,
        event_seq: event_seq as u64,
    }))
}

async fn save_cursor(pool: &PgPool, package: &str, cursor: &EventID) -> Result<(), IndexerError> {
    sqlx::query(
        "INSERT INTO indexer_cursors (package, tx_digest, event_seq) \
         VALUES ($1, $2, $3) \
         ON CONFLICT (package) DO UPDATE \
         SET tx_digest = EXCLUDED.tx_digest, event_seq = EXCLUDED.event_seq",
    )
    .bind(package)
    .bind(cursor.tx_digest.to_string())
    .bind(cursor.event_seq as i64)
    .execute(pool)
    .await?;
    Ok(())
}

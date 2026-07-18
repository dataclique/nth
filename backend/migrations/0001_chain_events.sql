CREATE TABLE IF NOT EXISTS chain_events (
    seq BIGSERIAL PRIMARY KEY,
    tx_digest TEXT NOT NULL,
    event_seq BIGINT NOT NULL,
    timestamp_ms BIGINT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    UNIQUE (tx_digest, event_seq)
);

CREATE TABLE IF NOT EXISTS indexer_cursors (
    package TEXT PRIMARY KEY,
    tx_digest TEXT NOT NULL,
    event_seq BIGINT NOT NULL
);

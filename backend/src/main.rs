//! Nth Market platform API: event indexer, REST market data, WebSocket
//! streams, and unsigned transaction templates, per SPEC.md's platform
//! surface. Non-custodial by construction: no keys, no signing, every
//! number informational.

mod api;
mod events;
mod indexer;
mod state;
mod tx;

use api::{EventStream, SharedPlatform};
use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::Header;
use rocket::request::Request;
use rocket::response::Response;
use rocket::{get, options, routes};
use shuttle_runtime::SecretStore;
use state::Platform;
use std::sync::{Arc, RwLock};
use std::time::Duration;

pub struct Cors;

#[rocket::async_trait]
impl Fairing for Cors {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, GET, PATCH, OPTIONS",
        ));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    }
}

#[get("/")]
fn index() -> &'static str {
    "nth market api — see /v1/schema"
}

#[options("/<_..>")]
fn all_options() -> &'static str {
    ""
}

fn tx_registry(secrets: &SecretStore) -> tx::TxRegistry {
    tx::TxRegistry {
        kernel_package: secrets.get("KERNEL_PACKAGE_ID"),
        units_package: secrets.get("UNITS_PACKAGE_ID"),
        perpetual_package: secrets.get("PERPETUAL_PACKAGE_ID"),
        options_package: secrets.get("OPTIONS_PACKAGE_ID"),
        funds_package: secrets.get("FUNDS_PACKAGE_ID"),
    }
}

#[shuttle_runtime::main]
async fn main(
    #[shuttle_shared_db::Postgres] pool: sqlx::PgPool,
    #[shuttle_runtime::Secrets] secrets: SecretStore,
) -> shuttle_rocket::ShuttleRocket {
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|error| shuttle_runtime::Error::Custom(error.into()))?;

    let platform: SharedPlatform = Arc::new(RwLock::new(Platform::default()));
    let replayed = indexer::replay(&pool, &platform)
        .await
        .map_err(|error| shuttle_runtime::Error::Custom(error.into()))?;
    rocket::info!("replayed {replayed} persisted events");

    let (stream_tx, _) = tokio::sync::broadcast::channel(1024);

    if let Some(rpc_url) = secrets.get("SUI_RPC_URL") {
        let modules: Vec<String> = secrets
            .get("TRACKED_MODULES")
            .map(|list| {
                list.split(',')
                    .map(|module| module.trim().to_string())
                    .filter(|module| !module.is_empty())
                    .collect()
            })
            .unwrap_or_default();
        if !modules.is_empty() {
            let config = indexer::IndexerConfig {
                rpc_url,
                modules,
                poll_interval: Duration::from_secs(2),
            };
            tokio::spawn(indexer::run(
                config,
                pool.clone(),
                platform.clone(),
                stream_tx.clone(),
            ));
        }
    }

    let rocket = rocket::build()
        .attach(Cors)
        .manage(platform)
        .manage(EventStream(stream_tx))
        .manage(tx_registry(&secrets))
        .mount("/", routes![index, all_options])
        .mount("/v1", api::v1_routes());

    Ok(rocket.into())
}

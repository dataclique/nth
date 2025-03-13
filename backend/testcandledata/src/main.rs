use rocket::{get, routes, State};
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{sleep, Duration};
use csv::ReaderBuilder;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::BufReader;
use rocket_cors::{CorsOptions, AllowedOrigins}; 
use rocket::serde::json::Json;
use rocket::http::Header;
use rocket::fairing::{Fairing, Info, Kind};
use rocket::request::Request;
use rocket::response::Response;
use rocket::{options};

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
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

// Struct to represent a single OHLCV record
#[derive(Debug, Deserialize)]
struct OhlcvRecord {
    timestamp: String,
    open: f64,
    high: f64,
    low: f64,
    close: f64,
    volume: f64,
    symbol: String,
    ticker: String,
}

// Shared state to store the CSV data and current index
struct CandleState {
    data: Vec<OhlcvRecord>,
    index: Mutex<usize>,
}

#[derive(Serialize)]
struct CandleResponse {
    time: String,
    open: f64,
    high: f64,
    low: f64,
    close: f64,
    symbol: String,
}

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[get("/candles")]
async fn candles(state: &State<Arc<CandleState>>) -> Json<CandleResponse> {
    let mut index = state.index.lock().await;
    let record = &state.data[*index];

    *index = (*index + 1) % state.data.len();

    sleep(Duration::from_secs(5)).await; // Ensure updates every second

    Json(CandleResponse {
        time: record.timestamp.clone(),
        open: record.open,
        high: record.high,
        low: record.low,
        close: record.close,
        symbol: record.symbol.clone(),
    })
}

#[shuttle_runtime::main]
async fn main() -> shuttle_rocket::ShuttleRocket {
    // Read and parse the CSV file
    let file = File::open("ohlcv1h.csv").expect("Failed to open CSV file");
    let reader = BufReader::new(file);
    let mut csv_reader = ReaderBuilder::new()
        .has_headers(true)
        .from_reader(reader);

    let mut data = Vec::new();
    for result in csv_reader.deserialize() {
        let record: OhlcvRecord = result.expect("Failed to parse CSV record");
        data.push(record);
    }

    // Initialize the shared state
    let state = Arc::new(CandleState {
        data,
        index: Mutex::new(0),
    });

    // Build the Rocket instance
    let rocket = rocket::build()
        .mount("/", routes![index, candles]).attach(CORS)
        .manage(state);

    Ok(rocket.into())
}
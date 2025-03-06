use rocket::{get, routes};
// use sui_sdk::rpc_types::EventFilter;
// use sui_sdk::SuiClientBuilder;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[shuttle_runtime::main]
async fn main() -> shuttle_rocket::ShuttleRocket {
    //     let client = SuiClientBuilder::default().build_testnet().await?;

    //     let descending = true;
    //     let query_events = client
    //         .event_api()
    //  // query first 5 events in descending order
    //         .query_events(EventFilter::All([]), None, Some(5), descending)
    //         .await?;
    //     println!(" *** Query events *** ");
    //     println!("{:?}", query_events);
    //     println!(" *** Query events ***\n ");

    //     let ws = SuiClientBuilder::default()
    //         .ws_url("wss://rpc.testnet.sui.io:443")
    //         .build("https://fullnode.testnet.sui.io:443")
    //         .await?;
    //     println!("WS version {:?}", ws.api_version());

    //     let mut subscribe = ws.event_api().subscribe_event(EventFilter::All([])).await?;

    //     loop {
    //         println!("{:?}", subscribe.next().await);
    //         break;
    //     }

    let rocket = rocket::build().mount("/", routes![index]);

    Ok(rocket.into())
}

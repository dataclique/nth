#[macro_use]
extern crate rocket;

use sui_sdk::SuiClientBuilder;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    sqlx::migrate!().run(&pool).await?;

    let sui_testnet = SuiClientBuilder::default().build_testnet().await?;
    println!("Sui testnet version: {}", sui_testnet.api_version());

    let _rocket = rocket::build()
        .mount("/hello", routes![index])
        .launch()
        .await?;

    Ok(())
}

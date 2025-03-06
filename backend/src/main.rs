#[macro_use]
extern crate rocket;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[launch]
fn rocket() -> _ {
    sqlx::migrate!().run(&pool).await?;

    rocket::build().mount("/", routes![index])
}

module orderbook::orderbook;

use sui::table::{Table, Self};

public struct Order has store {
    id: u64,
    trader: address,
    price: u64,
    size: u64,
    is_long: bool,
}

public struct OrderBook has store, key {
    id: UID, //required by sui
    bids: Table<u64, vector<Order>>, // key: price, value: orders at this price
    asks: Table<u64, vector<Order>>, // key: price, value: orders at this price
    next_order_id: u64,
}

public fun create_orderbook(ctx: &mut TxContext): OrderBook {
    let orderbook = OrderBook {
        id: object::new(ctx), // Creates a new Sui object ID
        bids: table::new(ctx), // Создаём новый Table и регистрируем его
        asks: table::new(ctx),
        next_order_id: 1,
    };

    (orderbook)
}

public fun place_order(orderbook: &mut OrderBook, trader: address, price: u64, size: u64, is_long: bool) {
    let order = Order {
        id: orderbook.next_order_id,
        trader: trader,
        price,
        size,
        is_long,
    };
    orderbook.next_order_id = orderbook.next_order_id + 1;

    if (is_long) {
        if (!table::contains(&orderbook.bids, price)) {
            table::add(&mut orderbook.bids, price, vector::empty<Order>());
        };
        let entry = table::borrow_mut(&mut orderbook.bids, price);
        vector::push_back(entry, order);
    } else {
        if (!table::contains(&orderbook.asks, price)) {
            table::add(&mut orderbook.asks, price, vector::empty<Order>());
        };
        let entry = table::borrow_mut(&mut orderbook.asks, price);
        vector::push_back(entry, order);
    }
}

// public fun match_orders(orderbook: &mut OrderBook) {
//     let best_bid_price = table::max_key(&orderbook.bids);
//     let best_ask_price = table::min_key(&orderbook.asks);

//     if best_bid_price >= best_ask_price {
//         let bid_orders = table::borrow_mut(&mut orderbook.bids, best_bid_price);
//         let ask_orders = table::borrow_mut(&mut orderbook.asks, best_ask_price);

//         // Simplified matching logic (exact fills, no partial matching for now)
//         let bid_order = vector::pop(bid_orders);
//         let ask_order = vector::pop(ask_orders);

//         if vector::is_empty(bid_orders) {
//             table::remove(&mut orderbook.bids, best_bid_price);
//         }
//         if vector::is_empty(ask_orders) {
//             table::remove(&mut orderbook.asks, best_ask_price);
//         }
//     }
// }

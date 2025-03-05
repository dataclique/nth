module strike::counter;

public struct OwnerCap has key {
    id: UID,
}

public struct Counter has key {
    id: UID,
    owner: address,
    count: u64,
}

fun init(ctx: &mut TxContext) {
    let id = object::new(ctx);
    let obj = OwnerCap { id };
    transfer::transfer(obj, ctx.sender());
}

public fun transfer_owner_cap(owner_cap: OwnerCap, recipient: address) {
    transfer::transfer(owner_cap, recipient);
}

public fun create(ctx: &mut TxContext) {
    transfer::share_object(Counter {
        id: object::new(ctx),
        owner: ctx.sender(),
        count: 0,
    });
}

public fun increment(counter: &mut Counter) {
    counter.count = counter.count + 1;
}

public fun reset(_: &OwnerCap, counter: &mut Counter) {
    counter.count = 0;
}

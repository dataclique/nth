module strike::escrow;

use strike::lock;

public struct EscrowObjectKey has copy, drop, store {}

public struct Escrow<phantom T: key + store> has key, store {
    id: UID,
    sender: address,
    recipient: address,
    exchange_key: ID,
}

public fun create<T: key + store>(
    escrowed: T,
    exchange_key: ID,
    recipient: address,
    ctx: &mut TxContext,
) {
    let mut escrow = Escrow<T> {
        id: object::new(ctx),
        sender: ctx.sender(),
        recipient,
        exchange_key,
    };

    sui::dynamic_object_field::add(&mut escrow.id, EscrowObjectKey {}, escrowed);
    transfer::public_share_object(escrow);
}

const ReturnToSenderErrorEscrowKeyMismatch: u64 = 0;

public struct EscrowCancelledEvent has copy, drop {
    escrow_id: ID,
}

public fun return_to_sender<T: key + store>(mut escrow: Escrow<T>, ctx: &TxContext): T {
    assert!(escrow.sender == ctx.sender(), ReturnToSenderErrorEscrowKeyMismatch);

    sui::event::emit(EscrowCancelledEvent {
        escrow_id: object::id(&escrow),
    });

    let escrowed = sui::dynamic_object_field::remove<EscrowObjectKey, T>(&mut escrow.id, EscrowObjectKey {});
    let Escrow { id, sender: _, recipient: _, exchange_key: _ } = escrow;
    id.delete();

    escrowed
}

const SwapErrorRecipientIsntTxSender: u64 = 0;
const SwapErrorExchangeObjectMismatch: u64 = 1;

public struct EscrowSwappedEvent has copy, drop {
    escrow_id: ID,
}

public fun swap<T: key + store, U: key + store>(
    mut escrow: Escrow<T>,
    key: lock::Key,
    locked: lock::Locked<U>,
    ctx: &TxContext
): T {
    let escrowed = sui::dynamic_object_field::remove<EscrowObjectKey, T>(&mut escrow.id, EscrowObjectKey {});

    let Escrow { id, sender, recipient, exchange_key } = escrow;

    assert!(recipient == ctx.sender(), SwapErrorRecipientIsntTxSender);
    assert!(exchange_key == object::id(&key), SwapErrorExchangeObjectMismatch);

    sui::event::emit(EscrowSwappedEvent { escrow_id: id.to_inner() });

    transfer::public_transfer(locked.unlock(key), sender);
    id.delete();

    escrowed
}


#[test_only] use sui::coin::Coin;
#[test_only] use sui::sui::SUI;
#[test_only] use sui::test_scenario;
#[test_only] use sui::test_scenario::Scenario;

#[test_only] const ALICE: address = @0xA;
#[test_only] const BOBBY: address = @0xB;
// #[test_only] const CINDY: address = @0xC;

#[test_only]
fun test_coin(scenario: &mut Scenario): Coin<SUI> {
    let number_of_coins = 42;
    sui::coin::mint_for_testing<SUI>(number_of_coins, scenario.ctx())
}

#[test]
fun test_successful_swap() {
    let mut scenario = test_scenario::begin(@0x0);

    std::debug::print(&b"Bobby locks the object he wants to trade".to_string());
    let (bobby_coin_id, bobby_key_id) = {
        test_scenario::next_tx(&mut scenario, BOBBY);

        let coin = test_coin(&mut scenario);
        let coin_id = object::id(&coin);

        let (lock, key) = lock::lock(coin, test_scenario::ctx(&mut scenario));
        let key_id = object::id(&key);

        transfer::public_transfer(lock, BOBBY);
        transfer::public_transfer(key, BOBBY);

        (coin_id, key_id)
    };

    std::debug::print(&b"Alice creates an escrow for Bobby's object".to_string());
    let alice_coin_id = {
        test_scenario::next_tx(&mut scenario, ALICE);

        let coin = test_coin(&mut scenario);
        let coin_id = object::id(&coin);

        create(coin, bobby_key_id, BOBBY, test_scenario::ctx(&mut scenario));

        coin_id
    };
    
    std::debug::print(&b"Bobby responds by offering their object and gets Alice's object in return".to_string());
    {
        test_scenario::next_tx(&mut scenario, BOBBY);
        let escrow = test_scenario::take_shared(&scenario);
        let key: lock::Key  = test_scenario::take_from_sender(&scenario);
        let locked: lock::Locked<Coin<SUI>> = test_scenario::take_from_sender(&scenario);

        let alice_coin = swap<Coin<SUI>, Coin<SUI>>(escrow, key, locked, test_scenario::ctx(&mut scenario));
        transfer::public_transfer(alice_coin, BOBBY);
    };
    
    std::debug::print(&b"Commit effects from the swap".to_string());
    test_scenario::next_tx(&mut scenario, @0x0);

    std::debug::print(&b"Alice gets the object from Bobby".to_string());
    {
        let coin: Coin<SUI> = test_scenario::take_from_address_by_id(&scenario, ALICE, bobby_coin_id);
        test_scenario::return_to_address(ALICE, coin);
    };

    std::debug::print(&b"Bobby gets the object from Alice".to_string());
    {
        let coin: Coin<SUI> = test_scenario::take_from_address_by_id(&scenario, BOBBY, alice_coin_id);
        test_scenario::return_to_address(BOBBY, coin);
    };

    test_scenario::end(scenario);
}
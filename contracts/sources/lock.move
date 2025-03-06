module strike::lock;

public struct LockedObjectKey has copy, drop, store {}

public struct Locked<phantom T: key + store> has key, store {
    id: UID,
    key_id: ID,
}

public struct Key has key, store { id: UID }

const ErrorLockKeyMismatch: u64 = 0;

public struct LockCreatedEvent has copy, drop {
    lock_id: ID,
    key_id: ID,
    creator: address,
    asset_id: ID,
}

public struct LockDestroyedEvent has copy, drop {
    lock_id: ID,
}

public fun lock<T: key + store>(asset: T, ctx: &mut TxContext): (Locked<T>, Key) {
    let key = Key { id: object::new(ctx) };

    let mut lock = Locked { id: object::new(ctx), key_id: object::id(&key) };

    sui::event::emit(LockCreatedEvent {
        lock_id: object::id(&lock),
        key_id: object::id(&key),
        creator: ctx.sender(),
        asset_id: object::id(&asset),
    });

    sui::dynamic_object_field::add(&mut lock.id, LockedObjectKey {}, asset);

    (lock, key)
}

public fun unlock<T: key + store>(mut locked_asset: Locked<T>, key: Key): T {
    assert!(locked_asset.key_id == object::id(&key), ErrorLockKeyMismatch);

    let Key { id} = key;
    id.delete();

    let asset = sui::dynamic_object_field::remove<LockedObjectKey, T>(&mut locked_asset.id, LockedObjectKey {});

    sui::event::emit(LockDestroyedEvent { lock_id: object::id(&locked_asset) });

    let Locked { id, key_id: _ } = locked_asset;
    id.delete();

    asset
}



#[test_only] use sui::coin::Coin;
#[test_only] use sui::sui::SUI;
#[test_only] use sui::test_scenario;
#[test_only] use sui::test_scenario::Scenario;

#[test_only]
fun test_coin(scenario: &mut Scenario): Coin<SUI> {
    let number_of_coins = 42;
    sui::coin::mint_for_testing<SUI>(number_of_coins, scenario.ctx())
}

#[test]
fun test_lock_unlock() {
    let mut scenario = test_scenario::begin(@0xA);
    let coin = test_coin(&mut scenario);

    let (locked_coin, key) = lock(coin, scenario.ctx());
    let coin = unlock(locked_coin, key);

    coin.burn_for_testing();
    scenario.end();
}

#[test]
#[expected_failure(abort_code = ErrorLockKeyMismatch)]
fun test_lock_key_mismatch() {
    let mut scenario = test_scenario::begin(@0xA);
    let coin = test_coin(&mut scenario);
    let another_coin = test_coin(&mut scenario);
    let (locked_coin, _correct_key) = lock(coin, scenario.ctx());
    let (_another_locked_coin, incorrect_key) = lock(another_coin, scenario.ctx());

    let _key = locked_coin.unlock(incorrect_key);
    abort 1337
}
//! On-chain executor: publishes the compiled strike package into an in-memory
//! Sui (`simulacrum`) so generated operation sequences can run against the real
//! bytecode and be cross-checked against the reference model.
//!
//! This foundation covers building, publishing, and funding an account — the
//! parts that gate everything else. Each trading op is then one programmable
//! transaction that constructs the domain newtypes (`units::price(x)` etc.) as
//! prior `MoveCall`s and feeds their results into the entry function (see
//! `fuzz/README.md`); `Simulacrum::advance_clock` drives funding cadence and
//! `Simulacrum::store` reads state back for the differential.

use std::path::PathBuf;

use simulacrum::Simulacrum;
use sui_move_build::{BuildConfig, CompiledPackage};
use sui_types::{
    base_types::{ObjectID, SuiAddress},
    crypto::{get_key_pair, AccountKeyPair},
    effects::TransactionEffectsAPI,
    programmable_transaction_builder::ProgrammableTransactionBuilder,
    transaction::{Transaction, TransactionData},
    Identifier,
};

/// The published package plus the funded account that drives transactions.
pub struct Harness {
    pub sim: Simulacrum,
    pub package_id: ObjectID,
    pub sender: SuiAddress,
    pub sender_key: AccountKeyPair,
}

/// Absolute path to the `contracts/` Move package, resolved relative to this
/// crate so the harness works regardless of the working directory.
fn contracts_path() -> PathBuf {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.pop();
    path.push("contracts");
    path
}

impl Harness {
    /// Compile the strike Move package with `sui-move-build`, returning the
    /// compiled artifact. This is the foundation the on-chain layer stands on:
    /// it proves the harness can build the real package that will be published.
    pub fn compile() -> anyhow::Result<CompiledPackage> {
        Ok(BuildConfig::new_for_testing().build(&contracts_path())?)
    }

    /// Compile and publish the strike package into a fresh in-memory Sui, then
    /// return a harness with a gas-funded sender.
    ///
    /// NOTE: strike depends on the external `usdc` package
    /// (circlefin/stablecoin-sui) and its transitive deps, which do not exist
    /// in a fresh simulacrum. Publishing therefore requires bootstrapping those
    /// dependency packages into the in-memory chain first (build and publish
    /// each, remapping ids) before this succeeds — the documented next step for
    /// the full on-chain differential (see `fuzz/README.md`).
    pub fn publish() -> anyhow::Result<Self> {
        let mut sim = Simulacrum::new();
        let (sender, sender_key): (SuiAddress, AccountKeyPair) = get_key_pair();
        sim.request_gas(sender, 100_000_000_000)?;

        let compiled = Self::compile()?;
        let modules = compiled.get_package_bytes(/* with_unpublished_deps */ false);
        let dep_ids = compiled.get_published_dependencies_ids();

        let gas = Self::gas_object(&sim, sender)?;
        let gas_price = sim.reference_gas_price();

        let mut builder = ProgrammableTransactionBuilder::new();
        builder.publish_immutable(modules, dep_ids);
        let pt = builder.finish();

        let tx_data =
            TransactionData::new_programmable(sender, vec![gas], pt, 100_000_000, gas_price);
        let tx = Transaction::from_data_and_signer(tx_data, vec![&sender_key]);

        let (effects, _) = sim.execute_transaction(tx)?;
        // A published package is the transaction's sole Immutable-owned
        // created object.
        let package_id = effects
            .created()
            .iter()
            .find(|(_obj_ref, owner)| owner.is_immutable())
            .map(|(obj_ref, _)| obj_ref.0)
            .ok_or_else(|| anyhow::anyhow!("published package object not found in effects"))?;

        Ok(Harness { sim, package_id, sender, sender_key })
    }

    /// The sender's current gas coin as an object reference.
    fn gas_object(
        sim: &Simulacrum,
        sender: SuiAddress,
    ) -> anyhow::Result<sui_types::base_types::ObjectRef> {
        let coin = sim
            .store()
            .owned_objects(sender)
            .find(|obj| obj.is_gas_coin())
            .ok_or_else(|| anyhow::anyhow!("sender has no gas coin"))?;
        Ok(coin.compute_object_reference())
    }

    /// Identifier for a strike module, e.g. `module_id("pool")`.
    pub fn module_id(name: &str) -> Identifier {
        Identifier::new(name).expect("valid module identifier")
    }
}

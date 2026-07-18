//! Unsigned transaction call specs for client-side signing.
//!
//! The API never holds keys and cannot move funds: these endpoints return a
//! declarative list of Move calls — including the `units::*` constructor
//! calls that build typed arguments and the `order::bid`/`ask` calls that
//! build the side enum — which the TypeScript SDK maps 1:1 onto a
//! programmable transaction block. `Result { call }` references an earlier
//! call's return value, exactly like PTB result chaining.

use crate::events::OptionStyle;
use serde::{Deserialize, Serialize};

/// Which side of the book an order specifies.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OrderSide {
    Bid,
    Ask,
}

/// One argument of one Move call in a spec.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ArgSpec {
    /// An on-chain object passed by ID; the client resolves ownership and
    /// mutability when building the transaction.
    Object { object_id: String },
    /// A BCS-pure value; `value_type` is the Move type, `value` its decimal
    /// or hex rendering.
    Pure { value_type: String, value: String },
    /// The return value of an earlier call in the same spec.
    Result { call: usize },
    /// The shared clock object (`0x6`).
    Clock,
}

/// One Move call inside a spec.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct MoveCall {
    pub package: String,
    pub module: String,
    pub function: String,
    pub type_arguments: Vec<String>,
    pub arguments: Vec<ArgSpec>,
}

/// A full unsigned-transaction template: calls execute in order inside one
/// programmable transaction block.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct CallSpec {
    pub description: String,
    pub calls: Vec<MoveCall>,
}

/// Deployed package IDs the spec builder targets. Every ID is optional so a
/// deployment without a given package simply declines those endpoints.
#[derive(Debug, Clone, Default)]
pub struct TxRegistry {
    pub kernel_package: Option<String>,
    pub units_package: Option<String>,
    pub perpetual_package: Option<String>,
    pub options_package: Option<String>,
    pub funds_package: Option<String>,
}

impl TxRegistry {
    fn side_call(&self, side: OrderSide) -> Option<MoveCall> {
        let kernel = self.kernel_package.clone()?;
        Some(MoveCall {
            package: kernel,
            module: "order".to_string(),
            function: match side {
                OrderSide::Bid => "bid".to_string(),
                OrderSide::Ask => "ask".to_string(),
            },
            type_arguments: vec![],
            arguments: vec![],
        })
    }

    fn unit_call(&self, module: &str, function: &str, value: u64) -> Option<MoveCall> {
        let units = self.units_package.clone()?;
        Some(MoveCall {
            package: units,
            module: module.to_string(),
            function: function.to_string(),
            type_arguments: vec![],
            arguments: vec![ArgSpec::Pure {
                value_type: "u64".to_string(),
                value: value.to_string(),
            }],
        })
    }

    /// `perp::deposit_collateral(market, account, amount)`.
    pub fn perp_deposit(&self, market: &str, account: &str, amount: u64) -> Option<CallSpec> {
        let perpetual = self.perpetual_package.clone()?;
        Some(CallSpec {
            description: "deposit USDC into the perpetual market's free collateral".to_string(),
            calls: vec![
                self.unit_call("usdc_amount", "usdc", amount)?,
                MoveCall {
                    package: perpetual,
                    module: "perp".to_string(),
                    function: "deposit_collateral".to_string(),
                    type_arguments: vec![],
                    arguments: vec![
                        ArgSpec::Object {
                            object_id: market.to_string(),
                        },
                        ArgSpec::Object {
                            object_id: account.to_string(),
                        },
                        ArgSpec::Result { call: 0 },
                    ],
                },
            ],
        })
    }

    /// `perp::withdraw_collateral(market, account, amount)`.
    pub fn perp_withdraw(&self, market: &str, account: &str, amount: u64) -> Option<CallSpec> {
        let perpetual = self.perpetual_package.clone()?;
        Some(CallSpec {
            description: "withdraw free collateral from the perpetual market".to_string(),
            calls: vec![
                self.unit_call("usdc_amount", "usdc", amount)?,
                MoveCall {
                    package: perpetual,
                    module: "perp".to_string(),
                    function: "withdraw_collateral".to_string(),
                    type_arguments: vec![],
                    arguments: vec![
                        ArgSpec::Object {
                            object_id: market.to_string(),
                        },
                        ArgSpec::Object {
                            object_id: account.to_string(),
                        },
                        ArgSpec::Result { call: 0 },
                    ],
                },
            ],
        })
    }

    /// `perp::place_limit_order(market, account, side, price, size,
    /// leverage)` with the typed-argument constructor calls chained in.
    pub fn perp_place_order(
        &self,
        market: &str,
        account: &str,
        side: OrderSide,
        price: u64,
        size: u64,
        leverage: u64,
    ) -> Option<CallSpec> {
        let perpetual = self.perpetual_package.clone()?;
        Some(CallSpec {
            description: "place a leveraged perpetual limit order".to_string(),
            calls: vec![
                self.side_call(side)?,
                self.unit_call("price", "price", price)?,
                self.unit_call("size", "size", size)?,
                self.unit_call("leverage", "leverage", leverage)?,
                MoveCall {
                    package: perpetual,
                    module: "perp".to_string(),
                    function: "place_limit_order".to_string(),
                    type_arguments: vec![],
                    arguments: vec![
                        ArgSpec::Object {
                            object_id: market.to_string(),
                        },
                        ArgSpec::Object {
                            object_id: account.to_string(),
                        },
                        ArgSpec::Result { call: 0 },
                        ArgSpec::Result { call: 1 },
                        ArgSpec::Result { call: 2 },
                        ArgSpec::Result { call: 3 },
                    ],
                },
            ],
        })
    }

    /// `perp::cancel_order(market, account, side, order_id)`.
    pub fn perp_cancel_order(
        &self,
        market: &str,
        account: &str,
        side: OrderSide,
        order_id: u64,
    ) -> Option<CallSpec> {
        let perpetual = self.perpetual_package.clone()?;
        let kernel = self.kernel_package.clone()?;
        Some(CallSpec {
            description: "cancel a resting perpetual order".to_string(),
            calls: vec![
                self.side_call(side)?,
                MoveCall {
                    package: kernel,
                    module: "order".to_string(),
                    function: "order_id".to_string(),
                    type_arguments: vec![],
                    arguments: vec![ArgSpec::Pure {
                        value_type: "u64".to_string(),
                        value: order_id.to_string(),
                    }],
                },
                MoveCall {
                    package: perpetual,
                    module: "perp".to_string(),
                    function: "cancel_order".to_string(),
                    type_arguments: vec![],
                    arguments: vec![
                        ArgSpec::Object {
                            object_id: market.to_string(),
                        },
                        ArgSpec::Object {
                            object_id: account.to_string(),
                        },
                        ArgSpec::Result { call: 0 },
                        ArgSpec::Result { call: 1 },
                    ],
                },
            ],
        })
    }

    /// `vault::deposit(market, account, amount)`.
    pub fn vault_deposit(&self, market: &str, account: &str, amount: u64) -> Option<CallSpec> {
        let funds = self.funds_package.clone()?;
        Some(CallSpec {
            description: "deposit into the community vault at the current NAV".to_string(),
            calls: vec![
                self.unit_call("usdc_amount", "usdc", amount)?,
                MoveCall {
                    package: funds,
                    module: "vault".to_string(),
                    function: "deposit".to_string(),
                    type_arguments: vec![],
                    arguments: vec![
                        ArgSpec::Object {
                            object_id: market.to_string(),
                        },
                        ArgSpec::Object {
                            object_id: account.to_string(),
                        },
                        ArgSpec::Result { call: 0 },
                    ],
                },
            ],
        })
    }

    /// `vault::redeem(market, account, shares)`.
    pub fn vault_redeem(&self, market: &str, account: &str, shares: u64) -> Option<CallSpec> {
        let funds = self.funds_package.clone()?;
        Some(CallSpec {
            description: "redeem vault shares at the current NAV".to_string(),
            calls: vec![
                self.unit_call("size", "size", shares)?,
                MoveCall {
                    package: funds,
                    module: "vault".to_string(),
                    function: "redeem".to_string(),
                    type_arguments: vec![],
                    arguments: vec![
                        ArgSpec::Object {
                            object_id: market.to_string(),
                        },
                        ArgSpec::Object {
                            object_id: account.to_string(),
                        },
                        ArgSpec::Result { call: 0 },
                    ],
                },
            ],
        })
    }

    /// `european|american|cliquet::place_limit_order(...)`. Vanilla styles
    /// take the clock (expiry gate); the cliquet does not.
    pub fn option_place_order(
        &self,
        style: OptionStyle,
        market: &str,
        account: &str,
        side: OrderSide,
        price: u64,
        size: u64,
    ) -> Option<CallSpec> {
        let options = self.options_package.clone()?;
        let module = match style {
            OptionStyle::European => "european",
            OptionStyle::American => "american",
            OptionStyle::Cliquet => "cliquet",
        };
        let mut arguments = vec![
            ArgSpec::Object {
                object_id: market.to_string(),
            },
            ArgSpec::Object {
                object_id: account.to_string(),
            },
            ArgSpec::Result { call: 0 },
            ArgSpec::Result { call: 1 },
            ArgSpec::Result { call: 2 },
        ];
        if style != OptionStyle::Cliquet {
            arguments.push(ArgSpec::Clock);
        }
        Some(CallSpec {
            description: format!("place a {module} option premium order"),
            calls: vec![
                self.side_call(side)?,
                self.unit_call("price", "price", price)?,
                self.unit_call("size", "size", size)?,
                MoveCall {
                    package: options,
                    module: module.to_string(),
                    function: "place_limit_order".to_string(),
                    type_arguments: vec![],
                    arguments,
                },
            ],
        })
    }

    /// `american::exercise(market, holder, assigned, size, clock)`.
    pub fn option_exercise(
        &self,
        market: &str,
        holder_account: &str,
        assigned_account: &str,
        size: u64,
    ) -> Option<CallSpec> {
        let options = self.options_package.clone()?;
        Some(CallSpec {
            description: "exercise an American option against an assigned short".to_string(),
            calls: vec![
                self.unit_call("size", "size", size)?,
                MoveCall {
                    package: options,
                    module: "american".to_string(),
                    function: "exercise".to_string(),
                    type_arguments: vec![],
                    arguments: vec![
                        ArgSpec::Object {
                            object_id: market.to_string(),
                        },
                        ArgSpec::Object {
                            object_id: holder_account.to_string(),
                        },
                        ArgSpec::Pure {
                            value_type: "id".to_string(),
                            value: assigned_account.to_string(),
                        },
                        ArgSpec::Result { call: 0 },
                        ArgSpec::Clock,
                    ],
                },
            ],
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn registry() -> TxRegistry {
        TxRegistry {
            kernel_package: Some("0xkernel".to_string()),
            units_package: Some("0xunits".to_string()),
            perpetual_package: Some("0xperp".to_string()),
            options_package: Some("0xopts".to_string()),
            funds_package: Some("0xfunds".to_string()),
        }
    }

    #[test]
    fn perp_order_spec_chains_typed_constructors() {
        let spec = registry()
            .perp_place_order("0xm", "0xa", OrderSide::Bid, 100, 10, 2_000_000)
            .expect("spec");
        assert_eq!(spec.calls.len(), 5);
        assert_eq!(spec.calls[0].function, "bid");
        assert_eq!(spec.calls[1].module, "price");
        assert_eq!(spec.calls[3].module, "leverage");
        let place = &spec.calls[4];
        assert_eq!(place.function, "place_limit_order");
        assert_eq!(place.arguments[2], ArgSpec::Result { call: 0 });
        assert_eq!(place.arguments[5], ArgSpec::Result { call: 3 });
    }

    #[test]
    fn vanilla_option_orders_take_the_clock_and_cliquets_do_not() {
        let registry = registry();
        let european = registry
            .option_place_order(OptionStyle::European, "0xm", "0xa", OrderSide::Ask, 5, 1)
            .expect("spec");
        assert_eq!(
            european.calls.last().expect("call").arguments.last(),
            Some(&ArgSpec::Clock)
        );
        let cliquet = registry
            .option_place_order(OptionStyle::Cliquet, "0xm", "0xa", OrderSide::Ask, 5, 1)
            .expect("spec");
        assert!(!cliquet
            .calls
            .last()
            .expect("call")
            .arguments
            .contains(&ArgSpec::Clock));
    }

    #[test]
    fn missing_packages_decline_the_endpoint() {
        let registry = TxRegistry::default();
        assert!(registry.perp_deposit("0xm", "0xa", 1).is_none());
        assert!(registry.vault_redeem("0xm", "0xa", 1).is_none());
    }
}

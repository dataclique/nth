# units

Typed fixed-point quantities for Nth Market instruments: `Price`, `Size`,
`Leverage`, `UsdcAmount`, and `MaintenanceMarginRate`. Each type is its own
module so bare `u64` values cannot cross quantity boundaries.

Scaled quantities (`Price`, `Size`, `Leverage`) share `scaling::float_scaling()`
($10^6$, matching USDC's 6 decimals). `MaintenanceMarginRate` is a plain percent
(25 = 25%). Cross-quantity math lives in the `nth` package (`nth::risk`), not
here.

## Build and test

```sh
cd contracts/units
sui move build
sui move test
```

## Examples

See `examples/` for constructing scaled order inputs and a maintenance margin
rate. Example modules compile with the package but are not published on chain.

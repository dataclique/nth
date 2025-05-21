# Float Scaling in Strike Protocol

## Overview
The Strike Protocol uses a float scaling mechanism to handle decimal numbers in Move, which doesn't natively support floating-point arithmetic. We use a scaling factor of 1,000,000 (6 decimal places) to represent decimal values as integers.

## Why Float Scaling?

1. **Move Language Limitation**: Move doesn't support floating-point numbers, so we need to represent decimal values as integers.

2. **Precision**: Using 6 decimal places (1,000,000) provides sufficient precision for most financial calculations while avoiding overflow issues with u64.

3. **Consistency**: All monetary values (prices, sizes, leverage) are scaled to maintain consistent decimal precision across the protocol.

## Float Scaling Rules

### When to Multiply by Float Scaling:
1. When converting from a decimal representation to an integer
2. When we need to maintain precision in division operations
3. When we want to avoid losing decimal places in calculations

### When to Divide by Float Scaling:
1. When converting back to a decimal representation
2. When we need to normalize values that have been scaled multiple times
3. When we want to maintain only one level of scaling in the final result

## Examples from the Codebase

### Price and Size Scaling
```move
// When placing an order, both price and size are scaled
pool::place_leveraged_order(
    &mut pool,
    &mut margin_account,
    true,
    100 * constants::float_scaling(),  // Price scaled
    10 * constants::float_scaling(),   // Size scaled
    2 * constants::float_scaling(),    // Leverage scaled
    test.ctx(),
);
```

### Liquidation Calculations
In the liquidation functions, we see both multiplication and division by float_scaling:

```move
// In check_and_remove_liquidated_bid:
let maintenance_margin = 
    bid.size() * bid.price() * maintenance_margin_rate / 100 / constants::float_scaling();
// Divide by float_scaling because size and price are already scaled

let liquidation_price =
    bid.price() - (initial_margin - maintenance_margin) / bid.size() * constants::float_scaling();
// Multiply by float_scaling to maintain precision after division
```

## Common Patterns

1. **Initial Values**: Always multiply by float_scaling when setting initial values
   ```move
   const DEFAULT_PRICE: u64 = 100 * FLOAT_SCALING;
   ```

2. **Division Operations**: When dividing scaled values, we often need to multiply by float_scaling to maintain precision
   ```move
   result = (scaled_value1 / scaled_value2) * FLOAT_SCALING;
   ```

3. **Multiple Scaled Values**: When multiplying multiple scaled values, we need to divide by float_scaling to maintain a single level of scaling
   ```move
   result = (scaled_value1 * scaled_value2) / FLOAT_SCALING;
   ```
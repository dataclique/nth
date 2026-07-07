# Orderbook Sorting: Why Insertion Sort

`strike::orderbook` keeps each book side as a `vector<Order>` sorted
best-price-first and restores order with `vector::insertion_sort_by!` after
every append. This document records why that is the deliberate choice, not
a default.

## The workload

Sorting happens in exactly one place: `place_limit_order` appends the
resting remainder of a new order and re-sorts that side. Every other
operation preserves order:

- **Matching** consumes from index 0 (the best price) and removes
  fully-filled makers — order preserved.
- **Cancellation** removes at an index — order preserved.
- **Liquidation** sweeps once, removing in place — order preserved.

So the input to every sort call is a fully sorted vector with **one
out-of-place element at the end**.

## Why insertion sort wins on this workload

**On almost-sorted input it is linear.** Each already-placed element costs
one comparison; the appended order bubbles exactly as far as its price
rank requires. Total: O(n) comparisons, O(distance) swaps.

**Nothing can beat it on a contiguous vector.** Inserting into a sorted
array requires shifting every element behind the insertion point — an
Ω(distance) element-movement lower bound. A binary search
(`vector::insert` after finding the index) saves comparisons but pays the
identical shift, with more code. `merge_sort_by!` pays O(n log n) plus
stack bookkeeping to rediscover order that is already there.

**Stability is load-bearing.** Insertion sort is stable, and both
comparators are non-strict (`ge` for bids, `le` for asks), so orders at
the same price level keep their arrival order. That is **price-time
priority** — the fairness property `test_equal_price_orders_fill_in_time_priority`
pins. A binary heap would give O(log n) inserts and is the classic
CS-textbook answer, but heaps are not stable: equal-priced orders would
fill in arbitrary order, silently breaking FIFO fairness. Do not "optimize"
the comparators to strict inequalities either — `gt`/`lt` make the sort
unstable for equal prices.

**The Sui fee model rewards small constants, not asymptotics.** Gas meters
computation per instruction and storage per byte written. Every mutation
of the shared `Pool` rewrites the object regardless of algorithm, so at
on-chain book sizes the flat, allocation-free inner loop of insertion sort
(no recursion, no auxiliary vectors, cache-friendly contiguous scans)
costs less than asymptotically better structures with pointer chasing
through dynamic fields.

**Books are small by construction.** A `vector`-backed book lives inside
the Pool object and is bounded by Sui object-size limits and by gas per
transaction — realistically tens to low hundreds of resting orders. The
stdlib's own guidance recommends insertion sort below ~30 elements and for
nearly-sorted input; both apply here, and the nearly-sorted property is
structural, not probabilistic.

## When to revisit

The vector book stops being right when any of these hold:

- A side regularly holds **hundreds of orders**, making the O(n) shift on
  insert and the whole-object rewrite the dominant gas cost.
- The book must grow **beyond a single object's size limit**.
- Matching must skip levels without scanning (sparse, wide books).

The known upgrade path on Sui is DeepBook's approach: a crit-bit tree /
`BigVector` over dynamic fields, giving O(log n) level lookup and paying
per-field storage instead of whole-object rewrites. That is a data-model
migration (shared-object layout change), so it warrants its own design
pass — bump `Pool.version` and migrate explicitly per the upgrade
discipline in [contracts/AGENTS.md](../contracts/AGENTS.md).

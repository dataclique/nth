# 01. Sorted vector with stable insertion sort for orderbook sides

- Status: Accepted
- Date: 2026-07-07
- Issue: none — decision made and implemented during the review of PR #7
  (feat/orderbook); no tracker issue exists for this repo.

## Context

`strike::orderbook` stores each book side as a `vector<Order>` inside the
shared `Pool` object, sorted best-price-first (bids descending, asks
ascending). The matching engine consumes from index 0, cancellation and
liquidation remove in place — all order-preserving. The only operation
that disturbs sortedness is `place_limit_order` appending the resting
remainder of one new order.

Three domain constraints shape the choice of how to restore order:

- **Price-time priority is a fairness invariant.** Orders at the same
  price level must fill in arrival order (FIFO). Whatever maintains the
  sort must not reorder equal-priced orders.
- **Sui's fee model meters computation per instruction and storage per
  byte written.** Every mutation rewrites the whole Pool object, so at
  on-chain book sizes constant factors dominate asymptotics, and
  auxiliary allocation is pure gas overhead.
- **Books are small by construction.** A vector-backed book is bounded by
  Sui object-size limits and per-transaction gas — realistically tens to
  low hundreds of resting orders per side.

## Decision

Keep each side a contiguous sorted `vector<Order>` and restore order
after every append with the stdlib's stable
`vector::insertion_sort_by!`, using **non-strict** comparators (`ge` for
bids, `le` for asks).

On the almost-sorted input this workload produces (one out-of-place
element at the end), insertion sort is O(n) comparisons with O(distance)
swaps, allocation-free, recursion-free, and stable — equal-priced orders
keep arrival order, which is exactly the price-time-priority invariant.
`orderbook_tests::test_equal_price_orders_fill_in_time_priority` pins the
property; the comparators must stay non-strict, since strict `gt`/`lt`
comparators would make the sort unstable at equal prices.

## Alternatives Considered

### Binary search + `vector::insert`

- Pros: O(log n) comparisons to find the insertion point; no comparator
  subtleties.
- Cons: `vector::insert` shifts every element behind the insertion point,
  so total cost stays O(n); more code than one macro call.
- Rejected because: inserting into a contiguous sorted array has an
  Ω(distance) element-movement lower bound regardless of how the position
  is found — the shift dominates, so the extra code buys nothing.

### `vector::merge_sort_by!`

- Pros: O(n log n) worst case on arbitrary input; also stable.
- Cons: pays full sorting cost plus stack bookkeeping to rediscover order
  that is already there; the stdlib itself recommends insertion sort for
  small or nearly-sorted vectors.
- Rejected because: the input is structurally almost-sorted (one appended
  element), where insertion sort is linear and strictly cheaper.

### Binary heap (priority queue per side)

- Pros: O(log n) insert and pop-best — the textbook answer for a price
  queue.
- Cons: heaps are not stable, so equal-priced orders would fill in
  arbitrary order, silently breaking FIFO fairness; heap order also
  breaks the ordered iteration that cancellation scans and tests rely on.
- Rejected because: it trades the price-time-priority invariant — a
  correctness property — for asymptotics that do not pay for themselves
  at on-chain book sizes.

### Crit-bit tree / BigVector over dynamic fields (DeepBook's design)

- Pros: O(log n) level lookup; scales past a single object's size limit;
  per-field storage instead of whole-object rewrites.
- Cons: substantially more code and object plumbing; pointer chasing
  through dynamic fields costs more gas than contiguous scans at small n;
  a shared-object layout change.
- Rejected because: it solves a scale this prototype does not have. It is
  the known upgrade path, not the starting point.

## Consequences

- Placement cost grows linearly with book depth; matching, cancellation,
  and liquidation stay order-preserving with no re-sort.
- The non-strict comparators are load-bearing: "optimizing" `ge`/`le` to
  `gt`/`lt` breaks FIFO fairness without failing the sort itself. The
  time-priority test guards this.
- Sorting stays private to `strike::orderbook`; no other module observes
  or maintains book order.
- Revisit (superseding this record) when a side regularly holds hundreds
  of orders, the book must outgrow a single object, or matching must skip
  price levels without scanning — the DeepBook-style structure above is
  the expected successor, migrated explicitly via the `Pool.version`
  field per the upgrade discipline in
  [contracts/AGENTS.md](../contracts/AGENTS.md).

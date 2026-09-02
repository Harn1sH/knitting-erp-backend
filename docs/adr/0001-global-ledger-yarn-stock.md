# Global Ledger for Yarn Stock

Stock is managed as a global ledger of immutable transfer records rather than mutating original receipt documents or maintaining a single mutable balance row per yarn type.

## Context
When job cards are completed, clients often leave leftover yarn with us for future jobs. We needed a way to transfer this yarn between job cards belonging to the same client. We had to decide whether to mutate the original `YarnInwardItem` to reflect the transfer, create a mutable balance table, or use an immutable ledger.

## Decision
We decided to use an immutable ledger for stock movements (`YarnStockLedger`). The original `YarnInwardChallan` and `YarnInwardItem` remain untouched as historical records of physical receipt. 
When yarn is moved to stock, a `STOCK_IN` ledger entry is created referencing the source job card and original challan (matched via heuristics on yarn name/color/dia).
When yarn is moved to a new job card, a `STOCK_OUT` ledger entry is created pointing to the target job card. 
The available stock is computed dynamically as `sum(STOCK_IN) - sum(STOCK_OUT)`.

## Consequences
- The original GRN documents accurately reflect physical supplier deliveries without being altered by later internal transfers.
- Full provenance is maintained, allowing target job cards to display the original GRN details.
- Stock balances are fully auditable and can be reconstructed from history.

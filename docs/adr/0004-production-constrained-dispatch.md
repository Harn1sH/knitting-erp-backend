# Production-Constrained Dispatch (Delivery Challan) Validation

Delivery Challans (DC) and dispatch actions for a Job Card are constrained strictly by the actual quantity of fabric knitted and recorded in `ProductionLog` (`totalProductionWeight - totalFabricDelivered`), rather than unknitted yarn inward receipts.

## Context
Previously, Delivery Challan creation validated dispatchable quantity against `yarnInwardItem.netWeight - alreadyDelivered`. However, yarn received is raw material, not finished knitted fabric. Allowing delivery challans before production is logged led to phantom dispatches of fabric that had not yet been knitted on the machines, and made it possible to dispatch more fabric than was physically completed.

## Decision
1. Delivery Challan creation is permitted only when `availableProduced = totalProductionWeight - totalFabricDelivered > 0`.
2. Under the Job Card Dispatch Records tab, the "Add" button and DC modal are visible only when `availableProduced > 0`. When no fabric is available, an informational banner guides the operator to log production first.
3. The New Delivery Challan (DC) popup validates that the dispatched weight (`quantityKg`) does not exceed `availableProduced`, providing live feedback and disabling submission if exceeded.
4. The backend `DeliveryService.createDeliveryChallan` transaction validates that `alreadyDelivered + totalNewQty <= totalProductionWeight`, throwing a `BadRequestException` if exceeded.
5. `JobcardService` aggregates `ProductionLog` weight alongside delivery sums in `getJobCardCore`, `getDispatchRecords`, and `getFullJobCard` to deliver `totalProductionWeight` without extra frontend API roundtrips.

## Consequences
- Finished fabric cannot be dispatched unless production logs have recorded its completion.
- Operators receive immediate visual feedback on available finished stock ready for dispatch.
- Database integrity is enforced at the transaction boundary.
- Over-dispatch beyond physical knitted output is strictly prevented.

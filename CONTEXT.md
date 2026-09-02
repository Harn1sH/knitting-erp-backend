# Knitting ERP Domain

The core domain for managing knitting jobs, yarn inventory, and production.

## Language

**Job Card**:
A manufacturing order for a specific client detailing the fabric to be produced, machines used, and yarn required.
_Avoid_: Order, Ticket

**Client**:
The customer who orders the job and owns the yarn.
_Avoid_: Customer, Party

**Yarn Inward Challan**:
A historical receipt document recording the physical delivery of yarn from a supplier for a specific job card.
_Avoid_: Receipt, GRN

**Stock**:
A global, client-segregated warehouse of leftover yarn from completed or partially completed job cards, available for use in future job cards for the same client.
_Avoid_: Inventory, Warehouse

**Stock Transfer**:
An immutable ledger record moving a quantity of yarn either from a Job Card to Stock, or from Stock to a Job Card.
_Avoid_: Movement, Split

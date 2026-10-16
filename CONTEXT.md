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
A historical receipt document (GRN) recording the physical delivery of yarn from a supplier for a specific job card, linked directly to the specified fabric item.
_Avoid_: Receipt, GRN

**Stock**:
A global, client-segregated warehouse of leftover yarn from completed or partially completed job cards, available for use in future job cards for the same client.
_Avoid_: Inventory, Warehouse

**Stock Transfer**:
An immutable ledger record moving a quantity of yarn either from a Job Card to Stock, or from Stock to a Job Card.
_Avoid_: Movement, Split

**Fabric Construction**:
The physical circular structure of the knitted fabric output, categorized as either Tubular or No Drop. Defined strictly at the Job Card's Fabric Item level; all dispatches, delivery records, and challan PDFs directly reflect the parent Fabric Item's construction.
_Avoid_: Finish, Structure, Form

**Fabric Type**:
The knit stitch architecture (e.g., Single Jersey, Rib, Fleece) selected from the master catalog.
_Avoid_: Knit Pattern, Cloth Type

**DIA (Diameter)**:
The cylinder diameter in inches of the circular knitting machine required for a Job Card's fabric specification, selected from the DIA master catalog and assigned directly at the Job Card level.
_Avoid_: Machine Size, Width, Gauge

**Remaining Required Weight**:
The unproduced portion of a Job Card's order quantity (`orderQuantity - alreadyProduced`), showing operators exactly how much fabric remains to fulfill the work order.
_Avoid_: Remaining Capacity, Allowed Remaining

**Production Tolerance**:
The operational buffer of up to 5 kg beyond the order quantity (`orderQuantity + 5 kg`) allowed when recording production logs to accommodate natural roll cut-off variances.
_Avoid_: Over-production, Excess Buffer

**Available Produced Fabric**:
The quantity of knitted fabric physically produced but not yet dispatched for a Job Card (`totalProductionWeight - totalFabricDelivered`). Delivery Challans may only be created when this value is strictly greater than zero, and the dispatched weight cannot exceed this available amount.
_Avoid_: Dispatchable Stock, Net Stock, In-hand Fabric

**Production Week**:
The weekly operational tracking window defined strictly from Sunday through Saturday.
_Avoid_: Monday-to-Sunday week, ISO week

**Production Month**:
The monthly operational tracking window spanning from the 1st day through the last calendar day of the selected month.
_Avoid_: Rolling 30 days

**Shift Total**:
The aggregated count of rolls completed and net fabric weight (in kg) produced by all operators within a single operational shift (Day or Night) on a given date.
_Avoid_: Shift Summary, Batch Total

**Yarn Return Description**:
The fabric item composition or yarn specification recorded on a Yarn Return line and delivery challan PDF, directly matching the parent Job Card's fabric item composition.
_Avoid_: Type, Yarn Name

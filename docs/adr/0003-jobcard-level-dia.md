# Job Card Level DIA (Diameter)

DIA (machine cylinder diameter) is modeled and stored as a singular attribute on the `JobCard` entity rather than on `FabricItem` or being entered repetitively on individual production logs.

## Context
Previously, DIA was loosely stored on `ProductionLog` and `DeliveryItem`, but was missing from the Job Card creation and specification. Because each Job Card in the knitting operations corresponds to a single fabric item and a specific circular machine diameter, users need DIA specified at work order creation and enforced across the production workflow (production log creation, filtering, and job card inspection).

## Decision
We added `dia String?` to the `JobCard` database schema and creation form, populated from the DIA master entries (`MasterEntry` category `DIA`). The backend exposes DIA-filtered active job cards (`GET /jobcard/get-active-jobcards-by-dia`), and DIA is propagated from the Job Card into the production logs and job card summary details.

## Consequences
- Every new Job Card has a designated DIA specified during creation.
- Existing job cards without DIA default to `null` and remain backwards compatible.
- The Job Card detail view (`/jobCards/:id`) displays DIA as a core fabric specification alongside Fabric Type, Construction, GSM, and Composition.
- Downstream logs (Production Logs, Yarn Inward grouping, Delivery Challans) can consistently resolve the Job Card's DIA.

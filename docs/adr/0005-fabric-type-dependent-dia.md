# Fabric Type Dependent DIA & Numerical PDF Formatting

DIA (machine cylinder diameter) master entries are associated with a specific `fabricType`, and PDF challans extract the leading numerical gauge for document display.

## Context

Different circular knitting fabric types require specific machine diameters and needle configurations (e.g., Single Jersey machines run sizes like `14A`, `14B`, `15A`, `17B`, `18`, while Single Ribbed machines run sizes like `30RIB`, `32RIB`, `34RIB A`, `36 RIB A`). 

Previously, DIA master entries formed a single flat category. Operators creating Job Cards had to scroll through all machine diameters regardless of the fabric type selected. In addition, internal machine identifiers (such as suffix codes `RIB`, `A`, `B`) are required by floor operators to select the specific machine variant, but external documentation (delivery challans and invoices) must present standard cylinder diameter numbers (e.g. `32` instead of `32RIB A`).

## Decision

1. **Schema & Masters**: Added an optional `fabricType String?` column to `MasterEntry`. When adding or editing entries in the `DIA` master category, the user designates the applicable `Fabric Type`.
2. **Cascading Selection**: On Job Card creation (`/jobCards/new`), DIA options are dynamically retrieved filtered by the chosen `fabricType`. When the fabric type is modified, the DIA value resets and the options reload.
3. **Leading Numeric PDF Extraction**: When generating Delivery Challans and Invoices, DIA values are parsed via `/^(\d+)/` to isolate the leading numerical digits, ensuring downstream customer-facing PDFs remain formatted without operational suffix codes.

## Consequences

- Faster and error-free job card creation as operators are only presented with valid DIA sizes for the chosen fabric structure.
- Shop-floor precision is retained in the database while maintaining clean numerical formatting on dispatches and invoices.
- Backward compatibility is preserved for existing data.

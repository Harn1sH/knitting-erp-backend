# Client Identity Foreign Key on JobCard

Job cards use a formal foreign key to the `Client` model instead of relying solely on a denormalized string match.

## Context
Originally, `JobCard` stored the client name as a plain string (`customerName`), and the `Client` model was matched by string comparison at query time. With the introduction of client-scoped yarn stock, relying on string matching for ownership boundaries became too fragile and error-prone (e.g., casing issues, typos).

## Decision
We added a `clientId` foreign key to `JobCard` pointing to the `Client` model. This key is the authoritative source of client identity for scoping stock transfers. To ease migration, the field is initially nullable, and existing records will be backfilled via script. The denormalized `customerName` field is retained for display convenience to avoid a massive refactor across the entire codebase.

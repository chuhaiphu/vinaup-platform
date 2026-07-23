# Permission Granularity Pattern

[RBAC-ReBAC-PATTERN](RBAC-ReBAC-PATTERN.md) is the **mechanism** doc: the data model, the CASL
engine, the guards.

1. What is grantable, and at what granularity? (§2–§3)
2. Where does a new permission requirement belong? (§4–§5)

---

## 1. Three sources of authority

Every authorization rule answers one question, and the answer decides everything downstream —
not the verb, not the entity:

> **Where does the authority to do this come from?**

There are exactly three possible answers:

| # | Authority comes from…                                                                       | Model     | The rule lives in                                              |
| - | ------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------- |
| 1 | a **role** held in an organization — grantable over *all* records of a kind                 | RBAC      | the permission catalog, edited in the role matrix              |
| 2 | a **relationship** with one specific record — assigned to it, designated by it, addressed by it | ReBAC     | an edge table (assignment, signature), managed in that resource's own UI |
| 3 | **nothing configurable** — the rule must hold no matter what anyone configures              | Invariant | in guard/service; appears in no UI   |

Signals that the answer is **relationship**, not role:

- access is granted on *one specific resource* to *specific users* (a designated signer);
- a legitimate actor is *outside* the record's organization (an invited tour director);
- the business sentence contains *"their own / assigned to / designated for"*.

---

## 2. The grantable unit — the cell and the catalog

### 2.1 A cell has three parts

The catalog (`OrganizationPermission`) is a flat list of **cells**. One cell is one grantable
statement:

```
( resource , action , scope? )
   noun      verb     qualifier — optional
```

- **resource** — the kind of thing acted on. One resource per persisted table.
- **action** — the verb. `CREATE` / `READ` / `UPDATE` / `DELETE` as the baseline.
- **scope** — narrows the cell to a *subset* of the resource. No scope = the whole resource.

Granting is inserting one `OrganizationRolePermission` row against a cell; revoking is deleting
it.

### 2.2 The catalog is jagged

> **The catalog contains only the cells that exist in the business.

Two states look similar in a UI but are fundamentally different:

| State                       | Meaning                                                                 | Controlled by                                  |
| --------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| cell exists, **not granted** | the organization owner may grant it later                               | per-organization configuration (tick a checkbox) |
| cell **does not exist**      | the action is meaningless because nobody can grant it, not even `OWNER` | code — the seed. |

A received booking belongs to the *sending* organization; the receiver editing or deleting it is
not "permission not granted" — it is "**cell does not exist**". The seed simply never creates
`(BOOKING, UPDATE, RECEIVED)`.

The catalog is therefore jagged in **both** directions, by design: a resource may lack actions
(received bookings are read-only), and an action may exist for a single resource (`CANCEL` only
on settlements).

### 2.3 Scope — one truth, three forms

A scope is **one stored fact** that takes three representations as it travels. These are not
three mechanisms:

```
ONE truth: "this role may only touch SELL invoices"
│
├─ At rest (DB)     scope = 'SELL'                — a column on the catalog row
│
├─ At check (RAM)   { type: 'SELL' }       — the CASL `conditions`
│                     the engine compares it against the actual record
│
└─ At query (SQL)   WHERE type IN ('SELL') — the list service asks the SAME ability
                      which codes pass, then filters on that set (no @casl/prisma)
```

The point check (*"may I touch **this**
record?"*) and the list filter (*"**which** records may I see?"*) must derive from the same rule
source.

Two CASL semantics this relies on (both are engine facts, detailed in the mechanism doc):

- checking a **subject type** (`can('READ', 'INVOICE')`) asks *"may I read at least ONE
  invoice?"* — right for gating a tab or passing a list route;
- checking an **instance** (`can('READ', invoiceRecord)`) evaluates the conditions against the
  record — right for one record's button or a `:id` route.

---

## 3. Choosing the granularity axis

When permissions must become finer, exactly one of three axes applies.

### 3.1 The three axes

| The split is by…                                  | Do this                                                        | Example                                                              |
| ------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| a **different table** — own lifecycle, own routes | add a **resource**                                             | Tour → `TOUR`, `TOUR_CALCULATION`, `TOUR_IMPLEMENTATION`, `TOUR_SETTLEMENT` |
| a **field value** on the same table               | add **scoped cells** (§2.3)                                    | Invoice → scopes `SELL` / `BUY` over `type`               |
| the **viewer's relationship** to the record       | not a catalog split at all | Booking "sent vs received" — no `direction` column exists |


### 3.2 The litmus test

Before splitting anything, one question:

> **Will a real role ever need this permission on one subset but not the other?**

- **No** → do not split. One cell covers the whole resource. YAGNI applies to catalogs exactly
  as it applies to code — an unused split is pure surface area.
- **Yes** → split along the correct axis of §3.1.

### 3.3 Viewer-relative scope

A scope's condition may reference the viewer's organization rather than a constant — Booking
`SENT` = `organizationId = <viewer org>`, `RECEIVED` =
`organizationCustomer.clientOrganizationId = <viewer org>`. This is expressible because the
ability is built per user per organization, so the value interpolates at build time. It remains
an ordinary scope (§2.3) — use it only when the litmus test demands separate grants per
direction. Today it does not: one unscoped `READ BOOKING` covers both directions, and which rows
the viewer sees is data scoping.

---

## 4. New verbs — the verb test

A new verb (*sign*, *cancel*, *lock*, *approve*) is not inherently RBAC or ReBAC. Classify it by:

> **Can this permission be granted to a ROLE, applying to ALL records of the type?**

- **Yes** — *"the chief accountant may cancel **any** settlement"* → **RBAC**. Add the verb to
  `PERMISSION_ACTION` and seed only the cells where it exists — `(TOUR_SETTLEMENT, CANCEL)`.
- **No** — it only means something on a specific record tied to a specific person — *"sign the
  signature **designated to you**"*, *"manage the tour **assigned to you**"* → **ReBAC**. The
  authority lives on the edge; no catalog cell exists; the role matrix never shows the verb.

---

## 5. The decision procedure

The synthesis of §1–§4. Every new permission requirement lands in exactly one branch, checked in
order:

```
A new permission requirement appears
│
├─ 1. Is it a new TABLE / entity?
│     → new RESOURCE in the catalog.                          
│
├─ 2. Same table, split by a FIELD VALUE?
│     → scoped cells: scope.                
│
├─ 3. Split by the RELATIONSHIP between a person and one record?
│     (assigned to, designated signer, receiving org)
│     → ReBAC: the grant lives on an EDGE. Never in the role matrix.
│
├─ 4. A new VERB beyond create/read/update/delete?
│     → run the verb test.
│
└─ 5. A rule that must NEVER be configurable?
      → INVARIANT, hard-coded. No catalog, no UI.
```

---

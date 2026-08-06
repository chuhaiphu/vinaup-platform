# RBAC & ReBAC Enforcement Flow

What one request goes through at runtime. The models, data and engines behind it are in
[RBAC-ReBAC-PATTERN](../../pattern/RBAC-ReBAC-PATTERN.md); this doc is only the walk-through.

A request takes **one** of three flows, decided by the route's plane
([RBAC-ReBAC-PATTERN](../../pattern/RBAC-ReBAC-PATTERN.md) §6):

| The route acts on…                                            | Flow                                       |
| ------------------------------------------------------------- | ------------------------------------------ |
| an organization's documents (`Booking`, `Invoice`, `Tour`, …) | **Flow 1** — `OrganizationPermissionGuard` |
| a tour's execution (crew assignments)                         | **Flow 2** — `TourImplementationAccessGuard`             |
| a `ReceiptPayment` read/mutation or `Signature` mutation (decided in the service) | **Flow 3** — service-enforced        |

> **Preconditions (all flows).** `JwtAuthGuard` has already proven the access JWT →
> `req.user.userId`. There is **no** ambient organization: whatever scope a flow needs (the owning
> organization, or the tour) it resolves itself. Every flow starts from a proven user and derives the
> rest.

---

## Flow 1 — Organization RBAC guard

`OrganizationPermissionGuard` reads the route's `@CheckAbility(action, resource)` cell, then branches on one thing: **does the route have an `:id`?**

| | **1a — route has `:id`** | **1b — route has no `:id`** |
| --- | --- | --- |
| e.g. | `PUT /tour/:id`, `DELETE /invoice/:id` | `POST /booking`, `GET /booking/organization/:id` |
| Organization from | the record itself, loaded by record id | the request: `params.organizationId ?? body.organizationId` (absent → 403) |

### Flow 1a — acting on an existing record (`:id`)

```ts
@UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
@CheckAbility(PERMISSION_ACTION.UPDATE, PERMISSION_RESOURCE.TOUR)
@Put(':id')
```

- **Resolve the record** — load the target by id.
- **Personal short-circuit** — some resources (`Invoice`, `Project`) can be personal, with no owning
  organization. When `organizationId` is null there is no matrix to consult: only the creator may act.
- **Check membership** — the caller must be an `ACTIVE` member of that organization, not `LOCKED`.
- **Ownership short-circuit** — if the caller created the record, they may always act on it; the
  guard returns without consulting the matrix.
- **Decide** — load the caller's role permissions in this organization fresh from the DB,
  `getUserAbility(rows)` → `ability.can(action, resource)`.

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant P as OrganizationPermissionGuard
    participant DB as Prisma/DB
    participant H as Route handler

    C->>P: PUT /tour/:id<br/>(JWT proven · req.user.userId)
    Note over P: Read metadata<br/>@CheckAbility(UPDATE, TOUR)
    P->>DB: resolve Tour(:id)<br/>select organizationId + createdByUserId
    DB-->>P: { organizationId, createdByUserId }
    alt organizationId is null (personal record)
        Note over P: creator? → proceed · else 403 PERMISSION_DENIED
    end
    P->>DB: OrganizationMember(userId, organizationId)<br/>select status
    DB-->>P: { status }
    break not a member
        P-->>C: 403 ORGANIZATION_NOT_MEMBER
    end
    break status = LOCKED
        P-->>C: 403 ORGANIZATION_MEMBER_LOCKED
    end
    alt caller is the record creator
        P->>H: proceed (ownership)
    else
        P->>DB: role permissions in this organization<br/>(userId, organizationId → action + resource)
        DB-->>P: [{ action, resource }, …]
        Note over P: Decide<br/>getUserAbility(rows)<br/>ability.can(UPDATE, TOUR)
        break cannot
            P-->>C: 403 ORGANIZATION_PERMISSION_DENIED
        end
        P->>H: proceed
    end
    H-->>C: 200
```

### Flow 1b — acting on a collection, or creating (no `:id`)

```ts
@UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
@CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.BOOKING)
@Get('/organization/:organizationId')   // a collection scoped to an organization

@UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
@CheckAbility(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.BOOKING)
@Post('/')                              // create — organization named in the body
```

- **Resolve the organization** — no record to load, so read it straight from the request:
  `params.organizationId ?? body.organizationId`. Absent → `403` (organization not specified).
- **Check membership** — the caller must be an `ACTIVE` member of that organization, not `LOCKED`.
- **Decide** — `getUserAbility(rows)` → `ability.can(action, resource)`; refusal throws
  `OrganizationPermissionDeniedException`.

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant P as OrganizationPermissionGuard
    participant DB as Prisma/DB
    participant H as Route handler

    C->>P: POST /booking · GET /booking/organization/:id<br/>(JWT proven · req.user.userId)
    Note over P: Read metadata<br/>@CheckAbility(CREATE / READ, BOOKING)
    Note over P: organizationId =<br/>params.organizationId ?? body.organizationId
    break organizationId absent
        P-->>C: 403 (organization not specified)
    end
    P->>DB: OrganizationMember(userId, organizationId)<br/>select status
    DB-->>P: { status }
    break not a member
        P-->>C: 403 ORGANIZATION_NOT_MEMBER
    end
    break status = LOCKED
        P-->>C: 403 ORGANIZATION_MEMBER_LOCKED
    end
    P->>DB: role permissions in this organization<br/>(userId, organizationId → action + resource)
    DB-->>P: [{ action, resource }, …]
    Note over P: Decide<br/>getUserAbility(rows)<br/>ability.can(action, resource)
    break cannot
        P-->>C: 403 ORGANIZATION_PERMISSION_DENIED
    end
    P->>H: proceed
    H-->>C: 200
```

---

## Flow 2 — Tour implementation access guard

Example route (managing a tour's crew):

```ts
@UseGuards(JwtAuthGuard, TourImplementationAccessGuard)
@CheckTourImplementationAccess({ source: 'param', idKey: 'id', targetResource: TOUR_TARGET_RESOURCE.TOUR_IMPLEMENTATION })
@Post(':id/members-assigned')
```

The plane splits cleanly into **two stages**, driven by two independent knobs a route sets on
`@CheckTourImplementationAccess`:

- **① Resolve** — walk from the route's id to the owning `tourImplementationId`. The `targetResource`
  says which model the id is, and therefore how many hops the walk takes (`readTargetId` reads the id,
  `resolveTourImplementationId` walks it):

  | `targetResource` | the id points to | hops |
  | --- | --- | --- |
  | `TOUR_IMPLEMENTATION` | the implementation itself | 0 |
  | `TOUR` | a `Tour` (1:1 with its implementation) | 1 |
  | `TOUR_IMPLEMENTATION_ASSIGNMENT` | an assignment | 1 |
  | `USER_ASSIGNED_TOUR_IMPLEMENTATION` | a user-assignment | 2 |

- **② Decide** — `assertTourImplementationAccess(tourImplementationId, userId, { requiredAccessLevel })`,
  the single ReBAC engine. `requiredAccessLevel` is the bar the **route** demands — not the caller's level;
  the engine derives what the caller *holds* (owner / member-assigned / user-assigned rows) from the DB and
  checks it clears the bar. `MANAGER` (the default — crew management, cleared by the org `OWNER` or a
  **member-assigned** user) or `ASSIGNEE` (also admits a non-member **user-assigned** tour guide/driver).


```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant G as TourImplementationAccessGuard
    participant DB as Prisma/DB
    participant H as Route handler

    C->>G: POST /tour-implementation/:id/members-assigned<br/>(JWT proven · req.user.userId)
    Note over G: ① Resolve tourImplementationId<br/>from the id + targetResource (0–2 hops)
    G->>DB: walk targetResource → tourImplementationId
    DB-->>G: tourImplementationId
    Note over G: ② Decide — assertTourImplementationAccess(implId, userId, requiredAccessLevel)<br/>guard requiredAccessLevel = MANAGER (default)
    G->>DB: implementation exists?
    DB-->>G: { organizationId } / null
    break not found
        G-->>C: 404 TOUR_IMPLEMENTATION_NOT_FOUND
    end
    G->>DB: OWNER of the tour's organization?
    DB-->>G: owner? yes/no
    alt is owner
        G->>H: proceed (owner-implies-access)
    else not owner
        G->>DB: member-assigned?
        DB-->>G: yes/no
        alt member-assigned
            G->>H: proceed (MANAGER)
        else not member-assigned
            opt requiredAccessLevel = ASSIGNEE
                G->>DB: user-assigned? (tour guide/driver)
                DB-->>G: yes/no
            end
            break not member, and not (ASSIGNEE and user-assigned)
                G-->>C: 403 TOUR_IMPLEMENTATION_ACCESS_DENIED
            end
            G->>H: proceed (ASSIGNEE)
        end
    end
    H-->>C: 200
```

---

## Flow 3 — Service-enforced routes

Some routes carry **only** `JwtAuthGuard` — no authorization guard — because the deciding fact is
known only once the service reads the record. Authorization runs inside the service. Two routes are
in this class.

### Flow 3a — Receipt payment (plane selected by the parent)

Every `ReceiptPayment` route that touches a specific record — **reads and mutations alike** — carries
**only** `JwtAuthGuard`, no authorization guard, because which plane governs it depends on the parent the
receipt payment attaches to, a fact known only once the service reads it
([RBAC-ReBAC-PATTERN](../../pattern/RBAC-ReBAC-PATTERN.md) §6). On create the parent comes from the request
body; on read/update/delete of a specific record it is read from the stored receipt payment; on a
parent-collection read it is the URL's parent id. Read and write collapse to the **same** rule — who may
see a receipt payment is exactly who may write it (the org plane checks ACTIVE membership, not a separate
`READ` cell, so a read must never be stricter than the write it mirrors). Two methods share one
plane-selection: `assertReceiptPaymentAccessByParent` (from a parent input) and
`assertReceiptPaymentAccessById` (from an existing record):

```mermaid
flowchart TD
    A["ReceiptPayment access<br/>read · create · update · delete<br/>· JwtAuthGuard only"] --> T{"has tourImplementationId?"}
    T -->|"yes — priority"| TI["Tour ReBAC<br/>assertTourImplementationAccess · ASSIGNEE"]
    T -->|no| S{"resolve parent → scope"}
    S -->|"org parent"| OM["Org RBAC<br/>ACTIVE member of the parent's organization"]
    S -->|"personal parent · org null"| PP["Ownership<br/>caller == parent's createdByUserId"]
    S -->|"no parent"| PR["Ownership<br/>caller == receipt payment's own createdByUserId"]
```

Read it as a tree with four leaves, each leaf is a single check — pass → the request proceeds; fail → the service throws that plane's own 403
(`TOUR_IMPLEMENTATION_ACCESS_DENIED` for the tour branch; `ORGANIZATION_NOT_MEMBER`,
`ORGANIZATION_MEMBER_LOCKED`, or `ORGANIZATION_PERMISSION_DENIED` otherwise). This is the single place a route's plane is not fixed by its guards.

### Flow 3b — Signature (per-operation edge, no org scope)

A `Signature` mutation (`sign`, `cancel`, `update-url`) also carries **only** `JwtAuthGuard`, but for
a different reason: a signature has no `organizationId` and no role matrix. Authority is a direct edge on the record — the caller must be the signature's
`targetUserId`, or, when there is no target, its original `signedByUserId`. The rule differs per
operation, so each service method enforces it on the signature it already loads, throwing
`SignatureNotAuthorizedException` on a mismatch.

Which caller may act, and the extra preconditions each operation adds:

| Operation | Edge rule (who may act) | Extra preconditions in the service |
| --- | --- | --- |
| `update-url` (`PATCH /:id/url`) | `targetUserId` set → must be the target; otherwise any authenticated user | signature exists |
| `sign` (`POST /:id/sign`) | same target-or-open rule | not already signed; a BOOKING receiver must be a member of the client organization; the sender must sign before the receiver |
| `cancel` (`POST /:id/cancel`) | `targetUserId` set → must be the target; otherwise must be the original `signedByUserId` | document type is TOUR_CALCULATION / TOUR_SETTLEMENT / BOOKING only; a BOOKING must not be COMPLETED |

---

## Deliberate decisions

- **Permissions are read from the DB on every guarded request** — never embedded in the access
  JWT. Cost: a couple of indexed queries per request. Bought: a matrix edit by the organization
  owner, or a crew change by a director, takes effect on the _next request_, not up to a token
  lifetime later when the JWT rotates. Staleness on an authorization decision is the wrong trade.
- **Denial names the reason.** RBAC refusals are one of three HTTP 403 codes —
  `ORGANIZATION_NOT_MEMBER`, `ORGANIZATION_MEMBER_LOCKED`, `ORGANIZATION_PERMISSION_DENIED`;
  tour-implementation-access refusals carry their own 403
  ([ERROR-CODE-REFERENCE](../../reference/ERROR-CODE-REFERENCE.md)). Separating them keeps "you are not
  in this organization" distinct from "your role lacks this cell" distinct from "you are not on this
  tour" — and the client owns the Vietnamese copy for each, keyed by code.
- **One plane per route.** A route's guards fix its plane (Flow 1 or Flow 2); the exceptions are the
  service-enforced routes (Flow 3) — receipt-payment reads and mutations, whose plane the service selects, and
  the signature mutation, whose per-operation edge the service checks directly. No route runs two
  authorization guards.

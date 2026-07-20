# Default Role–Permission Matrix

Factory-default grants for the 2 system roles, seeded per organization. Source of truth:
`packages/permission/src/default-role-permissions.ts` — edit + reseed to change a default.
The organization owner edits these cells in Settings, effective immediately.

## Hard-coded invariants (never configurable)

1. **`OWNER` is locked to `MANAGE ALL`** — full access, cannot be revoked.
2. Actions and resources are code-defined enums — configuration toggles cells, never axes.
3. Organization membership and record ownership are enforced by `OrganizationPermissionGuard` on
   every request, independent of this matrix ([RBAC-ReBAC-PATTERN](../pattern/RBAC-ReBAC-PATTERN.md) §3).

## Matrix

Actions: `CREATE` · `READ` · `UPDATE` · `DELETE`. One resource per persisted entity — each carries
its own `organizationId`, so the guard resolves scope and ownership from the record itself.
Resources grow as modules adopt `@CheckAbility`.

| Resource / Role             | OWNER | MEMBER |
| --------------------------- | :---: | :----: |
| `ORGANIZATION_MEMBER`       | ✓ all | READ   |
| `ORGANIZATION_CUSTOMER`     | ✓ all | READ   |
| `ORGANIZATION_ROLE`         | ✓ all | READ   |
| `PROJECT`                   | ✓ all | READ   |
| `PROJECT_CATEGORY`          | ✓ all | READ   |
| `INVOICE`                   | ✓ all | READ   |
| `RECEIPT_PAYMENT`           | ✓ all | READ   |
| `RECEIPT_PAYMENT_CATEGORY`  | ✓ all | READ   |
| `TOUR`                      | ✓ all | READ   |
| `TOUR_CALCULATION`          | ✓ all | READ   |
| `TOUR_IMPLEMENTATION`       | ✓ all | READ   |
| `TOUR_SETTLEMENT`           | ✓ all | READ   |
| `BOOKING`                   | ✓ all | READ   |
| `TRIP`                      | ✓ all | READ   |
| `CAR`                       | ✓ all | READ   |
| `SOCIAL_LINK`               | ✓ all | READ   |

`OWNER`'s `✓ all` is the single `MANAGE ALL` grant (invariant 1), not the cells written out.
Baseline for `MEMBER` is deliberately minimal — `READ` on each resource, enough to view the
organization's data. Members still act on records **they created** through the ownership invariant
(§2 invariant 3), and the owner widens a role by granting more cells — that is the whole point of
per-organization roles.

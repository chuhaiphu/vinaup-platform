# Guard Pattern

## What

A guard is a gatekeeper evaluated before a request reaches its handler: it inspects the request context and decides whether execution may proceed, rejecting it otherwise. It isolates access-control decisions from the logic they protect, so handlers run only for requests already proven allowed.

### Mental model — the request lifecycle

A guard is one stage in a fixed pipeline NestJS runs for every request. The order explains what a
guard _can_ rely on (what already ran) and what it must _not_ do (work that belongs to a later stage):

```
Incoming request
  │
  ▼
Middleware        — raw req/res, no handler context yet      (Express-level)
  │
  ▼
GUARDS            — "may this proceed?" → returns a boolean   ◄── this document
  │                  has ExecutionContext (knows the target handler)
  ▼
Interceptors      — wrap the call (before half)
  │
  ▼
Pipes             — validate / transform the handler args
  │
  ▼
Route handler     — the controller method (+ its services)
  │
  ▼
Interceptors      — wrap the call (after half), reversed
  │
  ▼
Exception filters — only if something threw; map error → HTTP response
  │
  ▼
Response
```

Two consequences anchor every decision below:

- **Guards run _after_ middleware but _before_ interceptors and pipes.** So a guard sees the resolved
  target handler (via `ExecutionContext`) — middleware cannot — yet runs _before_ the body is
  validated.
- **A guard returns a `boolean` (or throws).** `true` → next stage; `false`/throw → the chain stops
  and an exception filter turns it into the HTTP response. A guard never produces the response itself.

> Within the guard stage, guards run in **binding order**: global guards first, then route-scoped
> ones left-to-right. (Source: NestJS _Request lifecycle_.)

### In this codebase

A protected route runs `JwtAuthGuard` first, then **exactly one** authorization guard — never two
(the one-guard rule, [RBAC-ReBAC-PATTERN](RBAC-ReBAC-PATTERN.md) §6):

```
Request
  │
  ▼
[1] JwtAuthGuard
  │   (authentication)
  │   sets req.user = { userId }
  ▼
[2] the route's ONE authorization guard
  │   (authorization) — reads req.user.userId set in step 1
  │   • OrganizationPermissionGuard    → org RBAC plane  (@CheckAbility cell)
  │   • TourImplementationAccessGuard  → tour ReBAC plane (@CheckTourImplementationAccess)
  ▼
Route Handler
```

If any guard fails, the remaining guards and the handler are skipped. The exception to "exactly one
authorization guard" is the service-enforced routes — receipt-payment reads and mutations (plane selected in
the service) and a signature mutation (per-operation edge checked in the service) — each carrying
**only** `JwtAuthGuard` ([RBAC-ReBAC-FLOW](../architecture/RBAC-ReBAC-FLOW.md) Flow 3).

This document covers the guard **mechanics** — the lifecycle, `JwtAuthGuard`, and how an
authorization guard composes. The authorization **rules** each guard enforces live in
[RBAC-ReBAC-PATTERN](RBAC-ReBAC-PATTERN.md) and [RBAC-ReBAC-FLOW](../architecture/RBAC-ReBAC-FLOW.md).

---

#### Guard 1 — Authentication: `JwtAuthGuard`

**Goal:** confirm the caller has a valid JWT and attach their identity to the request.

**Where `canActivate` lives — inherited, not written here.** `JwtAuthGuard` `extends AuthGuard('jwt')`, and that parent class already contains a
complete `canActivate`. We inherit it and override just **one** method — `handleRequest`.

**How the guard and the strategy connect — the string `'jwt'`** The guard never
imports or invokes `JwtStrategy`. The only wire between them is a **name** that both register under:

```
JwtAuthGuard  extends AuthGuard('jwt')                   ─┐
                                                          ├─ 'jwt'
JwtStrategy   extends PassportStrategy(Strategy, 'jwt')  ─┘
```

At startup, `PassportStrategy(Strategy, 'jwt')` registers the `JwtStrategy` instance into Passport's internal under the key `'jwt'`. At request time the inherited `canActivate` calls
`passport.authenticate('jwt', …)`, Passport looks that key up, finds `JwtStrategy`, and runs it. Swap the name = swap the strategy.

On every request the inherited `canActivate` runs these steps (the strategy work in step 2 is the
[STRATEGY-PATTERN.md](STRATEGY-PATTERN.md) document, run from _inside_ `passport.authenticate`):

```
canActivate(context)                        ← inherited from AuthGuard('jwt'); we don't write it

  1. req = context.switchToHttp().getRequest()
        → the request currently flowing through the pipeline

  2. passport.authenticate('jwt', req)
        → look the name 'jwt' up, run JwtStrategy on req:

             Strategy Step 1   extract token    jwtFromRequest(req)
             Strategy Step 2   verify token     signature + expiry
             Strategy Step 3   resolve caller   validate(payload) → { userId } | null

  3. this.handleRequest(error, user, info)  ← OUR override
        → user = whatever validate() returned in step 2

  4. handleRequest returns user (no throw)
        → Passport sets req.user = user, canActivate returns true
```

Two things the diagram makes explicit, easily missed:

- **Token in:** the strategy reads the token from the guard's request (step 1). The guard supply _which_ request to read. The strategy defines only _how_ to read it.
- **Identity out:** `validate()`'s return value flows back to the guard — Passport passes it to
  `handleRequest(error, user, info)` as `user` (`{ userId }` or `null`).

We override only `handleRequest` — to turn Passport's raw result into a domain exception:

```ts
// src/_core/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = JwtValidationReturn>(error: unknown, user: TUser | false | null, info): TUser {
    if (error instanceof Error) throw error;
    if (info) {
      if (info.name === 'TokenExpiredError' || info.name === 'JsonWebTokenError')
        throw new TokenInvalidException('Token is invalid or has expired');
      throw new TokenInvalidException(info.message);
    }
    if (!user) throw new TokenInvalidException('User is no longer valid');
    return user;
  }
}
```

On success, `req.user` is set to `{ userId }` and execution moves to guard 2.

---

#### Guard 2 — Authorization: one metadata-driven guard, not one guard per resource

**Goal:** confirm the already-identified caller may act on this specific route.

**One guard serves every resource.** There is no `OrganizationBookingMutationGuard`,
`OrganizationTourMutationGuard`, … one per entity. Two guards cover the whole surface, each reading a
decorator the route stamps on itself:

| Guard | Route declares | Enforces |
| --- | --- | --- |
| `OrganizationPermissionGuard` | `@CheckAbility(action, resource)` | org RBAC — membership + the role's matrix cell |
| `TourImplementationAccessGuard` | `@CheckTourImplementationAccess({ … })` | tour ReBAC — assigned to the implementation, or its org owner |

**Where `canActivate` lives — and how guards compose.** Each `implements CanActivate`, so it
_declares its own_ `canActivate(context)` — the method NestJS calls. It pulls the request out with
`context.switchToHttp().getRequest()`, reads `req.user.userId` (set by guard 1) **and the route's
metadata** (via `Reflector`), runs its checks, and returns `true` to continue or throws to stop the
chain. The metadata is what lets one class serve every resource: the route says _what_ it needs, the
guard knows _how_ to decide.

```ts
// src/_core/guards/organization-permission.guard.ts (shape only — full logic in RBAC-ReBAC-PATTERN §6)
@Injectable()
export class OrganizationPermissionGuard implements CanActivate {
  constructor(private reflector: Reflector, private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const cell = this.reflector.get<CheckAbilityMetadata>(CHECK_ABILITY_KEY, context.getHandler());
    if (!cell) return true; // not permission-guarded → pass through
    const { userId } = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    // resolve the record's organization → membership invariants → ownership → ability.can(cell)
    // …
  }
}
```

The step-by-step logic each guard runs — the RBAC five steps, the tour-implementation-access resolution, the
receipt-payment service selection — is documented once, authoritatively, in
[RBAC-ReBAC-FLOW](../architecture/RBAC-ReBAC-FLOW.md); it is not duplicated here.

---

#### Chaining the guards on a route

```ts
// org RBAC plane
@UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
@CheckAbility(PERMISSION_ACTION.UPDATE, PERMISSION_RESOURCE.BOOKING)
@Put('/:id')
async update(/* … */) { /* … */ }

// tour ReBAC plane
@UseGuards(JwtAuthGuard, TourImplementationAccessGuard)
@CheckTourImplementationAccess({ source: 'param', idKey: 'id', targetResource: TOUR_TARGET_RESOURCE.TOUR_IMPLEMENTATION })
@Put('/:id')
async updateTourImplementation(/* … */) { /* … */ }
```

---

## Why

Evaluating access before the handler keeps security decisions out of business logic, services run only for permitted requests and contain no auth `if`s. Separating the authentication guard from the authorization guards means "who are you?" and "may you do this?" each have one home. And driving authorization from route metadata — not one guard class per resource — means a new resource adopts the model by stamping a decorator, not by writing a guard.

---

## How

1. **Authenticate every protected route** with `@UseGuards(JwtAuthGuard)`; read the caller as `req.user.userId`.
2. **Add exactly one authorization guard** after `JwtAuthGuard`, and stamp its decorator: `OrganizationPermissionGuard` + `@CheckAbility` (org RBAC) **or** `TourImplementationAccessGuard` + `@CheckTourImplementationAccess` (tour ReBAC). Never both ([RBAC-ReBAC-PATTERN](RBAC-ReBAC-PATTERN.md) §6).
3. **Do not put the rule in the guard's caller** — the guard owns the decision; the service assumes it already passed. The rules themselves live in [RBAC-ReBAC-PATTERN](RBAC-ReBAC-PATTERN.md) / [RBAC-ReBAC-FLOW](../architecture/RBAC-ReBAC-FLOW.md).
4. **Throw the right exception** — a denial is a `ForbiddenException` subclass with a stable code (see [ERROR-CODE-REFERENCE](../reference/ERROR-CODE-REFERENCE.md) and [EXCEPTION-FILTER-PATTERN.md](EXCEPTION-FILTER-PATTERN.md)).
5. **Name guards & order the chain by convention**. → [Coding Convention §1.1](../CODING-CONVENTION.md), [§8](../CODING-CONVENTION.md)

---
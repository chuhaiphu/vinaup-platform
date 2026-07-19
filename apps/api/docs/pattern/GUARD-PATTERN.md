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

Every protected route runs two guards **in this exact order**:

```
Request
  │
  ▼
[1] JwtAuthGuard
  │   (authentication)
  │   sets req.user = { userId }
  ▼
[2] OrganizationXxxMutationGuard
  │   (authorization)
  │   reads req.user.userId set in step 1
  ▼
Route Handler
```

If any guard fails, the remaining guards and the handler are skipped.

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

#### Guard 2 — Authorization: `OrganizationBookingMutationGuard`

**Goal:** confirm the already-identified caller has permission to mutate this specific record.

**Where `canActivate` lives — and how guards compose.** `OrganizationBookingMutationGuard implements CanActivate`, so it
_declares its own_ `canActivate(context)` — the method NestJS calls for this guard. The method pulls the request out with `context.switchToHttp().getRequest()`, runs
its checks, and returns `true` to continue or throws to stop the chain.

This guard reads `req.user.userId` (set by guard 1), then applies the rule in four sequential checks:

```
1. recordId present in params?          → no  → ForbiddenException
2. Record exists in DB?                 → no  → BadRequestException
3. Caller is a member, not LOCKED?      → no  → ForbiddenException
4. Caller is OWNER  or  record creator? → no  → ForbiddenException  → yes → return true
```

```ts
// src/_core/guards/organization-booking-mutation.guard.ts
@Injectable()
export class OrganizationBookingMutationGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user.userId;
    const recordId = (request.params as Record<string, string>)?.id;
    if (!recordId) throw new ForbiddenException('Resource not specified');

    const record = await this.prismaService.booking.findUnique({
      where: { id: recordId }, select: { organizationId: true, createdByUserId: true },
    });
    if (!record) throw new BadRequestException('Booking not found');

    const member = await this.prismaService.organizationMember.findFirst({
      where: { userId, organizationId: record.organizationId },
      select: { status: true, organizationRole: { select: { code: true } } },
    });
    if (!member) throw new ForbiddenException('You do not belong to this organization');
    if (member.status === ORGANIZATION_MEMBER_STATUS.LOCKED) throw new ForbiddenException('You are locked in this organization');
    if (member.organizationRole.code === ORGANIZATION_ROLE_CODE.OWNER) return true;
    if (record.createdByUserId && record.createdByUserId === userId) return true;

    throw new ForbiddenException("You don't have permission to modify this booking");
  }
}
```

---

#### Chaining both guards on a route

```ts
// src/booking/booking.controller.ts
@UseGuards(JwtAuthGuard, OrganizationBookingMutationGuard)
@Put('/:id')
async update(/* … */) { /* … */ }
```

### The authorization rule (consistent across resources)

1. The record must exist.
2. The caller must be a member of the record's organization, and not `LOCKED`.
3. An organization **`OWNER`** may always mutate.
4. Otherwise, only the **creator** of the record may mutate it.

---

## Why

Evaluating access before the handler keeps security decisions out of business logic, services run only for permitted requests and contain no auth `if`s. Separating the authentication guard from the authorization guards means "who are you?" and "may you do this?" each have one home, and the authorization rule can be reasoned about per resource in a single, small class.

---

## How

1. **Authenticate every protected route** with `@UseGuards(JwtAuthGuard)`; read the caller as `req.user.userId`.
2. **Guard every mutation** with the resource's authorization guard, chained after `JwtAuthGuard`.
3. **Keep the rule consistent** — exists → member & not locked → owner-or-creator — and reference constants (`ORGANIZATION_MEMBER_STATUS`, the role-code constant) rather than bare strings.
4. **Throw the right exception** — `ForbiddenException` for a denial, `BadRequestException` when the target record is missing (see [EXCEPTION-FILTER-PATTERN.md](EXCEPTION-FILTER-PATTERN.md)).
5. **Name guards & order the chain by convention**. → [Coding Convention §1.1](../CODING-CONVENTION.md), [§8](../CODING-CONVENTION.md)

---
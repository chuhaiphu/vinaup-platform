# KISS — Keep It Simple, Stupid

## What

Keep It Simple, Stupid is a software design principle arguing that systems work best when they are kept simple. Complexity is a cost that must be justified by the problem it solves. Every unnecessary abstraction adds surface area that must be read, understood, and maintained. When a simpler approach solves the problem correctly, the simpler approach is the right choice.

### In this codebase

In practice:
- Controllers are **thin** — they delegate immediately and never branch on business rules.
- Validation is **schema-first** (shared Zod schemas, one global pipe), not hand-rolled `if` checks.
- Wiring is **dependency injection**, not manual `new`.
- Configuration is **typed and centralised**, not `process.env.X` scattered through the code.

### Thin controllers

A controller method is four lines: delegate, then wrap. No `if`, no try/catch, no Prisma.

```ts
// src/booking/booking.controller.ts
@UseGuards(JwtAuthGuard)
@Get('/organization/:organizationId')
async findByOrganizationId(
  @Param('organizationId') organizationId: string,
  @Query() filter: BookingFilterParam
): Promise<HttpResponse<BookingWithMeta[]>> {
  const data = await this.bookingService.findBookingsByOrganizationId(organizationId, filter);
  return { statusCode: HttpStatus.OK, message: 'Bookings retrieved successfully', data };
}
```

### Schema-first validation instead of manual checks

Input rules live in a shared Zod schema; the global `ZodValidationPipe` (registered in `src/main.ts`) parses the body before the controller is ever entered, so the method body assumes valid input.

```ts
// packages/validation/src/zod-schemas/booking.schema.ts
export const createBookingSchema = z.strictObject({
  description: z.string().trim().min(1),
  startDate: z.iso.datetime(),
  organizationId: z.string().min(1), // existence checked in the service, not here
});

// apps/api/src/booking/dtos/create-booking.request.dto.ts
export class CreateBookingRequest extends createZodDto(createBookingSchema) {}
```

The manual equivalent — reading the body, checking each field, throwing on failure — would be ~20 lines of imperative code per endpoint, repeated everywhere.

### Fail-fast guard clauses for what the schema can't check

Zod validates input *shape* — synchronously, before the controller runs. Existence and cross-entity business preconditions — "this car belongs to this organization", "no duplicate assignment" — need a query, so they stay in the service as guard clauses.

```ts
if (!trip) throw new TripNotFoundException();          // inline: one line, no I/O
await this.assertCarInOrganization(carId, orgId);      // extracted: wraps a query
```

Extract to an `assert*` helper only when the check does I/O, repeats, or reads better named — not by reflex (KISS "How" §5). → [Coding Convention §9.1](../CODING-CONVENTION.md)

### Dependency injection instead of manual wiring

Services and the Prisma client are injected by NestJS; nothing is constructed by hand.

```ts
constructor(private readonly bookingService: BookingService) {}      // controller
constructor(private readonly prismaService: PrismaService) {}        // service
```

### Typed, centralised configuration

Environment access is wrapped once per concern with `registerAs`, giving a typed config object instead of raw `process.env` lookups sprinkled across files.

```ts
// src/_core/configs/app.config.ts
export default registerAs('app', (): AppConfig => ({ /* cors, cookies, jwt … */ }));

// consumed type-safely, never process.env.JWT_SECRET inline
constructor(@Inject(appConfig.KEY) appConf: ConfigType<typeof appConfig>) {}
```

---

## Why

Every line that is not required to solve the problem must still be read, understood, and maintained. Complexity compounds: a controller that validates, branches, queries, and formats is far harder to change than one that only delegates. Simple code fails in simple, obvious ways; complex code fails in subtle ones. NestJS already provides DI, pipes, guards, and filters — re-implementing those by hand is added complexity with no benefit.

---

## How

1. **Keep controllers to delegate-then-wrap.** No business `if`s, no Prisma, no try/catch — let exception filters handle errors.
2. **Prefer a schema rule over an imperative check.** A shape/format rule goes in the Zod schema; existence and DB-dependent rules go in the service — not hand-rolled per field.
3. **Inject dependencies; never `new` a service or the Prisma client.**
4. **Read config through a typed `registerAs` namespace**, not `process.env` directly.
5. **Do not add an abstraction before it is needed** — extract when the complexity exists, not when it might.
6. **Let the framework do framework jobs** — validation (`ZodValidationPipe`), error shaping (exception filters), auth (guards). Don't reinvent them per endpoint.
7. **Controller/service form (delegate-then-wrap)**. → [Coding Convention §8](../CODING-CONVENTION.md)
8. **Guard-clause preconditions in services; extract an `assert*` helper only when justified** (I/O, reuse, or readability) — not by reflex. → [Coding Convention §9.1](../CODING-CONVENTION.md)

---

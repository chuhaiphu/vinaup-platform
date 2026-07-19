# Separation of Concerns (SoC)

## What

Separation of Concerns is a software design principle that divides a program into distinct sections — concerns — each responsible for one specific aspect of behaviour. When concerns are cleanly separated, a change in one section does not ripple into others, and each section is independently readable, testable, and changeable.

### In this codebase

Every unit of code — a controller, a service, a guard, a DTO — has one clearly defined concern. A concern is a distinct aspect of behaviour: handling an HTTP request, applying business logic, accessing the database, validating input, or authorising a caller. When concerns are mixed, a change in one area forces understanding and touching unrelated code.

### Layer separation

A request flows top-to-bottom through three layers. Dependencies only point **downward** — an outer layer depends on the inner layer below it, never the reverse.

```
┌──────────────────────────────────────────────────────────────┐
│  HTTP Layer — Controllers                                      │
│  src/<domain>/*.controller.ts                                  │
│  Route binding · guards · @Body/@Query/@Param · response       │
│  envelope. NO business logic, NO Prisma calls.                 │
├──────────────────────────────────────────────────────────────┤
│  Service Layer                                                 │
│  src/<domain>/*.service.ts                                     │
│  Business rules · orchestration · data access via Prisma.      │
│  Returns plain domain objects (never HttpResponse).            │
├──────────────────────────────────────────────────────────────┤
│  Data Layer — Prisma                                           │
│  src/prisma/prisma.service.ts (extends PrismaClient)           │
│  Queries · transactions · the only thing that talks to PG.     │
└──────────────────────────────────────────────────────────────┘

  Cross-cutting infra ─ src/_core/   guards · filters · pipes (ZodValidationPipe)
                                     decorators · configs
  Shared kernel       ─ src/_common/ constants · dtos · interfaces · utils
```

#### HTTP layer — controllers translate HTTP, nothing more

A controller binds a route, applies guards, reads the request, delegates to a service, and wraps the result in the response envelope. It contains **no business logic** and **never touches Prisma**.

```ts
// src/booking/booking.controller.ts
@UseGuards(JwtAuthGuard)
@Post('/')
async create(
  @Request() req: AuthenticatedRequest,
  @Body() createBookingReq: CreateBookingRequest
): Promise<HttpResponse<BookingResponse>> {
  const data = await this.bookingService.createBooking(createBookingReq, req.user.userId);
  return { statusCode: HttpStatus.CREATED, message: 'Booking created successfully', data };
}
```

#### Service layer — business logic + data access

A service owns the business rules (e.g. "a booking cannot be updated after the sender has signed") and the Prisma queries that implement them. It receives and returns plain domain objects — it does **not** know about `HttpResponse`, `Request`, or HTTP status codes.

```ts
// src/booking/booking.service.ts
async updateBooking(id: string, updateBookingReq: UpdateBookingRequest): Promise<BookingResponse> {
  const existingBooking = await this.prismaService.booking.findUnique({ where: { id } });
  if (!existingBooking) throw new BadRequestException('Booking not found');

  const signedSenderSignature = await this.prismaService.signature.findFirst({
    where: { documentId: id, documentType: DOCUMENT_TYPE.BOOKING, signatureRole: SIGNATURE_ROLE.SENDER, isSigned: true },
  });
  if (signedSenderSignature) throw new BadRequestException('Booking cannot be updated after sender has signed');

  return this.prismaService.booking.update({ where: { id }, data: updateBookingReq, include: { /* … */ } });
}
```

#### Data layer — Prisma is the only thing that talks to Postgres

`PrismaService` extends `PrismaClient` and is the single gateway to the database. It is injected wherever data access is needed (services, guards, async validators).

```ts
// src/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(@Inject('DATABASE') databaseAdapter: InstanceType<typeof PrismaPg>) {
    super({ adapter: databaseAdapter });
  }
}
```

### The two infrastructure roots

| Root | Concern | Contents |
|------|---------|----------|
| `src/_core/` | **Cross-cutting request machinery** — things the framework wires into the request pipeline | `guards/` (auth + authorization), `filters/` (exception → response), `pipes/` (`ZodValidationPipe`, if customised), `decorators/` (custom param/method decorators), `configs/` (typed config namespaces) |
| `src/_common/` | **Shared kernel** — pure, framework-light building blocks reused by every domain | `constants/` (`as const` enums), `dtos/` (shared param/response DTOs), `interfaces/` (`HttpResponse`, `BaseMeta`, auth types), `utils/` (calculators, generators) |

The `_` prefix sorts both folders to the top and signals "infrastructure, not a domain". → [Coding Convention §2.2](../CODING-CONVENTION.md)

---

## Why

When boundaries are mixed, every change has a wider blast radius. A controller that also runs business logic and queries the database cannot be reasoned about without understanding all three. Layering enforces a dependency direction that keeps each part independently changeable:

- The **data layer** can swap the Postgres adapter without touching services.
- A **service** can change a query or business rule without touching its controller.
- A **controller** can change its route or guards without touching the service.

It also localises testing: a service's business rule can be unit-tested by mocking `PrismaService`, with no HTTP server involved.

---

## How

### Layer responsibility table

| Concern | Where it lives |
|---------|----------------|
| Route path, HTTP verb, status code | Controller decorator + envelope |
| Read request body / query / params | Controller (`@Body` / `@Query` / `@Param`) |
| Authentication (is the caller logged in?) | `JwtAuthGuard` (in `_core/guards/`) |
| Authorization (may this caller mutate this record?) | Per-resource mutation guard (in `_core/guards/`) |
| Input shape validation | Shared Zod schema + `createZodDto` + global `ZodValidationPipe` |
| Business rules / orchestration | Service |
| Database queries | Service (via injected `PrismaService`) |
| Turning a thrown exception into a response | Exception filter (in `_core/filters/`) |
| Shared constants / types / pure helpers | `_common/` |

### Import direction rules

Dependencies point downward only — a controller importing `PrismaService` directly, or a service importing
`HttpResponse`, is a layering violation. → [Coding Convention §3.3](../CODING-CONVENTION.md)

---

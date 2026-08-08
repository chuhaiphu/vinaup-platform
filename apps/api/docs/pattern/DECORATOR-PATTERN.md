# Decorator Pattern

The **Decorator Pattern** attaches additional responsibilities to a target dynamically — a flexible
alternative to editing it directly.

A **decorator** is a function that TypeScript runs and hands that piece of code to, so it can add
behaviour or information to it.

---

## Param Decorator

### What

A parameter decorator **supplies one argument to a function** — the value is resolved elsewhere and
injected, instead of computed inside the function body.

Without it, the function has to produce the value itself:

```ts
function save(data: string) {
  const now = Date.now(); // produced by hand, in every function that needs it
  // ...use now...
}
```

A parameter decorator moves that "produce the value" step behind an annotation. The function just
declares the argument it wants and receives it ready-made:

```ts
function save(data: string, @Now() now: number) {
  // `now` already holds the timestamp — nothing produced here
}
```
---

### Mental model — a decorator is just a function

> This is **plain TypeScript**, independent of NestJS.

```ts
// Tier 1 — FACTORY FUNCTION: takes config (`tag`), returns the real decorator
function log(tag: string) {
  // Tier 2 — DECORATOR FUNCTION: receives the original method + context about it
  return function (originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = String(context.name);

    // Tier 3 — REPLACEMENT: stands in for the original method
    return function (this: any, ...args: any[]) {
      console.log(`[${tag}] → ${methodName}(${args})`);
      const result = originalMethod.call(this, ...args);
      console.log(`[${tag}] ← ${result}`);
      return result;
    };
  };
}

class Calculator {
  @log('math')
  add(a: number, b: number) {
    return a + b;
  }
}

new Calculator().add(2, 3);
// [math] → add(2,3)
// [math] ← 5
```

Each tier is a separate function with a separate job.

| Tier  | Name            | Job                                                            | Runs when                                                                                              |
| ----- | --------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **1** | **Factory**     | Receive config (`'math'`), return the actual decorator        | Class creation, **step 1** — the engine evaluates the expression `log('math')` to obtain the decorator |
| **2** | **Decorator**   | Receive the original method + its context, return a stand-in  | Class creation, **step 2** — immediately after, the engine applies that decorator to `add`             |
| **3** | **Replacement** | Stand in for the original method, wrapping it with behaviour  | **Every later call to `add()`** — at call time, repeatedly                                              |

> **"Class creation" = runtime — the instant execution reaches the `class Calculator { … }` statement
> and the engine builds the class object.** Decorators are **not** a compile-time step.

Tiers 1 and 2 both run inside that **single** class-creation moment, two **steps** of the same moment: _first get the decorator, then apply it._
Tier 3 is the only one that runs on each method call.

Walking the example in execution order:

1. Execution reaches `class Calculator { … }`; the engine starts building the class.
2. To apply the decorator on `add`, the engine first evaluates the expression `log('math')` → **tier 1
   runs** with `tag = 'math'` and returns tier 2.
3. The engine hands the original `add` plus a `context`to tier 2 → **tier 2 runs** and returns tier 3.
4. The engine sets `Calculator.prototype.add` to **tier 3**. The class is now built — no method has run yet.
5. Later, `new Calculator().add(2, 3)` invokes **tier 3** (it _is_ `add` now): it logs, calls the
   original `add`, logs again, and returns `5`.

---

### Two decorator standards, metadata, and where NestJS sits

#### 1 · Legacy decorators vs TC39 Stage-3 decorators

There are two different decorator features in TypeScript.
They compile and behave differently, and a decorator written for one generally does not work under the other.

| Aspect                            | Legacy ("experimental") decorators                | TC39 Stage-3 decorators                                          |
| --------------------------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| Opt-in                            | `"experimentalDecorators": true` in `tsconfig`    | Default since TypeScript 5.0                                    |
| **Can decorate**                  | class, method, getter/setter, property, **parameter** | class, method, getter/setter, auto-accessor, field |
| Arguments the decorator receives  | positional: `(target, propertyKey, paramIndex)`   | `(value, context)` — `context` is the `…DecoratorContext` object |
| **Metadata emission**             | **Supported** via `emitDecoratorMetadata`         | **Not supported**                                               |

#### 2 · What metadata is, and why a decorator needs it

**Metadata is data _about_ our code** — its types, or markers we attach — stored alongside the code so
it can be read back **at runtime**.

A decorator needs metadata because of a timing problem. A decorator is just a function: it runs **once,
at class creation**, and then **returns**. The instant it returns, the call is over — its arguments,
local variables, and everything it inspected are **discarded** (the function's scope no longer exists).

So the decorator does the one thing that outlives its own execution: while it is running, it **writes the
information down** somewhere permanent, for the framework **reads it back later and acts on it**, on each request.

**What `emitDecoratorMetadata` does** is perform that write automatically, for one specific kind of
information: types. A TypeScript type — e.g. `constructor(private users: UserService)` — exists only in
the source; when the program actually runs, the type is **gone**. With `emitDecoratorMetadata` turned on, TypeScript records
those types as metadata — most importantly `design:paramtypes`, so they **survive into the running program** instead of vanishing.
(This auto-emit is a legacy-only feature; Stage-3 decorators dropped it.)

That written-down information lives in the `reflect-metadata` library — a small key-value table keyed by
class/method. So the flow is always these two moments:

```
class creation:   decorator runs   ──writes──►  metadata (reflect-metadata store)
request time:     framework runs   ──reads───►  metadata  ──►  acts on it
```

#### 3 · How NestJS uses it

NestJS is built on **legacy decorators + `reflect-metadata`**, and uses metadata for two core things:

- **Dependency injection.** `emitDecoratorMetadata` emits each provider's constructor parameter types
  as metadata; at startup Nest reads `design:paramtypes` to know what to inject.
- **Parameter decorators.** `@Body()`, `@Param()`, and our `@CurrentUserId()` write _route-argument_
  metadata onto the handler — a recipe saying "argument N is resolved like this". At request time Nest
  reads that recipe to fill the arguments.

That is the concrete reason this project keeps `experimentalDecorators` and `emitDecoratorMetadata` on and does not
move to Stage-3 decorators.

---

### In this codebase

Two parameter decorators live in `src/_core/decorators/`: **`@CurrentUserId()`** below, and
[**`@OptionalBody()`**](#optionalbody--a-body-that-may-legitimately-be-absent) further down.

A handler that needs the caller's id declares it as an argument:

```ts
@Get('me')
getProfile(@CurrentUserId() userId: string) {
  // `userId` is already resolved — no request object, no digging
}
```

`createParamDecorator` is the NestJS helper that produces a legacy parameter decorator for us. We don't
write tiers by hand — we hand it the callback: **how to extract the value**.

```ts
// src/_core/decorators/current-user-id.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/_common/interfaces/interface';

export const CurrentUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user.userId;
});
```

#### What `createParamDecorator` does — step by step

Using the three concepts above (tiers, metadata, request-time read):

**At module load** — `createParamDecorator(callback)` runs once:

1. We pass it **one** function: our `(data, ctx) => value` callback.
2. It returns a **factory** (tier 1). We export it as `CurrentUserId`.

**At class definition** — `@CurrentUserId()` sits on a handler parameter:

3. `@CurrentUserId()` calls the factory (tier 1); it returns the parameter decorator (tier 2).
4. Tier 2 runs right away — but it does **not** call our callback. There is no request yet.
5. Tier 2 leave a **note** on the handler — _route-argument metadata_ — that says:
   _"argument #N is custom; when a request arrives, fill it by calling this callback."_

**At request time** — just before the handler runs:

6. Nest reads the handler's route-argument metadata (the note left in step 5).
7. Nest builds the `ExecutionContext` (`ctx`) for **this** request.
8. Nest calls **our callback** with `(data, ctx)`.
9. Our callback returns a value — here `request.user.userId`.
10. Nest places that value into argument #N, then invokes the handler.

Our callback's two parameters:

| Param  | What it is                                                     | In `CurrentUserId`                       |
| ------ | ------------------------------------------------------------- | ---------------------------------------- |
| `data` | The call-site argument: `@CurrentUserId('foo')` → `'foo'`      | Unused → typed `unknown`, named `_data`  |
| `ctx`  | The `ExecutionContext` of the current request                 | `ctx.switchToHttp().getRequest<…>()`     |

`ExecutionContext` is protocol-agnostic; `switchToHttp()` narrows it to the HTTP request before we read
`request.user.userId` — a value an upstream guard placed there (see [GUARD-PATTERN.md](GUARD-PATTERN.md)).
The decorator only _reads_ it; it never authenticates.

---

### `@OptionalBody()` — a body that may legitimately be absent

```ts
// src/_core/decorators/optional-body.decorator.ts
export const OptionalBody = createParamDecorator((_data: unknown, ctx: ExecutionContext): unknown => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.body ?? {};
});
```

Used on `POST /auth/refresh` and `POST /auth/logout` — the two routes where a **mobile** client sends
`{ refreshToken }` while a **web** client sends nothing at all, because its token rides in the `rtk`
cookie.

#### The bug it fixes

Express 5 changed what an unparsed body is: `req.body` is now **`undefined`**, where Express 4 gave
`{}`. Both routes had untyped bodies until then, so nothing noticed. The moment a DTO was attached,
the global `ZodValidationPipe` received `undefined` and rejected every web call with **400** — a route
that is *supposed* to accept no body.

---

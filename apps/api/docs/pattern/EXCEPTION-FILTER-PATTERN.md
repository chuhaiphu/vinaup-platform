# Exception Filter Pattern

## What

An exception filter is a centralized handler that catches exceptions raised anywhere during request processing and converts them into a consistent, well-formed response. Error-shaping lives in one place, so the code that detects an error simply throws and is freed from formatting the reply.

### In this codebase

Two filters, registered globally, handle everything thrown. Each exception is handled by **exactly one filter**, not a chain — and an empty `@Catch()` matches every exception, so the catch-all could otherwise swallow the one the specific filter should handle. NestJS resolves this with declaration order; see [Resolution order](#resolution-order).

```
throw TokenInvalidException  →  AuthExceptionFilter   @Catch(TokenInvalidException)
throw anything else          →  AppExceptionFilter    @Catch()   (matches every type)
```

`AuthExceptionFilter` lists **only** `TokenInvalidException` — the one exception that needs a cookie side effect. Any other auth failure — including a plain 401 like `InvalidCredentialsException` at sign-in — is a normal `HttpException` and falls to the catch-all, so no cookie is touched.

#### Auth-specific filter

`AuthExceptionFilter` exists because a **token** failure has a side effect — **clearing the access-token cookie** so a stale/invalid token stops being resent by the browser. This API is **single-token** (an access token in an `atk` cookie; there is no refresh cookie), so the filter clears exactly that one cookie:

```ts
// src/_core/filters/auth-exception.filter.ts
@Catch(TokenInvalidException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: TokenInvalidException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    // A token failure invalidates the session → drop the access cookie so the
    // browser stops resending an invalid token. Options must match those used
    // to set it (path included), or the browser keeps the cookie.
    response.clearCookie(
      this.authConf.cookies.accessToken.name,
      this.authConf.cookies.accessToken.options,
    );
    // Write the response directly — returning here would let Nest drop the
    // Set-Cookie header on a 4xx.
    response.status(exception.getStatus()).json(exception.getResponse());
  }
}
```

#### Catch-all filter

`AppExceptionFilter` handles every other exception. A known `HttpException` is forwarded with its own status and body; anything unknown becomes a logged `500` so internal details never reach the client:

```ts
// src/_core/filters/app-exception.filter.ts
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // …
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      responseBody = exception.getResponse();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        statusCode: status,
      };
      this.logger.error(
        String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
    }
    response.status(status).json(responseBody);
  }
}
```

`AppExceptionFilter` catches **everything**, it produces the only "unknown error" shape clients ever see: `500 { error: 'INTERNAL_SERVER_ERROR', message: 'Internal server error', statusCode: 500 }`. A known `HttpException` still passes through with its own status and body untouched.

#### Resolution order

> "When combining an exception filter that catches everything with a filter bound to a specific type, the 'Catch anything' filter should be declared **first** to allow the specific filter to correctly handle the bound type." — [NestJS docs — Exception filters](https://docs.nestjs.com/exception-filters)

Both filters are registered **globally via the `APP_FILTER` token** in `AppModule.providers`, with the catch-all declared first:

```ts
// src/app.module.ts
import { APP_FILTER } from '@nestjs/core';

providers: [
  AppService,
  { provide: APP_FILTER, useClass: AppExceptionFilter },  // @Catch()                     — declared first, the fallback
  { provide: APP_FILTER, useClass: AuthExceptionFilter },  // @Catch(TokenInvalidException) — handles its bound type
],
```

`AuthExceptionFilter` therefore handles `TokenInvalidException` (and clears the cookie); every other exception falls through to the catch-all. Keep both filters bound at this one site with the catch-all first — that ordering is what the rule requires.

#### Custom exceptions

Resource and business exceptions **extend the built-in that carries their status** (`NotFoundException`, `ForbiddenException`, `BadRequestException`, `ConflictException`), overriding only the body to add a stable `error` code. **Auth is the exception**: the classes in `auth.exception.ts` extend `HttpException` directly, never `UnauthorizedException`. Why the split? A filter side effect must be opt-in — **listed explicitly** in that filter's `@Catch(...)`. Subclassing a built-in to piggyback into a catch list is invisible at the throw site and silently drags in side effects: routing a sign-in failure through `UnauthorizedException` would let `AuthExceptionFilter` clear the access cookie on an attempt that never had a session — which is why wrong credentials is its own `InvalidCredentialsException` (extends `HttpException`), kept **out** of the auth filter's catch list. `NotFoundException` and friends are safe to extend only because no filter catches them.

Each domain owns one exception file under `src/_common/exceptions/<domain>.exception.ts`; every class carries a stable machine `error` code. → the full catalog is [Error Code Reference](../reference/ERROR-CODE-REFERENCE.md).

```ts
// src/_common/exceptions/auth.exception.ts
// Routed into AuthExceptionFilter (clears the access cookie):
export class TokenInvalidException extends HttpException {
  constructor(message: string) {
    super(
      { error: 'TOKEN_INVALID', message, statusCode: HttpStatus.UNAUTHORIZED },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

// A plain 401 — NOT in any filter's catch list, so no cookie is cleared:
export class InvalidCredentialsException extends HttpException {
  constructor(message: string) {
    super(
      { error: 'AUTH_INVALID_CREDENTIALS', message, statusCode: HttpStatus.UNAUTHORIZED },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AuthExistedException extends HttpException {
  constructor(message: string) {
    super(
      { error: 'AUTH_ACCOUNT_EXISTED', message, statusCode: HttpStatus.CONFLICT },
      HttpStatus.CONFLICT,
    );
  }
}
```

---

## Why

Centralising error-to-response conversion lets business code throw a meaningful exception — no need for a response builder inside the services layer. A single catch-all guarantees that no unexpected error reaches the client as a stack trace. The auth filter is separate because a token failure has a side effect (clearing the cookie) that the generic handler should not carry.

---

## How

1. **Throw, don't format** — in services and guards, `throw` a meaningful exception; never build the error response by hand.
2. **Use the right status** — `BadRequestException` (400) for invalid input/state, `ForbiddenException` (403) for an authorization denial, `TokenInvalidException` / a plain 401 like `InvalidCredentialsException` (401) for authentication, `NotFoundException` (404) for a missing resource.
3. **Only `TokenInvalidException` clears the cookie** — a token failure drops the `atk` cookie; a 401 that isn't a token death (wrong credentials at sign-in) is a plain `HttpException` and must NOT enter the cookie-clearing filter.
4. **Add a dedicated filter only when an error class needs a side effect or a body the catch-all cannot provide** — otherwise let `AppExceptionFilter` handle it. When one does, list the specific exception classes in its `@Catch(...)`; never subclass a built-in to route into it.
5. **Default to a custom code** for anything on the business surface, and record it. → [Error Code Reference](../reference/ERROR-CODE-REFERENCE.md), [Coding Convention §9](../CODING-CONVENTION.md#9-error-handling)

---

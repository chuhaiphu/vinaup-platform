# Strategy Pattern

## What

The Strategy pattern defines a family of interchangeable algorithms, encapsulates each behind a common interface. The caller depends on the abstraction, not on any concrete implementation, so a strategy can be swapped without changing the caller.

### In this codebase

`JwtStrategy` is the concrete algorithm `JwtAuthGuard` delegates to.(see [GUARD-PATTERN.md](GUARD-PATTERN.md)). The strategy only decides *valid / not valid*.The guard owns the decision of *what to do about it*.

**How the guard and the strategy connect — the string `'jwt'`** The guard never
imports or invokes `JwtStrategy`. The only wire between them is a **name** that both register under:

```
JwtAuthGuard  extends AuthGuard('jwt')                   ─┐
                                                          ├─ 'jwt'
JwtStrategy   extends PassportStrategy(Strategy, 'jwt')  ─┘
```

At startup, `PassportStrategy(Strategy, 'jwt')` registers the `JwtStrategy` instance into Passport's internal under the key `'jwt'`. At request time the inherited `canActivate` calls
`passport.authenticate('jwt', …)`, Passport looks that key up, finds `JwtStrategy`, and runs it. Swap the name = swap the strategy.

```
JwtAuthGuard.canActivate                       ← the caller (GUARD-PATTERN.md)
  └─ passport.authenticate('jwt', req)         ← hands THIS request to the strategy
        └─ JwtStrategy  ── the three steps below 
```

The strategy executes three steps in sequence every time a protected request arrives:

```
Step 1 — Extract token   (from the `req` the guard passed in)
  ├─ try Authorization: Bearer <token>   (mobile app)
  └─ try req.cookies.atk                 (web app)

Step 2 — Verify signature & expiry
  └─ checked automatically against appConf.jwt.secret
     expired or tampered → Passport sets info.name = 'TokenExpiredError' | 'JsonWebTokenError'
     → JwtAuthGuard.handleRequest throws AccessTokenInvalidException

Step 3 — Resolve caller (validate)
  └─ query DB: does this userId still exist?
     exists  → return { userId }  → becomes req.user
     missing → return null        → JwtAuthGuard.handleRequest throws AccessTokenInvalidException
```

```ts
// src/_core/guards/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(appConfig.KEY) appConf: ConfigType<typeof appConfig>, private prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),                // Step 1a — Mobile: Bearer header
        (req: Request) => (req.cookies.atk as string) || null,   // Step 1b — Web: atk cookie
      ]),
      ignoreExpiration: false,           // Step 2 — reject expired tokens
      secretOrKey: appConf.jwt.secret,   // Step 2 — verify signature
    });
  }

  async validate(payload: JwtPayload): Promise<JwtValidationReturn | null> {
    // Step 3 — confirm the user still exists in DB
    const user = await this.prismaService.user.findUnique({ where: { id: payload.sub }, select: { id: true } });
    if (!user) return null;
    return { userId: payload.sub };
  }
}
```

**Where `validate()`'s return value goes.** Not to the controller — back to the guard. Passport collects
the return value and calls `JwtAuthGuard.handleRequest(error, user, info)` with `user` set to it:

```
validate(payload)
  ├─ return { userId }  ─┐
  └─ return null        ─┤
                         ▼
   Passport → JwtAuthGuard.handleRequest(error, user, info)
                         ├─ user = { userId } → handleRequest returns it → Passport sets req.user
                         └─ user = null       → handleRequest throws AccessTokenInvalidException
```

---

## Why

Isolating the authentication mechanism behind a named strategy means the *how* of authentication has one definition. The dual token source (mobile header vs. web cookie) is handled in that one place, and the rest of the application depends only on "the request is authenticated" — never on JWTs, cookies, or passport. A different mechanism could be introduced as another strategy without touching any controller.

---

## How

1. **Encapsulate an authentication mechanism as a `PassportStrategy`** registered under a stable name.
2. **Resolve the caller in `validate()`** and return the minimal identity (`{ userId }`) that becomes `req.user`; return `null` to reject.
3. **Keep token-source logic inside the strategy** (`jwtFromRequest` extractors) — callers must not parse headers or cookies themselves.
4. **Select the strategy via a guard** (`AuthGuard('jwt')`), never by invoking passport directly in a controller.

---
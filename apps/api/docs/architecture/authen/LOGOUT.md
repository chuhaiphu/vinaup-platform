# Logout / Sign-Out-All

Server-side revocation by stamping `Session.revokedAt`. A revoked session fails the next
[token refresh](./TOKEN-REFRESH.md) immediately; the 15-min access token is left to expire on
its own (stateless by design).

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant Auth as AuthService
    participant DB as Prisma/DB

    alt logout (this device)
        C->>+Auth: POST /auth/logout<br/>web: rtk cookie — mobile: { refreshToken }
        Note over Auth: authenticated by possession of the refresh token (no access JWT)
        Auth->>+DB: updateMany - Session.revokedAt = now<br/>WHERE tokenHash = sha256(refresh token) AND revokedAt = null
        DB-->>-Auth: { count: 1 } — or { count: 0 } if already revoked
        Auth-->>-C: 200 — web: clear atk + rtk cookies (either way)
    else sign out all devices
        C->>+Auth: POST /auth/logout-all (access JWT ⇒ JwtAuthGuard)
        Auth->>+DB: updateMany - Session.revokedAt = now<br/>WHERE userId = sub AND revokedAt = null
        DB-->>-Auth: { count: n }
        Auth-->>-C: 200 — web: clear atk + rtk cookies
    end
```

> **`/auth/logout` deliberately has no `JwtAuthGuard`.** Logging out must still work once the access
> token has expired — which is exactly when a user reaches for it.

> **Idempotent logout.** `updateMany` means a missing or already-revoked token revokes 0 rows without
> throwing — cookies are cleared and `200` returned regardless. This is also why the refresh cookie is
> **path-scoped to `/auth`**, not `/auth/refresh`: the browser must ship `rtk` here too.

> **Why `updateMany`, not `update`.** `update` accepts only a unique field in `where`, and `tokenHash` is
> a plain column; forcing it would cost a `findFirst` then an `update` — two round-trips. "Many" is not a
> risk: the hash is SHA-256 of a 256-bit random token, so it matches exactly one row.

> Access tokens already minted stay valid until their 15-min expiry — the deliberate trade-off of
> stateless JWTs. Shorten the TTL if tighter revocation is ever required.

# Local Sign-In

Two ways in, both vouched for by us (hence _local_ — no federated provider is involved), both ending in
the same two named steps that every other flow refers back to:

| Mode         | Route(s)                                                    | Proves you by                                              |
| ------------ | ----------------------------------------------------------- | ---------------------------------------------------------- |
| **Password** | `POST /auth/local-sign-in`                                  | something you **know** — the password behind `Auth(LOCAL)` |
| **OTP**      | `POST /auth/otp-sign-in/request` → `POST /auth/otp-sign-in` | something you **have** — the SIM behind `User.phone`       |

The two named steps:

- **User-status gate** — reject `user.status = DISABLED` with `403`. In password mode it runs **after**
  the password check: telling an anonymous caller that an account is disabled would confirm it exists.
- **Issue tokens** — sign the access JWT (`{ sub: userId }`, 15-min) and insert a `Session` holding the
  **SHA-256** hash of a fresh opaque refresh token (7-day) plus `ipAddress` / `userAgent`.

---

## Mode 1 — Password

One `identifier` field takes either the phone or the linked email, both resolve to the same `User` and
the same single `Auth(LOCAL)` credential.

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant Auth as AuthService
    participant DB as Prisma/DB

    C->>+Auth: POST /auth/local-sign-in { identifier, password }
    Note over Auth: classify — contains "@" ⇒ email, else E.164 phone
    Auth->>+DB: User.findUnique(email) | User.findUnique(phone)
    DB-->>-Auth: user { id, status } | null
    break no user
        Auth-->>C: 401 AUTH_CREDENTIALS_INVALID
    end
    Auth->>+DB: Auth.findUnique([userId, provider=LOCAL])
    DB-->>-Auth: auth { passwordHash } | null
    break no LOCAL row / no passwordHash
        Auth-->>C: 401 AUTH_CREDENTIALS_INVALID
    end
    Auth->>Auth: bcrypt.compare(password, passwordHash)
    break password mismatch
        Auth-->>C: 401 AUTH_CREDENTIALS_INVALID
    end
    Note over Auth: User-status gate
    break user.status = DISABLED
        Auth-->>C: 403 ACCOUNT_DISABLED
    end
    Note over Auth: Issue tokens
    Auth-->>-C: 200 — web: Set-Cookie atk + rtk — mobile: tokens in body
```

> **One field, classified by `@`.** An `@` cannot appear in a phone number nor be absent from an email,
> so the split is total and costs one lookup. A phone goes through the same `normalizeVnPhone` transform
> as [sign-up](./SIGN-UP.md) — the string typed must match the string stored.

---

## Mode 2 — OTP

No password at all: prove possession of the number.

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant Auth as AuthService
    participant DB as Prisma/DB
    participant N as Notifier (SMS)
    participant U as User's handset

    C->>+Auth: POST /auth/otp-sign-in/request { phone }
    Auth->>+DB: User.findUnique(phone)
    DB-->>-Auth: user { id, status } | null
    alt user exists and status = ACTIVE
        Auth->>DB: consume any earlier live SIGN_IN_OTP for this user
        Note over Auth: code = 6 random digits (CSPRNG)
        Auth->>DB: Verification.create(kind=SIGN_IN_OTP,<br/>tokenHash=sha256(code), expiresAt=+5m, attempts=0)
        Auth-)N: sendSignInOtpToPhone(phone, code) — fire-and-forget
    else no user / disabled
        Note over Auth: do nothing (silent)
    end
    Auth-->>-C: 200 (always — never reveal whether the number is registered)
    N--)U: SMS — the 6 digits

    C->>+Auth: POST /auth/otp-sign-in { phone, code }
    Auth->>+DB: latest live Verification(kind=SIGN_IN_OTP) for user(phone)
    DB-->>-Auth: row { tokenHash, attempts, userId } | none
    alt none / consumed / expired / attempts ≥ 5
        Auth-->>C: 400 SIGN_IN_OTP_INVALID (generic)
    else row is live
        Note over Auth: compare sha256(code) vs row.tokenHash
        alt hash mismatch
            Auth->>DB: attempts += 1
            Auth-->>C: 400 SIGN_IN_OTP_INVALID (generic)
        else hash matches
            Note over Auth: User-status gate
            Auth->>DB: Verification.consumedAt = now
            Note over Auth: Issue tokens
            Auth-->>C: 200 — web: Set-Cookie atk + rtk — mobile: tokens in body
        end
    end
    deactivate Auth
```

> **The request step is always `200`, unlike sign-up's `409`.** A phone number is trivially enumerable,
> and here — unlike a registration form — nothing about the product requires answering "is this number
> registered".

> **No `Auth` row is involved.** An OTP is a second _proof_ of an identity we already vouch for, not a
> second credential provider, so nothing is written to `Auth`.
> [why that distinction holds](../DB-DIAGRAM.md#provider-names-the-authority-not-the-field-you-typed).

> **The code leaves through the notifier**, which resolves `PHONE_DRIVER` at boot.
> If `PHONE_DRIVER=log`, the code is written into the application log so the flow runs end to end without a provider account →
> [Notifier Facade Pattern](../../pattern/NOTIFIER-FACADE-PATTERN.md#the-log-drivers).

---

## Issue tokens — what gets minted

| Token       | Shape                                                     | Lifetime | Stored server-side            | Carried client → server                               |
| ----------- | --------------------------------------------------------- | -------- | ----------------------------- | ----------------------------------------------------- |
| **Access**  | stateless JWT `{ sub: userId }`, signed with `JWT_SECRET` | 15 min   | nothing                       | `atk` cookie (web) — `Authorization: Bearer` (mobile) |
| **Refresh** | opaque, 32 random bytes hex                               | 7 days   | `Session.tokenHash` — SHA-256 | `rtk` cookie (web) — response body (mobile)           |

_Why_ the refresh token is opaque rather than a JWT is argued in
[Token Refresh](./TOKEN-REFRESH.md).

> **Token delivery per platform**, switched on the `x-request-platform: mobile` header
> (`isMobileRequest`). **Web** — both tokens as `httpOnly` + `Secure` + `SameSite` cookies, nothing in
> the body; page JavaScript cannot read them, so an XSS cannot exfiltrate them, and `SameSite=strict`
> closes the CSRF that trade opens. **Mobile** — no cookie jar, so both come back in the body. The `rtk`
> cookie is path-scoped to `/auth` (not `/auth/refresh`) because [logout needs it too](./LOGOUT.md).

> **The `atk` cookie's `maxAge` equals the JWT's `exp` — 15 minutes.** A cookie outliving its token makes
> "am I signed in?" have two answers that disagree.

> **The response carries the user only.** `AuthService` does not read the organization tables: the client
> already fetches that list on a cold start signed in with a stored token, so bundling it here would
> duplicate a path that must exist anyway.

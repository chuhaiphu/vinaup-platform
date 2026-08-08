# Password Reset — Email Link

> ## ⚠ NOT IMPLEMENTED — specification only
>
> No route, service method, schema or `Verification` row of this kind exists in `apps/api`. The page
> below describes the intended design, not the code.
>
> **Why it is deferred.** The link must open a **web** page carrying a "new password" form, at
> `${WEB_APP_URL}/reset-password?token=…`. There is no web client — `apps/` holds `api` and `mobile`
> only — so the link would point at a route that exists nowhere and the flow cannot be exercised end
> to end.
>
> **What building it needs.** Two routes and their schemas; `WEB_APP_URL` in the typed `auth` config
> namespace, validated at boot and never read from the request (see *The reset URL* below); and
> `@@index([kind, tokenHash])` back on `Verification` — removed because this is the only flow that
> would look a row up by hash alone, and an index no query reads still costs every insert.
> `VERIFICATION_KIND.PASSWORD_RESET_EMAIL_LINK` and `NotifierService.sendPasswordResetLinkToEmail`
> are already in place.

Two half-flows around a single one-time `Verification(kind=PASSWORD_RESET_EMAIL_LINK)`, driven by an
**opaque link token** emailed as `?token=`. This is the **web** format. The **mobile** format delivers a
typed code over the same channel — see
[Password Reset — Email OTP](./PASSWORD-RESET-EMAIL-OTP.md).

> **`EMAIL` names the channel, `LINK` names the format.** The platform picks the format; the channel is
> email for both reset flows and is the axis that may branch later.

> An account that never [linked an address](./LINK-EMAIL.md) does not use this flow at all — it gets back
> in through [OTP sign-in](./LOCAL-SIGN-IN.md#mode-2--otp), which needs no password. Setting a **new**
> password without an email address is not built.

> **Why the reset token is opaque.** It must be **revocable** (single-use consume) and is **looked up**
> by hash on confirm, so validity depends on server state → a reference (opaque) token, not a JWT. The
> raw value is high-entropy random; only its **SHA-256** hash is stored, and the reset URL is the only
> place the raw value ever appears.

**Half-flow 1 — Forgot step** (`forgot-password-link`): always returns `200`, so the response never
reveals whether the address exists.

```mermaid
sequenceDiagram
    autonumber
    participant C as Client (web)
    participant Auth as AuthService
    participant DB as Prisma/DB
    participant N as Notifier (email)
    participant U as User's inbox

    C->>+Auth: POST /auth/forgot-password-link { email }
    Auth->>+DB: User by email, with its Auth(LOCAL)
    DB-->>-Auth: user { id } + auths | null
    alt user exists with an Auth(LOCAL) credential
        Note over Auth: token = 32 random bytes (CSPRNG)
        Auth->>DB: Verification.create(kind=PASSWORD_RESET_EMAIL_LINK,<br/>tokenHash=sha256(token), expiresAt=+1h)
        Auth-)N: sendPasswordResetLinkToEmail(email, resetUrl) — fire-and-forget
    else no user / no local credential
        Note over Auth: do nothing (silent)
    end
    Auth-->>-C: 200 (always — never reveal whether the address exists)
    N--)U: email carrying the RAW token in the URL
```

**Half-flow 2 — Reset step** (`reset-password-link`): the token is globally unique, so the row is fetched
by `sha256(token)` directly — the lookup itself _is_ the match.

```mermaid
sequenceDiagram
    autonumber
    participant U as User's inbox
    participant C as Client (web)
    participant Auth as AuthService
    participant DB as Prisma/DB

    U->>C: clicks the link — the browser lands on /reset-password?token=raw
    C->>+Auth: POST /auth/reset-password-link { token, newPassword }
    Auth->>+DB: Verification(kind=PASSWORD_RESET_EMAIL_LINK) by sha256(token)
    DB-->>-Auth: row { userId, expiresAt, consumedAt } | none
    alt none / consumed / expired
        Auth-->>C: 400 — token invalid or expired
    else row is live
        Note over Auth,DB: one transaction
        Auth->>DB: Auth(LOCAL).passwordHash = bcrypt(newPassword)
        Auth->>DB: Verification.consumedAt = now
        Auth->>DB: Session.revokedAt = now WHERE userId (sign out all)
        Auth-->>C: 200 — web: clear atk + rtk, re-login required
    end
    deactivate Auth
```

> **Anti-timing-leak.** The send is fire-and-forget, not awaited: awaiting the round-trip would
> make the response measurably slower when the address exists, leaking existence via timing and
> defeating the always-`200` above. The
> [facade's methods return `void`](../../pattern/NOTIFIER-FACADE-PATTERN.md#question-2-in-the-method-body--which-contract-does-a-facade-method-use),
> so there is no promise to await.

> **Local-credential accounts only.** A link is issued only when the user has an `Auth(LOCAL)` row with a
> `passwordHash`. The miss is silent (still `200`), and it guarantees the confirm step always finds the
> row it updates.

> **Revoke every session.** Rotate the credential, consume the token, revoke the sessions — three writes,
> one transaction.

> **The reset URL** is `${WEB_APP_URL}/reset-password?token=raw`. This is the one place the API must
> know the address of a system that is **not itself**: the link has to land on a page carrying a "new
> password" form.
>
> **The origin must never come from the request.** Building it from `req.headers.host` or `Origin` is
> *password reset poisoning*: an attacker POSTs the **victim's** email with `Host: attacker.com`, the
> genuine service mails the victim a link to the attacker's domain, and clicking it hands over the raw
> token.

> **The URL leaves through the notifier**, which resolves `MAIL_DRIVER` at boot. If `MAIL_DRIVER=log`,
> the whole URL — raw token included — is written into the application log so the flow runs end to end
> without a mail provider →
> [Notifier Facade Pattern](../../pattern/NOTIFIER-FACADE-PATTERN.md#the-log-drivers).

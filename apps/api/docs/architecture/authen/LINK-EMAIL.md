# Link Email

Attach an email to an existing account: two half-flows around one
`Verification(kind=EMAIL_VERIFICATION)`, driven by a 6-digit code mailed to the address being claimed.
Authorized by the access JWT **and** by the caller's current password.

An email is never collected at [sign-up](./SIGN-UP.md). Linking one buys a second `identifier`
at [sign-in](./LOCAL-SIGN-IN.md) and the only channel the password-reset flows use.

**Step 1 — Request** (`POST /auth/link-email/request`): prove the password, claim the address, send a code.

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant Auth as AuthService
    participant DB as Prisma/DB
    participant N as Notifier (email)
    participant U as User's inbox

    C->>+Auth: POST /auth/link-email/request { email, currentPassword }<br/>(access JWT ⇒ req.user.userId)
    Auth->>+DB: Auth.findUnique([userId, provider=LOCAL])
    DB-->>-Auth: auth { passwordHash }
    Auth->>Auth: bcrypt.compare(currentPassword, passwordHash)
    break password mismatch
        Auth-->>C: 401 CURRENT_PASSWORD_INVALID
    end
    Auth->>+DB: User.findUnique(userId) select email
    DB-->>-Auth: email | null
    break caller already has a linked email
        Auth-->>C: 409 EMAIL_ALREADY_LINKED
    end
    Auth->>+DB: User.findUnique(email)
    DB-->>-Auth: owner | null
    break address belongs to another account
        Auth-->>C: 409 EMAIL_ALREADY_USED
    end
    Auth->>DB: consume any earlier live EMAIL_VERIFICATION (one code at a time)
    Note over Auth: code = 6 random digits (CSPRNG)
    Auth->>DB: Verification.create(kind=EMAIL_VERIFICATION, target=email,<br/>tokenHash=sha256(code), expiresAt=+10m, attempts=0)
    Auth-)N: sendEmailVerificationOtp(email, code) — fire-and-forget
    Auth-->>-C: 200 — code sent
    N--)U: email to the CLAIMED address — the 6 digits
```

**Step 2 — Link** (`POST /auth/link-email`): the code alone; the address comes off the row.

```mermaid
sequenceDiagram
    autonumber
    participant U as User's inbox
    participant C as Client
    participant Auth as AuthService
    participant DB as Prisma/DB

    U->>C: reads the email, types the 6 digits
    C->>+Auth: POST /auth/link-email { code }<br/>(access JWT ⇒ req.user.userId)
    Auth->>+DB: latest Verification(kind=EMAIL_VERIFICATION) for userId
    DB-->>-Auth: row { tokenHash, target, attempts } | none
    alt none / consumed / expired / attempts ≥ 5
        Auth-->>C: 400 — code invalid or expired (generic)
    else row is live
        Note over Auth: compare sha256(code) vs row.tokenHash
        alt hash mismatch
            Auth->>DB: attempts += 1
            Auth-->>C: 400 — code invalid or expired (generic)
        else hash matches
            Auth->>+DB: User.findUnique(row.target) — claimed during the 10-min window?
            DB-->>-Auth: owner | null
            break address taken since the code was sent
                Auth-->>C: 409 EMAIL_ALREADY_USED
            end
            Note over Auth,DB: one transaction
            Auth->>DB: User.update({ email: row.target, emailVerifiedAt: now })
            Auth->>DB: Verification.consumedAt = now
            Auth-->>C: 200 — email linked
        end
    end
    deactivate Auth
```

> **Why the current password on top of the JWT.** The JWT proves a session exists, not that the human is
> present. Without the step-up, a stolen session attaches the attacker's address, and from there
> [forgot-password](./PASSWORD-RESET-EMAIL-LINK.md) turns a 7-day token into permanent ownership of the
> account. Re-entering the password is the one check a session thief cannot pass.

> **The address is not written until the code is consumed.** An unverified address on `User.email` would
> occupy the unique index, letting anyone permanently block a stranger's address by typing it into their
> own account. Held on the challenge row, the claim expires by itself in 10 minutes —
> [why `target` exists](../DB-DIAGRAM.md#why-verification-carries-target-and-why-userid-is-nullable).

> **Uniform failure on verify, named conflicts on request.** Verify collapses no-row / expired / consumed
> / cap-reached / wrong-code into one `400`, so no response tells an attacker the row is spent and a
> fresh one should be triggered.

> **Changing or removing a linked email is a separate flow, not built.** `email` and `phone` are absent
> from the profile-update schema on purpose, and `EMAIL_ALREADY_LINKED` makes re-running this flow a
> `409` rather than a silent overwrite.

> **The code leaves through the notifier**, which resolves `MAIL_DRIVER` at boot. If `MAIL_DRIVER=log`,
> the code is written into the application log so the flow runs end to end without a mail provider →
> [Notifier Facade Pattern](../../pattern/NOTIFIER-FACADE-PATTERN.md#the-log-drivers).

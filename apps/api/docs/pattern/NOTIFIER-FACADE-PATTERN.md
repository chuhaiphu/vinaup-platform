# Notifier Facade Pattern

## What

The Notifier Facade pattern is a **Facade over two Strategy families**. Business code gets one object that sends
notifications, and never learns how one physically leaves the process.

| Role         | Class                         | Owns                                                          | Knows about              |
| ------------ | ----------------------------- | ------------------------------------------------------------- | ------------------------ |
| **Facade**   | `NotifierService`             | which contract each notification uses; catching every failure | both contracts           |
| **Contract** | `MailService`, `PhoneService` | the shape of a send: a destination + an intent → an outcome   | nothing — it is abstract |
| **Driver**   | one class per transport       | one transport: its client, its wire format, its errors        | only itself              |

The two contracts are **siblings on one axis: the kind of address**. `MailService` delivers to an email
address, `PhoneService` delivers to a phone number.

Under each contract, drivers are interchangeable implementations — the
[Strategy pattern](STRATEGY-PATTERN.md) — **exactly one is bound to the contract at boot**.

```
                          AuthService
                               │
                               │  injects NotifierService
                               ▼
      ┌───────────────────────────────────────────────────────┐
      │  NotifierService                              FACADE  │
      │  one method per notification                          │
      └───────────────────────────────────────────────────────┘
                  │                             │
                  ▼                             ▼
      ┌───────────────────────┐     ┌───────────────────────┐
      │  MailService          │     │  PhoneService         │   CONTRACT
      │  send(email, intent)  │     │  send(phone, intent)  │   abstract class
      └───────────────────────┘     └───────────────────────┘
                  △                             △
                  │  MAIL_DRIVER                │  PHONE_DRIVER
                  │  binds exactly one          │  binds exactly one
                  │                             │
      ┌───────────────────────┐     ┌───────────────────────┐
      │  SmtpMailService      │     │  ZnsPhoneService      │   DRIVER
      │  LogMailService       │     │  SmsPhoneService      │   one per transport
      │                       │     │  FallbackPhoneService │
      │                       │     │  LogPhoneService      │
      └───────────────────────┘     └───────────────────────┘
```

A driver is named for **the transport it speaks**, not the vendor behind it: `SmsPhoneService` stays
`SmsPhoneService` whichever company carries the SMS. `FallbackPhoneService` is a driver like any other —
it simply implements the send by delegating to two of its siblings.

---

<br />

## In this codebase

```
src/notifier/
  notifier.module.ts        binds each contract to one driver; exports only the facade
  notifier.service.ts       the facade
  mail.service.ts           CONTRACT
  smtp-mail.service.ts      DRIVER
  log-mail.service.ts       DRIVER
  phone.service.ts          CONTRACT
  zns-phone.service.ts      DRIVER
  sms-phone.service.ts      DRIVER
  fallback-phone.service.ts DRIVER — delegates to two of the drivers above
  log-phone.service.ts      DRIVER

src/_common/interfaces/notifier.interface.ts   MailIntent, PhoneIntent, SendOutcome
src/_core/configs/notifier.config.ts           MAIL_DRIVER, PHONE_DRIVER
```

One file per driver, named for the transport it speaks. The three types sit in `_common/interfaces/`
with every other shared shape → [Coding Convention §2.2](../CODING-CONVENTION.md#22-infrastructure-roots).
Only `NotifierService` is exported, so no module outside can reach a contract or a driver regardless.

<br />

### The contracts

```ts
export abstract class MailService {
  abstract send(email: string, intent: MailIntent): Promise<SendOutcome>;
}

export abstract class PhoneService {
  abstract send(phone: string, intent: PhoneIntent): Promise<SendOutcome>;
}
```

A contract is a transport. Only the facade speaks in business terms.

They are `abstract class`, not `interface`: a TypeScript interface is erased at compile time and cannot
serve as a DI token, while an abstract class exists at runtime **and** type-checks its drivers.

<br />

### The intents — what a contract is allowed to carry

`MailIntent` and `PhoneIntent` are the types of the **second parameter of `send`** — the payload.

```ts
export type PhoneIntent = { kind: 'SIGN_UP_OTP'; code: string } | { kind: 'SIGN_IN_OTP'; code: string };
```

**They carry meaning.** `SIGN_UP_OTP` plus a code. Turning that meaning into words is the driver's job.

Two consequences worth naming:

- **The union is the contract's vocabulary.** If a `kind` is not in `PhoneIntent`, that notification
  cannot be sent to a phone number — enforced by the type.
- **Adding a notification is compiler-guided.** Add a `kind`, and every driver's exhaustive `switch`
  stops compiling until it handles it.

<br />

### The outcome — what a contract reports back

`SendOutcome` is the type of the **return value of `send`**. A driver **reports instead of throwing**:

```ts
export type SendOutcome =
  | { delivered: true }
  | { delivered: false; reason: 'recipient-unreachable' | 'sender-unavailable' | 'sender-fault' };
```

It cannot be `void`, because `FallbackPhoneService` has to know whether to try its second driver. It
cannot be a thrown exception, because a rejected send is an ordinary operational event.

Every send has exactly **two parties**:

- **recipient** — the person being sent to, identified by the phone number or email address passed to
  `send`.
- **sender** — us: our account at the provider (our SMTP mailbox, our messaging account) and the request
  we build with it.

A failure belongs to one party or the other, and that is what `reason` names:

```
send failed
├─ the recipient's side ────────── recipient-unreachable   → another driver may try
└─ our side
   ├─ the account cannot send now ─ sender-unavailable     → another driver may try
   └─ the request itself is wrong ─ sender-fault           → do NOT try another driver
```

| `reason`                | Concrete examples                                                                                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `recipient-unreachable` | **app-messaging transport** — the number has no account registered on that messaging app, so the provider has nobody to deliver to<br/>**SMS transport** — the number is not in service<br/>**email transport** — the mailbox does not exist<br/>any transport — the user has opted out of this message type |
| `sender-unavailable`    | our prepaid balance with the provider is empty<br/>our daily send quota is used up<br/>the provider's API is down or timing out                                                                                                                                                                              |
| `sender-fault`          | our API key or access token is wrong or expired<br/>the template was never approved by the provider<br/>a parameter the template requires is missing from the payload<br/>the destination string we passed is malformed                                                                                      |

**Why our side needs two verdicts:**

|                      | Retry on another driver | What actually fixes it                                                       |
| -------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| `sender-unavailable` | yes                     | ops — top up the balance, or wait for the quota to reset / the outage to end |
| `sender-fault`       | no                      | a developer — correct the key, template or payload, then deploy              |

> **An unrecognised failure maps to `sender-fault`.** A failure nobody has classified must stop and be
> noticed, not quietly spend money on a second driver.

<br />

### Wiring — three decisions, three moments

Three separate questions, each settled at a different moment:

| #     | The question                                                      |
| ----- | ----------------------------------------------------------------- |
| **1** | which **driver** does each **contract** use?                      |
| **2** | which **contract** does a **facade method** use — mail, or phone? |
| **3** | which **facade method** does the **caller** call?                 |

Question 3 is `AuthService` choosing what to send: one line per request,
`this.notifier.sendSignUpOtpToPhone(phone, code)` — see [Using it](#calling-the-facade).

Questions 1 and 2 are independent axes. **Both contracts are always live**, bound by two separate
providers.

#### Question 1, at boot — which driver does each contract use?

Every driver is registered as a provider so the container can construct it. Each **token** that consumers
inject then resolves to exactly one of them:

```ts
@Module({
  // forFeature makes notifierConfig.KEY injectable inside this module — the factories below need it.
  imports: [ConfigModule.forFeature(notifierConfig)],
  providers: [
    // every candidate, so the container can construct them
    SmtpMailService,
    LogMailService,
    ZnsPhoneService,
    SmsPhoneService,
    FallbackPhoneService,
    LogPhoneService,

    // binding 1 — the MailService token
    {
      provide: MailService,
      useFactory: (config: NotifierConfig, smtp: SmtpMailService, log: LogMailService): MailService => {
        switch (config.mailDriver) {
          case 'smtp':
            return smtp;
          case 'log':
            return log;
        }
      },
      inject: [notifierConfig.KEY, SmtpMailService, LogMailService],
    },

    // binding 2 — the PhoneService token, chosen independently
    {
      provide: PhoneService,
      useFactory: (config: NotifierConfig, zns, sms, fallback, log): PhoneService => {
        switch (config.phoneDriver) {
          case 'zns':
            return zns;
          case 'sms':
            return sms;
          case 'zns+sms':
            return fallback;
          case 'log':
            return log;
        }
      },
      inject: [notifierConfig.KEY, ZnsPhoneService, SmsPhoneService, FallbackPhoneService, LogPhoneService],
    },

    NotifierService,
  ],
  exports: [NotifierService], // contracts, drivers and their clients stay internal
})
export class NotifierModule {}
```

`inject` is the **argument list of `useFactory`**: entry _n_ becomes parameter _n_.

Two variables decide both bindings, and nothing else does:

| Var            | Allowed values                       | Binds          |
| -------------- | ------------------------------------ | -------------- |
| `MAIL_DRIVER`  | `smtp` \| `log`                      | `MailService`  |
| `PHONE_DRIVER` | `zns` \| `sms` \| `zns+sms` \| `log` | `PhoneService` |

Both are read once, through the typed `notifier` namespace — never `process.env` inline anywhere else:

```ts
// src/_core/configs/notifier.config.ts
export interface NotifierConfig {
  mailDriver: 'smtp' | 'log';
  phoneDriver: 'zns' | 'sms' | 'zns+sms' | 'log';
}

export default registerAs('notifier', (): NotifierConfig => ({
  mailDriver: process.env.MAIL_DRIVER,
  phoneDriver: process.env.PHONE_DRIVER,
}));
```

The union in `NotifierConfig` is what makes **each `switch` exhaustive with no `default` branch**: every
member has a `case`, so the function returns on every path. Add a driver to the union and forget its
`case`, and TypeScript fails the build — _not all code paths return a value_.

**Why just not `useClass`:**

```ts
{ provide: MailService, useClass: process.env.MAIL_DRIVER === 'log' ? LogMailService : SmtpMailService }
```

That ternary is a **bare expression**, so it runs the moment Node imports the file. It reads an environment variable that may not be populated yet, silently takes the wrong binding for the rest of the process.
A `useFactory` body is only _defined_ at module evaluation and _called_ at instantiation time, once config exists. → [Factory Pattern — import time vs instantiation time](FACTORY-PATTERN.md#import-time-vs-instantiation-time)

#### Question 2, in the method body — which contract does a facade method use?

```ts
@Injectable()
export class NotifierService {
  private readonly logger = new Logger(NotifierService.name);

  constructor(
    private readonly mail: MailService, // both contracts are injected,
    private readonly phone: PhoneService, // and both are always available
  ) {}

  sendSignUpOtpToPhone(phone: string, code: string): void {
    this.dispatch(this.phone.send(phone, { kind: 'SIGN_UP_OTP', code }));
  }

  sendPasswordResetOtpToEmail(email: string, code: string): void {
    this.dispatch(this.mail.send(email, { kind: 'PASSWORD_RESET_OTP', code }));
  }

  /** Every send ends here: the promise is consumed, so no failure can ever reach a request. */
  private dispatch(sending: Promise<SendOutcome>): void {
    void sending
      .then((outcome) => {
        if (!outcome.delivered) this.logger.error(outcome.reason);
      })
      .catch((error: unknown) => this.logger.error(error));
  }
}
```

`sendSignUpOtpToPhone` calls `this.phone`; `sendPasswordResetOtpToEmail` calls `this.mail`. Each method names
its contract on one line of its own body.

`dispatch` returns `void`, so the caller has **no promise to await, to inspect, or to forget to catch**.
A slow provider cannot slow a response down, a dead one cannot fail it, and an unhandled rejection cannot
reach the process.

#### When a send fails — what happens next

A driver returns a `SendOutcome` rather than throwing, and exactly **two readers** consume it:

| Reader                     | Field it reads | What it does                                 |
| -------------------------- | -------------- | -------------------------------------------- |
| `FallbackPhoneService`     | `reason`       | decides whether the second driver should try |
| `NotifierService.dispatch` | `delivered`    | logs the failure — and stops there           |

`dispatch` is the end of the line: it logs and returns nothing, so a failure never travels further.

The `FallbackPhoneService` is the one place where a `reason` changes what happens next:

```ts
@Injectable()
export class FallbackPhoneService extends PhoneService {
  constructor(
    private readonly zns: ZnsPhoneService,
    private readonly sms: SmsPhoneService,
  ) {
    super();
  }

  async send(phone: string, intent: PhoneIntent): Promise<SendOutcome> {
    const primaryTry = await this.zns.send(phone, intent);
    if (primaryTry.delivered || primaryTry.reason === 'sender-fault') return primaryTry;
    return this.sms.send(phone, intent);
  }
}
```

<br />

### The log drivers

A log driver satisfies the contract **without any provider behind it**: instead of building a provider
request, it writes the destination and the intent through `Logger` and always reports success. That is
what lets every flow run end to end with no provider account and no credentials.

```ts
@Injectable()
export class LogPhoneService extends PhoneService {
  private readonly logger = new Logger(LogPhoneService.name);

  // Not `async`: nothing here is awaited, and `@typescript-eslint/require-await` fails the build.
  send(phone: string, intent: PhoneIntent): Promise<SendOutcome> {
    this.logger.log(`${intent.kind} → ${phone} : ${intent.code}`);
    return Promise.resolve({ delivered: true });
  }
}
```

> **It prints the code itself, never just "sent".** The raw code exists for one moment — the one where it
> is generated. `Verification` stores only `sha256(code)`, and a hash cannot be reversed, so a driver that
> does not print the code destroys the only copy.

> **A log driver never reaches production.** `notifier.config.ts` throws when `NODE_ENV=production`
> and either driver resolves to `log` — which aborts the bootstrap, so the mistake surfaces at deploy
> rather than on the first sign-up. The check sits in the config factory because that is the one place
> allowed to read `process.env` → [Coding Convention §8](../CODING-CONVENTION.md#8-controllers--services).

<br />

### Calling the facade

`AuthModule` imports `NotifierModule`; `AuthService` injects `NotifierService` and calls one method:

```ts
this.notifier.sendSignUpOtpToPhone(phone, code); // no await, no catch, no transport named
```

| Facade method                                   | Contract       | Flow                                                                               |
| ----------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- |
| `sendSignUpOtpToPhone(phone, code)`             | `PhoneService` | [Sign-Up](../architecture/authen/SIGN-UP.md) — step 1                              |
| `sendSignInOtpToPhone(phone, code)`             | `PhoneService` | [Local Sign-In](../architecture/authen/LOCAL-SIGN-IN.md#mode-2--otp) — OTP mode    |
| `sendEmailVerificationOtp(email, code)`         | `MailService`  | [Link Email](../architecture/authen/LINK-EMAIL.md) — step 1                        |
| `sendPasswordResetLinkToEmail(email, resetUrl)` | `MailService`  | [Password Reset — Email Link](../architecture/authen/PASSWORD-RESET-EMAIL-LINK.md) |
| `sendPasswordResetOtpToEmail(email, code)`      | `MailService`  | [Password Reset — Email OTP](../architecture/authen/PASSWORD-RESET-EMAIL-OTP.md)   |

- One route → one method → one contract. The facade never branches.
- The caller never learns whether the send succeeded; the response returns before delivery is attempted.
- Where the user picks a destination, the controller resolves that choice into an address and calls the
  matching method — the choice never travels below the facade.

---

<br />

## How

### Integrating a transport — SMTP, SMS, ZNS

1. **Create the driver.** `src/notifier/<transport>-<contract>.service.ts`, holding
   `@Injectable() class <Transport><Contract>Service extends <Contract>Service`.
2. **Implement `send` — turn the `intent` into that provider's request body.** `send` receives an intent
   , e.g. `{ kind: 'SIGN_UP_OTP', code: '123456' }`, base on that build what the provider's API actually accepts:

   | Transport         | Reaches                              | The driver builds                                                                                     | Why that shape                                                                                                                                  |
   | ----------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
   | **SMTP**          | an inbox                             | a subject line **and** a body                                                                         | SMTP carries whatever text we write, so we own every word — and email is the one transport with a title separate from its content               |
   | **SMS**           | any SIM, no app needed               | one plain-text string                                                                                 | the carrier accepts arbitrary text and nothing else: no title, no structure, and a length cap per segment                                       |
   | **app-messaging** | an account inside that messaging app | the **id of a template the provider approved beforehand**, plus the parameters that template declares | the provider owns the wording and rejects free text, so the driver only chooses _which_ approved template fits this `kind` and fills its blanks |

3. **Translate every failure into a `SendOutcome`, and never throw.** For each error the provider
   documents, decide whose side it is: the recipient's → `recipient-unreachable`, our account's →
   `sender-unavailable`, our request's → `sender-fault`. Log the provider's raw error first — that is the
   only place it is ever seen. Map anything unrecognised to `sender-fault`.
4. **Build its client as an internal factory provider** in `NotifierModule` if it needs runtime config.
   → [Factory Pattern](FACTORY-PATTERN.md) The provider's credentials are read there and nowhere else.
5. **Register it.** Add the class to `NotifierModule.providers`, add its value to the driver union in
   `notifier.config.ts`, and add the `case` to that contract's factory — the `switch` will not compile
   until you do.

### Adding a notification

1. Add the `kind` to `MailIntent` or `PhoneIntent`.
2. Add a facade method that calls the matching contract and returns `void`.
3. Every driver of that contract now fails to compile — add the `case` that builds the request body for
   the new `kind` in each.

### Rules that do not bend

- Callers inject **`NotifierService` only** — never a contract, never a driver.
- **Never `await` a send** and never branch on its result.
- A provider's client is **never imported outside `src/notifier/`**.
- **No `default` branch** in any switch over a closed union — driver selection or `intent.kind` — it
  would swallow the next value added instead of failing the build.
- **Throttle the routes before enabling a paid transport**: every message is billable and the recipient
  is attacker-chosen. → [sign-up](../architecture/authen/SIGN-UP.md#rate-limiting)

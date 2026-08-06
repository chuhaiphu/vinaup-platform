# Storage Pattern

## What

The **Storage pattern** hides _where a file physically lives_ behind a stable **contract**, so business code never names a storage backend. One **driver** implements that contract, and business code only ever sees the contract.

- The **contract** is `StorageService` — an abstract class written in domain language (`put` / `delete` / `getPublicUrl`). Every consumer depends on it and on nothing else.
- A **driver** is one concrete implementation of the contract: `LocalDiskStorageService` (a VPS disk). Today there is exactly one.
- A **key** is the string the DB stores — `users/{userId}/avatar-{ts}.{ext}`. The public URL is derived from it, never stored.

```
  Business code (user avatar, organization logo, car images, signatures)
        │  injects
        ▼
  ┌──────────────────────────────────┐
  │  StorageService                  │   CONTRACT — abstract class
  │  put / delete / getPublicUrl     │   (the only export of StorageModule)
  └──────────────────────────────────┘
        ▲
        │ extends
  ┌──────────────────────────────────┐
  │  LocalDiskStorageService         │   DRIVER
  │  (node:fs/promises)              │
  └──────────────────────────────────┘
        one driver, bound with useClass — no boot-time switch
```

The contract is an **abstract class, not an interface**: a TypeScript interface is erased at compile time, so it cannot serve as a DI token. An abstract class exists at runtime **and** type-checks the drivers that extend it. → [Factory Pattern — the token rule](FACTORY-PATTERN.md#the-token-rule--whoever-calls-new-decides-what-may-go-in-the-constructor)

### In this codebase

`StorageModule` exports **only** the contract. The driver stays internal, so no other module can name a backend.

```ts
constructor(private readonly storageService: StorageService) {} // no @Inject, no fs
// …
await this.storageService.put(key, file.buffer, file.mimetype);
const url = this.storageService.getPublicUrl(key);
```

---

## The problem it solves

Without the contract, every upload site talks to the backend directly — `fs.writeFile` here, an S3 SDK there — and the backend leaks into feature code:

| Problem                                    | Consequence                                                                                                    | How to solve it                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| feature code calls `fs` / an SDK directly  | _where files live_ is a **deployment** decision, but changing it means editing every upload site               | one contract; swapping backends is a new driver plus one binding, and nothing outside `src/storage/` moves |
| the DB stores a full URL                   | the base URL **will** change (new domain, new bucket, CDN in front) → every change becomes a data migration    | store the **key**; `getPublicUrl(key)` re-derives the URL at read time                |
| the client sends the path back to the server | any authenticated caller can name **any** path — `../../../etc/passwd` normalises out of the upload root       | keys are **server-generated** and never accepted from input                          |
| the file extension comes from the upload's filename | content is verified by magic number but the **name** is not — a valid PNG can be stored as `evil.html` and served as HTML | derive the extension from the **verified** MIME type (`EXTENSION_BY_MIME`)            |

---

## The DB stores the file key, not the URL

A stored file is identified by its **key**. The public URL is _derived_:

```
URL = STORAGE_PUBLIC_BASE_URL + '/' + key
```

So the base URL stays a pure config value. Moving the media domain is one env var, not a migration over every row that holds an image.

**The wire still speaks URLs.** The DB column is `avatarKey`; the response DTO exposes `avatarUrl`. Clients never see a key — they cannot construct one, and they have no reason to. Only the mapping layer knows both.

```
DB          avatarKey    users/{userId}/avatar-1754468102931.webp
  │ getPublicUrl(key)
  ▼
response    avatarUrl    https://media.vinaup.com/users/{userId}/avatar-1754468102931.webp
```

### Key layout

The first segment names the **owning scope**, the second is that owner's id:

| Kind                 | Key                                                          |
| -------------------- | ------------------------------------------------------------ |
| User avatar          | `users/{userId}/avatar-{ts}.{ext}`                           |
| Organization logo    | `organizations/{organizationId}/logo-{ts}.{ext}`             |
| Member avatar        | `organizations/{organizationId}/members/{memberId}-{ts}.{ext}` |
| Car feature image    | `organizations/{organizationId}/cars/{carId}/feature-{ts}.{ext}` |
| Car additional image | `organizations/{organizationId}/cars/{carId}/additional-{ts}.{ext}` |
| Signature            | `signatures/{signatureId}-{ts}.{ext}`                        |

- **Three root scopes, because vinaup has three.** A `User` is a platform account that may belong to many organizations, so there is no single tenant id to put first. `users/…` and `organizations/…` are separate roots; a signature belongs to a document, not to either.
- **Everything an owner has lives under one prefix**, so deleting an owner is a prefix delete, and no query is needed to find their files.
- **`{ts}` makes every upload a NEW key** instead of overwriting. The URL changes, so a browser or CDN can never serve a stale cached image, and two concurrent uploads cannot race on one key.
- **Keys are server-generated**, always. Nothing in a request body ever reaches `put` or `delete`.
- **`{ext}` comes from the verified MIME type**, not from the uploaded filename. → [`storage.constant.ts`](../../src/_common/constants/storage.constant.ts)

### Replacing a file

Upload, repoint, then prune — in that order, and the prune is best-effort:

```
1. storageService.put(newKey, …)      — if this throws, the DB still points at the old file
2. row.avatarKey = newKey             — the row now points at a file that exists
3. storageService.delete(oldKey)      — best-effort; a failure leaves an orphan, not an error
```

Step 3 must never fail the request: the user's avatar **did** change. A leftover object is a cleanup problem, not a user-facing one.

> **One exception — member avatars are never pruned.** `CarAssignmentEvent.memberAvatarKey` is a **snapshot**, copied when the event is recorded so the history survives the member being renamed or removed. Pruning the member's previous avatar would break every snapshot that still points at it. Member avatars therefore accumulate by design.

---

## Choosing the driver

There is one driver, so the binding is a plain `useClass`:

```ts
// src/storage/storage.module.ts
providers: [{ provide: StorageService, useClass: LocalDiskStorageService }],
exports: [StorageService],
```

**Why not a `useFactory` that switches on an env var**, the way [`NotifierModule`](NOTIFIER-FACADE-PATTERN.md) picks a mail driver? Because a switch over a one-member union is an abstraction with nothing to abstract. → [KISS "How" §5](../principle/KISS.md#how) — _do not add an abstraction before it is needed._

The moment a **second** driver lands, the binding — and only the binding — changes shape. See [Adding a driver](#adding-a-driver).

---

## The local-disk driver

The driver writes files; **it never reads them back**. Serving is somebody else's job, and who that is differs by environment:

|                | Writes                       | Serves                        | `STORAGE_PUBLIC_BASE_URL`        |
| -------------- | ---------------------------- | ----------------------------- | -------------------------------- |
| **Production** | the API, into a bind mount   | **nginx**, straight from disk | `https://media.vinaup.com`       |
| **Dev**        | the API, into `apps/api/storage` (gitignored) | **Nest**, `useStaticAssets`   | `http://localhost:8000/storage`  |

Keeping Node out of the read path in production is the point: image traffic does not compete with request handling, and images stay up while the API restarts.

Where the driver writes is `localRoot` in [storage.config.ts](../../src/_core/configs/storage.config.ts) — `'storage'`, resolved against the process's cwd. In the container the cwd is the Dockerfile's `WORKDIR /app/apps/api`, so it lands on `/app/apps/api/storage`. The _host_ location is a docker-volume concern:

```
                 ┌──────────────────────────────────────────┐
   HOST (VPS):   │   /opt/apps/vinaup.com/media             │  ← uploaded files live here
                 └──────────────────────────────────────────┘
                      ▲ bind                     ▲ bind (:ro)
          writes      │                          │    reads
    ┌─────────────────┴───────┐      ┌───────────┴─────────────────────┐
    │  API container          │      │  nginx-proxy-manager container  │
    │  /app/apps/api/storage  │      │  /var/www/vinaup.com/media      │
    │  (localRoot)            │      │  root … ; try_files             │
    └─────────────────────────┘      └─────────────────────────────────┘
```

Three pieces must agree:

1. **API compose** ([docker-compose.yml](../../docker-compose.yml)) — mount `media_data:/app/apps/api/storage`, where `media_data` binds the host dir.
2. **nginx-proxy-manager compose** (separate stack) — bind the **same** host dir read-only: `- /opt/apps/vinaup.com/media:/var/www/vinaup.com/media:ro`.
3. **NPM proxy host** for `media.vinaup.com` → a custom nginx location serving the dir directly:
   ```nginx
   location / {
       root /var/www/vinaup.com/media;
       try_files $uri $uri/ =404;
       expires 365d;
       add_header Cache-Control "public, immutable";  # keys are immutable ({ts} in the name) → safe to cache hard
       add_header Access-Control-Allow-Origin "*";     # mobile embeds from another origin
       add_header X-Content-Type-Options nosniff;      # never let a sniffed type override the extension
   }
   ```

### Dev serving

There is no nginx in dev, so [main.ts](../../src/main.ts) mounts the storage dir as static assets — **outside production only**:

```ts
if (process.env.NODE_ENV !== 'production') {
  app.useStaticAssets(resolve(storageConf.localRoot), {
    prefix: new URL(storageConf.publicBaseUrl).pathname, // "/storage"
  });
}
```

The condition is on the **environment**, not on the driver: production runs the same local driver, and there it is nginx that must serve. Mounting the assets there too would quietly put Node back in the read path.

---

## Config

Namespace `storage` ([storage.config.ts](../../src/_core/configs/storage.config.ts)) — one env var:

| Var                       | Meaning                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `STORAGE_PUBLIC_BASE_URL` | base of every public URL. Dev: the API origin + `/storage` (`http://localhost:8000/storage`). Prod: `https://media.vinaup.com` |

Everything else in the namespace is **code-owned, not env**, because changing it is a code decision that should be reviewed like one:

- the **upload policy** — `MAX_FILE_SIZE_BYTES` (5 MB) and `ALLOWED_MIME_TYPES` (jpeg/png/webp), plus the derived `ALLOWED_MIME_REGEX` and `EXTENSION_BY_MIME` — lives in [`storage.constant.ts`](../../src/_common/constants/storage.constant.ts) and is imported into the config's `maxFileSizeBytes` / `allowedMimeTypes` fields, so every upload endpoint enforces one policy;
- **`localRoot`** — the driver's write path relative to cwd; the physical host location is chosen by the docker volume instead.

`ALLOWED_MIME_REGEX` is what `FileTypeValidator` matches against, and it is compared to the **magic-number-detected** type, not to the client's `Content-Type` header. `EXTENSION_BY_MIME` maps that same verified type to the extension the key gets — the two are derived from one list, so the allow-list stays a single source.

---

## How

1. **Depend on the contract.** Inject `StorageService`; call `put` / `delete` / `getPublicUrl`. Never touch `fs` outside `src/storage/`.
2. **Generate the key server-side** on the documented layout — owning scope first, `{ts}` in the name, extension from the verified MIME — and store the **key**. Never accept a key or a path from a request.
3. **Expose `*Url`, store `*Key`.** The response DTO maps one to the other with `getPublicUrl`; the column name ends in `Key` so the two can never be confused at a call site.
4. **Replace with put → repoint → prune**, and let the prune fail silently. → [Replacing a file](#replacing-a-file)
5. **Keep the driver cheap to construct** — no I/O in a constructor, so the container can build it eagerly.

### Adding a driver

1. Create `src/storage/<name>-storage.service.ts` — `@Injectable() class <Name>StorageService extends StorageService`, implementing the three methods over the **same key layout**, so objects stay portable between backends.
2. If it needs a third-party client with runtime config (an `S3Client`, say), build that client as an **internal factory provider** in `StorageModule`, the same shape as `'DATABASE'` in `PrismaModule`. → [Factory Pattern](FACTORY-PATTERN.md#in-this-codebase)
3. **Now** the binding earns a factory. Add a `StorageDriver` union and a `driver` field to `storage.config.ts`, then replace the `useClass` binding with a `useFactory` that switches on it — an `useClass` ternary would be evaluated during module evaluation, before `ConfigModule.forRoot` has read `.env`, and would always pick the same branch. → [Factory Pattern — import time vs instantiation time](FACTORY-PATTERN.md#import-time-vs-instantiation-time)
4. Register the new class in `StorageModule.providers`, and keep `exports` at `[StorageService]` alone.
5. Nothing outside `src/storage/` changes — that is the point.

---

# Coding Convention

## How conventions are enforced

| Tier              | Enforced by                                 | Examples                                                  |
| ----------------- | ------------------------------------------- | --------------------------------------------------------- |
| **Mechanical**    | Prettier / ESLint — surfaces in `expo lint` | formatting, symbol casing, import order, file naming      |
| **Architectural** | Code review                                 | layer/import direction, provider/store rules, modal split |

---

## 1. Naming

### 1.1 File naming

Every file is `kebab-case` with a role suffix. The file name matches its primary exported symbol — one primary concept per file.

| Role             | Pattern                                            |
| ---------------- | -------------------------------------------------- |
| Component        | `<name>.tsx`                                       |
| API / repository | `<domain>-apis.ts` / `<domain>-<resource>-apis.ts` |
| Provider         | `<name>-provider.tsx`                              |
| Hook             | `use-<name>.ts(x)`                                 |
| Zustand store    | `use-<name>-store.ts`                              |
| Interface group  | `<domain>-interfaces.ts`                           |
| Constants        | `<domain>-constants.ts`                            |
| Pure helper      | `<verb>-<topic>.ts`                                |
| Modal            | `<name>-modal.tsx` / `<name>-modal-content.tsx`    |

- Files under `src/app/` follow expo-router naming (`_layout.tsx`, `[param].tsx`, `(group)/`) and are exempt from the kebab-case rule.
- Shared core files carry a leading `_` to sort to the top (`_meta-interfaces.ts`).

### 1.2 Symbol naming

| Kind                                               | Style                                              |
| -------------------------------------------------- | -------------------------------------------------- |
| React component (function)                         | `PascalCase`                                       |
| Hook                                               | `camelCase`, `use` prefix                          |
| Zustand store hook                                 | `camelCase`, `use…Store` suffix                    |
| Provider trio                                      | `XxxProvider` + `useXxxContext` + `XxxContextType` |
| Interface / Type                                   | `PascalCase`                                       |
| Reusable constant (`as const` object or primitive) | `CONSTANT_CASE`                                    |
| Its derived type                                   | `PascalCase`                                       |
| Other variable / function                          | `camelCase`                                        |

> **PascalCase functions are reserved for React components.** Hooks are `camelCase` with a `use` prefix.
> The `naming-convention` rule allows both `camelCase` and `PascalCase` for functions for this reason.

**Interface role names:** `CreateXxxRequest`, `UpdateXxxRequest`, `XxxResponse`, `XxxFilterParam`, `XxxMeta`, `ResponseWithMeta<Data, Meta>`.

**Entity projections (trimmed-down types):** name by the **role at the usage site**, not by size — no `Summary`/`Lite`/`Mini` suffixes. Derive with `Pick<SourceType, ...>` instead of hand-writing the interface, so the link to the source type is explicit and compiler-checked (e.g. `type ConflictingTrip = Pick<TripResponse, 'id' | 'description' | 'startDate' | 'endDate'>`).

**Names carry their shape:**

- Booleans read as predicates: `isSender`, `canEdit`, `hasSigned`.
- Non-primitive collections get a type suffix when the plural is ambiguous: `userByIdMap` (Map), `tagList` (Array).
- Primitives keep semantic names — no type suffix (`count`, `name`, `isActive`).

### 1.3 Enum constants

A frozen `as const` object with its type _derived_ from it so value and type can't drift. → [DRY](principle/DRY.md)

1. **Container** — `UPPER_SNAKE`, singular, no abbreviations: `BOOKING_STATUS` (never `_TYPES` / `ORG_*`).
2. **Keys** — an _enum-like_ object (a closed member set) uses `UPPER_SNAKE` keys and the value equals the key (`DRAFT: 'DRAFT'`, multi-word `SENDER_SIGNED: 'SENDER_SIGNED'`); a _config/data_ object (palette, scale) uses `camelCase` keys (`teal700`). A value is intrinsic — an enum member, a display label, a storage slot — never re-cased to fit a rule.
3. **Derived type** — `PascalCase`, singular: `BookingStatus`.

A **domain (wire) enum referenced by a shared Zod schema is declared once in `@vinaup-platform/validation` and imported** — never re-declared on the device (§6), so it can't drift from the API. A wire enum **not** referenced by any schema (a plain-string column the API mirrors from its own `_common/constants/`) is mirrored on the device by hand in the same shape, kept in sync with the API constant.

**Authorization vocabulary** — the RBAC axes (`PERMISSION_ACTION`, `PERMISSION_RESOURCE`) and the ReBAC tour-participation strings (`TOUR_IMPLEMENTATION_MEMBER_ROLE`, `TOUR_IMPLEMENTATION_USER_ROLE`, `RECEIPT_PAYMENT_GROUP_CODE`, `TOUR_ASSIGNMENT_PERMISSION`) — is declared once in `@vinaup-platform/permission` and imported by both API and device, same as validation wire enums. Never re-declare an authorization string on the device. See [UI Action Gating Pattern](pattern/UI-ACTION-GATING-PATTERN.md).

```ts
export const BOOKING_STATUS = {
  DRAFT: 'DRAFT',
  SENDER_SIGNED: 'SENDER_SIGNED',
} as const;
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
```

### 1.4 Asset file naming

**Every file under `src/assets/` is `snake_case` — never a hyphen, never an uppercase letter.**

This is the one place the `kebab-case` rule of §1.1 does not apply. `snake_case` is used because it is the only alphabet
that survives every way an asset reaches the native projects.

| How the asset is consumed                                    | Declared in `app.json`?           | Name constraint                       |
| ------------------------------------------------------------ | --------------------------------- | ------------------------------------- |
| `require('@/assets/images/x.png')`                            | **no** — Metro bundles it         | soft — see below                      |
| `<Image source={{ uri: 'x' }} />`                             | **yes** — `expo-asset` `assets`   | **hard**: `/^[a-z][a-z0-9_]*$/`, and not a Java reserved word |
| `icon`, `android.adaptiveIcon`, splash `image`, `web.favicon` | that field itself, by path        | none — the plugin renames the file    |


**Prefix an asset with `vinaup_` when — and only when — it is listed in `expo-asset`.** Those land in
`res/drawable/`, a flat namespace shared with every library in the app (`rn_edit_text_material`,
`ic_launcher_background` are already there). A `require()`d asset is namespaced by its path
(`src_assets_images_<name>`) and needs no prefix.

**List files in `expo-asset`, never a directory.** A directory pulls in every neighbour — including the app
icon and splash image, which their own plugins already process, so they end up embedded twice.

```
src/assets/images/
├── app_icon.png                      → expo.icon
├── app_icon_adaptive_foreground.png  → android.adaptiveIcon.foregroundImage
├── splash_logo.png                   → expo-splash-screen
├── vinaup_logo_primary.png           → web.favicon
├── vinaup_logo_secondary.png         → expo-asset · {{ uri: 'vinaup_logo_secondary' }}
└── vinaup_loader.gif                 → expo-asset · {{ uri: 'vinaup_loader' }}
```

---

## 2. File & folder structure

Organise **by layer, then by domain**. → [SoC](principle/SOC.md)

```
src/
├── app/          UI — expo-router screens & layouts (file-based routing)
├── components/   UI — primitives · commons · icons · <domain>
├── providers/    State — server-state Context providers
├── hooks/        State — Zustand stores + UI hooks
├── apis/         API — repository functions, one folder per domain
├── interfaces/   Core — request/response types
├── constants/    Core — as-const enums, formats, colours, storage keys
└── utils/        Core — pure helpers, split by concern
```

### 2.1 API layout

Simple domain: `<domain>/<domain>-apis.ts`. Complex domain splits by sub-resource in the same folder. No cross-domain leakage.

### 2.2 Providers

`auth/` · `commons/` (cross-domain) · `organization/` (per-org domains) · `personal/` (personal domains). Each provider is mounted at the closest route that needs it.

### 2.3 Components & modals

`primitives/` (RN wrappers) · `commons/` (shared cross-domain) · `icons/` · `<domain>/`. Modal folder layout:

```
components/{scope}/modals/
└── {name}-modal/
    ├── {name}-modal.tsx          ← shell
    ├── {name}-modal-content.tsx  ← content (only if split)
    └── {name}-real-list.tsx      ← optional paginated/virtual list
```

### 2.4 Pure helpers

Recurring pure logic is extracted to `src/utils/`.

| Subdirectory                     | Concern               |
| -------------------------------- | --------------------- |
| `calculator/`                    | business calculations |
| `generator/string-generator/`    | string formatting     |
| `generator/file-generator/html/` | HTML templates        |
| `generator/file-generator/pdf/`  | PDF create & share    |

Add a concern subfolder only when a helper of that concern actually exists (KISS).

---

## 3. Imports

### 3.1 Path alias

Use the `@/` alias for cross-layer imports (`@/apis/...`, `@/constants/...`); relative imports for same-folder siblings.

### 3.2 Import order

Groups: builtin → external → internal (`@/**`) → relative, blank line between groups, alphabetised.

### 3.3 Import direction

Dependencies point **inward** only (UI → State → API → Core). → [SoC](principle/SOC.md)

| Layer        | May import                                                      |
| ------------ | --------------------------------------------------------------- |
| `interfaces` | interfaces, constants                                           |
| `constants`  | interfaces, constants                                           |
| `utils`      | interfaces, constants, utils                                    |
| `apis`       | interfaces, constants, utils, apis                              |
| `providers`  | interfaces, constants, utils, apis, providers, hooks            |
| `hooks`      | interfaces, constants, utils, hooks                             |
| `components` | interfaces, constants, utils, providers, hooks, components      |
| `app`        | interfaces, constants, utils, providers, hooks, components, app |

A component importing `wireData` directly, or an api importing a provider, is a layering violation.

---

## 4. Formatting

Owned entirely by Prettier (`.prettierrc`). Current settings:

| Option          | Value  |
| --------------- | ------ |
| `singleQuote`   | `true` |
| `semi`          | `true` |
| `trailingComma` | `all`  |
| `printWidth`    | `100`  |
| `tabWidth`      | `2`    |

---

## 5. Repository & API

→ [Repository Pattern](pattern/REPOSITORY-PATTERN.md)

- **Never call `wireData` outside `src/apis/`.** Providers/hooks/screens import named functions only.
- **Verb table** — name a function by the action:

  | Verb        | HTTP      | Use                      |
  | ----------- | --------- | ------------------------ |
  | `create`    | POST      | create an entity         |
  | `get`       | GET       | read one/many            |
  | `update`    | PUT/PATCH | edit                     |
  | `delete`    | DELETE    | remove                   |
  | `search`    | GET       | query-based search       |
  | domain verb | POST      | non-CRUD business action |

- **Filtered list endpoints always use `generateFilterQueryString`** — never hand-roll `URLSearchParams`.
- **Empty responses** → `wireData<void>` (prefer for new code) or `<null>` (legacy).
- **Metadata responses** → `wireData<XxxWithMeta>`, with `XxxWithMeta` declared in `src/interfaces/`.

---

## 6. Validation

→ shared schemas in `@vinaup-platform/validation`. → [Validation Pattern (api)](../../api/docs/pattern/VALIDATION-PATTERN.md)

- **Forms validate with the shared Zod schema** — import `createXxxSchema` from `@vinaup-platform/validation`; never re-declare field rules on the device.
- **Request types come from the package** (`z.infer`), not hand-written interfaces that duplicate a schema.
- Validate on submit with `schema.safeParse(values)` (or a form-library resolver); map `result.error.issues` to per-field messages. For a small form, wrap this mapping in the validator passed to `useValidatedFields` (§11) rather than hand-rolling the value/error `useState` per field.
- The schema is the **same object** the API enforces, so anything that passes on-device is accepted by the API — no drift.
- **Enum values referenced by a shared schema come from the package's `constants/`** — don't redeclare them on the device. A wire enum with no schema (a plain-string API column) is the exception: mirror it by hand from the API constant, kept in sync (§1.3).

```ts
import { createEntitySchema } from '@vinaup-platform/validation';
import type { CreateEntityRequestInterface } from '@vinaup-platform/validation';

const result = createEntitySchema.safeParse(form);
if (!result.success) {
  showFieldErrors(result.error.issues); // [{ path, message }, …]
  return;
}
createEntity(result.data); // result.data: CreateEntityRequestInterface, already cleaned
```

### 6.1 An emptied input sends `null`, never `undefined`

A field the user clears and a field the user never touched are **two different instructions**, and the wire keeps them apart: `null` means "clear this column", an omitted key means "leave it unchanged". The API acts on that distinction directly — it hands the parsed body straight to Prisma. → [Validation Pattern: Optionality & nullability (api)](../../api/docs/pattern/VALIDATION-PATTERN.md#optionality--nullability-gating-undefined-and-null)

So on a field the schema declares `.nullish()`, an emptied input must travel as `null`. Send `undefined` and the update silently does nothing — the form closes, the request returns 200, and the old value is still there.

```ts
// ✅ empty -> null: the column is cleared
note: note.trim() || null,
categoryId: selectedCategory?.id ?? null,   // deselecting clears it too
// ✅ empty -> null, without letting a legitimate 0 become null
seatCount: seatCount.trim() === '' ? null : Number(seatCount),

// ❌ empty -> undefined: reads as "leave unchanged", so the field can never be cleared
note: note.trim() || undefined,
categoryId: selectedCategory?.id,
```

**Type the field `T | null`, not `T?`.** A local prop or callback type narrowed to `T?` is what forces a `?? undefined` coercion to typecheck — the narrow type is the cause, the coercion only the symptom. Every layer the value crosses (content → modal → header) must carry the same nullable type:

```ts
// ✅ every layer keeps the null
onSubmit?: (data: { note?: string | null }) => void;
onSubmit={(data) => onConfirm?.(data, closeModal)}   // forwarded untouched

// ❌ a narrow type upstream, then a coercion that destroys what the form got right
onSubmit?: (data: { note?: string }) => void;
onSubmit={(data) => onConfirm?.({ ...data, note: data.note ?? undefined }, closeModal)}
```

`undefined` stays correct where the value is **not** an update payload: create-only requests (on a nullable column both mean NULL), filter queries (filter fields are `.optional()`, so `null` is rejected 400), router params (they cannot carry `null`), and display props typed `string | undefined`.

---

## 7. Providers

→ [Provider Pattern](pattern/PROVIDER-PATTERN.md)

- Trio per provider: `XxxProvider` + `useXxxContext()` (guarded throw) + `XxxContextType`.
- `createContext<XxxContextType | null>(null)` — never a stub default.
- Mount at the **closest** layout/screen where the entity id first appears; wrap content in `<ErrorBoundary>` + `<Suspense>`.
- Providers own mutations and expose `handleXxx(...)`; screens call handlers, never import api functions directly.
- Every `useMutationFn` has an `onError` calling `generateErrorMessage`.

**fetchKey & tag naming** — full model in [Tag-Based Cache Invalidation Pattern](pattern/INVALIDATE-TAG-PATTERN.md). The load-bearing rules:

- **Tags live in one registry — never a string literal at a call-site.** All `tags`/`invalidatesTags` values come from `FETCH_TAG.*` and the `get*RippleTags` functions in [`@/constants/fetch-tag-constants`](src/constants/fetch-tag-constants.ts). An untyped tag drifts silently (no error, just stale UI), so routing every provide and invalidate through the same function is what prevents drift.
- **fetchKey stays inline** — it is the local cache identity (`organization-<entity>-${id}`, `organization-<entity>-list-${orgId}`, …), used at one call-site; only _tags_ move to the registry. Unlike file/symbol names in §1.1, the `organization-` / `personal-` scope prefix on these strings is **unconditional** — they name scoped server state.
- **A read lists its own tag + the `-list` of anything on screen that another write can change.** Usually just its own tag; add a `-list` only when the screen shows data edited elsewhere (car detail lists `carList` because assigning a trip changes the car's status).
- **A write to X lists `FETCH_TAG.xList` + every `-list` that shows X (= `getXRippleTags()`), plus `FETCH_TAG.xByXId(id)` on an update.** A name you display counts (renaming a customer must refresh the booking that shows it). When an interface gains an embedded/derived field, update its `getXRippleTags`. A child under many parents gets one `getXRippleTags(parent)` function, not a per-screen list.

---

## 8. Zustand stores

→ [Observer Pattern](pattern/OBSERVER-PATTERN.md)

- Zustand is for **UI / ephemeral state only** — never server entities (those go in providers).
- Persist **only** user preferences (`persist` middleware → key in `STORAGE_KEYS`); add a `clearStorage()` call in `performLogout` for every persisted store.
- Subscribe with a **selector** (`useStore((s) => s.slice)`), never destructure the whole store — **one value per selector call** (setters too), and **never build a new object/array inside the selector** (unstable identity → re-renders every time). Don't add read-only getter actions for render to call (not reactive). → [Observer Pattern §Rule 4](pattern/OBSERVER-PATTERN.md)

---

## 9. Modals

→ [Composite Pattern](pattern/COMPOSITE-PATTERN.md) · [Keyboard & Modal Pattern](pattern/KEYBOARD-MODAL-PATTERN.md)

**Callback naming — one name per role, never reused across layers:**

| Layer                                       | Name             | Signature                     |
| ------------------------------------------- | ---------------- | ----------------------------- |
| `ConfirmSlideSheet` footer                  | `onConfirmPress` | `() => void`                  |
| content ref (`ConfirmSlideSheetContentRef`) | `submit()`       | `() => void`                  |
| content emit prop                           | `onSubmit`       | `(value) => void`             |
| shell public API                            | `onConfirm`      | `(value, closeModal) => void` |

**Scroll & keyboard — ownership is fixed; do not re-implement per modal:**

- `SlideSheet` owns keyboard avoidance via `maxHeight` + `marginBottom` (never translate the sheet by keyboard height).
- `ConfirmSlideSheet` owns the body scroll; it is `scrollable` by default. A form `*-modal-content.tsx` renders **fields only** — no `ScrollView`, no `flexShrink`.
- Pass `scrollable={false}` when the body self-scrolls or fills (`SingleSelect`/`MultiSelect` lists, `flex: 1` fill, or its own `ScrollView`).

Folder layout for a split modal is in [§2.3](#23-components--modals).

---

## 10. Components

- **Primitive wrappers spread base props** (`<Pressable {...props}>`) — never cherry-pick a few.
- **Components receive data via props; they do not fetch** — except container components / providers. → [KISS](principle/KISS.md), [SoC](principle/SOC.md)
- Add **exactly one** concern per primitive wrapper (`Button` adds loading state, nothing else).

---

## 11. State mechanism

Pick the simplest mechanism that works. → [KISS](principle/KISS.md)

| Need                                | Mechanism                                                             |
| ----------------------------------- | --------------------------------------------------------------------- |
| Pure display                        | props, no state                                                       |
| Toggle / transient UI               | `useState`                                                            |
| Form with validation, any size      | `useValidatedFields` hook                                             |
| UI state shared across the app      | Zustand store (`useNavigationStore`, `useToastStore`, utility stores) |
| Server data shared across screens   | Context provider + `useFetch` (Suspense) / `useFetchFn` (conditional) |

> `useValidatedFields` (`src/hooks/`) owns value + per-field error state and the reward-early/punish-late
> timing; the caller passes an agnostic validator that wraps the shared Zod schema (§6). A hybrid field
> with side concerns stays outside the hook as its own `useState`.

**Field count does not change the mechanism.** One `useValidatedFields` call holds a nine-field form
(`attendance-conclusion-modal-content.tsx`) as readily as a two-field one, because the hook is generic
over the value shape. Reaching for Zustand instead would put a server entity's fields in a global store
— which §8 forbids — and force a manual reset every time the modal is opened on a different record;
remounting the content on a `key` does that for free.

---

## 12. Date & time

Two temporal patterns, split by whose lens owns the value → [Instant Time Pattern](pattern/INSTANT-TIME-PATTERN.md) · [Calendar-Date Pattern](pattern/CALENDAR-DATE-PATTERN.md)

**Instant** (viewer-relative — bookings, `signedAt`, `createdAt`):

- **Send** as UTC ISO with `.toISOString()`.
- **Display** through the device-local lens (`dayjs(value).format(...)`).
- **Compute** "which calendar day/month" **on-device** — the backend ships instants only.

**Calendar date** (org-anchored or plain — attendance `workDate`, a cutoff, a birthday):

- **Send / show** a bare `YYYY-MM-DD` — never `.toISOString()`, never through a lens.
- **Never derive the day on-device** — the server stamps the instant and derives the day in the org timezone; the device shows `workDate` verbatim.
- **Gate a punch affordance on the live workDate** — a check-in control only renders when the day on screen equals `generateCalendarDate(now, organization.timezone)`, compared in the **org** lens (never the device's). → [Calendar-Date Rule 5](pattern/CALENDAR-DATE-PATTERN.md)

- Day.js **core only** (no `utc`/`timezone` plugins) — true for **both**; the device never does timezone math.

---

## 13. Comments

Comments answer **WHY**, not WHAT. Structure non-trivial logic as numbered/section steps; don't narrate obvious code.

---

## 14. Safe area insets

> "Safe area" = the screen region not covered by system UI (status bar at top, navigation bar / home indicator at bottom). On Android, **edge-to-edge is on by default since Expo SDK 54** and cannot be disabled — the app draws behind translucent system bars, so **we** must pad for them.

[Expo SDK 54](https://expo.dev/changelog/sdk-54)

[Android Edge-to-edge design — edge-to-edge](https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge)

**Rule: never use `SafeAreaView`. Read insets with `useSafeAreaInsets()` and apply them as plain styles.**

- The root `SafeAreaProvider` **must** receive `initialMetrics={initialWindowMetrics}` (in `src/app/_layout.tsx`) so insets have correct values on the very first render instead of being measured asynchronously. → [`react-native-safe-area-context` — useSafeAreaInsets](https://appandflow.github.io/react-native-safe-area-context/api/use-safe-area-insets)
- Layout container that must clear an edge: `paddingTop: insets.top` / `paddingBottom: insets.bottom`.
- Empty bottom spacer (e.g. inside a `SlideSheet`): `<View style={{ height: insets.bottom }} />`.

**never use `SafeAreaView`. Read insets with `useSafeAreaInsets()` and apply them as plain styles.**
[React Navigation — Handling safe areas](https://reactnavigation.org/docs/handling-safe-area/)

```tsx
// ❌ Before
import { SafeAreaView } from 'react-native-safe-area-context';
<SafeAreaView edges={['bottom']} />;

// ✅ After
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const insets = useSafeAreaInsets();
<View style={{ height: insets.bottom }} />;
```

> Trade-off: the hook is "not updated synchronously … slight delay when rotating the screen". This app is locked to `portrait`, so that case does not apply.

---

## 15. Styling tokens

All style values come from the token objects in [`@/constants/style-constants`](../src/constants/style-constants.ts) — **never a magic number** in a style prop or `StyleSheet.create`.

| Style prop                     | Token object                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `fontSize`                     | `FONT_SIZES`                                                                  |
| `fontWeight`                   | `FONT_WEIGHTS` (never `'bold'` — always the token, which resolves to `'700'`) |
| `gap` / `padding*` / `margin*` | `SPACING`                                                                     |
| `borderRadius`                 | `RADIUS`                                                                      |
| icon `size=`                   | `ICON_SIZES`                                                                  |
| `<Avatar size>`                | `AVATAR_SIZES`                                                                |
| header bar height              | `HEADER_HEIGHT`                                                               |

**Font size is a role, not a number** — pick the token by what the text _is_:

| Token         | Value | Role                                         |
| ------------- | ----- | -------------------------------------------- |
| `xxs`         | 10    | tab-bar label only                           |
| `xs`          | 12    | caption, badge, helper, field error          |
| `sm`          | 14    | secondary text, field label, table cell      |
| `base`        | 16    | body, input text, button title               |
| `lg`          | 18    | screen-header title, emphasised body         |
| `xl`          | 20    | small heading (profile name, section header) |
| `'2xl'`       | 24    | section heading, auth title, large amount    |
| `'3xl'/'4xl'` | 30/36 | reserved (hero / large numerals)             |

Grounding: [Material 3 type roles](https://m3.material.io/styles/typography/applying-type) · [Apple HIG typography](https://developer.apple.com/design/human-interface-guidelines/typography) (11pt minimum) · 4pt spacing grid.

**Allowed literal exceptions** (comment WHY when not obvious):

- `borderWidth` (1, 1.5, `StyleSheet.hairlineWidth`) and decorative micro-heights (tab underline `height: 2`).
- Layout-specific `width`/`height` that are not one of the token groups (input control heights, illustration boxes).
- `hitSlop`, `elevation`, shadow offsets, ±1–3px optical adjustments.
- `Loader`/`ActivityIndicator` `size`, and CSS inside HTML/PDF template strings (`src/utils/generator/`) — print typography, not app UI.
- `0` (reset) and negative spacing written as a token expression (`-SPACING.sm`).
- Multi-line body text gets `lineHeight` ≈ `fontSize * 1.4` (rounded to an even number); single-line text takes none.

---

## Enforcement map

| §    | Convention                                                                     | Enforced by                                      |
| ---- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| 1.1  | File naming                                                                    | `eslint-plugin-check-file` (excludes `src/app/`) |
| 1.2  | Symbol casing                                                                  | `@typescript-eslint/naming-convention`           |
| 1.3  | Enum constants                                                                 | Review                                           |
| 1.4  | Asset file naming                                                              | Review — `expo prebuild` warns, it does not fail |
| 2    | Folder structure                                                               | Review                                           |
| 3.2  | Import order                                                                   | `import/order` (`warn`)                          |
| 3.3  | Import direction                                                               | Review                                           |
| 4    | Formatting                                                                     | Prettier (`eslint-plugin-prettier/recommended`)  |
| 5–13 | API, validation, provider, store, modal, component, state, date-time, comments | Review                                           |
| 14   | Safe area insets (no `SafeAreaView`)                                           | Review                                           |
| 15   | Styling tokens (no magic numbers in styles)                                    | Review                                           |

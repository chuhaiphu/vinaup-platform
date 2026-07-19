# Observer Pattern

## What

The Observer pattern defines: when a subject changes state, all registered observers are notified automatically. This decouples state producers from the components that react to that state.

### In this codebase

In this codebase the Observer pattern is implemented through **Zustand stores** — module-level singletons that live for the entire app lifetime.

### Subscribing

Components call the store hook and pass a selector to subscribe only to the slice they need — so they only re-render on changes to that slice.

```ts
// re-renders only when isNavigating changes
const isNavigating    = useNavigationStore((s) => s.isNavigating);

// actions have stable references → never trigger a re-render
const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
```

### Three store variants

#### Variant 1 — Simple
Ephemeral state that resets when the app restarts. No middleware.

```ts
// src/hooks/use-navigation-store.ts
export const useNavigationStore = create<NavigationStore>()((set) => ({
  isNavigating: false,
  setIsNavigating: (value) => set({ isNavigating: value }),
}));
```

#### Variant 2 — Persisted
User preferences that must survive an app restart. Uses the `persist` middleware backed by AsyncStorage.

```ts
// src/hooks/use-organization-utility-store.ts
export const useOrganizationUtilitiesStore = create<OrganizationUtilitiesStore>()(
  persist(
    (set) => ({
      selections: {},
      toggleUtility: (orgId, key) =>
        set((state) => {
          const current    = state.selections[orgId] ?? [];
          const isSelected = current.includes(key);
          const updated    = isSelected ? current.filter((k) => k !== key) : [...current, key];
          return { selections: { ...state.selections, [orgId]: updated } };
        }),
      setUtilities:   (orgId, util) => set((state) => ({ selections: { ...state.selections, [orgId]: util } })),
      resetUtilities: (orgId) =>
        set((state) => {
          const next = { ...state.selections };
          delete next[orgId];
          return { selections: next };
        }),
    }),
    { name: STORAGE_KEYS.organizationUtilities, storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

#### Variant 3 — Complex with `get()`
When an action needs to read the current value of multiple fields (cross-field validation, derived values), use `(set, get) => ({})`.

```ts
// src/hooks/use-receipt-payment-form-store.ts
validateBeforeSave: () => {
  const { description, unitPrice } = get();
  const nextErrors = {
    description: !description.trim(),
    unitPrice:   Number(unitPrice) <= 0,
  };
  set({ inputErrors: nextErrors });
  return !nextErrors.description && !nextErrors.unitPrice;
},
```

### Stores currently in the codebase

| Store | Variant | Persisted | Purpose |
|-------|---------|:---:|---------|
| `useNavigationStore` | Simple | ❌ | toggle the navigation loading overlay |
| `useOrganizationUtilitiesStore` | Persisted | ✅ | selected utilities per organization |
| `usePersonalUtilitiesStore` | Persisted | ✅ | selected utilities in personal mode |
| `useReceiptPaymentFormStore` | Complex (`get()`) | ❌ | receipt/payment form with cross-field validation |

### Clearing persisted stores on logout

```ts
// src/providers/auth/auth-provider.tsx — performLogout()
usePersonalUtilitiesStore.persist.clearStorage();
useOrganizationUtilitiesStore.persist.clearStorage();
```

---

## Why

Modal open/close, navigation loading, form drafts, user preferences… all need to be accessed from components scattered across the tree. Lifting state and prop-drilling it would drag props through components that never use them.

React Context solves the same problem but suits **server data with a fetch lifecycle** (see Provider Pattern). For pure UI state that changes often, Zustand is lighter: no Provider wrapper, and persistence is one middleware line.

---

## How

### Rule 1 — Zustand is for UI / ephemeral state only

Do not store API responses (server entities) in Zustand. Server data belongs in Context Providers.

### Rule 2 — Persist only user preferences

Use the `persist` middleware only for data that must survive a restart: `useOrganizationUtilitiesStore`, `usePersonalUtilitiesStore`. Do not persist navigation loading or temporary form drafts.

### Rule 3 — Clear persisted stores on logout

Every persisted store **must** be `clearStorage()`-ed inside `performLogout` in `auth-provider.tsx`. Forgetting this means the next user inherits the previous user's data.

### Rule 4 — Selective subscription

**Why it matters.** Calling the hook with no selector — `useStore()` — subscribes to the
**whole state object**. Every `set()` produces a new state object, so the component
re-renders even when the field it uses did not change.

```ts
// ✅ re-renders only when that slice changes
const isNavigating = useNavigationStore((s) => s.isNavigating);

// ✅ setter has a stable reference → this component never re-renders from the store
const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

// ❌ subscribes to the whole store → re-renders on ANY set(), even unrelated ones
const { isNavigating, setIsNavigating } = useNavigationStore();
```

Three traps that make a "selector" still wrong:

**4a — One value per selector call.** Need several fields? Call the hook once per field.
Returning an object groups them into a fresh reference every run (see 4b).

```ts
// ❌ new object every run → re-renders on every store change (defeats the selector)
const { toast, hideToast } = useToastStore((s) => ({ toast: s.toast, hideToast: s.hideToast }));

// ✅ one call per field
const toast     = useToastStore((s) => s.toast);
const hideToast = useToastStore((s) => s.hideToast);
```

**4b — Never build a new object/array inside the selector.** Zustand caches the selector
result and compares by identity (`Object.is`). A fresh `[]`/`{}`/`.map()`/`.filter()`
each run is never identity-equal, so it re-renders every time (and React warns the
snapshot is not cached). Select the **stored reference**, then derive outside.

```ts
// ❌ `?? []` makes a new array each run → unstable identity
const selected = useOrganizationUtilitiesStore((s) => s.selections[orgId] ?? []);

// ✅ select the raw stored slice, default OUTSIDE the selector
const selectionsForOrg = useOrganizationUtilitiesStore((s) => s.selections[orgId]);
const selected = selectionsForOrg ?? [];
```

**4c — Subscribe to the data slice, not a getter action.** A function in the store has a
stable reference, so selecting it (`(s) => s.getThing`) and calling `getThing(id)` in
render reads the right value **once** but will not re-render when the underlying data
changes (getters are not reactive).

### Rule 5 — Use `(set, get) => ({})` only when cross-field is needed

`get()` returns the **current state at the moment it is called** — it is a one-shot read,
not a subscription, so it never causes a re-render. Call it **only inside an action**
(a setter, handler, or async callback — code that runs at a discrete moment), **never in
render**.

Reserve the `(set, get)` signature for actions that read a **different** field than the one
they set, before computing the next state (e.g. `validateBeforeSave` reads `description` +
`unitPrice`), or that read state inside an async callback to avoid a stale closure.

```ts
// ✅ cross-field read inside an action
validateBeforeSave: () => {
  const { description, unitPrice } = get();
  ...
},
```

An action that only derives the next value from the **same** field uses the `set` updater
form — no `get` needed (this is why `toggleUtility` takes only `set`):

```ts
// ✅ same-field update → updater form, no get()
toggleUtility: (orgId, key) => set((state) => ({ /* derive from state.selections */ })),
```

---

## Adding a new store

Copy from the matching variant:
- Pure ephemeral UI state → Variant 1.
- User preference that must persist → Variant 2 (add the key to `STORAGE_KEYS` and add `clearStorage()` to `performLogout`).
- Form with cross-field validation → Variant 3.

The file lives at `src/hooks/use-{name}-store.ts`. → [Coding Convention §1.1](../CODING-CONVENTION.md), [§7](../CODING-CONVENTION.md)

# Separation of Concerns (SoC)

## What

Separation of Concerns is a software design principle that divides a program into distinct sections — concerns — each responsible for one specific aspect of the program's behaviour. When concerns are cleanly separated, a change in one section does not ripple into others, each section is independently readable, testable, and changeable.

### In this codebase

Each unit of code — file, function, component, or layer — should have one clearly defined concern. A concern is a distinct aspect of behaviour: fetching data, rendering UI, managing state, defining types, or handling business logic. When concerns are mixed, a change in one area requires understanding and touching unrelated code.

### Layer separation

The codebase is organised into four layers. Dependencies only point **inward** — outer layers depend on inner layers, never the reverse.

```
┌─────────────────────────────────────────┐
│  UI Layer                               │  screens, components
│  src/app/, src/components/              │
├─────────────────────────────────────────┤
│  State Layer                            │  server state + UI state
│  src/providers/, src/hooks/             │
├─────────────────────────────────────────┤
│  API Layer                              │  HTTP transport adapters
│  src/apis/                              │
├─────────────────────────────────────────┤
│  Core Layer                             │  types, constants, pure utils
│  src/interfaces/, src/constants/,       │
│  src/utils/                             │
└─────────────────────────────────────────┘
```

#### UI layer — render only

`src/components/` and `src/app/` render. They consume state through context hooks and Zustand selectors. They do not call `wireData` directly. They do not define business logic.

```ts
// screen consumes context — never imports API functions directly
const { tour, handleUpdateTour } = useTourDetailContext();
```

#### State layer — lifecycle bridges

`src/providers/` owns server-state fetch/mutation lifecycle via `useFetchFn` / `useMutationFn`. `src/hooks/` owns ephemeral UI state via Zustand. Neither imports from `src/components/` or `src/app/`.

```ts
// src/providers/organization/tour/tour-detail-provider.tsx
// Owns: fetch, mutation, cache invalidation, error alerts.
// Does NOT own: navigation loading overlay (UI concern).
export function TourDetailProvider({ tourId, children }: { tourId: string; children: React.ReactNode }) {
  const { data: tour, ... } = useFetch(() => getTourById(tourId), { ... });
  const { executeMutationFn: updateTour, ... } = useMutationFn(...);
  // ...
}
```

#### API layer — HTTP adapters

`src/apis/` translates typed Core objects into HTTP calls and back. Functions take Core types in and return Core types out. They never import from providers, hooks, or components.

```ts
// src/apis/tour/tour-apis.ts
export async function getToursByOrganizationId(
  organizationId: string,
  filter?: TourFilterParam
): Promise<TourResponse[]> { ... }
```

#### Core layer

`src/interfaces/` and `src/constants/` contain only TypeScript types, enums, and string/number constants. No React, no Expo, no `fetchwire`.

`src/utils/` is split by concern. → [Coding Convention §2.4](../CODING-CONVENTION.md)

| Subdirectory                      | Concern                  | External deps                                           |
| --------------------------------- | ------------------------ | ------------------------------------------------------- |
| `calculator/`                     | Business calculations    | none                                                    |
| `generator/string-generator/`     | String formatting        | none                                                    |
| `generator/file-generator/html/`  | HTML template generation | none                                                    |
| `generator/file-generator/pdf/`   | PDF creation & sharing   | Expo (`expo-print`, `expo-sharing`, `expo-file-system`) |
| `generator/file-generator/excel/` | Excel export             | — (placeholder, `.gitkeep` only)                        |

---

### Boundaries within layers

#### Component boundary

| Concern                      | Where it lives                                                         |
| ---------------------------- | ---------------------------------------------------------------------- |
| Render structure             | Component JSX                                                          |
| Touch / interaction handling | Component event handlers                                               |
| Local toggle state           | `useState` inside component                                            |
| Data fetching                | Provider or parent container — never inside a card/list-item component |
| Business calculations        | `src/utils/calculator/`                                                |
| Navigation on user action    | Component calls `router.push`, sets `isNavigating`                     |

#### Provider boundary

| Concern                    | Where it lives                                   |
| -------------------------- | ------------------------------------------------ |
| Fetch data from API        | Provider — `useFetchFn`                          |
| Mutate data via API        | Provider — `useMutationFn` with typed handlers   |
| Invalidate cache           | Provider — `invalidatesTags` in mutation config  |
| Show error to user         | Provider — `Alert.alert` in `onError` callback   |
| Navigation loading overlay | **Screen / layout component** — NOT the provider |

---

## Why

When boundaries are mixed, every change has a wider blast radius. Editing a card's rendering logic risks breaking its fetch logic. Mixed boundaries also make testing harder: a component that fetches, calculates, and renders requires a full network setup to test a simple visual change.

Layers enforce a dependency direction that keeps each part of the system independently changeable. The API layer can change URLs without touching providers. Providers can change their cache strategy without touching screens. Screens can change layout without touching providers.

---

## How

### Layer import rules

Dependencies point **inward** only (UI → State → API → Core) — a component importing `wireData`, or an api
importing a provider, is a layering violation. → [Coding Convention §3.3](../CODING-CONVENTION.md)

---

## Exceptions

### Navigation-prefetch exception

Components may call `prefetch(apiFunction, { fetchKey })` inside navigation event handlers. This does not violate the layer rule because `prefetch` is fire-and-forget: the component neither owns the fetched state nor renders it; it only warms the fetchwire cache before the navigation target mounts. The calling component's render output is unaffected by the result, and navigation falls back gracefully if the prefetch fails.

```ts
// ✅ allowed — performance optimisation, not state ownership
const handleNavigate = async (id: string) => {
  setIsNavigating(true);
  try {
    await prefetch(() => getBookingById(id), {
      fetchKey: `organization-booking-${id}`,
    });
  } catch {
    // ignore — detail screen will fetch on mount as fallback
  }
  router.push(`/booking-detail/${id}`);
};
```

### Imperative-search exception

Modal content may call `useFetchFn` for user-triggered search (e.g. `searchUsers`) when the fetch is imperative (not on mount), driven by transient local input state, and the results are ephemeral. Lifting the fetch to the shell would require co-lifting the query state, turning the shell into a search orchestrator. See [COMPOSITE-PATTERN.md Rule 3 exception](docs/pattern/COMPOSITE-PATTERN.md) for the full rationale.

---

### Modal split status

Complex modals are split into shell + content. Simple modals (confirm, single-option select, thin filter wrappers) live in a single file by design — see [docs/pattern/COMPOSITE-PATTERN.md](docs/pattern/COMPOSITE-PATTERN.md) Rule 1 for the criterion.

# Provider Pattern

## What

The Provider pattern is a structural pattern where a component wraps part of the component tree and makes shared data available to any descendant without passing props at every level.

### In this codebase

A provider is a React Context component that owns **server-derived state** for a domain or entity. It fetches data through `useFetch` (Suspense-based by default) or `useFetchFn` (imperative/conditional), exposes data and mutation handlers via context, and wraps only the subtree that actually needs it. Consumers access it through a typed hook — no prop-drilling.

### Standard shape

```ts
// src/providers/tour-detail-provider.tsx
import { getTourById, updateTour as updateTourFn } from '@/apis/tour/tour-apis';

interface TourDetailContextType {
  tourId: string;
  tour: TourResponse;
  isRefreshingTour: boolean;
  isUpdatingTour: boolean;
  handleUpdateTour: (fields: UpdateTourRequest, onSuccess?: () => void) => void;
  refreshTour: () => void;
}

const TourDetailContext = createContext<TourDetailContextType | null>(null);

export function useTourDetailContext() {
  const ctx = useContext(TourDetailContext);
  if (!ctx) throw new Error('useTourDetailContext must be used within TourDetailProvider');
  return ctx;
}

export function TourDetailProvider({ tourId, children }: { tourId: string; children: React.ReactNode }) {
  const { data: tour, isRefreshing: isRefreshingTour, refreshFetch: refreshTour } =
    useFetch(() => getTourById(tourId), {
      fetchKey: `organization-tour-${tourId}`,
      tags:     [fetchTag.tour(tourId)],
    });

  // Tags come from the registry (@/constants/fetch-tag-constants) — never string
  // literals. `tourWriteRippleTags` carries not just the tour collection tag but every
  // tag whose fetch embeds a tour (e.g. the tour-implementation-assignment conflict
  // warning), so a rename/delete refreshes those too. See the Invalidate-Tag pattern.
  const { executeMutationFn: updateTour, isMutating: isUpdatingTour } =
    useMutationFn(
      (fields: UpdateTourRequest) => updateTourFn(tourId, fields),
      { invalidatesTags: [...tourWriteRippleTags, fetchTag.tour(tourId)] }
    );

  const handleUpdateTour = useCallback(
    (fields: UpdateTourRequest, onSuccess?: () => void) => {
      updateTour(fields, {
        onSuccess: () => onSuccess?.(),
        onError:   (error: ApiError) => Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.')),
      });
    },
    [updateTour]
  );

  if (!tour) return null;

  return (
    <TourDetailContext value={{ tourId, tour, isRefreshingTour, isUpdatingTour, handleUpdateTour, refreshTour }}>
      {children}
    </TourDetailContext>
  );
}
```

### Screen implementation

Mount `<ErrorBoundary>` and `<Suspense>` at the screen/layout level, wrapping the provider. This allows the screen's structure to load instantly and handle errors gracefully.

```tsx
// src/app/(protected)/tour-detail/[tourId]/index.tsx
export default function TourDetailScreen() {
  const { tourId } = useLocalSearchParams<{ tourId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <TourDetailProvider tourId={tourId}>
          <TourDetailContent />
        </TourDetailProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Provider tree

Each provider is mounted at the **closest layout/screen** that wraps every screen needing it. → [Coding Convention §2.2](../CODING-CONVENTION.md), [§1.2](../CODING-CONVENTION.md)

Layout-level providers (mounted in `_layout.tsx`, shared across all child routes):

```
src/app/_layout.tsx
  └── AuthProvider

src/app/(protected)/_layout.tsx
  └── AllOrganizationsProvider           ← Suspense boundary here (IndexShellSkeleton)
       └── OrganizationProvider
            └── OwnerModeProvider

src/app/(protected)/organization/[organizationId]/_layout.tsx
  └── InvoiceTypeProvider

src/app/(protected)/tour-detail/[tourId]/_layout.tsx
  └── TourDetailProvider                 ← Suspense boundary here (EntityDetailSkeleton)
```

Screen-level providers (mounted in individual screen files):

```
src/app/(protected)/booking-detail/[bookingId]/index.tsx
  └── BookingDetailProvider

src/app/(protected)/car-detail/[carId].tsx
  └── OrganizationCarDetailProvider
       └── FuelPriceProvider             ← nullable singleton (see Rule 5 exception)

src/app/(protected)/invoice-detail/[invoiceId].tsx
  └── InvoiceDetailProvider

src/app/(protected)/project-detail/[projectId].tsx
  └── PersonalProjectDetailProvider | OrganizationProjectDetailProvider (conditional on mode)

src/app/(protected)/wage-detail/[wageId].tsx
  └── PersonalWageDetailProvider

src/app/(protected)/receipt-payment-detail/[receiptPaymentId].tsx
  └── ReceiptPaymentFormProvider

src/app/(protected)/tour-calculation-cancel-log-detail/[tourCalculationCancelLogId].tsx
  └── TourCalculationCancelLogDetailProvider

src/app/(protected)/tour-settlement-cancel-log-detail/[tourSettlementCancelLogId].tsx
  └── TourSettlementCancelLogDetailProvider
```

Tab-screen providers (mounted inside personal and organization tab screens): `PersonalHomeSummaryProvider`, `OrganizationHomeSummaryProvider`, `PersonalActionsProvider`, `OrganizationActionsProvider`, calendar providers, and per-domain list providers — each mounted at the closest screen that needs them.

### Variants

| Variant | Fetch  | Mutation | Target Pattern                                                                                                                                                                                                                             | Examples                                                                      |
| ------- | :----: | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| List    |   ✅   |    ❌    | Default to `useFetch` (Suspense)                                                                                                                                                                                                           | `OrganizationBookingListProvider`, `InvoiceTypeProvider`                      |
| Detail  |   ✅   |    ✅    | Default to `useFetch` (Suspense)                                                                                                                                                                                                           | `TourDetailProvider`, `BookingDetailProvider`, `InvoiceDetailProvider`        |
| Auth    | Custom |  Custom  | All credential lifecycle operations (`performLogin`, `performRegister`, `performLogout`, `performSync`) live in `AuthProvider`. Public screens (`login`, `register`) consume via `useAuthContext()` — never call `useMutationFn` directly. | `AuthProvider`                                                                |
| UI-only |   ❌   |    ❌    | Local Context state toggle or action handler callbacks with no fetch/mutation lifecycle                                                                                                                                                    | `OwnerModeProvider`, `PersonalActionsProvider`, `OrganizationActionsProvider` |

---

## Why

Without providers, every screen has to fetch the same data, handle its own loading/error states, and pass results down through props. The result is duplicated fetch logic and screens tightly coupled to the API layer.

Suspense-based providers (`useFetch`) guarantee that the UI component receives non-null data once it renders. The UI component no longer needs to poll, check `if (isLoading)`, or check if data is null, leading to cleaner component bodies and a declarative skeleton pattern.

---

## How

### Rule 1 — Context default is always `null`

Never use a stub default. `null` guarantees that bad wiring throws immediately instead of silently returning empty data.

### Rule 2 — Always export a guarded hook

Consumers call `useTourDetailContext()`, never `useContext(TourDetailContext)`. The hook is the public API; the Context object is an implementation detail.

### Rule 3 — Providers own mutations; screens call handlers

The provider exposes `handleUpdateTour(fields, onSuccess?)`. The screen calls it. The screen never imports `updateTour` from `src/apis/` directly.

### Rule 4 — Every `useMutationFn` call must have `onError`

```ts
// ✅
updateTour(fields, {
  onSuccess: () => onSuccess?.(),
  onError: (error: ApiError) =>
    Alert.alert("Lỗi", generateErrorMessage(error, "Có lỗi xảy ra.")),
});

// ❌ — silent failure or default error msg
updateTour(fields, { onSuccess: () => onSuccess?.() });
```

### Rule 5 — Non-null guarantees for entity data

Since the provider uses `useFetch` (Suspense), by the time any children render, the data is guaranteed to be successfully loaded. Therefore, entity objects in context MUST be typed as non-null (e.g. `tour: TourResponse`), and the component does not need to handle empty/loading states.

**Exception — nullable singleton resources.** When the API legitimately returns `null` as a *loaded* value (e.g. `GET /fuel-price/` before the first sync), `null` is a valid state, not a loading state. Type the context field as nullable (`fuelPrice: FuelPriceResponse | null`) and do **not** add the `if (!data) return null` guard — blanking the subtree would hide unrelated UI. Consumers must handle the null state explicitly. Example: `FuelPriceProvider`.

### Rule 6 — Providers do not call `setIsNavigating`

The navigation overlay is a UI concern. Providers only expose `isMutating` from `useMutationFn`. The layout or screen reads that state and toggles the global navigation loading indicator.

### Rule 7 — Co-locate at the closest route

Do not hoist a detail provider to root for convenience. Mount it at the layout/screen where the entity ID first appears as a route param.

### Rule 8 — Default to `useFetch` + Suspense

- **When to use**: The ID/params are available when mounting (route param, context param), and fetching is required to render the subtree.
- **When to fallback to `useFetchFn`**: Conditional fetching (only fetch upon user action), non-essential data that shouldn't block rendering.
---

## Adding a new detail provider

1. Declare `XxxDetailContextType` with the entity data typed as non-null (`xxx: XxxResponse`), alongside `isRefreshing`, `isMutating`, mutation handlers, and `refreshXxx`.
2. `const XxxDetailContext = createContext<XxxDetailContextType | null>(null);`
3. Export `useXxxDetailContext()` with the standard throw guard.
4. Inside the provider: `useFetch(() => getXxxById(id), { fetchKey, tags })` + `useMutationFn((data) => updateXxxFn(id, data), { invalidatesTags })`; every mutation handler must include `onError` calling `generateErrorMessage`. When the local mutation executor shares a name with the imported API function, alias the import (`import { updateXxx as updateXxxFn }`) to avoid a circular reference. **All `tags`/`invalidatesTags` values come from `fetchTag.*` / `*WriteRippleTags` in [`@/constants/fetch-tag-constants`](../../src/constants/fetch-tag-constants.ts) — never string literals (see [Tag-Based Cache Invalidation Pattern](INVALIDATE-TAG-PATTERN.md)).**
5. Check `if (!xxx) return null;` before returning context provider.
6. Mount it at the screen or route layout level where the `xxxId` param first appears, wrapping the screen content in `<ErrorBoundary>` and `<Suspense fallback={<Skeleton />}>`.

---

## Fetch tags

Providers declare `tags` on every read (`useFetch`/`useFetchFn`/`prefetch`) and `invalidatesTags` on every write (`useMutationFn`). **All of these values come from `fetchTag.*` and the `*WriteRippleTags` arrays in [`@/constants/fetch-tag-constants`](../../src/constants/fetch-tag-constants.ts) — never a string literal at a call-site**, since an untyped tag drifts silently.

The tag model itself — the three shapes (Collection / Record / Child-list), the scope-prefix rule, and the ripple rule (*tags mirror the data-dependency graph*: a write to X invalidates every fetch whose response embeds or derives from X) — is documented on its own: **[Tag-Based Cache Invalidation Pattern](INVALIDATE-TAG-PATTERN.md)**.

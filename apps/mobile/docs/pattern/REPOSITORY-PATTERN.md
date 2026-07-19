# Repository Pattern

## What

The Repository pattern abstracts all data access for a domain behind named functions. Callers request data by name and know nothing about the underlying transport. If the transport changes, only the repository changes — callers are untouched.

### In this codebase

A repository wraps all network access for a single domain into named functions. Every `wireApi` call lives inside `src/apis/`. Providers, hooks, and screens import the named functions — they never call `wireApi` themselves.

### `src/apis/` tree

One folder per business domain — simple domains use `[domain]/[domain]-apis.ts`, complex domains split by
sub-resource as `[domain]/[domain]-[resource]-apis.ts`. → [Coding Convention §2.1](../CODING-CONVENTION.md), [§1.1](../CODING-CONVENTION.md)

### Function shape

Every function is typed on both ends. Request types come from `src/interfaces/`; response types are the generic of `wireApi<T>`.

```ts
// src/apis/tour/tour-apis.ts
export async function createTour(data: CreateTourRequest) {
  return wireApi<TourResponse>('/tour', { method: 'POST', body: JSON.stringify(data) });
}

export async function getToursByOrganizationId(organizationId: string, filter?: TourFilterParam) {
  const qs = generateFilterQueryString(filter, { status: filter?.status });
  return wireApi<TourResponse[]>(`/tour/organization/${organizationId}${qs}`, { method: 'GET' });
}

export async function updateTour(id: string, data: UpdateTourRequest) {
  return wireApi<TourResponse>(`/tour/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteTour(id: string) {
  return wireApi<void>(`/tour/${id}`, { method: 'DELETE' });
}
```

---

## Why

Isolating network access in one layer means that when the backend changes a URL, renames a field, or alters a shape, **only one `*.ts` file changes** — providers, hooks, and screens stay untouched.

---

## How

### Rule 1 — Never call `wireApi` outside `src/apis/`

```ts
// ✅
import { updateTour } from '@/apis/tour/tour-apis';
useMutationFn((fields) => updateTour(tourId, fields), { ... });

// ❌
import { wireApi } from 'fetchwire';
useMutationFn((fields) => wireApi(`/tour/${tourId}`, { method: 'PUT', ... }), { ... });
```

### Rule 2 — Name functions by verb

Functions are named by the action they perform (`create`/`get`/`update`/`delete`/`search`, or a domain
verb for non-CRUD actions like `signSignature`). → [Coding Convention §5](../CODING-CONVENTION.md)

### Rule 3 — Return type for empty responses

- DELETE → `wireApi<void>`.
- POST actions that return no body (e.g. `uploadImage`, `importReceiptPaymentFromTourCalculationToTourImplementation`) → `wireApi<null>` is the current convention; prefer `<void>` for new code when the backend truly returns 204/empty.

### Rule 4 — List endpoints with filters always use `generateFilterQueryString`

Never hand-roll `new URLSearchParams()` inside an API file.

```ts
// ✅
const qs = generateFilterQueryString(filter, { status: filter?.status });
return wireApi<TourResponse[]>(`/tour/organization/${orgId}${qs}`, { method: 'GET' });
```

### Rule 5 — One folder per domain; no cross-domain leakage

Booking functions live in `booking/booking-apis.ts`. Do not add a booking function to `invoice/invoice-apis.ts` just because it is "related".

Complex domains split by sub-resource inside the same folder (`organization/organization-customer-apis.ts`, `tour/tour-calculation-apis.ts`).

### Rule 6 — `ResponseWithMeta<T, M>` when metadata is returned

Endpoints that return data plus metadata (e.g. tour-calculation, tour-implementation, tour-settlement, booking) use the `ResponseWithMeta<DataType, MetaType>` generic from fetchwire.

```ts
return wireApi<ResponseWithMeta<TourCalculationResponse, TourCalculationMeta>>(
  `/tour-calculation/by-tour/${tourId}`,
  { method: 'GET' }
);
```

---

## Adding a new domain

```ts
// src/apis/xxx/xxx-apis.ts
import { wireApi } from 'fetchwire';
import { CreateXxxRequest, UpdateXxxRequest, XxxResponse } from '@/interfaces/xxx-interfaces';
import { XxxFilterParam } from '@/interfaces/_query-param-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createXxx(data: CreateXxxRequest) {
  return wireApi<XxxResponse>('/xxx', { method: 'POST', body: JSON.stringify(data) });
}

export async function getXxxs(filter?: XxxFilterParam) {
  const qs = generateFilterQueryString(filter, { status: filter?.status });
  return wireApi<XxxResponse[]>(`/xxx${qs}`, { method: 'GET' });
}

export async function getXxxById(id: string) {
  return wireApi<XxxResponse>(`/xxx/${id}`, { method: 'GET' });
}

export async function updateXxx(id: string, data: UpdateXxxRequest) {
  return wireApi<XxxResponse>(`/xxx/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteXxx(id: string) {
  return wireApi<void>(`/xxx/${id}`, { method: 'DELETE' });
}
```

If the domain has sub-resources, add `xxx/xxx-resource-apis.ts` rather than dumping everything into one file.

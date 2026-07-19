# KISS — Keep It Simple, Stupid

## What

Keep It Simple, Stupid is a software design principle argues that systems work best when they are kept simple. Complexity is a cost that must be justified by the problem it solves. Every unnecessary abstraction, every premature generalisation, adds surface area that must be read, understood, and maintained. When a simpler approach solves the problem correctly, the simpler approach is the right choice.

### In this codebase

In practice:
- Simple forms use `useState`, not a dedicated Zustand store.
- Fetch-and-display components use `useFetchFn`, not manual `useEffect` + `useState` + `fetch`.
- Providers expose only what consumers actually need.

### Fetch lifecycle in two lines

`useFetchFn` handles loading state, error state, caching, and tag-based invalidation. The manual equivalent (`useEffect` + `useState` + `fetch`) would take ~20 lines for the same result.

```ts
const { data: tours, isLoading, refreshFetchFn: refresh } =
  useFetchFn(() => getToursByOrganizationId(orgId), {
    fetchKey: `org-tours-${orgId}`,
    tags: [fetchTag.tourList], // from @/constants/fetch-tag-constants — never a string literal
  });
```

### Error extraction

One utility call replaces fragile inline checks.

```ts
// ✅
Alert.alert('Lỗi', generateErrorMessage(error));

// ❌ — inline check repeated across files
Alert.alert('Lỗi', error instanceof Error ? error.message : 'Có lỗi xảy ra');
```

`generateErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra'): string` lives at [src/utils/generator/string-generator/generate-error-message.ts](src/utils/generator/string-generator/generate-error-message.ts). It checks for `string`, then `.message`, then falls back. Use it for every API error.

### File-based routing

No `Stack.Navigator` + `Screen` registration per route. Adding a screen means adding one file at the correct path under `src/app/`. Expo Router derives the route from the path.

### Simple forms stay simple

`login.tsx` (3 fields) and `register.tsx` (4 fields) use plain `useState`. The complexity does not justify a Zustand store or a form library.

```ts
const [email, setEmail]       = useState('');
const [password, setPassword] = useState('');
```

---

## Why

Every line that is not required to solve the problem is a line that must be read, understood, tested, and maintained. Complexity compounds: a component that fetches, calculates, and renders is harder to test than one that only renders. Simple code fails in simple, obvious ways; complex code fails in subtle, unexpected ways.

---

## How

1. **Choose the simplest state mechanism that works**. → [Coding Convention §10](../CODING-CONVENTION.md)
   - Pure display → no state, just props
   - Toggle / transient UI → `useState`
   - Complex form (≥ 4 fields with validation) → Zustand store
   - Server data shared across screens → React Context + `useFetch` (Suspense by default; use `useFetchFn` for conditional or user-triggered fetching — see PROVIDER-PATTERN.md Rule 8)

2. **Do not add abstractions before they are needed** — extract when the complexity exists, not when it might.

3. **Components receive data as props; they do not fetch it** — except for container components explicitly designed to fetch.

4. **Avoid reading the same value twice** — pass it as a prop instead of calling the same hook in parent and child.

5. **Use project utilities** (`generateErrorMessage`, `generateFilterQueryString`, `generateDateRange`) instead of re-implementing inline.

6. **Avoid nested ternary chains longer than 2 levels.** Extract into a named helper.

   ```ts
   // ❌
   const total = summary.totalVAT > 0 ? 0 : entityVatRate ? totalAfterDiscount * (entityVatRate / 100) : 0;

   // ✅
   const total = calculateFinalVat(summary, entityVatRate, totalAfterDiscount);
   ```

---

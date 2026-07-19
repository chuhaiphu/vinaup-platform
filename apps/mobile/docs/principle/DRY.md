# DRY — Don't Repeat Yourself

## What

Don't Repeat Yourself is a software design principle states that every piece of knowledge should have a single representation in the system. Duplication forces us to maintain multiple copies of the same decision — when the requirement changes, every copy must be found and updated consistently.

### In this codebase

Four mechanisms enforce DRY across the codebase:

### Named constants for shared values

Format strings, magic numbers, and colour codes are defined once in `src/constants/` and imported everywhere they are needed.

```ts
// src/constants/app-constant.ts
export const DD_MM_DATE_FORMAT_SHORT = 'DD/MM';
export const HH_MM_DATE_FORMAT_SHORT = 'HH:mm';

// every consumer imports the same constant
d.format(DD_MM_DATE_FORMAT_SHORT);
displayFormat = { DD_MM_DATE_FORMAT_SHORT };
```

### Shared utility functions

Logic that recurs at two or more call sites is extracted into `src/utils/`. A fix or spec change in the utility propagates to every caller.

```ts
// src/utils/generator/string-generator/generate-date-range.ts
export function generateDateRange(
  start: string,
  end: string,
  format = DD_MM_DATE_FORMAT_SHORT,
): string {
  // single definition — reused across cards, detail screens, etc.
}

// src/utils/generator/string-generator/generate-filter-query-string.ts
export function generateFilterQueryString(
  filter?: DateFilterParam,
  extra?: Record<string, string | undefined>,
): string {
  // single definition — called from every list API function
}
```

### Shared primitives layer

`Button`, `Input`, `Select`, `Modal`, `Loader`, `PressableOpacity` are defined once in `src/components/primitives/` and reused across every domain. Touch handling, loading state, and styling live in one place.

`ConfirmSlideSheet` (`src/components/commons/modals/confirm-modal/`) centralises the cancel/confirm chrome — title header + footer + bottom-sheet host — for every confirm modal. The styles are defined once instead of being copy-pasted into each `*-modal-content`.

### Interface-driven API typing

Request and response types are defined once in `src/interfaces/*-interfaces.ts` and shared between API functions, providers, and components — never redefined inline.

### Parameterised templates

When two modules share the same structure but differ in a few values, a single template function takes those values as parameters.

```ts
// src/utils/generator/file-generator/html/generate-tour-cancel-log-html.ts — one definition
export function generateTourCancelLogHtml(input: TourCancelLogPdfHtmlInput, avatarBase64?: string): string { ... }

// two callers supply only what differs
generateTourCancelLogHtml({ ..., mainTitle: 'Tính giá',   summaryHeaderLabel: 'Dự kiến' }, b64)  // calculation
generateTourCancelLogHtml({ ..., mainTitle: 'Quyết toán', summaryHeaderLabel: 'Thực tế' }, b64)  // settlement
```

---

## Why

When logic exists in one place, fixing a bug or updating behaviour touches exactly one file — and TypeScript propagates the change to every caller. When the same decision is duplicated, a change requires finding every copy, and certainty about completeness shrinks with every additional copy.

---

## How

1. **Extract when the same decision appears in 2+ places** — identical logic, not just similar code.
2. **Utility functions belong in `src/utils/`** — not inline inside components or providers.
3. **Constants belong in `src/constants/`** — format strings, magic numbers, colour codes.
4. **Shared components belong in `src/components/commons/` or `src/components/primitives/`** — not copy-pasted across domain folders.
5. **Do not DRY prematurely** — wait until the same thing appears in at least 2 places before extracting.
6. **Exact folder/naming rules** for constants, utils, and components. → [Coding Convention §2](../CODING-CONVENTION.md)

---

# Composite Pattern

## What

The Composite pattern organises objects into tree structures to represent part-whole hierarchies. Each node is either a **leaf** (a single, indivisible element) or a **composite** (a container that holds other nodes). Both leaves and composites share the same interface, so callers can treat them uniformly.

### In this codebase

The composite pattern builds complex UI by assembling small pieces, each doing exactly one thing. Two levels apply in this codebase:

- **Level 1**: primitive extension (wrap a base component, add one concern).
- **Level 2**: modal split into `shell` (container) + `content` (UI/logic) when it grows complex enough.

### Level 1 — Primitive extension

Wrap a React Native component and add **exactly one** project-specific behaviour. All original props pass through via spread.

```ts
// src/components/primitives/button.tsx
// Concern added: loading state (shows ActivityIndicator, disables touch)
interface ButtonProps extends PressableProps {
  isLoading?: boolean;
  loaderStyle?: { color?: string; size?: 'small' | 'large' | number };
}

export function Button({ isLoading, children, disabled, loaderStyle, ...props }: ButtonProps) {
  return (
    <PressableOpacity {...props} disabled={isLoading || disabled}>
      {isLoading
        ? <ActivityIndicator size={loaderStyle?.size || 'small'} color={loaderStyle?.color || COLORS.vinaupTeal} />
        : children}
    </PressableOpacity>
  );
}
```

Hierarchy: `Pressable` → `PressableOpacity` (opacity feedback) → `Button` (loading state). Each step adds exactly one concern.

### Level 2 — Modal shell + content

Every "cancel / confirm" modal is built on the shared **`ConfirmSlideSheet`** primitive
(`src/components/commons/modals/confirm-modal/confirm-modal.tsx`), which owns the host (bottom sheet),
the left-aligned **title** header, and the footer with action buttons.

| File                  | Concern                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `*-modal.tsx`         | Shell: renders `ConfirmSlideSheet` (title, `isLoading`, footer), holds the body ref, builds `closeModal`, wires the footer to the body's `submit()` |
| `*-modal-content.tsx` | Body only: form/list + local state. No header, no footer. Exposes `submit()` and emits `onSubmit`                                                   |

The four callbacks involved follow a strict naming convention — one name per role.
See [**Rule 2 — Callback naming convention**](#rule-2--callback-naming-convention) below.

```ts
// shell — ConfirmSlideSheet chrome + wires the footer to the body's submit()
export function SignerSelectModal({ modalRef, onConfirm, organizationMembers, receiverSignatures, isLoading }) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef>(null);
  const closeModal = () => modalRef.current?.close();
  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chọn người ký tên"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <SignerSelectModalContent
        ref={modalContentRef}
        organizationMembers={organizationMembers}
        receiverSignatures={receiverSignatures}
        isLoading={isLoading}
        onSubmit={(ids) => onConfirm?.(ids, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}

// content — owns selection state + list JSX; validates in submit(), emits via onSubmit
export function SignerSelectModalContent({ organizationMembers, receiverSignatures, isLoading, onSubmit, ref }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleConfirm = () => onSubmit?.(selectedIds);
  useImperativeHandle(ref, () => ({ submit: handleConfirm }));
  // list JSX only — no Huỷ/Xác nhận buttons (ConfirmSlideSheet renders the footer)
}
```

### Folder convention

A split modal lives in a `{name}-modal/` folder holding `{name}-modal.tsx` (shell) +
`{name}-modal-content.tsx` (content), optionally `{name}-real-list.tsx`. → [Coding Convention §2.3](../CODING-CONVENTION.md), [§1.1](../CODING-CONVENTION.md)

### Which container?

- **`ConfirmSlideSheet`** — every modal with a Huỷ / Xác nhận footer: forms, selects, info edits, and plain confirmations. It is bottom-sheet based and supplies the title header + footer. E.g. `signer-select-modal`, `*-info-modal`, `advance-input-modal`, and the sign/cancel confirmations.
- **`SlideSheet` directly** — only for _select-on-tap_ lists or _display-only_ sheets that have **no** confirm footer (e.g. `utility-select-modal`, `receipt-payment-category-select-modal`, cancel-log viewers).

---

## Why

1. A single-file modal that owns the container, the ref, the fetch, the form state, the list rendering, and the callbacks grows fast and becomes hard to read. Splitting shell/content keeps each file small, independently understandable, and lets the content be tested without mocking the container ref.

2. See [Rule 5](#rule-5--resettable-body-state-must-live-in-content-not-the-shell).

Same reasoning at the primitive level: a `Pressable` that also handles loading state and opacity feedback mixes too many concerns.

---

## How

### Rule 1 — When to split shell + content?

Split when the modal has **at least one** of:

- Local state (selection, form fields, drafts)
- Multi-input form
- Multiple sections / tabs / lists inside

**A single-file modal is fine** when:

- It only wraps one existing component (e.g. `utility-select-modal/utility-select-modal.tsx` wraps `MultiSelect`).
- It is a plain confirmation with no form body — render `ConfirmSlideSheet` directly with a short message child (e.g. the sign / cancel-sign confirmations).
- It is a thin wrapper to an already-split modal (e.g. `booking-org-customer-select-modal` just forwards filters into `organization-customer-select-modal`).

### Rule 2 — Callback naming convention

One name per role — **never reuse the same name across layers** (this is what kept three different
`onConfirm` props colliding in one file before): `onConfirmPress` (footer) → `submit()` (content ref) →
`onSubmit` (content emit) → `onConfirm` (shell public API). → [Coding Convention §8](../CODING-CONVENTION.md)

### Rule 3 — Content exposes `submit()`; the shell owns close

The content never touches `modalRef`. The Huỷ / Xác nhận footer lives in
`ConfirmSlideSheet` (rendered by the shell), so the body exposes its submit through a
ref instead of rendering its own buttons:

- Content implements `ConfirmSlideSheetContentRef` → `submit()` validates, then calls `onSubmit(value)`.
- Shell wires `onConfirmPress={() => modalContentRef.current?.submit()}` and passes `closeModal` into its public `onConfirm`.
- Cancel / backdrop close is handled by `ConfirmSlideSheet` itself — the content has no `onClose`.

```ts
// ✅ content exposes submit + emits onSubmit; shell wires the footer
useImperativeHandle(ref, () => ({ submit: handleConfirm }));
<MyContent ref={modalContentRef} onSubmit={(v) => onConfirm?.(v, closeModal)} />

// ❌ content reaching into the ref, or rendering its own footer buttons
<MyContent modalRef={modalRef} ... />
```

**Exception — User-triggered imperative call.** Content _may_ call `useFetchFn` for calls that are:

1. Triggered by an explicit user action (pressing a search button), not on mount.
2. Driven by transient local input state (a query string the user typed).
3. Ephemeral — the results are discarded when the modal closes and never stored in a provider.

```ts
// ✅ — imperative search: query is local state, triggered by user action
const { data: results, executeFetchFn: search } = useFetchFn(
  () => searchUsers({ name: query, phone: query }),
  { fetchKey: `user-search-${id}`, tags: [] },
);
```

### Rule 4 — Primitive wrappers always spread base props

```ts
// ✅
export function Button({ isLoading, children, ...props }: ButtonProps) {
  return <PressableOpacity {...props} disabled={isLoading || props.disabled}>...</PressableOpacity>;
}

// ❌ — silently drops accessibility, testID, style
export function Button({ isLoading, onPress, style }: ButtonProps) {
  return <PressableOpacity onPress={onPress} style={style}>...</PressableOpacity>;
}
```

### Rule 5 — Resettable body state must live in content, not the shell

`SlideSheet` stays mounted the whole time, so the imperative `modalRef.open()` always finds a live ref.
But it **unmounts its `children`** once the close animation finishes and remounts them on the next open. That's why a `*-modal-content` body is mounted **fresh on every open**.

Consequence: any state that must reflect the latest props each time the modal opens — drafts, a
search query, a pending selection seeded from `value` via `useState(value)` — **must live in the
content** (a children of the SlideSheet).

```ts
// ❌ pending lives in the always-mounted shell → initialises once, never re-syncs → stale on reopen
function CarPropertySelectModal({ modalRef, value, onConfirm }) {
  const [pending, setPending] = useState(value);
  return <ConfirmSlideSheet ref={modalRef}>{/* search + list use `pending` */}</ConfirmSlideSheet>;
}

// ✅ shell — always mounted, owns the ref + footer wiring; holds NO resettable state
function CarPropertySelectModal({ modalRef, value, onConfirm }) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef>(null);
  return (
    <ConfirmSlideSheet ref={modalRef} onConfirmPress={() => modalContentRef.current?.submit()}>
      <CarPropertySelectModalContent ref={modalContentRef} value={value} onSubmit={onConfirm} />
    </ConfirmSlideSheet>
  );
}

// ✅ content — child of the sheet, so it remounts on each open and `pending` re-seeds from `value`
function CarPropertySelectModalContent({ value, onSubmit, ref }) {
  const [pending, setPending] = useState(value); // initialiser re-runs on every reopen
  useImperativeHandle(ref, () => ({ submit: () => onSubmit(pending) }));
  // search box + option list drive `pending`; no footer (ConfirmSlideSheet renders it)
}
```

### Rule 6 — Custom header: `renderHeader` (static) vs header-in-content (stateful)

`ConfirmSlideSheet` renders a left-aligned title from `title` by default. But when the header row
needs more than text — e.g. an action icon beside the title — **where** the header lives depends
on **what it reacts to**. The deciding question: does the header depend on state when component unmount / remount?

`SlideSheet` keeps the **shell** mounted for the whole lifecycle
but **unmounts/remounts the content (children) on every open**. So the header rendered by the shell
sits in the always-mounted region, while content state auto-resets per open ([Rule 5](#rule-5--resettable-body-state-must-live-in-content-not-the-shell)).

| Header depends on…                                | Where to render the header                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| props / shell state only (static)                 | **Shell** via `renderHeader?: () => ReactNode`                           |
| reset-on-open **content** state (e.g. active tab) | **Content** — render the header row at the top of the body; omit `title` |

**Case 1 — static header → `renderHeader`.** Pass `renderHeader`; it replaces the entire title
row, so the caller owns the title text + styling (match the default: `fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.medium`).
`title` is ignored when `renderHeader` is set.

**Case 2 — stateful header → render it in the content.** Do **not** use shell-level `renderHeader`
here: it would force the header-driving state into the always-mounted shell, which then goes stale
on reopen. Instead keep the
state in the content and render the header there; tell `ConfirmSlideSheet` to render no header by
**omitting `title`**:

```tsx
// shell — no title: the content owns the header row (Composite Rule 6, Case 2)
<ConfirmSlideSheet ref={modalRef} confirmText="Chọn" scrollable={false}
  onConfirmPress={() => modalContentRef.current?.submit()}>
  <Content ref={modalContentRef} … />
</ConfirmSlideSheet>

// content — tab state stays here (auto-resets per open); header co-located with it
const [currentTab, setCurrentTab] = useState<TabValue>('internal');
return (
  <View>
    <View style={styles.headerRow}>
      <Text style={styles.headerTitle}>Khách hàng</Text>
      {currentTab === 'internal' && <Button onPress={() => createModalRef.current?.open()}>…</Button>}
    </View>
    {/* tabs / search / list … */}
  </View>
);
```

**Caveat — scrollable bodies.** Case 2 only works when the body does not scroll (`scrollable={false}`),
so the header stays pinned. If the body scrolls, a content-rendered header would scroll away — keep
the header in the shell and make it depend on **props only** (Case 1) to avoid the conflict entirely.

---

## Adding a new modal

If Rule 1 says split:

```
components/{scope}/modals/
└── my-feature-modal/
    ├── my-feature-modal.tsx          ← ConfirmSlideSheet + ref + onConfirmPress
    └── my-feature-modal-content.tsx  ← form + local state (no footer)
```

```ts
export function MyFeatureModal({ modalRef, onConfirm, data }: MyFeatureModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef>(null);
  const closeModal = () => modalRef.current?.close();
  return (
    <ConfirmSlideSheet ref={modalRef} title="..." onConfirmPress={() => modalContentRef.current?.submit()}>
      <MyFeatureModalContent
        ref={modalContentRef}
        data={data}
        onSubmit={(value) => onConfirm?.(value, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
```

If the modal is simple (one of the 3 cases in Rule 1), a single file `my-feature-modal.tsx` inside the same-named folder is enough.

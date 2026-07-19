# Keyboard & Modal Pattern

The whole bottom-sheet modal stack: how `SlideSheet` positions itself, animates, and avoids the keyboard,
and how `ConfirmSlideSheet` owns the body scroll.

## What

The stack has **two layers with two orthogonal concerns**:

| Layer               | File                                             | Owns                                                               |
| ------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| `SlideSheet`        | `primitives/slide-sheet.tsx`                     | **The box** — open/close animation, height cap, keyboard avoidance |
| `ConfirmSlideSheet` | `commons/modals/confirm-modal/confirm-modal.tsx` | **The body** — title + scrollable content + footer                 |

"How tall / where relative to the keyboard" is the sheet's job. "Does the body scroll" is the modal's job.

The **box** itself is driven by two independent engines:

| Engine          | Job                                        | Vocabulary                                              |
| --------------- | ------------------------------------------ | ------------------------------------------------------- |
| **Flex layout** | _where_ the box sits and _how tall_ it is  | `justifyContent: flex-end`, `maxHeight`, `marginBottom` |
| **Reanimated**  | _change a value over time_ (the animation) | shared value, `useAnimatedStyle`, `withTiming`          |

The position is the result of layout; Reanimated only feeds it numbers that change frame by frame.

### In this codebase

`SlideSheet` wraps RN's `<Modal>`; the body lives in a `*-modal-content.tsx` that holds **only fields** — no
scroll and no layout of its own. How the box dodges the keyboard is Part 4; how the body scrolls is Part 5.

---

## Part 1 — Anchoring model

Screen Y axis: **`y = 0` at the top, `y = screenHeight` (SH) at the bottom.**

The sheet lives in an overlay with `justifyContent: 'flex-end'` → children are pushed to the bottom. Only one
edge is controlled; the other follows.

Let **H** = the sheet's content height.

```
y=0   ┌───────────────┐ ← top of screen
      │   (empty)     │
      ╞═══════════════╡ ← TOP  = SH − H   (derived)
      │  title        │
      │  body         │
      │  footer       │
y=SH  └───────────────┘ ← BOTTOM = SH     (anchored by flex-end)
```

Two shared values steer the bottom edge (`animDistance = sheetHeight || screenHeight`):

| Shared value     | Meaning             | Values                                           |
| ---------------- | ------------------- | ------------------------------------------------ |
| `translateY`     | open/close slide    | `animDistance` = closed (off-screen), `0` = open |
| `keyboardHeight` | keyboard height `K` | `0` hidden, `K` shown                            |

**The master equation:**

```
bottom = screenHeight + translateY − marginBottom
          (anchor)     (open/close)   (keyboard)
top    = bottom − min(H, maxHeight)
```

---

## Part 2 — Reanimated

Four parts, kept strictly separate — a pipeline from a number to pixels:

```
withTiming ──▶ shared value ──▶ useAnimatedStyle ──▶ Animated.View
(drive value    (current         (value → style        (style → pixels
 over time)      value)             object)               on screen)
```

| Part                   | Is                               | Input → Output                                    |
| ---------------------- | -------------------------------- | ------------------------------------------------- |
| **Shared value**       | a number living on the UI thread | — (holds the current value)                       |
| **`withTiming`**       | the time engine                  | a target `value` → a stream of `value`s over time |
| **`useAnimatedStyle`** | a pure mapping worklet           | shared values → a **style object**                |
| **`Animated.View`**    | the renderer                     | a style object → the actual native view on screen |

Two mix-ups to avoid: `useAnimatedStyle` does **not** render — it only computes a style object;
`Animated.View` is what renders. And `withTiming` does **not** touch style — it only drives a _number_ over
time.

### `useAnimatedStyle`

Reanimated auto-detects that the worklet reads `translateY.value` and `keyboardHeight.value`, builds a
dependency graph, and re-runs the worklet **whenever either changes** — applying the new style on the UI
thread without a React re-render.

```
   translateY ───┐
                 ├──► [ useAnimatedStyle worklet ] ──► new style ──► Animated.View
   keyboardHeight┘     (auto re-runs when either changes)
```

We never call `animatedStyle` ourself — Reanimated calls it on every dependency change.

### `withTiming`

```ts
translateY.value = animDistance; // direct → 1 step       → instant jump
translateY.value = withTiming(0, { duration: 350 }); // timing → ~60 steps/s  → smooth
```

`withTiming` makes Reanimated update `.value` on every frame. Each tiny change re-runs `useAnimatedStyle` →
style changes → the eye sees a smooth slide. `useAnimatedStyle` just faithfully mirrors whatever the value is
at that instant.

---

## Part 3 — Open & close

### Open — `handleOpen`

```ts
setModalVisible(true);                     // (a) mount <Modal>
setShouldMountChildren(true);              // (b) mount children
translateY.value = animDistance;           // (c) snap to hidden (below the screen)
translateY.value = withTiming(0, 350ms);   // (d) slide animDistance → 0 (UP)
```

```
t=0ms (translateY=animDistance)        t=350ms (translateY=0)
y=0  ┌───────────┐                     ┌───────────┐
     │  (empty)  │                     ╞═══════════╡ ← TOP = SH − H
     │           │           ⇒         │  title    │
y=SH ╞═══════════╡ ← anchor            │  body     │
░░░░ │ sheet     │ (below the          │  footer   │
     │ hidden    │  bottom edge)       ╞═══════════╡ ← BOTTOM = SH (anchor)
     └───────────┘                     └───────────┘
```

Bottom travels `SH + animDistance` → `SH`; the top follows up. The user sees the sheet rise from the bottom
over 350 ms. `onOpen` fires only when the animation `finished`.

### Close — `handleClose`

```ts
translateY.value = withTiming(animDistance, 200ms, (finished) => { // slide 0 → animDistance
  if (finished) {
    scheduleOnRN(setModalVisible, false);        // unmount <Modal> AFTER the slide
    scheduleOnRN(setShouldMountChildren, false); // unmount children AFTER the slide
    if (onClose) scheduleOnRN(onClose);
    if (onComplete) scheduleOnRN(onComplete);
  }
});
```

> Children are unmounted on close and remounted on open, so any state **inside** children resets each open.
> State held by a **parent** of the SlideSheet does not.

---

## Part 4 — Keyboard dodge

### Why the sheet handles the keyboard itself

RN's `<Modal>` on Android is a native Dialog with its own window. The OS does not resize
the sheet for the keyboard, placing `KeyboardAvoidingView` inside will not works.

So the sheet does it by hand — it subscribes to the keyboard events
(`keyboardWillShow/Hide` on iOS, `keyboardDidShow/Hide` on Android)
and stores the keyboard height `K` in the `keyboardHeight` shared value.

### Three style properties, three jobs

`animatedStyle` sets three properties; read them in order ① → ② → ③:

```ts
maxHeight:    screenHeight - insets.top - keyboardHeight.value,  // ① cap height to the visible area
transform:    [{ translateY: translateY.value }],               // ② open/close slide only
marginBottom: keyboardHeight.value,                             // ③ lift the bottom onto the keyboard
```

- **① `maxHeight = SH − insets.top − K`** — caps the box to the area still visible above the keyboard. This is
  what keeps the **top** on-screen: the box cannot grow past the cap, so any extra content scrolls inside the
  body (Part 5) instead of pushing the top off-screen.
- **② `translateY`** — carries only the open/close slide; it never includes the keyboard offset.
- **③ `marginBottom = K`** — in the `flex-end` layout, bottom margin lifts the **bottom** edge up by `K` to
  rest on the keyboard. It shrinks the box from the bottom (reduces height), it does not move the whole box.

With the keyboard up (`translateY=0, K`):

```
y=0       ┌───────────────┐ ← top of screen
insets.top╞═══════════════╡ ← TOP pinned at insets.top (never higher)
          │  title        │
          │ ┌───────────┐ │
          │ │ ScrollView│ │ ← overflow scrolls INSIDE here
          │ │  ⇅        │ │
          │ └───────────┘ │
          │  footer       │
          ╞═══════════════╡ ← BOTTOM = SH − K (rests on keyboard)
░░░░░░░░░ │   KEYBOARD    │ ░░░░░░░░░
y=SH      └───────────────┘
```

**In one line:** `marginBottom` raises the bottom onto the keyboard while `maxHeight` caps the height, so the
top stays pinned on-screen and any overflow scrolls inside the body.

---

## Part 5 — Body scroll

### Where the shrink lives

**What** — `flexShrink: 1` lets a node give up height when a flex column runs out of room. RN's default is
`flexShrink: 0`: keep full height and overflow instead (the opposite of web CSS).

**Why / when** — `maxHeight` caps the sheet, so on a tall body `title + content + footer` won't all fit. One
node must give up height so the rest stays on-screen — that node is the scrollable body.

**Where** — on the **container** (the direct child of the capped box), not on the ScrollView:

```
SlideSheet (maxHeight) → container (flexShrink: 1) → ScrollView
```

Once the container can shrink to the cap, `title` and `footer` keep their fixed height and the `ScrollView`
takes the leftover space as its frame — so it scrolls.

### `ConfirmSlideSheet` owns the scroll; opt out for self-scrolling

```tsx
// Form call-site — nothing to declare; scrollable true is the default
<ConfirmSlideSheet title="…" onConfirmPress={…}>
  <CarInfoModalContent … />   {/* body = fields only, no ScrollView */}
</ConfirmSlideSheet>

// Self-scrolling / fill body — opt out
<ConfirmSlideSheet title="…" heightPercentage={0.7} scrollable={false} onConfirmPress={…}>
  <CarPropertySelectModalContent … />   {/* SingleSelect scrolls internally */}
</ConfirmSlideSheet>
```

---

## Why

1. **Manual keyboard listener** — RN `<Modal>` on Android is a Dialog; `KeyboardAvoidingView` can't reach it.
2. **`marginBottom` + `maxHeight`, not `translateY`, for the keyboard** — translation keeps height and drags
   the top off-screen; shrinking keeps the top on-screen and triggers internal scroll.
3. **`translateY` reserved for open/close** — one value, one job; the reactive `animatedStyle` recombines.
4. **`withTiming` is the animator** — `useAnimatedStyle` only mirrors current values.
5. **Scroll lives in `ConfirmSlideSheet`, not leaf content** — one ScrollView, one place; `scrollable` expresses
   the one fact the container cannot infer.

→ [SoC](../principle/SOC.md), [KISS](../principle/KISS.md)

## How

### Rule 1 — Keyboard avoidance is layout, never translation

Use `maxHeight` (cap) + `marginBottom` (lift). Never fold `keyboardHeight` into `translateY`. Never add
`KeyboardAvoidingView` inside the sheet.

### Rule 2 — Only the bottom edge is controlled

`bottom = screenHeight + translateY − marginBottom`; the top is derived. To keep the top on-screen, cap
`maxHeight`, never reposition the top directly.

### Rule 3 — `ConfirmSlideSheet` owns the body scroll; default is `scrollable`

A form body scrolls by default. Do **not** add a `ScrollView` (or any `flexShrink`) inside
`*-modal-content.tsx` — the field stack is the whole body.

### Rule 4 — Set `scrollable={false}` when the body self-scrolls or fills

Opt out when the body uses `flex: 1` to fill the sheet, or owns its own `ScrollView`.

### Rule 5 — Childless `ConfirmSlideSheet` (confirm dialog) ignores `scrollable`

A `ConfirmSlideSheet` with no `children` (title + buttons only, e.g. sign/cancel confirmations) needs no prop —
the empty body has zero height.

## References (official)

- [KeyboardAvoidingView · React Native](https://reactnative.dev/docs/keyboardavoidingview) — Modal/Android limitation
- [Keyboard handling · Expo](https://docs.expo.dev/guides/keyboard-handling/)
- [useAnimatedStyle · Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle/) — worklet re-runs on shared-value change
- [withTiming · Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/)
- [Shared Values · Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/shared-values/)

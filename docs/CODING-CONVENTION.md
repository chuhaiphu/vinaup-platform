# Coding Convention - VinaUp Platform

---

## 1. Mobile Typography

Applies to `apps/mobile`. All values live in [`src/constants/style-constants.ts`](../apps/mobile/src/constants/style-constants.ts).

### 1.1 Mental model

A `<Text>` occupies a **line box**. The glyphs you actually see (digits, capitals) only fill
baseline → cap-height, roughly `0.71em`. Everything else in the box is reserved space for
ascenders and descenders.

Two different problems come from that gap, and they pull in **opposite directions**:

|                          | Problem                                                                                   | Fix                                  |
| ------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------ |
| **A. Reading rhythm**    | Stacked lines sit too close to read comfortably                                           | **Grow** the box — `lineHeight`      |
| **B. Off-axis in a row** | Glyphs drift below the centre of a row shared with an icon or a differently-sized sibling | **Shrink** the box — `CENTERED_TEXT` |

Applying A's fix to a B case makes B worse: a taller, more lopsided box drifts further off axis.

The app ships **no custom font** — no `fontFamily`, no `expo-font`, no `assets/fonts`. Text renders
in Roboto on Android and SF Pro on iOS.

### 1.2 The rule

Three branches, mutually exclusive. Never combine the first two on one style.

| Situation                                                 | Use                               |
| --------------------------------------------------------- | --------------------------------- |
| Text that can wrap — descriptions, notes, messages        | `lineHeight: LINE_HEIGHTS.<size>` |
| Single line beside an icon or a differently-sized sibling | `...CENTERED_TEXT`                |
| Single line standing alone                                | neither                           |

```ts
descriptionText: {
  fontSize: FONT_SIZES.sm,
  lineHeight: LINE_HEIGHTS.sm,
  color: COLORS.gray700,
},

timeText: {
  fontSize: FONT_SIZES.base,
  ...CENTERED_TEXT,
  color: COLORS.teal900,
},
```

### 1.3 Why `lineHeight = fontSize + 6`

`LINE_HEIGHTS` mirrors the `FONT_SIZES` keys and adds a flat 6px:

| key            | xxs  | xs   | sm   | base | lg   | xl   | 2xl  | 3xl  | 4xl  |
| -------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| `FONT_SIZES`   | 10   | 12   | 14   | 16   | 18   | 20   | 24   | 30   | 36   |
| `LINE_HEIGHTS` | 16   | 18   | 20   | 22   | 24   | 26   | 30   | 36   | 42   |
| ratio          | 1.60 | 1.50 | 1.43 | 1.38 | 1.33 | 1.30 | 1.25 | 1.20 | 1.17 |

A flat offset produces a **tightening ratio** as type scales up, which is what large text needs —
a heading at 1.5 leading looks unglued. The constant was not invented: every `lineHeight` already
in the codebase before this table existed (`xs → 18`, `sm → 20`, `base → 22`) matches it exactly,
so adopting it changed no pixels.

React Native defines `lineHeight` as _"the distance between the baselines of consecutive lines of
text"_ — it is about spacing **between** lines. The docs do **not** specify how leftover leading is
distributed around a single line, so do not reach for `lineHeight` to centre something. That is
what section 1.4 is for.

### 1.4 Why `CENTERED_TEXT` and not `lineHeight`

```ts
export const CENTERED_TEXT = {
  includeFontPadding: false,
  textAlignVertical: 'center',
} as const;
```

Android pads the line box using the font's **maximum** ascender and descender. Vietnamese stacks
diacritics (ầ, ế, ữ), so Roboto reserves a thick band above the glyphs. A string with no diacritics
— `08:30`, `12/07` — therefore renders low inside its own box. An icon is a different typeface with
different metrics and gets no such padding, so `alignItems: 'center'` lines up two boxes whose
visible content sits at different heights.

React Native names this exact symptom:

> Set to `false` to remove extra font padding intended to make space for certain ascenders /
> descenders. With some fonts, this padding can make text look slightly misaligned when centered
> vertically. For best results also set `textAlignVertical` to `center`.

**Both props are Android-only.** On iOS they are ignored. If a row still looks off-axis on iOS, the
cause is the icon font's own metrics — fix it by wrapping the icon in a `View` with a fixed
`width`/`height` and `alignItems`/`justifyContent: 'center'`, not by touching the text.

There are community reports of these props having no effect with certain fonts. The app uses system
fonts, where they behave as documented, but a change here can only be confirmed on a device —
`tsc` and `eslint` cannot see it.

### 1.5 Known exception

[`receipt-payment-section-list-header.tsx`](../apps/mobile/src/components/commons/headers/receipt-payment-section-list-header.tsx)
sets `equalSignText` to `fontSize: FONT_SIZES.xl, lineHeight: 20` — a ratio of 1.0. That is a
deliberate **crop**, shrinking the box so the `=` pill hugs its glyph. It predates this convention
and is left as-is: migrating it to `LINE_HEIGHTS.xl` would grow the box from 20 to 26 and change
the rendering. It is a section-1.2 branch-two case that should become `...CENTERED_TEXT`, but only
after checking the result on a device.

### Sources

- [Text Style Props — React Native](https://reactnative.dev/docs/text-style-props)

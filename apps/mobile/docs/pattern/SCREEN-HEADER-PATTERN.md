# Screen Header Pattern

The bar at the top of a screen: what the platforms call it, what Expo Router exposes of it, and how this
app declares one.

## What a screen header is

The bar pinned above a screen's content that says **where we are**, **how to go back**, and what **actions
apply to what the screen is showing**. It belongs to the navigator, not to the screen — the navigator
renders one bar and each screen tells it what to put inside.

It has three content regions and a surface underneath them:

```
        ┌──────────────────────────────────────────────────────────┐
        │  ‹ Back           Screen title                ⊕          │
        └──────────────────────────────────────────────────────────┘
           └── leading ──┘  └─── title ───┘    └───── trailing ────┘
           how to go back    where we are       actions on this screen
                                                (a menu, when there are several)

        the surface: background - tint - title font - shadow - translucency
```

Both platforms ship this component, under different names and with different defaults:

|                  | iOS                                                                      | Android                                                                                       |
| ---------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Component        | **navigation bar** (`UINavigationBar`)                                   | **top app bar** (`TopAppBar`)                                                                 |
| Leading          | **back button** — chevron + previous screen's title                      | **navigation icon** — an up arrow, no label                                                   |
| Title alignment  | **not configurable** ([two presentations](#the-two-title-presentations)) | leading by default, centring is a separate variant                                            |
| Trailing         | **bar button items** — an array; every one renders                       | **action icons** — a row; every one renders ([Native header actions](#native-header-actions)) |
| Expanded variant | **large title** — collapses into the bar on scroll                       | **medium** and **large** top app bars — collapsing                                            |
| Bottom bar       | **toolbar** — a different component, not the header                      | bottom app bar — a different component                                                        |

### The two standard header types

Both platforms key the header off one question — _can this screen go back?_

| Type       | The screen is                     | Leading   | Title             | Trailing  |
| ---------- | --------------------------------- | --------- | ----------------- | --------- |
| **Root**   | the first screen of a navigator   | nothing   | the screen's name | 0–n items |
| **Pushed** | anything navigated to from a root | back / up | the screen's name | 0–n items |

Neither platform limits the trailing slot to a fixed count — the shape this app gives it is
[its own rule](#the-two-slots), not a platform constraint.

```
 Root                                    Pushed
┌───────────────────────────┐           ┌───────────────────────────┐
│         Entity      ⊕     │           │  ‹       Entity       ⊕   │
└───────────────────────────┘           └───────────────────────────┘
  leading empty                          leading holds the back
  — when nothing to go back
```

### The two title presentations

**One string, one or two drawings.** A screen declares one title string. iOS draws that string **two** ways,
for Android it is **one**. There is never a second title value to declare, and the presentation is determined by screen behaviour.

#### iOS

|                | **inline title**                              | **large title**                               |
| -------------- | --------------------------------------------- | --------------------------------------------- |
| Alignment      | centred — **locked**, no option changes it    | leading — **locked**, no option changes it    |
| Title size     | 17pt by default — `headerTitleStyle.fontSize` | 34pt by default — `headerLargeTitleStyle`     |
| Bar height     | standard                                      | expanded                                      |
| On screen when | large is off, **or** the content has scrolled | large is on **and** the content is at the top |

**The screen picks whether both drawings exist. The scroll offset picks which one is on screen.**

```
                          large title ON                    large title OFF — the default
                     ─────────────────────────           ─────────────────────────────────

  scroll offset = 0    ┌────────────────────────┐         ┌────────────────────────┐
                       │  ‹                  ⊕  │         │  ‹     Đơn hàng     ⊕  │
                       │                        │         └────────────────────────┘
                       │  Đơn hàng              │
                       └────────────────────────┘
                                ▲          │
                    scroll up   │          │   scroll down
                                │          ▼
  scroll offset > 0    ┌────────────────────────┐         ┌────────────────────────┐
                       │  ‹     Đơn hàng     ⊕  │         │  ‹     Đơn hàng     ⊕  │
                       └────────────────────────┘         └────────────────────────┘

                       the bar swaps drawing                one drawing
```

Off is the default, and it is the whole story: the inline title, at every scroll offset. Nothing about it
is a per-scroll-position setting — a screen sets one flag, and the string it already declared is drawn
according to where the content happens to be.

#### Android

|                | **top app bar title**                                                       |
| -------------- | --------------------------------------------------------------------------- |
| Alignment      | leading — **configurable**, the one alignment choice either platform offers |
| Title size     | one presentation, 20sp by default — the size itself is `headerTitleStyle.fontSize` |
| Bar height     | fixed                                                                       |
| On screen when | always — the scroll offset is not read                                      |

```
                          headerTitleAlign: 'left'          headerTitleAlign: 'center'
                          — the default                     — what this app declares
                     ─────────────────────────           ─────────────────────────────────

  scroll offset = 0    ┌────────────────────────┐         ┌────────────────────────┐
                       │  ← Đơn hàng         ⊕  │         │  ←     Đơn hàng     ⊕  │
                       └────────────────────────┘         └────────────────────────┘
                                   │                                 │
                    scroll ↕       │                     scroll ↕    │
                                   ▼                                 ▼
  scroll offset > 0    ┌────────────────────────┐         ┌────────────────────────┐
                       │  ← Đơn hàng         ⊕  │         │  ←     Đơn hàng     ⊕  │
                       └────────────────────────┘         └────────────────────────┘

                       unchanged                           unchanged
```

Material does define **medium** and **large** top app bars whose titles collapse — the counterpart of
iOS's large title — but they are not reachable from a `Stack` here ([Not reachable](#not-reachable)).

### Native header actions

**Actions** are the tappable items in the bar — everything that is not the title and not the back affordance.
Two slots hold them, **leading** and **trailing**, and they are not mirror images.

#### The two slots, per platform

| Slot         | iOS - UIKit `UINavigationItem`                                                                          | Android - Material 3 `TopAppBar`                        |
| ------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **leading**  | `leftBarButtonItems` — _"An array of custom bar button items to display on the left (or leading) side"_ | `navigationIcon: @Composable () -> Unit` — **one** slot |
| **trailing** | `rightBarButtonItems` — an array of the same shape                                                      | `actions: @Composable RowScope.() -> Unit` — a **row**  |

**iOS is symmetric** — both edges are arrays of `UIBarButtonItem`: same type, same capabilities.

**Android is not** — the leading edge is one slot with no scope to put a second item in, and only the trailing
edge is a row. The [`TopAppBar` KDoc](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AppBar.kt) states:

> `navigationIcon` — the navigation icon displayed at the start of the top app bar.
> `actions` — the actions displayed at the end of the top app bar.
> **The default layout here is a `Row`, so icons inside will be placed horizontally.**

**Normally on both platforms, leading is the back affordance's slot.** The presence of custom left bar button items causes the Back button to be removed in favor of the custom items.

On iOS, custom items there replace the Back button unless:

> Setting `leftItemsSupplementBackButton` property to `true` causes the items … to be displayed to the right of the Back
> button — that is, they're displayed in addition to, not instead of, the Back button.
>
> — [`leftItemsSupplementBackButton` - UIKit](https://developer.apple.com/documentation/uikit/uinavigationitem/leftitemssupplementbackbutton)

#### What an action is made of

| To show          | iOS - `UIBarButtonItem`                           | Android - `TopAppBar(actions:)`                            |
| ---------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| **text**         | `init(title:style:target:action:)`                | a text composable — against the KDoc's stated convention   |
| **an icon**      | `init(image:…)`, or `init(barButtonSystemItem:…)` | `IconButton` — _"This should typically be `IconButton`s."_ |
| **our own view** | `init(customView:)`                               | any composable                                             |
| **a menu**       | the item's own `menu` property                    | no menu slot — an `IconButton` opening a `DropdownMenu`    |

**iOS fixes the content, Android fixes only the position.** A UIKit action is an object whose content the
initializer settles; an Android action is `@Composable RowScope.() -> Unit`, so whatever is written there draws.

### iOS 26 — Liquid Glass

From iOS 26 the system draws bars and controls on **Liquid Glass**, a translucent material that refracts
whatever scrolls underneath. A navigation bar has **two** Glass surfaces, and they are independent:

```
        ┌────────────────────────────────────────┐
        │  ‹     Chi tiết xe            ( 🗑 )   │
        └────────────────────────────────────────┘
           ▲                              ▲
           │                              └── ② behind the ITEMS
           │                                  one capsule shared by the bar's buttons
           └── ① behind the WHOLE BAR
               content scrolls under it and shows through
```

|                       | ① behind the bar                                                                                          | ② behind the items                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **On by default?**    | **No** — `react-native-screens` never asks the system for it                                              | **Yes**                                                               |
| **Can we change it?** | **No** — no option reaches it ([#4021](https://github.com/software-mansion/react-native-screens/discussions/4021)) | yes — `separateBackground` / `hidesSharedBackground` opt one item out |
| **Apple says**        | stop setting custom bar backgrounds ([TN3106](https://developer.apple.com/documentation/technotes/tn3106-customizing-uinavigationbar-appearance)) | leave it on                                                           |

So neither is declared: the bar stays flat in whatever colour `headerStyle.backgroundColor` gives it —
the same on iOS 26 as on iOS 18 — and the items get Glass for free.

### Native header overflow

| Slot         | iOS - UIKit `UINavigationItem`                                             | Android - Material 3 `TopAppBar`                               |
| ------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **leading**  | **none** — no overflow API applies to `leftBarButtonItems`                 | **none** — `navigationIcon` holds one item and cannot overflow |
| **trailing** | `additionalOverflowItems` (iOS 16+) — **opt-in**: assign a non-`nil` value | **none** — `actions` is a `Row`                                |

On iOS, the opt-in is the whole mechanism — `additionalOverflowItems`, verbatim:

> When you assign a non-`nil` value to this property, the overflow menu button appears on the trailing edge of
> the navigation bar. … The system also populates the overflow menu with any items that can't fit in the
> navigation bar due to layout space constraints.
>
> — [`additionalOverflowItems` - UIKit](https://developer.apple.com/documentation/uikit/uinavigationitem/additionaloverflowitems)

**On Android** `actions` is a `Row`: it measures nothing, hides nothing, and folds nothing. To solve that,
we have to use a top app bar Material 3 menu component, an `IconButton` that opens a `DropdownMenu`.

#### When the bar is overfilled and nothing handles it

This is **not specified in either platform's documentation**.

The closest either vendor comes is one line of **Apple** design guidance — a warning, not a mechanism:

> Choose items deliberately to avoid overcrowding. People need to be able to distinguish and activate each
> item, so you don't want to put too many items in the toolbar.
>
> — [Toolbars - Apple HIG](https://developer.apple.com/design/human-interface-guidelines/toolbars)

---

## What Expo Router exposes

Expo Router draws headers two different ways, and which one we get depends on the navigator:

| Navigator                                | Header is                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| `Stack` (from `expo-router`)             | the **native** `UINavigationBar` / `TopAppBar`, via `react-native-screens` |
| `Tabs` (`expo-router/js-tabs`), `Drawer` | a JavaScript reimplementation with React Native `View`                     |

Both default to `headerShown: true`, so a `Stack` nested inside `Tabs` renders **two** bars unless the
outer one is turned off:

```
app/(protected)/personal/(tabs)/
├── _layout.tsx            Tabs    → JS header
└── wage/
    ├── _layout.tsx        Stack   → native header
    └── index.tsx          screen

leave the Tabs header on and both render:

        ┌────────────────────────┐
        │    JS header (Tabs)    │
        ├────────────────────────┤
        │ native header (Stack)  │
        ├────────────────────────┤
        │        content         │
        └────────────────────────┘
```

### Things already built-in the native header

None of this is worth re-implementing, and some of it cannot be:

| Behaviour                                                    | Comes from                        |
| ------------------------------------------------------------ | --------------------------------- |
| the back affordance appears exactly when a screen was pushed | the stack's own position tracking |
| safe-area inset and the platform's bar height                | the native bar                    |
| title cross-fade on push / pop                               | the native transition             |
| interactive back swipe, long-press back history (iOS)        | the native bar                    |
| large title collapse, blur, Liquid Glass (iOS)               | the native bar                    |

A hand-drawn `<View>` will lose all of it, the header would slide with the body instead of transitioning
independently.

### Configurable

`react-native-screens` surfaces the platforms' shared surface area:

- **Content** — `title`, a custom title view, left/right bar button items, back button and its display mode.
- **Chrome** — background colour, tint, title font/size/weight, shadow, translucency, blur (iOS).
- **Behaviour** — `headerShown`, large title (iOS), search bar, title alignment (Android).

#### The chrome options

**Leaving an option unset does not hand the bar to the platform.** Every chrome slot is resolved in JS
before it reaches native, and what fills an empty one is Expo Router's `DefaultTheme` — `card` white,
`text` near-black, `primary` iOS blue. The choice is ours.

| Option                                   | Controls, on iOS                    | Controls, on Android                                | When unset, drawn by                        |
| ---------------------------------------- | ----------------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| `headerStyle.backgroundColor`            | the bar's background                | the bar's background, and a menu dropdown's         | `DefaultTheme.card` — white                 |
| `headerTintColor`                        | the back chevron and every bar item | the navigation icon and every bar item              | iOS `DefaultTheme.primary`, Android `.text` |
| `headerTitleStyle` — `fontSize`, `color` | the native title's text attributes  | the title `<Text>`'s style                          | 17pt / 20sp; the colour falls back to `headerTintColor`, then `DefaultTheme.text` |
| `headerTitleAlign`                       | nothing — the option is a no-op     | the title's alignment, the one either platform offers | Android's own default, leading            |
| `headerShadowVisible`                    | the hairline under the bar          | the bar's elevation                                 | both drawn                                  |
| `headerBackButtonDisplayMode`            | the back button's title             | nothing — Android is always `'minimal'`             | iOS, showing the previous screen's title    |

#### Light and dark

**The app is light-only, and says so.** Three declarations have to agree, and this is what each
contributes:

| Declaration                     | Effect                                                                |
| ------------------------------- | ----------------------------------------------------------------------- |
| `app.json` `userInterfaceStyle` | `"light"` — _"Restrict the app to support light theme only"_          |
| no `ThemeProvider` anywhere     | `DefaultTheme` always, so the bar renders `light`                     |
| `constants/style-constants.ts`  | one palette, no dark variant                                          |

`"light"` is the third row's consequence, not an independent preference. It was `"automatic"`, which
claimed a capability the other two do not implement: the app's own pixels stayed light while alerts,
action sheets, the keyboard and pickers went dark with the device. Locking it costs nothing — every
surface we draw was already light — and it is what makes `<StatusBar barStyle="dark-content" />` correct
unconditionally.

**Adopting dark mode later is not a header change.** It needs a second palette, a `ThemeProvider` driven
by `useColorScheme()`, and every screen re-checked. `userInterfaceStyle` flips back to `"automatic"` on
the day that lands, and not before.

#### The title presentation in Expo Router

One flag enables the second drawing. The `title` already declared feeds both — nothing is declared twice.

| Declaration                     | Sets                                                                        |
| ------------------------------- | --------------------------------------------------------------------------- |
| `headerLargeTitleEnabled: true` | the large presentation, for that screen — **iOS only**                      |
| `<Stack.Title large>`           | the same option, in composition syntax                                      |
| `headerLargeTitleStyle`         | the large drawing's `fontFamily` - `fontSize` - `fontWeight` - `color`      |
| `headerLargeStyle`              | the bar's background while the large drawing shows — `backgroundColor` only |
| `headerLargeTitleShadowVisible` | the hairline while the large drawing shows                                  |
| `headerTitleAlign`              | Android's alignment — a no-op on iOS, where both drawings are locked        |

**Three conditions combined, or it never collapses.** Without all three the large
drawing simply sits there and no swap ever happens:

1. the `ScrollView` / `FlatList` is the screen component's **first rendered child** — a wrapper is allowed
   only with `collapsable={false}` on it;
2. that scrollable sets `contentInsetAdjustmentBehavior="automatic"`;
3. its content is **taller than the screen** — _"if the scrollable area doesn't fill the screen, the large
   title won't collapse on scroll"_.

**On iOS, it changes the bar's surface.**

1. **The bar becomes translucent.** Forced on iOS, escapable only by stating `headerTransparent: false`.

2. **The background's _default_ flips to transparent** — an explicit `headerStyle.backgroundColor` still
   wins, the precedence `headerTransparent` already documents: _"changes the background color to
   `transparent` unless specified in `headerStyle`"_.

3. **The large drawing's colour falls back to the inline one.** `headerLargeTitleStyle.color` if given,
   otherwise `headerTitleStyle.color`.

**Android ignores the flag** — the option is declared _"Only supported on iOS"_.

### Not reachable

- **Title alignment on iOS** — the inline drawing is always centred, the large drawing always leading; the
  option is a no-op there ([The two title presentations](#the-two-title-presentations)).
- **Material medium / large top app bars** — Android's collapsing titles exist in `react-native-screens`'
  **experimental** stack, as a header type plus its scroll flags. Expo Router's experimental `Stack` narrows
  its options to `title`, `headerShown`, `headerTransparent` and `headerBackVisible`, and drops anything
  else with a dev warning — so the type never arrives. That same experimental stack carries no iOS large
  title in return. **The iOS large title, on the standard `Stack`, is the only collapsing title reachable.**
- **iOS's system-populated overflow button** — a menu itself is reachable, as a `Stack.Toolbar.Menu`. What is not is
  UIKit's `⋯` button that the system fills on its own. `additionalOverflowItems` and
  `overflowPresentationSource` are not exposed by `react-native-screens`.
- **Any automatic grouping of toolbar items** — on either platform, in either slot. What is declared is
  what renders; a menu holds exactly the entries written into it.

---

## How much of the header we own

Every header decision reduces to one question — **how much of the bar do we take over?** The APIs form a
ladder, and each rung down buys control by giving up platform behaviour.

```
 own nothing ──────────────────────────────────────────────────────► own everything

   Default        Configured       Slot content      Replaced        Removed
   declare        set options      our component     our component   no bar
   nothing        the bar reads    inside one slot   IS the bar      at all
      │               │                  │               │              │
      └───────────────┴──────────────────┘               └──────────────┘
       the platform draws and animates it                we draw it all
```

| Rung                 | We declare                                                                           | We give up                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **0 - Default**      | nothing                                                                              | nothing — but the title falls back to the route's file name                                         |
| **1 - Configured**   | `title`, colours, tint, back mode, `Stack.Toolbar`, `Stack.SearchBar`                | nothing                                                                                             |
| **2 - Slot content** | a component inside **one** slot — `<Stack.Title asChild>`, `<Stack.Toolbar asChild>` | that slot's styling — our view is ours to lay out, and must fit the bar's height and its inset      |
| **3 - Replaced**     | `header: () => …`, `<Stack.Header asChild>`                                          | the native bar itself: _"the native functionality such as large title, search bar etc. won't work"_ |
| **4 - Removed**      | `headerShown: false`, `<Stack.Header hidden>`                                        | the whole bar, the back affordance included                                                         |

Rung 4 is not "more custom" than rung 3 — it is no header at all. The trap is removing the bar and then
drawing a bar-shaped `<View>` in the screen body: that is rung 3 with extra steps and none of the behaviour
listed under [Things already built-in](#things-already-built-in-the-native-header).

**The rule: take the highest rung that satisfies the requirement.**

### Which rung a requirement lands on

| Requirement                                                    | Rung                                                                                           |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| a fixed screen name                                            | **1**                                                                                          |
| a name read from the record being shown                        | **1** — `<Stack.Title>` still hands the platform a string                                      |
| one action; or several, behind a menu                          | **1**                                                                                          |
| a search field over a list                                     | **1**                                                                                          |
| a title that expands while a list sits at the top              | **1** — one option, and iOS only ([The two title presentations](#the-two-title-presentations)) |
| a second line under the title — iOS has no subtitle slot       | **2**                                                                                          |
| a title that opens a picker                                    | **2**                                                                                          |
| chrome the options do not cover — a gradient, an image, a logo | **3**                                                                                          |
| a screen that owns the whole viewport — sign-in, a camera      | **4**                                                                                          |

---

## How Expo Router handles the Stack header

Each `Stack` screen carries a bag of **header
options**, and `react-native-screens` hands that bag to `UINavigationBar` / `TopAppBar`, which draws the
bar.

```
   what a screen writes                   the screen's header options        what draws
   ────────────────────                   ───────────────────────────        ──────────

   options={{ title: 'Xe' }}         ─┐
   <Stack.Title>Xe</Stack.Title>      ├──►  { title, headerRight, … }  ──►  UINavigationBar  (iOS)
   <Stack.Toolbar placement="right"> ─┘                                     TopAppBar        (Android)
```

### The two syntaxes

| Syntax                     | Written as                                        | Reaches                           |
| -------------------------- | ------------------------------------------------- | --------------------------------- |
| **Options object**         | `options={{ title: 'Xe' }}` on a `<Stack.Screen>` | every header option               |
| **Composition components** | `<Stack.Title>Xe</Stack.Title>` and its siblings  | the same options, one region each |

Both are accepted in **both sites** — a `_layout.tsx` and a screen component — with one exception:
`Stack.Toolbar` in its bottom placement _"can only be used inside page components, not in layout files."_
Expo Router states a preference for the screen site: _"When configuring header inside page components,
prefer using `Stack.Title`, `Stack.Toolbar`, `Stack.Header` and `Stack.Screen.*` components."_

### Header composition component

It does three things and nothing else:

1. converts its own props into header options — `<Stack.Title>Xe</Stack.Title>` becomes `{ title: 'Xe' }`;
2. registers that object against the route it sits in;
3. returns `null`.

It occupies **no space** where it is written, and it is not a piece of the bar:

```
CarDetailScreenContent
├── <Stack.Title>{car.name}</Stack.Title>   → registers { title: car.name }, then renders null
└── <ScrollView>…</ScrollView>              → the only child that occupies space

        ┌────────────────────────────────┐
        │  ‹           car.name          │  ← drawn by the native bar, from the registered options
        ├────────────────────────────────┤
        │  ScrollView                    │  ← where the screen's own tree starts
        └────────────────────────────────┘
```

### The component family

Six components. Each owns **one region of the bar, or one behaviour of it**. They carry Expo Router's names,
not the platforms': one declaration lands on `UINavigationBar` on iOS and on `TopAppBar` on Android.

| Component                   | Owns                                                       | Chief props                                                                    |
| --------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `<Stack.Screen>`            | **the screen** — not a region                              | `name`, `options`, `initialParams`, `redirect`, `getId`                        |
| `<Stack.Screen.BackButton>` | the **leading** slot's back affordance                     | `children` (its title), `displayMode` (iOS), `src`, `withMenu` (iOS), `hidden` |
| `<Stack.Title>`             | the **title** region                                       | `children`, `large` (iOS), `style`, `largeStyle` (iOS), `asChild`              |
| `<Stack.Header>`            | the **whole bar**                                          | `hidden`, `transparent`, `blurEffect` (iOS), `style`, `asChild`                |
| `<Stack.SearchBar>`         | the bar's **search field**                                 | the platform `SearchBarProps` — and it turns the header on                     |
| `<Stack.Toolbar>`           | the **leading / trailing** items, or a separate bottom bar | `placement`, `asChild`, and its children ([Stack.Toolbar](#stacktoolbar))      |

```
        ┌────────────────────────────────────────────────────┐
        │  ‹ Back            Screen title           ⊕        │ ← Stack.Header owns this whole bar
        └────────────────────────────────────────────────────┘
           └── leading ──┘  └─── title ──┘  └── trailing ──┘
            Screen.BackButton    Title       Toolbar placement="right"
            Toolbar placement="left"
```

`<Stack.Screen>` is the odd one out — it is not a region of the bar, it is **the screen**. `name` says which
route the options belong to, and `options` carries them all in one object.

```tsx
// as one options object
<Stack.Screen name="login" options={{ title: 'Đăng nhập', headerShown: false }} />

// as region-shaped components — the same two entries
<Stack.Screen name="login">
  <Stack.Title>Đăng nhập</Stack.Title>
  <Stack.Header hidden />
</Stack.Screen>
```

#### Header declaration order

The same option can be set from both sites at once — a layout's `options` object and a screen's composition
component. The precedence is fixed, and has nothing to do with render order:

```
   options object   ──►  the screen's descriptor options    ─┐
                                                             ├──►  composition wins
   composition      ──►  a separate registry, merged on top ─┘
```

A layout's `title` is therefore a **base** and a screen's `<Stack.Title>` an **override**:

```tsx
// app/(protected)/_layout.tsx
<Stack.Screen name="invoice-detail/[invoiceId]" options={{ title: 'Chi tiết hoá đơn' }} />

// components/.../invoice-detail-screen-content.tsx
<Stack.Title>{`Chi tiết ${InvoiceTypeDisplay[invoice.type]}`}</Stack.Title>
```

### `asChild` — the prop that changes what a component means

Children of a composition component are **not rendered where they are written**. What they turn into
depends on `asChild`:

| Written                                           | The children become                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `<Stack.Title>{car.name}</Stack.Title>`           | a string, passed as `title`                                          |
| `<Stack.Title asChild><CarTitle /></Stack.Title>` | `headerTitle: () => <CarTitle />` — `CarTitle` mounts **in the bar** |
| `<Stack.Title><CarTitle /></Stack.Title>`         | dropped, with a dev warning — a component needs `asChild`            |

`asChild` is therefore the rung boundary in component form
(→ [How much of the header we own](#how-much-of-the-header-we-own)).

### Stack.Toolbar

`Title`, `Header`, `SearchBar` and `BackButton` each own **one option carrying one value**. Actions do not
fit that shape. Each entry carries its own content,
and one entry may open a menu of further entries. That is the whole reason `Stack.Toolbar` exists.

#### What it is

A **group declaration**, never an item. One element per slot, and `placement` picks the slot:

| `placement` | Fills                                          | Note                                                                         |
| ----------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `"left"`    | the header's **leading** slot                  | evicts the back affordance ([Native header actions](#native-header-actions)) |
| `"right"`   | the header's **trailing** slot                 | —                                                                            |
| `"bottom"`  | **not the header** — the platform's bottom bar | the **default**, and page components only                                    |

Three rules the API imposes on the group itself:

1. **A header toolbar turns the header on** — _"Using `Stack.Toolbar` with `placement="left"` or
   `placement="right"` will automatically make the header visible (`headerShown: true`)"_.
2. **Toolbars do not nest** — _"You cannot nest `Stack.Toolbar` components inside each other."_
3. **One group per slot per screen** — _"If multiple instances of this component are rendered for the same
   screen, the last one rendered in the component tree takes precedence."_

#### The members

Nine, in **two kinds**. An **item** takes a position in the slot. A **content primitive** describes what is
drawn inside an item and takes no position of its own. `MenuAction` is neither — it is an entry inside a
menu, and the menu is the item.

| Kind                  | Member                        | Is                                                                                                                                                                      |
| --------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **item**              | `Stack.Toolbar.Button`        | one tappable item — `icon`, `onPress`, `disabled`, `hidden`, `tintColor`, `variant` (iOS), `selected` (iOS)                                                             |
|                       | `Stack.Toolbar.Menu`          | one item whose tap opens a **native menu** — `icon`, `title`, `destructive` (iOS); `inline`, `palette` and `elementSize` (iOS 16+) apply when it is nested as a submenu |
|                       | `Stack.Toolbar.View`          | one item drawn by a component of ours — `children`, `hidden`                                                                                                           |
|                       | `Stack.Toolbar.Spacer`        | empty space between items — `width`, **required** in the header slots and on Android in every placement; omitting it gives a flexible spacer, and only in a bottom toolbar on iOS |
|                       | `Stack.Toolbar.SearchBarSlot` | where `Stack.SearchBar` sits inside a **bottom** toolbar — iOS 26+                                                                                                      |
| **menu entry**        | `Stack.Toolbar.MenuAction`    | one **entry inside** a menu, not an item in the slot — `icon`, `onPress`, `isOn`, `destructive`, `subtitle` (iOS), `unstable_keepPresented`                             |
| **content primitive** | `Stack.Toolbar.Icon`          | the item's image — exactly one of `sf` (iOS), `src`, `xcasset` (iOS), plus `renderingMode`                                                                              |
|                       | `Stack.Toolbar.Label`         | the item's text                                                                                                                                                         |
|                       | `Stack.Toolbar.Badge`         | the item's badge — header placements only                                                                                                                               |

`separateBackground` (iOS) and `hidesSharedBackground` (iOS 26+) are on the three **positioned items** —
`Button`, `Menu` and `View` — not on `View` alone ([iOS 26](#ios-26--liquid-glass)).

```
<Stack.Toolbar placement="right">              ← the group: which slot
  <Stack.Toolbar.Button onPress={…}>           ← an item: one position in the slot
    <Stack.Toolbar.Icon sf="trash" />          ← a primitive: what this item draws
    <Stack.Toolbar.Label>Xoá</Stack.Toolbar.Label>
    <Stack.Toolbar.Badge>3</Stack.Toolbar.Badge>
  </Stack.Toolbar.Button>
  <Stack.Toolbar.Menu icon="ellipsis">         ← an item
    <Stack.Toolbar.MenuAction onPress={…}>Sao chép</Stack.Toolbar.MenuAction>
  </Stack.Toolbar.Menu>                        ← its entries live in the menu, not in the slot
</Stack.Toolbar>
```

The primitives are an **alternative to props, not an addition**: `icon="trash"` and
`<Stack.Toolbar.Icon sf="trash" />` set the same thing, and the child wins when both are present.

#### What an item can draw, per platform

Android renders an **image source and nothing else**. Every other kind of content is either ignored or
demoted to accessibility:

| Declared                                           | iOS draws                               | Android draws                          |
| -------------------------------------------------- | --------------------------------------- | -------------------------------------- |
| `icon="trash"` - `<Stack.Toolbar.Icon sf>`         | the SF Symbol                           | **nothing** — the item does not render |
| `icon={require('…')}` - `<Stack.Toolbar.Icon src>` | the image                               | the image                              |
| `<Stack.Toolbar.Icon xcasset="…">`                 | the asset-catalog image                 | **nothing**                            |
| text children - `<Stack.Toolbar.Label>`            | the text                                | **nothing**                            |
| `<Stack.Toolbar.Badge>`                            | the badge                               | the badge                              |
| `<Stack.Toolbar.View>`                             | our element, as a `customView` bar item | our element                            |

An item may carry an icon **and** a label. On iOS _"the label will not be shown and will be used for
accessibility purposes only"_. On Android a `Button` or `Menu` with no image source warns in development
and renders `null` — the item disappears entirely.

So one icon is **two declarations picked at build time**, and the two names are a pair we choose, not a
translation the API performs:

```tsx
import DeleteIcon from '@expo/material-symbols/delete.xml';
import { Platform } from 'react-native';

import type { ToolbarIcon } from '@/interfaces/navigation-interfaces';

<Stack.Toolbar.Button
  icon={Platform.select<ToolbarIcon>({ ios: 'trash', android: DeleteIcon })}
  accessibilityLabel="Xoá"
  onPress={handleDelete}
/>;
```

`trash` is the SF Symbol for iOS. Android's own format for a glyph
that tints and scales is the **XML vector drawable**. `@expo/material-symbols` ships Google's Material
Symbols in exactly that format, one Metro-asset subpath per icon.

**Only one of the two kinds of icon has colours of its own.** An SF Symbol is a **name the OS resolves** —
it carries a shape, and the system paints it. An image is a **file we ship**, and its colours are already
inside it. So only an image raises the question `iconRenderingMode` answers: _whose colours win, the
file's or the bar's?_

| `iconRenderingMode` | The image is treated as | Its colours                                        |
| ------------------- | ----------------------- | ---------------------------------------------------- |
| `'original'`        | a picture               | drawn as they are                                  |
| `'template'`        | a **stencil**           | discarded — only the shape survives, repainted flat |

`'template'` is what makes a glyph belong to the bar: the bar carries one tint, the back chevron follows
it, and a stencilled glyph follows it too. It is also what destroys a two-colour mark, which comes out
flattened into that single colour.

**Left off, the two platforms answer the question differently:**

| Platform    | Undeclared resolves to                              | Once `'template'`, repainted with                                |
| ----------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| **iOS**     | `'original'`, unless the item sets its own `tintColor` | that `tintColor`, else the bar's — `headerTintColor`             |
| **Android** | `'template'`                                          | the item's `tintColor`, else `headerTintColor`, else `onSurface` |

Read the two columns separately: `headerTintColor` never takes part in **choosing** the mode, but it is
what paints the result once the mode is `'template'`.

Whatever the icon is, on iOS 26 the item is drawn on the bar's shared Glass background
([iOS 26 — Liquid Glass](#ios-26--liquid-glass)).

#### What a menu is, per platform

One declaration, two native constructs — and neither platform produces a menu on its own, so
`Stack.Toolbar.Menu` is the **only** way one appears ([Not reachable](#not-reachable)):

|             | iOS                                                | Android                                    |
| ----------- | -------------------------------------------------- | ------------------------------------------ |
| the trigger | the `UIBarButtonItem`'s own `menu` property        | an `IconButton`                            |
| the menu    | `UIMenu`, presented by the system                  | a Material 3 `DropdownMenu`                |
| an entry    | `UIAction`                                         | a `DropdownMenuItem`                       |
| a submenu   | a nested `UIMenu`                                  | a nested `DropdownMenu`                    |
| `inline`    | the submenu's entries show in place, not collapsed | the entries show in place, after a divider |
| `isOn`      | a checkmark on the entry                           | a trailing checkmark on the entry          |

---

## In this codebase

Two tab bars — `personal/(tabs)` and `organization/[organizationId]/(tabs)` — holding **13 root screens**
between them, and **15 pushed routes**. Every root screen owns a Stack of its own; every pushed screen
belongs to the one shared Stack in `(protected)/_layout.tsx`.

```
app/(protected)/_layout.tsx                          Stack  ← the bar of every pushed screen
├── car-detail/[carId].tsx                           pushed
├── tour-detail/[tourId]/_layout.tsx                 pushed — a Slot, so its four sub-routes are one screen
├── … 13 more pushed routes
│
├── personal/(tabs)/_layout.tsx                      Tabs   headerShown: false
│   ├── (home)/_layout.tsx                           Stack  ← the index tab, in a route group
│   │   └── (home)/index.tsx                         root
│   ├── wage/_layout.tsx                             Stack  ← the bar of one root screen
│   │   └── wage/index.tsx                           root
│   └── … 3 more tabs, one Stack each
│
└── organization/[organizationId]/(tabs)/_layout.tsx Tabs   headerShown: false
    └── … 8 tabs, one Stack each
```

The index tab sits in a `(home)` route group because a folder cannot be named `index` and hold a layout.
The group is invisible in the URL, so `/personal` still resolves; only `<Tabs.Screen name="(home)">`
changes.

Both standard types are in use, and nothing else: a tab's `index` is a **root** header, everything pushed
from a tab is a **pushed** header. There is no third shape.

### Why a root screen needs a Stack of its own

A tab screen cannot borrow the enclosing Stack's bar. The composition components register their options
against the **current route key**. Written inside a `Tabs` screen, that key belongs to the tab route, and no route of the outer Stack matches
it, so the options are registered and never read — silently, with no warning. Nesting is the documented
answer: _"you can nest a `<Stack />` layout inside each tab to support headers and pushing screens."_

The tab's Stack holds exactly one screen today. That is not waste — it is what makes the tab's bar a real
`UINavigationBar` / `TopAppBar`, and it is where a screen pushed **inside** a tab would go if one is ever
wanted.

### The rung map

**Every one of the 28 screens is rung 1.** Rung 4 covers only what has no bar to configure: `login` and
`register` under `app/_layout.tsx`, the `(protected)/index.tsx` redirect, and the two tab-group screens
inside the protected Stack, whose bars belong to the tabs' own Stacks. Rungs 2 and 3 are unused.

### The two slots

**Leading is never declared.** It carries the back affordance on a pushed screen and nothing on a root
screen — no menu, no logo, no avatar, no owner switcher.

**Trailing takes the count, not a judgement.** How many actions the screen has decides the shape, and
that is the whole rule:

| Actions   | Shape                                                              |
| --------- | ------------------------------------------------------------------ |
| **1 – 2** | one `Stack.Toolbar.Button` each, straight in the bar               |
| **3 +**   | one `Stack.Toolbar.Menu`, holding every one of them as an entry    |

The threshold is 3 because neither platform overflows a crowded bar
([Not reachable](#not-reachable)) — the menu is our own overflow, and below three there is nothing to
overflow.

**A button in the bar shows no words.** `Stack.Toolbar.Button` draws its icon and nothing else — on iOS
the label is read only by VoiceOver, on Android it never reaches the screen
([What an item can draw](#what-an-item-can-draw-per-platform)). Two things follow, and both are
mandatory:

1. **Every button declares `accessibilityLabel`.** It is the only text the item has.
2. **A destructive action that fires on tap may not be a bare button** — give it a menu, or
   give it a confirmation.

```tsx
{can(PERMISSION_ACTION.DELETE, PERMISSION_RESOURCE.TRIP) && (
  <Stack.Toolbar placement="right">
    <Stack.Toolbar.Button
      icon={Platform.select<ToolbarIcon>({ ios: 'trash', android: DeleteIcon })}
      accessibilityLabel="Xoá"
      disabled={isDeletingTrip}
      onPress={handleDeleteTrip}
    />
  </Stack.Toolbar>
)}
```

**A gate goes at the level that cannot leave an empty group.** Which level that is depends on what else
is in the group:

| The group holds                             | Gate            |
| ------------------------------------------- | --------------- |
| only items sharing one condition            | the `Stack.Toolbar` |
| one item that always renders, plus a gated one | the gated **item**  |

`car-detail` is the first shape — one `Xoá`, gated with `can(DELETE, …)`, so the whole toolbar
disappears. `booking-detail` and `receipt-payment-detail` are the second — `Xem trước` and `Lưu & thoát`
always render, so only `Xoá` beside them carries the condition.

**No screen in this app reaches three actions**, so `Stack.Toolbar.Menu` is currently unused. What it
would look like, for the screen that first needs it:

```tsx
<Stack.Toolbar.Menu
  icon={Platform.select<ToolbarIcon>({ ios: 'ellipsis', android: MoreVertIcon })}
>
  <Stack.Toolbar.MenuAction
    icon={Platform.select<ToolbarIcon>({ ios: 'trash', android: DeleteIcon })}
    destructive
    onPress={handleDelete}
  >
    Xoá
  </Stack.Toolbar.MenuAction>
</Stack.Toolbar.Menu>
```

A menu differs from a button in one way that matters: **an entry draws its label, a bar button never
does**. The rest is per-platform detail:

| In the block above          | iOS                                                | Android                                                |
| --------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| the trigger's `icon`        | `ellipsis` — three dots lying down, no enclosure   | `more_vert` — the same three dots standing up          |
| an entry's `icon`           | an SF Symbol or an image, drawn beside the label   | an image only — an SF Symbol is silently dropped       |
| an entry's `destructive`    | the label turns red                                | label and icon turn `Color.android.material.error`     |
| the trigger's `destructive` | marks the whole menu destructive                   | **ignored** — that prop is iOS-only                    |

The two triggers are only a convention pair, because iOS has no vertical three-dot symbol and Android's
`more_vert` is vertical by definition.

**No spinner, ever.** Neither `Stack.Toolbar.Button` nor `Stack.Toolbar.MenuAction` has a loading state,
so a mutating action sets `disabled` and the global loader (`useNavigationStore`) covers the wait.

### Where it lives

There is no header component, no header hook and no header store. Four artefacts, at nested scopes:

| Scope                | Artefact                    | File                                       | Sets                                                        |
| -------------------- | --------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| all 14 Stacks        | `STACK_SCREEN_OPTIONS`      | `constants/app-constants.ts`               | the bar chrome — colour, tint, font, alignment, back mode   |
| the 13 tabs          | `SCREEN_TITLES`             | `constants/app-constants.ts`               | the one string a tab's label and its header title both read |
| every toolbar icon   | `ToolbarIcon`               | `interfaces/navigation-interfaces.ts`      | the `Platform.select` generic a branching icon needs        |
| one Stack            | that Stack's `_layout.tsx`  | `app/(protected)/`, `app/…/(tabs)/<tab>/`  | which screens exist, and each one's base title              |
| one screen's actions | `<name>-screen-content.tsx` | `components/<domain>/screen-contents/`     | `Stack.Toolbar`, and `Stack.Title` when derived             |

`SCREEN_TITLES` exists because a tab is named twice, in two navigators that cannot read each other:
`Tabs.Screen` sets the label under the icon, the tab's own `Stack.Screen` sets the title in the bar. Both
read the same key, so the two can never drift and a rename is one edit.

### Base title in the layout, real title in the screen

| The value is                                        | Declared as                         | Where                      |
| --------------------------------------------------- | ----------------------------------- | -------------------------- |
| fixed — "Chi tiết xe", "Hoá đơn"                    | `options={{ title }}`               | that Stack's `_layout.tsx` |
| read from data — a member's name, an invoice's type | `<Stack.Title>`                     | the `*-screen-content.tsx` |
| the trailing actions — always                       | `<Stack.Toolbar placement="right">` | the `*-screen-content.tsx` |

A screen with a derived title is declared **in both files, on purpose**: the layout's `title` is the base
the bar shows while the content is suspended, and the content's `<Stack.Title>` overrides it on mount
([Which declaration wins](#which-declaration-wins)).

Two corollaries. **A Suspense fallback never declares a header** — `EntityDetailSkeleton` and
`EntityListSectionSkeleton` render in place of the screen, so a title declared there would belong to a
screen that has none of its own. And **trailing actions never sit in a layout**: they need the mutation
handlers, the `isDeleting` flag and the `can()` check from
[UI Action Gating](UI-ACTION-GATING-PATTERN.md), all of which live in the content. One file looks like an
exception and is not: `tour-detail/[tourId]/_layout.tsx` renders a `Slot`, so it **is** that screen's
content, not a layout above it.

### The screen map

Every route in the app, and the header it carries. `†` marks a title read from data, so it is declared as
`<Stack.Title>` in the screen content and the layout's `title` is only its suspended-state base.

**No bar — rung 4.**

| Route                    | Declared in            | Why                            |
| ------------------------ | ---------------------- | ------------------------------ |
| `login`                  | `app/_layout.tsx`      | sign-in owns the viewport      |
| `register`               | `app/_layout.tsx`      | sign-up owns the viewport      |
| `(protected)/index`      | `(protected)/_layout.tsx` | a `Redirect` — it has no UI |
| `personal/(tabs)`        | `(protected)/_layout.tsx` | the tab's own Stack draws the bar |
| `organization/[organizationId]` | `(protected)/_layout.tsx` | the tab's own Stack draws the bar |

**Root — the header title is the tab's own label,** both read from `SCREEN_TITLES`. Every "create" button is
gated with `can(CREATE, <resource>)`; **the leading slot is empty on all thirteen.**

| Tab route                                        | Title     | Trailing                                  |
| ------------------------------------------------ | --------- | ----------------------------------------- |
| `personal/(tabs)/(home)`                         | Trang chủ | —                                         |
| `personal/(tabs)/wage`                           | Tiền công | Tạo tiền công                             |
| `personal/(tabs)/project`                        | Dự án     | Tạo dự án                                 |
| `personal/(tabs)/calendar`                       | Lịch      | —                                         |
| `personal/(tabs)/profile`                        | Cá nhân   | —                                         |
| `organization/[organizationId]/(tabs)/(home)`    | Trang chủ | —                                         |
| `organization/[organizationId]/(tabs)/invoice`   | Hoá đơn   | Tạo hoá đơn                               |
| `organization/[organizationId]/(tabs)/project`   | Dự án     | Tạo dự án                                 |
| `organization/[organizationId]/(tabs)/tour`      | Tour      | Tạo tour                                  |
| `organization/[organizationId]/(tabs)/booking`   | Booking   | Tạo booking                               |
| `organization/[organizationId]/(tabs)/car`       | Xe        | Tạo xe or Tạo chuyến, per the body segment |
| `organization/[organizationId]/(tabs)/attendance`| Chấm công | Quản lý chấm công                         |
| `organization/[organizationId]/(tabs)/profile`   | Tổ chức   | —                                         |

Twelve of the thirteen are on a tab bar; `organization/…/project` carries `href: null` and is reached from
the utility list in the body of `organization/…/profile`. It is still a root screen — a title, and no back
affordance. Both `profile` tabs hold the owner switcher in their body, which is what makes them the way
out of an organisation.

**Pushed** — all fifteen live in the `(protected)` Stack, so all fifteen get the back affordance with
nothing to declare. None reaches three actions, so every one of them is bare buttons and no screen holds
a menu. `Xoá` is gated with `can(DELETE, …)` where the resource is permissioned, and there the whole
`Stack.Toolbar` disappears with it.

| Route                                                          | Title                                  | Trailing    |
| -------------------------------------------------------------- | -------------------------------------- | ----------- |
| `attendance-management/index`                                  | Quản lý chấm công                      | —           |
| `attendance-management/[organizationMemberId]`                 | the member's name †                    | —           |
| `booking-detail/[bookingId]/index`                             | Chi tiết Booking                       | Xem trước, Xoá |
| `booking-detail/[bookingId]/booking-detail-preview`            | Xem trước Booking                      | PDF         |
| `car-detail/[carId]`                                           | Chi tiết xe                            | Xoá         |
| `car-maintenance-log/index`                                    | Nhật ký bảo trì                        | Tạo bản ghi |
| `invoice-detail/[invoiceId]`                                   | Chi tiết + the invoice type †          | Xoá         |
| `project-detail/[projectId]`                                   | Chi tiết Dự án, or + the category †    | Xoá         |
| `receipt-payment-detail/[receiptPaymentId]`                    | Sửa Thu Chi / Tạo Thu Chi †            | Lưu, Xoá    |
| `tour-calculation-cancel-log-detail/[tourCalculationCancelLogId]` | Chi tiết Nhật ký                    | PDF, Excel  |
| `tour-detail/[tourId]`                                         | Quản lý Tour                           | Xoá         |
| `tour-settlement-cancel-log-detail/[tourSettlementCancelLogId]`| Chi tiết Nhật ký                       | PDF, Excel  |
| `trip-detail/[tripId]/index`                                   | Chi tiết chuyến                        | Xoá         |
| `trip-detail/[tripId]/trip-cost`                               | Thu chi chuyến xe                      | —           |
| `wage-detail/[wageId]`                                         | Chi tiết Tiền công                     | Xoá         |

Two routes are not what their file count suggests:

- **`tour-detail/[tourId]` is one screen, not four.** Its `_layout.tsx` renders a `Slot`, so `index`,
  `tour-calculation`, `tour-implementation` and `tour-settlement` swap inside one Stack route and share one
  header. The strip that switches between them is body content.
- **`project-detail/[projectId]` is one route serving two screen contents** — organisation and personal.
  Each declares its own title, so the route file stays a boundary and neither content knows about the other.

### Header icons

**Every item in the bar is a `Stack.Toolbar.Button` or a `Stack.Toolbar.Menu`, never a
`Stack.Toolbar.View`.** That makes Android's image-source requirement
([What an item can draw](#what-an-item-can-draw-per-platform)) unavoidable: every icon in the bar needs a
file or a symbol name, and this is where each one comes from.

| Icon                                         | Android                                           | iOS                         |
| -------------------------------------------- | ------------------------------------------------- | --------------------------- |
| a shared convention — delete, ⋮, search, PDF | `@expo/material-symbols` — an XML vector drawable | the SF Symbol closest to it |
| a VinaUp mark — Lưu & thoát, Thêm mới        | a **PNG** in `src/assets/images/`                 | the **same PNG**            |

One rule per row.

**A shared convention branches at build time** written with `Platform.select<ToolbarIcon>`
([What an item can draw](#what-an-item-can-draw-per-platform)).

| Mark          | Is                          | Mode         | Because                                                                             |
| ------------- | --------------------------- | ------------ | ------------------------------------------------------------------------------------- |
| `Lưu & thoát` | a single-colour glyph       | `"template"` | it is a symbol, like `trash` or `plus` — it belongs to the bar and follows its tint  |
| `Thêm mới`    | a two-colour brand badge    | `"original"` | a stencil would flatten the yellow glyph into the teal disc                         |

```tsx
// a glyph — the bar owns its colour
<Stack.Toolbar.Button
  icon={require('@/assets/images/save_and_exit.png')}
  iconRenderingMode="template"
  accessibilityLabel="Lưu & thoát"
  onPress={handleSaveAndExit}
/>

// a mark — the file owns its colours
<Stack.Toolbar.Button
  icon={require('@/assets/images/add_new.png')}
  iconRenderingMode="original"
  accessibilityLabel="Tạo hoá đơn"
  onPress={handleAddNew}
/>
```

**`"template"` carries no `tintColor` of its own.** An item that sets none inherits the bar's, and that is
`headerTintColor` on both platforms or `navigationBar.tintColor` on iOS. One value, declared once in `STACK_SCREEN_OPTIONS`, reaching both.

**`variant` stays `'plain'` on every item.** A VinaUp mark carries its own background where one is wanted,
so the bar never has to draw a tinted one.

---

## Why

1. **The navigator renders the bar.** Back state, safe area, bar height and the title transition are
   platform behaviour; hand-drawing the bar silently forfeits them.
2. **The rung is the decision.** Naming how far a screen departs from the platform bar makes the cost of
   departing visible, and keeps the answer the same for two people scaffolding two screens.
3. **Root and pushed are the only shapes.** Both platforms derive the header from whether the screen can go
   back, so the structure is never a choice.
4. **One option, one site — except where the merge makes two safe.** Composition beats options by a fixed
   merge, not by render order ([Which declaration wins](#which-declaration-wins)), so a layout's
   `title` is a base and a screen's `Stack.Title` is the override. Two `Stack.Title`s inside one screen are
   still a bug: there the last one registered wins and the file we are reading may not be the one in effect.
5. **The leading slot stays the back affordance.** Not a preference — custom leading items **evict** the back
   button on both platforms ([Native header actions](#native-header-actions)). A root header leaves it empty
   rather than spending it on a control that belongs to the app, not to the screen.
6. **The count decides the shape.** No platform imposes a limit and no overflow mechanism is reachable
   from our code paths ([Not reachable](#not-reachable)), so a crowded bar will not rescue itself and we
   draw the line ourselves. Below three, a menu would only bury one or two glyphs behind another glyph
   and charge a tap for it; at three the row stops being readable at phone width and the menu, which
   names every action it holds, earns that tap. One threshold, no per-action argument.
7. **The bar carries actions, the body carries controls.** A filter, a segment, a cross-link and a tab strip
   all belong to what is being shown, so they scroll with it. Putting them in the bar is what turned the
   previous header into a `switch` on `pathname`.
8. **Every bar item is a `Button` or a `Menu`.** The press behaviour people read as "native" comes from the
   platform's own control, and `Stack.Toolbar.View` is not one ([Header icons](#header-icons)).
9. **One title presentation.** iOS can draw the title two ways and Android one. Taking the second drawing
   buys an effect one platform cannot mirror, and pulls the bar's surface and a per-screen layout rule
   along with it ([The two title presentations](#the-two-title-presentations)).

→ [SoC](../principle/SOC.md), [KISS](../principle/KISS.md), [DRY](../principle/DRY.md)

## How

1. **Never render a header bar ourselves.** No `header: () => …`, no `navigation.setOptions({ header })`, no
   `headerLeft` / `headerRight` holding JSX, and no bar-shaped `<View>` at the top of a screen body.
2. **Start at rung 1 and stay there.** Rung 2 needs a reason written in this file first.
3. **Chrome lives in `STACK_SCREEN_OPTIONS`,** applied once per Stack, never re-declared per screen — no
   per-screen `styles` escape hatch. Keep `headerTitleAlign: 'center'` — a no-op on iOS, the only way Android
   centres. Leave the large presentation off
   ([The title presentation in Expo Router](#the-title-presentation-in-expo-router)). Deleting an entry does
   not hand the bar back to the system, only to Expo Router's light theme
   ([The chrome options](#the-chrome-options)).
4. **Base title in the layout; derived title in the screen; trailing actions always in the screen.** A
   Suspense fallback declares nothing. A tab's title is a `SCREEN_TITLES` key, never a literal — the tab bar
   reads the same one.
5. **Leave the leading slot to back.** A root header leaves it empty — no menu, no logo, no avatar, no
   owner switcher.
6. **Count the actions: one or two are buttons, three or more become one menu.** Nothing else decides the
   shape, and a menu never holds fewer than three.
7. **Every button declares `accessibilityLabel`, and every destructive one confirms first.** A bar button
   shows no text, so the label is all it has and the confirmation is what makes a bare `Xoá` safe. Put a
   gate where it cannot leave an empty group — the whole `Stack.Toolbar` when every item shares the
   condition, the item itself when a sibling always renders.
8. **A mutating item is `disabled`, never a spinner** — `Button` and `MenuAction` both take it. The
   global loader covers the wait.
9. **Conventional icons branch on `Platform.select<ToolbarIcon>` imported straight from `react-native`;
   VinaUp PNGs do not branch at all.** A multi-colour mark declares `iconRenderingMode="original"`, a
   single-colour one does not.
10. **`Tabs` keeps `headerShown: false`** so each tab's Stack draws the only bar.
11. **One `StatusBar`, at the root; no item ever declares `hidesSharedBackground` or
    `separateBackground`.** Both follow from the chrome, and are not per-screen choices
    ([iOS 26](#ios-26--liquid-glass)).

## Adding a screen

1. **Root or pushed?** Root → a new folder under that `(tabs)` group, with a `_layout.tsx` holding a
   one-screen `Stack` and an `index.tsx`; wrap it in a route group if the tab is the group's `index`.
   Pushed → a route file under `app/(protected)/`, and the Stack already there gives it a back button with
   nothing to configure.
2. **Title.** Fixed → one `options={{ title }}` line in that Stack's `_layout.tsx`. For a root screen that
   line is a `SCREEN_TITLES` key, and the tab's `Tabs.Screen` reads the same one. Read from data → the layout's
   line stays as the suspended-state base, and the screen content adds `<Stack.Title>`.
3. **Trailing.** Count the actions: none, one or two `Stack.Toolbar.Button`s, or one
   `Stack.Toolbar.Menu` from three up. Declared in the screen content, each with an
   `accessibilityLabel`, gated with `can()` where the action is permissioned — gate the enclosing
   `Stack.Toolbar`, not the item. A destructive action confirms before it fires.
4. **Icons.** A shared convention → `@expo/material-symbols` plus the closest SF Symbol. A VinaUp mark → a
   PNG in `src/assets/images/`, with `iconRenderingMode="original"` if it is multi-colour.
5. **Everything else goes in the body** — filters, segments, cross-links, tab strips, counts, captions.

## References (official)

**Platform**

- [Toolbars - Apple HIG](https://developer.apple.com/design/human-interface-guidelines/toolbars) — the current page for both bars; `…/navigation-bars` `301`s here. Source of the overcrowding, macOS/iPadOS-only auto-overflow, and iOS "create a More menu" quotes
- [Menus - Apple HIG](https://developer.apple.com/design/human-interface-guidelines/menus) — when an action becomes a menu
- [`UINavigationItem` - UIKit](https://developer.apple.com/documentation/uikit/uinavigationitem) — `title`, `titleView`, `largeTitleDisplayMode`, `backButtonDisplayMode`; `leftBarButtonItems` / `rightBarButtonItems` are **arrays**, not single slots
- [`UIBarButtonItem` - UIKit](https://developer.apple.com/documentation/uikit/uibarbuttonitem) — one action: the initializers that fix its content, `customView`, `menu`, `style`, `badge`. Its `title` and `image` are inherited from [`UIBarItem`](https://developer.apple.com/documentation/uikit/uibaritem), which documents each on its own and neither against the other
- [`hidesSharedBackground` - UIKit](https://developer.apple.com/documentation/uikit/uibarbuttonitem/hidessharedbackground) — iOS 26+: the bar draws a _"standard shared background (typically using the Glass effect)"_ behind its items, and the default is not to hide it
- [`additionalOverflowItems` - UIKit](https://developer.apple.com/documentation/uikit/uinavigationitem/additionaloverflowitems) — iOS 16+; the opt-in overflow button, and the system filling it with items that don't fit
- [`leftItemsSupplementBackButton` - UIKit](https://developer.apple.com/documentation/uikit/uinavigationitem/leftitemssupplementbackbutton) — custom leading items remove the Back button unless this is set
- [`largeTitleDisplayMode` - UIKit](https://developer.apple.com/documentation/uikit/uinavigationitem/largetitledisplaymode) — `.automatic` / `.always` / `.never`, per screen
- [`prefersLargeTitles` - UIKit](https://developer.apple.com/documentation/uikit/uinavigationbar/preferslargetitles) — the bar-level switch the per-screen mode depends on
- [Explore navigation design for iOS - WWDC22](https://developer.apple.com/videos/play/wwdc2022/10001/) — where a large title belongs, and its collapse
- [Top app bar - Material 3](https://m3.material.io/components/app-bars/guidelines) — the four types and their slots; **medium** and **large** are the ones with collapsing titles
- [App bars - Jetpack Compose](https://developer.android.com/develop/ui/compose/components/app-bars) — the four top app bar types, `navigationIcon` / `title` / `actions`, scroll behaviour
- [`AppBar.kt` - androidx](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AppBar.kt) — `TopAppBar`'s signature and KDoc: `navigationIcon: @Composable () -> Unit`, `actions: @Composable RowScope.() -> Unit`, _"The default layout here is a `Row`"_, and the `subtitle` overload
- [Floating action buttons - Material 3](https://m3.material.io/components/floating-action-button/guidelines) — _"FABs help people take primary actions… Provide only one action at a time at this level"_: on Android the primary action is a FAB, not a top-app-bar action
- [Build a UIKit app with the new design - WWDC25](https://developer.apple.com/videos/play/wwdc2025/284/) — iOS 26 bars: _"To tint the button background, set the style to prominent"_, and which items get separate backgrounds
- [Creating custom symbol images for your app - UIKit](https://developer.apple.com/documentation/uikit/creating-custom-symbol-images-for-your-app) - [Create custom symbols - WWDC21](https://developer.apple.com/videos/play/wwdc2021/10250/) — the SVG template, _"use the Export Symbol option to make sure you get all the features that a full custom symbol provides"_, and `UIImage(named:)` resolving a symbol before a plain image
- [TN3106: Customizing the appearance of `UINavigationBar` - Apple](https://developer.apple.com/documentation/technotes/tn3106-customizing-uinavigationbar-appearance) — the three `configureWith…Background` methods, and the 2025-09-03 revision: _"Starting in iOS 26, reduce your use of custom backgrounds in navigation elements and controls"_
- [Adopting Liquid Glass - Apple](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass) — what the material is and where the system already applies it

**Framework**

- [Stack - Expo Router](https://docs.expo.dev/router/advanced/stack/) — the full header options table, the composition API, and the custom-header caveat
- [Large title does not collapse when scrolling - Expo Router](https://docs.expo.dev/router/advanced/stack/#large-title-does-not-collapse-when-scrolling) — the direct-first-child requirement
- [Tabs - Expo Router](https://docs.expo.dev/router/advanced/tabs/)
- [Nesting navigators - Expo Router](https://docs.expo.dev/router/advanced/nesting-navigators/) — a Stack inside each tab
- [Stack Toolbar - Expo Router](https://docs.expo.dev/router/advanced/stack-toolbar/) — `Stack.Toolbar` and its children; Android from SDK 56, iOS from SDK 55. No item limit and no overflow behaviour is documented, because there is none
- [Router Stack API - Expo Router](https://docs.expo.dev/versions/latest/sdk/router/stack) — the per-prop reference for `Stack.Toolbar.*`: `icon` is `ImageSourcePropType | SFSymbol`, _"On Android, only image sources are supported"_, and _"When icon is used, the label will not be shown and will be used for accessibility purposes only"_
- [`@expo/material-symbols`](https://github.com/expo/material-symbols) — Material Symbols as Android XML vector drawables, one Metro-asset subpath per icon
- [Tree shaking and code removal - Expo](https://docs.expo.dev/guides/tree-shaking/) — why an icon branches on `Platform` and not on `process.env.EXPO_OS`: _"Any code that is used conditionally based on the `Platform` module from react-native is removed from the other platforms"_, only where _"`Platform.select` and `Platform.OS` are directly imported from react-native in each file"_, and _"`process.env.EXPO_OS` … does not support platform shaking imports"_
- [Platform-specific code - React Native](https://reactnative.dev/docs/platform-specific-code) — `Platform.OS` / `Platform.select` for _"when only small parts of a component are platform-specific"_, and a `.ios.` / `.android.` file _"when your platform-specific code is more complex"_
- [`react-native-screens`](https://github.com/software-mansion/react-native-screens) — the native header binding behind the Stack, and Expo Router's only navigation dependency
- [Expo Router v56: Decoupling from React Navigation - Expo blog](https://expo.dev/blog/expo-router-v56-decoupling-from-react-navigation) — why the navigator now lives **inside** `expo-router`. `@react-navigation/*` is not a dependency and application code never imports it; `reactnavigation.org` documents a different package and is not the reference for these options
- [Continuous Native Generation - Expo](https://docs.expo.dev/workflow/continuous-native-generation/) — why `/ios` and `/android` are gitignored here, and why anything in an asset catalog needs a config plugin
- [Color themes - Expo](https://docs.expo.dev/develop/user-interface/color-themes/) — `userInterfaceStyle`: `automatic` _"Follow system appearance settings"_, `light` _"Restrict the app to support light theme only"_; and `useColorScheme`
- [System bars - Expo](https://docs.expo.dev/develop/user-interface/system-bars/) — the status bar under edge-to-edge
- [`StatusBar` - React Native](https://reactnative.dev/docs/statusbar) — `'dark-content'` / `'light-content'`; _"the props will be merged in the order the `StatusBar` components were mounted"_; and both `backgroundColor` and `translucent` _"deprecated in API level 35 … will have no effect"_
- [Adopt `configureWithDefaultBackground` … - react-native-screens #4021](https://github.com/software-mansion/react-native-screens/discussions/4021) — why a Stack header cannot render the iOS 26 Liquid Glass material; open

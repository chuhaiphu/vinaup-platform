# Tag-Based Cache Invalidation Pattern

How caching answers its hardest question: _after a write, which cached reads are now stale — and how do we refresh exactly those?_

## What

### The problem caching creates

A read is cached under some **identity** so it fires once and is shared: two reads with the same identity return the same in-flight/settled result instead of hitting the network twice. The moment we cache, we inherit **staleness** — a write elsewhere can make a cached entry wrong, and the next reader of that identity serves the outdated copy.

Every idea below exists to answer one question:

> After a write, _which_ cached reads are now stale, and how do we refresh exactly those — no more, no less?

Two independent identifiers answer that question, on two different axes: a **cache key** (which read is this?) and a **tag** (what kind of data is this?).

### What a cache key is

A **cache key** is a read's **identity**: the string that encodes exactly the inputs that make the read distinct.

```
trip-42          // one specific trip
car-list         // the full car list
car-list-org-7   // the car list scoped to one organization
```

A cache key is the unit of **caching**: one key ↔ one cached result.

### What a tag is

A cache key answers "_which_ read is this?". But a **writer** performing a mutation has a blind spot: it does not know which keys happen to be cached right now. A single "create assignment" call cannot know that `assignment-list-in-trip-42` and `car-list` are mounted at this moment.

A **tag** bridges that gap. A tag is a **name for a kind of data**:

- a **read** declares the tags it belongs to,
- a **write** declares the tags it invalidates,
- the machinery translates a write's tags back into the concrete cache keys to refresh or evict.

A tag is the unit of **invalidation**: one tag ↔ many keys.

### The three shapes of a tag

Tags come in three sizes, told apart by _how much_ they name. These names are the common vocabulary; the string forms are just a convention.

| Shape          | Names…                              | Conventional form                     | Example                  |
| -------------- | ----------------------------------- | ------------------------------------- | ------------------------ |
| **Collection** | every record of a kind              | `<entity>-list` (static, no id)       | `book-list`              |
| **Record**     | one specific record                 | `<entity>-<id>`                       | `book-42`                |
| **Child-list** | a list of children under one parent | `<child>-list-in-<parent>-<parentId>` | `review-list-in-book-42` |

- **Collection** — the group every record of a kind shares. The full-list read carries it, and every create / update / delete of that kind emits it, so one write refreshes every mounted list at once.
- **Record** — the narrow one. Only reads _about that single record_ carry it, so a write can refresh exactly one row without disturbing its siblings.
- **Child-list** — a collection _scoped to one parent_: "the reviews of book 42", not "all reviews". A write under that parent refreshes only that sublist.

The collection tag is the umbrella; the record tags live under it:

```
book-list ─┬─ book-42
           ├─ book-77
           └─ book-91
```

So a read usually declares **two** tags — its **record** (or **child-list**) tag for a surgical refresh, plus the **collection** tag for a group refresh. `[book-42, book-list]`.

### Two identifiers, two axes

The whole pattern rests on not conflating these:

|                 | Cache key                                  | Tag                                            |
| --------------- | ------------------------------------------ | ---------------------------------------------- |
| **Answers**     | "_which_ data is this?"                    | "_what kind_ of data is this?"                 |
| **Granularity** | one specific read                          | a group of reads                               |
| **Role**        | unit of **caching** (one key ↔ one result) | unit of **invalidation** (one tag ↔ many keys) |
| **Declared by** | every read                                 | reads _and_ writes                             |
| **Example**     | `car-7`                                    | `car-list`                                     |

A write invalidates **tags**; the cache evicts **keys**. The machinery is the translator in between. The relationship is many-to-many:

- **One tag → many keys.** The collection tag `car-list` covers every read that declares it — the full-list read _and_ each single-car read `car-7`, `car-9`, ….
- **One key → many tags.** A single-car read may declare `[car-7, car-list]` — that one key belongs to its record group and the collection group at once.

### What an invalidation must actually do

A write's tag can name reads in **two different populations**, and correctness needs both handled:

| Population                        | What must happen    | If skipped                                                |
| --------------------------------- | ------------------- | --------------------------------------------------------- |
| Readers **currently mounted**     | **refresh now**     | a visible list keeps showing old data                     |
| Readers **not currently mounted** | **evict the cache** | re-mounting that screen later reuses a stale cached entry |

Keep the two straight: one keeps live UI correct _now_, the other keeps the cache correct for _later_. A single invalidate call has to cover both.

### How a read and a write find each other

A write doesn't know which screens are open right now. A read doesn't know what will be edited later. So how can a write refresh a screen it can't even see?

They agree on a shared name up front — the **collection tag** (`car-list`):

- every screen that **shows** a car listens to `car-list`;
- every write that **changes** a car shouts `car-list`.

Neither side knows the other, but they meet on that name. That's the whole trick.

So each side only has to answer one easy question about itself:

- a **read** asks: _"what kinds of data are on my screen?"_ → listen to each one's `-list` tag.
- a **write** asks: _"what screens show the thing I just changed?"_ → shout each one's `-list` tag.

---

### In this codebase

The library is [`fetchwire`](../../package.json): reads go through `useFetch` / `useFetchFn` / `prefetch`, writes through `useMutationFn`. Each takes a `fetchKey` and `tags` / `invalidatesTags`.

**One registry.** Every tag lives in one file — [`src/constants/fetch-tag-constants.ts`](../../src/constants/fetch-tag-constants.ts) — and is spoken through `FETCH_TAG.*`. Each entry is one of the [three shapes](#the-three-shapes-of-a-tag) above; Rule 2 lists the concrete `FETCH_TAG` forms.

**A read declares its identity + the groups it belongs to** — `CarDetailProvider`:

```ts
useFetch(() => getCarById(carId), {
  fetchKey: `organization-car-${carId}`, // identity: this one car — stays inline
  tags: [FETCH_TAG.carByCarId(carId), FETCH_TAG.carList], // groups: its record tag + the collection tag
});
```

**A write declares what it invalidates** — same provider:

```ts
useMutationFn(fn, { invalidatesTags: [...getCarRippleTags(), FETCH_TAG.carByCarId(carId)] }); // update: collection + this record
useMutationFn(fn, { invalidatesTags: getCarRippleTags() }); // create/delete: collection only
```

**`prefetch` warms a key before it is mounted** — `organization-car-list-content.tsx`, on row press before navigating:

```ts
// Warm the SAME fetchKey the detail provider will mount, so the detail
// screen reuses the ready entry instead of firing the request again.
await prefetch(() => getCarById(id), { fetchKey: `organization-car-${id}` });
```

**Invalidate at the dependency boundary, in BOTH directions.**
A write must emit every tag whose fetched response **embeds or derives from** the written entity — not only that entity's own tag.
The signal is a field on a response/meta that carries a _copy_ of, or a _value derived from_, another entity:

```ts
interface TripAssignmentResponse {
  car: CarResponse | null; /* … */
} // embeds a full car
interface TripAssignmentMeta {
  carConflictingTrips: ConflictingTrip[];
} // derived from OTHER trips' dates
```

- Editing a **car** ⇒ its copy inside the assignment list is stale ⇒ the car writer must emit `tripAssignmentList`.
- Editing/deleting a **trip** ⇒ the other assignments' conflicts derived from will shift ⇒ the trip writer must emit `tripAssignmentList`.
- The **trip list** card also embeds each assignment's cars + drivers (`trip.tripAssignments`), so both the car writer and the trip-assignment writer additionally emit `tripList` — a one-way dependency on top of the symmetric car ↔ tripAssignment pair.

```ts
export const getCarRippleTags = (): string[] => [
  FETCH_TAG.carList,
  FETCH_TAG.tripAssignmentList,
  FETCH_TAG.tripList,
];
export const getTripAssignmentRippleTags = (): string[] => [
  FETCH_TAG.tripAssignmentList,
  FETCH_TAG.carList,
  FETCH_TAG.tripList,
];
```

Every ripple set is a **function** named `get<Entity>RippleTags`; one scoped to a parent takes that id as an argument:

```ts
export const getBookingRippleTags = (tourImplementationId?: string | null) => [
  FETCH_TAG.bookingList,
  ...(tourImplementationId ? [FETCH_TAG.bookingListInTourImplementationByTourImplementationId(tourImplementationId)] : []),
];
```

---

## Why

- **Why a registry, not inline literals.** Tag drift is uniquely nasty because it is **silent**: a mistyped tag is still a valid string, so there is no compile error and no runtime error — the read simply never matches and the UI shows stale data. Routing every provide and every invalidate through the same `FETCH_TAG.*` function means they cannot drift out of sync.
- **Why a write invalidates more than the edited record.** Emitting only the record's own tag (`FETCH_TAG.carByCarId(id)`) refreshes the open detail but leaves every other screen that copied that car stale — the car's name is still wrong in the assignment list. A screen is only as fresh as the data it copies, so the write must also shout the collection tag that those screens listen to (Rule 4). Missing this was the source of two real stale-name bugs.
- **Why `fetchKey` stays inline but `tags` are centralized.** A `fetchKey` is a _private_ cache identity used at exactly one call-site — nothing else references it, so centralizing it buys nothing. A `tag` is a _shared_ vocabulary spoken by readers and writers in different files — it only works if both sides name it identically, which is exactly what the registry guarantees.

---

## How

### Rule 1 — Tags from the registry, never a literal at a call-site

All `tags` / `invalidatesTags` come from `FETCH_TAG.*` and the `get*RippleTags` exports in [`@/constants/fetch-tag-constants`](../../src/constants/fetch-tag-constants.ts). A raw string at a call-site is a bug waiting to drift.

### Rule 2 — What tags a read lists

A read picks its **own tag** from these three shapes:

| Shape             | Form                                      | Meaning                       | Example                                 |
| ----------------- | ----------------------------------------- | ----------------------------- | --------------------------------------- |
| **A. Collection** | `<entity>-list` (static, no id)           | every record of an entity     | `FETCH_TAG.carList`                      |
| **B. Record**     | `<entity>-${id}`                          | one specific record           | `FETCH_TAG.carByCarId(carId)`                   |
| **C. Child-list** | `<resource>-list-in-<parent>-${parentId}` | a child list under one parent | `FETCH_TAG.receiptPaymentListInTripByTripId(id)` |

Then it adds the **`-list` tag of anything else on the screen that a _different_ write could change** — so that write can reach it.

Most reads only need their own tag. Add a second tag only when the screen shows a value that gets edited somewhere else.

```ts
// Car detail also shows the car's status, and assigning the car to a trip
// (a different screen) changes that status. So it listens to carList too:
tags: [FETCH_TAG.carByCarId(carId), FETCH_TAG.carList];

// Trip detail shows nothing that another entity's write changes → own tag only:
tags: [FETCH_TAG.tripByTripId(tripId)];
```

Rule of thumb: **if a value on our screen can be edited on another screen, list that value's `-list` tag.**

### Rule 3 — Prefix by scope

Org-scoped state is prefixed `organization-`, personal-scoped state `personal-`. The one deliberate exception is `receipt-payment-list-in-project` — **cross-scope** (used by both org and personal project screens), so it carries no prefix.

### Rule 4 — A write refreshes every screen that shows what it changed

This tells us exactly which tags a write lists. It comes from one plain fact:

> **A screen is only as fresh as the data it copies — change that data anywhere, and the screen must refresh.**

Said from each side:

> **A write to X must refresh every screen whose data embeds or derives from X — not just X's own screen.**
> The read side is the same fact: **a screen lists a tag for every kind of data it shows**, not only the entity it is "about".

We don't guess this — we can see it right in the response type. Two shapes are the signal:

| Signal     | What it looks like                                                            | Why it goes stale                                         |
| ---------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Embed**  | `xxx: XxxResponse` (also `Xxx[]`, `Pick<XxxResponse, …>`)                     | a nested **copy** of X — outdated the moment X is written |
| **Derive** | a scalar/aggregate computed from X's records (count, status, conflict window) | recomputes when X's underlying set changes                |

```ts
interface BookResponse {
  id;
  title;
  author: AuthorResponse;
} // embeds author  → a book fetch depends on Author
interface AuthorResponse {
  id;
  name;
  bookCount: number;
} // derives a count → an author fetch depends on Book
```

Both dependencies exist here, so both writes ripple — this is why a ripple set is symmetric per pair:

- write a **book** → the author's `bookCount` is stale → invalidate the **author** collection;
- write an **author** → its embedded copy in every book is stale → invalidate the **book** collection.

In this codebase each such pair is encoded once as a `get*RippleTags` export (`getCarRippleTags` / `getTripAssignmentRippleTags` above).

So, spelled out by operation, a write lists:

- **create / delete** → the entity's `-list` **and** the `-list` of anything that shows it — this is `getXRippleTags()`;
- **update** → the same, **plus** the record tag (`FETCH_TAG.carByCarId(id)`) so the open detail refreshes too.

**A name we display counts too.** The booking screen shows the customer's name (`booking.organizationCustomer.name`). Rename that customer, and the booking still shows the old name — unless renaming a customer also shouts `bookingList`. If our screen _shows_ a value from another entity, that value is a dependency, even when it looks like a fixed reference.

### Rule 5 — Reusable cross-entity sets live in the registry

A _reusable_ cross-entity tag set is always a `get*RippleTags` export — never assembled locally in a provider. A _one-off_ operation may still compose registry pieces inline (e.g. `booking sign` = `[...getBookingRippleTags(id), FETCH_TAG.bookingByBookingId(id), FETCH_TAG.signatureListInBookingByBookingId(id)]`). A single-tag write with no ripple just uses `FETCH_TAG.xList` directly — no array needed.

**A child that can live under many parents gets one function, not a copy per screen.** A receipt-payment can sit under a trip, a booking, an invoice, a wage… If each screen builds its own tag list by hand, they drift: one screen remembers to add the parent's record tag, the next forgets. Put the mapping in one place — `getReceiptPaymentRippleTags(parent)` — so every screen gets the same complete set.

---

**See also:** [Provider Pattern](PROVIDER-PATTERN.md) (who declares reads and emits writes) · [Observer Pattern](OBSERVER-PATTERN.md) (the notify-on-change shape refresh follows) · [Coding Convention §6](../CODING-CONVENTION.md).

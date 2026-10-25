# Search Results View — Ideas

The SearchBar is shown in two places: the **Landing** page and the signed-in **Listings** page (`Listings.jsx`). Search returns **units** (bedrooms, bathrooms, sqft, rent, photos), and each unit belongs to a **property** (name, city, region, HDB/Condo/Landed). So each result is one unit with its property details attached.

## 1. Structure: one public results page

Pressing Search on either the Landing page or the Listings page routes to the public `/search` page (no login needed), e.g. `/search?type=HDB&region=East&city=Tampines&bed=2`. Everyone sees the same page; only the card actions change with login state:

| | Guest | Logged in |
|---|---|---|
| Card action | "Sign in to enquire" → `/login` | "♡ Save", "Enquire" (disabled until there's a backend) |
| Extras (later) | — | "Saved searches" and "Recently viewed" rows |

The filters live in the **URL**, which gives shareable links, a working back button, and results that survive a reload. `features/search/searchParams.js` converts between filters and the URL, and `SearchBar` takes `initialFilters` so it opens pre-filled with the current search.

## 2. Page layout

```
┌──────────────────────────────────────────┐
│ casahero            Welcome, Guest ! ... │  ← TopBanner, fixed (always visible)
├──────────────────────────────────────────┤
│ HDB · East › Tampines · 2+ bed  [Edit ▾] │  ← search panel, sticky below the banner
│   (expanded: the full SearchBar)         │
├──────────────────────────────────────────┤
│ 5 units in Tampines, East                │  ← results bar
│ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │ card │ │ card │ │ card │               │  ← card grid, 1 column on phones, 3–4 on desktop
│ └──────┘ └──────┘ └──────┘               │
└──────────────────────────────────────────┘
```

- **Banner:** always frozen at the top. `TopBanner` measures itself and sets `--banner-h`, so the page and the sticky panel sit right below it even when it wraps on small screens.
- **Search panel:** collapsed by default to a one-line summary of the current filters with an "Edit search" button. Expanding it shows the full `SearchBar`; searching updates the URL and collapses it again. It always starts collapsed; with no filters, the page shows a "Start a search" button that opens it.
- **Results:** the card grid (layout A below).

## 3. Layout options

- **A. Card grid (the safe default):** 3–4 columns of photo cards. Good for the landing page, where the photo sells the place.
- **B. Compact list rows:** small thumbnail, name, unit number, beds/baths/sqft, and rent on the right. Faster to scan, which suits the signed-in Listings page.
- **C. Split view with a map:** list on the left, map on the right, with pins grouped by city. Region/city/postal code already exist, so geocoding by postal code is enough. This looks impressive but is the most work, so save it for v2.
- **D. Grouped by property:** one card per building, like "The Sail Condo, 3 units available from S$4,200", which expands to show the units. This fits the data model, where one property has many units.

**Chosen: A, the card grid**, on `/search` for everyone. A grid/list toggle (B), the map (C) and grouping by property (D) are for later.

## 4. What goes on a card

```
┌─────────────────────────────┐
│ [photo / placeholder]  HDB  │  ← type badge
│                             │
├─────────────────────────────┤
│ S$3,200 /mo                 │  ← asking_rent_cents / 100
│ Tampines Central Flat       │
│ #08-112 · Tampines, East    │
│ 🛏 3   🛁 2   📐 1,001 sqft   │
│ S$3.20/sqft · Available     │  ← cheap to compute, useful to renters
│ [ ♡ Save ] [ Enquire ]      │  ← guests: [ Sign in to enquire ]
└─────────────────────────────┘
```

- `photo_paths` is often empty, so show a placeholder chosen by property type (an icon for HDB, Condo and Landed for now; illustrations later). A photo that fails to load falls back to the same placeholder.
- Later: only show `vacant` units to tenants. Landlords could see every unit with a status pill. Today every unit is shown, with its status.

## 5. The bar above the results

- "12 units in Tampines, East" (done)
- **Filter chips** for the active filters (`HDB ×`, `3+ beds ×`). Clicking × removes that filter and searches again.
- **Sort:** price low to high, price high to low, newest, largest.
- Paging: either a "Load more" button or infinite scroll. The hooks already use TanStack Query, so `useInfiniteQuery` handles this.

## 6. Loading, empty and error states

- **Loading (done):** skeleton cards in the grid shape instead of the full-screen `Spinner`, so the page doesn't jump.
- **No results:** today it says "No units match this search." with an "Edit search" button that opens the panel. Next: don't just say "No results." Loosen a filter and suggest the result, e.g. "No 3-bed HDBs in Tampines. **4 found with 2+ beds** · **6 found anywhere in East**."
- **Before the first search:** `/search` with no filters shows a prompt with a "Start a search" button that opens the panel. Later, show "Featured" or "Newly listed" units so the page isn't empty.
- **Error (done):** an inline message with a Retry button.

## 7. Extras for later

- A detail drawer or modal when you click a card, so the results stay in place.
- Compare up to 3 units side by side.
- "Alert me when a unit like this is listed" on saved searches.
- On the landlord Listings page: "Your similar units rent for S$X," as a pricing hint.

## Fixed

- `Landing.jsx` and `Listings.jsx` (formerly `Dashboard.jsx`) now pass `onSearch` to `<SearchBar />`, which routes to `/search` with the filters in the URL. The results live in `features/search/` (`SearchResultsPage`, `SearchResults`, `ListingCard`).
- `getListings` now sends `{ type, region, city, bed, bath }`, matching what `SearchBar` produces. `useListings(filters)` keys the query on the filters and stays idle until the first search.
- The mock handler filters `type` against `property_type`, treats `bed`/`bath` as minimums on units, and no longer defaults `city` to Tampines. `db.js` now uses `'Landed'` (capitalised) to match `/types`.

## Next

Filter chips and sort in the results bar, the "loosen a filter" empty state, vacant-only for tenants, and wiring Save / Enquire once there's an API for them.

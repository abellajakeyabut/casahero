# Restructure: flatten property → unit into one table

Plan for merging `properties` and `units` into a single `properties` table, where each row is one rentable unit. Written 2026-11-19.

> **Status: implemented 2026-11-19.** Decisions taken on the open questions: the table stays `properties`, `unit_number` is nullable, and `type` was dropped. Tests are in `src/test/listings.test.jsx`.

## Goal

Today a **property** is a building (e.g. *Parc @ Bishan*) and it has many **units** (`#08-112`, `#11-115`, …). After the change, **the property is the unit**: one row holds the location, the type, and the rentable details (beds, baths, size, rent, status, photos).

```
Before                                   After
landlords ─< properties ─< units ─< leases     landlords ─< properties ─< leases
```

## Scope check

There's no real database yet. The Express server (`casahero-server/server.js`) only stubs auth, so this is entirely a **front-end + mock data + docs** change. Nothing has to be migrated in production.

## New `properties` shape

Every column from the old `properties` table plus every rentable column from `units`:

| Column | Type | From | Notes |
|---|---|---|---|
| `id` | string | properties | `pr-###`. One per rentable unit now. |
| `landlord_id` | string | properties | |
| `name` | string | properties | Building/estate name, e.g. `Parc @ Bishan`. Now repeats across rows in the same building. |
| `unit_number` | string \| null | units | `#08-112`, `Main house`. Nullable for a whole house with no unit number. |
| `address` | string | properties | |
| `postal_code` | string | properties | |
| `region` | string | properties | |
| `city` | string | properties | |
| `type` | string | properties | `Residential` \| `Landed` (see open question 3) |
| `property_type` | string | properties | `HDB` \| `Condo` \| `Landed` |
| `bedrooms` | number | units | |
| `bathrooms` | number | units | |
| `area_sqft` | number | units | |
| `asking_rent_cents` | number | units | |
| `status` | string | units | `vacant` \| `occupied` \| `unavailable` |
| `photo_paths` | string[] | units | Path prefix changes from `units/un-###/` to `properties/pr-###/`. |
| `created_at` | string | properties | |

Dropped: `units.id` and `units.property_id`.

`leases.unit_id` becomes **`leases.property_id`**.

## What changes, file by file

### 1. Mock data: `src/mocks/db.js`

- Merge `properties` (3 rows) and `baseUnits` (6 rows) into **6 property rows**, copying the building fields onto each unit:

  | Old unit | New id | Building |
  |---|---|---|
  | `un-001` `#08-112` | `pr-001` | Tampines Central Flat |
  | `un-002` `#11-115` | `pr-002` | Tampines Central Flat |
  | `un-003` `#32-05` | `pr-003` | The Sail Condo |
  | `un-004` `#45-01` | `pr-004` | The Sail Condo |
  | `un-005` `Main house` | `pr-005` | Serangoon Gardens House |
  | `un-006` `Annex room` | `pr-006` | Serangoon Gardens House |

- Delete `baseUnits` and stop exporting `units`.
- `leases`: rename `unit_id` → `property_id` and remap `un-001 → pr-001`, `un-003 → pr-003`, `un-005 → pr-005`.
- Update photo paths, e.g. `units/un-001/living.jpg` → `properties/pr-001/living.jpg`. Move the files under `public/` too if they exist.
- Change the seed call to `export const properties = seedListings({ cities, properties })`.

### 2. Seed generator: `src/mocks/seedListings.js`

- Merge `makeProperty` and `makeUnit` into one `makeListing` that returns a flat row.
- Keep generating "buildings" internally so the unit rows in one HDB block or condo share a name, address and postal code (realistic data). Instead of pushing the building and its units separately, spread the building fields into each unit row:
  `rows.push({ ...building, ...unitFields, id: 'pr-###' })`.
- Keep the 10 buildings per city × 15 units per building, so you get the same ~3,000 rows and search results look the same as today. Rename the constants to `BUILDINGS_PER_CITY` / `UNITS_PER_BUILDING`.
- Return a single array instead of `{ properties, units }`.
- Keep the fixed seed (`20261025`). Ids will still change once, because numbering is now per unit.

### 3. Mock API: `src/mocks/handlers.js`

- Remove `units` from the import.
- Rewrite `POST /listings` as a plain filter over one array. The join and the "drop properties with no matching unit" step go away:

  ```js
  let rows = properties;
  if (city) rows = rows.filter((p) => p.city === city);
  if (region) rows = rows.filter((p) => p.region === region);
  if (type) rows = rows.filter((p) => p.property_type === type);
  if (bed != null) rows = rows.filter((p) => p.bedrooms >= bed);
  if (bath != null) rows = rows.filter((p) => p.bathrooms >= bath);
  return HttpResponse.json(rows);
  ```

- While you're in there, fix the bed/bath bug: the comment and `api-contracts.md` say "minimum", but the code uses `==`. The UI shows `2+`, so `>=` is the intended behaviour.

### 4. Search UI

- **`src/features/search/SearchResults.jsx`**: delete the `flatMap` that turns `property.units` into `{ unit, property }` pairs. `results` is just `listings.data`. Use `key={listing.id}`.
- **`src/features/search/ListingCard.jsx`**: replace the two props `unit` and `property` with one `listing` prop. Every `unit.x` and `property.x` becomes `listing.x`, for example `listing.photo_paths`, `listing.name` and `listing.unit_number`. If `unit_number` becomes nullable, skip the `·` separator when it's empty.
- No changes needed in `SearchResultsPage.jsx`, `SearchBar.jsx`, `NumberPicker.jsx`, `searchParams.js`, `api/listings.js`, `hooks/useListings.js` or `hooks/listingKeys.js`. The request shape stays the same.
- Optional cleanup: `listingKeys.listByPropperty` (typo) no longer means anything. Remove it.

### 5. Landlord form: `src/features/dashboard/components/PropertyForm.jsx`

The flat model suits this form better than the old one, because it already asks for beds and baths on the "property". To capture a complete row:

- Add inputs for `unit_number`, `address`, `postal_code`, `area_sqft`, asking rent and `status`.
- Wire up the beds/baths inputs. They aren't bound to `formData` today.
- Rename the `formData` keys to match the columns (`property_type`, `bedrooms`, `bathrooms`, …) so the submit payload maps 1:1.
- Unrelated bug spotted: `e.preventDefuault()` is a typo and will throw on submit.

### 6. Docs

- **`docs/data-schema.md`**: remove the `units` table. Update the ER diagram, the `properties` and `leases` tables, Relationships, Conventions (drop the `un-` prefix) and Data volumes (~3,000 properties, 0 units). Known issue 4 becomes `leases.landlord_id` duplicating `property → landlord_id`, and issue 7 becomes `properties.status` vs leases. Update the suggested DDL to the merged table (`UNIQUE (postal_code, unit_number)`, `leases.property_id`).
- **`docs/data-schema.html`**: regenerate or update it to match.
- **`../api-contracts.md`** (repo root): `POST /listings` now returns a flat array of properties with no nested `units`. Update the example response, the field tables, the `bed`/`bath` description and the lease's `unit_id` → `property_id`. Also update the seed description on line 26.
- **`docs/search-results-ideas.md`**: check its wording about units and update as needed.

### 7. Tests

`src/test/` only covers `TopBanner` and `validators`, so no existing test breaks. Worth adding:

- Handler tests for `POST /listings`: filters by city, type and bed/bath minimums, and returns flat rows with no `units` key.
- A `ListingCard` render test with a single `listing` prop.
- A data-integrity check that every `leases.property_id` exists in `properties`.

`coverage/` is generated output. Regenerate it and don't edit it by hand.

## Suggested order

1. `db.js` + `seedListings.js` (data shape)
2. `handlers.js` (API)
3. `SearchResults.jsx` + `ListingCard.jsx` (consumers). The app works end-to-end again at this point.
4. `PropertyForm.jsx`
5. Tests
6. Docs (`data-schema.md/.html`, `api-contracts.md`)

Steps 1–3 should land together in one commit, because the UI breaks in between.

## Trade-offs to accept

- **Building data repeats.** Name, address, postal code, region and city are copied onto every unit in a building. Renaming a condo means updating every row, and the rows can drift out of sync.
- **No "all units in this building" query by id.** You can still group by `postal_code` (unique per HDB block / condo in Singapore) or by `address`, if a building view is ever needed.
- **Building-level features get harder later.** Shared facilities, MCST/management contacts or building photos would have no natural home. If those come up, a light `buildings` lookup (id, name, address, postal_code) could return as an optional FK without bringing back the old nesting.

These are acceptable for a rental marketplace where each listing is what a tenant actually rents.

## Open questions

1. **Table name:** keep `properties` (less churn, matches `PropertyForm`), or rename to `listings` (matches the endpoint and query keys)? Recommendation: keep `properties`.
2. **`unit_number` nullable?** Recommendation: yes, so a whole landed house doesn't need a fake unit number.
3. **`type` vs `property_type`:** the merge is a good moment to drop the unused `type` column (known issue 5 in `data-schema.md`). Recommendation: drop it.

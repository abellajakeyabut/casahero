# Code review: casahero-ui and casahero-server

Date: 2026-10-27 · Branch: `feature/landing`

This covers `casahero-ui/src` (everything except `src/mocks/`), the build and lint config, and `casahero-server`. MSW mocks were left out on purpose. Several API issues are already listed under "Known issues" in [`api-contracts.md`](../../api-contracts.md). They're repeated here only when they need code changes, with the contract's number given as `(contract #n)`.

## Summary

The UI is in decent shape for a prototype. Features have their own folders, React Query handles server state, search filters live in the URL so links can be shared, and the shared pieces (`NumberPicker`, `validators.js`, `Sidebar`) are small and easy to follow.

The main risks sit at the edge between the UI and the real API. The mocks currently hide them:

- API paths double their prefix, so every non-auth call will 404 against a real server.
- The Express server has no `/me`, so `SafeRoute` gets back `index.html` and goes into a redirect loop.
- All auth and role checks happen in the browser. There's no session behind them.
- Signup has no error handling, and its loading state is backwards.

Checks run:

- `npx eslint .`: **4 errors and 3 warnings** (3 errors and 2 warnings outside the mocks).
- `vite build`: passes, but the bundle is **976 kB unminified** because minification is turned off.
- No test suite or test runner is set up.

---

## Action points

Priority: **P0** breaks against a real backend or is a security gap · **P1** a real bug or broken UX · **P2** cleanup or maintainability · **P3** nice to have.

### P0: will break against the real API

| # | Issue | Where | Action |
|---|---|---|---|
| 1 | **The API path prefix is doubled.** The base URL already ends in `/casahero-api`, and these calls add `/casahero-api/...` again, so requests go to `/casahero-api/casahero-api/listings`. MSW's `*/` patterns hide this. (contract #1) | `src/api/listings.js:6,11,16,20`, `src/features/authentication/useMe.js:7` | Use relative paths (`/listings`, `/regions`, `/cities`, `/types`, `/me`), the same way `auth.js` does. |
| 2 | **`SafeRoute` loops when `/me` doesn't exist.** On the Express server, `GET /casahero-api/me` falls through to the catch-all and returns `index.html` with a `200`. `data` is then a non-empty HTML string, so the `!data` guard lets it through. `default_role` is `undefined`, so the route redirects to `/tenant`, which fails the role check again, and the redirects never stop. | `src/SafeRoute.jsx:19-21`, `casahero-server/server.js:34` | (a) Add `GET /casahero-api/me` to the server. (b) Make the server return a JSON 404 for unknown `/casahero-api/*` routes instead of `index.html`. (c) In `SafeRoute`, check the shape of the response (for example `data?.default_role && data?.loggedIn`) before letting the user in. |
| 3 | **Auth exists only in the browser.** The user is "logged in" because of a `localStorage` entry and the role toggle. The server has no session or token, accepts any credentials and doesn't read the body (no `express.json()`). (contract #5, #6, #7) | `casahero-server/server.js`, `AuthProvider.jsx:13-16` | Add real auth on the server: hash passwords, use an httpOnly session cookie or a JWT, have `/me` read the session, and enforce roles on the server. In the UI, stop relying on `localStorage` and treat `/me` as the only source of truth. |
| 4 | **`socialLogin` is broken.** It uses single quotes instead of a template literal, and `provider` is undefined. (contract #2) | `src/api/auth.js:15-18` | Change it to `socialLogin = async (provider, data) => api.post(\`/auth/${provider}\`, data)`. |
| 5 | **The dev setup can't reach the real API.** `.env` points `VITE_API_URL` at the Vite port (5173), and `vite.config.js` has no proxy. With `VITE_ENABLE_MOCKS=false`, every call 404s. | `casahero-ui/.env`, `casahero-ui/vite.config.js` | Add `server.proxy: { '/casahero-api': 'http://localhost:3000' }` and change `VITE_API_URL` to `/casahero-api`, or leave it out. |

### P1: bugs and broken UX

| # | Issue | Where | Action |
|---|---|---|---|
| 6 | **Signup has no error handling, and its loading flags are backwards.** `register()` never sets `loading=true` before the request. It sets it to `true` *after* success, so the spinner then sits over the success modal. A network error or a 4xx (such as a duplicate email) becomes an unhandled rejection with no message for the user. A non-success response does nothing at all. Nothing stops a double submit. | `src/features/signup/Signup.jsx:53-60` | Wrap the call in `setLoading(true)` / `try` / `catch` / `finally setLoading(false)`, show the server error in `errors`, and disable the submit button while the request runs. Switching to `useMutation` would give you all of this. |
| 7 | **`confirmPassword` is sent to the server.** (contract #8) | `Signup.jsx:54` | Remove it before posting: `const { confirmPassword, ...body } = formData`. |
| 8 | **Logout fails silently.** If `logout()` throws, `try/finally` passes the error on as an unhandled rejection. If it returns `success:false`, the user stays logged in and sees nothing. The request body is the whole `userContext` (contract #9). | `src/shared/TopBanner.jsx:27-43` | Catch the error and show a message, or always clear the local state. Send no body. Use `queryClient.clear()` here as well, the same way Login does. |
| 9 | **The search spinner covers the whole screen on background refetches.** It's tied to `isFetching`, which also fires on window-focus refetches after the 30s `staleTime`. The full-screen overlay then appears whenever the user comes back to the tab. | `src/features/search/SearchBar.jsx:27` | Use `isPending` (first load only), or show inline loading on the dropdowns. Also think about a long `staleTime` for types, regions and cities, which rarely change. |
| 10 | **The role menu and theme flash on reload.** `Dashboard` reads the role from `userContext`, which `SafeRoute` only fills in from an effect after the first render. A landlord briefly sees the tenant menu and the green theme. | `src/features/dashboard/Dashboard.jsx:12-13`, `src/SafeRoute.jsx:14-16` | Read the role from `useMe().data` in protected pages, or have `SafeRoute` pass it down. Keep `userContext` for guest and UI state only. |
| 11 | **The role picker can't be used with a keyboard.** The radio inputs are `display:none`, which removes them from the tab order. | `src/features/authentication/RolePick.jsx:34,59-63` | Hide them visually with a `.visually-hidden` class instead, add a `:focus-visible` style on the label, and move the inline styles into CSS. Also remove the stray `className` and `backgroundColor` on the hidden input. |
| 12 | **The login form has problems.** The email field is `type="text"`, there are no labels or `autocomplete` attributes, the inputs aren't controlled, there's no client-side validation even though `validators.js` exists, and the button stays clickable while the request runs. The state starts with `username` but stores the value as `email`. "Forgot Password?" links to `#`. | `src/features/authentication/Login.jsx:19-22,43-48,67-105` | Use `type="email"`, `autoComplete="email"` / `"current-password"`, real `<label>`s, `value=` bindings and `validateEmail`, and disable the button while `show` is true. Drop `username` from the state. Hide the forgot-password link until the flow exists. |
| 13 | **The social buttons do nothing.** `onSelect` is never passed in from Login or Signup. | `Login.jsx:101`, `Signup.jsx:146` | Connect them to `socialLogin` once #4 is fixed, or hide them until then. |
| 14 | **`ListingCard` crashes when `area_sqft` is missing.** `perSqft` checks for it, but line 33 calls `.toLocaleString()` on it anyway. | `src/features/search/ListingCard.jsx:33` | Guard it: `unit.area_sqft?.toLocaleString() ?? '—'`. |
| 15 | **`SearchBar` hard-codes the default type to `'HDB'`.** If `/types` doesn't include HDB, no radio button is selected and searches still send `type=HDB`. | `SearchBar.jsx:8` | Default to `''` and pick the first type once `types.data` loads, or make the API's default explicit. |
| 16 | **`cities` doesn't encode the region.** A region containing `&` or spaces breaks the query string. | `src/api/listings.js:16` | Use `api.get('/cities', { params: { region } })`. |

### P2: cleanup and maintainability

| # | Issue | Where | Action |
|---|---|---|---|
| 17 | **Lint errors.** `Listings` and `RolePick` are imported but never used, and the `React` import is unused. `SafeRoute` and `Login` are missing hook dependencies. | `App.jsx:3`, `Login.jsx:4,58`, `UnderConstruction.jsx:1`, `SafeRoute.jsx:16` | Fix them and make `npm run lint` a required check (a pre-commit hook or CI). |
| 18 | **Dead code.** `Listings.jsx` and `Listings.css` are no longer routed (`Dashboard` replaced them). There's commented-out code in `useListings.js:34-45`, `listingKeys` has unused keys (and a typo, `listByPropperty`), and the vestigial `password: ''` is still in the logout context. | `features/listings/`, `hooks/` | Delete or finish them. |
| 19 | **The Dashboard condition is repeated.** It reads `activeItem.key === 'Search' \|\| activeItem.key == 'Search'`. The menu keys mix case (`'Search'` next to `'home'`), and the landlord label `'home'` is lowercase. | `Dashboard.jsx:28`, `shared/sidebar/menus.js:4-5,13` | Use lowercase keys everywhere (`'search'`), capitalize labels, and keep only one comparison. |
| 20 | **`SafeRoute` imports go through `../src/`.** It imports `'../src/features/...'` from inside `src/`. | `src/SafeRoute.jsx:2-3` | Change them to `'./features/authentication/useMe'` and `'./shared/Spinner'`. |
| 21 | **`UnderConstruction` uses Tailwind classes, but Tailwind isn't installed.** The classes do nothing. The JSX also has an empty `<p>` and a "Landlord Card" comment left over from an older version. | `src/underconstruction/UnderConstruction.jsx` | Replace them with real CSS from `UnderConstruction.css`. |
| 22 | **Two places control the theme.** `AppProvider` and `Signup` both write to `document.documentElement.dataset.role`, and Signup's cleanup can put back an old value. | `context/AppProvider.jsx:15-17`, `Signup.jsx:37-45` | Make one owner, for example a `previewRole` value in `AppContext` that `AppProvider` turns into `data-role`. |
| 23 | **The `AppContext` value is a new object on every render**, so every consumer re-renders whenever the provider does. | `context/AppProvider.jsx:20-24` | Wrap the value in `useMemo`. |
| 24 | **Signup inputs aren't controlled, and the labels are `<span>`s.** Screen readers don't link a label to its field. | `Signup.jsx:85-132` | Use `<label htmlFor>` with matching `id`s and bind `value=`. |
| 25 | **Production builds aren't minified.** `minify: false` ships 976 kB of JS. `terserOptions` does nothing, because Vite minifies with esbuild/oxc by default. | `vite.config.js` | Remove both options, or limit them to a debug mode, and use `build.sourcemap` for debugging. Think about splitting routes with `React.lazy`. |
| 26 | **Build output and env files are committed.** `casahero-server/dist/` is in git, and so is `casahero-ui/.env`. | repo root | Add `casahero-server/dist` to `.gitignore` and remove it from git with `git rm -r --cached`. Commit a `.env.example` and ignore `.env`. |
| 27 | **Server hygiene.** The `Cache-Control` middleware is registered *after* `express.static`, so it never applies to static files. The port is hard-coded. The `path` npm package is a pointless dependency (`require('path')` resolves to the core module). There's no error handler, no `start` script, and `main` points to a file that doesn't exist (`index.js`). | `casahero-server/server.js`, `casahero-server/package.json` | Move the middleware above `express.static`, or give hashed assets long caching and only `index.html` `no-store`. Use `process.env.PORT ?? 3000`. Remove `path` from dependencies. Add `"start": "node server.js"` and fix `main`. |
| 28 | **No tests.** | — | Add Vitest and React Testing Library. Start with `searchParams.js`, `validators.js`, `NumberPicker`, and the redirect rules in `SafeRoute`. The MSW handlers can be reused through `msw/node`. |

### P3: nice to have

| # | Issue | Where | Action |
|---|---|---|---|
| 29 | The banner title is a clickable `<div>`, so it can't be reached with a keyboard. | `TopBanner.jsx:47-55` | Make it a `<Link to="/">`. |
| 30 | The text reads "Welcome, Guest ! " (stray space before the `!`), and the page `<title>` is still `casahero-ui`. | `TopBanner.jsx:60`, `index.html:7` | Change them to "Welcome, Guest!" and "casahero". |
| 31 | Code style varies (2 or 4 spaces, semicolons or none, `==` mixed with `===`). | across `src/` | Add Prettier, and enable ESLint's `eqeqeq` rule. |
| 32 | There's no root README covering how to run the UI, the server and the mocks together. `casahero-ui/README.md` is the Vite template. | repo root | Write a short README covering dev, build and deploy (`postbuild` copies into the server). |
| 33 | `/listings` only redirects to the role's home, and the name is misleading. | `App.jsx:50-57` | Rename it to something like `/home`, and update `Login.jsx:33`. |

---

## Suggested order

1. **#1, #5, #20, #17.** Quick fixes that make the UI talk to a real server and get lint passing.
2. **#2, #3, #4, #27.** Server work: `express.json()`, a real `/me`, sessions, and a JSON 404 for the API.
3. **#6–#16.** UX and bug fixes on the auth and search flows.
4. **#28.** Tests before the next feature. Then clean up the rest of P2 and P3.

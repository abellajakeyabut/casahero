# Fix: data disappears after login until the page is refreshed

Date: 2026-10-30 · Branch: `feature/landing`

## The symptom

After logging in, the whole app would reset on its own, usually after the tab had been in the background for a while:

- the banner went back to "Welcome, Guest"
- the sidebar disappeared (on `/search`) or switched to the tenant menu (on the dashboard)
- the property type and region dropdowns lost their options
- search results were replaced by "Could not load results"

A page refresh brought everything back, and you were still logged in.

## What was actually happening

Nothing was deleting the data. The API calls stopped reaching the mocks, and the app accepted the responses it got back as if they were real data.

1. **MSW forgets the tab.** MSW mocks the API through a service worker. The worker keeps the list of tabs it mocks for in memory only (`activeClientIds` in `public/mockServiceWorker.js`). Chrome stops idle service workers, and a background tab slows the page's keep-alive pings. When the worker starts again, that list is empty, and every request goes straight through to the network (`mockServiceWorker.js:331-332`).
2. **The Vite dev server answers instead.** Vite has no `/casahero-api/*` routes. For GET requests it sends back `index.html` with status **200**. For POST requests it sends a **404**.

   | Request | Response without MSW |
   |---|---|
   | `GET /casahero-api/me` | `200 text/html` (index.html) |
   | `GET /casahero-api/types` | `200 text/html` (index.html) |
   | `POST /casahero-api/regions` | `404` |
   | `POST /casahero-api/listings` | `404` |

3. **React Query refetches when you return to the tab.** Any query older than its `staleTime` (30s) is refetched, so every query failed at the same moment:
   - `/me` returned the HTML page as a string. `SafeRoute` stored that string as the user, so `loggedIn` was undefined. Result: "Welcome, Guest", and the sidebar disappeared.
   - `/types` also returned a string, which has no options to show.
   - `/listings` returned a 404. `SearchResults` checked `isError` first and showed the error, even though the old results were still in the cache.
4. **Why a refresh fixed it.** Reloading registers the page with the worker again, so mocking starts working again.

### How it was confirmed

In a headless Chromium run, I logged in, loaded search results, and stopped the service worker through DevTools (`ServiceWorker.stopAllWorkers`). The next `GET /me` came back as `200 text/html` instead of JSON. I then waited past the 30s stale time and fired a tab refocus. Before the fix, the results were replaced by "Could not load results". After the fix, everything stayed on screen, and the requests recovered about a second later.

### Is this only a mock problem?

The **trigger** is mock-only: a real backend has no service worker to forget the tab. The **weakness** applies to the real server too:

- The Express server sends `index.html` with status 200 for any `/casahero-api/*` route it doesn't have. `/me` doesn't exist there yet (code-review #2).
- Any failed background refetch (server restart, deploy, network drop, a 500) used to log the user out and wipe the results.

Fixes 1–3 below cover both cases. Fix 4 only applies to the mocks.

---

## The changes

### 1. Only accept JSON from the API (`src/api/api.js`)

A response interceptor rejects any response that isn't JSON, except `204 No Content`. React Query then treats it as a failed fetch and **keeps the last good data**, instead of overwriting it with HTML.

```js
// Anything that isn't JSON (e.g. index.html from the dev server or the SPA fallback when the
// MSW worker stops intercepting) is an error, so React Query keeps the last good data.
api.interceptors.response.use((response) => {
  const contentType = response.headers['content-type'] ?? '';
  if (response.status !== 204 && !contentType.includes('application/json')) {
    const error = new Error(
      `Expected JSON from ${response.config.url}, got "${contentType || 'no content type'}"`,
    );
    error.config = response.config;
    error.notJson = true;
    return Promise.reject(error);
  }
  return response;
});
```

`error.config` and `error.notJson` are set so the MSW reconnect (fix 4) can recognise this error and retry the request.

### 2. Only let a real user through `SafeRoute` (`src/SafeRoute.jsx`)

Before:

```js
const { data, isLoading, isError } = useMe();
useEffect(() => {
  if (data) updateUserContext(data);
}, [data]);

if (isLoading) return <Spinner />;
if (isError || !data) return <Navigate to="/login" replace />;
if (role && data.default_role !== role) {
  return <Navigate to={homeFor(data.default_role)} replace />;
}
```

After:

```js
const { data, isLoading } = useMe();
// only a real user object counts; a failed background refetch keeps the last good `data`
const user = data?.loggedIn && data?.default_role ? data : null;
useEffect(() => {
  if (user) updateUserContext(user);
}, [user, updateUserContext]);

if (isLoading) return <Spinner />;
if (!user) return <Navigate to="/login" replace />;
if (role && user.default_role !== role) {
  return <Navigate to={homeFor(user.default_role)} replace />;
}
```

What changed and why:

- **`isError` no longer logs you out.** In React Query v5, a failed *refetch* sets `isError` but keeps the previous `data`. The old check sent a logged-in user to `/login` whenever a background refresh of `/me` failed. Now only a missing user redirects.
- **The shape of the user is checked.** Any value that isn't a real user, such as an HTML string, is treated as "not logged in" instead of being stored in the user context.
- **Lint fix:** `updateUserContext` is now in the effect's dependency list. It's stable (`useCallback` in `AppProvider`), so this doesn't cause extra runs.

### 3. Keep old search results when a refetch fails (`src/features/search/SearchResults.jsx`)

```js
// a failed background refetch keeps the old results, so only show the error when there are none
if (listings.isError && !listings.data) {
```

Before, the `isError` check came first and hid results the user already had. Now "Could not load results" only appears when there's nothing to show.

### 4. Reconnect to the MSW worker and retry (`src/main.jsx`, dev with mocks only)

When a request gets back HTML or a 404, the tab re-registers with the worker (`worker.stop()` then `worker.start()`) and retries the request once.

```js
const { worker } = await import('./mocks/browser')
const { default: api } = await import('./api/api')
const startOptions = { onUnhandledRequest: 'bypass', quiet: true }

// Chrome stops idle service workers (e.g. while the tab is in the background). The restarted
// worker has forgotten this tab, so requests reach Vite and come back as index.html or a 404.
// Re-register with the worker and retry the request once.
let reconnecting = null
const reconnect = () => {
  reconnecting ??= Promise.resolve()
    .then(() => worker.stop())
    .then(() => worker.start(startOptions))
    .finally(() => { reconnecting = null })
  return reconnecting
}
api.interceptors.response.use(undefined, async (error) => {
  const config = error.config
  const missedMock = error.notJson || error.response?.status === 404
  if (!config || !missedMock || config._mockRetried) throw error
  console.warn('[MSW] request was not mocked, reconnecting to the worker:', config.url)
  await reconnect()
  return api.request({ ...config, _mockRetried: true })
})

// Wait for the worker to be ready so early requests are intercepted
return worker.start({ ...startOptions, quiet: false })
```

How it works:

- **Shared reconnect.** When several requests fail at once (a tab refocus refetches every stale query), they all wait on one `reconnecting` promise instead of restarting the worker several times.
- **One retry per request.** `_mockRetried` stops a request from retrying in a loop. If the retry also fails, the original error goes through to React Query as normal.
- **Quiet restarts.** `quiet: true` keeps the "Mocking enabled" banner from printing on every reconnect. The first start still logs it.
- **Dev only.** All of this lives inside `enableMocking()`. That function returns early in production builds and when `VITE_ENABLE_MOCKS=false`, so none of it reaches production.

You'll see this warning in the console when a reconnect happens:

```
[MSW] request was not mocked, reconnecting to the worker: /listings
```

**Side effect:** a request to an endpoint that has no mock handler (a real 404) also triggers one reconnect and retry before the 404 reaches the app. That only adds about a second, and only in dev.

---

## Files changed

| File | Change |
|---|---|
| `src/api/api.js` | Reject responses that aren't JSON |
| `src/SafeRoute.jsx` | Check the user's shape; don't redirect when only a refetch failed; fix the effect deps |
| `src/features/search/SearchResults.jsx` | Show the error only when there's no cached data |
| `src/main.jsx` | Reconnect to the MSW worker and retry once (dev + mocks only) |

## Still open

- **The real server needs `/me` and a JSON 404** for unknown `/casahero-api/*` routes (code-review #2). Fix 1 stops the UI from breaking, but the server should still return proper errors.
- **The full-screen spinner on background refetches** (code-review #9). It shows up when you come back to the tab and can look like the page went blank.

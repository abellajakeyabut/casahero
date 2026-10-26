# Mock signup → login

Users created through the signup mock are now remembered, so you can sign up and then log in as that same user without a backend.

All of the code is in `src/mocks/handlers.js`. This only affects MSW mocks. The Express server in `casahero-server` hasn't changed.

## How it works

```
Signup.jsx ──POST /signup──▶ signup mock ──push──▶ registeredUsers[]
                                                        │
Login ─────POST /login───▶ login mock ──findUserByEmail─┘
                                         └─ checks the password, returns the user without it
```

### 1. The in-memory store

```js
// users created through the signup mock; lives until the page reloads
const registeredUsers = [];
```

`findUserByEmail` searches this list along with the seeded `landlords` and `tenants` from `db.js`. The match ignores case and surrounding spaces:

```js
const findUserByEmail = (email) =>
  [...landlords, ...tenants, ...registeredUsers].find(
    (user) => user.email.toLowerCase() === email?.trim().toLowerCase(),
  );
```

That one change has two effects:
- Signing up with an email that already signed up returns `Email already registered`.
- The login mock can find users who signed up.

### 2. Signup stores the user

`POST */casahero-api/signup` reads `name`, `email`, `password` and `role` from the body. If the email is new, it builds a user with the existing `fakeUser` helper, then stores it along with the password:

```js
registeredUsers.push({
  ...fakeUser({
    email: email.trim(),
    full_name: name?.trim(),
    // anything other than landlord falls back to tenant
    role: role === 'landlord' ? 'landlord' : 'tenant',
  }),
  password,
});
```

The stored user has the same shape as a landlord or tenant in `db.js`:

| Field | Value |
|---|---|
| `id` | `ll-<timestamp>` for a landlord, `tn-<timestamp>` for a tenant |
| `email` | the trimmed email |
| `full_name` | the `name` from the form, or the part of the email before `@` if `name` is empty |
| `phone`, `avatar_url` | `null` |
| `default_role` | the `role` from the form: `landlord` or `tenant` |
| `auth_provider` | `email` |
| `created_at` | the signup time |
| `password` | the plain-text password, kept only in memory |

The response hasn't changed: `{ outcome: 'Signup successful!', success: true }`.

### 3. `fakeUser` accepts `full_name`

`fakeUser` now takes an optional `full_name` and falls back to the part of the email before `@`. The social-login mock (`/auth/:provider`) was already passing `full_name`, which used to be ignored. Now it's used.

### 4. Login checks the password

`POST */casahero-api/login` now works like this:

1. The password `wrong` still fails, so you can test the failure path.
2. It looks up the email (or `username`) with `findUserByEmail`.
3. If the matching user has a stored `password`, the submitted password must match. If it doesn't, the mock returns `{ outcome: 'Invalid email or password', success: false }`.
4. On success, it returns the user with the password removed:

   ```js
   const withoutPassword = (user) => {
     const copy = { ...user };
     delete copy.password;
     return copy;
   };
   ```

Seeded users from `db.js` have no password, so any password works for them, as before. An unknown email still gets a generated tenant, as before.

### 5. Role selection on the signup form

`Signup.jsx` now shows the Tenant/Landlord toggle (`RolePick`) at the top of the form, and `formData` has a `role` field that goes out with the signup request:

```js
role: ROLES.includes(roleParam)
  ? roleParam
  : (userContext?.default_role ?? 'tenant'),
```

The starting role comes from the first of these that applies:
1. the `?role=` query parameter, if it is `landlord` or `tenant`. Guests on the landing page (`Landing.jsx`) see an **"Own a property? Sign up as a landlord"** banner under the search bar, which links to `/signup?role=landlord`.
2. the role already in the user context
3. `tenant`

Because the theme preview below follows `formData.role`, arriving from that link opens the signup page in the landlord theme.

```jsx
<RolePick
  value={formData.role}
  onChange={(role) => setFormData({ ...formData, role })}
/>
```

`RolePick` (`src/features/authentication/RolePick.jsx`) takes two optional props, `value` and `onChange`:
- **With the props** (as on Signup), the toggle shows `value` and reports changes through `onChange`. It doesn't touch the user context, so picking a role while signing up doesn't change the role of the current session.
- **Without them**, it behaves as before: it reads and writes `userContext.default_role`.

The selected toggle button uses `var(--theme)` instead of a hard-coded green.

#### Theme preview

While the signup page is open, an effect in `Signup.jsx` sets `<html data-role>` to the picked role. That attribute switches the color variables in `index.css`, so picking **Landlord** turns the page pink (the toggle, the Sign Up button, and anything else using `--theme`), and picking **Tenant** turns it back to green. When you leave the page, the effect puts back the previous `data-role`, so `AppProvider` stays in charge of the theme everywhere else. `AppProvider` only applies the landlord theme while a landlord is logged in.

## Trying it

1. Go to `/signup`, pick **Landlord**, and register, for example `Jane Doe` / `jane@test.com` / `secret`.
2. Go to `/login`. Without reloading the page, log in with `jane@test.com` / `secret`. The user returned has `full_name: "Jane Doe"` and `default_role: "landlord"`, so you land on the landlord home. `AuthProvider` merges `response.user` over the user context, so the stored role takes priority over whatever is selected on the login page.
3. Log in again with the same email but a different password. You get "Invalid username or password."
4. Sign up again with `jane@test.com`. You get "Email already registered."

## Limitations

- **The list lives only in memory.** It's a module-level array in the page's JS, so a full page reload or a hard navigation clears it. Moving between pages inside the app keeps it. To make accounts survive a reload, save the list to `localStorage`, the same way `userContext` is saved.
- **The real server ignores `role`.** The Express `/signup` route doesn't read the request body yet (see Known issues in `api-contracts.md`).
- **Passwords are stored in plain text**, in memory, in the mock only. That's fine for a mock, but don't copy this pattern into the real server.

## Related docs

`api-contracts.md` (at the repo root) now covers this in its mock notes for `POST /casahero-api/signup` and `POST /casahero-api/login`.

# Unit Testing Guide for casahero-ui

This project is a Vite + React 19 app using React Query, axios, and **MSW**. MSW is already used for mocks in the browser, and it is also what professional React teams use to fake the network in tests, so the existing `src/mocks/handlers.js` can be reused in tests as-is.

## The stack

| Layer | Tool | Why |
|---|---|---|
| Test runner | **Vitest** | Reads `vite.config.js` directly, so there's no extra build setup. Its API is Jest-compatible, so Jest tutorials still apply. |
| Fake browser | **jsdom** | Gives components a DOM to render into inside Node. |
| Component testing | **React Testing Library** (`@testing-library/react`) | The industry standard. You test what the user sees, not the component's internals. |
| User actions | **`@testing-library/user-event`** | Simulates real clicks and typing. |
| Extra assertions | **`@testing-library/jest-dom`** | Adds checks like `toBeInTheDocument()` and `toBeDisabled()`. |
| Network mocking | **MSW** (`msw/node`) | Intercepts real axios requests, so the API layer gets tested too. |
| Coverage | **`@vitest/coverage-v8`** | Shows which lines your tests never run. |

What "industry grade" adds on top of these tools comes in Step 7.

---

## Tutorial

### Step 1: Install

```bash
npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitest/coverage-v8
```

### Step 2: Configure Vitest in `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { minify: false, terserOptions: {} },
  test: {
    environment: 'jsdom',
    globals: true,                    // lets you use describe/it/expect without importing them
    setupFiles: './src/test/setup.js',
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/mocks/**', 'src/main.jsx'],
    },
  },
});
```

### Step 3: Create a setup file, `src/test/setup.js`

```js
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

// Same handlers the browser uses, now running inside Node for tests
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // fail if a request isn't mocked
afterEach(() => {
  server.resetHandlers(); // undo any per-test overrides
  cleanup();              // remove rendered components between tests
});
afterAll(() => server.close());
```

### Step 4: Add scripts to `package.json`

```json
"test": "vitest",
"test:run": "vitest run",
"coverage": "vitest run --coverage"
```

`npm test` runs in watch mode and re-runs tests every time you save. That's the mode to use while coding.

---

### Step 5: Write your first tests, from easiest to hardest

Put each test file next to the file it tests, named `Something.test.js(x)`.

#### Level 1: A pure function, `src/shared/validators.test.js`

```js
import { validateEmail, validatePassword, validateConfirm, validateForm } from './validators';

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Email is required.');
    expect(validateEmail('   ')).toBe('Email is required.');
  });

  it('rejects malformed emails', () => {
    expect(validateEmail('jake@')).toBe('Enter a valid email address.');
  });

  it('accepts a valid email', () => {
    expect(validateEmail('jake@gmail.com')).toBe('');
  });
});

describe('validatePassword', () => {
  it.each([
    ['', 'Password is required.'],
    ['short', 'Password must be at least 8 characters.'],
    ['longenough', ''],
  ])('"%s" -> "%s"', (input, expected) => {
    expect(validatePassword(input)).toBe(expected);
  });
});

it('validateForm collects only failing fields', () => {
  const errors = validateForm(
    { email: 'bad', password: 'longenough', confirm: 'nope' },
    {
      email: validateEmail,
      password: validatePassword,
      confirm: (value, all) => validateConfirm(all.password, value),
    },
  );
  expect(errors).toEqual({
    email: 'Enter a valid email address.',
    confirm: 'Passwords do not match.',
  });
});
```

Every test follows the same pattern: **Arrange → Act → Assert**. Set up the input, call the code, then check the result.

#### Level 2: A component, `src/shared/NumberPicker.test.jsx`

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumberPicker from './NumberPicker';

const setup = (props) => {
  const onChange = vi.fn(); // a "spy" that records how it was called
  render(<NumberPicker label="Beds" value={2} onChange={onChange} {...props} />);
  return { onChange, user: userEvent.setup() };
};

it('increases the value when + is clicked', async () => {
  const { onChange, user } = setup();
  await user.click(screen.getByRole('button', { name: 'Increase Beds' }));
  expect(onChange).toHaveBeenCalledWith(3);
});

it('disables + at max', () => {
  setup({ value: 10, max: 10 });
  expect(screen.getByRole('button', { name: 'Increase Beds' })).toBeDisabled();
});

it('shows "Any" and goes to min from Any when allowAny', async () => {
  const { onChange, user } = setup({ value: null, allowAny: true, min: 1 });
  expect(screen.getByText('Any')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Decrease Beds' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Increase Beds' }));
  expect(onChange).toHaveBeenCalledWith(1);
});

it('drops to Any when decreasing below min with allowAny', async () => {
  const { onChange, user } = setup({ value: 1, allowAny: true, min: 1 });
  await user.click(screen.getByRole('button', { name: 'Decrease Beds' }));
  expect(onChange).toHaveBeenCalledWith(null);
});
```

The golden rule is to **find elements the way a user would**. Use `getByRole` first, then `getByLabelText`, then `getByText`. Avoid class names and `data-testid` unless nothing else works. These tests work because the buttons already have `aria-label`s, which makes the component accessible as well as testable.

#### Level 3: A React Query hook with the network mocked, `src/hooks/useListings.test.jsx`

```jsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../test/setup';
import { useListings } from './useListings';

// Each test gets a fresh cache and no retries, so failures show up fast
const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

it('does not fetch until filters are provided', () => {
  const { result } = renderHook(() => useListings(null), { wrapper });
  expect(result.current.fetchStatus).toBe('idle');
});

it('returns listings from the API', async () => {
  const { result } = renderHook(() => useListings({ region: 'Central' }), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});

it('surfaces server errors', async () => {
  // Override the default handler for this test only
  server.use(http.post('*/casahero-api/listings', () => new HttpResponse(null, { status: 500 })));
  const { result } = renderHook(() => useListings({ region: 'Central' }), { wrapper });
  await waitFor(() => expect(result.current.isError).toBe(true));
});
```

If the handlers use `delay()`, you may need to raise the timeout: `waitFor(..., { timeout: 3000 })`.

At this level the whole chain is tested for real: the hook calls axios, axios runs the interceptor, and the request reaches MSW. Only the network itself is fake.

---

### Step 6: Run the tests

```bash
npm test          # watch mode
npm run coverage  # then open coverage/index.html in a browser
```

### Step 7: What makes it industry grade

1. **Test behaviour, not implementation.** If you refactor a component's internals and the UI still works, the tests should still pass.
2. **Test the risky parts first:** validators, auth and role routing (`SafeRoute.jsx`, `roles.js`), search filters (`searchParams.js`), loading, empty and error states, and forms.
3. **Treat coverage as a guide, not a target.** About 70–80% on logic is healthy. Don't write empty tests just to raise the number. You can enforce a minimum with `coverage.thresholds: { lines: 70 }`.
4. **Keep tests independent.** Every test sets up its own data, and none rely on the order they run in.
5. **Run tests on every PR in CI.** For example, `.github/workflows/test.yml`:
   ```yaml
   name: test
   on: [pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 22, cache: npm }
         - run: npm ci
         - run: npm run lint
         - run: npm run coverage
   ```
6. **Add a lint plugin:** `eslint-plugin-testing-library` catches common mistakes in tests.
7. **Next steps after unit tests:** **Playwright** for end-to-end tests that drive a real browser, and optionally Storybook for component previews and visual tests. Together these form the usual "testing pyramid": many unit tests, fewer integration tests, and a handful of end-to-end tests.

## Beginner gotchas

- **"Unable to find element…"** after a click or fetch: use `await screen.findByText(...)` or `waitFor`, because the UI updates asynchronously.
- **Components using `useNavigate` or `Link`** need to be wrapped in `<MemoryRouter>` from `react-router-dom` when rendered in a test.
- **Components using React Query** need the `QueryClientProvider` wrapper shown in Level 3. Put it in a shared `src/test/utils.jsx` as a `renderWithProviders` helper so every test can reuse it.
- **`import.meta.env.VITE_API_URL`** is not set in tests, so the base URL falls back to `/casahero-api`. That's why the MSW handlers that start with `*/casahero-api/...` match.

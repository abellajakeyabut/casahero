import { useCallback, useState } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import AppContext from '../context/AppContext';

// no retries, so failing requests show their error state straight away
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

// prints the current URL so tests can check where a component navigated
export const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  );
};

// like AppProvider, but starts with a given user and records every update
const TestAppProvider = ({ initialUser, onUpdate, children }) => {
  const [userContext, setUserContext] = useState(initialUser);
  const updateUserContext = useCallback(
    (data) => {
      onUpdate(data);
      setUserContext(data);
    },
    [onUpdate],
  );
  return (
    <AppContext.Provider value={{ userContext, updateUserContext }}>
      {children}
    </AppContext.Provider>
  );
};

// a logged-in user in the same shape as the /me and /login mocks return
export const makeUser = (overrides = {}) => ({
  id: 'tn-001',
  email: 'jason.lim@gmail.com',
  full_name: 'Jason Lim',
  default_role: 'tenant',
  loggedIn: true,
  ...overrides,
});

// the /me mock reads the user from localStorage
export const loginAs = (user = makeUser()) =>
  localStorage.setItem('userContext', JSON.stringify(user));

export const renderWithProviders = (
  ui,
  { route = '/', userContext = null, queryClient = createTestQueryClient() } = {},
) => {
  const updateUserContext = vi.fn();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <TestAppProvider initialUser={userContext} onUpdate={updateUserContext}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
          <LocationDisplay />
        </MemoryRouter>
      </TestAppProvider>
    </QueryClientProvider>,
  );
  return { ...utils, user: userEvent.setup(), updateUserContext, queryClient };
};

// wrapper for renderHook
export const queryWrapper = (queryClient = createTestQueryClient()) => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

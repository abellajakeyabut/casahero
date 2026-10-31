import { render, screen, waitFor } from '@testing-library/react';
import { loginAs, makeUser } from './utils';

// App creates its QueryClient at import time, so load a fresh copy per test to avoid a shared cache
const renderApp = async (path) => {
  vi.resetModules();
  // AppProvider too, so both use the same fresh AppContext
  const { default: App } = await import('../App');
  const { default: AppProvider } = await import('../context/AppProvider');
  window.history.pushState({}, '', path);
  return render(
    <AppProvider>
      <App />
    </AppProvider>,
  );
};

describe('App routes', () => {
  afterEach(() => window.history.pushState({}, '', '/'));

  it('shows the landing page at /', async () => {
    await renderApp('/');
    expect(screen.getByRole('heading', { name: 'Own a property?' })).toBeInTheDocument();
  });

  it('shows the login page at /login', async () => {
    await renderApp('/login');
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  });

  it('shows the signup page at /signup', async () => {
    await renderApp('/signup');
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('shows the search page at /search', async () => {
    await renderApp('/search');
    expect(screen.getByText('Pick a property type and area to see units.')).toBeInTheDocument();
  });

  it('shows the under-construction page for unknown paths', async () => {
    await renderApp('/nowhere');
    expect(screen.getByText(/currently being built/i)).toBeInTheDocument();
  });

  it('sends logged-in users from /listings to their role home', async () => {
    loginAs(makeUser({ default_role: 'landlord' }));
    await renderApp('/listings');
    await waitFor(() => expect(window.location.pathname).toBe('/landlord'));
    expect(await screen.findByRole('navigation', { name: 'landlord menu' })).toBeInTheDocument();
  });

  it('shows the under-construction page for unbuilt role pages', async () => {
    loginAs(makeUser());
    await renderApp('/tenant/rent');
    expect(await screen.findByText(/currently being built/i)).toBeInTheDocument();
  });

  it('sends guests on a protected page to /login', async () => {
    await renderApp('/tenant');
    await waitFor(() => expect(window.location.pathname).toBe('/login'));
  });
});

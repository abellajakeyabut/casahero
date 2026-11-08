import TopBanner from '../shared/TopBanner';
import { screen, waitFor } from '@testing-library/react';

import { renderWithProviders, makeUser } from './utils';
describe('TopBanner', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('welcomes guests and offers Register and Login', () => {
    renderWithProviders(<TopBanner />);
    expect(screen.getByText('Welcome, Guest !')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Register' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Log out' }),
    ).not.toBeInTheDocument();
  });
  it('welcomes a logged-in user by name', () => {
    renderWithProviders(<TopBanner />, { userContext: makeUser() });
    expect(screen.getByText('Welcome, Jason Lim')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Login' }),
    ).not.toBeInTheDocument();
  });
  it('publishes its height as --banner-height', () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback) {
          this.callback = callback;
        }
        observe() {
          this.callback();
        }
        disconnect() {}
      },
    );
    renderWithProviders(<TopBanner />);
    // jsdom has no layout, so the height is 0
    expect(
      document.documentElement.style.getPropertyValue('--banner-height'),
    ).toBe('0px');
  });

  it('logs out, clears the user and goes to /login', async () => {
    localStorage.setItem('userContext', '{}');
    const { user } = renderWithProviders(<TopBanner />, {
      route: '/tenant',
      userContext: makeUser(),
    });
    await user.click(screen.getByRole('button', { name: 'Log out' }));
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/login'),
    );
    expect(localStorage.getItem('userContext')).toBeNull();
  });
  it('navigates to signup, login and home', async () => {
    const { user } = renderWithProviders(<TopBanner />, {
      route: '/somewhere',
    });
    await user.click(screen.getByRole('button', { name: 'Register' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/signup');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
    await user.click(screen.getByRole('heading', { name: 'casahero' }));
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
  });

});

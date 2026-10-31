import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { renderWithProviders } from './utils';
import AuthProvider from '../features/authentication/AuthProvider';
import Login from '../features/authentication/Login';

const setup = (options) =>
  renderWithProviders(
    <AuthProvider>
      <Login />
    </AuthProvider>,
    { route: '/login', ...options },
  );

const fillAndSubmit = async (user, email, password) => {
  await user.type(screen.getByPlaceholderText('Email'), email);
  await user.type(screen.getByPlaceholderText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Log In' }));
};

describe('Login', () => {
  it('resets to logged out on mount, keeping the chosen role', () => {
    localStorage.setItem('userContext', '{"loggedIn":true}');
    const { updateUserContext } = setup({ userContext: { default_role: 'landlord', loggedIn: true } });

    expect(localStorage.getItem('userContext')).toBeNull();
    const updater = updateUserContext.mock.calls[0][0];
    expect(updater({ default_role: 'landlord' })).toEqual({
      default_role: 'landlord',
      loggedIn: false,
      username: '',
    });
    // nothing picked yet: default to tenant
    expect(updater(null).default_role).toBe('tenant');
  });

  it('uses the landlord button style for landlords', () => {
    setup({ userContext: { default_role: 'landlord' } });
    expect(screen.getByRole('button', { name: 'Log In' })).toHaveClass('login-button-landlord');
  });

  it('uses the tenant button style otherwise', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Log In' })).toHaveClass('login-button');
  });

  it('goes to /listings after a successful login', async () => {
    const { user } = setup();
    await fillAndSubmit(user, 'jake@gmail.com', 'password123');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/listings'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error for a wrong password', async () => {
    const { user } = setup();
    await fillAndSubmit(user, 'jake@gmail.com', 'wrong');
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password.');
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('shows an error when the server cannot be reached', async () => {
    server.use(http.post('*/casahero-api/login', () => HttpResponse.error()));
    const { user } = setup();
    await fillAndSubmit(user, 'jake@gmail.com', 'password123');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the server');
  });

  it('shows the social buttons and forgot-password link', () => {
    setup();
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Forgot Password?' })).toBeInTheDocument();
  });
});

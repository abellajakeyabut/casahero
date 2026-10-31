import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, loginAs, makeUser } from './utils';
import SafeRoute from '../SafeRoute';

const setup = (route) =>
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<p>login page</p>} />
      <Route path="/tenant" element={<SafeRoute role="tenant" />}>
        <Route index element={<p>tenant home</p>} />
      </Route>
      <Route path="/landlord" element={<SafeRoute role="landlord" />}>
        <Route index element={<p>landlord home</p>} />
      </Route>
      <Route
        path="/any"
        element={
          <SafeRoute>
            <p>any role</p>
          </SafeRoute>
        }
      />
    </Routes>,
    { route },
  );

describe('SafeRoute', () => {
  it('sends guests to /login', async () => {
    setup('/tenant');
    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  it('treats a user without a role as a guest', async () => {
    loginAs({ loggedIn: true });
    setup('/any');
    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  it('renders the nested route for the right role and stores the user', async () => {
    const tenant = makeUser();
    loginAs(tenant);
    const { updateUserContext } = setup('/tenant');
    expect(await screen.findByText('tenant home')).toBeInTheDocument();
    await waitFor(() => expect(updateUserContext).toHaveBeenCalledWith(tenant));
  });

  it('sends users with another role to their own home', async () => {
    loginAs(makeUser());
    setup('/landlord');
    expect(await screen.findByText('tenant home')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/tenant');
  });

  it('renders children for any logged-in role', async () => {
    loginAs(makeUser({ default_role: 'landlord' }));
    setup('/any');
    expect(await screen.findByText('any role')).toBeInTheDocument();
  });
});

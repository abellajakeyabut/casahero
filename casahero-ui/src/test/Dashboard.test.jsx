import { screen } from '@testing-library/react';
import { renderWithProviders, makeUser } from './utils';
import Dashboard from '../features/dashboard/Dashboard';

const landlord = makeUser({ default_role: 'landlord' });

describe('Dashboard', () => {
  it('opens on Home with the role menu', () => {
    renderWithProviders(<Dashboard />, { route: '/landlord', userContext: landlord });
    expect(screen.getByRole('navigation', { name: 'landlord menu' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('shows the search bar under Search and navigates on submit', async () => {
    const { user } = renderWithProviders(<Dashboard />, { route: '/landlord', userContext: landlord });
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.queryByRole('heading', { name: 'Home' })).not.toBeInTheDocument();

    await user.click(await screen.findByLabelText('Landed'));
    // the sidebar item and the form button are both named Search; the form button is the submit one
    const submit = screen.getAllByRole('button', { name: 'Search' }).find((b) => b.type === 'submit');
    await user.click(submit);
    expect(screen.getByTestId('location')).toHaveTextContent('/search?type=Landed');
  });

  it('opens the item passed in the location state', () => {
    renderWithProviders(<Dashboard />, {
      route: { pathname: '/tenant', state: { activeKey: 'Search' } },
      userContext: makeUser(),
    });
    expect(screen.getByRole('button', { name: 'Search', current: 'page' })).toBeInTheDocument();
  });

  it('falls back to the first item for an unknown key, and shows nothing for other items', async () => {
    const { user } = renderWithProviders(<Dashboard />, {
      route: { pathname: '/tenant', state: { activeKey: 'leases' } },
    });
    // tenants have no leases item, so Home is shown
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Rent' }));
    expect(screen.queryByRole('heading', { name: 'Home' })).not.toBeInTheDocument();
  });
});

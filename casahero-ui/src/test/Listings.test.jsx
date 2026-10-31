import { screen } from '@testing-library/react';
import { renderWithProviders, makeUser } from './utils';
import Listings from '../features/listings/Listings';

describe('Listings', () => {
  it('shows the search bar under the first item', () => {
    renderWithProviders(<Listings />, { userContext: makeUser() });
    expect(screen.getByRole('navigation', { name: 'tenant menu' })).toBeInTheDocument();
    expect(document.querySelector('#search-button')).toBeInTheDocument();
  });

  it('shows "Coming soon" for the other items', async () => {
    const { user } = renderWithProviders(<Listings />, { userContext: makeUser() });
    await user.click(screen.getByRole('button', { name: 'Messages' }));
    expect(screen.getByRole('heading', { name: 'Messages' })).toBeInTheDocument();
    expect(screen.getByText('Coming soon.')).toBeInTheDocument();
  });

  it('opens the item from the location state and falls back for unknown keys', () => {
    renderWithProviders(<Listings />, {
      route: { pathname: '/listings', state: { activeKey: 'leases' } },
      userContext: makeUser({ default_role: 'landlord' }),
    });
    expect(screen.getByRole('heading', { name: 'Leases' })).toBeInTheDocument();
  });

  it('navigates to /search on submit', async () => {
    const { user } = renderWithProviders(<Listings />, {
      route: { pathname: '/listings', state: { activeKey: 'nope' } },
    });
    await user.click(await screen.findByLabelText('Condo'));
    await user.click(document.querySelector('#search-button'));
    expect(screen.getByTestId('location')).toHaveTextContent('/search?type=Condo');
  });
});

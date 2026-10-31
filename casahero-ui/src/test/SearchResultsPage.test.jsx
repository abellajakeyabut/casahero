import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { renderWithProviders, loginAs, makeUser } from './utils';
import SearchResultsPage from '../features/search/SearchResultsPage';

const setup = (route = '/search', options) =>
  renderWithProviders(<SearchResultsPage />, { route, ...options });

// the seeded mock has thousands of units; a small fixture keeps renders fast
const listings = [
  {
    id: 'pr-1',
    name: 'Test Flat',
    property_type: 'HDB',
    city: 'Tampines',
    region: 'East',
    units: [1, 2].map((n) => ({
      id: `un-${n}`,
      unit_number: `#01-0${n}`,
      bedrooms: 2,
      bathrooms: 1,
      area_sqft: 700,
      asking_rent_cents: 250000,
      status: 'vacant',
      photo_paths: [],
    })),
  },
];

describe('SearchResultsPage', () => {
  beforeEach(() => {
    server.use(
      http.post('*/casahero-api/listings', async ({ request }) => {
        const { bed } = await request.json();
        return HttpResponse.json(bed > 5 ? [] : listings);
      }),
    );
  });

  it('asks guests to start a search when there are no filters', () => {
    setup();
    expect(screen.getByText('Pick a property type and area to see units.')).toBeInTheDocument();
    expect(screen.getAllByText('Start a search')).toHaveLength(2);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('opens the search bar from the empty state', async () => {
    const { user } = setup();
    const toggle = screen.getByRole('button', { name: 'Edit search ▾' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(screen.getByRole('button', { name: 'Start a search' }));
    expect(screen.getByRole('button', { name: 'Hide search ▴' })).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByLabelText('Condo')).toBeInTheDocument();
  });

  it('describes the filters from the URL and shows the results', async () => {
    setup('/search?type=HDB&region=East&city=Tampines&bed=2');
    expect(screen.getByText('HDB · East › Tampines · 2+ bed')).toBeInTheDocument();
    expect(await screen.findByText(/in Tampines, East/)).toBeInTheDocument();
  });

  it('runs a new search from the bar and collapses it', async () => {
    const { user } = setup('/search?type=HDB&region=East');
    await user.click(screen.getByRole('button', { name: 'Edit search ▾' }));
    await user.click(await screen.findByLabelText('Condo'));
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/search?type=Condo&region=East');
    expect(screen.getByRole('button', { name: 'Edit search ▾' })).toBeInTheDocument();
    expect(screen.getByText('Condo · East')).toBeInTheDocument();
  });

  it('can hide the bar again', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Edit search ▾' }));
    await user.click(screen.getByRole('button', { name: 'Hide search ▴' }));
    expect(screen.getByRole('button', { name: 'Edit search ▾' })).toBeInTheDocument();
  });

  it('opens the edit panel when no units match', async () => {
    const { user } = setup('/search?type=Landed&region=East&city=Tampines&bed=9');
    await user.click(await screen.findByRole('button', { name: 'Edit search' }));
    expect(screen.getByRole('button', { name: 'Hide search ▴' })).toBeInTheDocument();
  });

  it('restores a logged-in user from /me and shows their sidebar', async () => {
    const me = makeUser({ default_role: 'landlord' });
    loginAs(me);
    const { user, updateUserContext } = setup('/search?type=HDB');

    await waitFor(() => expect(updateUserContext).toHaveBeenCalledWith(me));
    expect(await screen.findByRole('navigation', { name: 'landlord menu' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Leases' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/landlord');
  });
});

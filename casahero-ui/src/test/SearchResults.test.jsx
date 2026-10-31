import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { renderWithProviders, makeUser } from './utils';
import SearchResults from '../features/search/SearchResults';

const oneUnit = [
  {
    id: 'pr-1',
    name: 'Test Flat',
    property_type: 'HDB',
    city: 'Tampines',
    region: 'East',
    units: [
      {
        id: 'un-1',
        unit_number: '#01-01',
        bedrooms: 2,
        bathrooms: 1,
        area_sqft: 700,
        asking_rent_cents: 250000,
        status: 'vacant',
        photo_paths: [],
      },
    ],
  },
];

const setup = (filters, options) => {
  const onEditSearch = vi.fn();
  const utils = renderWithProviders(
    <SearchResults filters={filters} onEditSearch={onEditSearch} />,
    { route: '/search', ...options },
  );
  return { ...utils, onEditSearch };
};

describe('SearchResults', () => {
  it('shows skeleton cards while loading', () => {
    const { container } = setup({ region: 'East' });
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(container.querySelectorAll('.listing-card-skeleton')).toHaveLength(6);
  });

  it('shows a card per unit with the place in the summary', async () => {
    setup({ type: 'HDB', region: 'East', city: 'Tampines' });
    expect(await screen.findByText(/units in Tampines, East/)).toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(1);
  });

  it('uses "unit" for a single result and no place without region/city', async () => {
    server.use(http.post('*/casahero-api/listings', () => HttpResponse.json(oneUnit)));
    setup({ type: 'HDB' });
    expect(await screen.findByText('1 unit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in to enquire' })).toBeInTheDocument();
  });

  it('passes loggedIn to the cards', async () => {
    server.use(http.post('*/casahero-api/listings', () => HttpResponse.json(oneUnit)));
    setup({ type: 'HDB' }, { userContext: makeUser() });
    expect(await screen.findByRole('button', { name: 'Enquire' })).toBeInTheDocument();
  });

  it('offers to edit the search when nothing matches', async () => {
    server.use(http.post('*/casahero-api/listings', () => HttpResponse.json([])));
    const { user, onEditSearch } = setup({ region: 'East' });
    expect(await screen.findByText('No units match this search.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit search' }));
    expect(onEditSearch).toHaveBeenCalled();
  });

  it('shows an error with a retry that refetches', async () => {
    let calls = 0;
    server.use(
      http.post('*/casahero-api/listings', () => {
        calls += 1;
        return calls === 1 ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(oneUnit);
      }),
    );
    const { user } = setup({ type: 'HDB' });
    expect(await screen.findByText('Could not load results.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('1 unit')).toBeInTheDocument();
  });
});

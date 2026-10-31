import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from './utils';
import ListingCard from '../features/search/ListingCard';

const property = {
  name: 'Tampines Central Flat',
  property_type: 'HDB',
  city: 'Tampines',
  region: 'East',
};
const unit = {
  id: 'un-001',
  unit_number: '#08-112',
  bedrooms: 3,
  bathrooms: 2,
  area_sqft: 1000,
  asking_rent_cents: 320000,
  status: 'vacant',
  photo_paths: ['units/un-001/living.jpg'],
};

const setup = (overrides = {}) =>
  renderWithProviders(
    <ListingCard
      unit={{ ...unit, ...overrides.unit }}
      property={{ ...property, ...overrides.property }}
      loggedIn={overrides.loggedIn ?? false}
    />,
    { route: '/search' },
  );

describe('ListingCard', () => {
  it('shows the unit details', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Tampines Central Flat' })).toBeInTheDocument();
    expect(screen.getByText(/S\$3,200/)).toBeInTheDocument();
    expect(screen.getByText('#08-112 · Tampines, East')).toBeInTheDocument();
    expect(screen.getByText('🛏 3')).toBeInTheDocument();
    expect(screen.getByText('🛁 2')).toBeInTheDocument();
    expect(screen.getByText('📐 1,000 sqft')).toBeInTheDocument();
    expect(screen.getByText('S$3.20/sqft · Available')).toBeInTheDocument();
    expect(screen.getByText('HDB')).toBeInTheDocument();
  });

  it('shows the first photo', () => {
    setup();
    expect(screen.getByRole('img', { name: 'Tampines Central Flat #08-112' })).toHaveAttribute(
      'src',
      '/units/un-001/living.jpg',
    );
  });

  it('falls back to the placeholder when the photo fails to load', () => {
    setup();
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('🏢')).toBeInTheDocument();
  });

  it.each([
    ['Condo', '🏙️'],
    ['Landed', '🏡'],
    ['Shophouse', '🏠'],
  ])('shows the %s placeholder when there is no photo', (type, icon) => {
    setup({ unit: { photo_paths: [] }, property: { property_type: type } });
    expect(screen.getByText(icon)).toBeInTheDocument();
  });

  it('shows the status when the unit is not vacant, and no price per sqft without an area', () => {
    setup({ unit: { status: 'occupied', area_sqft: 0, photo_paths: undefined } });
    expect(screen.getByText('occupied')).toBeInTheDocument();
    expect(screen.queryByText(/\/sqft ·/)).not.toBeInTheDocument();
  });

  it('asks guests to sign in and sends them to /login', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in to enquire' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('shows disabled save/enquire buttons for logged-in users', () => {
    setup({ loggedIn: true });
    expect(screen.getByRole('button', { name: '♡ Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enquire' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Sign in to enquire' })).not.toBeInTheDocument();
  });
});

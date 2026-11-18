import { screen } from '@testing-library/react';
import { properties, leases } from '../mocks/db';
import { getListings } from '../api/listings';
import ListingCard from '../features/search/ListingCard';
import { renderWithProviders } from './utils';

// each property is one rentable unit: a flat row with no nested units
describe('properties data', () => {
  it('has unique ids and no unit nesting', () => {
    expect(new Set(properties.map((p) => p.id)).size).toBe(properties.length);
    properties.forEach((p) => {
      expect(p).not.toHaveProperty('units');
      expect(p).not.toHaveProperty('property_id');
      expect(p).toEqual(
        expect.objectContaining({
          bedrooms: expect.any(Number),
          bathrooms: expect.any(Number),
          asking_rent_cents: expect.any(Number),
        }),
      );
    });
  });

  it('points every lease at an existing property', () => {
    const ids = new Set(properties.map((p) => p.id));
    leases.forEach((lease) => expect(ids.has(lease.property_id)).toBe(true));
  });
});

describe('POST /listings', () => {
  it('returns flat rows filtered by city and type', async () => {
    const rows = await getListings({ city: 'Tampines', type: 'HDB' });
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((p) => {
      expect(p.city).toBe('Tampines');
      expect(p.property_type).toBe('HDB');
      expect(p).not.toHaveProperty('units');
    });
  });

  it('treats bed and bath as minimums', async () => {
    const rows = await getListings({ city: 'Tampines', bed: 3, bath: 2 });
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((p) => {
      expect(p.bedrooms).toBeGreaterThanOrEqual(3);
      expect(p.bathrooms).toBeGreaterThanOrEqual(2);
    });
    // a 4-bed matches a 3+ search
    expect(rows.some((p) => p.bedrooms > 3)).toBe(true);
  });
});

describe('ListingCard', () => {
  const listing = properties.find((p) => p.id === 'pr-001');

  it('renders a single listing', () => {
    renderWithProviders(<ListingCard listing={listing} loggedIn={false} />);
    expect(screen.getByText('Tampines Central Flat')).toBeInTheDocument();
    expect(screen.getByText('#08-112 · Tampines, East')).toBeInTheDocument();
    expect(screen.getByText(/S\$3,200/)).toBeInTheDocument();
  });

  it('leaves out the unit number when there is none', () => {
    renderWithProviders(<ListingCard listing={{ ...listing, unit_number: null }} loggedIn={false} />);
    expect(screen.getByText('Tampines, East')).toBeInTheDocument();
  });
});

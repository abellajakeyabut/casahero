import { describeFilters, fromSearchParams, toSearchUrl } from '../features/search/searchParams';

describe('toSearchUrl', () => {
  it('puts the filters in the query string', () => {
    expect(toSearchUrl({ type: 'HDB', region: 'East', city: 'Tampines', bed: 2, bath: 1 })).toBe(
      '/search?type=HDB&region=East&city=Tampines&bed=2&bath=1',
    );
  });

  it('leaves out empty values and "Any"', () => {
    expect(toSearchUrl({ type: 'HDB', region: '', city: undefined, bed: null, bath: null })).toBe(
      '/search?type=HDB',
    );
  });

  it('keeps 0 as a value', () => {
    expect(toSearchUrl({ bed: 0 })).toBe('/search?bed=0');
  });
});

describe('fromSearchParams', () => {
  it('returns null when there are no filters', () => {
    expect(fromSearchParams(new URLSearchParams(''))).toBeNull();
  });

  it('reads text and numeric filters', () => {
    expect(fromSearchParams(new URLSearchParams('type=Condo&region=Central&bed=3&bath=2'))).toEqual({
      type: 'Condo',
      region: 'Central',
      bed: 3,
      bath: 2,
    });
  });

  it('drops numeric filters that are not numbers', () => {
    expect(fromSearchParams(new URLSearchParams('type=HDB&bed=lots'))).toEqual({ type: 'HDB' });
  });

  it('ignores unknown keys', () => {
    expect(fromSearchParams(new URLSearchParams('foo=bar'))).toBeNull();
  });
});

describe('describeFilters', () => {
  it('describes a full search', () => {
    expect(describeFilters({ type: 'HDB', region: 'East', city: 'Tampines', bed: 2, bath: 1 })).toBe(
      'HDB · East › Tampines · 2+ bed · 1+ bath',
    );
  });

  it('shows just the region when no city is chosen', () => {
    expect(describeFilters({ type: 'Condo', region: 'Central' })).toBe('Condo · Central');
  });

  it('returns an empty string for no filters', () => {
    expect(describeFilters({})).toBe('');
  });
});

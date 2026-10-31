import { listingKeys } from '../hooks/listingKeys';

describe('listingKeys', () => {
  it('builds list keys from the filters', () => {
    expect(listingKeys.all).toEqual(['listings']);
    expect(listingKeys.lists()).toEqual(['listings', 'list']);
    expect(listingKeys.list({ region: 'East' })).toEqual(['listings', 'list', { region: 'East' }]);
  });

  it('builds the lookup keys', () => {
    expect(listingKeys.listByType()).toEqual(['listings', 'by-type']);
    expect(listingKeys.listByRegion()).toEqual(['listings', 'by-region']);
    expect(listingKeys.listByCity()).toEqual(['listings', 'by-city']);
    expect(listingKeys.listByPropperty()).toEqual(['listings', 'by-property']);
    expect(listingKeys.listByLandlord()).toEqual(['listings', 'by-landlord']);
    expect(listingKeys.listByTenant()).toEqual(['listings', 'by-tenant']);
    expect(listingKeys.listRegions()).toEqual(['listings', 'list-regions']);
    expect(listingKeys.listCities('East')).toEqual(['listings', 'list-cities', 'East']);
    expect(listingKeys.listTypes()).toEqual(['listings', 'list-types']);
  });
});

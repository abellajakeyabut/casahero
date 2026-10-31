import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { getCitiesByRegion, getListings, getRegions, getTypes } from '../api/listings';

describe('listings api', () => {
  it('getListings filters by region, city and type', async () => {
    const result = await getListings({ type: 'HDB', region: 'East', city: 'Tampines' });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((property) => {
      expect(property).toMatchObject({ property_type: 'HDB', region: 'East', city: 'Tampines' });
    });
  });

  it('getListings sends the filters in the request body', async () => {
    let body;
    server.use(
      http.post('*/casahero-api/listings', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json([]);
      }),
    );
    await getListings({ type: 'Condo', bed: 2, bath: 1 });
    expect(body).toEqual({ type: 'Condo', bed: 2, bath: 1 });
  });

  it('getListings works with no filters', async () => {
    let body;
    server.use(
      http.post('*/casahero-api/listings', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json([]);
      }),
    );
    await expect(getListings()).resolves.toEqual([]);
    expect(body).toEqual({});
  });

  it('getRegions returns the region list', async () => {
    const result = await getRegions();
    expect(result).toContainEqual({ region: 'East' });
  });

  it('getCitiesByRegion returns only cities in that region', async () => {
    const result = await getCitiesByRegion({ region: 'East' });
    expect(result.map((c) => c.city)).toEqual(['Tampines', 'Bedok', 'Pasir Ris']);
  });

  it('getTypes returns the property types', async () => {
    const result = await getTypes();
    expect(result).toEqual([{ type: 'HDB' }, { type: 'Condo' }, { type: 'Landed' }]);
  });
});

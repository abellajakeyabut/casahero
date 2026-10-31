import { ROLES, homeFor } from '../roles';

describe('roles', () => {
  it('lists the landlord and tenant roles', () => {
    expect(ROLES).toEqual(['landlord', 'tenant']);
  });

  it('sends landlords to /landlord', () => {
    expect(homeFor('landlord')).toBe('/landlord');
  });

  it('sends tenants and unknown roles to /tenant', () => {
    expect(homeFor('tenant')).toBe('/tenant');
    expect(homeFor(undefined)).toBe('/tenant');
    expect(homeFor('admin')).toBe('/tenant');
  });
});

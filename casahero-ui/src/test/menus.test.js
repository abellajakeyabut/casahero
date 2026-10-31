import { getMenu, menus } from '../shared/sidebar/menus';

describe('getMenu', () => {
  it('returns the landlord menu', () => {
    expect(getMenu('landlord')).toBe(menus.landlord);
  });

  it('returns the tenant menu', () => {
    expect(getMenu('tenant')).toBe(menus.tenant);
  });

  it('falls back to the tenant menu for unknown roles', () => {
    expect(getMenu(undefined)).toBe(menus.tenant);
    expect(getMenu('admin')).toBe(menus.tenant);
  });

  it('starts every menu with home', () => {
    expect(menus.landlord[0].key).toBe('home');
    expect(menus.tenant[0].key).toBe('home');
  });
});

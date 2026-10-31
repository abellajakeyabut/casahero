import { renderHook, waitFor } from '@testing-library/react';
import { queryWrapper } from './utils';
import { useCities, useListings, useRegions, useTypes } from '../hooks/useListings';

describe('useListings', () => {
  it('does not fetch until there are filters', () => {
    const { result } = renderHook(() => useListings(null), { wrapper: queryWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('fetches listings for the filters', async () => {
    const { result } = renderHook(() => useListings({ region: 'Central', type: 'Condo' }), {
      wrapper: queryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.length).toBeGreaterThan(0);
    result.current.data.forEach((p) => expect(p.region).toBe('Central'));
  });

  it('keeps the previous results while new filters load', async () => {
    const { result, rerender } = renderHook(({ filters }) => useListings(filters), {
      wrapper: queryWrapper(),
      initialProps: { filters: { region: 'East' } },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const previous = result.current.data;

    rerender({ filters: { region: 'West' } });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data).toBe(previous);
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
    result.current.data.forEach((p) => expect(p.region).toBe('West'));
  });
});

describe('useTypes / useRegions', () => {
  it('loads the property types', async () => {
    const { result } = renderHook(() => useTypes(), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
  });

  it('loads the regions', async () => {
    const { result } = renderHook(() => useRegions(), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toContainEqual({ region: 'North' });
  });
});

describe('useCities', () => {
  it('does not fetch without a region', () => {
    const { result } = renderHook(() => useCities(''), { wrapper: queryWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('loads the cities in a region', async () => {
    const { result } = renderHook(() => useCities('West'), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.map((c) => c.city)).toEqual(['Jurong West', 'Clementi', 'Bukit Batok']);
  });
});

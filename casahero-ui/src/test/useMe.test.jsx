import { renderHook, waitFor } from '@testing-library/react';
import { queryWrapper, loginAs, makeUser } from './utils';
import { useMe } from '../features/authentication/useMe';

describe('useMe', () => {
  it('returns the logged-in user', async () => {
    loginAs(makeUser({ full_name: 'Jake' }));
    const { result } = renderHook(() => useMe(), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ full_name: 'Jake', loggedIn: true });
  });

  it('errors for guests (401) without retrying', async () => {
    const { result } = renderHook(() => useMe(), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.response.status).toBe(401);
    expect(result.current.failureCount).toBe(1);
  });
});

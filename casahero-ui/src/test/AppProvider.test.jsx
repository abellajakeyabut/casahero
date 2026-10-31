import { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import AppProvider from '../context/AppProvider';
import AppContext from '../context/AppContext';

let ctx;
const Probe = () => {
  ctx = useContext(AppContext);
  return <span data-testid="user">{JSON.stringify(ctx.userContext)}</span>;
};

describe('AppProvider', () => {
  beforeEach(() => {
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
  });

  it('starts with no user and the tenant theme', () => {
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(document.documentElement.dataset.role).toBe('tenant');
  });

  it('stores a new user context', () => {
    act(() => ctx.updateUserContext({ full_name: 'Jake' }));
    expect(screen.getByTestId('user')).toHaveTextContent('"full_name":"Jake"');
  });

  it('accepts an updater function', () => {
    act(() => ctx.updateUserContext({ a: 1 }));
    act(() => ctx.updateUserContext((prev) => ({ ...prev, b: 2 })));
    expect(ctx.userContext).toEqual({ a: 1, b: 2 });
  });

  it('switches to the landlord theme for a logged-in landlord', () => {
    act(() => ctx.updateUserContext({ loggedIn: true, default_role: 'landlord' }));
    expect(document.documentElement.dataset.role).toBe('landlord');
  });

  it('keeps the tenant theme for a landlord who is not logged in', () => {
    act(() => ctx.updateUserContext({ loggedIn: false, default_role: 'landlord' }));
    expect(document.documentElement.dataset.role).toBe('tenant');
  });
});

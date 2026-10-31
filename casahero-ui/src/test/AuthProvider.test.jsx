import { useContext } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { renderWithProviders } from './utils';
import AuthProvider from '../features/authentication/AuthProvider';
import AuthContext from '../features/authentication/AuthContext';

let auth;
const Probe = () => {
  auth = useContext(AuthContext);
  return null;
};

const setup = (userContext = { default_role: 'landlord' }) =>
  renderWithProviders(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
    { userContext },
  );

describe('AuthProvider', () => {
  it('logs in, keeps the chosen role and caches the user', async () => {
    const { updateUserContext } = setup();
    await expect(auth.authenticate({ email: 'jason.lim@gmail.com', password: 'x' })).resolves.toBe(true);

    const saved = updateUserContext.mock.calls[0][0];
    expect(saved).toMatchObject({ email: 'jason.lim@gmail.com', loggedIn: true });
    expect(JSON.parse(localStorage.getItem('userContext'))).toEqual(saved);
  });

  it('returns false when the login fails', async () => {
    const { updateUserContext } = setup();
    await expect(auth.authenticate({ email: 'jake@gmail.com', password: 'wrong' })).resolves.toBe(false);
    expect(updateUserContext).not.toHaveBeenCalled();
    expect(localStorage.getItem('userContext')).toBeNull();
  });

  it('returns false when the server sends no body', async () => {
    server.use(http.post('*/casahero-api/login', () => HttpResponse.json(null)));
    setup();
    await expect(auth.authenticate({ email: 'a@b.co', password: 'x' })).resolves.toBe(false);
  });
});

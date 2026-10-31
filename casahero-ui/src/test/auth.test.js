import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { login, logout, signup, socialLogin } from '../api/auth';

describe('auth api', () => {
  it('signup registers a new user', async () => {
    const result = await signup({
      name: 'New User',
      email: 'new.user@example.com',
      password: 'password123',
      role: 'tenant',
    });
    expect(result).toEqual({ outcome: 'Signup successful!', success: true });
  });

  it('signup refuses an email that is already registered', async () => {
    const result = await signup({ name: 'Jake', email: 'jake@gmail.com', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('login returns the user on success', async () => {
    const result = await login({ email: 'jake@gmail.com', password: 'anything' });
    expect(result.success).toBe(true);
    expect(result.user).toMatchObject({ email: 'jake@gmail.com', default_role: 'landlord' });
  });

  it('login fails with the wrong password', async () => {
    const result = await login({ email: 'jake@gmail.com', password: 'wrong' });
    expect(result.success).toBe(false);
  });

  it('logout succeeds', async () => {
    const result = await logout({ email: 'jake@gmail.com' });
    expect(result.success).toBe(true);
  });

  it('socialLogin posts to the auth endpoint', async () => {
    let requestedUrl;
    server.use(
      http.post('*/casahero-api/auth/*', ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ success: true });
      }),
    );
    const result = await socialLogin({ role: 'tenant' });
    expect(result).toEqual({ success: true });
    // NOTE: the path uses single quotes, so `${provider}` is sent literally instead of google/facebook
    expect(decodeURIComponent(requestedUrl)).toContain('/auth/${provider}');
  });
});

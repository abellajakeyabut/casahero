import { http, HttpResponse, delay } from 'msw';
import { landlords, tenants, leases } from './db';

const PROVIDERS = ['google', 'facebook'];

const usersFor = (role) => (role === 'landlord' ? landlords : tenants);

const findUserByEmail = (email) =>
  [...landlords, ...tenants].find(
    (user) => user.email.toLowerCase() === email?.trim().toLowerCase(),
  );

const fakeUser = ({ email, role = 'tenant', provider = 'email' }) => ({
  id: `${role === 'landlord' ? 'll' : 'tn'}-${Date.now()}`,
  email,
  full_name: email.split('@')[0],
  phone: null,
  avatar_url: null,
  default_role: role,
  auth_provider: provider,
  created_at: new Date().toISOString(),
});

export const handlers = [
  http.get('*/casahero-api/me', () => {
    let userContext = localStorage.getItem('userContext');
    if (userContext) {
      return HttpResponse.json(JSON.parse(userContext));
    }
    return HttpResponse.json({ error: 'Invalid Login' }, { status: 401 });
  }),
  // '*' matches any origin, so this works whether VITE_API_URL is absolute or relative
  http.get('*/casahero-api/test', () => {
    return HttpResponse.json({ id: 1, message: 'hello bandit' });
  }),
  http.get('*/casahero-api/landlords', () => {
    return HttpResponse.json(landlords);
  }),
  http.get('*/casahero-api/leases', () => {
    return HttpResponse.json(leases);
  }),
  http.post('*/casahero-api/signup', async ({ request }) => {
    const { email } = await request.json();
    await delay(1000);
    if (findUserByEmail(email)) {
      return HttpResponse.json({
        outcome: 'Email already registered',
        success: false,
      });
    }
    return HttpResponse.json({ outcome: 'Signup successful!', success: true });
  }),
  http.post('*/casahero-api/login', async ({ request }) => {
    // username is still accepted until Login.jsx switches to email
    const { email = '', username = '', password } = await request.json();
    await delay(1000);
    // use the password "wrong" to test the failure path
    if (password === 'wrong') {
      return HttpResponse.json({
        outcome: 'Invalid email or password',
        success: false,
      });
    }
    const login = email || username;
    const user =
      findUserByEmail(login) ??
      fakeUser({ email: login.includes('@') ? login : `${login}@example.com` });
    return HttpResponse.json({
      outcome: 'login successful!',
      success: true,
      user,
    });
  }),
  http.post('*/casahero-api/auth/:provider', async ({ params, request }) => {
    const { provider } = params;
    if (!PROVIDERS.includes(provider)) {
      return HttpResponse.json(
        { outcome: `Unsupported provider: ${provider}`, success: false },
        { status: 400 },
      );
    }
    const { role = 'tenant' } = await request.json().catch(() => ({}));
    await delay(1000);
    const user =
      usersFor(role).find((u) => u.auth_provider === provider) ??
      fakeUser({
        email: `${provider}.user@example.com`,
        role,
        provider,
        full_name: 'fake user',
      });
    return HttpResponse.json({
      outcome: `${provider} login successful!`,
      success: true,
      ...user,
    });
  }),

  http.post('*/casahero-api/logout', async () => {
    await delay(3000);
    return HttpResponse.json({ outcome: 'logout successful!', success: true });
  }),
];

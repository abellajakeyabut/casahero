import { http, HttpResponse, delay } from 'msw';
import { landlords, tenants, leases, properties, units ,regions,cities,propertyTypes,menus} from './db';

const PROVIDERS = ['google', 'facebook'];

// users created through the signup mock; lives until the page reloads
const registeredUsers = [];

const usersFor = (role) => (role === 'landlord' ? landlords : tenants);

const findUserByEmail = (email) =>
  [...landlords, ...tenants, ...registeredUsers].find(
    (user) => user.email.toLowerCase() === email?.trim().toLowerCase(),
  );

// never send the stored password back to the client
const withoutPassword = (user) => {
  const copy = { ...user };
  delete copy.password;
  return copy;
};

const fakeUser = ({ email, role = 'tenant', provider = 'email', full_name }) => ({
  id: `${role === 'landlord' ? 'll' : 'tn'}-${Date.now()}`,
  email,
  full_name: full_name || email.split('@')[0],
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
  http.get('*/casahero-api/menus',async ({request})=>{
    const {roleId} = await request.json();
    const data =  menus.filter((menu)=>menu.roleId===roleId);
    return HttpResponse.json(data);
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
    const { name, email, password, role } = await request.json();
    await delay(1000);
    if (findUserByEmail(email)) {
      return HttpResponse.json({
        outcome: 'Email already registered',
        success: false,
      });
    }
    registeredUsers.push({
      ...fakeUser({
        email: email.trim(),
        full_name: name?.trim(),
        // anything other than landlord falls back to tenant
        role: role === 'landlord' ? 'landlord' : 'tenant',
      }),
      password,
    });
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
    const found = findUserByEmail(login);
    // signed-up users must log in with the password they registered with
    if (found?.password !== undefined && found.password !== password) {
      return HttpResponse.json({
        outcome: 'Invalid email or password',
        success: false,
      });
    }
    const user = found
      ? withoutPassword(found)
      : fakeUser({ email: login.includes('@') ? login : `${login}@example.com` });
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
    await delay(1000);
    return HttpResponse.json({ outcome: 'logout successful!', success: true });
  }),
  http.post('*/casahero-api/listings', async ({ request }) => {
    await delay(1000);

    let body = {}
    try{
      body = await request.json();
    }catch{
  
    }
    const { city = '', region = '', type = '', bed, bath } = body ?? {}
    // bed/bath are minimums; a property only matches if one of its units does
    const unitMatches = (unit) =>
      (bed == null || unit.bedrooms == bed) && (bath == null || unit.bathrooms == bath)
    let props = properties.map((data) => { return { ...data, units: units.filter((unit) => unit.property_id == data.id && unitMatches(unit)) } })

    if(city) props = props.filter((p)=>p.city==city)
    if(region) props = props.filter((p)=>p.region==region)
    // the SearchBar sends HDB/Condo/Landed as `type`; that lives in property_type
    if(type) props = props.filter((p)=>p.property_type==type)
    // p.units is an array (already narrowed by unitMatches), so drop properties with no matching unit
    if(bed != null || bath != null) props = props.filter((p)=>p.units.length > 0)

    return HttpResponse.json(props);
  }),
  http.post('*/casahero-api/regions',async()=>{
    await delay(2000);
    let reg = regions;
    return HttpResponse.json(reg);
  }),
  http.get('*/casahero-api/cities',async({request})=>{
    await delay(2000);
    const url = new URL(request.url);
    const region = url.searchParams.get('region') ?? 'North-East';
    const  cityP = cities.filter((data) => data.region==region)
   
    return HttpResponse.json(cityP);
  }),
  http.get('*/casahero-api/types',async()=>{
    await delay(2000);
   
    const  lsitOfTypes = propertyTypes; 
   
    return HttpResponse.json(lsitOfTypes);
  })
];

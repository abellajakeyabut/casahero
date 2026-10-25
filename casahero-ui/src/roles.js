// Each role has its own route group; anything unknown is treated as a tenant
export const ROLES = ['landlord', 'tenant'];

export const homeFor = (role) => (role === 'landlord' ? '/landlord' : '/tenant');

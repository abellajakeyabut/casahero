// Sidebar menu items per user role. `icon` is a shape name in ./SidebarIcon.jsx
export const menus = {
  landlord: [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'properties', label: 'Properties', icon: 'properties' },
    { key: 'leases', label: 'Leases', icon: 'leases' },
    { key: 'rent', label: 'Rent', icon: 'rent' },
    { key: 'maintenance', label: 'Maintenance Requests', icon: 'maintenance' },
    { key: 'messages', label: 'Messages', icon: 'messages' },
  ],
  tenant: [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'rent', label: 'Rent', icon: 'rent' },
    { key: 'maintenance', label: 'Maintenance', icon: 'maintenance' },
    { key: 'messages', label: 'Messages', icon: 'messages' },
    { key: 'documents', label: 'Documents', icon: 'documents' },
  ],
};

export const getMenu = (role) => menus[role] ?? menus.tenant;

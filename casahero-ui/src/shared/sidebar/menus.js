// Sidebar menu items per user role. `icon` is a shape name in ./SidebarIcon.jsx
export const menus = {
  landlord: [
    { key: 'home', label: 'home', icon: 'home' },
    { key: 'Search', label: 'Search', icon: 'search' },
    { key: 'leases', label: 'Leases', icon: 'leases' },
    { key: 'rent', label: 'Rent', icon: 'rent' },
    { key: 'maintenance', label: 'Maintenance Requests', icon: 'maintenance' },
    { key: 'messages', label: 'Messages', icon: 'messages' },
  ],
  tenant: [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'Search', label: 'Search', icon: 'search' },
    { key: 'rent', label: 'Rent', icon: 'rent' },
    { key: 'maintenance', label: 'Maintenance', icon: 'maintenance' },
    { key: 'messages', label: 'Messages', icon: 'messages' },
    { key: 'documents', label: 'Documents', icon: 'documents' },
  ],
};

export const getMenu = (role) => menus[role] ?? menus.tenant;

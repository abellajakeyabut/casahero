// Line icons for the sidebar. They use currentColor, so they follow the item's text color.
const shapes = {
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1.5" />
    </>
  ),
  properties: (
    <>
      <path d="M4 20.5V6.5L11 3.5V20.5" />
      <path d="M11 9.5L20 12V20.5" />
      <path d="M2.5 20.5H21.5" />
      <path d="M7 8.5V8.51M7 12V12.01M7 15.5V15.51" />
      <path d="M15 14.5V14.51M15 17.5V17.51" />
    </>
  ),
  leases: (
    <>
      <path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5V19A1.5 1.5 0 0 0 7 20.5H17A1.5 1.5 0 0 0 18.5 19V8L14 3.5Z" />
      <path d="M14 3.5V8H18.5" />
      <path d="M8.5 12.5H15.5M8.5 16H12" />
    </>
  ),
  rent: (
    <>
      <path d="M18.5 7.5V5.5A1.5 1.5 0 0 0 17 4H5A1.5 1.5 0 0 0 3.5 5.5V18.5A1.5 1.5 0 0 0 5 20H19A1.5 1.5 0 0 0 20.5 18.5V9A1.5 1.5 0 0 0 19 7.5H5" />
      <path d="M20.5 11H17A2 2 0 0 0 17 15H20.5" />
      <path d="M17 13H17.01" />
    </>
  ),
  maintenance: (
    <path d="M14.7 6.3A1 1 0 0 0 14.7 7.7L16.3 9.3A1 1 0 0 0 17.7 9.3L21.2 5.8A6 6 0 0 1 13.3 13.7L6.6 20.4A2.1 2.1 0 0 1 3.6 17.4L10.3 10.7A6 6 0 0 1 18.2 2.8L14.7 6.3Z" />
  ),
  messages: (
    <>
      <path d="M20.5 12A8 8 0 0 1 9.2 19.3L3.5 20.5L4.7 15.6A8 8 0 1 1 20.5 12Z" />
      <path d="M8.5 12H8.51M12 12H12.01M15.5 12H15.51" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 10.5L12 3.5L20.5 10.5" />
      <path d="M5.5 9V19A1.5 1.5 0 0 0 7 20.5H17A1.5 1.5 0 0 0 18.5 19V9" />
      <path d="M10 20.5V14.5H14V20.5" />
    </>
  ),
  documents: (
    <>
      <path d="M3.5 7A1.5 1.5 0 0 1 5 5.5H9.5L11.5 7.5H19A1.5 1.5 0 0 1 20.5 9V18A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V7Z" />
      <path d="M3.5 10.5H20.5" />
    </>
  ),
};

const SidebarIcon = ({ name, size = 20 }) => {
  const shape = shapes[name];
  if (!shape) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shape}
    </svg>
  );
};

export default SidebarIcon;

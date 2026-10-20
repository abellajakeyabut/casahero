import { useEffect } from 'react';
import { getMenu } from './menus';
import SidebarIcon from './SidebarIcon';
import './Sidebar.css';

const Sidebar = ({ role, activeKey, onSelect }) => {
  const menu = getMenu(role);

  // keep the sidebar just below the fixed top banner, whatever its height
  useEffect(() => {
    const banner = document.querySelector('.top-banner');
    if (!banner) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        '--banner-height',
        `${banner.offsetHeight}px`
      );
    });
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sidebar" aria-label={`${role ?? 'tenant'} menu`}>
      <ul className="sidebar-menu">
        {menu.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className={`sidebar-item${activeKey === item.key ? ' active' : ''}`}
              aria-current={activeKey === item.key ? 'page' : undefined}
              onClick={() => onSelect(item.key)}
            >
              <span className="sidebar-icon">
                <SidebarIcon name={item.icon} />
              </span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;

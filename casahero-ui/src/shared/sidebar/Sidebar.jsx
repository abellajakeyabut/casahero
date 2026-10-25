import { getMenu } from './menus';
import SidebarIcon from './SidebarIcon';
import './Sidebar.css';

const Sidebar = ({ role, activeKey, onSelect }) => {
  const menu = getMenu(role);

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

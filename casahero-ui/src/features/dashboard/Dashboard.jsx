import { useContext, useState } from 'react';
import TopBanner from './TopBanner';
import SearchBar from './searchbar/SearchBar';
import Sidebar from './sidebar/Sidebar';
import { getMenu } from './sidebar/menus';
import AppContext from '../../context/AppContext';

import './Dashboard.css'; // CSS file with styles

const Dashboard = () => {
  const { userContext } = useContext(AppContext);
  const role = userContext?.role;
  const menu = getMenu(role);
  const [activeKey, setActiveKey] = useState(menu[0].key);

  // fall back to the first item if the role changed and the key no longer exists
  const activeItem = menu.find((item) => item.key === activeKey) ?? menu[0];

  return (
    <div className="dashboard-container">
      <TopBanner userContext={userContext} />
      <Sidebar role={role} activeKey={activeItem.key} onSelect={setActiveKey} />
      <main className="dashboard-main">
        {activeItem.key === 'dashboard' || activeItem.key === 'home' ? (
          <SearchBar></SearchBar>
        ) : (
          <div className="search-container">
            <h2>{activeItem.label}</h2>
            <p>Coming soon.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

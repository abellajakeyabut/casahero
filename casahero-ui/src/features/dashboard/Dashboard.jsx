import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopBanner from '../../shared/TopBanner';
import Sidebar from '../../shared/sidebar/Sidebar'
import { getMenu } from '../../shared/sidebar/menus'
import AppContext from '../../context/AppContext';
import Home from '../dashboard/Home'
import SearchBar from '../search/SearchBar';
import { toSearchUrl } from '../search/searchParams';

const Dashboard = () => {
    const { userContext } = useContext(AppContext);
    const role = userContext?.default_role;
    const menu = getMenu(role);
    // the sidebar on /search links back here with the item to open
    const location = useLocation();
    const [activeKey, setActiveKey] = useState(location.state?.activeKey ?? menu[0].key);
    const navigate = useNavigate();

    // fall back to the first item if the role changed and the key no longer exists
    const activeItem = menu.find((item) => item.key === activeKey) ?? menu[0];

    return (<>
        <TopBanner></TopBanner>
        <Sidebar role={role} activeKey={activeItem.key} onSelect={setActiveKey} />
        <main className="listings-main">
            {(activeItem.key === 'home') && <Home />}
            {(activeItem.key === 'Search' || activeItem.key == 'Search') &&   <SearchBar onSearch={(filters) => navigate(toSearchUrl(filters))} />}


        </main>
    </>)
}
export default Dashboard
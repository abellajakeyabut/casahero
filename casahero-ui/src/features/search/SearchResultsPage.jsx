import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import TopBanner from '../../shared/TopBanner';
import SearchBar from './SearchBar';
import Sidebar from '../../shared/sidebar/Sidebar';
import { getMenu } from '../../shared/sidebar/menus';
import { useMe } from '../authentication/useMe';
import AppContext from '../../context/AppContext';
import { homeFor } from '../../roles';
import SearchResults from './SearchResults';
import { describeFilters, fromSearchParams, toSearchUrl } from './searchParams';
import './Search.css';

// public results page; the filters live in the URL so links can be shared
const SearchResultsPage = () => {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const filters = fromSearchParams(params);
  const [expanded, setExpanded] = useState(false);
  // mount the bar on first open (it fetches types/regions), then keep it so closing can animate
  const [barMounted, setBarMounted] = useState(false);

  // this route is public, so nothing else restores the user after a reload; /me 401s for guests
  const { updateUserContext, userContext } = useContext(AppContext);
  const { data: me } = useMe();
  useEffect(() => {
    if (me) updateUserContext(me);
  }, [me, updateUserContext]);
  const loggedIn = !!userContext?.loggedIn;
  const role = userContext?.default_role;

  const togglePanel = (open) => {
    setExpanded(open);
    if (open) setBarMounted(true);
  };

  const handleSearch = (next) => {
    navigate(toSearchUrl(next));
    setExpanded(false);
  };

  return (
    <div className="search-page">
      <TopBanner />
      {/* search lives under the first menu item (Listings / Home); other items open on the Listings page */}
      {loggedIn && (
        <Sidebar
          role={role}
          activeKey={getMenu(role)[0].key}
          onSelect={(key) => navigate(homeFor(role), { state: { activeKey: key } })}
        />
      )}
      <div className={`search-page-content${loggedIn ? ' with-sidebar' : ''}`}>
        <section className="search-panel">
          <div className="search-panel-summary">
            <span>{filters ? describeFilters(filters) : 'Start a search'}</span>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="search-panel-body"
              onClick={() => togglePanel(!expanded)}
            >
              {expanded ? 'Hide search ▴' : 'Edit search ▾'}
            </button>
          </div>
          {/* inert keeps the hidden bar out of the tab order while collapsed */}
          <div
            id="search-panel-body"
            className={`search-panel-body${expanded ? ' expanded' : ''}`}
            inert={!expanded}
          >
            <div className="search-panel-inner">
              {/* remount on URL change so the bar shows the current filters */}
              {barMounted && (
                <SearchBar key={location.search} initialFilters={filters ?? {}} onSearch={handleSearch} />
              )}
            </div>
          </div>
        </section>
        <main className="search-page-main">
          {filters ? (
            <SearchResults filters={filters} onEditSearch={() => togglePanel(true)} />
          ) : (
            <div className="search-message">
              <p>Pick a property type and area to see units.</p>
              <button type="button" onClick={() => togglePanel(true)}>Start a search</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResultsPage;

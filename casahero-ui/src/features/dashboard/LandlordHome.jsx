import { useState } from 'react';
import './LandlordHome.css';

const LISTING_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'listed', label: 'Listed' },
  { value: 'delisted', label: 'De-Listed' },
  { value: 'drafts', label: 'Drafts' },
];

const LandlordHome = () => {
  // which listing status the tab bar is showing
  const [filter, setFilter] = useState('all');

  return (
    <section className="landlord-home">
      <div className="landlord-home-row-title">
        <h2 className="landlord-home-title">My Properties</h2>
        <button type="button" className="landlord-home-add-btn">
          <span aria-hidden="true">+</span> Add Property
        </button>
      </div>

      <div className="landlord-home-row">
        <span>Add update or take your listing off the market</span>
      </div>
      <div className="landlord-home-row">
        <div className="header-card">
          <div className="header-card-title">Live Listing</div>
          <div className="header-card-data">
            <h3>0</h3>
          </div>
        </div>
        <div className="header-card">
          <div className="header-card-title">Drafts</div>
          <div className="header-card-data">
            <h3>0</h3>
          </div>
        </div>
        <div className="header-card">
          <div className="header-card-title">De-listed</div>
          <div className="header-card-data">
            <h3>0</h3>
          </div>
        </div>
        <div className="header-card">
          <div className="header-card-title">Enquiries this week</div>
          <div className="header-card-data">
            <h3>0</h3>
          </div>
        </div>
      </div>
      <div
        className="header-card-tab"
        role="radiogroup"
        aria-label="Filter listings by status"
      >
        {LISTING_FILTERS.map((option) => {
          const checked = filter === option.value;
          return (
            <label
              key={option.value}
              className={`header-card-tab-button${checked ? ' is-active' : ''}`}
            >
              <input
                type="radio"
                className="header-card-tab-input"
                name="landlord-listing-filter"
                value={option.value}
                checked={checked}
                onChange={() => setFilter(option.value)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </section>
  );
};
export default LandlordHome;

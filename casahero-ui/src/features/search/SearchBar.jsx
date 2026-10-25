import { useState } from 'react';
import { useRegions, useCities, useTypes } from '../../hooks/useListings';
import Spinner from '../../shared/Spinner';
import NumberPicker from '../../shared/NumberPicker';
import './SearchBar.css';

// bed/bath: null = "Any"; otherwise a minimum count
const EMPTY_FILTERS = { type: 'HDB', region: '', city: '', bed: null, bath: null };

// Hands { type, region, city, bed, bath } to onSearch; parents route to /search with toSearchUrl,
// which drops the empty values. initialFilters pre-fills the bar, e.g. from the /search URL.
const SearchBar = ({ onSearch, initialFilters = {} }) => {
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, ...initialFilters });
  const types = useTypes();
  const regions = useRegions();
  const cities = useCities(filters.region);

  const update = (changes) => setFilters((prev) => ({ ...prev, ...changes }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(filters);
  };

  return (
    <>
      <Spinner show={types.isFetching || regions.isFetching || cities.isFetching} />
      <div className="search-container">
        <div className="property-type">
          {types.data?.map(({ type }) => (
            <label key={type} className={filters.type === type ? 'active' : ''}>
              <input
                id={`propertyType-${type}`}
                type="radio"
                name="propertyType"
                value={type}
                checked={filters.type === type}
                onChange={(e) => update({ type: e.target.value })}
              />
              <span className="icon">{type}</span>
            </label>
          ))}
        </div>
        <form className="search-form" onSubmit={handleSubmit}>
          <select
            id="region"
            value={filters.region}
            // a new region invalidates the chosen city
            onChange={(e) => update({ region: e.target.value, city: '' })}
            disabled={regions.isPending}
            className="search-input"
          >
            <option value="">Select Region...</option>
            {regions.data?.map(({ region }) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <select
            id="city"
            value={filters.city}
            onChange={(e) => update({ city: e.target.value })}
            disabled={!filters.region || cities.isFetching}
            className="search-input"
          >
            <option value="">Select City...</option>
            {cities.data?.map(({ city }) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <NumberPicker id="bed" label="Beds" allowAny value={filters.bed} onChange={(bed) => update({ bed })} />
          <NumberPicker id="bath" label="Bath" allowAny value={filters.bath} onChange={(bath) => update({ bath })} />
          <button type="submit" id="search-button" className="search-button">
            Search
          </button>
        </form>
      </div>
    </>
  );
};

export default SearchBar;

import { useContext } from 'react';
import { useListings } from '../../hooks/useListings';
import AppContext from '../../context/AppContext';
import ListingCard from './ListingCard';

// one card per unit, with its property's details attached
const SearchResults = ({ filters, onEditSearch }) => {
  const listings = useListings(filters);
  const { userContext } = useContext(AppContext);
  const loggedIn = !!userContext?.loggedIn;

  if (listings.isPending) {
    return (
      <div className="results-grid" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="listing-card listing-card-skeleton" />
        ))}
      </div>
    );
  }
  if (listings.isError) {
    return (
      <div className="search-message">
        <p>Could not load results.</p>
        <button type="button" onClick={() => listings.refetch()}>Retry</button>
      </div>
    );
  }

  const results = listings.data.flatMap((property) =>
    property.units.map((unit) => ({ unit, property })),
  );
  if (results.length === 0) {
    return (
      <div className="search-message">
        <p>No units match this search.</p>
        <button type="button" onClick={onEditSearch}>Edit search</button>
      </div>
    );
  }

  const place = [filters.city, filters.region].filter(Boolean).join(', ');
  return (
    <>
      <p className="results-bar">
        {results.length} {results.length === 1 ? 'unit' : 'units'}{place && ` in ${place}`}
      </p>
      {/* isPlaceholderData: these are the previous search's results while the new ones load */}
      <div className={`results-grid${listings.isPlaceholderData ? ' results-grid-updating' : ''}`}>
        {results.map(({ unit, property }) => (
          <ListingCard key={unit.id} unit={unit} property={property} loggedIn={loggedIn} />
        ))}
      </div>
    </>
  );
};

export default SearchResults;

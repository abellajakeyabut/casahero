import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// shown when a listing has no photo, or the photo fails to load
const PLACEHOLDER_ICON = { HDB: '🏢', Condo: '🏙️', Landed: '🏡' };

const ListingCard = ({ listing, loggedIn }) => {
  const navigate = useNavigate();
  const [photoFailed, setPhotoFailed] = useState(false);
  const photo = listing.photo_paths?.[0];
  const rent = listing.asking_rent_cents / 100;
  const perSqft = listing.area_sqft ? (rent / listing.area_sqft).toFixed(2) : null;

  return (
    <article className="listing-card">
      <div className="listing-card-photo">
        {photo && !photoFailed ? (
          <img src={`/${photo}`} alt={[listing.name, listing.unit_number].filter(Boolean).join(' ')} onError={() => setPhotoFailed(true)} />
        ) : (
          <span className="listing-card-placeholder" aria-hidden="true">
            {PLACEHOLDER_ICON[listing.property_type] ?? '🏠'}
          </span>
        )}
        <span className="listing-card-badge">{listing.property_type}</span>
      </div>
      <div className="listing-card-body">
        <p className="listing-card-rent">S${rent.toLocaleString()} <span>/mo</span></p>
        <h3 className="listing-card-name">{listing.name}</h3>
        <p className="listing-card-meta">{listing.unit_number && `${listing.unit_number} · `}{listing.city}, {listing.region}</p>
        <p className="listing-card-specs">
          <span>🛏 {listing.bedrooms}</span>
          <span>🛁 {listing.bathrooms}</span>
          <span>📐 {listing.area_sqft.toLocaleString()} sqft</span>
        </p>
        <p className="listing-card-meta">
          {perSqft && `S$${perSqft}/sqft · `}
          {listing.status === 'vacant' ? 'Available' : listing.status}
        </p>
        <div className="listing-card-actions">
          {loggedIn ? (
            <>
              {/* save/enquire have no backend yet */}
              <button type="button" disabled title="Coming soon">♡ Save</button>
              <button type="button" disabled title="Coming soon">Enquire</button>
            </>
          ) : (
            <button type="button" onClick={() => navigate('/login')}>Sign in to enquire</button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ListingCard;

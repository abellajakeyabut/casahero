import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// shown when a unit has no photo, or the photo fails to load
const PLACEHOLDER_ICON = { HDB: '🏢', Condo: '🏙️', Landed: '🏡' };

const ListingCard = ({ unit, property, loggedIn }) => {
  const navigate = useNavigate();
  const [photoFailed, setPhotoFailed] = useState(false);
  const photo = unit.photo_paths?.[0];
  const rent = unit.asking_rent_cents / 100;
  const perSqft = unit.area_sqft ? (rent / unit.area_sqft).toFixed(2) : null;

  return (
    <article className="listing-card">
      <div className="listing-card-photo">
        {photo && !photoFailed ? (
          <img src={`/${photo}`} alt={`${property.name} ${unit.unit_number}`} onError={() => setPhotoFailed(true)} />
        ) : (
          <span className="listing-card-placeholder" aria-hidden="true">
            {PLACEHOLDER_ICON[property.property_type] ?? '🏠'}
          </span>
        )}
        <span className="listing-card-badge">{property.property_type}</span>
      </div>
      <div className="listing-card-body">
        <p className="listing-card-rent">S${rent.toLocaleString()} <span>/mo</span></p>
        <h3 className="listing-card-name">{property.name}</h3>
        <p className="listing-card-meta">{unit.unit_number} · {property.city}, {property.region}</p>
        <p className="listing-card-specs">
          <span>🛏 {unit.bedrooms}</span>
          <span>🛁 {unit.bathrooms}</span>
          <span>📐 {unit.area_sqft.toLocaleString()} sqft</span>
        </p>
        <p className="listing-card-meta">
          {perSqft && `S$${perSqft}/sqft · `}
          {unit.status === 'vacant' ? 'Available' : unit.status}
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

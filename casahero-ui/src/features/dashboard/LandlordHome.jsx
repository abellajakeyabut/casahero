import { useContext, useState } from 'react';
import './LandlordHome.css';
import LandlordHomeCards from './components/LandLordHomeCards';
import LandLordHomeFilters from './components/LandLordHomeFilters';
import PropertyForm from './components/PropertyForm';
import LandlordHomeContext from './LandlordHomeContext';

const LISTING_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'listed', label: 'Listed' },
  { value: 'delisted', label: 'De-Listed' },
  { value: 'drafts', label: 'Drafts' },
];

const LandlordHome = () => {
  // which listing status the tab bar is showing
  const [filter, setFilter] = useState('all');
  const cards = ['Live Listing', 'Drafts', 'De-listed', 'Enquiries this week'];
  const [showForm, setShowForm] = useState(false);
  const onClose = () => setShowForm(false);
  const {landlordProperties,updateLandlordProperties} = useContext(LandlordHomeContext)
  alert(landlordProperties.length)
  return (
    <section className="landlord-home">
      <div className="landlord-home-row-title">
        <h2 className="landlord-home-title">My Properties</h2>
        <button type="button" className="landlord-home-add-btn" onClick={() => setShowForm(!showForm)}>
          <span aria-hidden="true">+</span> Add Property
        </button>
      </div>
      <PropertyForm show={showForm} onClose={onClose} updateLandlordProperties={updateLandlordProperties}></PropertyForm>
      <div className="landlord-home-row">
        <span>Add update or take your listing off the market</span>
      </div>
      <LandlordHomeCards cards={cards} />
      <LandLordHomeFilters filters={LISTING_FILTERS} filter={filter} setFilter={setFilter} />
     
      
    </section>
  );
};
export default LandlordHome;

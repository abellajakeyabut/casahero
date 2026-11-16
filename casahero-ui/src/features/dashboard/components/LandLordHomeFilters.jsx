const LandLordHomeFilters = ({filters,filter,setFilter}) => {
  return (
<div
        className="header-card-tab"
        role="radiogroup"
        aria-label="Filter listings by status"
      >
        {filters.map((option) => {
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
)
}
export default LandLordHomeFilters;
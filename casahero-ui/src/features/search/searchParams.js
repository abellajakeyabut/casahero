// Search filters <-> /search?type=HDB&region=East&bed=2 URL params.
const KEYS = ['type', 'region', 'city', 'bed', 'bath'];
const NUMERIC = ['bed', 'bath'];

// empty values and "Any" (null) are left out of the URL
export const toSearchUrl = (filters) => {
  const params = new URLSearchParams();
  KEYS.forEach((key) => {
    const value = filters[key];
    if (value !== null && value !== undefined && value !== '') params.set(key, value);
  });
  return `/search?${params}`;
};

// null when the URL has no filters, i.e. no search has been run
export const fromSearchParams = (params) => {
  const filters = {};
  KEYS.forEach((key) => {
    const value = params.get(key);
    if (!value) return;
    if (!NUMERIC.includes(key)) filters[key] = value;
    else if (Number.isFinite(Number(value))) filters[key] = Number(value);
  });
  return Object.keys(filters).length ? filters : null;
};

// e.g. "HDB · East › Tampines · 2+ bed · 1+ bath"
export const describeFilters = ({ type, region, city, bed, bath }) =>
  [
    type,
    city ? `${region} › ${city}` : region,
    bed && `${bed}+ bed`,
    bath && `${bath}+ bath`,
  ]
    .filter(Boolean)
    .join(' · ');

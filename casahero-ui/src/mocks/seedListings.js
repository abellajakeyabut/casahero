// Generates made-up listings for the mocks: PROPERTIES_PER_CITY properties in every city,
// each topped up to UNITS_PER_PROPERTY units. Streets and postal sectors are real Singapore
// ones; names, blocks, rents and sizes are invented. A fixed seed keeps ids and data
// identical on every reload.
const PROPERTIES_PER_CITY = 10;
const UNITS_PER_PROPERTY = 15;
const LANDLORD_IDS = ['ll-001', 'll-002'];

// postal: first two digits (postal sector) of the area's postal codes
export const AREAS = {
  Woodlands: { postal: '73', streets: ['Woodlands Drive 16', 'Woodlands Avenue 6', 'Woodlands Street 41', 'Woodlands Ring Road'] },
  Marsiling: { postal: '73', streets: ['Marsiling Drive', 'Marsiling Rise', 'Marsiling Road', 'Woodlands Centre Road'] },
  Sembawang: { postal: '75', streets: ['Sembawang Drive', 'Canberra Road', 'Admiralty Drive', 'Wellington Circle'] },
  Yishun: { postal: '76', streets: ['Yishun Ring Road', 'Yishun Avenue 2', 'Yishun Street 22', 'Yishun Avenue 11'] },
  Springleaf: { postal: '78', streets: ['Springleaf Avenue', 'Springleaf Road', 'Upper Thomson Road', 'Jalan Kemuning'] },
  'Ang Mo Kio': { postal: '56', streets: ['Ang Mo Kio Avenue 3', 'Ang Mo Kio Avenue 10', 'Ang Mo Kio Street 21', 'Ang Mo Kio Avenue 6'] },
  Serangoon: { postal: '55', streets: ['Serangoon Avenue 2', 'Serangoon North Avenue 1', 'Kensington Park Road', 'Lowland Road'] },
  Hougang: { postal: '53', streets: ['Hougang Avenue 8', 'Hougang Street 21', 'Upper Serangoon Road', 'Hougang Avenue 1'] },
  Sengkang: { postal: '54', streets: ['Compassvale Road', 'Anchorvale Link', 'Rivervale Drive', 'Fernvale Road'] },
  'Raffles Place': { postal: '04', streets: ['Cecil Street', 'Shenton Way', 'Collyer Quay', 'Telok Ayer Street'], cbd: true },
  Tampines: { postal: '52', streets: ['Tampines Street 81', 'Tampines Avenue 5', 'Tampines Street 45', 'Tampines Central 7'] },
  Bedok: { postal: '46', streets: ['Bedok North Avenue 1', 'Bedok Reservoir Road', 'New Upper Changi Road', 'Bedok South Avenue 3'] },
  'Pasir Ris': { postal: '51', streets: ['Pasir Ris Drive 6', 'Pasir Ris Street 51', 'Elias Road', 'Pasir Ris Drive 3'] },
  'Jurong West': { postal: '64', streets: ['Jurong West Street 52', 'Jurong West Avenue 1', 'Boon Lay Way', 'Jurong West Street 91'] },
  Clementi: { postal: '12', streets: ['Clementi Avenue 3', 'Clementi West Street 2', 'West Coast Road', 'Clementi Avenue 6'] },
  'Bukit Batok': { postal: '65', streets: ['Bukit Batok West Avenue 6', 'Bukit Batok Street 31', 'Bukit Batok East Avenue 3', 'Bukit Batok Street 21'] },
  'Downtown Core': { postal: '01', streets: ['Marina Boulevard', 'Shenton Way', 'Bayfront Avenue', 'Raffles Quay'], cbd: true },
  'Toa Payoh': { postal: '31', streets: ['Lorong 1 Toa Payoh', 'Toa Payoh Lorong 8', 'Kim Keat Avenue', 'Toa Payoh East'] },
  Bishan: { postal: '57', streets: ['Bishan Street 22', 'Sin Ming Avenue', 'Bright Hill Drive', 'Bishan Street 13'] },
  Queenstown: { postal: '14', streets: ['Commonwealth Avenue', 'Dawson Road', 'Stirling Road', 'Margaret Drive'] },
};

// the mix of property types per city; the CBD has no HDB blocks or landed estates
const TYPE_MIX = ['HDB', 'HDB', 'HDB', 'HDB', 'HDB', 'Condo', 'Condo', 'Condo', 'Landed', 'Landed'];
const CBD_TYPE_MIX = Array(PROPERTIES_PER_CITY).fill('Condo');

const HDB_NAMES = ['Court', 'Green', 'Vista', 'Heights', 'Grove', 'Spring', 'Crest', 'Meadow', 'Breeze', 'Residences'];
const CONDO_NAMES = ['Parc', 'The Botanica', 'Lakeview', 'The Signature', 'Skyline', 'Residences', 'The Orchid', 'Waterfront', 'Regency', 'Luxe'];

// unit size and rent ranges by property type: [bedrooms, bathrooms, sqft per bedroom, rent in S$]
const UNIT_SPECS = {
  HDB: { bedrooms: [2, 4], sqftPerBed: [300, 340], rent: [2200, 4200] },
  Condo: { bedrooms: [1, 4], sqftPerBed: [420, 500], rent: [3200, 8500] },
  Landed: { bedrooms: [4, 6], sqftPerBed: [550, 750], rent: [7500, 15000] },
};

// mulberry32: small seeded PRNG so the data never changes between reloads
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const random = seeded(20261025);
const between = (min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (list) => list[Math.floor(random() * list.length)];
const pad = (n, width) => String(n).padStart(width, '0');

const propertyName = (type, city, street, i) => {
  if (type === 'HDB') return `${city} ${HDB_NAMES[i % HDB_NAMES.length]}`;
  if (type === 'Condo') return `${CONDO_NAMES[i % CONDO_NAMES.length]} @ ${city}`;
  return `${street} Estate`;
};

const makeProperty = ({ id, city, region, type, index }) => {
  const area = AREAS[city];
  const street = pick(area.streets);
  // HDB postal codes end in the block number, e.g. Blk 821 -> 520821
  const block = 100 + index * 37 + between(0, 30);
  const houseNo = between(1, 120);
  const created = `2026-${pad(between(1, 9), 2)}-${pad(between(1, 28), 2)}T09:00:00Z`;
  return {
    id,
    landlord_id: LANDLORD_IDS[index % LANDLORD_IDS.length],
    name: propertyName(type, city, street, index),
    address: type === 'HDB' ? `Blk ${block} ${street}` : `${houseNo} ${street}`,
    postal_code: `${area.postal}${pad(type === 'HDB' ? block : between(1000, 9999), 4)}`,
    region,
    type: type === 'Landed' ? 'Landed' : 'Residential',
    city,
    property_type: type,
    created_at: created,
  };
};

// i is the unit's position in its property; it keeps unit numbers unique within the property
const makeUnit = ({ id, property, i, cbd }) => {
  const spec = UNIT_SPECS[property.property_type];
  const bedrooms = between(...spec.bedrooms);
  const bathrooms = Math.max(1, bedrooms - between(0, 1));
  const [minRent, maxRent] = spec.rent;
  // bigger units and CBD units cost more; rents round to S$50
  const sizeShare = (bedrooms - spec.bedrooms[0]) / Math.max(1, spec.bedrooms[1] - spec.bedrooms[0]);
  const rent = (minRent + (maxRent - minRent) * (0.6 * sizeShare + 0.4 * random())) * (cbd ? 1.3 : 1);
  const roll = random();
  return {
    id,
    property_id: property.id,
    unit_number:
      property.property_type === 'Landed'
        ? `No. ${i * 2 + 1}`
        : `#${pad(2 + i * 2 + between(0, 1), 2)}-${pad(between(1, 8) + (property.property_type === 'HDB' ? 300 : 0), 2)}`,
    bedrooms,
    bathrooms,
    area_sqft: bedrooms * between(...spec.sqftPerBed),
    asking_rent_cents: Math.round(rent / 50) * 50 * 100,
    status: roll < 0.5 ? 'vacant' : roll < 0.85 ? 'occupied' : 'unavailable',
    photo_paths: [],
  };
};

// Returns the hand-written properties plus generated ones, and every property's units
// topped up to UNITS_PER_PROPERTY (hand-written units are kept as they are).
export const seedListings = ({ cities, properties, units }) => {
  const allProperties = [...properties];
  const allUnits = [...units];
  let nextProperty = properties.length + 1;
  let nextUnit = units.length + 1;

  cities.forEach(({ region, city }) => {
    const mix = AREAS[city]?.cbd ? CBD_TYPE_MIX : TYPE_MIX;
    for (let index = 0; index < PROPERTIES_PER_CITY; index++) {
      allProperties.push(
        makeProperty({ id: `pr-${pad(nextProperty++, 3)}`, city, region, type: mix[index], index }),
      );
    }
  });

  allProperties.forEach((property) => {
    const cbd = !!AREAS[property.city]?.cbd;
    const existing = units.filter((u) => u.property_id === property.id).length;
    for (let i = existing; i < UNITS_PER_PROPERTY; i++) {
      allUnits.push(makeUnit({ id: `un-${pad(nextUnit++, 3)}`, property, i, cbd }));
    }
  });

  return { properties: allProperties, units: allUnits };
};

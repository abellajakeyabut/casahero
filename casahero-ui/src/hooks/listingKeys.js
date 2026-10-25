export const listingKeys = {
    all:['listings'],
    lists:()=>[...listingKeys.all, 'list'],
    list:(filters)=>[...listingKeys.lists(), filters],
    listByType:()=>[...listingKeys.all,'by-type'],
    listByRegion:()=>[...listingKeys.all, 'by-region'],
    listByCity:()=>[...listingKeys.all,'by-city'],
    listByPropperty:()=>[...listingKeys.all,'by-property'],
    listByLandlord:()=>[...listingKeys.all,'by-landlord'],
    listByTenant:()=>[...listingKeys.all,'by-tenant'],
    listRegions:()=>[...listingKeys.all,'list-regions'],
    listCities:(region)=>[...listingKeys.all,'list-cities',region],
    listTypes :()=>[...listingKeys.all,'list-types']
}
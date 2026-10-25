import {useQuery, keepPreviousData} from '@tanstack/react-query'
import { listingKeys } from './listingKeys'
import { getListings,getRegions , getCitiesByRegion,getTypes} from '../api/listings'

// filters = null means no search has been run yet
export const useListings=(filters)=>{
    return useQuery({
        queryKey: listingKeys.list(filters),
        queryFn: ()=>getListings(filters),
        enabled: !!filters,
        // keep the last results on screen while a new filter set loads, instead of flashing skeletons
        placeholderData: keepPreviousData
    });
}
export const useTypes=()=>{
  return useQuery({
    queryKey:listingKeys.listTypes(),
    queryFn:getTypes
  })
}
export const useRegions=()=>{
  return useQuery({
    queryKey:listingKeys.listRegions(),
    queryFn:getRegions
  })
}
export const useCities=(region)=>{
  return useQuery({
    queryKey:listingKeys.listCities(region),
    queryFn:()=>getCitiesByRegion({region}),
    enabled:!!region
  })
}
//export const useListingsByType=()=>{
//  return useQuery({
//    queryKey:listingKeys.listByType(),
//    queryFn:getListingsByType
//  })
//}
//export const useListingsByRegion=()=>{
//  return useQuery({
//    queryKey:listingKeys.listByRegion(),
//    queryFn:get
//  })
//}
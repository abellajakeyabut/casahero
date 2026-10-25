import api from './api'

// bed/bath are minimum counts; left out means "Any"
export const getListings= async ({ type, region, city, bed, bath } = {}) => {
    let data = { type, region, city, bed, bath }
    const response = await api.post('/casahero-api/listings', data);
    return response.data;
}
export const getRegions= async () => {
  
    const response = await api.post('/casahero-api/regions');
    return response.data;
}
export const getCitiesByRegion = async({region})=>{
    
    const response = await api.get(`/casahero-api/cities?region=${region}`);
    return response.data;
}
export const getTypes=async()=>{
    const response = await api.get('/casahero-api/types');
    return response.data;
    
}

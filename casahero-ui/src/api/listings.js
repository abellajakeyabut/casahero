import api from './api'

// bed/bath are minimum counts; left out means "Any"
export const getListings= async ({ type, region, city, bed, bath } = {}) => {
    let data = { type, region, city, bed, bath }
    const response = await api.post('/listings', data);
    return response.data;
}
export const getRegions= async () => {
  
    const response = await api.post('/regions');
    return response.data;
}
export const getCitiesByRegion = async({region})=>{
    
    const response = await api.get(`/cities?region=${region}`);
    return response.data;
}
export const getTypes=async()=>{
    const response = await api.get('/types');
    return response.data;
    
}

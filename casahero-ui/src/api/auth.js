import api from './api';

export const signup = async (data) => {
  const response = await api.post('/signup', data);
  return response.data;
};
export const login = async (data) => {
  const response = await api.post('/login', data);
  return response.data;
};
export const logout=async(data)=>{
  const response = await api.post('/logout',data);
  return response.data;
  
}

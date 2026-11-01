import api from './api';

export const signup = async (data) => {
  const response = await api.post('/signup', data);
  return response.data;
};
export const login = async (data) => {
  const response = await api.post('/login', data);
  return response.data;
};
export const logout = async (data) => {
  const response = await api.post('/logout', data);
  return response.data;
};
export const socialLogin = async (data) => {
  const response = await api.post('/auth/${provider}', data);
  return response.data;
};
export const getMe = async(data)=>{
  const response = await api.get("/me");
  
  return response.data;
}
export const getRolebyId = async(roleId)=>{
  const response = await api.post('/menus',{roleId:roleId})
  return response.data;
  
}
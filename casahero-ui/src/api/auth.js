import api from './api';

export const signup = async (data) => {
  const response = await api.post('/signup', data);
  return response.data;
};

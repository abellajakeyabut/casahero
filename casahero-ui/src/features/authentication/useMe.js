import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/me').then((r) => r.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

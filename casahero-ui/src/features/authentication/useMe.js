import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { getMe } from '../../api/auth';
export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => getMe(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

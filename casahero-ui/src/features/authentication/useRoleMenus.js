import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { getMe } from '../../api/auth';
export const useRoleMenus = (roleId) => {
  return useQuery({
    queryKey: ['role-by-id'],
    queryFn: (roleId) => getRoleById(roleId),
    enabled: !!roleId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

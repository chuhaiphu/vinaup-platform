import { wireApi } from 'fetchwire';

import { UserResponse } from '@/interfaces/user-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export const getCurrentUser = async () => {
  const response = await wireApi<UserResponse>('/user/me', {
    method: 'GET',
  });
  return response;
};

export async function searchUsers(params: { name?: string; phone?: string; email?: string }) {
  const qs = generateFilterQueryString(undefined, {
    name: params.name,
    phone: params.phone,
    email: params.email,
  });
  return wireApi<UserResponse[]>(`/user/search${qs}`, { method: 'GET' });
}

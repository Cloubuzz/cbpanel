import { requestJson } from '../lib/httpClient';

export interface RolePermission {
  UserType: string;
  ModuleId: string;
}

const API_BASE_PATH = '/adminapi';

export const fetchRolePermissions = async (token: string): Promise<RolePermission[]> => {
  const response = await requestJson<{ responseType: number; data: RolePermission[] }>(
    `${API_BASE_PATH}/users/permissions`,
    {
      method: 'GET',
      headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    }
  );
  return response.data || [];
};

export const saveRolePermissions = async (
  token: string,
  userType: string,
  moduleIds: string[]
): Promise<boolean> => {
  const response = await requestJson<{ responseType: number }>(
    `${API_BASE_PATH}/users/permissions`,
    {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: { userType, moduleIds },
    }
  );
  return response.responseType === 1;
};

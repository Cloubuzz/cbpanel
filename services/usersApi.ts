import { requestJson } from '../lib/httpClient';

export interface ApiUser {
  ID?: number;
  Name: string;
  Email: string;
  Address: string;
  Type: string;
  Status: string;
  Phone: string;
  Password?: string;
  IsActive: boolean;
}

interface UsersListResponse {
  responseType: number;
  message: string;
  data: ApiUser[];
}

interface UserTypesResponse {
  responseType: number;
  message: string;
  data: any[];
}

interface ActionResponse {
  responseType: number;
  message: string;
  data: any;
}

const API_BASE_PATH = '/adminapi';

export const fetchUsers = async (token: string): Promise<ApiUser[]> => {
  const response = await requestJson<UsersListResponse>(`${API_BASE_PATH}/users`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch users.');
  }
  return response.data;
};

export const fetchUserTypes = async (token: string): Promise<any[]> => {
  const response = await requestJson<UserTypesResponse>(`${API_BASE_PATH}/users/types`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch user types.');
  }
  return response.data;
};

export const fetchUserById = async (token: string, id: number): Promise<ApiUser> => {
  const response = await requestJson<any>(`${API_BASE_PATH}/users/${id}`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1 || !response.data) {
    throw new Error('Failed to fetch user details.');
  }
  const d = response.data;
  return {
    ID: d.ID !== undefined ? d.ID : d.id,
    Name: d.Name !== undefined ? d.Name : d.name,
    Email: d.Email !== undefined ? d.Email : d.email,
    Address: d.Address !== undefined ? d.Address : d.address,
    Type: d.Type !== undefined ? d.Type : d.type,
    Status: d.Status !== undefined ? d.Status : d.status,
    Phone: d.Phone !== undefined ? d.Phone : d.phone,
    Password: d.Password !== undefined ? d.Password : d.password,
    IsActive: d.IsActive !== undefined ? d.IsActive : (d.isActive !== undefined ? d.isActive : true)
  };
};

export const createUser = async (token: string, payload: ApiUser): Promise<any> => {
  const response = await requestJson<ActionResponse>(`${API_BASE_PATH}/users`, {
    method: 'POST',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: payload,
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to create user.');
  }
  return response.data;
};

export const updateUser = async (token: string, id: number, payload: ApiUser): Promise<any> => {
  const response = await requestJson<ActionResponse>(`${API_BASE_PATH}/users/${id}`, {
    method: 'PUT',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: payload,
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to update user.');
  }
  return response.data;
};

export const deleteUser = async (token: string, id: number): Promise<void> => {
  const response = await requestJson<ActionResponse>(`${API_BASE_PATH}/users/${id}`, {
    method: 'DELETE',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to delete user.');
  }
};

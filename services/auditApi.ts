import { requestJson } from '../lib/httpClient';

export interface AuditLog {
  Id: number;
  UserId: number;
  UserName: string;
  ActionType: string;
  EntityName: string;
  EntityId: number;
  Changes: string; // JSON string representing array of changes
  Timestamp: string;
}

interface AuditApiResponse {
  responseType: number;
  data?: AuditLog[];
}

const API_BASE_PATH = '/adminapi';

async function adminRequest<T>(
  token: string,
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: unknown,
): Promise<T> {
  return requestJson<T>(`${API_BASE_PATH}/${endpoint}`, {
    method,
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    ...(body !== undefined ? { body } : {}),
  });
}

export const fetchAuditLogs = async (
  token: string,
  params: {
    entityName?: string;
    entityId?: number;
    actionType?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  } = {},
): Promise<AuditLog[]> => {
  const queryParts: string[] = [];
  if (params.entityName) queryParts.push(`entityName=${encodeURIComponent(params.entityName)}`);
  if (params.entityId) queryParts.push(`entityId=${params.entityId}`);
  if (params.actionType) queryParts.push(`actionType=${encodeURIComponent(params.actionType)}`);
  if (params.userId) queryParts.push(`userId=${params.userId}`);
  if (params.startDate) queryParts.push(`startDate=${encodeURIComponent(params.startDate)}`);
  if (params.endDate) queryParts.push(`endDate=${encodeURIComponent(params.endDate)}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const response = await adminRequest<AuditApiResponse>(
    token,
    `AuditLogs/list${queryString}`,
  );
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch audit logs.');
  }
  return response.data;
};

export const fetchRecordHistory = async (
  token: string,
  entityName: string,
  entityId: number,
): Promise<AuditLog[]> => {
  const response = await adminRequest<AuditApiResponse>(
    token,
    `AuditLogs/history?entityName=${encodeURIComponent(entityName)}&entityId=${entityId}`,
  );
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch record history.');
  }
  return response.data;
};

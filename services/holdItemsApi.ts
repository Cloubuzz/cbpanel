import { requestJson } from '../lib/httpClient';

const API_BASE_PATH = '/adminapi';

export interface HoldItem {
  ID: number;
  CategoryID?: string;
  ItemID: number;
  ItemName: string;
  OutletID: number;
  OutletName: string;
  Action: string; // Hold / Start
  Created?: string;
  CreatedBy?: string;
  Modified?: string;
  ModifiedBy?: string;
  starttime?: string;
  endtime?: string;
}

export interface PagedHoldItemResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  data: HoldItem[];
}

export interface HoldItemRequestPayload {
  HoldID?: number | null;
  OutletID: number;
  OutletName: string;
  ItemID: number;
  ItemName: string;
  Action: string; // Hold / Start
  StartTime: string;
  EndTime: string;
}

export interface HoldItemBulkPayload {
  ItemID: number;
  ItemName: string;
  Action: string; // Hold / Start
}

export const fetchHoldItems = async (
  token: string,
  page = 1,
  pageSize = 50,
  search = ''
): Promise<PagedHoldItemResponse> => {
  const response = await requestJson<{
    responseType: number;
    message: string;
    data: PagedHoldItemResponse;
  }>(`${API_BASE_PATH}/HoldItem?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1 || !response.data) {
    throw new Error(response.message || 'Failed to fetch hold items.');
  }
  return response.data;
};

export const saveHoldItem = async (
  token: string,
  payload: HoldItemRequestPayload
): Promise<void> => {
  const response = await requestJson<{ responseType: number; message: string }>(
    `${API_BASE_PATH}/HoldItem`,
    {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    }
  );
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to save hold item.');
  }
};

export const saveHoldItemBulk = async (
  token: string,
  payload: HoldItemBulkPayload
): Promise<void> => {
  const response = await requestJson<{ responseType: number; message: string }>(
    `${API_BASE_PATH}/HoldItem/all`,
    {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    }
  );
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to save bulk hold items.');
  }
};

export interface HoldItemLog {
  ID: number;
  ItemID: number;
  ItemName: string;
  OutletID: number;
  OutletName: string;
  Action: string;
  Created: string;
  CreatedBy: number;
  starttime?: string;
  endtime?: string;
  User?: string;
}

export interface PagedHoldItemLogResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  data: HoldItemLog[];
}

export const fetchHoldItemLogs = async (
  token: string,
  page = 1,
  pageSize = 50,
  search = ''
): Promise<PagedHoldItemLogResponse> => {
  const response = await requestJson<{
    responseType: number;
    message: string;
    data: PagedHoldItemLogResponse;
  }>(`${API_BASE_PATH}/HoldItem/logs?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1 || !response.data) {
    throw new Error(response.message || 'Failed to fetch hold item logs.');
  }
  return response.data;
};

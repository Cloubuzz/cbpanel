import { requestJson } from '../lib/httpClient';

const API_BASE_PATH = '/adminapi';

export interface OutletListItem {
  id: number;
  name: string;
  city: string;
  deliveryTime: number;
  deliveryTimePrimary: number;
  isDelivers: boolean;
  takeaway: boolean;
  closeReason: string;
}

export interface OutletDetailItem {
  ID: number;
  name: string;
  city: string;
  email: string;
  phone: string;
  address: string;
  OutletStatus: string;
  CloseReason: string;
  is_delivers: number;
  TakeAway: number;
  delivery_time: number;
}

export const fetchOutletList = async (token: string): Promise<OutletListItem[]> => {
  const response = await requestJson<OutletListItem[]>(`${API_BASE_PATH}/outlet/list`, {
    method: 'GET',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!Array.isArray(response)) {
    throw new Error('Failed to fetch outlets.');
  }

  return response;
};

export const fetchOutletDetail = async (token: string, outletId: string): Promise<OutletDetailItem> => {
  const response = await requestJson<OutletDetailItem>(`${API_BASE_PATH}/outlet/${outletId}`, {
    method: 'GET',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response || typeof response !== 'object') {
    throw new Error('Failed to fetch outlet detail.');
  }

  return response;
};
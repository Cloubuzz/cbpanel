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
  email: string | Record<string, never>;
  phone: string | Record<string, never>;
  address: string | Record<string, never>;
  OutletStatus: string;
  CloseReason: string;
  is_delivers: number;
  TakeAway: number;
  delivery_time: number;
  geo_code?: string;
  delivery_fees?: number;
  delivery_minimum?: number;
  delivery_tax?: number;
  weekend_timing?: string;
  weekday_timing?: string;
  open_days?: string;
  delivery?: number;
  MegnusID?: string;
}

// ─── Generic helper ───────────────────────────────────────────────────────────

async function adminGet<T>(token: string, endpoint: string): Promise<T> {
  return requestJson<T>(`${API_BASE_PATH}/${endpoint}`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

interface OutletListApiResponse {
  responseType: number;
  message: string;
  data: OutletListItem[];
}

interface OutletDetailApiResponse {
  responseType: number;
  message: string;
  data: OutletDetailItem;
}

export const fetchOutletList = async (token: string): Promise<OutletListItem[]> => {
  const response = await adminGet<OutletListApiResponse>(token, 'outlet/list');
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch outlets.');
  }
  return response.data;
};

export const fetchOutletDetail = async (token: string, outletId: string): Promise<OutletDetailItem> => {
  const response = await adminGet<OutletDetailApiResponse>(token, `outlet/${outletId}`);
  if (response.responseType !== 1 || !response.data || typeof response.data !== 'object') {
    throw new Error('Failed to fetch outlet detail.');
  }
  return response.data;
};

export const updateOutletStatus = async (
  token: string,
  outletId: number,
  type: 'Delivery' | 'Takeaway' | 'AutoAcceptance',
  action: string
): Promise<void> => {
  const response = await requestJson<{ responseType: number; message: string }>(
    `${API_BASE_PATH}/outlet/update-status`,
    {
      method: 'POST',
      headers: { accept: '*/*', Authorization: `Bearer ${token}` },
      body: { outletId, type, action }
    }
  );
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to update outlet status.');
  }
};

export interface DeliveryAreaUploadItem {
  Area?: string;
  MinimumOrder?: number;
  DeliveryFee?: number;
  DeliveryTime?: number;
  Discount?: number;
  StartTime?: string;
  EndTime?: string;
  OnHold?: number;
  IsSponsored?: number;
  Name?: string;
  CitySpecial?: string;
  IsBranch?: number;
}

export const uploadDeliveryAreas = async (
  token: string,
  outletId: number,
  areas: DeliveryAreaUploadItem[]
): Promise<void> => {
  const response = await requestJson<{ responseType: number; message: string }>(
    `${API_BASE_PATH}/outlet/upload-delivery-areas`,
    {
      method: 'POST',
      headers: { accept: '*/*', Authorization: `Bearer ${token}` },
      body: { outletId, areas }
    }
  );
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to upload delivery areas.');
  }
};

export interface DeliveryAreaResponseItem {
  ID: number;
  OutletID: number;
  Area: string;
  MinimumOrder: number;
  DeliveryFee: number;
  DeliveryTime: number;
  Created: string;
  Modified: string;
  Discount: number;
  startTime: string;
  endTime: string;
  onHold: number;
  IsSponsored: number;
  SponsorExpiry: string;
  OriginalDeliveryTime: number;
  Name: string;
  CitySpecial: string;
  IsBranch: number;
}

export const fetchDeliveryAreas = async (
  token: string,
  outletId: string
): Promise<DeliveryAreaResponseItem[]> => {
  const response = await adminGet<{ responseType: number; message: string; data: DeliveryAreaResponseItem[] }>(
    token,
    `outlet/${outletId}/delivery-areas`
  );
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch delivery areas.');
  }
  return response.data;
};

export interface OutletPolygonResponseItem {
  ID: number;
  Name: string;
  OutletID: string;
  Polygon: string;
  IsActive: number;
  Created: string;
  Modified: string;
}

export const fetchOutletPolygon = async (
  token: string,
  outletId: string
): Promise<OutletPolygonResponseItem | null> => {
  const response = await adminGet<{ responseType: number; message: string; data: OutletPolygonResponseItem | null }>(
    token,
    `outlet/${outletId}/polygon`
  );
  if (response.responseType !== 1) {
    throw new Error('Failed to fetch outlet polygon.');
  }
  return response.data;
};

export const uploadOutletPolygon = async (
  token: string,
  outletId: string,
  name: string,
  polygon: string
): Promise<void> => {
  const response = await requestJson<{ responseType: number; message: string }>(
    `${API_BASE_PATH}/outlet/upload-polygon`,
    {
      method: 'POST',
      headers: { accept: '*/*', Authorization: `Bearer ${token}` },
      body: { outletId, name, polygon }
    }
  );
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to upload outlet polygon.');
  }
};

export interface SaveOutletRequest {
  id?: number;
  name: string;
  city: string;
  phone: string;
  address: string;
  email: string;
  geoCode: string;
  deliveryFees: number;
  deliveryMinimum: number;
  deliveryTax: number;
  deliveryTime: number;
  weekendTiming: string;
  weekdayTiming: string;
  openDays: string;
  isDelivers: boolean;
  takeAway: boolean;
  delivery: boolean;
  megnusID: string;
}

export const saveOutlet = async (
  token: string,
  data: SaveOutletRequest
): Promise<number> => {
  const response = await requestJson<{ responseType: number; message: string; data: number }>(
    `${API_BASE_PATH}/outlet/save`,
    {
      method: 'POST',
      headers: { accept: '*/*', Authorization: `Bearer ${token}` },
      body: data
    }
  );
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to save outlet.');
  }
  return response.data;
};

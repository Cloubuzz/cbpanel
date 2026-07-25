import { requestJson } from '../lib/httpClient';

export interface ApiVoucher {
  ID: number;
  Number: string;
  Amount: string;
  IsUsed: boolean;
  OrderID: number;
  Created: string;
  DiscountType: string;
}

interface VouchersApiResponse {
  responseType: number;
  message: string;
  data: ApiVoucher[];
}

export interface AddVoucherPayload {
  number: string;
  amount: number;
  discountType: string;
}

export interface UpdateVoucherPayload extends AddVoucherPayload {
  id: number;
}

interface AddVoucherResponse {
  responseType: number;
  message: string;
  data: { id: number };
}

interface UpdateVoucherResponse {
  responseType: number;
  message: string;
  data: null;
}

const API_BASE_PATH = '/adminapi';

export const addVoucher = async (token: string, payload: AddVoucherPayload): Promise<number> => {
  const response = await requestJson<AddVoucherResponse>(`${API_BASE_PATH}/Voucher/add`, {
    method: 'POST',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: payload,
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to add voucher.');
  }
  return response.data.id;
};

export const updateVoucher = async (token: string, payload: UpdateVoucherPayload): Promise<void> => {
  const response = await requestJson<UpdateVoucherResponse>(`${API_BASE_PATH}/Voucher/update`, {
    method: 'PUT',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: payload,
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to update voucher.');
  }
};

export const fetchVouchers = async (token: string): Promise<ApiVoucher[]> => {
  const response = await requestJson<VouchersApiResponse>(`${API_BASE_PATH}/Voucher/list`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch vouchers.');
  }
  return response.data;
};

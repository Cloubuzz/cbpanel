import { requestJson } from '../lib/httpClient';

export interface FranchiseRecord {
  ID: number;
  firstName?: string;
  contact?: string;
  Email?: string;
  occupation?: string;
  city?: string;
  own_other_franchises?: string;
  own_property?: string;
  hearAbout?: string;
  totalLiquidAssets?: string;
  regions?: string;
  Created?: string;
  CreatedBy?: string;
  ModifiedDate?: string;
  CreatedDate?: string;
}

export interface FeedbackRecord {
  id: number;
  Name?: string;
  Phone?: string;
  Email?: string;
  Outlet?: string;
  Type?: string;
  OrderID?: string;
  Food?: string;
  Service?: string;
  Ambience?: string;
  Time?: string;
  Experience?: string;
  Remarks?: string;
  Created?: string;
  StartTime?: string;
  EndTime?: string;
}

export interface CateringRecord {
  ID: number;
  Name?: string;
  Email?: string;
  Phone?: string;
  NoofPerson?: string | number;
  Date?: string;
  Time?: string;
  Location?: string;
  Instructions?: string;
  Created?: string;
}

export interface CorporateRecord {
  ID: number;
  Name?: string;
  Organization?: string;
  Email?: string;
  Phone?: string;
  Instructions?: string;
  Created?: string;
}

interface ApiResponse<T> {
  responseType: number;
  message: string;
  data: T;
}

const API_BASE_PATH = '/adminapi';

export const fetchFranchises = async (token: string, startDate?: string, endDate?: string): Promise<FranchiseRecord[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const response = await requestJson<ApiResponse<FranchiseRecord[]>>(`${API_BASE_PATH}/Enquiry/franchise${queryStr}`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to fetch franchise requests.');
  }
  return response.data ?? [];
};

export const fetchFeedbacks = async (token: string, startDate?: string, endDate?: string): Promise<FeedbackRecord[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const response = await requestJson<ApiResponse<FeedbackRecord[]>>(`${API_BASE_PATH}/Enquiry/feedback${queryStr}`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to fetch feedback listing.');
  }
  return response.data ?? [];
};

export const fetchCaterings = async (token: string, startDate?: string, endDate?: string): Promise<CateringRecord[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const response = await requestJson<ApiResponse<CateringRecord[]>>(`${API_BASE_PATH}/Enquiry/catering${queryStr}`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to fetch catering listing.');
  }
  return response.data ?? [];
};

export const fetchCorporates = async (token: string, startDate?: string, endDate?: string): Promise<CorporateRecord[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const response = await requestJson<ApiResponse<CorporateRecord[]>>(`${API_BASE_PATH}/Enquiry/corporate${queryStr}`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to fetch corporate listing.');
  }
  return response.data ?? [];
};

import { requestJson } from '../lib/httpClient';

export interface ApiBanner {
  ID?: number;
  City?: string;
  ImageURL?: string;
  Link?: string;
  IsActive: boolean;
  Days?: string;
  Order: number;
  StartTime?: string;
  EndTime?: string;
  ImageType?: string;
  Channel?: string;
  Link1?: string;
}

interface BannersApiResponse {
  responseType: number;
  message: string;
  data: ApiBanner[];
}

interface SaveBannerResponse {
  responseType: number;
  message: string;
  data: any;
}

const API_BASE_PATH = '/adminapi';

export const fetchBanners = async (token: string): Promise<ApiBanner[]> => {
  const response = await requestJson<BannersApiResponse>(`${API_BASE_PATH}/Banner/list`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch banners.');
  }
  return response.data;
};

export const addBanner = async (token: string, payload: ApiBanner): Promise<any> => {
  const response = await requestJson<SaveBannerResponse>(`${API_BASE_PATH}/Banner/add`, {
    method: 'POST',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: payload,
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to add banner.');
  }
  return response.data;
};

export const updateBanner = async (token: string, payload: ApiBanner): Promise<any> => {
  const response = await requestJson<SaveBannerResponse>(`${API_BASE_PATH}/Banner/update`, {
    method: 'PUT',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: payload,
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to update banner.');
  }
  return response.data;
};

export const deleteBanner = async (token: string, id: number): Promise<void> => {
  const response = await requestJson<SaveBannerResponse>(`${API_BASE_PATH}/Banner/${id}`, {
    method: 'DELETE',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to delete banner.');
  }
};

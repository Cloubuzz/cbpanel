import { requestJson } from '../lib/httpClient';

export interface ApiCategory {
  menuID: number;
  ID: number;
  Name: string;
  Description: string;
  IsActive: boolean;
  ORDER: number;
  CategoryImage: string;
  IsCategoryImageActive: boolean;
  Days: string;
  Outlets: string;
  startTime: string;
  endTime: string;
  startTime1: string;
  endTime1: string;
  IsExclusiveDeal: boolean;
  IsGlobal: boolean;
  IsGallaryShow: boolean;
  GallarySort: number;
  FoodPandaID: number | Record<string, never>;
  OutletID: string;
  URL: string;
  ImageName: string;
  Logo: string | Record<string, never>;
  CopiedFromID: number | Record<string, never>;
  CreatedDate: string;
  CreatedBy: number;
  ModifiedDate: string;
  ModifiedBy: number;
  Created: string;
}

interface CategoriesApiResponse {
  responseType: number;
  data?: ApiCategory[];
}

interface CategoryMutationResponse {
  responseType: number;
  message?: string;
  rowsAffected?: number;
}

export interface CategoryPayload {
  id: number;
  menuID: number;
  name: string;
  description: string;
  isActive: boolean;
  order: number;
  startTime: string;
  endTime: string;
  startTime1: string;
  endTime1: string;
  days: string;
  outlets: string;
}

const API_BASE_PATH = '/adminapi';

export const fetchCategories = async (
  token: string,
  onlyActive = false,
): Promise<ApiCategory[]> => {
  const url = `${API_BASE_PATH}/menu/categories/list?onlyActive=${onlyActive}`;
  const response = await requestJson<CategoriesApiResponse>(url, {
    method: 'GET',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch categories.');
  }

  return response.data;
};

export const addCategory = async (
  token: string,
  payload: CategoryPayload,
): Promise<void> => {
  const response = await requestJson<CategoryMutationResponse>(
    `${API_BASE_PATH}/menu/categories/add`,
    {
      method: 'POST',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    },
  );

  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to add category.');
  }
};

export const updateCategory = async (
  token: string,
  payload: CategoryPayload,
): Promise<void> => {
  const response = await requestJson<CategoryMutationResponse>(
    `${API_BASE_PATH}/menu/categories/update`,
    {
      method: 'PUT',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    },
  );

  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to update category.');
  }
};

import { requestJson } from '../lib/httpClient';

export interface ApiCategory {
  menuID: number;
  ID: number;
  Name: string;
  Description: string | Record<string, never>;
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
  image?: string;
}

const API_BASE_PATH = '/adminapi';

// ─── Generic helper ───────────────────────────────────────────────────────────

async function adminRequest<T>(
  token: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
): Promise<T> {
  return requestJson<T>(`${API_BASE_PATH}/${endpoint}`, {
    method,
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    ...(body !== undefined ? { body } : {}),
  });
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

export const fetchCategories = async (
  token: string,
  onlyActive = false,
): Promise<ApiCategory[]> => {
  const response = await adminRequest<CategoriesApiResponse>(
    token,
    `menu/categories/list?onlyActive=${onlyActive}`,
  );
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch categories.');
  }
  return response.data;
};

export const addCategory = async (
  token: string,
  payload: CategoryPayload,
): Promise<void> => {
  const response = await adminRequest<CategoryMutationResponse>(
    token,
    'menu/categories/add',
    'POST',
    payload,
  );
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to add category.');
  }
};

export const updateCategory = async (
  token: string,
  payload: CategoryPayload,
): Promise<void> => {
  const response = await adminRequest<CategoryMutationResponse>(
    token,
    'menu/categories/update',
    'PUT',
    payload,
  );
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to update category.');
  }
};

export const deleteCategory = async (token: string, id: number): Promise<void> => {
  const response = await adminRequest<CategoryMutationResponse>(
    token,
    `menu/categories/${id}`,
    'DELETE',
  );
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to delete category.');
  }
};

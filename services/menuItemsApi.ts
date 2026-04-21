import { requestJson } from '../lib/httpClient';

export interface ApiMenuItem {
  MenuID: number;
  ID: number;
  Name: string;
  Description: string;
  CategoryID: number;
  IsActive: boolean;
  OldItemID: number | Record<string, never>;
  OrderCount: number;
  CreatedDate: string;
  ModifiedDate: string;
  CreatedBy: number;
  ModifiedBy: number;
  CopiedFromID: string | Record<string, never>;
  Order: number;
  FoodPandaID: number | Record<string, never>;
  ItemImage: string;
  IsItemImageActive: boolean;
  RemoteCode: string;
  Serving: string;
  ShowSize: boolean;
  IsFeatured: boolean;
  IsSuggestive: boolean;
  SpecialDeal: boolean;
  SpecialDealText: string;
  Timer: boolean;
  ItemEndTime: string;
  IsNewItem: boolean;
  NewItemText: string;
  Whatsapplink: string | Record<string, never>;
  Tags: string;
  PaymentType: string | Record<string, never>;
  ShowDescription: boolean;
  RCode: string | Record<string, never>;
  startTime: string;
  endTime: string;
  Days: string;
  DodoImage: string | Record<string, never>;
  Created: string;
  Platform: string;
  ItemImagePopup: string | Record<string, never>;
}

interface MenuItemsApiResponse {
  responseType: number;
  data?: ApiMenuItem[];
}

export interface FetchMenuItemsOptions {
  page?: number;
  pageSize?: number;
  onlyActive?: boolean;
  categoryId?: number;
}

const API_BASE_PATH = '/adminapi';

export const fetchMenuItems = async (
  token: string,
  options: FetchMenuItemsOptions = {},
): Promise<ApiMenuItem[]> => {
  const { page = 1, pageSize = 50, onlyActive, categoryId } = options;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (onlyActive !== undefined) params.set('onlyActive', String(onlyActive));
  if (categoryId !== undefined) params.set('categoryId', String(categoryId));

  const response = await requestJson<MenuItemsApiResponse>(
    `${API_BASE_PATH}/menu/items/list?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch menu items.');
  }

  return response.data;
};

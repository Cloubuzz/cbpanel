import { requestJson, getApiUrl } from '../lib/httpClient';

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
  Serving: string | Record<string, never>;
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
  sizes?: any[];
  Sizes?: any[];
}

interface MenuItemsApiResponse {
  responseType: number;
  data?: ApiMenuItem[];
}

export interface FetchMenuItemsOptions {
  page?: number;
  pageSize?: number;
  onlyActive?: string;
  categoryId?: number;
  searchTerm?: string;
  includeSizes?: boolean;
}

export interface ToppingTemplate {
  Name: string;
}

interface ToppingTemplateApiResponse {
  responseType: number;
  data?: ToppingTemplate[];
}

export interface ApiToppingItem {
  ID: number;
  Name: string;
  Description: string;
  Required: boolean;
  MultiSelect: boolean;
  menuItemID: number;
  CreatedDate: string;
  ModifiedDate: string;
  Order: number;
  FoodPandaID: number | Record<string, never>;
  FoodPandaTable: Record<string, never>;
  SizeID: number;
  SizeName: string | Record<string, never>;
  Price: string;
  ImageURL: string;
  IsActive: boolean;
  OriginalPrice: number;
  SetasItemName: boolean;
}

export interface ApiLinkedMenuItem {
  ID: number;
  Name: string;
  Description?: string;
  CategoryID?: number;
  IsActive?: boolean;
  ItemImage?: string;
  IsItemImageActive?: boolean;
  Slug?: string;
  Price?: number | string;
  ToppingId?: number;
}

export interface ApiToppingListItem {
  id: number;
  ToppingName: string;
  ProductName: string;
  Price: string;
  OriginalPrice: number;
  Required: boolean;
  Multiselect: boolean;
}

interface ToppingItemsApiResponse {
  responseType: number;
  data?: ApiToppingItem[];
}

interface LinkedItemsApiResponse {
  responseType: number;
  data?: ApiLinkedMenuItem[];
}

export interface ToppingListApiResponse {
  responseType: number;
  data?: ApiToppingListItem[] | { page?: number; pageSize?: number; data?: ApiToppingListItem[] };
}

export interface SaveToppingPayload {
  id: number;
  name: string;
  description: string;
  menuItemId: number;
  price: number;
  originalPrice: number;
  required: boolean;
  multiSelect: boolean;
  isActive: boolean;
  imageUrl: string;
}

export interface SaveToppingResponse {
  message: string;
}

const API_BASE_PATH = '/adminapi';

// ─── Generic helper ───────────────────────────────────────────────────────────

async function adminGet<T>(
  token: string,
  endpoint: string,
  params?: URLSearchParams,
): Promise<T> {
  const url = params ? `${API_BASE_PATH}/${endpoint}?${params}` : `${API_BASE_PATH}/${endpoint}`;
  return requestJson<T>(url, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
}

// ─── Unique topping names ─────────────────────────────────────────────────────

const uniqueToppingNames = (items?: Array<any>): ToppingTemplate[] => {
  const seen = new Set<string>();
  const list: ToppingTemplate[] = [];
  items?.forEach((item) => {
    const name = (item?.Name || item?.name || item?.groupName || item?.GroupName || '').trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      list.push({ Name: name });
    }
  });
  return list;
};

// ─── Fetch functions ──────────────────────────────────────────────────────────

export const fetchMenuItems = async (
  token: string,
  options: FetchMenuItemsOptions = {},
): Promise<ApiMenuItem[]> => {
  const { page = 1, pageSize = 50, onlyActive, categoryId, searchTerm, includeSizes } = options;
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (onlyActive !== undefined) params.set('onlyActive', String(onlyActive));
  if (categoryId !== undefined) params.set('categoryId', String(categoryId));
  if (searchTerm) params.set('searchTerm', searchTerm);
  if (includeSizes !== undefined) params.set('includeSizes', String(includeSizes));

  const response = await adminGet<MenuItemsApiResponse>(token, `menu/items/list`, params);

  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch menu items.');
  }
  return response.data;
};

export const fetchMenuItemById = async (
  token: string,
  itemId: number | string,
): Promise<ApiMenuItem | null> => {
  const response = await adminGet<{ responseType: number; message: string; data?: any }>(
    token,
    `menu/item/${itemId}`,
  );
  if (response.responseType !== 1 || !response.data) {
    return null;
  }
  const itemData = response.data.data || response.data;
  return itemData as ApiMenuItem;
};

export const fetchToppingTemplates = async (
  token: string,
  onlyActive = true,
): Promise<ToppingTemplate[]> => {
  const params = new URLSearchParams({ onlyActive: String(onlyActive) });
  const response = await adminGet<ToppingTemplateApiResponse>(token, `menu/toppingtemplate`, params);

  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch topping templates.');
  }
  return uniqueToppingNames(response.data);
};

export const fetchToppingItems = async (
  token: string,
  toppingName: string,
): Promise<ApiToppingItem[]> => {
  const response = await requestJson<ToppingItemsApiResponse>(
    `${API_BASE_PATH}/topping/items/${encodeURIComponent(toppingName)}`,
    { method: 'GET', headers: { accept: '*/*', Authorization: `Bearer ${token}` } },
  );
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch topping items.');
  }
  return response.data;
};

export const fetchToppingLinkedItems = async (
  token: string,
  toppingName: string,
): Promise<ApiLinkedMenuItem[]> => {
  const response = await requestJson<LinkedItemsApiResponse>(
    `${API_BASE_PATH}/topping/linked-items/${encodeURIComponent(toppingName)}`,
    { method: 'GET', headers: { accept: '*/*', Authorization: `Bearer ${token}` } },
  );
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch linked items.');
  }
  return response.data;
};

export interface FetchToppingListOptions {
  page?: number;
  pageSize?: number;
}

export const fetchToppingList = async (
  token: string,
  options: FetchToppingListOptions = {},
): Promise<ApiToppingListItem[]> => {
  const { page = 1, pageSize = 50 } = options;
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });

  const response = await requestJson<ToppingListApiResponse>(
    `${API_BASE_PATH}/topping/getall?${params}`,
    { method: 'GET', headers: { accept: '*/*', Authorization: `Bearer ${token}` } },
  );

  if (response.responseType !== 1) {
    throw new Error('Failed to fetch topping list.');
  }

  const rawData = response.data;
  if (Array.isArray(rawData)) {
    return rawData;
  }
  if (rawData && Array.isArray(rawData.data)) {
    return rawData.data;
  }

  return [];
};

export const saveTopping = async (
  token: string,
  payload: SaveToppingPayload,
): Promise<SaveToppingResponse> => {
  const response = await requestJson<SaveToppingResponse>(`${API_BASE_PATH}/topping/save`, {
    method: 'POST',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: payload,
  });
  if (!response?.message) throw new Error('Failed to save topping.');
  return response;
};

interface ToppingMutationApiResponse {
  responseType: number;
  message?: string;
}

export const deleteTopping = async (token: string, id: number): Promise<void> => {
  const response = await requestJson<ToppingMutationApiResponse>(`${API_BASE_PATH}/topping/${id}`, {
    method: 'DELETE',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to delete topping.');
  }
};

// multipart/form-data upload — requestJson always JSON-encodes its body, so this
// bypasses it and talks to fetch directly.
export const uploadToppingImage = async (token: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(getApiUrl(`${API_BASE_PATH}/topping/upload`), {
    method: 'POST',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as { responseType?: number; message?: string; data?: string } | null;

  if (!response.ok || !payload || payload.responseType !== 1) {
    throw new Error(payload?.message || 'Failed to upload image.');
  }
  return payload.data || '';
};

// ─── Menu item create/update ─────────────────────────────────────────────────

export interface MenuSizeDto {
  id?: string | null;
  size?: string | null;
  price: number;
  originalPrice: number;
  pickupPrice: number;
  originalDisplayPrice: number;
  halfNHalf: boolean;
  rCode?: string | null;
  modifierGroups?: string[] | null;
}

export interface MenuItemDataDto {
  name?: string | null;
  menu?: string | null;
  category?: string | null;
  remoteCode?: string | null;
  description?: string | null;
  order: number;
  image?: string | null;
  imagePopup?: string | null;
  serving: number;
  specialDealText?: string | null;
  timerEndTime?: string | null;
  newItemText?: string | null;
  tags?: string[] | null;
  isActive: boolean;
  isSuggestive: boolean;
  isNewItem: boolean;
  showDescription: boolean;
  startTime?: string | null;
  endTime?: string | null;
  availableDays?: string[] | null;
  sizes?: MenuSizeDto[] | null;
}

interface MenuItemMutationApiResponse {
  responseType: number;
  message?: string;
}

export const addMenuItem = async (token: string, data: MenuItemDataDto): Promise<void> => {
  const response = await requestJson<MenuItemMutationApiResponse>(`${API_BASE_PATH}/menu/item/add`, {
    method: 'POST',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: {
      type: 'menu_item',
      action: 'create',
      data,
      timestamp: new Date().toISOString(),
    },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to add menu item.');
  }
};

export interface UpdateSizePayload {
  id?: number;
  size: string;
  price: number;
  originalPrice: number;
  takeawayPrice: number;
  halfnHalf: boolean;
  frozillaPrice: number;
  rCode?: string | null;
  modifierGroups?: string[] | null;
}

export interface UpdateMenuItemPayload {
  itemId: number;
  menuId: number;
  categoryId: number;
  name?: string | null;
  description?: string | null;
  order: string;
  remoteCode?: string | null;
  isActive: boolean;
  isSuggestive: boolean;
  isNewItem: boolean;
  showDescription: boolean;
  serving: string;
  specialDealText?: string | null;
  specialDeal: boolean;
  itemEndTime?: string | null;
  timer: boolean;
  startTime?: string | null;
  endTime?: string | null;
  days?: string | null;
  imageName?: string | null;
  imagePopupName?: string | null;
  sizes?: UpdateSizePayload[] | null;
  deleteSizeIds?: number[] | null;
  optionGroups?: any[] | null;
  deleteOptionGroupIds?: number[] | null;
}

export const updateMenuItem = async (token: string, payload: UpdateMenuItemPayload): Promise<void> => {
  const response = await requestJson<MenuItemMutationApiResponse>(`${API_BASE_PATH}/menu/item/update`, {
    method: 'POST',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: payload,
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to update menu item.');
  }
};

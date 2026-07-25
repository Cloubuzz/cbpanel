import type { ApiMenuItem } from '../../services/menuItemsApi';

export interface ModifierGroup {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
}

export interface MenuSize {
  id: string;
  size: string;
  price: number;
  originalPrice: number;
  pickupPrice: number;
  originalDisplayPrice: number;
  halfNHalf: boolean;
  rCode?: string;
  modifierGroups?: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  categoryID: number;
  category: string;
  remoteCode: string;
  description: string;
  order: number;
  image: string;
  imagePopup?: string;
  serving: number;
  specialDealText: string;
  timerEndTime: string;
  newItemText: string;
  tags: string[];
  isActive: boolean;
  isSuggestive: boolean;
  isNewItem: boolean;
  showDescription: boolean;
  startTime: string;
  endTime: string;
  availableDays: string[];
  sizes: MenuSize[];
  apiRaw?: ApiMenuItem;
}

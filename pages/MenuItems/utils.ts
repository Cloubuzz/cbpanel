import type { ApiMenuItem, MenuItemDataDto, UpdateMenuItemPayload } from '../../services/menuItemsApi';
import type { MenuItem } from './types';
import { DAYS } from './constants';
import { asText } from '../../lib/apiValue';

export const formatMenuItemImageUrl = (imageVal?: any): string => {
  const str = asText(imageVal, '');
  if (!str) return '';
  const trimmed = str.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  return `https://admin.broadwaypizza.com.pk/Images/ProductImages/${trimmed}`;
};

const mapSingleSize = (s: any) => {
  const optionGroupDetails = Array.isArray(s.optionGroupDetails)
    ? s.optionGroupDetails
    : Array.isArray(s.OptionGroupDetails)
    ? s.OptionGroupDetails
    : Array.isArray(s.optionGroups)
    ? s.optionGroups
    : [];

  const rawModifierGroups = Array.isArray(s.modifierGroups)
    ? s.modifierGroups
    : Array.isArray(s.ModifierGroups)
    ? s.ModifierGroups
    : [];

  const detailGroupNames = optionGroupDetails
    .map((og: any) => og.name || og.Name || og.groupName || og.GroupName)
    .filter(Boolean);

  const combinedModifierGroups = Array.from(
    new Set([...rawModifierGroups, ...detailGroupNames])
  );

  return {
    id: String(s.id || s.ID || Math.random().toString(36).substr(2, 9)),
    size: s.size || s.Size || '',
    price: Number(s.price ?? s.Price ?? 0),
    originalPrice: Number(s.originalPrice ?? s.OriginalPrice ?? 0),
    pickupPrice: Number(s.pickupPrice ?? s.TakeawayPrice ?? s.Price ?? 0),
    originalDisplayPrice: Number(s.originalDisplayPrice ?? s.FrozillaOriginalPrice ?? 0),
    halfNHalf: Boolean(s.halfNHalf ?? s.HalfnHalf),
    rCode: s.rCode || s.RCode || s.rcode || '',
    modifierGroups: combinedModifierGroups,
    optionGroupDetails,
  };
};

const parseDays = (rawVal: any): string[] => {
  if (Array.isArray(rawVal)) {
    if (rawVal.length === 0) return DAYS;
    return rawVal.map((d: any) => {
      const s = String(d).trim();
      const match = DAYS.find(day => day.toLowerCase() === s.toLowerCase() || day.toLowerCase().startsWith(s.toLowerCase()));
      return match || s;
    });
  }

  const str = asText(rawVal, '').trim();
  if (!str || str.toLowerCase() === 'all') {
    return DAYS;
  }

  const parts = str.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return DAYS;

  return parts.map(p => {
    const match = DAYS.find(day => day.toLowerCase() === p.toLowerCase() || day.toLowerCase().startsWith(p.toLowerCase()));
    return match || p;
  });
};

export const mapApiMenuItem = (api: ApiMenuItem): MenuItem => {
  const raw = api as any;
  const idVal = String(raw.id || raw.ID || '');
  const nameVal = raw.name || raw.Name || '';
  const catIdVal = Number(raw.categoryID || raw.CategoryID || raw.categoryId || 0);
  const catVal = String(raw.category || raw.Category || raw.CategoryName || catIdVal || '');
  const remoteCodeVal = asText(raw.remoteCode || raw.RemoteCode);
  const descVal = asText(raw.description || raw.Description);
  const orderVal = Number(raw.order ?? raw.Order ?? 0);
  const imageVal = asText(raw.image || raw.ItemImage || raw.itemImage);
  const imagePopupVal = asText(raw.imagePopup || raw.ItemImagePopup || raw.itemImagePopup);
  const servingVal = typeof raw.serving === 'number' ? raw.serving : parseInt(asText(raw.serving || raw.Serving, '0'), 10) || 0;
  const dealTextVal = asText(raw.specialDealText || raw.SpecialDealText);
  const timerEndTimeVal = asText(raw.timerEndTime || raw.ItemEndTime, '00:00');
  const newItemTextVal = asText(raw.newItemText || raw.NewItemText);
  const tagsVal = Array.isArray(raw.tags) ? raw.tags : typeof raw.Tags === 'string' && raw.Tags ? raw.Tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
  const isActiveVal = Boolean(raw.isActive ?? raw.IsActive ?? true);
  const isSuggestiveVal = Boolean(raw.isSuggestive ?? raw.IsSuggestive ?? false);
  const isNewItemVal = Boolean(raw.isNewItem ?? raw.IsNewItem ?? false);
  const showDescVal = Boolean(raw.showDescription ?? raw.ShowDescription ?? true);
  const startTimeVal = asText(raw.startTime || raw.StartTime, '00:00');
  const endTimeVal = asText(raw.endTime || raw.EndTime, '00:00');
  const daysVal = parseDays(raw.days ?? raw.Days ?? raw.availableDays);

  return {
    id: idVal,
    name: nameVal,
    categoryID: catIdVal,
    category: catVal,
    remoteCode: remoteCodeVal,
    description: descVal,
    order: orderVal,
    image: formatMenuItemImageUrl(imageVal),
    imagePopup: formatMenuItemImageUrl(imagePopupVal),
    serving: servingVal,
    specialDealText: dealTextVal,
    timerEndTime: timerEndTimeVal,
    newItemText: newItemTextVal,
    tags: tagsVal,
    isActive: isActiveVal,
    isSuggestive: isSuggestiveVal,
    isNewItem: isNewItemVal,
    showDescription: showDescVal,
    startTime: startTimeVal,
    endTime: endTimeVal,
    availableDays: daysVal,
  sizes: Array.isArray(api.sizes)
    ? api.sizes.map(mapSingleSize)
    : Array.isArray(api.Sizes)
    ? api.Sizes.map(mapSingleSize)
    : [],
    apiRaw: api,
  };
};

const joinDays = (availableDays: string[] | undefined): string =>
  availableDays && availableDays.length === DAYS.length ? 'All' : (availableDays || []).join(',');

export const mapMenuItemToAddPayload = (item: Partial<MenuItem>): MenuItemDataDto => ({
  name: item.name || '',
  menu: item.category || '',
  category: item.category || '',
  remoteCode: item.remoteCode || '',
  description: item.description || '',
  order: item.order ?? 0,
  image: item.image || '',
  imagePopup: item.imagePopup || '',
  serving: item.serving ?? 0,
  specialDealText: item.specialDealText || '',
  timerEndTime: item.timerEndTime || '00:00',
  newItemText: item.newItemText || '',
  tags: item.tags || [],
  isActive: item.isActive ?? true,
  isSuggestive: item.isSuggestive ?? false,
  isNewItem: item.isNewItem ?? false,
  showDescription: item.showDescription ?? true,
  startTime: item.startTime || '00:00',
  endTime: item.endTime || '00:00',
  availableDays: item.availableDays || [],
  sizes: (item.sizes || []).map((s) => ({
    id: s.id,
    size: s.size,
    price: s.price,
    originalPrice: s.originalPrice,
    pickupPrice: s.pickupPrice,
    originalDisplayPrice: s.originalDisplayPrice,
    halfNHalf: s.halfNHalf,
    rCode: s.rCode || '',
    modifierGroups: s.modifierGroups || [],
  })),
});

export const mapMenuItemToUpdatePayload = (item: MenuItem): UpdateMenuItemPayload => ({
  itemId: Number(item.id),
  menuId: item.apiRaw?.MenuID ?? 0,
  categoryId: item.categoryID,
  name: item.name,
  description: item.description,
  order: String(item.order),
  remoteCode: item.remoteCode,
  isActive: item.isActive,
  isSuggestive: item.isSuggestive,
  isNewItem: item.isNewItem,
  showDescription: item.showDescription,
  serving: String(item.serving),
  specialDealText: item.specialDealText,
  specialDeal: item.apiRaw?.SpecialDeal ?? false,
  itemEndTime: item.timerEndTime,
  timer: item.apiRaw?.Timer ?? false,
  startTime: item.startTime,
  endTime: item.endTime,
  days: joinDays(item.availableDays),
  imageName: (() => {
    const oldVal = asText(item.apiRaw?.ItemImage || (item.apiRaw as any)?.itemImage || (item.apiRaw as any)?.image);
    return item.image.startsWith('data:')
      ? item.image
      : (item.image === formatMenuItemImageUrl(oldVal) ? oldVal : item.image);
  })(),
  imagePopupName: (() => {
    const oldVal = asText(item.apiRaw?.ItemImagePopup || (item.apiRaw as any)?.itemImagePopup || (item.apiRaw as any)?.imagePopup);
    return (item.imagePopup || '').startsWith('data:')
      ? (item.imagePopup || '')
      : (item.imagePopup === formatMenuItemImageUrl(oldVal) ? oldVal : (item.imagePopup || ''));
  })(),
  sizes: (item.sizes || []).map((s) => ({
    id: Number(s.id) || 0,
    size: s.size,
    price: s.price,
    originalPrice: s.originalPrice,
    takeawayPrice: s.pickupPrice,
    halfnHalf: s.halfNHalf,
    frozillaPrice: s.originalDisplayPrice,
    rCode: s.rCode || '',
    modifierGroups: s.modifierGroups || [],
  })),
  deleteSizeIds: [],
  optionGroups: [],
  deleteOptionGroupIds: [],
});

const POS_BASE_URL = 'https://services.broadwaypizza.com.pk/BroadwayAPI.aspx';
const DEFAULT_CITY = 'Karachi';
const DEFAULT_AREA = '4K Chowrangi';

interface ApiMenuResponse {
  Data?: {
    NestedMenuForMobile?: Array<{
      MenuCategoryList?: ApiCategory[];
    }>;
  };
}

interface ApiCategory {
  ID: string;
  Name: string;
  MenuItemsList: ApiProduct[];
}

interface ApiProduct {
  ID: string;
  Name: string;
  TakeawayPrice: number;
  ImageBase64: string;
  CategoryID: string;
}

interface ApiOptionResponse {
  Data?: {
    MenuSizesList?: ApiMenuSize[];
  };
}

interface ApiMenuSize {
  ID: number;
  Size: string;
  TakeAwayPrice: number;
  FlavourAndToppingsList?: ApiModifierGroup[];
}

interface ApiModifierGroup {
  ID: number;
  Name: string;
  IsMultiple: boolean;
  OptionsList?: ApiModifier[];
}

interface ApiModifier {
  ID: number;
  Name: string;
  Price: number;
}

export interface PosModifier {
  id: string;
  name: string;
  price: number;
}

export interface PosModifierGroup {
  id: string;
  name: string;
  modifiers: PosModifier[];
  selectionType: 'single' | 'multiple';
  min?: number;
  max?: number;
}

export interface PosSize {
  id: string;
  name: string;
  price: number;
  modifierGroups: PosModifierGroup[];
}

export interface PosProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  catId: string;
}

export interface PosCategory {
  id: string;
  name: string;
}

export interface PosMenuData {
  categories: PosCategory[];
  products: PosProduct[];
}

const buildUrl = (method: string, params: Record<string, string>): string => {
  const url = new URL(POS_BASE_URL);
  url.searchParams.set('method', method);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

export const fetchPosMenu = async (): Promise<PosMenuData> => {
  const url = buildUrl('getmenu', {
    city: DEFAULT_CITY,
    area: DEFAULT_AREA,
    Platform: 'Web',
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load POS menu.');
  }

  const data = (await response.json()) as ApiMenuResponse;
  const categoryList = data?.Data?.NestedMenuForMobile?.[0]?.MenuCategoryList;

  if (!Array.isArray(categoryList)) {
    throw new Error('Unexpected response from POS menu API.');
  }

  const categories = categoryList.map((category) => ({
    id: category.ID,
    name: category.Name,
  }));

  const products = categoryList.flatMap((category) =>
    category.MenuItemsList.map((product) => ({
      id: product.ID,
      name: product.Name,
      price: product.TakeawayPrice,
      image: product.ImageBase64,
      catId: product.CategoryID,
    }))
  );

  return { categories, products };
};

export const fetchPosProductOptions = async (productId: string): Promise<PosSize[]> => {
  const url = buildUrl('getoptions', {
    ItemId: productId,
    City: DEFAULT_CITY,
    Area: DEFAULT_AREA,
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load product options.');
  }

  const data = (await response.json()) as ApiOptionResponse;
  const sizes = data?.Data?.MenuSizesList;

  if (!Array.isArray(sizes) || sizes.length === 0) {
    return [];
  }

  return sizes.map((size) => {
    const modifierGroups = (size.FlavourAndToppingsList ?? [])
      .map((group) => {
        const modifiers = (group.OptionsList ?? []).map((option) => ({
          id: String(option.ID),
          name: option.Name,
          price: option.Price || 0,
        }));

        return {
          id: String(group.ID),
          name: group.Name,
          selectionType: group.IsMultiple ? 'multiple' : 'single',
          min: group.IsMultiple ? 0 : 1,
          max: group.IsMultiple ? 99 : 1,
          modifiers,
        } as PosModifierGroup;
      })
      .filter((group) => group.modifiers.length > 0);

    return {
      id: String(size.ID),
      name: size.Size || 'Regular',
      price: size.TakeAwayPrice || 0,
      modifierGroups,
    };
  });
};

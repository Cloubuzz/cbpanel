import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchPosMenu,
  fetchPosProductOptions,
  type PosCategory,
  type PosProduct,
  type PosSize,
} from '../../services/posApi';

interface PosState {
  categories: PosCategory[];
  products: PosProduct[];
  activeCategory: string;
  menuLoading: boolean;
  menuError: string | null;
  optionsByProduct: Record<string, PosSize[]>;
  optionLoadingByProduct: Record<string, boolean>;
  optionErrorByProduct: Record<string, string | null>;
}

const initialState: PosState = {
  categories: [],
  products: [],
  activeCategory: '',
  menuLoading: false,
  menuError: null,
  optionsByProduct: {},
  optionLoadingByProduct: {},
  optionErrorByProduct: {},
};

export const loadPosMenu = createAsyncThunk<
  { categories: PosCategory[]; products: PosProduct[] },
  void,
  { rejectValue: string }
>('pos/loadMenu', async (_, { rejectWithValue }) => {
  try {
    return await fetchPosMenu();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load POS menu.';
    return rejectWithValue(message);
  }
});

export const loadPosProductOptions = createAsyncThunk<
  { productId: string; sizes: PosSize[] },
  string,
  { rejectValue: { productId: string; message: string } }
>('pos/loadProductOptions', async (productId, { rejectWithValue }) => {
  try {
    const sizes = await fetchPosProductOptions(productId);
    return { productId, sizes };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load product options.';
    return rejectWithValue({ productId, message });
  }
});

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    setPosActiveCategory(state, action: PayloadAction<string>) {
      state.activeCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadPosMenu.pending, (state) => {
      state.menuLoading = true;
      state.menuError = null;
    });
    builder.addCase(loadPosMenu.fulfilled, (state, action) => {
      state.menuLoading = false;
      state.menuError = null;
      state.categories = action.payload.categories;
      state.products = action.payload.products;

      if (action.payload.categories.length === 0) {
        state.activeCategory = '';
      } else if (!state.activeCategory) {
        state.activeCategory = action.payload.categories[0].id;
      }
    });
    builder.addCase(loadPosMenu.rejected, (state, action) => {
      state.menuLoading = false;
      state.menuError = action.payload ?? 'Failed to load POS menu.';
    });

    builder.addCase(loadPosProductOptions.pending, (state, action) => {
      const productId = action.meta.arg;
      state.optionLoadingByProduct[productId] = true;
      state.optionErrorByProduct[productId] = null;
    });
    builder.addCase(loadPosProductOptions.fulfilled, (state, action) => {
      const { productId, sizes } = action.payload;
      state.optionLoadingByProduct[productId] = false;
      state.optionErrorByProduct[productId] = null;
      state.optionsByProduct[productId] = sizes;
    });
    builder.addCase(loadPosProductOptions.rejected, (state, action) => {
      const payload = action.payload;
      const productId = payload?.productId ?? action.meta.arg;
      state.optionLoadingByProduct[productId] = false;
      state.optionErrorByProduct[productId] = payload?.message ?? 'Failed to load product options.';
    });
  },
});

export const { setPosActiveCategory } = posSlice.actions;
export default posSlice.reducer;

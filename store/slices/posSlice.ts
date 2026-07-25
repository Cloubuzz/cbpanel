import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface PosState {
  categories: PosCategory[];
  products: PosProduct[];
  activeCategory: string;
}

const initialState: PosState = {
  categories: [],
  products: [],
  activeCategory: '',
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    setPosActiveCategory(state, action: PayloadAction<string>) {
      state.activeCategory = action.payload;
    },
  },
});

export const { setPosActiveCategory } = posSlice.actions;
export default posSlice.reducer;

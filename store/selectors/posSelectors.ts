import type { RootState } from '../index';

export const selectPosCategories = (state: RootState) => state.pos.categories;
export const selectPosProducts = (state: RootState) => state.pos.products;
export const selectPosActiveCategory = (state: RootState) => state.pos.activeCategory;

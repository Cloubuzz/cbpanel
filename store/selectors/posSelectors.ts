import type { RootState } from '../index';

export const selectPosCategories = (state: RootState) => state.pos.categories;
export const selectPosProducts = (state: RootState) => state.pos.products;
export const selectPosActiveCategory = (state: RootState) => state.pos.activeCategory;
export const selectPosMenuLoading = (state: RootState) => state.pos.menuLoading;
export const selectPosMenuError = (state: RootState) => state.pos.menuError;
export const selectPosOptionsByProduct = (state: RootState) => state.pos.optionsByProduct;
export const selectPosOptionLoadingByProduct = (state: RootState) => state.pos.optionLoadingByProduct;
export const selectPosOptionErrorByProduct = (state: RootState) => state.pos.optionErrorByProduct;

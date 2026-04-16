import type { RootState } from '../index';

export const selectIsAuthenticated = (state: RootState) => state.app.isAuthenticated;
export const selectIsSidebarOpen = (state: RootState) => state.app.isSidebarOpen;
export const selectAuthLoading = (state: RootState) => state.app.authLoading;
export const selectAuthError = (state: RootState) => state.app.authError;
export const selectCurrentUser = (state: RootState) => state.app.user;

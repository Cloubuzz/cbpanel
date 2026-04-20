import type { RootState } from '../index';

export const selectActiveTab = (state: RootState) => state.orders.activeTab;
export const selectSelectedOrderId = (state: RootState) => state.orders.selectedOrderId;
export const selectTabData = (state: RootState) => state.orders.tabs;
export const selectCurrentTabOrders = (state: RootState) =>
  state.orders.tabs[state.orders.activeTab]?.orders ?? [];
export const selectCurrentTabLoading = (state: RootState) =>
  state.orders.tabs[state.orders.activeTab]?.loading ?? false;
export const selectCurrentTabError = (state: RootState) =>
  state.orders.tabs[state.orders.activeTab]?.error ?? null;
export const selectTabLoading = (tab: string) => (state: RootState) =>
  state.orders.tabs[tab as keyof typeof state.orders.tabs]?.loading ?? false;
export const selectOrderDetail = (state: RootState) => state.orders.detail;
export const selectOrderLogs = (state: RootState) => state.orders.logs;
export const selectPaymentLogs = (state: RootState) => state.orders.paymentLogs;
export const selectDetailLoading = (state: RootState) => state.orders.detailLoading;
export const selectDetailError = (state: RootState) => state.orders.detailError;
export const selectOutlets = (state: RootState) => state.orders.outlets;
export const selectOutletsLoading = (state: RootState) => state.orders.outletsLoading;
export const selectOutletsError = (state: RootState) => state.orders.outletsError;
export const selectProcessing = (state: RootState) => state.orders.processing;
export const selectProcessError = (state: RootState) => state.orders.processError;

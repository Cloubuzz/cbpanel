import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchOrders,
  fetchOrderDetail,
  fetchOrderLogs,
  fetchPaymentLogs,
  fetchOutlets,
  type RawOrder,
  type OrderTab,
  type OrderDetail,
  type OrderLogs,
  type PaymentLog,
  type Outlet,
} from '../../services/ordersApi';
import type { RootState } from '../index';

// ─── State ────────────────────────────────────────────────────────────────────

interface TabData {
  orders: RawOrder[];
  error: string | null;
  loading: boolean;
}

interface OrdersState {
  activeTab: OrderTab;
  selectedOrderId: number | null;
  tabs: Partial<Record<OrderTab, TabData>>;
  detail: OrderDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  logs: OrderLogs | null;
  paymentLogs: PaymentLog[];
  outlets: Outlet[];
  outletsLoading: boolean;
  outletsError: string | null;
}

const initialState: OrdersState = {
  activeTab: 'Accepted',
  selectedOrderId: null,
  tabs: {},
  detail: null,
  detailLoading: false,
  detailError: null,
  logs: null,
  paymentLogs: [],
  outlets: [],
  outletsLoading: false,
  outletsError: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loadTabOrders = createAsyncThunk<
  { tab: OrderTab; orders: RawOrder[] },
  OrderTab,
  { state: RootState; rejectValue: { tab: OrderTab; message: string } }
>('orders/loadTabOrders', async (tab, { getState, rejectWithValue }) => {
  const token = getState().app.token ?? '';
  try {
    const orders = await fetchOrders({ tab, token });
    return { tab, orders };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load orders.';
    return rejectWithValue({ tab, message });
  }
});

export const loadOrderDetail = createAsyncThunk<
  { detail: OrderDetail; logs: OrderLogs; paymentLogs: PaymentLog[] },
  number,
  { state: RootState; rejectValue: string }
>('orders/loadOrderDetail', async (orderId, { getState, rejectWithValue }) => {
  const token = getState().app.token ?? '';
  const [detailResult, logsResult, paymentLogsResult] = await Promise.allSettled([
    fetchOrderDetail(orderId, token),
    fetchOrderLogs(orderId, token),
    fetchPaymentLogs(orderId, token),
  ]);
  if (detailResult.status === 'rejected') {
    const message = detailResult.reason instanceof Error ? detailResult.reason.message : 'Failed to load order detail.';
    return rejectWithValue(message);
  }
  return {
    detail: detailResult.value,
    logs: logsResult.status === 'fulfilled' ? logsResult.value : null as unknown as OrderLogs,
    paymentLogs: paymentLogsResult.status === 'fulfilled' ? paymentLogsResult.value : [],
  };
});

export const loadOutlets = createAsyncThunk<
  Outlet[],
  string,
  { state: RootState; rejectValue: string }
>('orders/loadOutlets', async (city, { getState, rejectWithValue }) => {
  const token = getState().app.token ?? '';
  try {
    return await fetchOutlets(city, token);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load outlets.';
    return rejectWithValue(message);
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<OrderTab>) {
      state.activeTab = action.payload;
      state.selectedOrderId = null;
      state.detail = null;
      state.logs = null;
      state.paymentLogs = [];
      state.detailError = null;
    },
    setSelectedOrderId(state, action: PayloadAction<number | null>) {
      state.selectedOrderId = action.payload;
      state.detail = null;
      state.logs = null;
      state.paymentLogs = [];
      state.detailError = null;
    },
    invalidateTab(state, action: PayloadAction<OrderTab>) {
      delete state.tabs[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Tab orders
    builder.addCase(loadTabOrders.pending, (state, action) => {
      const tab = action.meta.arg;
      state.tabs[tab] = { orders: state.tabs[tab]?.orders ?? [], error: null, loading: true };
    });
    builder.addCase(loadTabOrders.fulfilled, (state, action) => {
      const { tab, orders } = action.payload;
      state.tabs[tab] = { orders, error: null, loading: false };
      // Auto-select first order if none selected and this is the active tab
      if (tab === state.activeTab && !state.selectedOrderId && orders.length > 0) {
        state.selectedOrderId = orders[0].ID;
      }
    });
    builder.addCase(loadTabOrders.rejected, (state, action) => {
      const { tab, message } = action.payload ?? { tab: state.activeTab, message: 'Unknown error.' };
      state.tabs[tab] = { orders: [], error: message, loading: false };
    });

    // Order detail + logs
    builder.addCase(loadOrderDetail.pending, (state) => {
      state.detailLoading = true;
      state.detailError = null;
      state.detail = null;
      state.logs = null;
      state.paymentLogs = [];
    });
    builder.addCase(loadOrderDetail.fulfilled, (state, action) => {
      state.detailLoading = false;
      state.detail = action.payload.detail;
      state.logs = action.payload.logs;
      state.paymentLogs = action.payload.paymentLogs;
    });
    builder.addCase(loadOrderDetail.rejected, (state, action) => {
      state.detailLoading = false;
      state.detailError = action.payload ?? 'Failed to load order detail.';
    });

    // Outlets
    builder.addCase(loadOutlets.pending, (state) => {
      state.outletsLoading = true;
      state.outletsError = null;
    });
    builder.addCase(loadOutlets.fulfilled, (state, action) => {
      state.outletsLoading = false;
      state.outlets = action.payload;
    });
    builder.addCase(loadOutlets.rejected, (state, action) => {
      state.outletsLoading = false;
      state.outletsError = action.payload ?? 'Failed to load outlets.';
    });
  },
});

export const { setActiveTab, setSelectedOrderId, invalidateTab } = ordersSlice.actions;
export default ordersSlice.reducer;

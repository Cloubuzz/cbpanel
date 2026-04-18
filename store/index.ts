import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import ordersReducer from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    orders: ordersReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

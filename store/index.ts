import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import ordersReducer from './slices/ordersSlice';
import posReducer from './slices/posSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    orders: ordersReducer,
    pos: posReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

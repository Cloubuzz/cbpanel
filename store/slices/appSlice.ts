import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getLoginErrorMessage,
  loginRequest,
  type AuthUser,
  type LoginCredentials,
  type LoginSuccessPayload,
} from '../../services/authApi';
import { persistAuthSession, readStoredAuthSession } from '../../services/authStorage';

interface AppState {
  isAuthenticated: boolean;
  isSidebarOpen: boolean;
  token: string | null;
  user: AuthUser | null;
  authLoading: boolean;
  authError: string | null;
}

const storedAuth = readStoredAuthSession();

export const loginUser = createAsyncThunk<
  LoginSuccessPayload,
  LoginCredentials,
  { rejectValue: string }
>('app/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const payload = await loginRequest(credentials);
    persistAuthSession(payload.token, payload.user);
    return payload;
  } catch (error) {
    return rejectWithValue(getLoginErrorMessage(error));
  }
});

const initialState: AppState = {
  isAuthenticated: Boolean(storedAuth.token),
  isSidebarOpen: false,
  token: storedAuth.token,
  user: storedAuth.user,
  authLoading: false,
  authError: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.isSidebarOpen = false;
      state.token = null;
      state.user = null;
      state.authLoading = false;
      state.authError = null;
    },
    clearAuthError(state) {
      state.authError = null;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.authError = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.authError = action.payload || 'Invalid username or password.';
      });
  },
});

export const {
  logout,
  clearAuthError,
  setSidebarOpen,
} = appSlice.actions;

export type { LoginCredentials };

export default appSlice.reducer;

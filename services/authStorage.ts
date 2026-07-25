import type { AuthUser } from './authApi';

export interface StoredAuthSession {
  token: string | null;
  user: AuthUser | null;
}

const AUTH_TOKEN_KEY = 'cbpanel_auth_token';
const AUTH_USER_KEY = 'cbpanel_auth_user';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const readStoredAuthSession = (): StoredAuthSession => {
  if (!canUseStorage()) {
    return { token: null, user: null };
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const userRaw = window.localStorage.getItem(AUTH_USER_KEY);

  if (!token || !userRaw) {
    return { token: null, user: null };
  }

  try {
    return {
      token,
      user: JSON.parse(userRaw) as AuthUser,
    };
  } catch {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
    return { token: null, user: null };
  }
};

export const persistAuthSession = (token: string, user: AuthUser): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearStoredAuthSession = (): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
};

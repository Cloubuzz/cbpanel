import { HttpClientError, requestJson } from '../lib/httpClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  userId: string;
  name: string;
  userType: string;
  landingPage: string;
}

export interface LoginSuccessPayload {
  token: string;
  user: AuthUser;
}

interface LoginResponseData extends AuthUser {
  token: string;
}

interface LoginApiResponse {
  responseType: number;
  data?: LoginResponseData;
  message?: string;
}

const API_BASE_PATH = '/adminapi';

export const loginRequest = async (
  credentials: LoginCredentials,
): Promise<LoginSuccessPayload> => {
  const payload = await requestJson<LoginApiResponse>(`${API_BASE_PATH}/auth/login`, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: credentials,
    timeoutMs: 15000,
  });

  if (payload.responseType !== 1 || !payload.data?.token) {
    throw new Error(payload.message || 'Invalid username or password.');
  }

  return {
    token: payload.data.token,
    user: {
      userId: payload.data.userId,
      name: payload.data.name,
      userType: payload.data.userType,
      landingPage: payload.data.landingPage,
    },
  };
};

export const getLoginErrorMessage = (error: unknown): string => {
  if (error instanceof HttpClientError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Unable to login. Please try again.';
};

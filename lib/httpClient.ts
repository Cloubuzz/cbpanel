export interface RequestJsonOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
}

export class HttpClientError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = 'HttpClientError';
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_TIMEOUT_MS = 15000;

const extractMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
};

const parsePayload = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const requestJson = async <T>(
  url: string,
  options: RequestJsonOptions = {},
): Promise<T> => {
  const { body, headers, timeoutMs = DEFAULT_TIMEOUT_MS, ...restOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const mergedHeaders = {
    accept: 'application/json',
    'Content-Type': 'application/json',
    ...(headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: mergedHeaders,
      signal: controller.signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await parsePayload(response);

    if (!response.ok) {
      throw new HttpClientError(
        extractMessage(payload, 'Request failed.'),
        response.status,
        payload,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof HttpClientError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw new Error('Network request failed. Please check your connection.');
  } finally {
    clearTimeout(timeoutId);
  }
};

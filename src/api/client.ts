import {
  clearSession,
  getStoredRefreshToken,
  getStoredToken,
  persistAccessToken,
} from "@/lib/storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

type RequestOptions = RequestInit & {
  token?: string | null;
};

type AuthHandlers = {
  onTokenRefreshed?: (accessToken: string) => void;
  onSessionExpired?: () => void;
};

let authHandlers: AuthHandlers = {};
let refreshInFlight: Promise<string | null> | null = null;

export function setAuthHandlers(handlers: AuthHandlers) {
  authHandlers = handlers;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
      exp?: number;
    };
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

function isTokenExpiredError(error: ApiError): boolean {
  return error.status === 401 && error.message === "Token expired";
}

async function handleSessionExpired() {
  await clearSession();
  authHandlers.onSessionExpired?.();
}

async function requestNewAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { access_token: string };
      await persistAccessToken(data.access_token);
      authHandlers.onTokenRefreshed?.(data.access_token);
      return data.access_token;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function refreshSessionIfNeeded(): Promise<string | null> {
  const token = await getStoredToken();
  const refreshToken = await getStoredRefreshToken();

  if (!token || !isTokenExpired(token)) {
    return token;
  }

  if (!refreshToken) {
    await handleSessionExpired();
    return null;
  }

  const newToken = await requestNewAccessToken();
  if (!newToken) {
    await handleSessionExpired();
    return null;
  }

  return newToken;
}

async function executeRequest<T>(
  path: string,
  options: RequestOptions,
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      detail = undefined;
    }
    const message =
      typeof detail === "object" &&
      detail !== null &&
      "detail" in detail &&
      typeof (detail as { detail: unknown }).detail === "string"
        ? (detail as { detail: string }).detail
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token } = options;

  try {
    return await executeRequest<T>(path, options);
  } catch (error) {
    const shouldRefresh =
      error instanceof ApiError &&
      isTokenExpiredError(error) &&
      token &&
      path !== "/auth/refresh";

    if (!shouldRefresh) {
      throw error;
    }

    const newToken = await requestNewAccessToken();
    if (!newToken) {
      await handleSessionExpired();
      throw error;
    }

    return executeRequest<T>(path, { ...options, token: newToken });
  }
}

export { API_BASE_URL };

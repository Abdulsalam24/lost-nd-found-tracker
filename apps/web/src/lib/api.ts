import Cookies from "js-cookie";

/** Browser + public env (inlined at build time for client bundles). */
const CLIENT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

/**
 * Server-side fetches must hit the Nest API, not the Next dev server.
 * Prefer API_URL (server-only); avoid defaulting to :3001 when Next runs on 3001.
 */
const SERVER_API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3002";

let memoryToken: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export function setToken(token: string | null) {
  memoryToken = token;
  if (token) {
    Cookies.set("access_token", token, { expires: 7, path: "/" });
  } else {
    Cookies.remove("access_token", { path: "/" });
  }
}

export function getToken(): string | undefined {
  if (memoryToken) return memoryToken;
  if (typeof window !== "undefined") return Cookies.get("access_token");
  return undefined;
}

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = fetch(`${CLIENT_API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data = await res.json();
      if (data.access_token) {
        setToken(data.access_token);
        return true;
      }
      return false;
    })
    .catch(() => false)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  _retried?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, _retried, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((customHeaders as Record<string, string>) ?? {}),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${CLIENT_API_BASE}${endpoint}`, {
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (res.status === 401 && !_retried && getToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return request<T>(endpoint, { ...options, _retried: true });
    }
    setToken(null);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(endpoint: string, init?: RequestInit) => request<T>(endpoint, { method: "GET", ...init }),
  post: <T>(endpoint: string, body?: unknown, init?: RequestInit) => request<T>(endpoint, { method: "POST", body, ...init }),
  patch: <T>(endpoint: string, body?: unknown, init?: RequestInit) => request<T>(endpoint, { method: "PATCH", body, ...init }),
  put: <T>(endpoint: string, body?: unknown, init?: RequestInit) => request<T>(endpoint, { method: "PUT", body, ...init }),
  delete: <T>(endpoint: string, init?: RequestInit) => request<T>(endpoint, { method: "DELETE", ...init }),

  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${CLIENT_API_BASE}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });

    if (res.status === 401 && getToken()) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const retryHeaders: Record<string, string> = {};
        const newToken = getToken();
        if (newToken) retryHeaders["Authorization"] = `Bearer ${newToken}`;

        const retryRes = await fetch(`${CLIENT_API_BASE}${endpoint}`, {
          method: "POST",
          headers: retryHeaders,
          credentials: "include",
          body: formData,
        });

        if (!retryRes.ok) {
          const error = await retryRes.json().catch(() => ({ message: "Upload failed" }));
          throw new Error(error.message ?? `HTTP ${retryRes.status}`);
        }
        return retryRes.json();
      }
      setToken(null);
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message ?? `HTTP ${res.status}`);
    }

    return res.json();
  },
};

export function serverFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  return fetch(`${SERVER_API_BASE}${endpoint}`, {
    cache: "no-store",
    signal: controller.signal,
    ...options,
  }).then((res) => {
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }).catch((err) => {
    clearTimeout(timeout);
    throw err;
  });
}

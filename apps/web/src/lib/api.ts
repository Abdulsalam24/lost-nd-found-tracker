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

export function setToken(token: string | null) {
  memoryToken = token;
  if (token) {
    Cookies.set("access_token", token, { expires: 7 });
  } else {
    Cookies.remove("access_token");
  }
}

export function getToken(): string | undefined {
  if (memoryToken) return memoryToken;
  if (typeof window !== "undefined") return Cookies.get("access_token");
  return undefined;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

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

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message ?? `HTTP ${res.status}`);
    }

    return res.json();
  },
};

export function serverFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return fetch(`${SERVER_API_BASE}${endpoint}`, {
    cache: "no-store",
    ...options,
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

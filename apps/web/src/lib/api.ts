import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("token", token);
    document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  } else {
    localStorage.removeItem("token");
    document.cookie = "access_token=; path=/; max-age=0";
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

const apiInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

apiInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiInstance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "access_token=; path=/; max-age=0";
    }
    const apiMessage = err?.response?.data?.message;
    if (apiMessage) {
      return Promise.reject(new Error(Array.isArray(apiMessage) ? apiMessage[0] : apiMessage));
    }
    return Promise.reject(err);
  },
);

export const api = apiInstance as unknown as {
  get<T>(url: string, config?: object): Promise<T>;
  post<T>(url: string, data?: unknown, config?: object): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: object): Promise<T>;
  put<T>(url: string, data?: unknown, config?: object): Promise<T>;
  delete<T>(url: string, config?: object): Promise<T>;
};

export async function serverFetch<T>(path: string): Promise<T> {
  const res = await axios.get<T>(`${API_BASE}${path}`);
  return res.data;
}

"use client";

import { createContext, useContext } from "react";
import { api, setToken, getToken } from "./api";

export interface User {
  id: string;
  email: string;
  name: string;
  faculty: string;
  role: "user" | "admin";
  points: number;
  badges: Array<{ badge_type: string; awarded_at: string }>;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; name: string; faculty: string; phone?: string }) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({} as any),
  register: async () => {},
  verifyOtp: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export async function loginRequest(email: string, password: string): Promise<User> {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  setToken(res.access_token);
  return res.user;
}

export async function registerRequest(data: {
  email: string;
  password: string;
  name: string;
  faculty: string;
  phone?: string;
}): Promise<{ message: string; email: string }> {
  return api.post<{ message: string; email: string }>("/auth/register", data);
}

export async function verifyOtpRequest(email: string, otp: string): Promise<User> {
  const res = await api.post<AuthResponse>("/auth/verify-otp", { email, otp });
  setToken(res.access_token);
  return res.user;
}

export async function resendOtpRequest(email: string): Promise<{ message: string }> {
  return api.post<{ message: string }>("/auth/resend-otp", { email });
}

export async function fetchMe(): Promise<User> {
  return api.get<User>("/users/me");
}

export async function logoutRequest() {
  setToken(null);
  try {
    await api.post("/auth/logout");
  } catch {
    // cookie already cleared, ignore API errors
  }
}

export function hasToken(): boolean {
  return !!getToken();
}

"use client";

import { createContext, useContext } from "react";
import Cookies from "js-cookie";
import { api } from "./api";

export interface User {
  id: string;
  email: string;
  name: string;
  faculty: string;
  role: "user" | "admin";
  points: number;
  badges: Array<{ type: string; name: string; description: string; earned_at: string }>;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; faculty: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export async function loginRequest(email: string, password: string) {
  const res = await api.post<{ access_token: string; user: User }>("/auth/login", {
    email,
    password,
  });
  Cookies.set("access_token", res.access_token, { expires: 7 });
  return res;
}

export async function registerRequest(data: {
  email: string;
  password: string;
  name: string;
  faculty: string;
}) {
  return api.post<{ message: string }>("/auth/register", data);
}

export async function fetchMe() {
  return api.get<User>("/auth/me");
}

export function logoutRequest() {
  Cookies.remove("access_token");
}

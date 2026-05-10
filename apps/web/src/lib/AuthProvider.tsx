"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AuthContext, type User, loginRequest, registerRequest, fetchMe, logoutRequest } from "./auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; name: string; faculty: string }) => {
    await registerRequest(data);
  };

  const logout = () => {
    logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

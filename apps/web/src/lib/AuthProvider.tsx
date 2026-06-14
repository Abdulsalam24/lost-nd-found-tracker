"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AuthContext, type User, loginRequest, registerRequest, verifyOtpRequest, fetchMe, logoutRequest, hasToken } from "./auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!hasToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
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
    const me = await loginRequest(email, password);
    setUser(me);
  };

  const register = async (data: { email: string; password: string; name: string; faculty: string }) => {
    await registerRequest(data);
  };

  const verifyOtp = async (email: string, otp: string) => {
    const me = await verifyOtpRequest(email, otp);
    setUser(me);
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "@/lib/authService";
import { UserSession } from "@/lib/authService";

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserSession>;
  register: (name: string, email: string, pass: string) => Promise<UserSession>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = authService.getCurrentUser();
    if (session) {
      setUser(session);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const session = await authService.loginUser(email, pass);
    setUser(session);
    return session;
  };

  const register = async (name: string, email: string, pass: string) => {
    const session = await authService.registerUser(name, email, pass);
    setUser(session);
    return session;
  };

  const logout = () => {
    authService.logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

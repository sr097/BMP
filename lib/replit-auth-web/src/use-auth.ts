import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    let cancelled = false;

    fetch(`${apiUrl}/api/auth/user`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ user: AuthUser | null }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  const login = useCallback(async (username: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/auth/mock-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      throw err;
    }
  }, [apiUrl]);

  const logout = useCallback(() => {
    fetch(`${apiUrl}/api/logout`, {
      method: "POST",
      credentials: "include",
    }).then(() => {
      setUser(null);
    });
  }, [apiUrl]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}

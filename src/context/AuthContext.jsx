import React, { createContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
} from "../services";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    setUser(data.username);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  useEffect(() => {
    const handleAuthLogout = () => {
      logout();
    };
    window.addEventListener("auth-logout", handleAuthLogout);

    let timer;
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp) {
        const remainingTimeMs = decoded.exp * 1000 - Date.now();
        if (remainingTimeMs <= 0) {
          logout();
        } else {
          timer = setTimeout(() => {
            logout();
          }, remainingTimeMs);
        }
      }
    }

    return () => {
      window.removeEventListener("auth-logout", handleAuthLogout);
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

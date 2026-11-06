import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getMe as apiGetMe,
  getToken,
  getStoredAuth,
  clearAuthStorage,
} from "../services";

export const WorkerAuthContext = createContext(null);

export function WorkerAuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuth()?.user || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));
 
  const [isReady, setIsReady] = useState(() => !getToken());

  
  const hasVerifiedOnRefreshRef = useRef(false);

 
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsReady(true);
      return;
    }

    if (hasVerifiedOnRefreshRef.current) return;
    hasVerifiedOnRefreshRef.current = true;

    const verifyOnRefresh = async () => {
      try {
        const res = await apiGetMe();
        const fetchedUser = res?.user || res;
        if (fetchedUser) {
          setUser(fetchedUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn("Worker auth verification failed on refresh:", err);
        if (err?.status === 401 || err?.response?.status === 401) {
          clearAuthStorage();
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setIsReady(true);
      }
    };

    verifyOnRefresh();
  }, []);

  
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setIsAuthenticated(false);
      setIsReady(true);
      hasVerifiedOnRefreshRef.current = false;
    };

    window.addEventListener("worker-dashboard-logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("worker-dashboard-logout", handleLogoutEvent);
    };
  }, []);

  
  const login = async ({ email, password }) => {
    const data = await apiLogin({ email, password });
    const userData = data?.user || (data?.email ? data : null);

    
    hasVerifiedOnRefreshRef.current = true;

    setUser(userData);
    setIsAuthenticated(true);
    setIsReady(true);
    return data;
  };

 
  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
    setIsReady(true);
    hasVerifiedOnRefreshRef.current = false;
  };

  
  const refreshUser = async () => {
    try {
      const res = await apiGetMe();
      const fetchedUser = res?.user || res;
      if (fetchedUser) {
        setUser(fetchedUser);
      }
      return fetchedUser;
    } catch (err) {
      console.warn("Could not refresh worker user profile:", err);
      throw err;
    }
  };

  const isAdmin = (() => {
    const role = (user?.role || "").toLowerCase();
    return role === "admin";
  })();

  const value = {
    user,
    setUser,
    isAuthenticated,
    isReady,
    isAdmin,
    login,
    logout,
    refreshUser,
  };

  return (
    <WorkerAuthContext.Provider value={value}>
      {children}
    </WorkerAuthContext.Provider>
  );
}

export function useWorkerAuth() {
  const context = useContext(WorkerAuthContext);
  if (!context) {
    throw new Error("useWorkerAuth must be used within a WorkerAuthProvider");
  }
  return context;
}

export default WorkerAuthContext;


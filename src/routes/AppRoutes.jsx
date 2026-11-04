import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import {
  LoginPage,
  MonthlyInvoicePage,
  Dashboard,
  FinanzCockpitPage,
  WorkerDashboardPage,
} from "../pages";
import { ProtectedRoute } from "./ProtectedRoute";
import { isAuthenticated as isFinanzAuthenticated } from "../pages/FinanzCockpitPage/services";
import { isAuthenticated as isWorkerAuthenticated } from "../pages/WorkerDashboardPage/services";

export default function AppRoutes() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isFinanzAuth, setIsFinanzAuth] = useState(() => isFinanzAuthenticated());
  const [isWorkerAuth, setIsWorkerAuth] = useState(() => isWorkerAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsFinanzAuth(isFinanzAuthenticated());
    };

    window.addEventListener("finanz-cockpit-login", handleAuthChange);
    window.addEventListener("finanz-cockpit-logout", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("finanz-cockpit-login", handleAuthChange);
      window.removeEventListener("finanz-cockpit-logout", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const handleWorkerAuthChange = () => {
      setIsWorkerAuth(isWorkerAuthenticated());
    };

    window.addEventListener("worker-dashboard-login", handleWorkerAuthChange);
    window.addEventListener("worker-dashboard-logout", handleWorkerAuthChange);
    window.addEventListener("storage", handleWorkerAuthChange);

    return () => {
      window.removeEventListener("worker-dashboard-login", handleWorkerAuthChange);
      window.removeEventListener("worker-dashboard-logout", handleWorkerAuthChange);
      window.removeEventListener("storage", handleWorkerAuthChange);
    };
  }, []);

  
  if (isFinanzAuth) {
    return (
      <Routes>
        <Route path="/finanz-cockpit" element={<FinanzCockpitPage />} />
        <Route path="*" element={<Navigate to="/finanz-cockpit" replace />} />
      </Routes>
    );
  }

  
  if (isWorkerAuth) {
    return (
      <Routes>
        <Route path="/worker-dashboard" element={<WorkerDashboardPage />} />
        <Route path="*" element={<Navigate to="/worker-dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage
              onLogin={login}
              onOpenMonthlyInvoice={() => navigate("/monthly-invoice", { replace: true })}
              onOpenFinanzCockpit={() => navigate("/finanz-cockpit", { replace: true })}
              onOpenWorkerDashboard={() => navigate("/worker-dashboard", { replace: true })}
            />
          )
        }
      />
      <Route
        path="/monthly-invoice"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <MonthlyInvoicePage
              onOpenLogin={() => navigate("/login", { replace: true })}
              onOpenFinanzCockpit={() => navigate("/finanz-cockpit", { replace: true })}
              onOpenWorkerDashboard={() => navigate("/worker-dashboard", { replace: true })}
            />
          )
        }
      />
      <Route
        path="/finanz-cockpit"
        element={<FinanzCockpitPage />}
      />
      <Route
        path="/worker-dashboard"
        element={<WorkerDashboardPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard username={user} onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}


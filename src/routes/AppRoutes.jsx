import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { LoginPage, MonthlyInvoicePage, Dashboard, FinanzCockpitPage } from "../pages";
import { ProtectedRoute } from "./ProtectedRoute";
import { isAuthenticated as isFinanzAuthenticated } from "../pages/FinanzCockpitPage/services";

export default function AppRoutes() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isFinanzAuth, setIsFinanzAuth] = useState(() => isFinanzAuthenticated());

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

  // When user is authenticated in Finanz Cockpit, restrict all routes strictly to /finanz-cockpit
  if (isFinanzAuth) {
    return (
      <Routes>
        <Route path="/finanz-cockpit" element={<FinanzCockpitPage />} />
        <Route path="*" element={<Navigate to="/finanz-cockpit" replace />} />
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
            />
          )
        }
      />
      <Route
        path="/finanz-cockpit"
        element={<FinanzCockpitPage />}
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


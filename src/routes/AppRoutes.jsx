import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { LoginPage, MonthlyInvoicePage, Dashboard, FinanzCockpitPage } from "../pages";
import { ProtectedRoute } from "./ProtectedRoute";

export default function AppRoutes() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

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
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <FinanzCockpitPage />
          )
        }
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

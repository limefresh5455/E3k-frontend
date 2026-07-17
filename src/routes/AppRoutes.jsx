import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { LoginPage, MonthlyInvoicePage, Dashboard } from "../pages";
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
              onOpenMonthlyInvoice={() => navigate("/monthly-invoice")}
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
            <MonthlyInvoicePage onOpenLogin={() => navigate("/login")} />
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

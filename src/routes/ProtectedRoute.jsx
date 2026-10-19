import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { isAuthenticated as isFinanzAuthenticated } from "../pages/FinanzCockpitPage/services";

export function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // If user is authenticated in Finanz-Cockpit, prevent access to E3k dashboard
  if (isFinanzAuthenticated()) {
    return <Navigate to="/finanz-cockpit" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicTabs, Icon } from "../../components";
import WorkerDashboard from "./dashboard/WorkerDashboard";
import { WorkerAuthProvider, useWorkerAuth } from "./context/WorkerAuthContext";
import "../LoginPage/LoginPage.css";
import "./WorkerDashboardAuth.css";

function WorkerDashboardContent() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isReady, login, logout } = useWorkerAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({
        email: form.email,
        password: form.password,
      });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  
  if (!isReady) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#f4f8fb",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid #dfe8f1",
            borderTopColor: "#038c99",
            borderRadius: "50%",
            animation: "viewSpin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <WorkerDashboard onLogout={logout} />;
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        <PublicTabs
          active="worker-dashboard"
          onSelect={(tab) => {
            if (tab === "login") navigate("/login", { replace: true });
            if (tab === "monthly-invoice") navigate("/monthly-invoice", { replace: true });
            if (tab === "finanz-cockpit") navigate("/finanz-cockpit", { replace: true });
          }}
        />

        <div className="login-header">
          <div className="login-logo-wrapper">
            <div className="login-logo-icon">
              <Icon.Layers />
            </div>
          </div>
          <h1 className="login-title">Worker Dashboard</h1>
          <p className="login-subtitle">Sign in to your worker workspace</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="login-form">
          <div>
            <label className="login-form-label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              required
              className="login-input"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <label className="login-form-label">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              required
              className="login-input"
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error-msg">{error}</div>}

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WorkerDashboardPage() {
  return (
    <WorkerAuthProvider>
      <WorkerDashboardContent />
    </WorkerAuthProvider>
  );
}

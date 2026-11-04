import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PublicTabs, Icon } from "../../components";
import WorkerDashboard from "./dashboard/WorkerDashboard";
import {
  login as apiLogin,
  logout as apiLogout,
  isAuthenticated as checkIsAuthenticated,
  getStoredAuth,
} from "./services";
import "../LoginPage/LoginPage.css";
import "./WorkerDashboardAuth.css";

export default function WorkerDashboardPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkIsAuthenticated());
  const [user, setUser] = useState(() => getStoredAuth()?.user || null);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setIsAuthenticated(false);
      setUser(null);
    };
    window.addEventListener("worker-dashboard-logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("worker-dashboard-logout", handleLogoutEvent);
    };
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiLogin({
        email: form.email,
        password: form.password,
      });
      setUser(res?.user || null);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setForm({ email: "", password: "" });
    setError("");
  };

  if (isAuthenticated) {
    return <WorkerDashboard user={user} onLogout={handleLogout} />;
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


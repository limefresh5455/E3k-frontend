import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicTabs, Icon } from "../../components";
import FinanzCockpit from "./cockpit/FinanzCockpit";
import "../LoginPage/LoginPage.css";


const STORAGE_KEY = "finanz_cockpit_auth";

export default function FinanzCockpitPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;
      const data = JSON.parse(stored);
      return Boolean(data && data.authenticated);
    } catch {
      return false;
    }
  });

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (form.username.trim() === "admin" && form.password === "admin@123") {
        const authData = {
          username: "admin",
          authenticated: true,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
        setIsAuthenticated(true);
      } else {
        setError("Invalid username or password.");
      }
      setLoading(false);
    }, 200);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Storage access failed", err);
    }
    setIsAuthenticated(false);
    setForm({ username: "", password: "" });
    setError("");
  };

  if (isAuthenticated) {
    return (
      <div className="finanz-cockpit-wrapper">
        <FinanzCockpit onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        <PublicTabs
          active="finanz-cockpit"
          onSelect={(tab) => {
            if (tab === "login") navigate("/login", { replace: true });
            if (tab === "monthly-invoice") navigate("/monthly-invoice", { replace: true });
          }}
        />

        <div className="login-header">
          <div className="login-logo-wrapper">
            <div className="login-logo-icon">
              <Icon.Layers />
            </div>
          </div>
          <h1 className="login-title">Finanz-Cockpit</h1>
          <p className="login-subtitle">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {[
            ["username", "text", "admin"],
            ["password", "password", "••••••••"],
          ].map(([field, type, placeholder]) => (
            <div key={field}>
              <label className="login-form-label">{field}</label>
              <input
                type={type}
                value={form[field]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                placeholder={placeholder}
                required
                className="login-input"
              />
            </div>
          ))}

          {error && <div className="login-error-msg">{error}</div>}

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

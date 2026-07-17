import React, { useState } from "react";
import { PublicTabs, Icon } from "../../components";
import "./LoginPage.css";

export function LoginPage({ onLogin, onOpenMonthlyInvoice }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(form.username, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <PublicTabs
          active="login"
          onSelect={(tab) => {
            if (tab === "monthly-invoice") onOpenMonthlyInvoice();
          }}
        />

        <div className="login-header">
          <div className="login-logo-wrapper">
            <div className="login-logo-icon">
              <Icon.Layers />
            </div>
          </div>
          <h1 className="login-title">E3k</h1>
          <p className="login-subtitle">Sign in to your workspace</p>
        </div>

        <form onSubmit={submit} className="login-form">
          {[
            ["username", "text", "admin"],
            ["password", "password", "••••••••"],
          ].map(([field, type, placeholder]) => (
            <div key={field}>
              <label className="login-form-label">{field}</label>
              <input
                type={type}
                value={form[field]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field]: e.target.value }))
                }
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

export default LoginPage;

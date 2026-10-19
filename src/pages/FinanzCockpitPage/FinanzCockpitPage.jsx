import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PublicTabs, Icon } from "../../components";
import FinanzCockpit from "./cockpit/FinanzCockpit";
import {
  login as apiLogin,
  logout as apiLogout,
  isAuthenticated as checkIsAuthenticated,
  forgotPassword as apiForgotPassword,
  verifyOtp as apiVerifyOtp,
  resetPassword as apiResetPassword,
} from "./services";
import "../LoginPage/LoginPage.css";
import "./FinanzCockpitAuth.css";

export default function FinanzCockpitPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkIsAuthenticated());

  const [authView, setAuthView] = useState("login");

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  useEffect(() => {
    const handleLogoutEvent = () => {
      setIsAuthenticated(false);
    };
    window.addEventListener("finanz-cockpit-logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("finanz-cockpit-logout", handleLogoutEvent);
    };
  }, []);

  // --- Handlers: Login & Logout ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await apiLogin({
        email: form.email,
        password: form.password,
      });
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setForm({ email: "", password: "" });
    setError("");
    setSuccessMsg("");
  };


  const openForgotPassword = () => {
    setAuthView("forgot");
    setForgotStep(1);
    setForgotEmail(form.email || "");
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
    setForgotError("");
    setForgotSuccess("");
  };

  const backToLogin = () => {
    setAuthView("login");
    setForgotError("");
    setForgotSuccess("");
  };


  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);

    try {
      await apiForgotPassword(forgotEmail);
      setForgotSuccess(`Verification OTP has been sent to ${forgotEmail}`);
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || "Failed to send reset OTP. Please check your email.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);

    try {
      const res = await apiVerifyOtp({
        email: forgotEmail,
        otp: forgotOtp,
      });

      const token =
        res?.reset_token ||
        res?.data?.reset_token ||
        res?.token ||
        "";

      if (!token) {
        throw new Error("Reset token not received. Please try again.");
      }

      setResetToken(token);
      setForgotSuccess("OTP verified successfully! Please enter your new password.");
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);

    try {
      await apiForgotPassword(forgotEmail);
      setForgotSuccess(`A new OTP has been resent to ${forgotEmail}`);
    } catch (err) {
      setForgotError(err.message || "Failed to resend OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);

    try {
      await apiResetPassword({
        reset_token: resetToken,
        new_password: newPassword,
      });

      // Navigate back to login view with success notification
      setAuthView("login");
      setForm({ email: forgotEmail, password: "" });
      setSuccessMsg("Password reset successfully! Please sign in with your new password.");
      setError("");
    } catch (err) {
      setForgotError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setForgotLoading(false);
    }
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

        {/* Header */}
        <div className="login-header">
          <div className="login-logo-wrapper">
            <div className="login-logo-icon">
              <Icon.Layers />
            </div>
          </div>
          <h1 className="login-title">Finanz-Cockpit</h1>
          <p className="login-subtitle">
            {authView === "login"
              ? "Sign in to your workspace"
              : forgotStep === 1
              ? "Reset your password"
              : forgotStep === 2
              ? "Enter verification code"
              : "Create a new password"}
          </p>
        </div>

        {/* VIEW 1: SIGN IN FORM */}
        {authView === "login" && (
          <form onSubmit={handleLoginSubmit} className="login-form">
            {successMsg && (
              <div className="login-success-msg">
                <Icon.CheckCircle />
                <span>{successMsg}</span>
              </div>
            )}

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
              />
            </div>

            <div>
              <div className="login-form-row-between">
                <label className="login-form-label">Password</label>
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="login-forgot-link"
                >
                  Forgot password?
                </button>
              </div>
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
        )}

        {/* VIEW 2: FORGOT PASSWORD FLOW */}
        {authView === "forgot" && (
          <div>
            {/* Step Indicators */}
            <div className="forgot-steps-tracker">
              <div
                className={`forgot-step-pill ${
                  forgotStep === 1 ? "active" : forgotStep > 1 ? "completed" : ""
                }`}
              >
                <span className="forgot-step-num">1</span>
                <span>Email</span>
              </div>
              <div
                className={`forgot-step-pill ${
                  forgotStep === 2 ? "active" : forgotStep > 2 ? "completed" : ""
                }`}
              >
                <span className="forgot-step-num">2</span>
                <span>OTP</span>
              </div>
              <div className={`forgot-step-pill ${forgotStep === 3 ? "active" : ""}`}>
                <span className="forgot-step-num">3</span>
                <span>Reset</span>
              </div>
            </div>

            {forgotSuccess && (
              <div className="login-success-msg">
                <Icon.CheckCircle />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && <div className="login-error-msg" style={{ marginBottom: "1rem" }}>{forgotError}</div>}

            {/* STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="login-form">
                <div>
                  <label className="login-form-label">Registered Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="login-input"
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={forgotLoading} className="login-submit-btn">
                  {forgotLoading ? "Sending OTP…" : "Send Verification OTP"}
                </button>

                <button
                  type="button"
                  onClick={backToLogin}
                  disabled={forgotLoading}
                  className="auth-secondary-btn"
                >
                  Back to Sign In
                </button>
              </form>
            )}

            {/* STEP 2: Verify OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="login-form">
                <div>
                  <label className="login-form-label">6-Digit Verification OTP</label>
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="392534"
                    maxLength={10}
                    required
                    className="login-input otp-input"
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={forgotLoading} className="login-submit-btn">
                  {forgotLoading ? "Verifying OTP…" : "Verify OTP"}
                </button>

                <div className="auth-resend-row">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={forgotLoading}
                    className="auth-resend-link"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="button"
                  onClick={backToLogin}
                  disabled={forgotLoading}
                  className="auth-secondary-btn"
                >
                  Back to Sign In
                </button>
              </form>
            )}

            {/* STEP 3: Reset Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="login-form">
                <div>
                  <label className="login-form-label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="login-input"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="login-form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="login-input"
                  />
                </div>

                <button type="submit" disabled={forgotLoading} className="login-submit-btn">
                  {forgotLoading ? "Resetting Password…" : "Reset Password"}
                </button>

                <button
                  type="button"
                  onClick={backToLogin}
                  disabled={forgotLoading}
                  className="auth-secondary-btn"
                >
                  Back to Sign In
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

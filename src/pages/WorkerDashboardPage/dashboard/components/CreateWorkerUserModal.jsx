import React, { useState, useEffect, useRef } from "react";
import { createWorkerUser } from "../../services";
import "./CreateWorkerUserModal.css";

const ALL_PERMISSIONS = ["worker.read", "finance.read"];
const COMPANY_SCOPES = ["tebo", "ssb"];

function CompanyScopeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const ref = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
    setOpen((v) => !v);
  };

  const handleSelect = (scope) => {
    onChange(scope);
    setOpen(false);
  };

  return (
    <div className="perm-dropdown" ref={ref}>
      <button
        type="button"
        ref={triggerRef}
        className={`perm-dropdown-trigger ${open ? "open" : ""}`}
        onClick={handleOpen}
      >
        <span className="perm-dropdown-single-value">{value}</span>
        <svg
          className={`perm-dropdown-chevron ${open ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="perm-dropdown-menu" style={menuStyle}>
          {COMPANY_SCOPES.map((scope) => {
            const isSelected = value === scope;
            return (
              <div
                key={scope}
                className={`perm-dropdown-option ${isSelected ? "checked" : ""}`}
                onClick={() => handleSelect(scope)}
              >
                <span className="perm-option-label">{scope}</span>
                {isSelected && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PermissionDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const ref = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
    setOpen((v) => !v);
  };

  const toggle = (perm) => {
    onChange(
      selected.includes(perm)
        ? selected.filter((p) => p !== perm)
        : [...selected, perm]
    );
  };

  return (
    <div className="perm-dropdown" ref={ref}>
      <button
        type="button"
        ref={triggerRef}
        className={`perm-dropdown-trigger ${open ? "open" : ""}`}
        onClick={handleOpen}
      >
        <span className="perm-dropdown-value">
          {selected.length === 0
            ? "Select permissions…"
            : selected.map((p) => (
                <span key={p} className="perm-tag">{p}</span>
              ))}
        </span>
        <svg
          className={`perm-dropdown-chevron ${open ? "open" : ""}`}
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="perm-dropdown-menu" style={menuStyle}>
          {ALL_PERMISSIONS.map((perm) => {
            const checked = selected.includes(perm);
            return (
              <label key={perm} className={`perm-dropdown-option ${checked ? "checked" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(perm)}
                  className="perm-option-checkbox"
                />
                <span className="perm-option-label">{perm}</span>
                {checked && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CreateWorkerUserModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [companyScope, setCompanyScope] = useState("tebo");
  const [selectedPerms, setSelectedPerms] = useState(["worker.read"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please provide an email address.");
      return;
    }

    if (!displayName.trim()) {
      setError("Please provide a display name.");
      return;
    }

    if (!password) {
      setError("Please provide a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (selectedPerms.length === 0) {
      setError("Please select at least one permission.");
      return;
    }

    setLoading(true);

    try {
      const data = await createWorkerUser({
        email: email.trim(),
        display_name: displayName.trim(),
        password,
        entitlements: selectedPerms.map((permission) => ({
          permission,
          company_scope: companyScope,
        })),
      });

      setSuccess(`Worker user "${displayName.trim()}" created successfully!`);
      setEmail("");
      setDisplayName("");
      setPassword("");
      setCompanyScope("tebo");
      setSelectedPerms(["worker.read"]);

      onSuccess?.(data);

      setTimeout(() => {
        onClose?.();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to create worker user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="cwu-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose?.();
        }
      }}
    >
      <div className="cwu-modal-dialog" role="dialog" aria-modal="true">
        <div className="cwu-modal-header">
          <div>
            <h2 className="cwu-modal-title">Create User</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cwu-modal-close-btn"
            title="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cwu-modal-body">
          {error && <div className="cwu-error-msg">{error}</div>}
          {success && <div className="cwu-success-msg">{success}</div>}

          <form onSubmit={handleSubmit} className="cwu-form">
            <div className="cwu-field">
              <label className="cwu-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="cwu-input"
                autoFocus
              />
            </div>

            <div className="cwu-field">
              <label className="cwu-label">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                required
                className="cwu-input"
              />
            </div>

            <div className="cwu-field">
              <label className="cwu-label">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="cwu-input"
              />
            </div>

            <div className="cwu-field">
              <label className="cwu-label">Company Scope</label>
              <CompanyScopeDropdown
                value={companyScope}
                onChange={setCompanyScope}
              />
            </div>

            <div className="cwu-field">
              <label className="cwu-label">Assigned Permissions</label>
              <PermissionDropdown
                selected={selectedPerms}
                onChange={setSelectedPerms}
              />
            </div>

            <div className="cwu-modal-footer">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="cwu-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="cwu-submit-btn"
              >
                {loading ? "Creating…" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


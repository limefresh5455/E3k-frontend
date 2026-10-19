import { useState, useRef, useEffect } from "react";
import { COMPANIES } from "../constants";
import { logout as apiLogout, logoutAll as apiLogoutAll } from "../../services";
import CreateUserModal from "./CreateUserModal";

export default function CockpitHeader({ selected, onSelect, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogoutCurrent = async () => {
    setLoggingOut("current");
    try {
      await apiLogout();
    } finally {
      setLoggingOut(null);
      setIsDropdownOpen(false);
      onLogout?.();
    }
  };

  const handleLogoutAll = async () => {
    setLoggingOut("all");
    try {
      await apiLogoutAll();
    } finally {
      setLoggingOut(null);
      setIsDropdownOpen(false);
      onLogout?.();
    }
  };

  return (
    <header>
      <div>
        <div className="eyebrow">MANAGEMENT ANALYTICS</div>
        <h1>Finanz-Cockpit</h1>
        <p>Quartalsübersicht oben · Monats- und Kontendetails unten</p>
      </div>

      <div className="header-actions">
        <nav className="switch" aria-label="Unternehmen auswählen">
          {COMPANIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={selected === c.key ? "active" : undefined}
              onClick={() => onSelect(c.key)}
            >
              {c.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsCreateUserOpen(true)}
          className="fc-new-user-btn"
          title="Create new user"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          <span>New User</span>
        </button>

        
        {onLogout && (
          <div className="fc-signout-dropdown-wrapper" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`fc-signout-btn ${isDropdownOpen ? "active" : ""}`}
              title="Sign out options"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign out</span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`fc-chevron ${isDropdownOpen ? "open" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="fc-signout-menu">
                <button
                  type="button"
                  onClick={handleLogoutCurrent}
                  disabled={Boolean(loggingOut)}
                  className="fc-signout-item"
                >
                  <div className="fc-item-text">
                    <span className="fc-item-title">
                      {loggingOut === "current" ? "Signing out…" : "Sign out"}
                    </span>
                    <span className="fc-item-desc">Current session only</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutAll}
                  disabled={Boolean(loggingOut)}
                  className="fc-signout-item danger"
                >
                  <div className="fc-item-text">
                    <span className="fc-item-title">
                      {loggingOut === "all" ? "Signing out all…" : "Sign out from all sessions"}
                    </span>
                    <span className="fc-item-desc">End all active sessions</span>
                  </div>
                </button>
              </div>
            )}
          </div>

        )}

        {/* Modal for creating a new user */}
        {isCreateUserOpen && (
          <CreateUserModal onClose={() => setIsCreateUserOpen(false)} />
        )}
      </div>
    </header>
  );
}


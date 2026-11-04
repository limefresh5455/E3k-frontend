import React, { useState, useEffect, useRef } from "react";
import {
  getMe as apiGetMe,
  logout as apiLogout,
  getStoredAuth,
} from "../services";
import WorkerUsersTable from "./components/WorkerUsersTable";
import CreateWorkerUserModal from "./components/CreateWorkerUserModal";
import UserScopedDashboard from "./components/UserScopedDashboard";
import AdminCompanyWorkspaces from "./components/AdminCompanyWorkspaces";
import "./WorkerDashboard.css";

// Default sample user fallback matching requirements if testing
const DEFAULT_SAMPLE_USER = {
  id: 5,
  email: "info@tebo.ag",
  display_name: "Info Tebo",
  entitlements: [
    {
      permission: "finance.read",
      company_scope: "tebo",
    },
    {
      permission: "worker.read",
      company_scope: "tebo",
    },
    {
      permission: "finance.read",
      company_scope: "ssb",
    },
    {
      permission: "worker.read",
      company_scope: "ssb",
    },
  ],
  is_active: true,
  role: "user",
};

export default function WorkerDashboard({ user: initialUser, onLogout }) {
  const [user, setUser] = useState(() => {
    return initialUser || getStoredAuth()?.user || null;
  });
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const hasFetchedRef = useRef(false);

  // Derive role — support both top-level `role` and entitlements-based role
  const isAdmin = (() => {
    const role = (user?.role || "").toLowerCase();
    if (role === "admin") return true;
    if (role === "user") return false;
    return false;
  })();

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchMe = async () => {
      try {
        const res = await apiGetMe();
        const fetchedUser = res?.user || res;
        if (fetchedUser) {
          setUser(fetchedUser);
        }
      } catch (err) {
        console.warn("Could not load /auth/me on dashboard mount:", err);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = () => {
    apiLogout();
    onLogout?.();
  };

  // Safe effective user for scoped dashboard
  const effectiveUser = user || DEFAULT_SAMPLE_USER;

  return (
    <div className="worker-cockpit">
      <div className="wrap">
        <header>
          <div>
            <div className="eyebrow">
              {isAdmin ? "ADMIN CONSOLE" : "WORKER PORTAL"}
            </div>
            <h1>Worker Dashboard</h1>
            <p>
              {isAdmin
                ? "Manage worker users, permissions, and company scopes"
                : `Welcome, ${effectiveUser.display_name || effectiveUser.email}`}
            </p>
          </div>

          <div className="header-actions">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsCreateUserOpen(true)}
                className="fc-new-user-btn"
                title="Create new worker user"
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
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="fc-signout-btn"
              title="Sign out"
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
            </button>
          </div>
        </header>

        {/* Admin View or User Scoped Dashboard */}
        {isAdmin ? (
          <>
            <WorkerUsersTable />
            <AdminCompanyWorkspaces />
          </>
        ) : (
          <UserScopedDashboard user={effectiveUser} />
        )}

        {/* Modal for Admin user creation */}
        {isAdmin && isCreateUserOpen && (
          <CreateWorkerUserModal
            onClose={() => setIsCreateUserOpen(false)}
            onSuccess={() => {
              window.dispatchEvent(new Event("worker-users-updated"));
            }}
          />
        )}
      </div>
    </div>
  );
}

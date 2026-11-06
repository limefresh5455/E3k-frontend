import React, { useState } from "react";
import { useWorkerAuth } from "../context/WorkerAuthContext";
import WorkerUsersTable from "./components/WorkerUsersTable";
import CreateWorkerUserModal from "./components/CreateWorkerUserModal";
import UserScopedDashboard from "./components/UserScopedDashboard";
import AdminCompanyWorkspaces from "./components/AdminCompanyWorkspaces";
import "./WorkerDashboard.css";

export default function WorkerDashboard({ user: initialUser, onLogout }) {
  const { user: contextUser, logout: contextLogout } = useWorkerAuth();
  const user = contextUser || initialUser;
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const isAdmin = (() => {
    const role = (user?.role || "").toLowerCase();
    if (role === "admin") return true;
    if (role === "user") return false;
    return false;
  })();

  const handleLogout = () => {
    if (contextLogout) {
      contextLogout();
    }
    onLogout?.();
  };

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
                : `Welcome, ${user?.display_name || user?.email || "User"}`}
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
          <UserScopedDashboard user={user} />
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

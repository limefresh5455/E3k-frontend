import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getWorkers as apiGetWorkers, setUserActive } from "../../services";
import EditWorkerUserModal from "./EditWorkerUserModal";

const PAGE_SIZE = 5;

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function WorkerUsersTable() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [toggleError, setToggleError] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);

  const fetchWorkers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetWorkers();
      setWorkers(Array.isArray(data) ? data : data?.users || []);
    } catch (err) {
      setError(err.message || "Failed to load worker users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();

    const handleUsersUpdated = () => {
      fetchWorkers();
    };
    window.addEventListener("worker-users-updated", handleUsersUpdated);
    return () => {
      window.removeEventListener("worker-users-updated", handleUsersUpdated);
    };
  }, []);

  const handleToggleActive = useCallback(async (worker, newActive) => {
    const userId = worker.id;
    if (togglingIds.has(userId)) return;

    const targetActive = newActive !== undefined ? newActive : !worker.is_active;
    if (targetActive === worker.is_active) return; 

    setTogglingIds((prev) => new Set(prev).add(userId));
    setToggleError(null);

    
    setWorkers((prev) =>
      prev.map((w) => (w.id === userId ? { ...w, is_active: targetActive } : w))
    );

    try {
      await setUserActive(userId, targetActive);
    } catch (err) {
      
      setWorkers((prev) =>
        prev.map((w) => (w.id === userId ? { ...w, is_active: !targetActive } : w))
      );
      setToggleError(`Failed to update status for "${worker.display_name || worker.email}"`);
      setTimeout(() => setToggleError(null), 4000);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }, [togglingIds]);

  const filteredWorkers = useMemo(() => {
    if (!searchTerm.trim()) return workers;
    const q = searchTerm.toLowerCase();
    return workers.filter((w) => {
      const name = (w.display_name || "").toLowerCase();
      const email = (w.email || "").toLowerCase();
      const role = (w.role || "").toLowerCase();
      const scopeMatch = w.entitlements?.some((e) =>
        (e.company_scope || "").toLowerCase().includes(q)
      );
      const permMatch = w.entitlements?.some((e) =>
        (e.permission || "").toLowerCase().includes(q)
      );
      return name.includes(q) || email.includes(q) || role.includes(q) || scopeMatch || permMatch;
    });
  }, [workers, searchTerm]);

  // Reset to first page whenever search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredWorkers.length / PAGE_SIZE) || 1;

  // Clamp current page if list shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedWorkers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredWorkers.slice(start, start + PAGE_SIZE);
  }, [filteredWorkers, currentPage]);

  const startIndex =
    filteredWorkers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredWorkers.length);

  return (
    <div className="table-panel">
      <div className="table-header">
        <div className="table-title-wrap">
          <h2>All Users</h2>
        </div>

        <div className="table-actions">
          <span className="count-badge">
            {filteredWorkers.length}{" "}
            {filteredWorkers.length === 1 ? "User" : "Users"}
          </span>

          <div className="search-input-wrap">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            type="button"
            onClick={fetchWorkers}
            disabled={loading}
            className={`refresh-icon-btn ${loading ? "spinning" : ""}`}
            title="Reload workers"
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
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {toggleError && (
        <div className="table-error-banner" style={{ background: "#fff7ed", color: "#c2410c", borderColor: "#fed7aa" }}>
          <span>{toggleError}</span>
        </div>
      )}

      {error && (
        <div className="table-error-banner">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchWorkers}
            style={{
              background: "transparent",
              border: "none",
              color: "#dc2626",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {loading && workers.length === 0 ? (
        <div className="empty-table-state">Loading worker accounts…</div>
      ) : filteredWorkers.length === 0 ? (
        <div className="empty-table-state">
          {searchTerm
            ? "No user matching your search."
            : "No user accounts available."}
        </div>
      ) : (
        <>
          <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role</th>
                <th>Company</th>
                <th>Permissions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWorkers.map((w) => {
                const scopes = Array.from(
                  new Set(
                    w.entitlements
                      ?.map((e) => e.company_scope)
                      .filter(Boolean) || []
                  )
                );
                return (
                  <tr key={w.id}>
                    <td>
                      <div>
                        <span className="user-name">
                          {w.display_name || w.email}
                        </span>
                        <span className="user-email">{w.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="role-chip">
                        {w.role || "user"}
                      </span>
                    </td>
                    <td>
                      <div className="entitlements-list">
                        {scopes.length > 0 ? (
                          scopes.map((scope) => (
                            <span key={scope} className="perm-chip">
                              {scope}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                            —
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="entitlements-list">
                        {w.entitlements && w.entitlements.length > 0 ? (
                          w.entitlements.map((e, idx) => (
                            <span key={idx} className="perm-chip">
                              {e.permission}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                            None
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="status-select-wrap">
                        {togglingIds.has(w.id) && (
                          <span className="status-spinner select-spinner" />
                        )}
                        <select
                          className={`status-select ${
                            w.is_active !== false ? "active" : "inactive"
                          }`}
                          value={w.is_active !== false ? "active" : "inactive"}
                          disabled={togglingIds.has(w.id)}
                          onChange={(e) =>
                            handleToggleActive(w, e.target.value === "active")
                          }
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="edit-action-btn"
                        onClick={() => setEditingWorker(w)}
                        title="Edit user"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="pagination-bar">
          <div className="pagination-info">
            Showing <strong>{startIndex}</strong>–<strong>{endIndex}</strong> of{" "}
            <strong>{filteredWorkers.length}</strong> {filteredWorkers.length === 1 ? "user" : "users"}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                type="button"
                className="page-btn nav-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous page"
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
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Prev</span>
              </button>

              <div className="page-numbers">
                {getPageNumbers(currentPage, totalPages).map((pageNum, idx) =>
                  pageNum === "..." ? (
                    <span key={`dots-${idx}`} className="page-dots">
                      …
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      type="button"
                      className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="page-btn nav-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Next page"
              >
                <span>Next</span>
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
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </>
      )}

      {/* Edit Modal */}
      {editingWorker && (
        <EditWorkerUserModal
          worker={editingWorker}
          onClose={() => setEditingWorker(null)}
          onSuccess={(updated) => {
            // Update local state immediately
            setWorkers((prev) =>
              prev.map((w) =>
                w.id === editingWorker.id
                  ? {
                      ...w,
                      display_name: updated?.display_name || w.display_name,
                      entitlements: updated?.entitlements || w.entitlements,
                    }
                  : w
              )
            );
            setEditingWorker(null);
          }}
        />
      )}
    </div>
  );
}

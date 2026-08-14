import { useState, useEffect, useCallback } from "react";
import {
  Icon,
  Spinner,
  StatCard,
  OrderCard,
  SyncPanel,
  UploadPdfModal,
  OrderModal,
  SuppliersModal,
} from "../../components";
import { getOrders, getStats, syncPCloud } from "../../services";
import "./Dashboard.css";

export function Dashboard({ username, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSuppliersModal, setShowSuppliersModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const o = await getOrders();
      const s = await getStats();
      setOrders(o);
      setStats(s);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await syncPCloud();
      setSyncResult(r);
      await loadData();
    } catch (e) {
      alert("Sync failed: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const filtered = orders.filter((o) => {
    const mf = filter === "all" || o.status === filter;
    const q = search.toLowerCase();
    const ms =
      !q ||
      [o.order_number, o.supplier, o.file_name].some((v) =>
        v?.toLowerCase().includes(q),
      );
    return mf && ms;
  });

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-brand">
            <div className="dashboard-logo-bg">
              <div className="dashboard-logo-icon">
                <Icon.Layers />
              </div>
            </div>
            <span className="dashboard-brand-name">E3k</span>
          </div>

          <div className="dashboard-user-actions">
            <span className="dashboard-welcome">
              Welcome, <strong>{username}</strong>
            </span>
            <button
              onClick={() => setShowSuppliersModal(true)}
              className="dashboard-upload-btn"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              }}
            >
              <div style={{ width: "14px", height: "14px" }}>
                <Icon.Building />
              </div>
              Suppliers
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="dashboard-upload-btn"
            >
              <div style={{ width: "14px", height: "14px" }}>
                <Icon.Upload />
              </div>
              Upload PDF
            </button>

            <button
              onClick={handleSync}
              disabled={syncing}
              className={`dashboard-sync-btn ${syncing ? "dashboard-sync-btn-disabled" : "dashboard-sync-btn-active"}`}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  animation: syncing ? "spin 0.8s linear infinite" : "none",
                }}
              >
                <Icon.Refresh />
              </div>
              {syncing ? "Syncing…" : "Sync pCloud"}
            </button>

            <button onClick={onLogout} className="dashboard-logout-btn">
              <div style={{ width: "14px", height: "14px" }}>
                <Icon.Logout />
              </div>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-body">
        <div className="dashboard-stats-row">
          <StatCard
            label="Total Orders"
            value={stats.total}
            icon={<Icon.Package />}
            color="#3b82f6"
            bg="#eff6ff"
          />
          <StatCard
            label="Successful"
            value={stats.success}
            icon={<Icon.CheckCircle />}
            color="#16a34a"
            bg="#dcfce7"
          />
          <StatCard
            label="Attention"
            value={stats.attention}
            icon={<Icon.AlertCircle />}
            color="#d97706"
            bg="#fffbeb"
          />
          <StatCard
            label="Failed"
            value={stats.failure}
            icon={<Icon.XCircle />}
            color="#dc2626"
            bg="#fee2e2"
          />
          <StatCard
            label="Suppliers"
            value={stats.suppliers}
            icon={<Icon.Building />}
            color="#7c3aed"
            bg="#ede9fe"
          />
        </div>

        <div className="dashboard-filters-row">
          <div className="dashboard-search-wrapper">
            <div className="dashboard-search-icon">
              <Icon.Search />
            </div>
            <input
              type="text"
              placeholder="Search order #, supplier, file…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dashboard-search-input"
            />
          </div>

          <div className="dashboard-filter-tabs">
            {["all", "success", "attention", "failure"].map((f) => {
              const isActive = filter === f;
              const activeClass =
                f === "success"
                  ? "dashboard-filter-tab-btn-active-success"
                  : f === "failure"
                    ? "dashboard-filter-tab-btn-active-failure"
                    : f === "attention"
                      ? "dashboard-filter-tab-btn-active-attention"
                      : "dashboard-filter-tab-btn-active-all";

              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`dashboard-filter-tab-btn ${isActive ? activeClass : "dashboard-filter-tab-btn-inactive"}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== "all" && (
                    <span className="dashboard-tab-count-badge">
                      ({orders.filter((o) => o.status === f).length})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={loadData} className="dashboard-refresh-btn">
            <div style={{ width: "14px", height: "14px" }}>
              <Icon.Refresh />
            </div>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="dashboard-loader-wrapper">
            <Spinner size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon">
              <Icon.Package />
            </div>
            <p className="dashboard-empty-title">No orders found</p>
            <p className="dashboard-empty-subtitle">
              {search || filter !== "all"
                ? "Try adjusting your search or filter"
                : 'Click "Sync pCloud" to start processing PDFs'}
            </p>
          </div>
        ) : (
          <>
            <p className="dashboard-showing-text">
              Showing {filtered.length} of {orders.length} orders
            </p>
            <div className="dashboard-orders-grid">
              {filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => setSelectedId(order.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {syncResult && (
        <SyncPanel result={syncResult} onClose={() => setSyncResult(null)} />
      )}
      {selectedId && (
        <OrderModal orderId={selectedId} onClose={() => setSelectedId(null)} />
      )}
      {showUploadModal && (
        <UploadPdfModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={loadData}
        />
      )}
      {showSuppliersModal && (
        <SuppliersModal onClose={() => setShowSuppliersModal(false)} />
      )}
    </div>
  );
}

export default Dashboard;

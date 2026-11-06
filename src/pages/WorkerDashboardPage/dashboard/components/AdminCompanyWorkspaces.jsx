import React, { useState, useEffect, useCallback, useRef } from "react";
import FinanceView from "./FinanceView";
import WorkerView from "./WorkerView";
import { getWorkerDashboardData } from "../../services";
import "./ScopedDashboard.css";

export default function AdminCompanyWorkspaces() {
  const [activeCompany, setActiveCompany] = useState("tebo");
  const [dataMap, setDataMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  
  const fetchedKeysRef = useRef(new Set());

  const fetchData = useCallback(async (audience, company, force = false) => {
    const key = `${audience}:${company}`;
    if (!force && fetchedKeysRef.current.has(key)) {
      return;
    }
    fetchedKeysRef.current.add(key);

    setLoadingMap((prev) => ({ ...prev, [key]: true }));
    setErrorMap((prev) => ({ ...prev, [key]: null }));

    try {
      const data = await getWorkerDashboardData(audience, company);
      setDataMap((prev) => ({ ...prev, [key]: data }));
    } catch (err) {
      console.error(`Error loading ${audience} data for ${company}:`, err);
 
      fetchedKeysRef.current.delete(key);
      setErrorMap((prev) => ({
        ...prev,
        [key]: err.message || `Failed to load ${audience} data`,
      }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  
  useEffect(() => {
    fetchData("finance", activeCompany);
    fetchData("worker", activeCompany);
  }, [activeCompany, fetchData]);

  const companyLabel =
    activeCompany === "tebo"
      ? "Tebo AG"
      : "Schlauchservice Baumann GmbH (SSB)";

  const financeKey = `finance:${activeCompany}`;
  const workerKey = `worker:${activeCompany}`;

  const financeData = dataMap[financeKey];
  const isFinanceLoading = Boolean(loadingMap[financeKey]) && !financeData;
  const financeError = errorMap[financeKey];

  const workerData = dataMap[workerKey];
  const isWorkerLoading = Boolean(loadingMap[workerKey]) && !workerData;
  const workerError = errorMap[workerKey];

  const isRefreshing = Boolean(loadingMap[financeKey] || loadingMap[workerKey]);

  const handleRefresh = () => {
    fetchData("finance", activeCompany, true);
    fetchData("worker", activeCompany, true);
  };

  return (
    <div className="admin-company-workspaces" style={{ marginTop: "32px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#102941", margin: "0 0 4px" }}>
            Company Workspaces
          </h2>
          <p style={{ fontSize: "13px", color: "#61758d", margin: 0 }}>
            {companyLabel} — Finance &amp; Operations Data
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="scope-tabs">
            <button
              type="button"
              className={`scope-tab-btn ${activeCompany === "tebo" ? "active" : ""}`}
              onClick={() => setActiveCompany("tebo")}
            >
              <span>Tebo</span>
            </button>
            <button
              type="button"
              className={`scope-tab-btn ${activeCompany === "ssb" ? "active" : ""}`}
              onClick={() => setActiveCompany("ssb")}
            >
              <span>SSB</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`refresh-icon-btn ${isRefreshing ? "spinning" : ""}`}
            title={`Reload ${companyLabel} data`}
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

      {/* Finance View (top) */}
      {isFinanceLoading && (
        <div className="view-loading-state">
          <div className="spinner"></div>
          <p>Loading finance data for {companyLabel}...</p>
        </div>
      )}

      {!isFinanceLoading && financeError && (
        <div className="view-error-state">
          <p className="error-msg">{financeError}</p>
          <button
            type="button"
            className="retry-btn"
            onClick={() => fetchData("finance", activeCompany, true)}
          >
            Retry
          </button>
        </div>
      )}

      {!isFinanceLoading && !financeError && financeData && (
        <FinanceView data={financeData} companyScope={activeCompany} />
      )}

      {/* Worker View (bottom) */}
      {isWorkerLoading && (
        <div className="view-loading-state">
          <div className="spinner"></div>
          <p>Loading operations data for {companyLabel}...</p>
        </div>
      )}

      {!isWorkerLoading && workerError && (
        <div className="view-error-state">
          <p className="error-msg">{workerError}</p>
          <button
            type="button"
            className="retry-btn"
            onClick={() => fetchData("worker", activeCompany, true)}
          >
            Retry
          </button>
        </div>
      )}

      {!isWorkerLoading && !workerError && workerData && (
        <WorkerView data={workerData} companyScope={activeCompany} />
      )}
    </div>
  );
}

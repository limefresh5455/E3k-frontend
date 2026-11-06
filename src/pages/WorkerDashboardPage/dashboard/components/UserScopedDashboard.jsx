import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import FinanceView from "./FinanceView";
import WorkerView from "./WorkerView";
import { getWorkerDashboardData } from "../../services";
import "./ScopedDashboard.css";

const COMPANY_INFO = {
  tebo: {
    id: "tebo",
    name: "Tebo AG",
    shortName: "Tebo",
    clientId: "001",
  },
  ssb: {
    id: "ssb",
    name: "Schlauchservice Baumann GmbH",
    shortName: "SSB",
    clientId: "000",
  },
};

export default function UserScopedDashboard({ user }) {
  
  const userScopes = useMemo(() => {
    const scopes = new Set();
    (user?.entitlements || []).forEach((e) => {
      const scope = (e.company_scope || "").toLowerCase().trim();
      if (scope) scopes.add(scope);
    });
    return Array.from(scopes);
  }, [user]);

  const [activeScope, setActiveScope] = useState(() => {
    if (userScopes.includes("tebo")) return "tebo";
    if (userScopes.includes("ssb")) return "ssb";
    return userScopes[0] || "tebo";
  });

  useEffect(() => {
    if (userScopes.length > 0 && !userScopes.includes(activeScope)) {
      setActiveScope(userScopes[0]);
    }
  }, [userScopes, activeScope]);


  const activeEntitlements = useMemo(() => {
    return (user?.entitlements || []).filter(
      (e) => (e.company_scope || "").toLowerCase().trim() === activeScope
    );
  }, [user, activeScope]);

  const hasFinanceRead = useMemo(() => {
    return activeEntitlements.some(
      (e) => (e.permission || "").toLowerCase().trim() === "finance.read"
    );
  }, [activeEntitlements]);

  const hasWorkerRead = useMemo(() => {
    return activeEntitlements.some(
      (e) => (e.permission || "").toLowerCase().trim() === "worker.read"
    );
  }, [activeEntitlements]);

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
    if (!activeScope) return;

    if (hasFinanceRead) {
      fetchData("finance", activeScope);
    }
    if (hasWorkerRead) {
      fetchData("worker", activeScope);
    }
  }, [activeScope, hasFinanceRead, hasWorkerRead, fetchData]);

  const activeCompanyName =
    COMPANY_INFO[activeScope]?.name || activeScope.toUpperCase();

  const financeKey = `finance:${activeScope}`;
  const workerKey = `worker:${activeScope}`;

  const financeData = dataMap[financeKey];
  const isFinanceLoading = Boolean(loadingMap[financeKey]) && !financeData;
  const financeError = errorMap[financeKey];

  const workerData = dataMap[workerKey];
  const isWorkerLoading = Boolean(loadingMap[workerKey]) && !workerData;
  const workerError = errorMap[workerKey];

  return (
    <div className="user-scoped-dashboard">
      {userScopes.length > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "18px" }}>
          <div className="scope-tabs">
            {userScopes.map((scopeKey) => {
              const info = COMPANY_INFO[scopeKey] || {
                id: scopeKey,
                name: scopeKey.toUpperCase(),
              };
              return (
                <button
                  key={scopeKey}
                  type="button"
                  className={`scope-tab-btn ${activeScope === scopeKey ? "active" : ""}`}
                  onClick={() => setActiveScope(scopeKey)}
                >
                  {info.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      
      {hasFinanceRead && (
        <>
          {isFinanceLoading && (
            <div className="view-loading-state">
              <div className="spinner"></div>
              <p>Loading finance data for {activeCompanyName}...</p>
            </div>
          )}

          {!isFinanceLoading && financeError && (
            <div className="view-error-state">
              <p className="error-msg">{financeError}</p>
              <button
                type="button"
                className="retry-btn"
                onClick={() => fetchData("finance", activeScope, true)}
              >
                Retry
              </button>
            </div>
          )}

          {!isFinanceLoading && !financeError && financeData && (
            <FinanceView
              data={financeData}
              companyScope={activeScope}
            />
          )}
        </>
      )}

      
      {hasWorkerRead && (
        <>
          {isWorkerLoading && (
            <div className="view-loading-state">
              <div className="spinner"></div>
              <p>Loading operations data for {activeCompanyName}...</p>
            </div>
          )}

          {!isWorkerLoading && workerError && (
            <div className="view-error-state">
              <p className="error-msg">{workerError}</p>
              <button
                type="button"
                className="retry-btn"
                onClick={() => fetchData("worker", activeScope, true)}
              >
                Retry
              </button>
            </div>
          )}

          {!isWorkerLoading && !workerError && workerData && (
            <WorkerView
              data={workerData}
              companyScope={activeScope}
            />
          )}
        </>
      )}

      {!hasFinanceRead && !hasWorkerRead && (
        <div className="access-restricted-card">
          <div className="access-restricted-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h3>No Permissions for {activeCompanyName}</h3>
          <p>
            Your account does not have <code>finance.read</code> or <code>worker.read</code>{" "}
            entitlements assigned for company scope &quot;{activeScope}&quot;. Please select another
            authorized company scope or contact your administrator.
          </p>
        </div>
      )}
    </div>
  );
}

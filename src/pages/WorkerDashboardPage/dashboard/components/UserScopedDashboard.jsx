import React, { useState, useMemo } from "react";
import FinanceView from "./FinanceView";
import WorkerView from "./WorkerView";
import teboFinanceData from "../data/tebo-finance.json";
import teboWorkerData from "../data/tebo-workers.json";
import ssbFinanceData from "../data/ssb-finance.json";
import ssbWorkerData from "../data/ssb-workers.json";
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
  // Extract all company scopes available to this user from entitlements
  const userScopes = useMemo(() => {
    const scopes = new Set();
    (user?.entitlements || []).forEach((e) => {
      const scope = (e.company_scope || "").toLowerCase().trim();
      if (scope) scopes.add(scope);
    });
    return Array.from(scopes);
  }, [user]);

  // Default active scope
  const [activeScope, setActiveScope] = useState(() => {
    if (userScopes.includes("tebo")) return "tebo";
    if (userScopes.includes("ssb")) return "ssb";
    return userScopes[0] || "tebo";
  });

  // Calculate permissions for the active scope
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

  // Select data according to company scope
  const activeFinanceData = useMemo(() => {
    return activeScope === "tebo" ? teboFinanceData : ssbFinanceData;
  }, [activeScope]);

  const activeWorkerData = useMemo(() => {
    return activeScope === "tebo" ? teboWorkerData : ssbWorkerData;
  }, [activeScope]);

  const activeCompanyName =
    COMPANY_INFO[activeScope]?.name || activeScope.toUpperCase();

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
        <FinanceView
          data={activeFinanceData}
          companyScope={activeScope}
        />
      )}

   
      {hasWorkerRead && (
        <WorkerView
          data={activeWorkerData}
          companyScope={activeScope}
        />
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


import React, { useState } from "react";
import FinanceView from "./FinanceView";
import WorkerView from "./WorkerView";
import teboFinanceData from "../data/tebo-finance.json";
import teboWorkerData from "../data/tebo-workers.json";
import ssbFinanceData from "../data/ssb-finance.json";
import ssbWorkerData from "../data/ssb-workers.json";
import "./ScopedDashboard.css";

export default function AdminCompanyWorkspaces() {
  const [activeCompany, setActiveCompany] = useState("tebo"); 

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
            {activeCompany === "tebo"
              ? "Tebo AG — Finance & Operations Data"
              : "Schlauchservice Baumann GmbH (SSB) — Finance & Operations Data"}
          </p>
        </div>

        
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
      </div>


      {activeCompany === "tebo" && (
        <>
          <FinanceView data={teboFinanceData} companyScope="tebo" />
          <WorkerView data={teboWorkerData} companyScope="tebo" />
        </>
      )}

    
      {activeCompany === "ssb" && (
        <>
          <FinanceView data={ssbFinanceData} companyScope="ssb" />
          <WorkerView data={ssbWorkerData} companyScope="ssb" />
        </>
      )}
    </div>
  );
}


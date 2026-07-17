import React from "react";
import "./PublicTabs.css";

export function PublicTabs({ active, onSelect }) {
  const tabs = [
    ["login", "Sign In"],
    ["monthly-invoice", "Monthly Invoice"],
  ];

  return (
    <div className="public-tabs-container">
      {tabs.map(([key, label]) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`public-tabs-btn ${isActive ? "public-tabs-btn-active" : "public-tabs-btn-inactive"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default PublicTabs;

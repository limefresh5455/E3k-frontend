import React from "react";
import "./StatCard.css";

export function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="stat-card-container">
      <div className="stat-card-icon-wrapper" style={{ background: bg }}>
        <div className="stat-card-icon-inner" style={{ color }}>
          {icon}
        </div>
      </div>
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value ?? 0}</p>
      </div>
    </div>
  );
}

export default StatCard;

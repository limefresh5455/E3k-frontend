import React from "react";
import Icon from "../Icon/Icon";
import Badge from "../Badge/Badge";
import "./SyncPanel.css";

export function SyncPanel({ result, onClose }) {
  if (!result) return null;

  const stats = [
    ["Found", result.total_found, "#3b82f6"],
    ["Processed", result.processed, "#8b5cf6"],
    ["Skipped", result.skipped, "#64748b"],
    ["Success", result.success, "#22c55e"],
    ["Failed", result.failure, "#ef4444"],
  ];

  return (
    <div className="sync-overlay">
      <div className="sync-dialog">
        <div className="sync-header">
          <h2 className="sync-title">Sync Complete</h2>
          <button onClick={onClose} className="sync-close-btn">
            <Icon.Close />
          </button>
        </div>

        <div className="sync-body">
          <div className="sync-stats-grid">
            {stats.map(([label, val, color]) => (
              <div key={label} className="sync-stat-card">
                <p className="sync-stat-label">{label}</p>
                <p className="sync-stat-val" style={{ color }}>
                  {val}
                </p>
              </div>
            ))}
          </div>

          <div className="sync-details-list">
            {result.details?.map((d, i) => (
              <div key={i} className="sync-detail-item">
                <span className="sync-detail-filename">{d.file}</span>
                <div className="sync-detail-right">
                  {d.order_number && (
                    <span className="sync-detail-order-number">
                      #{d.order_number}
                    </span>
                  )}
                  <Badge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sync-footer">
          <button onClick={onClose} className="sync-confirm-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SyncPanel;

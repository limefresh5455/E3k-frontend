import React from "react";
import "./Badge.css";

export function Badge({ status, reasons, ...props }) {
  const m = {
    success: { className: "badge-success", t: "SUCCESS" },
    failure: { className: "badge-failure", t: "FAILED" },
    pending: { className: "badge-pending", t: "PENDING" },
    skipped: { className: "badge-skipped", t: "SKIPPED" },
    attention: { className: "badge-attention", t: "ATTENTION" },
  };

  const s = m[status] || m.pending;

  if (status === "attention" && Array.isArray(reasons) && reasons.length > 0) {
    return (
      <div className="tooltip-container">
        <span className={`badge ${s.className}`} {...props}>
          {s.t}
        </span>
        <div className="tooltip-text">
          {reasons.map((reason, idx) => (
            <p
              key={idx}
              style={{ margin: idx === 0 ? 0 : "4px 0 0", lineHeight: "1.3" }}
            >
              {reason}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <span className={`badge ${s.className}`} {...props}>
      {s.t}
    </span>
  );
}

export default Badge;

import React from "react";
import Icon from "../Icon/Icon";
import Badge from "../Badge/Badge";
import "./OrderCard.css";

export function OrderCard({ order, onClick }) {
  const s = order.summary || {};
  const needsDoubleCheck = Boolean(s.requires_double_check);
  const rawAlerts = Array.isArray(s.alerts) ? s.alerts : [];
  const hasUnit = rawAlerts.some((a) => a?.type === "unit_factor");
  const hasDelivery = rawAlerts.some(
    (a) => a?.type === "delivery_date_gt_one_week",
  );

  const normalizedAlerts =
    hasDelivery && !hasUnit
      ? [
          {
            type: "unit_factor",
            message: "Double-check required: Unit price conversion.",
          },
          ...rawAlerts,
        ]
      : rawAlerts;

  const summaryAlerts = [
    ...normalizedAlerts.filter((a) => a?.type === "unit_factor"),
    ...normalizedAlerts.filter((a) => a?.type === "delivery_date_gt_one_week"),
    ...normalizedAlerts.filter(
      (a) =>
        a?.type !== "unit_factor" && a?.type !== "delivery_date_gt_one_week",
    ),
  ];

  const ok = order.status === "success";
  const fail = order.status === "failure";
  const attention = order.status === "attention";

  const statusBarBg = attention
    ? "linear-gradient(90deg, #f59e0b, #d97706)"
    : ok
      ? "linear-gradient(90deg, #22c55e, #16a34a)"
      : fail
        ? "linear-gradient(90deg, #ef4444, #dc2626)"
        : "#e2e8f0";

  return (
    <div
      onClick={onClick}
      className={`order-card ${ok ? "order-card-success" : ""} ${fail ? "order-card-fail" : ""} ${attention ? "order-card-attention" : ""}`}
    >
      <div
        className="order-card-status-bar"
        style={{ background: statusBarBg }}
      />
      <div className="order-card-header">
        <div className="order-card-top-row">
          <p className="order-card-title">
            {order.order_number ? `#${order.order_number}` : "No Order #"}
          </p>
          <div className="order-card-badge-container">
            <Badge status={order.status} reasons={order.attention_reasons} />
          </div>
        </div>
        <p className="order-card-filename">{order.file_name}</p>
      </div>

      <div className="order-card-row">
        <div className="order-card-icon">
          <Icon.Building />
        </div>
        <span className="order-card-text">
          {order.supplier || s.supplier || "Unknown supplier"}
        </span>
      </div>

      {s.delivery_date && (
        <div className="order-card-row">
          <div className="order-card-icon">
            <Icon.Calendar />
          </div>
          <span className="order-card-text">
            Delivery: <strong>{s.delivery_date}</strong>
          </span>
        </div>
      )}

      {(ok || attention) && s.line_count > 0 && (
        <div className="order-card-row">
          <div className="order-card-icon">
            <Icon.Hash />
          </div>
          <span className="order-card-text">
            {s.line_count} line{s.line_count !== 1 ? "s" : ""} &nbsp;·&nbsp;{" "}
            {s.currency} {s.total_net?.toFixed(2)}
          </span>
        </div>
      )}

      {(ok || attention) && needsDoubleCheck && (
        <div className="order-card-check-box">
          {(summaryAlerts.length
            ? summaryAlerts
            : [{ message: "Double-check required." }]
          ).map((a, i) => (
            <p
              key={i}
              className="order-card-check-item"
              style={{ marginTop: i === 0 ? 0 : "0.25rem" }}
            >
              {`${i + 1}. ${a?.message || "Double-check required."}`}
            </p>
          ))}
        </div>
      )}

      {fail && (
        <div className="order-card-error-box">
          <p className="order-card-error-text">{order.error_message}</p>
        </div>
      )}

      <div className="order-card-footer">
        <div className="order-card-folder-group">
          <div className="order-card-folder-icon">
            <Icon.Folder />
          </div>
          <span className="order-card-folder-name">
            {s.folder || order.folder_name || "—"}
          </span>
        </div>
        <span className="order-card-date">
          {order.processed_at
            ? new Date(order.processed_at).toLocaleDateString("de-CH")
            : ""}
        </span>
      </div>
    </div>
  );
}

export default OrderCard;

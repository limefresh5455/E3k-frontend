import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "../Icon/Icon";
import Badge from "../Badge/Badge";
import Spinner from "../Spinner/Spinner";
import { getOrder, updateOrderLine } from "../../services";
import { asNumber } from "../../utils";
import "./OrderModal.css";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const parseDateString = (dateStr) => {
  if (!dateStr) return null;

  const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    return { year: ymdMatch[1], month: ymdMatch[2], day: ymdMatch[3] };
  }

  const dmyMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (dmyMatch) {
    return {
      year: dmyMatch[3],
      month: dmyMatch[2].padStart(2, "0"),
      day: dmyMatch[1].padStart(2, "0"),
    };
  }

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = String(d.getFullYear());
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return { year, month, day };
    }
  } catch (e) {}

  return null;
};

const formatDeliveryDateForApi = (dateStr) => {
  const parts = parseDateString(dateStr);
  return parts
    ? `${parts.year}-${parts.month}-${parts.day} 00:00:00.000`
    : dateStr;
};

const formatDateForInput = (dateStr) => {
  const parts = parseDateString(dateStr);
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : "";
};

const formatDateForUi = (dateStr) => {
  if (dateStr && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  const parts = parseDateString(dateStr);
  return parts ? `${parts.day}.${parts.month}.${parts.year}` : "—";
};

const getMonthMatrix = (year, month) => {
  const firstOfMonth = new Date(year, month, 1);
  const jsDay = firstOfMonth.getDay(); 
  const startOffset = (jsDay + 6) % 7; 
  const gridStart = new Date(year, month, 1 - startOffset);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
};

const isSameDate = (d, y, m, day) =>
  d.getFullYear() === y && d.getMonth() === m && d.getDate() === day;

const DATEPICKER_POPUP_WIDTH = 232;
const DATEPICKER_POPUP_HEIGHT = 300;
const DATEPICKER_VIEWPORT_MARGIN = 8;

function CustomDatePicker({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const parsed = parseDateString(value);
    return parsed
      ? new Date(Number(parsed.year), Number(parsed.month) - 1, 1)
      : new Date();
  });
  const [popupStyle, setPopupStyle] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const parsed = parseDateString(value);
    if (parsed) {
      setViewDate(new Date(Number(parsed.year), Number(parsed.month) - 1, 1));
    }
  }, [value]);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - DATEPICKER_POPUP_WIDTH / 2;
    left = Math.max(
      DATEPICKER_VIEWPORT_MARGIN,
      Math.min(left, window.innerWidth - DATEPICKER_POPUP_WIDTH - DATEPICKER_VIEWPORT_MARGIN),
    );

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards =
      spaceBelow < DATEPICKER_POPUP_HEIGHT + DATEPICKER_VIEWPORT_MARGIN &&
      rect.top > DATEPICKER_POPUP_HEIGHT + DATEPICKER_VIEWPORT_MARGIN;

    const top = openUpwards
      ? rect.top - DATEPICKER_POPUP_HEIGHT - 6
      : rect.bottom + 6;

    setPopupStyle({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      const clickedTrigger =
        triggerRef.current && triggerRef.current.contains(e.target);
      const clickedPopup =
        popupRef.current && popupRef.current.contains(e.target);
      if (!clickedTrigger && !clickedPopup) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const selectedParts = parseDateString(value);
  const today = new Date();
  const cells = getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth());
  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleSelect = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${day}`);
    setOpen(false);
  };

  return (
    <div className="custom-datepicker">
      <button
        type="button"
        ref={triggerRef}
        className="custom-datepicker-trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
      >
        <span>
          {selectedParts
            ? `${selectedParts.day}.${selectedParts.month}.${selectedParts.year}`
            : "Select date"}
        </span>
        <span className="custom-datepicker-icon">
          <Icon.Calendar />
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popupRef}
            className="custom-datepicker-popup"
            style={{ top: `${popupStyle.top}px`, left: `${popupStyle.left}px` }}
          >
            <div className="custom-datepicker-header">
              <button
                type="button"
                className="custom-datepicker-nav"
                onClick={() =>
                  setViewDate(
                    new Date(
                      viewDate.getFullYear(),
                      viewDate.getMonth() - 1,
                      1,
                    ),
                  )
                }
                aria-label="Previous month"
              >
                ‹
              </button>
              <span className="custom-datepicker-month-label">
                {monthLabel}
              </span>
              <button
                type="button"
                className="custom-datepicker-nav"
                onClick={() =>
                  setViewDate(
                    new Date(
                      viewDate.getFullYear(),
                      viewDate.getMonth() + 1,
                      1,
                    ),
                  )
                }
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="custom-datepicker-weekdays">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>

            <div className="custom-datepicker-grid">
              {cells.map((d, idx) => {
                const inCurrentMonth = d.getMonth() === viewDate.getMonth();
                const isSelected =
                  selectedParts &&
                  isSameDate(
                    d,
                    Number(selectedParts.year),
                    Number(selectedParts.month) - 1,
                    Number(selectedParts.day),
                  );
                const isToday = isSameDate(
                  d,
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                );

                return (
                  <button
                    type="button"
                    key={idx}
                    className={[
                      "custom-datepicker-day",
                      !inCurrentMonth ? "custom-datepicker-day-muted" : "",
                      isSelected ? "custom-datepicker-day-selected" : "",
                      isToday && !isSelected
                        ? "custom-datepicker-day-today"
                        : "",
                    ]
                      .join(" ")
                      .trim()}
                    onClick={() => handleSelect(d)}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="custom-datepicker-footer">
              <button
                type="button"
                className="custom-datepicker-today-btn"
                onClick={() => handleSelect(new Date())}
              >
                Today
              </button>
              {selectedParts && (
                <button
                  type="button"
                  className="custom-datepicker-clear-btn"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function OrderModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hoveredDesc, setHoveredDesc] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [editData, setEditData] = useState({
    GrossPrice: "",
    DiscountPercent: "",
    LineTotal: "",
    DeliveryDate: "",
  });

  const handleEditChange = (field, val) => {
    setEditData((prev) => {
      const next = { ...prev, [field]: val };
      if (field === "GrossPrice" || field === "DiscountPercent") {
        const line = order?.extracted_json?.VoucherLines?.[editingIndex];
        const qty = asNumber(line?.Quantity) ?? 0;
        const price = Number(next.GrossPrice) || 0;
        const discount = Number(next.DiscountPercent) || 0;
        const netPrice = price * (1 - discount / 100);
        next.LineTotal = (netPrice * qty).toFixed(2);
      }
      return next;
    });
  };

  const startEditing = (index, line) => {
    setEditingIndex(index);
    setEditData({
      GrossPrice:
        line.GrossPrice !== undefined && line.GrossPrice !== null
          ? line.GrossPrice
          : (line.Price ?? ""),
      DiscountPercent:
        line.DiscountPercent !== undefined && line.DiscountPercent !== null
          ? line.DiscountPercent
          : "",
      LineTotal:
        line.LineTotal !== undefined && line.LineTotal !== null
          ? line.LineTotal
          : "",
      DeliveryDate: line.DeliveryDate || "",
    });
  };

  const saveRow = async (index) => {
    const originalLine = (order?.extracted_json?.VoucherLines || [])[index];
    if (!originalLine) return;

    const payload = {
      order_id: order.id,
      voucher_number: order.order_number,
      erp_article_no: originalLine.ErpArticleNumber || originalLine.Number,
      unit_price:
        editData.GrossPrice === "" ? null : Number(editData.GrossPrice),
      total: editData.LineTotal === "" ? null : Number(editData.LineTotal),
      discount_percent:
        editData.DiscountPercent === ""
          ? null
          : Number(editData.DiscountPercent),
      delivery_date: formatDeliveryDateForApi(editData.DeliveryDate),
    };

    setSaving(true);
    try {
      await updateOrderLine(payload);
      const refreshedOrder = await getOrder(orderId);
      setOrder(refreshedOrder);
      setEditingIndex(null);
    } catch (err) {
      console.error("Failed to update order line:", err);
      alert(
        "Failed to update line: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!orderId) return null;

  const ext = order?.extracted_json;
  const lines = ext?.VoucherLines || [];
  const computedNetTotal =
    order && order.summary
      ? lines.reduce((acc, line) => {
          const qty = asNumber(line.Quantity) ?? 0;
          const unitPrice = asNumber(line.GrossPrice ?? line.Price);
          const discount = asNumber(line.DiscountPercent) ?? 0;
          const lineTotal =
            line.LineTotal !== undefined && line.LineTotal !== null
              ? asNumber(line.LineTotal)
              : unitPrice !== null
                ? unitPrice * (1 - discount / 100) * qty
                : 0;
          return acc + lineTotal;
        }, 0)
      : 0;
  const rawAlerts = order?.summary?.alerts || [];
  const hasUnitAlert = rawAlerts.some((a) => a?.type === "unit_factor");
  const hasDeliveryAlert = rawAlerts.some(
    (a) => a?.type === "delivery_date_gt_one_week",
  );

  const normalizedAlerts =
    hasDeliveryAlert && !hasUnitAlert
      ? [
          {
            type: "unit_factor",
            message: "Double-check required: Unit price conversion.",
          },
          ...rawAlerts,
        ]
      : rawAlerts;

  const alerts = [
    ...normalizedAlerts.filter((a) => a?.type === "unit_factor"),
    ...normalizedAlerts.filter((a) => a?.type === "delivery_date_gt_one_week"),
    ...normalizedAlerts.filter(
      (a) =>
        a?.type !== "unit_factor" && a?.type !== "delivery_date_gt_one_week",
    ),
  ];

  return (
    <div className="order-modal-overlay">
      <div className="order-modal-dialog">
        <div className="order-modal-header">
          <div className="order-modal-header-left">
            <div className="order-modal-header-title-row">
              <h2 className="order-modal-title">
                {order?.order_number
                  ? `Order #${order.order_number}`
                  : "Order Detail"}
              </h2>
              {order && (
                <Badge
                  status={order.status}
                  reasons={order.attention_reasons}
                />
              )}
            </div>
            <p className="order-modal-subtitle">{order?.file_name}</p>
          </div>
          <button onClick={onClose} className="order-modal-close-btn">
            <Icon.Close />
          </button>
        </div>

        <div className="order-modal-body">
          {loading && (
            <div className="order-modal-loader">
              <Spinner />
            </div>
          )}

          {!loading && order?.status === "failure" && (
            <div className="order-modal-fail-box">
              <p className="order-modal-fail-title">Processing Failed</p>
              <p className="order-modal-fail-message">{order.error_message}</p>
            </div>
          )}

          {!loading &&
            (order?.status === "success" || order?.status === "attention") &&
            ext && (
              <div className="order-modal-content">
                <div className="order-modal-meta-grid">
                  {[
                    ["Supplier", ext.Supplier],
                    ["Order #", ext.OurOrderNumber],
                    ["Customer Nr.", ext.CustomerNumber],
                    ["Voucher Date", ext.VoucherDate],
                    ["Delivery Date", ext.DeliveryDate],
                    ["Currency", ext.Currency],
                  ].map(([label, val]) => (
                    <div key={label} className="order-modal-meta-card">
                      <p className="order-modal-meta-label">{label}</p>
                      <p className="order-modal-meta-value">{val || "—"}</p>
                    </div>
                  ))}
                </div>

                {order.pdf_url && (
                  <a
                    href={order.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "none" }}
                  />
                )}

                {lines.length > 0 && (
                  <div className="order-modal-lines-section">
                    <p className="order-modal-section-title">
                      Order Lines{" "}
                      <span className="order-modal-section-title-span">
                        ({lines.length})
                      </span>
                    </p>

                    <div className="order-modal-table-wrapper">
                      <table className="order-modal-table">
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            {[
                              "Artikelnummer",
                              "Bezeichnung",
                              "Menge",
                              "Preis",
                              "Einheit",
                              "Rab %",
                              "Rabattpreis",
                              "Betrag",
                              "Delivery",
                              "Aktion",
                            ].map((h) => {
                              const isRightAligned = [
                                "Menge",
                                "Preis",
                                "Einheit",
                                "Rab %",
                                "Preis ohne Rabatt",
                                "Betrag",
                              ].includes(h);
                              const isCenterAligned = ["Actions"].includes(h);
                              return (
                                <th
                                  key={h}
                                  className={`order-modal-th ${isRightAligned ? "order-modal-th-right" : isCenterAligned ? "order-modal-th-center" : "order-modal-th-left"}`}
                                >
                                  {h}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, i) => {
                            const isEditing = editingIndex === i;
                            const qty = asNumber(line.Quantity) ?? 0;
                            const unitPrice = asNumber(
                              line.GrossPrice ?? line.Price,
                            );
                            const netUnitPrice =
                              unitPrice !== null
                                ? unitPrice *
                                  (1 - (line.DiscountPercent ?? 0) / 100)
                                : null;
                            const total =
                              line.LineTotal !== undefined &&
                              line.LineTotal !== null
                                ? asNumber(line.LineTotal)
                                : netUnitPrice !== null
                                  ? netUnitPrice * qty
                                  : null;

                            const editPrice = Number(editData.GrossPrice) || 0;
                            const editDiscount =
                              Number(editData.DiscountPercent) || 0;
                            const editNetUnitPrice =
                              editPrice * (1 - editDiscount / 100);

                            const rowClass =
                              i % 2 === 0
                                ? "order-modal-tr-even"
                                : "order-modal-tr-odd";
                            const editingClass = isEditing
                              ? "order-modal-tr-editing"
                              : "";

                            return (
                              <tr
                                key={i}
                                className={`order-modal-tr ${rowClass} ${editingClass}`}
                              >
                                <td className="order-modal-td order-modal-td-art">
                                  {line.Number}
                                </td>
                                <td className="order-modal-td order-modal-td-desc">
                                  <div
                                    className="order-modal-desc-wrapper"
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setTooltipPos({
                                        x: rect.left + rect.width / 2,
                                        y: rect.top,
                                      });
                                      setHoveredDesc(line.Description);
                                    }}
                                    onMouseLeave={() => setHoveredDesc(null)}
                                  >
                                    {line.Description}
                                  </div>
                                </td>
                                <td className="order-modal-td order-modal-td-qty">
                                  {line.Quantity}
                                </td>
                                <td className="order-modal-td order-modal-td-price">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      className="order-modal-input"
                                      style={{
                                        width: "58px",
                                        textAlign: "right",
                                      }}
                                      value={editData.GrossPrice}
                                      onChange={(e) =>
                                        handleEditChange(
                                          "GrossPrice",
                                          e.target.value,
                                        )
                                      }
                                      disabled={saving}
                                    />
                                  ) : unitPrice !== null ? (
                                    unitPrice.toFixed(2)
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td className="order-modal-td order-modal-td-einheit">
                                  {line.Einheit !== undefined &&
                                  line.Einheit !== null
                                    ? line.Einheit
                                    : "—"}
                                </td>
                                <td className="order-modal-td order-modal-td-discount">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      step="0.1"
                                      className="order-modal-input"
                                      style={{
                                        width: "55px",
                                        textAlign: "right",
                                      }}
                                      value={editData.DiscountPercent}
                                      onChange={(e) =>
                                        handleEditChange(
                                          "DiscountPercent",
                                          e.target.value,
                                        )
                                      }
                                      disabled={saving}
                                    />
                                  ) : line.DiscountPercent !== undefined &&
                                    line.DiscountPercent !== null ? (
                                    `${line.DiscountPercent}%`
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td className="order-modal-td order-modal-td-netprice">
                                  {isEditing
                                    ? editNetUnitPrice.toFixed(2)
                                    : netUnitPrice !== null
                                      ? netUnitPrice.toFixed(2)
                                      : "—"}
                                </td>
                                <td className="order-modal-td order-modal-td-betrag">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      className="order-modal-input"
                                      style={{
                                        width: "70px",
                                        textAlign: "right",
                                      }}
                                      value={editData.LineTotal}
                                      onChange={(e) =>
                                        handleEditChange(
                                          "LineTotal",
                                          e.target.value,
                                        )
                                      }
                                      disabled={saving}
                                    />
                                  ) : total !== null ? (
                                    total.toFixed(2)
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td className="order-modal-td order-modal-td-delivery">
                                  {isEditing ? (
                                    <CustomDatePicker
                                      value={formatDateForInput(
                                        editData.DeliveryDate,
                                      )}
                                      onChange={(val) =>
                                        handleEditChange("DeliveryDate", val)
                                      }
                                      disabled={saving}
                                    />
                                  ) : (
                                    formatDateForUi(line.DeliveryDate)
                                  )}
                                </td>
                                <td className="order-modal-td order-modal-td-actions">
                                  {isEditing ? (
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.25rem",
                                        alignItems: "center",
                                      }}
                                    >
                                      <button
                                        className="order-modal-btn-save"
                                        onClick={() => saveRow(i)}
                                        disabled={saving}
                                      >
                                        {saving ? "Saving..." : "Save"}
                                      </button>
                                      <button
                                        className="order-modal-btn-cancel"
                                        style={{ marginLeft: 0 }}
                                        onClick={() => setEditingIndex(null)}
                                        disabled={saving}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      className="order-modal-btn-edit"
                                      onClick={() => startEditing(i, line)}
                                      disabled={saving}
                                    >
                                      Edit
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {order.summary && (
                  <div className="order-modal-summary-box">
                    <p className="order-modal-summary-title">Summary</p>
                    <div className="order-modal-summary-grid">
                      {[
                        ["Lines", order.summary.line_count],
                        [
                          "Net total",
                          `${order.summary.currency} ${computedNetTotal.toFixed(2)}`,
                        ],
                        ["Folder", order.summary.folder || "—"],
                        [
                          "Processed",
                          order.processed_at
                            ? new Date(order.processed_at).toLocaleString(
                                "de-CH",
                              )
                            : "—",
                        ],
                      ].map(([k, v]) => (
                        <div key={k} className="order-modal-summary-row">
                          <span className="order-modal-summary-label">{k}</span>
                          <span className="order-modal-summary-value">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {alerts.length > 0 && (
                  <div className="order-modal-alerts-box">
                    <div className="order-modal-alerts-container">
                      {alerts.map((a, i) => (
                        <div key={i}>
                          <p className="order-modal-alert-item-title">
                            {`${i + 1}. ${a?.message || "Double-check required."}`}
                          </p>
                          {Array.isArray(a?.lines) && a.lines.length > 0 && (
                            <div className="order-modal-alert-lines-list">
                              {a.lines.map((ln, j) => (
                                <p
                                  key={`${i}-${j}`}
                                  className="order-modal-alert-line-text"
                                >
                                  {a.type === "unit_factor"
                                    ? (() => {
                                        const article =
                                          ln.article_number || "?";
                                        const factor = ln.factor ?? null;
                                        const base = ln.base_unit_price ?? null;
                                        const erp = ln.erp_unit_price ?? null;
                                        if (
                                          factor === null ||
                                          base === null ||
                                          erp === null
                                        ) {
                                          return `Article ${article}: Einheit/unit-factor pricing detected. Please verify unit price manually.`;
                                        }
                                        return `Article ${article}: factor ${factor}, base ${base} -> ERP ${erp}`;
                                      })()
                                    : a.type === "delivery_date_gt_one_week"
                                      ? (() => {
                                          const article =
                                            ln.article_number || "?";
                                          const orderDate =
                                            ln.order_date || "not found";
                                          const deliveryDate =
                                            ln.delivery_date || "not found";
                                          const days = ln.days_after_order;
                                          const daysText = Number.isFinite(days)
                                            ? `${days} days`
                                            : "more than one week";
                                          return `Article ${article}: order ${orderDate}, delivery ${deliveryDate} (${daysText})`;
                                        })()
                                      : JSON.stringify(ln)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
      {hoveredDesc && (
        <div
          className="order-modal-global-tooltip"
          style={{
            position: "fixed",
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: "translate(-50%, -100%)",
            marginTop: "-8px",
            zIndex: 9999,
          }}
        >
          {hoveredDesc}
        </div>
      )}
    </div>
  );
}

export default OrderModal;
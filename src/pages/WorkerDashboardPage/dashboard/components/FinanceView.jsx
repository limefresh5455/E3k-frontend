import React, { useState, useMemo } from "react";
import { formatCents, formatDate, formatNumber, getStatusBadgeClass } from "../utils/dashboardUtils";

export default function FinanceView({ data }) {
  const [receivablesSearch, setReceivablesSearch] = useState("");
  const [receivablesFilter, setReceivablesFilter] = useState("all");

  const [payablesSearch, setPayablesSearch] = useState("");
  const [payablesFilter, setPayablesFilter] = useState("all");

  if (!data) {
    return (
      <div className="scoped-view-panel">
        <div className="no-data-notice">No finance data available.</div>
      </div>
    );
  }

  const {
    company = {},
    source = {},
    currency = "CHF",
    amountUnit = "integer-cents",
    monthlyResults = [],
    cash = {},
    receivables = [],
    payables = [],
    inventoryValuation = {},
  } = data;

  // Active or latest monthly result
  const latestMonth = monthlyResults[0] || {};

  // Filtered Receivables
  const filteredReceivables = useMemo(() => {
    return receivables.filter((item) => {
      const matchesFilter =
        receivablesFilter === "all" ||
        (item.status || "").toLowerCase() === receivablesFilter.toLowerCase();
      const q = receivablesSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.documentNumber || "").toLowerCase().includes(q) ||
        (item.counterparty || "").toLowerCase().includes(q) ||
        (item.id || "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [receivables, receivablesFilter, receivablesSearch]);

  // Receivables Totals
  const receivablesTotals = useMemo(() => {
    const totalOriginal = receivables.reduce((sum, r) => sum + (r.originalAmountCents || 0), 0);
    const totalOutstanding = receivables.reduce((sum, r) => sum + (r.outstandingAmountCents || 0), 0);
    const openCount = receivables.filter((r) => (r.status || "").toLowerCase() === "open").length;
    return { totalOriginal, totalOutstanding, openCount };
  }, [receivables]);

  // Filtered Payables
  const filteredPayables = useMemo(() => {
    return payables.filter((item) => {
      const matchesFilter =
        payablesFilter === "all" ||
        (item.status || "").toLowerCase() === payablesFilter.toLowerCase();
      const q = payablesSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.documentNumber || "").toLowerCase().includes(q) ||
        (item.counterparty || "").toLowerCase().includes(q) ||
        (item.id || "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [payables, payablesFilter, payablesSearch]);

  // Payables Totals
  const payablesTotals = useMemo(() => {
    const totalOriginal = payables.reduce((sum, p) => sum + (p.originalAmountCents || 0), 0);
    const totalOutstanding = payables.reduce((sum, p) => sum + (p.outstandingAmountCents || 0), 0);
    const openCount = payables.filter((p) => (p.status || "").toLowerCase() === "open").length;
    return { totalOriginal, totalOutstanding, openCount };
  }, [payables]);

  return (
    <section className="scoped-view-panel" id="finance-view-section">
      {/* Header */}
      <div className="view-header">
        <div className="view-header-title">
          <div className="view-icon-badge finance">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h2>Finance Overview — {company.name || "Company Finance"}</h2>
            <p>Financial performance, cash balance, receivables & payables</p>
          </div>
        </div>

        {/* Source Metadata Chips */}
        <div className="view-meta-bar">
          <span className="meta-chip">
            Company ID: <strong>{company.id || "—"}</strong>
          </span>
          <span className="meta-chip">
            Client ID: <strong>{company.clientId || "—"}</strong>
          </span>
          <span className="meta-chip">
            Fiscal Year Start: <strong>Month {company.fiscalYearStartMonth || 1}</strong>
          </span>
          <span className="meta-chip">
            Currency: <strong>{currency}</strong>
          </span>
          <span className="meta-chip">
            Unit: <strong>{amountUnit}</strong>
          </span>
          <span className="meta-chip">
            As Of: <strong>{formatDate(source.asOf)}</strong>
          </span>
          <span className="badge badge-muted">{source.status || "sample-only"}</span>
        </div>
      </div>


      {/* Monthly Results Table (P&L Detailed Breakdown) */}
      <div className="sub-section">
        <div className="sub-section-header">
          <div className="sub-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#038c99"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3>Monthly Results</h3>
          </div>
        </div>

        <div className="table-responsive">
          <table className="monthly-results-table">
            <thead>
              <tr>
                <th>Period</th>
                <th className="numeric">Net<br />Revenue</th>
                <th className="numeric">Material<br />Expense</th>
                <th className="numeric">Gross<br />Profit</th>
                <th className="numeric">Personnel<br />Expense</th>
                <th className="numeric">Operating<br />Expense</th>
                <th className="numeric">Operating<br />Profit</th>
                <th className="numeric">Direct<br />Tax</th>
                <th className="numeric">Net<br />Profit</th>
                <th>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {monthlyResults.map((m, idx) => (
                <tr key={m.period || idx}>
                  <td className="strong">{m.period}</td>
                  <td className="numeric strong">{formatCents(m.netRevenueCents, currency)}</td>
                  <td className="numeric">{formatCents(m.materialExpenseCents, currency)}</td>
                  <td className="numeric strong">{formatCents(m.grossProfitCents, currency)}</td>
                  <td className="numeric">{formatCents(m.personnelExpenseCents, currency)}</td>
                  <td className="numeric">{formatCents(m.otherOperatingExpenseCents, currency)}</td>
                  <td className="numeric strong">{formatCents(m.operatingProfitCents, currency)}</td>
                  <td className="numeric">{formatCents(m.directTaxCents, currency)}</td>
                  <td className="numeric strong" style={{ color: m.netProfitCents >= 0 ? "#15803d" : "#b91c1c" }}>
                    {formatCents(m.netProfitCents, currency)}
                  </td>
                  <td>
                    <span className="badge badge-muted">{m.coverage}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash & Liquidity */}
      <div className="sub-section">
        <div className="sub-section-header">
          <div className="sub-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#038c99"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
            <h3>Cash</h3>
          </div>
          <div className="view-meta-bar">
            <span className="meta-chip">
              Basis: <strong>{cash.basis || "book-balance"}</strong>
            </span>
            <span className="meta-chip">
              Confirmed: <strong>{cash.confirmed ? "Yes" : "False (Unconfirmed)"}</strong>
            </span>
            <span className="meta-chip">
              As Of: <strong>{formatDate(cash.asOf)}</strong>
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="scoped-table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Label</th>
                <th>Currency</th>
                <th className="numeric">Balance</th>
                <th>Liquidity</th>
              </tr>
            </thead>
            <tbody>
              {(cash.accounts || []).length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data-notice">
                    No cash accounts found.
                  </td>
                </tr>
              ) : (
                (cash.accounts || []).map((acc) => (
                  <tr key={acc.id}>
                    <td>
                      <span className="id-tag">{acc.id}</span>
                    </td>
                    <td className="strong">{acc.label}</td>
                    <td>{acc.currency || currency}</td>
                    <td className="numeric strong" style={{ color: "#038c99" }}>
                      {formatCents(acc.balanceCents, acc.currency || currency)}
                    </td>
                    <td>
                      {acc.includeInLiquidity ? (
                        <span className="badge badge-success">In Liquidity</span>
                      ) : (
                        <span className="badge badge-muted">Excluded</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receivables Section */}
      <div className="sub-section">
        <div className="sub-section-header">
          <div className="sub-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#038c99"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <h3>Receivables</h3>
            <span className="badge badge-info">{receivables.length} Total</span>
            {receivablesTotals.openCount > 0 && (
              <span className="badge badge-warning">{receivablesTotals.openCount} Open</span>
            )}
          </div>

          <div className="sub-section-actions">
            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-tab ${receivablesFilter === "all" ? "active" : ""}`}
                onClick={() => setReceivablesFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-tab ${receivablesFilter === "open" ? "active" : ""}`}
                onClick={() => setReceivablesFilter("open")}
              >
                Open
              </button>
              <button
                type="button"
                className={`filter-tab ${receivablesFilter === "paid" ? "active" : ""}`}
                onClick={() => setReceivablesFilter("paid")}
              >
                Paid
              </button>
            </div>

            {/* Search */}
            <div className="search-field">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search receivables..."
                value={receivablesSearch}
                onChange={(e) => setReceivablesSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="scoped-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Document No.</th>
                <th>Counterparty</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th className="numeric">Original Amount</th>
                <th className="numeric">Outstanding Amount</th>
                <th>Status</th>
                <th>Paid Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceivables.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data-notice">
                    No receivables found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReceivables.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="id-tag">{r.id}</span>
                    </td>
                    <td className="strong">{r.documentNumber}</td>
                    <td>{r.counterparty}</td>
                    <td>{formatDate(r.issueDate)}</td>
                    <td>{formatDate(r.dueDate)}</td>
                    <td className="numeric">{formatCents(r.originalAmountCents, r.currency || currency)}</td>
                    <td className="numeric strong" style={{ color: r.outstandingAmountCents > 0 ? "#b45309" : "#15803d" }}>
                      {formatCents(r.outstandingAmountCents, r.currency || currency)}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.paidDate ? formatDate(r.paidDate) : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredReceivables.length > 0 && (
              <tfoot>
                <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                  <td colSpan="5">Total</td>
                  <td className="numeric">
                    {formatCents(
                      filteredReceivables.reduce((s, r) => s + (r.originalAmountCents || 0), 0),
                      currency
                    )}
                  </td>
                  <td className="numeric">
                    {formatCents(
                      filteredReceivables.reduce((s, r) => s + (r.outstandingAmountCents || 0), 0),
                      currency
                    )}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Payables Section */}
      <div className="sub-section">
        <div className="sub-section-header">
          <div className="sub-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#038c99"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <h3>Payables</h3>
            <span className="badge badge-info">{payables.length} Total</span>
            {payablesTotals.openCount > 0 && (
              <span className="badge badge-warning">{payablesTotals.openCount} Open</span>
            )}
          </div>

          <div className="sub-section-actions">
            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-tab ${payablesFilter === "all" ? "active" : ""}`}
                onClick={() => setPayablesFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-tab ${payablesFilter === "open" ? "active" : ""}`}
                onClick={() => setPayablesFilter("open")}
              >
                Open
              </button>
              <button
                type="button"
                className={`filter-tab ${payablesFilter === "paid" ? "active" : ""}`}
                onClick={() => setPayablesFilter("paid")}
              >
                Paid
              </button>
            </div>

            {/* Search */}
            <div className="search-field">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search payables..."
                value={payablesSearch}
                onChange={(e) => setPayablesSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="scoped-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Document No.</th>
                <th>Counterparty</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th className="numeric">Original Amount</th>
                <th className="numeric">Outstanding Amount</th>
                <th>Status</th>
                <th>Paid Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayables.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data-notice">
                    No payables found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayables.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="id-tag">{p.id}</span>
                    </td>
                    <td className="strong">{p.documentNumber}</td>
                    <td>{p.counterparty}</td>
                    <td>{formatDate(p.issueDate)}</td>
                    <td>{formatDate(p.dueDate)}</td>
                    <td className="numeric">{formatCents(p.originalAmountCents, p.currency || currency)}</td>
                    <td className="numeric strong" style={{ color: p.outstandingAmountCents > 0 ? "#b45309" : "#15803d" }}>
                      {formatCents(p.outstandingAmountCents, p.currency || currency)}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.paidDate ? formatDate(p.paidDate) : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredPayables.length > 0 && (
              <tfoot>
                <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                  <td colSpan="5">Total</td>
                  <td className="numeric">
                    {formatCents(
                      filteredPayables.reduce((s, p) => s + (p.originalAmountCents || 0), 0),
                      currency
                    )}
                  </td>
                  <td className="numeric">
                    {formatCents(
                      filteredPayables.reduce((s, p) => s + (p.outstandingAmountCents || 0), 0),
                      currency
                    )}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Inventory Valuation */}
      <div className="sub-section">
        <div className="sub-section-header">
          <div className="sub-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#038c99"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <h3>Inventory Valuation</h3>
          </div>
          <span className={`badge ${getStatusBadgeClass(inventoryValuation.status)}`}>
            {inventoryValuation.status || "not-approved"}
          </span>
        </div>

        <div className="valuation-box">
          <div className="valuation-left">
            <div>
              <p className="valuation-reason">
                <strong>Reason:</strong> {inventoryValuation.reason}
              </p>
            </div>
          </div>
          <div>
            <span className="meta-chip">
              valueCents: <strong>{inventoryValuation.valueCents !== null && inventoryValuation.valueCents !== undefined ? formatCents(inventoryValuation.valueCents, currency) : "null"}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}


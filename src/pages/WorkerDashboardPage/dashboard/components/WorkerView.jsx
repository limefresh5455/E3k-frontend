import React, { useState, useMemo } from "react";
import {
  formatDate,
  formatNumber,
  lookupCustomerName,
  lookupArticleName,
  lookupArticleCode,
  getStatusBadgeClass,
  getDocTypeBadgeClass,
} from "../utils/dashboardUtils";

export default function WorkerView({ data }) {
  const [articlesSearch, setArticlesSearch] = useState("");
  const [productGroupFilter, setProductGroupFilter] = useState("all");

  const [docsSearch, setDocsSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("all");
  const [docStatusFilter, setDocStatusFilter] = useState("all");

  const [salesSearch, setSalesSearch] = useState("");
  const [movementsSearch, setMovementsSearch] = useState("");
  const [customersSearch, setCustomersSearch] = useState("");

  if (!data) {
    return (
      <div className="scoped-view-panel">
        <div className="no-data-notice">No worker data available.</div>
      </div>
    );
  }

  const {
    company = {},
    source = {},
    customers = [],
    articles = [],
    documents = [],
    salesQuantities = [],
    warehouseMovements = [],
  } = data;

  // Extract unique product groups
  const productGroups = useMemo(() => {
    const groups = new Set();
    articles.forEach((a) => {
      if (a.productGroup) groups.add(a.productGroup);
    });
    return Array.from(groups);
  }, [articles]);

  // Extract unique document types
  const docTypes = useMemo(() => {
    const types = new Set();
    documents.forEach((d) => {
      if (d.type) types.add(d.type);
    });
    return Array.from(types);
  }, [documents]);


  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const matchesGroup =
        productGroupFilter === "all" ||
        (item.productGroup || "").toLowerCase() === productGroupFilter.toLowerCase();
      const q = articlesSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.name || "").toLowerCase().includes(q) ||
        (item.code || "").toLowerCase().includes(q) ||
        (item.id || "").toLowerCase().includes(q) ||
        (item.productGroup || "").toLowerCase().includes(q);
      return matchesGroup && matchesSearch;
    });
  }, [articles, productGroupFilter, articlesSearch]);

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesType =
        docTypeFilter === "all" ||
        (doc.type || "").toLowerCase() === docTypeFilter.toLowerCase();
      const matchesStatus =
        docStatusFilter === "all" ||
        (doc.status || "").toLowerCase() === docStatusFilter.toLowerCase();
      const custName = lookupCustomerName(doc.customerId, customers).toLowerCase();
      const q = docsSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (doc.number || "").toLowerCase().includes(q) ||
        (doc.id || "").toLowerCase().includes(q) ||
        custName.includes(q);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [documents, docTypeFilter, docStatusFilter, docsSearch, customers]);

  // Filtered Sales Quantities
  const filteredSales = useMemo(() => {
    return salesQuantities.filter((item) => {
      const q = salesSearch.toLowerCase().trim();
      if (!q) return true;
      const artName = lookupArticleName(item.articleId, articles).toLowerCase();
      const artCode = lookupArticleCode(item.articleId, articles).toLowerCase();
      const custName = lookupCustomerName(item.customerId, customers).toLowerCase();
      const dateStr = (item.date || "").toLowerCase();
      const docId = (item.documentId || "").toLowerCase();
      return (
        artName.includes(q) ||
        artCode.includes(q) ||
        custName.includes(q) ||
        dateStr.includes(q) ||
        docId.includes(q)
      );
    });
  }, [salesQuantities, salesSearch, articles, customers]);

  // Filtered Warehouse Movements
  const filteredMovements = useMemo(() => {
    return warehouseMovements.filter((m) => {
      const q = movementsSearch.toLowerCase().trim();
      if (!q) return true;
      const artName = lookupArticleName(m.articleId, articles).toLowerCase();
      const artCode = lookupArticleCode(m.articleId, articles).toLowerCase();
      const wh = (m.warehouse || "").toLowerCase();
      const dateStr = (m.date || "").toLowerCase();
      const docId = (m.documentId || "").toLowerCase();
      return (
        artName.includes(q) ||
        artCode.includes(q) ||
        wh.includes(q) ||
        dateStr.includes(q) ||
        docId.includes(q)
      );
    });
  }, [warehouseMovements, movementsSearch, articles]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = customersSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.code || "").toLowerCase().includes(q) ||
        (c.id || "").toLowerCase().includes(q)
      );
    });
  }, [customers, customersSearch]);

  return (
    <section className="scoped-view-panel" id="worker-view-section">
      {/* Header */}
      <div className="view-header">
        <div className="view-header-title">
          <div className="view-icon-badge worker">
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
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div>
            <h2>Worker Overview — {company.name}</h2>
            <p>Inventory, customer documents, warehouse movements & sales quantities</p>
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
            History From: <strong>{source.historyFrom || "—"}</strong>
          </span>
          <span className="meta-chip">
            As Of: <strong>{formatDate(source.asOf)}</strong>
          </span>
          <span className="badge badge-muted">{source.status || "sample-only"}</span>
        </div>
      </div>


      {/* Articles & Stock Management Section */}
      <div className="sub-section">
        <div className="sub-section-header">
          <div className="sub-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <h3>Articles</h3>
            <span className="badge badge-info">{articles.length} Items</span>
          </div>

          <div className="sub-section-actions">
            {/* Product Group Filter */}
            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-tab ${productGroupFilter === "all" ? "active" : ""}`}
                onClick={() => setProductGroupFilter("all")}
              >
                All Groups
              </button>
              {productGroups.map((pg) => (
                <button
                  key={pg}
                  type="button"
                  className={`filter-tab ${productGroupFilter === pg ? "active" : ""}`}
                  onClick={() => setProductGroupFilter(pg)}
                >
                  {pg}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="search-field">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search articles by code, name..."
                value={articlesSearch}
                onChange={(e) => setArticlesSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="scoped-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Product Group</th>
                <th>Unit</th>
                <th className="numeric">Current Stock</th>
                <th className="numeric">Min Stock</th>
                <th className="numeric">Ordered Qty</th>
                <th className="numeric">Reserved Qty</th>
                <th className="numeric">Available</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data-notice">
                    No articles found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => {
                  const availableStock = (art.currentStock ?? 0) - (art.reservedQty ?? 0);
                  return (
                    <tr key={art.id}>
                      <td>
                        <span className="id-tag">{art.id}</span>
                      </td>
                      <td className="strong">{art.code}</td>
                      <td>{art.name}</td>
                      <td>
                        <span className="badge badge-muted">{art.productGroup}</span>
                      </td>
                      <td>{art.unit}</td>
                      <td className="numeric strong">{formatNumber(art.currentStock)}</td>
                      <td className="numeric">{formatNumber(art.minStock)}</td>
                      <td className="numeric">{formatNumber(art.orderedQty)}</td>
                      <td className="numeric">{formatNumber(art.reservedQty)}</td>
                      <td className="numeric strong" style={{ color: availableStock < 0 ? "#b91c1c" : "#1e293b" }}>
                        {formatNumber(availableStock)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents Section */}
      <div className="sub-section">
        <div className="sub-section-header">
          <div className="sub-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h3>Documents</h3>
            <span className="badge badge-info">{documents.length} Total</span>
          </div>

          <div className="sub-section-actions">
            {/* Type Filters */}
            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-tab ${docTypeFilter === "all" ? "active" : ""}`}
                onClick={() => setDocTypeFilter("all")}
              >
                All Types
              </button>
              {docTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`filter-tab ${docTypeFilter === t ? "active" : ""}`}
                  onClick={() => setDocTypeFilter(t)}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-tab ${docStatusFilter === "all" ? "active" : ""}`}
                onClick={() => setDocStatusFilter("all")}
              >
                All Status
              </button>
              <button
                type="button"
                className={`filter-tab ${docStatusFilter === "open" ? "active" : ""}`}
                onClick={() => setDocStatusFilter("open")}
              >
                Open
              </button>
              <button
                type="button"
                className={`filter-tab ${docStatusFilter === "completed" ? "active" : ""}`}
                onClick={() => setDocStatusFilter("completed")}
              >
                Completed
              </button>
              <button
                type="button"
                className={`filter-tab ${docStatusFilter === "issued" ? "active" : ""}`}
                onClick={() => setDocStatusFilter("issued")}
              >
                Issued
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
                placeholder="Search documents..."
                value={docsSearch}
                onChange={(e) => setDocsSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="scoped-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Document Number</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Status</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-notice">
                    No documents found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <span className="id-tag">{doc.id}</span>
                    </td>
                    <td>
                      <span className={`badge ${getDocTypeBadgeClass(doc.type)}`}>
                        {doc.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="strong">{doc.number}</td>
                    <td>{formatDate(doc.date)}</td>
                    <td>
                      <div>
                        <strong>{lookupCustomerName(doc.customerId, customers)}</strong>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          ID: {doc.customerId}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      {doc.pdfUrl ? (
                        <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="id-tag">
                          View PDF
                        </a>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>null (N/A)</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warehouse Movements */}
      <div className="sub-section">
        <div className="sub-section-header">
          <div className="sub-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <h3>Warehouse Movements</h3>
            <span className="badge badge-info">{warehouseMovements.length} Logged</span>
          </div>

          <div className="search-field">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search movements..."
              value={movementsSearch}
              onChange={(e) => setMovementsSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="scoped-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Article</th>
                <th>Warehouse</th>
                <th className="numeric">In Qty</th>
                <th className="numeric">Out Qty</th>
                <th>Unit</th>
                <th>Document ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data-notice">
                    No warehouse movements found.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className="id-tag">{m.id}</span>
                    </td>
                    <td>{formatDate(m.date)}</td>
                    <td>
                      <strong>{lookupArticleName(m.articleId, articles)}</strong>
                      <span className="id-tag" style={{ marginLeft: "6px" }}>
                        {m.articleId}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-muted">{m.warehouse}</span>
                    </td>
                    <td className="numeric strong" style={{ color: m.inQty > 0 ? "#15803d" : "#64748b" }}>
                      {m.inQty > 0 ? `+${formatNumber(m.inQty)}` : formatNumber(m.inQty)}
                    </td>
                    <td className="numeric strong" style={{ color: m.outQty > 0 ? "#b91c1c" : "#64748b" }}>
                      {m.outQty > 0 ? `-${formatNumber(m.outQty)}` : formatNumber(m.outQty)}
                    </td>
                    <td>{m.unit}</td>
                    <td>
                      {m.documentId ? <span className="id-tag">{m.documentId}</span> : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Quantities Section */}
      <div className="sub-section">
        <div className="sub-section-header">
          <div className="sub-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <h3>Sales Quantities</h3>
            <span className="badge badge-info">{salesQuantities.length} Records</span>
          </div>

          <div className="search-field">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search sales by article, customer, date..."
              value={salesSearch}
              onChange={(e) => setSalesSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="scoped-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Article</th>
                <th>Customer</th>
                <th className="numeric">Quantity</th>
                <th>Unit</th>
                <th>Document ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-notice">
                    No sales records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sq, idx) => (
                  <tr key={`${sq.date}-${sq.articleId}-${sq.customerId}-${idx}`}>
                    <td className="strong">{formatDate(sq.date)}</td>
                    <td>
                      <strong>{lookupArticleName(sq.articleId, articles)}</strong>
                      <span className="id-tag" style={{ marginLeft: "6px" }}>
                        {lookupArticleCode(sq.articleId, articles) || sq.articleId}
                      </span>
                    </td>
                    <td>
                      <strong>{lookupCustomerName(sq.customerId, customers)}</strong>
                      <span className="id-tag" style={{ marginLeft: "6px" }}>
                        {sq.customerId}
                      </span>
                    </td>
                    <td className="numeric strong">{formatNumber(sq.quantity)}</td>
                    <td>{sq.unit}</td>
                    <td>
                      {sq.documentId ? <span className="id-tag">{sq.documentId}</span> : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customers Directory */}
      <div className="sub-section">
        <div className="sub-section-header">
          <div className="sub-section-title">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3>Customer</h3>
            <span className="badge badge-info">{customers.length} Accounts</span>
          </div>

          <div className="search-field">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search customers..."
              value={customersSearch}
              onChange={(e) => setCustomersSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="scoped-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer Code</th>
                <th>Customer Name</th>
                <th className="numeric">Associated Documents</th>
                <th className="numeric">Sales Records</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data-notice">
                    No customers found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const docCount = documents.filter((d) => d.customerId === c.id).length;
                  const salesCount = salesQuantities.filter((s) => s.customerId === c.id).length;
                  return (
                    <tr key={c.id}>
                      <td>
                        <span className="id-tag">{c.id}</span>
                      </td>
                      <td className="strong">{c.code}</td>
                      <td className="strong">{c.name}</td>
                      <td className="numeric">{docCount}</td>
                      <td className="numeric">{salesCount}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}


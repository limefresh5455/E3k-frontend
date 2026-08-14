import React, { useState, useEffect } from "react";
import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";
import { getSuppliers } from "../../services";
import CreateSupplierModal from "../CreateSupplierModal/CreateSupplierModal";
import SupplierDetailModal from "../SupplierDetailModal/SupplierDetailModal";
import UploadExcelModal from "../UploadExcelModal/UploadExcelModal";
import "./SuppliersModal.css";

export function SuppliersModal({ onClose }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadExcelModal, setShowUploadExcelModal] = useState(false);
  const [selectedSupplierNumber, setSelectedSupplierNumber] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await getSuppliers();
      const list =
        data?.items ||
        data?.data?.items ||
        (Array.isArray(data) ? data : data?.data) ||
        [];
      setSuppliers(list);
    } catch (err) {
      setError(err.message || "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((supplier) => {
    if (!searchQuery) return true;
    const isStr = typeof supplier === "string";
    const name = isStr
      ? supplier
      : supplier.name || supplier.supplier_name || "";
    const number = isStr ? "" : supplier.supplier_number || "";
    const lowerQuery = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(lowerQuery) ||
      number.toLowerCase().includes(lowerQuery)
    );
  });

  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE) || 1;
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="suppliers-overlay">
      <div className="suppliers-dialog">
        <div className="suppliers-header">
          <h2 className="suppliers-title">Available Suppliers</h2>
          <button onClick={onClose} className="suppliers-close-btn">
            <Icon.Close />
          </button>
        </div>

        <div className="suppliers-body">
          {error && <div className="suppliers-error">{error}</div>}

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              <Spinner size={32} />
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Search by name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    fontSize: "0.85rem",
                    outline: "none",
                    width: "300px",
                  }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowUploadExcelModal(true)}
                    style={{
                      background: "#fff",
                      color: "#0f172a",
                      border: "1px solid #cbd5e1",
                      borderRadius: "0.375rem",
                      padding: "0.375rem 0.75rem",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                    }}
                  >
                    <div style={{ width: "12px", height: "12px", display: "flex", alignItems: "center" }}>
                      <Icon.Upload />
                    </div>
                    Upload Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      background: "#3b82f6",
                      color: "#fff",
                      border: "1px solid #2563eb",
                      borderRadius: "0.375rem",
                      padding: "0.375rem 0.75rem",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                    }}
                  >
                    <div style={{ width: "12px", height: "12px" }}>
                      <Icon.Building />
                    </div>
                    Add Supplier
                  </button>
                </div>
              </div>

              {filteredSuppliers.length === 0 && !error ? (
                <div className="suppliers-empty">No suppliers found.</div>
              ) : (
                <div className="suppliers-table-wrapper">
                  <table className="suppliers-table">
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th className="suppliers-th suppliers-th-center">
                          No.
                        </th>
                        <th className="suppliers-th suppliers-th-left">Name</th>
                        <th className="suppliers-th suppliers-th-center">
                          Code 1
                        </th>
                        <th className="suppliers-th suppliers-th-center">
                          Code 2
                        </th>
                        <th className="suppliers-th suppliers-th-center">
                          Code 3
                        </th>
                        <th className="suppliers-th suppliers-th-center">
                          Code 4
                        </th>
                        <th className="suppliers-th suppliers-th-center">
                          Addresses
                        </th>
                        <th className="suppliers-th suppliers-th-center">
                          Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSuppliers.map((supplier, idx) => {
                        const isStr = typeof supplier === "string";
                        const rowClass =
                          idx % 2 === 0
                            ? "suppliers-tr-even"
                            : "suppliers-tr-odd";
                        return (
                          <tr
                            key={supplier.id || supplier.supplier_number || idx}
                            className={`suppliers-tr ${rowClass}`}
                            onClick={() => {
                              const num = isStr
                                ? supplier
                                : supplier.supplier_number;
                              if (num) setSelectedSupplierNumber(num);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <td className="suppliers-td suppliers-td-center">
                              {isStr ? "-" : supplier.supplier_number || "-"}
                            </td>
                            <td className="suppliers-td suppliers-td-left suppliers-td-bold">
                              {isStr
                                ? supplier
                                : supplier.name ||
                                supplier.supplier_name ||
                                "Unknown"}
                            </td>
                            <td className="suppliers-td suppliers-td-center">
                              {isStr
                                ? "-"
                                : supplier.code_1 || (
                                  <span className="text-muted">-</span>
                                )}
                            </td>
                            <td className="suppliers-td suppliers-td-center">
                              {isStr
                                ? "-"
                                : supplier.code_2 || (
                                  <span className="text-muted">-</span>
                                )}
                            </td>
                            <td className="suppliers-td suppliers-td-center">
                              {isStr
                                ? "-"
                                : supplier.code_3 || (
                                  <span className="text-muted">-</span>
                                )}
                            </td>
                            <td className="suppliers-td suppliers-td-center">
                              {isStr
                                ? "-"
                                : supplier.code_4 || (
                                  <span className="text-muted">-</span>
                                )}
                            </td>
                            <td className="suppliers-td suppliers-td-center">
                              {isStr ? "-" : supplier.address_count || 0}
                            </td>
                            <td className="suppliers-td suppliers-td-center">
                              {isStr || !supplier.updated_at
                                ? "-"
                                : new Date(
                                  supplier.updated_at,
                                ).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredSuppliers.length > ITEMS_PER_PAGE && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "1rem",
                    padding: "0 0.5rem",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      style={{
                        padding: "0.375rem 0.75rem",
                        border: "1px solid #e2e8f0",
                        background: currentPage === 1 ? "#f8fafc" : "#fff",
                        color: currentPage === 1 ? "#94a3b8" : "#0f172a",
                        borderRadius: "0.375rem",
                        fontSize: "0.8rem",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      style={{
                        padding: "0.375rem 0.75rem",
                        border: "1px solid #2563eb",
                        background: "#3b82f6",
                        color: "#fff",
                        borderRadius: "0.375rem",
                        fontSize: "0.8rem",
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {showUploadExcelModal && (
          <UploadExcelModal
            onClose={() => setShowUploadExcelModal(false)}
            onSuccess={() => {
              setShowUploadExcelModal(false);
              fetchSuppliers();
            }}
          />
        )}
        {showCreateModal && (
          <CreateSupplierModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchSuppliers();
            }}
          />
        )}
        {selectedSupplierNumber && (
          <SupplierDetailModal
            supplierNumber={selectedSupplierNumber}
            onClose={() => setSelectedSupplierNumber(null)}
            onSuccess={() => fetchSuppliers()}
          />
        )}
      </div>
    </div>
  );
}

export default SuppliersModal;

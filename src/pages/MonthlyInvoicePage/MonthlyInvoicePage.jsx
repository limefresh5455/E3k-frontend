import React, { useState } from "react";
import { PublicTabs } from "../../components";
import { uploadMonthlyInvoicePdf } from "../../services";
import "./MonthlyInvoicePage.css";

export function MonthlyInvoicePage({ onOpenLogin }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }

    setLoading(true);
    try {
      const { blob, filename } = await uploadMonthlyInvoicePdf(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSuccess(`Generated successfully: ${filename}`);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-page-container">
      <div className="invoice-card">
        <PublicTabs
          active="monthly-invoice"
          onSelect={(tab) => {
            if (tab === "login") onOpenLogin();
          }}
        />

        <div className="invoice-header">
          <h1 className="invoice-title">Monthly Invoice</h1>
          <p className="invoice-subtitle">
            Upload a source PDF and download the generated invoice PDF.
          </p>
        </div>

        <form onSubmit={onSubmit} className="invoice-form">
          <label className="invoice-label">PDF File</label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="invoice-file-input"
          />

          {error && <div className="invoice-error-msg">{error}</div>}
          {success && <div className="invoice-success-msg">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="invoice-submit-btn"
          >
            {loading ? "Generating PDF..." : "Upload & Generate PDF"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MonthlyInvoicePage;

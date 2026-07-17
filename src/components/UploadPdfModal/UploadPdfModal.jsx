import React, { useState } from "react";
import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";
import { uploadPdf } from "../../services";
import "./UploadPdfModal.css";

export function UploadPdfModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await uploadPdf(file);
      setResult(data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-overlay">
      <div className="upload-dialog">
        <div className="upload-header">
          <h2 className="upload-title">Upload PDF</h2>
          <button onClick={onClose} className="upload-close-btn">
            <Icon.Close />
          </button>
        </div>

        <div className="upload-body">
          {!result ? (
            <>
              <div
                className="upload-dropzone"
                onClick={() =>
                  document.getElementById("upload-pdf-input").click()
                }
              >
                <div className="upload-dropzone-icon">
                  <Icon.Upload />
                </div>
                <p className="upload-dropzone-title">
                  {file ? file.name : "Click to choose a PDF"}
                </p>
                <p className="upload-dropzone-subtitle">
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : "Only .pdf files accepted"}
                </p>
                <input
                  id="upload-pdf-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setError("");
                  }}
                />
              </div>

              {error && <div className="upload-error">{error}</div>}

              <div className="upload-actions">
                <button onClick={onClose} className="upload-cancel-btn">
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="upload-submit-btn"
                >
                  {loading ? (
                    <>
                      <Spinner size={16} /> Uploading…
                    </>
                  ) : (
                    "Upload PDF"
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="upload-success-container">
                <div className="upload-success-header">
                  <div className="upload-success-icon">
                    <Icon.CheckCircle />
                  </div>
                  <span className="upload-success-title">
                    Upload Successful
                  </span>
                </div>
                {result.erp_record_id && (
                  <div className="upload-success-item">
                    <span className="upload-success-label">ERP Record ID</span>
                    <span className="upload-success-value">
                      {result.erp_record_id}
                    </span>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="sync-confirm-btn">
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadPdfModal;

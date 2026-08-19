import React, { useState } from "react";
import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";
import { uploadExcelSuppliers } from "../../services";
import "./UploadExcelModal.css";

export function UploadExcelModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose an Excel file.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await uploadExcelSuppliers(file);
      setResult(data);

    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-excel-overlay">
      <div className="upload-excel-dialog">
        <div className="upload-excel-header">
          <h2 className="upload-excel-title">Upload Excel</h2>
          <button onClick={onClose} className="upload-excel-close-btn">
            <Icon.Close />
          </button>
        </div>

        <div className="upload-excel-body">
          {!result ? (
            <>
              <div
                className="upload-excel-dropzone"
                onClick={() =>
                  document.getElementById("upload-excel-input").click()
                }
              >
                <div className="upload-excel-dropzone-icon">
                  <Icon.Upload />
                </div>
                <p className="upload-excel-dropzone-title">
                  {file ? file.name : "Click to choose an Excel file"}
                </p>
                <p className="upload-excel-dropzone-subtitle">
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : "Only .xlsx and .xls files accepted"}
                </p>
                <input
                  id="upload-excel-input"
                  type="file"
                  accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setError("");
                  }}
                />
              </div>

              {error && <div className="upload-excel-error">{error}</div>}

              <div className="upload-excel-actions">
                <button onClick={onClose} className="upload-excel-cancel-btn">
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="upload-excel-submit-btn"
                >
                  {loading ? (
                    <>
                      <Spinner size={16} /> Uploading…
                    </>
                  ) : (
                    "Upload Excel"
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="upload-excel-success-container">
                <div className="upload-excel-success-header">
                  <div className="upload-excel-success-icon">
                    <Icon.CheckCircle />
                  </div>
                  <h3 className="upload-excel-success-title">Success</h3>
                  <p className="upload-excel-success-subtitle">
                    {result?.message || result?.data?.message || "Excel file uploaded successfully!"}
                  </p>
                </div>
                <button
                  className="upload-excel-success-btn"
                  onClick={() => {
                    if (onSuccess) onSuccess();
                    else onClose();
                  }}
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadExcelModal;

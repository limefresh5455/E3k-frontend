import React, { useState, useEffect } from "react";
import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";
import { getSupplier, updateSupplier } from "../../services";
import "../CreateSupplierModal/CreateSupplierModal.css";

export function SupplierDetailModal({ supplierNumber, onClose, onSuccess }) {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const data = await getSupplier(supplierNumber);
        const supp = data?.data || data;
        setSupplier(supp);
        initializeFormData(supp);
      } catch (err) {
        setError(err.message || "Failed to load supplier details.");
      } finally {
        setLoading(false);
      }
    };
    if (supplierNumber) {
      fetchSupplier();
    }
  }, [supplierNumber]);

  const initializeFormData = (supp) => {
    const addr = supp.addresses?.[0] || {};
    setFormData({
      name: supp.name || "",
      supplier_number: supp.supplier_number || "",
      code_1: supp.code_1 || "",
      code_2: supp.code_2 || "",
      code_3: supp.code_3 || "",
      code_4: supp.code_4 || "",
      department_attention: addr.department_attention || "",
      street: addr.street || "",
      postal_code: addr.postal_code || "",
      city: addr.city || "",
      country: addr.country || "",
      business_phone: addr.business_phone || "",
      private_phone: addr.private_phone || "",
      mobile: addr.mobile || "",
      fax: addr.fax || "",
      email: addr.email || "",
      address_id: addr.id || null,
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    initializeFormData(supplier);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: formData.name,
      supplier_number: formData.supplier_number,
      code_1: formData.code_1,
      code_2: formData.code_2,
      code_3: formData.code_3,
      code_4: formData.code_4,
      addresses: [
        {
          id: formData.address_id,
          department_attention: formData.department_attention,
          street: formData.street,
          postal_code: formData.postal_code,
          city: formData.city,
          country: formData.country,
          business_phone: formData.business_phone,
          private_phone: formData.private_phone,
          mobile: formData.mobile,
          fax: formData.fax,
          email: formData.email,
        },
      ],
    };

    try {
      const data = await updateSupplier(supplierNumber, payload);
      const supp = data?.data || data;
      setSupplier(supp);
      initializeFormData(supp);
      setIsEditing(false);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || "Failed to update supplier.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-supplier-overlay">
      <div className="create-supplier-dialog">
        <div className="create-supplier-header">
          <h2 className="create-supplier-title">
            {isEditing ? "Edit Supplier" : "Supplier Details"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="suppliers-close-btn"
            disabled={loading || saving}
          >
            <Icon.Close />
          </button>
        </div>

        <div className="create-supplier-body">
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
          ) : error && !isEditing ? (
            <div className="create-supplier-error">{error}</div>
          ) : supplier ? (
            <form id="supplier-detail-form" onSubmit={handleSave}>
              {error && isEditing && (
                <div className="create-supplier-error">{error}</div>
              )}

              <h3 className="create-supplier-section-title">General Info</h3>
              <div className="create-supplier-form-grid">
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">
                    Name{isEditing && <span style={{ color: "red" }}>*</span>}
                  </label>
                  {isEditing ? (
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="create-supplier-input"
                      required
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {supplier.name || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">
                    Supplier Number
                    {isEditing && <span style={{ color: "red" }}>*</span>}
                  </label>
                  {isEditing ? (
                    <input
                      name="supplier_number"
                      value={formData.supplier_number}
                      onChange={handleChange}
                      className="create-supplier-input"
                      required
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {supplier.supplier_number || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">Code 1</label>
                  {isEditing ? (
                    <input
                      name="code_1"
                      value={formData.code_1}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {supplier.code_1 || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">Code 2</label>
                  {isEditing ? (
                    <input
                      name="code_2"
                      value={formData.code_2}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {supplier.code_2 || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">Code 3</label>
                  {isEditing ? (
                    <input
                      name="code_3"
                      value={formData.code_3}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {supplier.code_3 || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">Code 4</label>
                  {isEditing ? (
                    <input
                      name="code_4"
                      value={formData.code_4}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {supplier.code_4 || "—"}
                    </div>
                  )}
                </div>
              </div>

              <h3 className="create-supplier-section-title">
                Address & Contact
              </h3>
              <div
                className="create-supplier-form-grid"
                style={{ marginBottom: "1.5rem" }}
              >
                <div
                  className="create-supplier-form-group"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <label className="create-supplier-label">
                    Department / Attention
                  </label>
                  {isEditing ? (
                    <input
                      name="department_attention"
                      value={formData.department_attention}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formData.department_attention || "—"}
                    </div>
                  )}
                </div>
                <div
                  className="create-supplier-form-group"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <label className="create-supplier-label">
                    Street{isEditing && <span style={{ color: "red" }}>*</span>}
                  </label>
                  {isEditing ? (
                    <input
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      className="create-supplier-input"
                      required
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formData.street || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">
                    Postal Code
                    {isEditing && <span style={{ color: "red" }}>*</span>}
                  </label>
                  {isEditing ? (
                    <input
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="create-supplier-input"
                      required
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formData.postal_code || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">
                    City{isEditing && <span style={{ color: "red" }}>*</span>}
                  </label>
                  {isEditing ? (
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="create-supplier-input"
                      required
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formData.city || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">Country</label>
                  {isEditing ? (
                    <input
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formData.country || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formData.email || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">
                    Business Phone
                  </label>
                  {isEditing ? (
                    <input
                      name="business_phone"
                      value={formData.business_phone}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formData.business_phone || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">Mobile</label>
                  {isEditing ? (
                    <input
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formData.mobile || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">Private Phone</label>
                  {isEditing ? (
                    <input
                      name="private_phone"
                      value={formData.private_phone}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formData.private_phone || "—"}
                    </div>
                  )}
                </div>
                <div className="create-supplier-form-group">
                  <label className="create-supplier-label">Fax</label>
                  {isEditing ? (
                    <input
                      name="fax"
                      value={formData.fax}
                      onChange={handleChange}
                      className="create-supplier-input"
                      disabled={saving}
                    />
                  ) : (
                    <div
                      className="create-supplier-input"
                      style={{
                        background: "#f8fafc",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formData.fax || "—"}
                    </div>
                  )}
                </div>
              </div>
            </form>
          ) : null}
        </div>

        <div className="create-supplier-footer">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="create-supplier-cancel-btn"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="supplier-detail-form"
                className="create-supplier-submit-btn"
                disabled={saving}
              >
                {saving ? <Spinner size={16} /> : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="create-supplier-submit-btn"
              style={{ padding: "0.5rem 1.5rem" }}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplierDetailModal;

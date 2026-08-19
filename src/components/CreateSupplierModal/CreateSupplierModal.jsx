import React, { useState } from "react";
import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";
import { createSupplier } from "../../services";
import "./CreateSupplierModal.css";

export function CreateSupplierModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    supplier_number: "",
    name: "",
    code_1: "",
    code_2: "",
    code_3: "",
    code_4: "",
    department_attention: "",
    street: "",
    postal_code: "",
    city: "",
    country: "",
    business_phone: "",
    private_phone: "",
    mobile: "",
    fax: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Name is required.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      supplier_number: formData.supplier_number,
      name: formData.name,
      code_1: formData.code_1,
      code_2: formData.code_2,
      code_3: formData.code_3,
      code_4: formData.code_4,
      addresses: [
        {
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
      await createSupplier(payload);
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to create supplier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-supplier-overlay">
      <div className="create-supplier-dialog">
        <div className="create-supplier-header">
          <h2 className="create-supplier-title">Add New Supplier</h2>
          <button
            type="button"
            onClick={onClose}
            className="suppliers-close-btn"
            disabled={loading}
          >
            <Icon.Close />
          </button>
        </div>

        <div className="create-supplier-body">
          {error && <div className="create-supplier-error">{error}</div>}

          <form id="create-supplier-form" onSubmit={handleSubmit}>
            <h3 className="create-supplier-section-title">General Info</h3>
            <div className="create-supplier-form-grid">
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">
                  Name<span style={{ color: "red" }}>*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="create-supplier-input"
                  required
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">
                  Supplier Number<span style={{ color: "red" }}>*</span>
                </label>
                <input
                  name="supplier_number"
                  value={formData.supplier_number}
                  onChange={handleChange}
                  className="create-supplier-input"
                  required
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">Code 1</label>
                <input
                  name="code_1"
                  value={formData.code_1}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">Code 2</label>
                <input
                  name="code_2"
                  value={formData.code_2}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">Code 3</label>
                <input
                  name="code_3"
                  value={formData.code_3}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">Code 4</label>
                <input
                  name="code_4"
                  value={formData.code_4}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
            </div>

            <h3 className="create-supplier-section-title">Address & Contact</h3>
            <div className="create-supplier-form-grid">
              <div
                className="create-supplier-form-group"
                style={{ gridColumn: "1 / -1" }}
              >
                <label className="create-supplier-label">
                  Department / Attention
                </label>
                <input
                  name="department_attention"
                  value={formData.department_attention}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
              <div
                className="create-supplier-form-group"
                style={{ gridColumn: "1 / -1" }}
              >
                <label className="create-supplier-label">
                  Street<span style={{ color: "red" }}>*</span>
                </label>
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="create-supplier-input"
                  required
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">
                  Postal Code<span style={{ color: "red" }}>*</span>
                </label>
                <input
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="create-supplier-input"
                  required
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">
                  City<span style={{ color: "red" }}>*</span>
                </label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="create-supplier-input"
                  required
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">Business Phone</label>
                <input
                  name="business_phone"
                  value={formData.business_phone}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">Mobile</label>
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">Private Phone</label>
                <input
                  name="private_phone"
                  value={formData.private_phone}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
              <div className="create-supplier-form-group">
                <label className="create-supplier-label">Fax</label>
                <input
                  name="fax"
                  value={formData.fax}
                  onChange={handleChange}
                  className="create-supplier-input"
                  disabled={loading}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="create-supplier-footer">
          <button
            type="button"
            onClick={onClose}
            className="create-supplier-cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-supplier-form"
            className="create-supplier-submit-btn"
            disabled={loading}
          >
            {loading ? <Spinner size={16} /> : "Save Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateSupplierModal;

import axios from "axios";
import { RAW_API, API_BASE } from "../constants/apiEndpoints";

export const uploadMonthlyInvoicePdf = async (file) => {
  const token = localStorage.getItem("token");
  const body = new FormData();
  body.append("file", file);

  const endpoints = [
    `${API_BASE}/invoice/parse-groups`,
    `${API_BASE}/api/invoice/parse-groups`,
    `${RAW_API}/invoice/parse-groups`,
    `${RAW_API}/api/invoice/parse-groups`,
  ];

  let lastErr = null;
  for (const url of endpoints) {
    try {
      const res = await axios.post(url, body, {
        responseType: "blob",
        headers: {
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const blob = res.data;
      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `monthly_invoice_${Date.now()}.pdf`;
      return { blob, filename };
    } catch (err) {
      let message = `Request failed (${err.response?.status || "Network Error"})`;

      if (err.response && err.response.data) {
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const errorJson = JSON.parse(text);
            message = errorJson.detail || message;
          } catch {
          }
        } else {
          message = err.response.data.detail || message;
        }
      } else if (err.message) {
        message = err.message;
      }

      lastErr = new Error(message);
    }
  }

  if (
    lastErr?.name === "TypeError" ||
    lastErr?.message?.includes("Network Error")
  ) {
    throw new Error(
      "Failed to fetch. Check backend URL/CORS and ensure the API server is running.",
    );
  }
  throw lastErr || new Error("Upload failed.");
};

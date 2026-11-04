import axios from "axios";
import { API } from "../constants/apiEndpoints";

const client = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

client.interceptors.request.use(
  (config) => {
    config.headers["ngrok-skip-browser-warning"] = "true";

    // Normalize endpoint if it starts with /api (since baseURL already includes /api)
    if (config.url && config.url.startsWith("/api/")) {
      config.url = config.url.replace(/^\/api/, "");
    }

    const isWorker = config.url?.includes("worker");
    const isFinance = config.url?.includes("finance");
    let token = null;

    if (isWorker) {
      token =
        localStorage.getItem("worker_dashboard_token") ||
        localStorage.getItem("token");
    } else if (isFinance) {
      token =
        localStorage.getItem("finanz_cockpit_token") ||
        localStorage.getItem("token");
    } else {
      token =
        localStorage.getItem("token") ||
        localStorage.getItem("finanz_cockpit_token") ||
        localStorage.getItem("worker_dashboard_token");
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.config &&
      !error.config.url.includes("/login")
    ) {
      const isWorker = error.config.url?.includes("worker");
      const isFinance = error.config.url?.includes("finance");
      if (isWorker) {
        localStorage.removeItem("worker_dashboard_token");
        localStorage.removeItem("worker_dashboard_refresh_token");
        localStorage.removeItem("worker_dashboard_auth");
        window.dispatchEvent(new Event("worker-dashboard-logout"));
      } else if (isFinance) {
        localStorage.removeItem("finanz_cockpit_token");
        localStorage.removeItem("finanz_cockpit_auth");
        window.dispatchEvent(new Event("finanz-cockpit-logout"));
      } else {
        localStorage.clear();
        window.dispatchEvent(new Event("auth-logout"));
      }
    }

    let message = "Request failed";
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail
          .map((d) => d.msg || d.message || JSON.stringify(d))
          .join(", ");
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      }
    } else if (error.message) {
      message = error.message;
    }

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.response = error.response;
    return Promise.reject(customError);
  },
);

export default client;

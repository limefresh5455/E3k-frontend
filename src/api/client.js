import axios from "axios";
import { API } from "../constants/apiEndpoints";

const client = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (config) => {
    config.headers["ngrok-skip-browser-warning"] = "true";
    const token = localStorage.getItem("token");
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
      localStorage.clear();
      window.dispatchEvent(new Event("auth-logout"));
    }

    let message = "Request failed";
    if (error.response && error.response.data) {
      message = error.response.data.detail || message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  },
);

export default client;

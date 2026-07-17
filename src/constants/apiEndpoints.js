export const RAW_API = import.meta.env.VITE_API_URL;
export const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;
export const API_BASE = RAW_API.replace(/\/api\/?$/, "");

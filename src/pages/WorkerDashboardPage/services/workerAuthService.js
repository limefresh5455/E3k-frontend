import client from "../../../api/client";

export const WORKER_TOKEN_KEY = "worker_dashboard_token";
export const WORKER_REFRESH_TOKEN_KEY = "worker_dashboard_refresh_token";
export const WORKER_AUTH_KEY = "worker_dashboard_auth";


export const getToken = () => {
  return localStorage.getItem(WORKER_TOKEN_KEY);
};


export const getRefreshToken = () => {
  return (
    localStorage.getItem(WORKER_REFRESH_TOKEN_KEY) ||
    getStoredAuth()?.refresh_token ||
    null
  );
};


export const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem(WORKER_AUTH_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
};


export const isAuthenticated = () => {
  const auth = getStoredAuth();
  const token = getToken();
  return Boolean((auth && (auth.authenticated || auth.token || auth.user)) || token);
};


export const clearAuthStorage = () => {
  try {
    invalidateWorkersCache();
    localStorage.removeItem(WORKER_TOKEN_KEY);
    localStorage.removeItem(WORKER_REFRESH_TOKEN_KEY);
    localStorage.removeItem(WORKER_AUTH_KEY);
    window.dispatchEvent(new Event("worker-dashboard-logout"));
  } catch (err) {
    console.warn("Storage access failed during logout", err);
  }
};


export const login = async ({ email, password }) => {
  const payload = {
    email: email ? String(email).trim() : "",
    password: password || "",
  };

  try {
    const data = await client.post("/worker-dashboard/auth/login", payload);

    const accessToken =
      data?.access_token ||
      data?.token ||
      data?.accessToken ||
      data?.data?.access_token ||
      data?.data?.token;

    const refreshToken =
      data?.refresh_token ||
      data?.refreshToken ||
      data?.data?.refresh_token ||
      data?.data?.refreshToken;

    if (accessToken) {
      localStorage.setItem(WORKER_TOKEN_KEY, accessToken);
    }

    if (refreshToken) {
      localStorage.setItem(WORKER_REFRESH_TOKEN_KEY, refreshToken);
    }

    let user = data?.user || (data?.email ? data : null);

    if (!user) {
      try {
        const meRes = await getMe();
        user = meRes?.user || meRes;
      } catch (meErr) {
        console.warn("Could not fetch user profile after login:", meErr);
        user = {
          email: payload.email,
          display_name: payload.email.split("@")[0],
          entitlements: [],
          is_active: true,
        };
      }
    }

    const authData = {
      email: payload.email,
      user,
      authenticated: true,
      token: accessToken || null,
      access_token: accessToken || null,
      refresh_token: refreshToken || null,
      token_type: data?.token_type || "bearer",
      expires_in: data?.expires_in,
      refresh_expires_in: data?.refresh_expires_in,
      savedAt: new Date().toISOString(),
      ...(typeof data === "object" ? data : {}),
    };

    localStorage.setItem(WORKER_AUTH_KEY, JSON.stringify(authData));

   
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    window.dispatchEvent(new Event("worker-dashboard-login"));
    return { ...data, user };
  } catch (error) {
    throw error;
  }
};


export const logout = () => {
  clearAuthStorage();
};

let inFlightMePromise = null;


export const getMe = async () => {
  if (inFlightMePromise) {
    return inFlightMePromise;
  }

  inFlightMePromise = (async () => {
    try {
      const data = await client.get("/worker-dashboard/auth/me");
      const user = data?.user || data;

      if (user) {
        const currentAuth = getStoredAuth() || {};
        const updatedAuth = {
          ...currentAuth,
          user,
          authenticated: true,
          lastVerifiedAt: new Date().toISOString(),
        };
        localStorage.setItem(WORKER_AUTH_KEY, JSON.stringify(updatedAuth));
      }

      return data;
    } finally {
      inFlightMePromise = null;
    }
  })();

  return inFlightMePromise;
};


let workersCache = null;
let inFlightWorkersPromise = null;

export const invalidateWorkersCache = () => {
  workersCache = null;
};

export const getWorkers = async (force = false) => {
  if (!force && workersCache) {
    return workersCache;
  }
  if (inFlightWorkersPromise) return inFlightWorkersPromise;

  inFlightWorkersPromise = (async () => {
    try {
      const data = await client.get("/worker-dashboard/admin/users");
      const result = Array.isArray(data) ? data : data?.users || [];
      workersCache = result;
      return result;
    } finally {
      inFlightWorkersPromise = null;
    }
  })();

  return inFlightWorkersPromise;
};


export const createWorkerUser = async ({ email, display_name, password, entitlements }) => {
  const payload = {
    email: email ? String(email).trim() : "",
    display_name: display_name ? String(display_name).trim() : "",
    password: password || "",
    entitlements: entitlements || [
      {
        permission: "worker.read",
        company_scope: "tebo",
      },
    ],
  };

  try {
    const data = await client.post("/worker-dashboard/admin/users", payload);
    invalidateWorkersCache();
    return data;
  } catch (error) {
    throw error;
  }
};


export const updateWorkerUser = async (userId, { display_name, entitlements }) => {
  try {
    const data = await client.put(
      `/worker-dashboard/admin/users/${userId}`,
      { display_name, entitlements }
    );
    invalidateWorkersCache();
    return data;
  } catch (error) {
    throw error;
  }
};


export const setUserActive = async (userId, active) => {
  try {
    const data = await client.put(
      `/worker-dashboard/admin/users/${userId}/active`,
      { active: Boolean(active) }
    );
    invalidateWorkersCache();
    return data;
  } catch (error) {
    throw error;
  }
};

const inFlightDataPromises = new Map();

export const getWorkerDashboardData = async (audience, company) => {
  const cacheKey = `${audience}:${company}`;
  if (inFlightDataPromises.has(cacheKey)) {
    return inFlightDataPromises.get(cacheKey);
  }

  const promise = (async () => {
    try {
      const data = await client.get(`/worker-dashboard/data/${audience}/${company}`);
      return data?.data && data.data.audience ? data.data : data;
    } finally {
      inFlightDataPromises.delete(cacheKey);
    }
  })();

  inFlightDataPromises.set(cacheKey, promise);
  return promise;
};

export default {
  login,
  logout,
  getMe,
  getWorkers,
  invalidateWorkersCache,
  createWorkerUser,
  updateWorkerUser,
  setUserActive,
  getWorkerDashboardData,
  clearAuthStorage,
  getStoredAuth,
  isAuthenticated,
  getToken,
  getRefreshToken,
};

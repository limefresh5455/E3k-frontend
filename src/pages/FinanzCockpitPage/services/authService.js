import client from "../../../api/client";

export const FINANZ_TOKEN_KEY = "finanz_cockpit_token";
export const FINANZ_AUTH_KEY = "finanz_cockpit_auth";

export const login = async ({ email, password }) => {
  const payload = {
    email: email ? String(email).trim() : "",
    password: password || "",
  };

  try {
    const data = await client.post("/finance/auth/login", payload);

    const token =
      data?.access_token ||
      data?.token ||
      data?.accessToken ||
      data?.data?.access_token ||
      data?.data?.token;

    if (token) {
      localStorage.setItem(FINANZ_TOKEN_KEY, token);
    }

    const authData = {
      email: payload.email,
      username: data?.username || data?.user?.username || data?.user?.email || payload.email,
      user: data?.user || null,
      authenticated: true,
      token: token || null,
      savedAt: new Date().toISOString(),
      ...(typeof data === "object" ? data : {}),
    };

    localStorage.setItem(FINANZ_AUTH_KEY, JSON.stringify(authData));

    // Clear any previous general tokens so dashboard session doesn't conflict
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    window.dispatchEvent(new Event("finanz-cockpit-login"));
    return data;
  } catch (error) {
    throw error;
  }
};

export const clearAuthStorage = () => {
  try {
    localStorage.removeItem(FINANZ_TOKEN_KEY);
    localStorage.removeItem(FINANZ_AUTH_KEY);
    window.dispatchEvent(new Event("finanz-cockpit-logout"));
  } catch (err) {
    console.warn("Storage access failed during logout", err);
  }
};

export const logout = async () => {
  try {
    await client.post("/finance/auth/logout");
  } catch (err) {
    console.warn("Logout API call error:", err);
  } finally {
    clearAuthStorage();
  }
};

export const logoutAll = async () => {
  try {
    await client.post("/finance/auth/logout-all");
  } catch (err) {
    console.warn("Logout-all API call error:", err);
  } finally {
    clearAuthStorage();
  }
};

export const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem(FINANZ_AUTH_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  const auth = getStoredAuth();
  return Boolean(auth && (auth.authenticated || auth.token));
};

export const getToken = () => {
  return localStorage.getItem(FINANZ_TOKEN_KEY);
};

export const forgotPassword = async (email) => {
  const payload = {
    email: typeof email === "object" && email.email ? String(email.email).trim() : String(email).trim(),
  };

  try {
    const data = await client.post("/finance/auth/forgot-password", payload);
    return data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async ({ email, otp }) => {
  const payload = {
    email: email ? String(email).trim() : "",
    otp: otp ? String(otp).trim() : "",
  };

  try {
    const data = await client.post("/finance/auth/verify-otp", payload);
    return data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async ({ reset_token, new_password }) => {
  const payload = {
    reset_token: reset_token ? String(reset_token).trim() : "",
    new_password: new_password || "",
  };

  try {
    const data = await client.post("/finance/auth/reset-password", payload);
    return data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async ({ email, password, role = "finance_user" }) => {
  const payload = {
    email: email ? String(email).trim() : "",
    password: password || "",
    role: role || "finance_user",
  };

  try {
    const data = await client.post("/finance/auth/register", payload);
    return data;
  } catch (error) {
    throw error;
  }
};

export const register = registerUser;

export default {
  login,
  logout,
  logoutAll,
  clearAuthStorage,
  getStoredAuth,
  isAuthenticated,
  getToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
  registerUser,
  register,
};

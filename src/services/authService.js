import client from "../api/client";

export const login = async (username, password) => {
  try {
    const data = await client.post("/login", { username, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    return data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.clear();
};

export const getCurrentUser = () => {
  return localStorage.getItem("username");
};

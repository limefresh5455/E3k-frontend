import client from "../api/client";

export const getOrders = async () => {
  try {
    const data = await client.get("/orders");
    return data;
  } catch (error) {
    throw error;
  }
};

export const getStats = async () => {
  try {
    const data = await client.get("/stats");
    return data;
  } catch (error) {
    throw error;
  }
};

export const getOrder = async (orderId) => {
  try {
    const data = await client.get(`/orders/${orderId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const syncPCloud = async () => {
  try {
    const data = await client.post("/sync");
    return data;
  } catch (error) {
    throw error;
  }
};

export const uploadPdf = async (file) => {
  try {
    const body = new FormData();
    body.append("file", file);
    const data = await client.post("/upload", body, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderLine = async (payload) => {
  try {
    const data = await client.post("/update-order-line", payload);
    return data;
  } catch (error) {
    throw error;
  }
};

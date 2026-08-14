import client from "../api/client";

export const getSuppliers = async () => {
  try {
    const data = await client.get("/suppliers");
    return data;
  } catch (error) {
    throw error;
  }
};

export const createSupplier = async (payload) => {
  try {
    const data = await client.post("/suppliers", payload);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getSupplier = async (supplierNumber) => {
  try {
    const data = await client.get(`/suppliers/${supplierNumber}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateSupplier = async (supplierNumber, payload) => {
  try {
    const data = await client.patch(`/suppliers/${supplierNumber}`, payload);
    return data;
  } catch (error) {
    throw error;
  }
};

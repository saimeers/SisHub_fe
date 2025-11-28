import axiosInstance from "../config/axios";

const DASHBOARD_BASE = "/dashboard";

const unwrapResponse = (response) => {
  if (!response?.data) return null;
  if (typeof response.data === "object" && "ok" in response.data) {
    if (!response.data.ok) {
      throw new Error(response.data?.message || "Error al consultar el dashboard");
    }
    return response.data.data;
  }
  return response.data;
};

const get = async (segment) => {
  const response = await axiosInstance.get(`${DASHBOARD_BASE}${segment}`);
  return unwrapResponse(response);
};

export const fetchGraphDataset = async (endpoint) => {
  try {
    const data = await get(`/graph/${endpoint}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error al consultar la gráfica ${endpoint}:`, error.message);
    throw error;
  }
};

export const fetchTagMetric = async (endpoint) => {
  try {
    const data = await get(`/tags/${endpoint}`);
    return typeof data === "object" && data !== null ? data : {};
  } catch (error) {
    console.error(`Error al consultar la métrica ${endpoint}:`, error.message);
    throw error;
  }
};


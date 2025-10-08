import axiosInstance from "../config/axios";

export const crearArea = async (nombre) => {
  try {
    const response = await axiosInstance.post("/areas/crear", { nombre });
    return response.data;
  } catch (error) {
    console.error("Error al crear área:", error);
    throw error;
  }
};

export const listarAreas = async () => {
  try {
    const response = await axiosInstance.get("/areas");
    return response.data;
  } catch (error) {
    console.error("Error al listar áreas:", error);
    throw error;
  }
};
import axiosInstance from "../config/axios";

const TIPO_ALCANCE_BASE = "/tipos-alcance";

/**
 * Listar todos los tipos de alcance
 * @returns {Promise<Array>} Lista de tipos de alcance
 */
export const listarTiposAlcance = async () => {
  try {
    const response = await axiosInstance.get(`${TIPO_ALCANCE_BASE}`);
    return response.data;
  } catch (error) {
    console.error("Error al listar tipos de alcance:", error);
    throw error;
  }
};

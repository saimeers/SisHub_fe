import axios from "../config/axios";

export const listarEsquemasPorTipo = async (id_tipo_alcance) => {
  try {
    const response = await axios.get(`/esquemas/tipo/${id_tipo_alcance}`);
    return response.data; 
  } catch (error) {
    console.error("Error al listar esquemas por tipo:", error);
    throw error;
  }
};

export const listarItemsPorEsquema = async (id_esquema) => {
  try {
    console.log("ID del esquema recibido:", id_esquema);
    const response = await axios.get(`/esquemas/${id_esquema}/items`);
    return response.data;
  } catch (error) {
    console.error("Error al listar items por esquema:", error);
    throw error;
  }
};

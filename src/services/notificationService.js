import axiosInstance from "../config/axios";

export const obtenerNotificacionesUsuario = async (codigoUsuario) => {
  try {
    const codigo = codigoUsuario?.toString();
    if (!codigo) throw new Error("Código de usuario inválido");

    // Usamos URL absoluta para garantizar funcionamiento independiente del baseURL
    const url = `http://localhost:3000/api/notificaciones/listar/${codigo}`;
    const response = await axiosInstance.get(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    throw error;
  }
};



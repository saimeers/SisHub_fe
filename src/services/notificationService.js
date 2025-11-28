import axiosInstance from "../config/axios";

export const obtenerNotificacionesUsuario = async () => {
  try {
    // Obtenemos el userData completo del localStorage
    const userData = JSON.parse(localStorage.getItem("userData"));
    const codigo = userData?.codigo?.toString();

    if (!codigo) throw new Error("Código de usuario inválido o no encontrado en localStorage");

    console.log("🔔 Obteniendo notificaciones para código:", codigo);
    
    // El baseURL ya incluye /api, así que solo agregamos la ruta relativa
    const url = `/notificaciones/listar/${codigo}`;
    const fullUrl = axiosInstance.defaults.baseURL + url;
    console.log("🔔 URL completa:", fullUrl);
    
    const response = await axiosInstance.get(url);
    console.log("🔔 Respuesta recibida:", response.data);
    
    const notificaciones = Array.isArray(response.data) ? response.data : [];
    console.log("🔔 Notificaciones procesadas:", notificaciones.length);
    
    return notificaciones;
  } catch (error) {
    console.error("❌ Error al obtener notificaciones:", error);
    console.error("❌ Detalles:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const cambiarEstadoNotificacion = async (idNotificacion) => {
  try {
    if (!idNotificacion) throw new Error("ID de notificación inválido");

    // El baseURL ya incluye /api, así que solo agregamos la ruta relativa
    const url = `/notificaciones/cambiarEstado/${idNotificacion}`;
    const response = await axiosInstance.patch(url);
    return response.data;
  } catch (error) {
    console.error("Error al cambiar estado de notificación:", error);
    throw error;
  }
};

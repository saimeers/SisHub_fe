import axiosInstance from "../config/axios";

const GROUP_USERS_BASE = "/grupos-usuarios";

export const joinGroupByAccessKey = async ({
  id_usuario,
  id_grupo,
  clave_acceso,
}) => {
  try {
    const response = await axiosInstance.post(`${GROUP_USERS_BASE}/unirse`, {
      id_usuario,
      id_grupo,
      clave_acceso,
    });
    return response.data;
  } catch (error) {
    console.error("Error al unirse al grupo:", error);
    throw error;
  }
};

export default {
  joinGroupByAccessKey,
};

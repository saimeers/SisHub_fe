import axiosInstance from "../config/axios";

const GROUP_USERS_BASE = "/grupos-usuarios";

export const joinGroupByAccessKey = async ({
  codigo_usuario,
  codigo_materia,
  nombre_grupo,
  periodo,
  anio,
  clave_acceso,
}) => {
  try {
    const response = await axiosInstance.post(`${GROUP_USERS_BASE}/unirse`, {
      codigo_usuario,
      codigo_materia,
      nombre_grupo,
      periodo,
      anio,
      clave_acceso,
    });
    return response.data;
  } catch (error) {
    console.error("Error al unirse al grupo:", error);
    throw error;
  }
};

export const listarParticipantesGrupo = async (
  codigo_materia,
  nombre_grupo,
  periodo,
  anio
) => {
  try {
    const response = await axiosInstance.get(
      `${GROUP_USERS_BASE}/grupo/participantes`,
      {
        params: {
          codigo_materia,
          nombre_grupo,
          periodo,
          anio,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al listar participantes del grupo:", error);
    throw error;
  }
};

export default {
  joinGroupByAccessKey,
  listarParticipantesGrupo,
};

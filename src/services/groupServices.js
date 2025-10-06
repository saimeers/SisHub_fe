import axiosInstance from "../config/axios";

const GROUPS_BASE = "/grupos";

export const obtenerGrupos = async () => {
  try {
    console.warn("No hay ruta para obtener todos los grupos en el backend");
    return [];
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    throw error;
  }
};

export const crearGrupo = async (groupData) => {
  try {
    const response = await axiosInstance.post(`${GROUPS_BASE}/`, groupData);
    return response.data;
  } catch (error) {
    console.error("Error al crear grupo:", error);
    throw error;
  }
};

export const actualizarEstado = async (id_grupo, nuevoEstado) => {
  try {
    const response = await axiosInstance.patch(`${GROUPS_BASE}/${id_grupo}/actualizar-estado`, { nuevoEstado });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar estado del grupo:", error);
    throw error;
  }
};

export const generarClaveAcceso = async () => {
  try {
    const response = await axiosInstance.get(`${GROUPS_BASE}/generar-clave`);
    return response.data;
  } catch (error) {
    console.error("Error al generar clave de acceso:", error);
    throw error;
  }
};

export const generarCodigoQR = async (id_grupo) => {
  try {
    const response = await axiosInstance.get(`${GROUPS_BASE}/${id_grupo}/generar-qr`);
    return response.data;
  } catch (error) {
    console.error("Error al generar código QR:", error);
    throw error;
  }
};

export const obtenerClaveYCodigoQR = async (id_grupo) => {
  try {
    const response = await axiosInstance.get(`${GROUPS_BASE}/${id_grupo}/clave-y-qr`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener clave y QR:", error);
    throw error;
  }
};

export const listarGruposPorMateria = async (id_materia) => {
  try {
    const response = await axiosInstance.get(`${GROUPS_BASE}/materia/${id_materia}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener grupos por materia:", error);
    throw error;
  }
};

export const listarGruposHabilitadosPorMateria = async (id_materia) => {
  try {
    const response = await axiosInstance.get(`${GROUPS_BASE}/materia/${id_materia}/habilitados`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener grupos habilitados por materia:", error);
    throw error;
  }
};

export const listarGruposPorUsuario = async (id_usuario) => {
  try {
    const response = await axiosInstance.get(`${GROUPS_BASE}/usuario/${id_usuario}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener grupos por usuario:", error);
    throw error;
  }
};

export default {
  obtenerGrupos,
  crearGrupo,
  actualizarEstado,
  generarClaveAcceso,
  generarCodigoQR,
  obtenerClaveYCodigoQR,
  listarGruposPorMateria,
  listarGruposHabilitadosPorMateria,
  listarGruposPorUsuario,
};

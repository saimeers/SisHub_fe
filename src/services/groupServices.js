import axiosInstance from "../config/axios";

const GROUPS_BASE = "/grupos";

export const obtenerGrupos = async () => {
  try {
    const response = await axiosInstance.get(`${GROUPS_BASE}/`);
    return response.data;
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

export const actualizarEstado = async (
  codigo_materia,
  nombre,
  periodo,
  anio,
  nuevoEstado
) => {
  try {
    const response = await axiosInstance.patch(
      `${GROUPS_BASE}/actualizar-estado`,
      { codigo_materia, nombre, periodo, anio, nuevoEstado }
    );
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

export const generarCodigoQR = async (
  codigo_materia,
  nombre,
  periodo,
  anio
) => {
  try {
    const response = await axiosInstance.get(
      `${GROUPS_BASE}/${codigo_materia}/${nombre}/${periodo}/${anio}/generar-qr`
    );
    return response.data;
  } catch (error) {
    console.error("Error al generar código QR:", error);
    throw error;
  }
};

export const obtenerClaveYCodigoQR = async (
  codigo_materia,
  nombre,
  periodo,
  anio
) => {
  try {
    const response = await axiosInstance.post(`${GROUPS_BASE}/clave-y-qr`, {
      codigo_materia,
      nombre,
      periodo,
      anio,
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener clave y QR:", error);
    throw error;
  }
};

export const listarGruposPorMateria = async (codigo) => {
  try {
    const response = await axiosInstance.get(
      `${GROUPS_BASE}/materia/${codigo}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener grupos por materia:", error);
    throw error;
  }
};

export const listarGruposHabilitadosPorMateria = async (codigo) => {
  try {
    const response = await axiosInstance.get(
      `${GROUPS_BASE}/materia/${codigo}/habilitados`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener grupos habilitados por materia:", error);
    throw error;
  }
};

export const listarGruposPorUsuario = async (codigo) => {
  try {
    const response = await axiosInstance.get(`/grupos/usuario/${codigo}`);
    // console.log("Backend grupos por usuario:", response.data); // Puedes agregar esto para depurar
    return response.data;
  } catch (error) {
    console.error("Error al obtener grupos por usuario:", error);
    throw error;
  }
};

export const cargarGruposDesdeCSV = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      `${GROUPS_BASE}/cargar-csv`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al procesar CSV" };
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
  cargarGruposDesdeCSV,
};

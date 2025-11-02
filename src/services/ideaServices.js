import axiosInstance from "../config/axios";

const IDEAS_BASE = "/ideas";

/**
 * Crear una nueva idea de proyecto
 * @param {Object} datosIdea - Datos de la idea a crear
 * @returns {Promise} Respuesta del servidor
 */
export const crearIdea = async (datosIdea) => {
  try {
    const response = await axiosInstance.post(`${IDEAS_BASE}/crear`, datosIdea);
    return response.data;
  } catch (error) {
    console.error("Error al crear idea:", error);
    throw error;
  }
};

/**
 * Actualizar una idea existente
 * @param {Number} idIdea - ID de la idea a actualizar
 * @param {Object} datosActualizacion - Datos a actualizar
 * @returns {Promise} Respuesta del servidor
 */
export const actualizarIdea = async (idIdea, datosActualizacion) => {
  try {
    const response = await axiosInstance.put(
      `${IDEAS_BASE}/actualizar/${idIdea}`,
      datosActualizacion
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar idea:", error);
    throw error;
  }
};

export const obtenerIdea = async (idIdea) => {
  try {
    const response = await axiosInstance.get(`${IDEAS_BASE}/${idIdea}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener idea:", error);
    throw error;
  }
};

export const listarIdeasLibres = async () => {
  try {
    const response = await axiosInstance.get(`${IDEAS_BASE}/libres`);
    return response.data;
  } catch (error) {
    console.error("Error al listar ideas libres:", error);
    throw error;
  }
};

export const listarIdeasGrupo = async (grupo) => {
  try {
    const { codigo_materia, nombre, periodo, anio } = grupo;
    const response = await axiosInstance.get(`${IDEAS_BASE}/grupo/listar`, {
      params: {
        codigo_materia,
        nombre,
        periodo,
        anio,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al listar ideas del grupo:", error);
    throw error;
  }
};

export const adoptarIdea = async (idIdea, codigo_usuario, grupo) => {
  try {
    const response = await axiosInstance.patch(
      `${IDEAS_BASE}/adoptar/${idIdea}`,
      {
        codigo_usuario,
        grupo,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al adoptar idea:", error);
    throw error;
  }
};

export const revisarIdea = async (idIdea, accion, observacion, codigo_usuario) => {
  try {
    const response = await axiosInstance.put(
      `${IDEAS_BASE}/${idIdea}/revisar`,
      {
        accion,
        observacion,
        codigo_usuario,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al revisar idea:", error);
    throw error;
  }
};

export const moverIdeaAlBanco = async (idIdea, codigo_usuario) => {
  try {
    const response = await axiosInstance.put(
      `${IDEAS_BASE}/${idIdea}/no-corregir`,
      {
        codigo_usuario,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al mover idea al banco:", error);
    throw error;
  }
};

export const verificarIdeaYProyecto = async (codigo_usuario, grupo) => {
  try {
    const response = await axiosInstance.post(
      `${IDEAS_BASE}/verificar/${codigo_usuario}`,
      grupo
    );
    return response.data;
  } catch (error) {
    console.error("Error al verificar idea y proyecto:", error);
    throw error;
  }
};

export const obtenerUltimoHistorial = async (id_idea) => {
  try {
    const response = await axiosInstance.get(`${IDEAS_BASE}/${id_idea}/ultimo-historial`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener historial:", error);
    throw error;
  }
};

export default {
  obtenerUltimoHistorial,
  verificarIdeaYProyecto,
  crearIdea,
  actualizarIdea,
  obtenerIdea,
  listarIdeasLibres,
  listarIdeasGrupo,
  adoptarIdea,
  revisarIdea,
  moverIdeaAlBanco,
};


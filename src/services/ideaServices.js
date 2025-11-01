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

/**
 * Obtener una idea por su ID
 * @param {Number} idIdea - ID de la idea
 * @returns {Promise} Datos de la idea
 */
export const obtenerIdea = async (idIdea) => {
  try {
    const response = await axiosInstance.get(`${IDEAS_BASE}/${idIdea}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener idea:", error);
    throw error;
  }
};

/**
 * Listar ideas libres (banco de ideas)
 * @returns {Promise} Lista de ideas libres
 */
export const listarIdeasLibres = async () => {
  try {
    const response = await axiosInstance.get(`${IDEAS_BASE}/libres`);
    return response.data;
  } catch (error) {
    console.error("Error al listar ideas libres:", error);
    throw error;
  }
};

/**
 * Listar ideas de un grupo específico
 * @param {Object} grupo - Datos del grupo (codigo_materia, nombre, periodo, anio)
 * @returns {Promise} Lista de ideas del grupo
 */
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

/**
 * Adoptar una idea libre del banco
 * @param {Number} idIdea - ID de la idea a adoptar
 * @param {String} codigo_usuario - Código del usuario que adopta
 * @param {Object} grupo - Datos del grupo
 * @returns {Promise} Respuesta del servidor
 */
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

/**
 * Revisar una idea (solo para docentes/admin)
 * @param {Number} idIdea - ID de la idea a revisar
 * @param {String} accion - Acción: "Aprobar", "Aprobar_Con_Observacion", "Rechazar"
 * @param {String} observacion - Observaciones opcionales
 * @param {String} codigo_usuario - Código del docente que revisa
 * @returns {Promise} Respuesta del servidor
 */
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

/**
 * Mover una idea al banco por decisión del estudiante
 * @param {Number} idIdea - ID de la idea
 * @param {String} codigo_usuario - Código del usuario líder
 * @returns {Promise} Respuesta del servidor
 */
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

export default {
  crearIdea,
  actualizarIdea,
  obtenerIdea,
  listarIdeasLibres,
  listarIdeasGrupo,
  adoptarIdea,
  revisarIdea,
  moverIdeaAlBanco,
};


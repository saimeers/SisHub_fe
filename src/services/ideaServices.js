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
  if (!idIdea) {
    console.warn("⚠️ obtenerIdea llamado sin idIdea");
    throw new Error("ID de idea es requerido");
  }

  try {
    const response = await axiosInstance.get(`${IDEAS_BASE}/${idIdea}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener idea:", error);
    
    if (error.response?.status === 404) {
      throw new Error("Idea no encontrada");
    }
    
    throw error;
  }
};

export const listarIdeasLibres = async () => {
  try {
    const response = await axiosInstance.get(`${IDEAS_BASE}/libres`);
    console.log("Backend ideas libres:", response.data);
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
    
    // Si es 404, el usuario no tiene idea/proyecto (esto es normal)
    if (error.response?.status === 404) {
      return { data: { proyecto: null, idea: null } };
    }
    
    throw error;
  }
};

export const obtenerUltimoHistorial = async (id_idea) => {
  // ✅ Validar que id_idea exista
  if (!id_idea) {
    console.warn("⚠️ obtenerUltimoHistorial llamado sin id_idea");
    return null;
  }

  try {
    const response = await axiosInstance.get(`${IDEAS_BASE}/${id_idea}/ultimo-historial`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener historial:", error);
    
    // ✅ Si no hay historial (404), retornar null en lugar de lanzar error
    if (error.response?.status === 404) {
      console.log("ℹ️ No hay historial registrado para esta idea");
      return null;
    }
    
    // Para otros errores, lanzar
    throw error;
  }
};


export const rechazarObservacion = async (id_idea, id_proyecto, codigo_usuario) => {
  try {
    console.log("Rechazando observación para idea:", id_idea, "por usuario:", codigo_usuario);
    const response = await axiosInstance.put(`/proyectos/${id_idea}/rechazar`, {
      codigo_usuario,
      id_proyecto,
    });
    return response.data;
  } catch (error) {
    console.error("Error al rechazar observación:", error);
    throw error.response?.data || { message: "Error en el servidor" };
  }
}

export default {
  rechazarObservacion,
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


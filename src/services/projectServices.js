import axiosInstance from "../config/axios";

const PROJECTS_BASE = "/proyectos";

export const listarProyectosParaDirector = async () => {
  try {
    const response = await axiosInstance.get(
      `${PROJECTS_BASE}/listar/paraDirector`
    );
    return response.data;
  } catch (error) {
    console.error("Error al listar proyectos para director:", error);
    throw error;
  }
};


export async function rechazarObservacion(id_idea, accion, observacion, codigo_usuario) {
  try {
    const response = await axios.put(`${API_URL}/${id_idea}/rechazar`, {
      accion,
      codigo_usuario,
    });
    return response.data;
  } catch (error) {
    console.error("Error al revisar idea:", error);
    throw error.response?.data || { message: "Error en el servidor" };
  }
}

export const listarProyectosParaEstudiante = async (codigo_estudiante) => {
  try {
    const response = await axiosInstance.get(
      `${PROJECTS_BASE}/listar/paraEstudiante/${codigo_estudiante}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al listar proyectos para estudiante:", error);
    throw error;
  }
};

export const listarProyectosParaDocente = async (codigo_docente) => {
  try {
    const response = await axiosInstance.get(
      `${PROJECTS_BASE}/listar/paraDocente/${codigo_docente}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al listar proyectos para docente:", error);
    throw error;
  }
};

export const listarProyectosPorGrupo = async (grupo) => {
  try {
    const { codigo_materia, nombre, periodo, anio } = grupo;
    const response = await axiosInstance.get(
      `${PROJECTS_BASE}/listar/porGrupo`,
      {
        params: { codigo_materia, nombre, periodo, anio },
      }
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al listar proyectos por grupo:", error);
    throw error;
  }
};

export const verDetallesProyecto = async (id_proyecto) => {
  try {
    const response = await axiosInstance.get(
      `${PROJECTS_BASE}/verDetalle/${id_proyecto}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al listar detalles del proyecto:", error);
    throw error;
  }
};

export const liberarProyecto = async (idProyecto, codigo_usuario) => {
  try {
    const response = await axiosInstance.patch(
      `${PROJECTS_BASE}/liberar/${idProyecto}`,
      { codigo_usuario }
    );
    return response.data;
  } catch (error) {
    console.error("Error al liberar proyecto:", error);
    throw error;
  }
};

/**
 * Exporta proyectos a Excel
 * @param {string} tipo - Tipo de filtro: "todos", "fecha", "semestre"
 * @param {Object} filtros - Objeto con los filtros según el tipo
 * @param {string} filtros.fechaInicio - Fecha de inicio (formato YYYY-MM-DD) - requerido si tipo="fecha"
 * @param {string} filtros.fechaFin - Fecha de fin (formato YYYY-MM-DD) - requerido si tipo="fecha"
 * @param {number|string} filtros.anio - Año del semestre - requerido si tipo="semestre"
 * @param {number|string} filtros.periodo - Período del semestre (1 o 2) - requerido si tipo="semestre"
 * @returns {Promise<Blob>} - Archivo Excel como Blob
 */
export const exportarProyectosExcel = async (tipo, filtros = {}) => {
  try {
    const params = new URLSearchParams({ tipo });

    if (tipo === "fecha") {
      if (!filtros.fechaInicio || !filtros.fechaFin) {
        throw new Error("Debe proporcionar fechaInicio y fechaFin");
      }
      params.append("fechaInicio", filtros.fechaInicio);
      params.append("fechaFin", filtros.fechaFin);
    } else if (tipo === "semestre") {
      if (!filtros.anio || !filtros.periodo) {
        throw new Error("Debe proporcionar anio y periodo");
      }
      params.append("anio", filtros.anio);
      params.append("periodo", filtros.periodo);
    }

    const response = await axiosInstance.get(
      `${PROJECTS_BASE}/exportar/proyectos?${params.toString()}`,
      {
        responseType: "blob", // Importante para archivos binarios
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error al exportar proyectos a Excel:", error);
    
    // Si el error tiene un mensaje JSON, intentar parsearlo
    if (error.response && error.response.data) {
      const contentType = error.response.headers["content-type"];
      if (contentType?.includes("application/json")) {
        const reader = new FileReader();
        const text = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsText(error.response.data);
        });
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || errorData.message || "Error al exportar proyectos");
      }
    }
    
    throw error;
  }
};

/**
 * Exporta proyectos a PDF
 * @param {string} tipo - Tipo de filtro: "todos", "fecha", "semestre"
 * @param {Object} filtros - Objeto con los filtros según el tipo
 * @param {string} filtros.fechaInicio - Fecha de inicio (formato YYYY-MM-DD) - requerido si tipo="fecha"
 * @param {string} filtros.fechaFin - Fecha de fin (formato YYYY-MM-DD) - requerido si tipo="fecha"
 * @param {number|string} filtros.anio - Año del semestre - requerido si tipo="semestre"
 * @param {number|string} filtros.periodo - Período del semestre (1 o 2) - requerido si tipo="semestre"
 * @returns {Promise<Blob>} - Archivo PDF como Blob
 */
export const exportarProyectosPDF = async (tipo, filtros = {}) => {
  try {
    const params = new URLSearchParams({ tipo });

    if (tipo === "fecha") {
      if (!filtros.fechaInicio || !filtros.fechaFin) {
        throw new Error("Debe proporcionar fechaInicio y fechaFin");
      }
      params.append("fechaInicio", filtros.fechaInicio);
      params.append("fechaFin", filtros.fechaFin);
    } else if (tipo === "semestre") {
      if (!filtros.anio || !filtros.periodo) {
        throw new Error("Debe proporcionar anio y periodo");
      }
      params.append("anio", filtros.anio);
      params.append("periodo", filtros.periodo);
    }

    const response = await axiosInstance.get(
      `${PROJECTS_BASE}/exportar/pdf?${params.toString()}`,
      {
        responseType: "blob", // Importante para archivos binarios
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error al exportar proyectos a PDF:", error);
    
    // Si el error tiene un mensaje JSON, intentar parsearlo
    if (error.response && error.response.data) {
      const contentType = error.response.headers["content-type"];
      if (contentType?.includes("application/json")) {
        const reader = new FileReader();
        const text = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsText(error.response.data);
        });
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || errorData.message || "Error al exportar proyectos");
      }
    }
    
    throw error;
  }
};

export default {
  listarProyectosParaDirector,
  listarProyectosParaEstudiante,
  listarProyectosParaDocente,
  listarProyectosPorGrupo,
  verDetallesProyecto,
  liberarProyecto,
  exportarProyectosExcel,
  exportarProyectosPDF,
};

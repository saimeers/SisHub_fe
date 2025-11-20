import axiosInstance from "../config/axios";
import axios from "../config/axios";

const ENTREGABLES_BASE = "/entregables";

/**
 * Obtiene los tipos de entregables disponibles
 */
export const obtenerTiposEntregable = async () => {
  try {
    const response = await axios.get(`${ENTREGABLES_BASE}/tipos`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de entregable:", error);
    throw error;
  }
};

/**
 * Crea un nuevo entregable
 */
export const crearEntregable = async (formData, codigo_usuario) => {
  try {
    formData.append('codigo_usuario', codigo_usuario);
    
    const response = await axios.post(`${ENTREGABLES_BASE}/crear`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000
    });
    return response.data;
  } catch (error) {
    console.error("Error al crear entregable:", error);
    const errorMsg = error.response?.data?.error || error.message || "Error al subir el entregable";
    throw new Error(errorMsg);
  }
};

/**
 * Actualiza un entregable existente
 */
export const actualizarEntregable = async (id_entregable, formData, codigo_usuario) => {
  try {
    formData.append('codigo_usuario', codigo_usuario);
    
    const response = await axios.put(`${ENTREGABLES_BASE}/${id_entregable}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar entregable:", error);
    const errorMsg = error.response?.data?.error || error.message || "Error al actualizar el entregable";
    throw new Error(errorMsg);
  }
};

export const deshabilitarEntregable = async (id_entregable, codigo_usuario) => {
  try {
    const response = await axios.put(`${ENTREGABLES_BASE}/deshabilitar/${id_entregable}`, {
      codigo_usuario
    });
    return response.data;
  } catch (error) {
    console.error("Error al deshabilitar entregable:", error);
    const errorMsg = error.response?.data?.error || error.message || "Error al deshabilitar el entregable";
    throw new Error(errorMsg);
  }
};

/**
 * Obtiene los entregables de un proyecto para una actividad específica
 * ✅ CORREGIDO: Maneja correctamente el caso de no encontrar entregables
 */
export const obtenerEntregablesProyecto = async (id_proyecto, id_actividad) => {
  try {
    const response = await axios.get(`${ENTREGABLES_BASE}/proyecto/${id_proyecto}/actividad/${id_actividad}`);
    console.log("data que llega para entregables", response);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    // Si es 404, retornar array vacío (no hay entregables aún)
    if (error.response?.status === 404) {
      console.log("No se encontraron entregables para este proyecto (es la primera vez)");
      return [];
    }
    console.error("Error al obtener entregables:", error);
    throw error;
  }
};

export const obtenerEntregables = async (id_proyecto, id_actividad) => {
  try {
    const response = await axios.get(`${ENTREGABLES_BASE}/proyecto/${id_proyecto}`);
    console.log("data que llega para entregables", response);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    // Si es 404, retornar array vacío (no hay entregables aún)
    if (error.response?.status === 404) {
      console.log("No se encontraron entregables para este proyecto (es la primera vez)");
      return [];
    }
    console.error("Error al obtener entregables:", error);
    throw error;
  }
};

/**
 * Analiza un documento con Magic Loops
 */
export const analizarDocumentoConIA = async (texto, items) => {
  try {
    const response = await axios.post(import.meta.env.VITE_URL_ENTREGABLE, {
      text: texto,
      items: items
    }, {
      timeout: 60000
    });
    
    return response.data;
  } catch (error) {
    console.error("Error al analizar documento:", error);
    throw new Error("Error al analizar el documento con IA");
  }
};

/**
 * Envía el proyecto a revisión
 */
export const enviarProyectoARevision = async (id_proyecto, codigo_usuario) => {
  try {
    const response = await axios.post(
      `${ENTREGABLES_BASE}/proyecto/${id_proyecto}/enviar-revision`,
      { codigo_usuario }
    );
    return response.data;
  } catch (error) {
    console.error("Error al enviar proyecto a revisión:", error);
    const errorMsg = error.response?.data?.error || error.message || "Error al enviar a revisión";
    throw new Error(errorMsg);
  }
};

/**
 * Extrae texto de un archivo PDF o Word
 */
export const extraerTextoDocumento = async (file) => {
  try {
    const formData = new FormData();
    formData.append('archivo', file);
    
    const response = await axios.post(`${ENTREGABLES_BASE}/extraer-texto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.texto;
  } catch (error) {
    console.error("Error al extraer texto:", error);
    throw new Error("Error al procesar el documento");
  }
};

export async function retroalimentarEntregable(id_entregable, comentarios, calificacion, codigo_usuario) {
  try {
    const response = await axiosInstance.put(`${ENTREGABLES_BASE}/retroalimentar/${id_entregable}`, {
      comentarios,
      calificacion,
      codigo_usuario
    });
    return response.data;
  } catch (error) {
    console.error("Error al retroalimentar entregable:", error);
    throw error.response?.data || { message: "Error en el servidor" };
  }
}

export async function getHistorialEntregable(id_entregable) {
  try {
    const { data } = await axios.get(`/entregables/${id_entregable}/historial`);
    return data.historial;
  } catch (error) {
    console.error("Error al obtener historial del entregable:", error);
    throw error.response?.data || { message: "Error al obtener historial del entregable" };
  }
}

export async function historicoEntregables(id_proyecto) {
  try {
    const { data } = await axiosInstance.get(`/entregables/historial/proyecto/${id_proyecto}`);
    return data;
  } catch (error) {
    console.error("Error al obtener historial del proyecto:", error);
    throw error.response?.data || { message: "Error al obtener historial del proyecto" };
  }
}
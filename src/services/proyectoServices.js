import axiosInstance from "../config/axios";

export const listarPropuestasLibres = async () => {
  try {
    const response = await axiosInstance.get("/proyectos/libres");
    return response.data;
  } catch (error) {
    console.error("Error al listar el banco de propuestas:", error);
    throw error;
  }
};

export const obtenerProyectosContinuables = async (codigo_usuario) => {
  try {
    const response = await axiosInstance.get(`/proyectos/continuables/${codigo_usuario}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener proyectos continuables:", error);
    throw error;
  }
};

export const adoptarPropuesta = async (id_proyecto, codigo_usuario, grupo) => {
  try {
    const response = await axiosInstance.patch(`/proyectos/adoptar/${id_proyecto}`, {
      codigo_usuario,
      grupo
    });
    return response.data;
  } catch (error) {
    console.error("Error al adoptar propuesta:", error);
    throw error;
  }
};

export const continuarProyecto = async (id_proyecto, codigo_usuario, grupo) => {
  try {
    const response = await axiosInstance.post(`/proyectos/${id_proyecto}/continuar`, {
      codigo_usuario,
      grupo
    });
    return response.data;
  } catch (error) {
    console.error("Error al continuar proyecto:", error);
    throw error;
  }
};

export const crearProyectoDesdeIdea = async (id_idea, datos) => {
  try {
    console.log(id_idea, datos);
    const response = await axiosInstance.post(`/proyectos/crear/${id_idea}`, datos);
    return response.data;
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    throw error;
  }
};

export const revisarProyecto = async (id_proyecto, accion, observacion, codigo_usuario) => {
  try {
    const response = await axiosInstance.put(`/proyectos/revisar`, {
      id_proyecto,
      accion,
      observacion,
      codigo_usuario
    });
    return response.data;
  } catch (error) {
    console.error("Error al revisar proyecto:", error);
    throw error.response?.data || { message: "Error en el servidor" };
  }
};

export const obtenerUltimoHistorial = async (id_proyecto) => {
  // ✅ Validar que id_idea exista
  if (!id_proyecto) {
    console.warn("⚠️ obtenerUltimoHistorial llamado sin id_idea");
    return null;
  }

  try {
    const response = await axiosInstance.get(`proyectos/${id_proyecto}/ultimo-historial`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener historial:", error);
    
    // ✅ Si no hay historial (404), retornar null en lugar de lanzar error
    if (error.response?.status === 404) {
      console.log("ℹ️ No hay historial registrado para este proyecto");
      return null;
    }
    
    // Para otros errores, lanzar
    throw error;
  }
};

export const calificarProyecto = async (id_proyecto, observacion, codigo_usuario) => {
  try {
    const response = await axiosInstance.post(`/proyectos/${id_proyecto}/calificar`, {
      observacion,
      codigo_usuario
    });
    return response.data;
  } catch (error) {
    console.error("Error al calificar proyecto:", error);
    throw error.response?.data || { message: "Error en el servidor" };
  }
};

export async function getHistorialProyecto(id_proyecto) {
  try {
    const { data } = await axiosInstance.get(`/proyectos/historial/${id_proyecto}`);
    return data.historial;
  } catch (error) {
    console.error("Error al obtener historial del entregable:", error);
    throw error.response?.data || { message: "Error al obtener historial del entregable" };
  }
}



import axios from "../config/axios";

export const crearActividad = async (actividadData) => {
  try {
    const response = await axios.post("/actividades", actividadData);
    return response.data;
  } catch (error) {
    console.error("Error al crear actividad:", error);
    throw error;
  }
};

export const editarActividad = async (id_actividad, actividadData) => {
  try {
    const response = await axios.put(`/actividades/${id_actividad}`, actividadData);
    return response; 
  } catch (error) {
    console.error("Error al editar actividad:", error);
    throw error;
  }
};

export const verificarActividadGrupo = async (codigo_materia, nombre, periodo, anio) => {
  try {
    const response = await axios.get(
      `/actividades/grupo/${codigo_materia}/${nombre}/${periodo}/${anio}`
    );
    return response.data.tieneActividad;
  } catch (error) {
    console.error("Error al verificar actividad del grupo:", error);
    throw error;
  }
};


export const obtenerActividadById = async (id_actividad) => {
  try {
    const response = await axios.get(`/actividades/${id_actividad}`);
    return response.data.actividad;
  } catch (error) {
    console.error("Error al obtener la actividad:", error);
    throw error;
  }
};

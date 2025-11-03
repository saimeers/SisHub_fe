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

export default {
  listarProyectosParaDirector,
  listarProyectosParaEstudiante,
  listarProyectosParaDocente,
  listarProyectosPorGrupo,
  verDetallesProyecto,
};

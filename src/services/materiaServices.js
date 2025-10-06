import axiosInstance from "../config/axios";

const SUBJECTS_BASE = "/materias";

export async function fetchSubjects() {
  const { data } = await axiosInstance.get(`${SUBJECTS_BASE}/`);
  return data;
}

export async function createSubject(subjectPayload) {
  // Espera un objeto con: codigo, nombre, creditos, prerrequisitos, tipo, id_area
  const { data } = await axiosInstance.post(`${SUBJECTS_BASE}/`, subjectPayload);
  return data;
}

export default {
  fetchSubjects,
  createSubject,
};



import api from "../config/axios";

const SUBJECTS_BASE = "/materias";

export async function fetchSubjects() {
  const { data } = await api.get(`${SUBJECTS_BASE}/`);
  return data;
}

export async function createSubject(subjectPayload) {
  // Espera un objeto con: codigo, nombre, creditos, prerrequisitos, tipo, id_area
  const { data } = await api.post(`${SUBJECTS_BASE}/`, subjectPayload);
  return data;
}

export default {
  fetchSubjects,
  createSubject,
};



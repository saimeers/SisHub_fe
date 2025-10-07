import api from "../config/axios";

const SUBJECTS_BASE = "/materias";

export async function fetchSubjects() {
  const { data } = await api.get(`${SUBJECTS_BASE}/`);
  return data;
}

export async function createSubject(subjectPayload) {
  // Espera un objeto con: codigo, nombre, creditos, prerrequisitos, tipo, id_area
  const { data } = await api.post(`/api${SUBJECTS_BASE}`, subjectPayload);
  return data;
}

export async function getSubjectById(id) {
  const { data } = await api.get(`/api${SUBJECTS_BASE}/${id}`);
  return data;
}

export async function updateSubject(id, subjectPayload) {
  // Espera un objeto con: codigo, nombre, creditos, prerrequisitos, tipo, id_area
  const { data } = await api.put(`/api${SUBJECTS_BASE}/${id}`, subjectPayload);
  return data;
}

export default {
  fetchSubjects,
  createSubject,
  getSubjectById,
  updateSubject,
};



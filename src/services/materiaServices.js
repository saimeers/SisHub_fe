import axiosInstance from "../config/axios";

const SUBJECTS_BASE = "/materias";

export async function fetchSubjects() {
  const { data } = await axiosInstance.get(`${SUBJECTS_BASE}/`);
  return data;
}

export async function createSubject(subjectPayload) {
  // Espera un objeto con: codigo, nombre, semestre, creditos, prerrequisitos, tipo, id_area
  const { data } = await axiosInstance.post(`${SUBJECTS_BASE}`, subjectPayload);
  return data;
}

export async function getSubjectById(id) {
  const { data } = await axiosInstance.get(`${SUBJECTS_BASE}/${id}`);
  return data;
}

export async function getSubjectByCode(codigo) {
  const { data } = await axiosInstance.get(`${SUBJECTS_BASE}/codigo/${codigo}`);
  return data;
}

export async function updateSubject(id, subjectPayload) {
  // Espera un objeto con: codigo, nombre, semestre, creditos, prerrequisitos, tipo, id_area
  const { data } = await axiosInstance.put(`${SUBJECTS_BASE}/${id}`, subjectPayload);
  return data;
}

export default {
  fetchSubjects,
  createSubject,
  getSubjectById,
  getSubjectByCode,
  updateSubject,
};



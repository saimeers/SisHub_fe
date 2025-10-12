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
  const { data } = await axiosInstance.get(`${SUBJECTS_BASE}/${codigo}`);
  return data;
}

export async function updateSubject(id, subjectPayload) {
  // Espera un objeto con: codigo, nombre, semestre, creditos, prerrequisitos, tipo, id_area
  const { data } = await axiosInstance.put(`${SUBJECTS_BASE}/${id}`, subjectPayload);
  return data;
}

export async function updateSubjectByCode(codigo, subjectPayload) {
  // Actualiza materia por código - solo envía los campos que se quieren modificar
  const { data } = await axiosInstance.put(`${SUBJECTS_BASE}/${codigo}`, subjectPayload);
  return data;
}

export async function getSubjectCodes() {
  const { data } = await axiosInstance.get(`${SUBJECTS_BASE}/codigos`);
  return data;
}

export async function uploadSubjectsCSV(file) {
  const formData = new FormData();
  formData.append("archivo", file);
  
  const { data } = await axiosInstance.post(`${SUBJECTS_BASE}/crear/upload-csv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export default {
  fetchSubjects,
  createSubject,
  getSubjectById,
  getSubjectByCode,
  updateSubject,
  updateSubjectByCode,
  getSubjectCodes,
  uploadSubjectsCSV,
};



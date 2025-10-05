import api from "../config/axios";

const SUBJECTS_BASE = "/materias";

export async function fetchSubjects() {
  const { data } = await api.get(`${SUBJECTS_BASE}/`);
  return data;
}

export default {
  fetchSubjects,
};



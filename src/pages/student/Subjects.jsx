import React, { useEffect, useState } from "react";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import { useNavigate } from "react-router-dom";
import SubjectGrid from "../../modules/admin/components/SubjectGrid";
import { fetchSubjects } from "../../services/materiaServices";

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadSubjects = async () => {
    setIsLoading(true);
    setError("");
    try {
      const list = await fetchSubjects();
      setSubjects(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Error al cargar materias");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  return (
    <StudentLayout title="Materias">
      <div className="flex flex-col gap-4">
        {/* Controles superiores (iguales visualmente que admin, sin botón crear) */}
        <div className="flex flex-wrap gap-3 items-center">
          <button className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-100">
            Todos
          </button>
          <input
            type="text"
            placeholder="Buscar por nombre o codigo"
            className="flex-1 min-w-[240px] border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <button className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-100">
            Ordenar por nombre
          </button>
        </div>

        {isLoading && (
          <div className="text-center text-gray-500 py-16">Cargando...</div>
        )}
        {error && !isLoading && (
          <div className="text-center text-red-600 py-6">{error}</div>
        )}
        {!isLoading && !error && (
          <SubjectGrid
            subjects={subjects}
            onDetails={(subject) => {
              const materia = { value: subject?.id_materia, label: subject?.nombre };
              navigate("/student/groups", { state: { materia } });
            }}
            showSettings={false}
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentSubjects;



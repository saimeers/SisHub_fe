import React, { useEffect, useState } from "react";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import { useNavigate } from "react-router-dom";
import SubjectGrid from "../../modules/admin/components/SubjectGrid";
import SubjectFilters from "../../components/ui/SubjectFilters";
import useSubjectFilters from "../../hooks/useSubjectFilters";
import { fetchSubjects } from "../../services/materiaServices";

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  // Hook para manejar filtros y búsqueda
  const {
    searchTerm,
    filters,
    filteredSubjects,
    handleSearch,
    handleApplyFilters,
    clearAllFilters,
    hasActiveFilters,
  } = useSubjectFilters(subjects);

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
        {/* Componente de filtros */}
        <SubjectFilters
          onSearch={handleSearch}
          onApplyFilters={handleApplyFilters}
          onClearAll={clearAllFilters}
          searchTerm={searchTerm}
          filters={filters}
          showCreateButton={false}
        />

        {/* Indicador de resultados */}
        {hasActiveFilters && (
          <div className="text-sm text-gray-600">
            Mostrando {filteredSubjects.length} de {subjects.length} materias
          </div>
        )}

        {isLoading && (
          <div className="text-center text-gray-500 py-16">Cargando...</div>
        )}
        {error && !isLoading && (
          <div className="text-center text-red-600 py-6">{error}</div>
        )}
        {!isLoading && !error && (
          <SubjectGrid
            subjects={filteredSubjects}
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



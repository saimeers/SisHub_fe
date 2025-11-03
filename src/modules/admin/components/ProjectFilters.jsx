import React, { useState } from "react";
import ProjectFilterModal from "./ProjectFilterModal";
import { FiFilter, FiSearch } from "react-icons/fi";

const ProjectFilters = ({
  onSearch,
  onSearchByStudent,
  onApplyFilters,
  onClearAll,
  searchTerm = "",
  studentCode = "",
  filters = {},
  filterOptions = { tiposAlcance: [], tecnologias: [] },
}) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [localStudentCode, setLocalStudentCode] = useState(studentCode);

  const handleOpenFilters = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilters = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = (newFilters) => {
    onApplyFilters(newFilters);
  };

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleStudentCodeChange = (e) => {
    const value = e.target.value;
    // Solo permitir números
    if (value === "" || /^\d+$/.test(value)) {
      setLocalStudentCode(value);
    }
  };

  // Sincronizar el código local con el prop cuando cambia (incluyendo cuando se limpia)
  React.useEffect(() => {
    console.log("🔄 Sincronizando código de estudiante:", studentCode);
    setLocalStudentCode(studentCode);
  }, [studentCode]);

  const handleSearchStudent = () => {
    if (localStudentCode.trim().length >= 7) {
      onSearchByStudent(localStudentCode.trim());
    }
  };

  const handleKeyPressStudent = (e) => {
    if (e.key === "Enter" && localStudentCode.trim().length >= 7) {
      handleSearchStudent();
    }
  };

  const hasActiveFilters =
    searchTerm || filters.tipoAlcance || filters.tecnologia || studentCode;

  const isValidStudentCode = localStudentCode.trim().length >= 7;

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Controles de filtros y búsqueda */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Botón "Todos" / "Limpiar filtros" */}
          <button
            onClick={onClearAll}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              hasActiveFilters
                ? "border-green-300 text-green-600 hover:bg-green-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {hasActiveFilters ? "Limpiar filtros" : "Todos"}
          </button>

          {/* Barra de búsqueda general */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar por título, descripción, tecnología o palabras clave"
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Buscador de código de estudiante */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={localStudentCode}
              onChange={handleStudentCodeChange}
              onKeyPress={handleKeyPressStudent}
              placeholder="Código estudiante"
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 pl-10 pr-12"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <button
              onClick={handleSearchStudent}
              disabled={!isValidStudentCode}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all ${
                isValidStudentCode
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              title="Buscar estudiante"
            >
              <FiSearch className="text-sm" />
            </button>
          </div>

          {/* Botón de filtros */}
          <button
            onClick={handleOpenFilters}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              hasActiveFilters
                ? "border-green-300 text-green-600 hover:bg-green-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-green-600">
                <FiFilter className="text-base" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Modal de filtros */}
      <ProjectFilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilters}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        filterOptions={filterOptions}
      />
    </>
  );
};

export default ProjectFilters;

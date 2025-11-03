import React, { useState } from "react";
import ProjectFilterModal from "./ProjectFilterModal";
import { FiFilter } from "react-icons/fi";

const ProjectFilters = ({
  onSearch,
  onApplyFilters,
  onClearAll,
  searchTerm = "",
  filters = {},
  filterOptions = { tiposAlcance: [], tecnologias: [] },
}) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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

  const hasActiveFilters =
    searchTerm || filters.tipoAlcance || filters.tecnologia;

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

          {/* Barra de búsqueda */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Busca por título o descripción"
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

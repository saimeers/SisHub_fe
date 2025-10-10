import React, { useState } from "react";
import SearchBar from "./SearchBar";
import FilterModal from "./FilterModal";
import { FiFilter } from "react-icons/fi";

const SubjectFilters = ({
  onSearch,
  onApplyFilters,
  onClearAll,
  searchTerm = "",
  filters = {},
  showCreateButton = false,
  onCreateClick,
  createButtonText = "+ Crear Materias",
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

  const hasActiveFilters = searchTerm || filters.tipo || filters.area;

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Botón crear (solo para admin) */}
        {showCreateButton && (
          <div className="flex justify-end">
            <button
              onClick={onCreateClick}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {createButtonText}
            </button>
          </div>
        )}

        <hr className="border-gray-300" />

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
          <SearchBar
            onSearch={onSearch}
            placeholder="Buscar por nombre o código"
            initialValue={searchTerm}
          />

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
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-green">
                <FiFilter className="text-base" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Modal de filtros */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilters}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </>
  );
};

export default SubjectFilters;

import React, { useState, useEffect } from "react";
import SelectField from "../../../components/ui/SelectField";

const ProjectFilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters = {},
  filterOptions = { tiposAlcance: [], tecnologias: [] },
  loadingTipos = false,
}) => {
  const [filters, setFilters] = useState({
    tipoAlcance: currentFilters.tipoAlcance || "",
    tecnologia: currentFilters.tecnologia || "",
  });

  // Opciones para el tipo de alcance
  const tipoAlcanceOptions = filterOptions.tiposAlcance.map((tipo) => ({
    value: tipo,
    label: tipo,
  }));

  // Opciones para las tecnologías
  const tecnologiaOptions = filterOptions.tecnologias.map((tech) => ({
    value: tech,
    label: tech,
  }));

  // Inicializar filtros cuando cambien los filtros actuales
  useEffect(() => {
    setFilters({
      tipoAlcance: currentFilters.tipoAlcance || "",
      tecnologia: currentFilters.tecnologia || "",
    });
  }, [currentFilters]);

  const handleSelectTipoAlcance = (option) => {
    setFilters((prev) => ({
      ...prev,
      tipoAlcance: option ? option.value : "",
    }));
  };

  const handleSelectTecnologia = (option) => {
    setFilters((prev) => ({
      ...prev,
      tecnologia: option ? option.value : "",
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      tipoAlcance: "",
      tecnologia: "",
    });
  };

  const handleClose = () => {
    setFilters({
      tipoAlcance: currentFilters.tipoAlcance || "",
      tecnologia: currentFilters.tecnologia || "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Filtro por tipo de alcance */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Filtrar por tipo de alcance
            </label>
            {loadingTipos ? (
              <div className="flex items-center justify-center py-3 text-sm text-gray-500">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Cargando tipos de alcance...
              </div>
            ) : (
              <SelectField
                value={
                  tipoAlcanceOptions.find(
                    (option) => option.value === filters.tipoAlcance
                  ) || null
                }
                onChange={handleSelectTipoAlcance}
                options={tipoAlcanceOptions}
                placeholder="Seleccionar tipo de alcance"
                isClearable={true}
                isDisabled={loadingTipos}
              />
            )}
          </div>

          {/* Filtro por tecnología */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Filtrar por tecnología
            </label>
            <SelectField
              value={
                tecnologiaOptions.find(
                  (option) => option.value === filters.tecnologia
                ) || null
              }
              onChange={handleSelectTecnologia}
              options={tecnologiaOptions}
              placeholder="Seleccionar tecnología"
              isClearable={true}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilterModal;

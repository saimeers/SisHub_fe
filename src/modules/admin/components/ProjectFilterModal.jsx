import React, { useState, useEffect } from "react";
import SelectField from "../../../components/ui/SelectField";

const ProjectFilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters = {},
  filterOptions = { tiposAlcance: [], tecnologias: [], estados: [], años: [] },
  loadingTipos = false,
}) => {
  const [filters, setFilters] = useState({
    tipoAlcance: currentFilters.tipoAlcance || "",
    tecnologia: currentFilters.tecnologia || "",
    estado: currentFilters.estado || "",
    avance: currentFilters.avance || "",
    año: currentFilters.año || "",
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

  // Opciones para los estados
  const estadoOptions = filterOptions.estados.map((estado) => ({
    value: estado,
    label: estado,
  }));

  // Opciones para el avance del proyecto
  const avanceOptions = [
    { value: "0-25", label: "0% - 25%" },
    { value: "26-50", label: "26% - 50%" },
    { value: "51-75", label: "51% - 75%" },
    { value: "76-100", label: "76% - 100%" },
  ];

  // Opciones para los años
  const añoOptions = filterOptions.años.map((año) => ({
    value: año,
    label: año,
  }));

  // Inicializar filtros cuando cambien los filtros actuales
  useEffect(() => {
    setFilters({
      tipoAlcance: currentFilters.tipoAlcance || "",
      tecnologia: currentFilters.tecnologia || "",
      estado: currentFilters.estado || "",
      avance: currentFilters.avance || "",
      año: currentFilters.año || "",
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

  const handleSelectEstado = (option) => {
    setFilters((prev) => ({
      ...prev,
      estado: option ? option.value : "",
    }));
  };

  const handleSelectAvance = (option) => {
    setFilters((prev) => ({
      ...prev,
      avance: option ? option.value : "",
    }));
  };

  const handleSelectAño = (option) => {
    setFilters((prev) => ({
      ...prev,
      año: option ? option.value : "",
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
      estado: "",
      avance: "",
      año: "",
    });
  };

  const handleClose = () => {
    setFilters({
      tipoAlcance: currentFilters.tipoAlcance || "",
      tecnologia: currentFilters.tecnologia || "",
      estado: currentFilters.estado || "",
      avance: currentFilters.avance || "",
      año: currentFilters.año || "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro por tipo de alcance */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de alcance
                </label>
                {loadingTipos ? (
                  <div className="flex items-center justify-center py-3 text-sm text-gray-500">
                    <svg
                      className="animate-spin h-4 w-4 mr-2 text-gray-400"
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
                    Cargando...
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
                    placeholder="Seleccionar tipo"
                    isClearable={true}
                    isDisabled={loadingTipos}
                  />
                )}
              </div>

              {/* Filtro por tecnología */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tecnología
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

              {/* Filtro por estado del proyecto */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado del proyecto
                </label>
                <SelectField
                  value={
                    estadoOptions.find(
                      (option) => option.value === filters.estado
                    ) || null
                  }
                  onChange={handleSelectEstado}
                  options={estadoOptions}
                  placeholder="Seleccionar estado"
                  isClearable={true}
                />
              </div>

              {/* Filtro por avance del proyecto */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Avance del proyecto
                </label>
                <SelectField
                  value={
                    avanceOptions.find(
                      (option) => option.value === filters.avance
                    ) || null
                  }
                  onChange={handleSelectAvance}
                  options={avanceOptions}
                  placeholder="Seleccionar rango"
                  isClearable={true}
                />
              </div>

              {/* Filtro por año */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Año
                </label>
                <div className="max-w-xs">
                  <SelectField
                    value={
                      añoOptions.find(
                        (option) => option.value === filters.año
                      ) || null
                    }
                    onChange={handleSelectAño}
                    options={añoOptions}
                    placeholder="Seleccionar año"
                    isClearable={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 flex-shrink-0">
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

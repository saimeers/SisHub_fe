import React, { useState, useEffect } from "react";
import { listarAreas } from "../../services/areaServices";
import SelectField from "./SelectField";

const FilterModal = ({ isOpen, onClose, onApplyFilters, currentFilters = {} }) => {
  const [areas, setAreas] = useState([]);
  const [filters, setFilters] = useState({
    tipo: currentFilters.tipo || "",
    area: currentFilters.area || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Opciones para el tipo de materia
  const tipoOptions = [
    { value: "obligatoria", label: "Obligatoria" },
    { value: "electiva", label: "Electiva" },
  ];

  // Opciones para las áreas
  const areaOptions = areas.map((area) => ({
    value: area.id_area,
    label: area.nombre,
  }));

  // Cargar áreas del conocimiento
  useEffect(() => {
    const loadAreas = async () => {
      try {
        setIsLoading(true);
        const areasData = await listarAreas();
        setAreas(areasData || []);
      } catch (error) {
        console.error("Error al cargar áreas:", error);
        setAreas([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadAreas();
    }
  }, [isOpen]);

  // Inicializar filtros cuando cambien los filtros actuales
  useEffect(() => {
    setFilters({
      tipo: currentFilters.tipo || "",
      area: currentFilters.area || "",
    });
  }, [currentFilters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectTipo = (option) => {
    setFilters(prev => ({
      ...prev,
      tipo: option ? option.value : "",
    }));
  };

  const handleSelectArea = (option) => {
    setFilters(prev => ({
      ...prev,
      area: option ? option.value : "",
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      tipo: "",
      area: "",
    });
  };

  const handleClose = () => {
    setFilters({
      tipo: currentFilters.tipo || "",
      area: currentFilters.area || "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tipo de filtro */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Filtrar por tipo
            </label>
            <SelectField
              value={tipoOptions.find((option) => option.value === filters.tipo) || null}
              onChange={handleSelectTipo}
              options={tipoOptions}
              placeholder="Seleccionar tipo"
              isClearable={true}
            />
          </div>

          {/* Seleccionar valor (Área del conocimiento) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Filtrar por area
            </label>
            <SelectField
              value={areaOptions.find((option) => option.value === filters.area) || null}
              onChange={handleSelectArea}
              options={areaOptions}
              placeholder={isLoading ? "Cargando áreas..." : "Seleccionar área"}
              isClearable={true}
              disabled={isLoading}
            />
            {isLoading && (
              <p className="text-sm text-gray-500">Cargando áreas...</p>
            )}
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
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;

import React, { useState } from "react";
import SelectField from "./SelectField";

const StudentFiltersModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  technologies = [],
  researchLines = [],
}) => {
  const [filters, setFilters] = useState({
    role: "",
    tecnologia: "",
    lineaInvestigacion: "",
  });

  // Build options for selects
  const roleOptions = [
    { value: "lider", label: "Líder" },
    { value: "integrante", label: "Integrante" },
  ];

  const tecnologiaOptions = technologies.map((t) => ({ value: t, label: t }));
  const lineaOptions = researchLines.map((l) => ({ value: l, label: l }));


  const handleSelect = (field) => (option) => {
    setFilters((prev) => ({
      ...prev,
      [field]: option ? option.value : "",
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({ role: "", tecnologia: "", lineaInvestigacion: "" });
  };

  const handleClose = () => {
    setFilters({ role: "", tecnologia: "", lineaInvestigacion: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-visible px-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rol */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <SelectField
                value={roleOptions.find((o) => o.value === filters.role) || null}
                onChange={handleSelect("role")}
                options={roleOptions}
                placeholder="Seleccionar rol"
                isClearable={true}
              />
            </div>
            {/* Tecnología */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tecnología</label>
              <SelectField
                value={tecnologiaOptions.find((o) => o.value === filters.tecnologia) || null}
                onChange={handleSelect("tecnologia")}
                options={tecnologiaOptions}
                placeholder="Seleccionar tecnología"
                isClearable={true}
              />
            </div>
            {/* Línea de Investigación */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Línea de Investigación</label>
              <SelectField
                value={lineaOptions.find((o) => o.value === filters.lineaInvestigacion) || null}
                onChange={handleSelect("lineaInvestigacion")}
                options={lineaOptions}
                placeholder="Seleccionar línea"
                isClearable={true}
              />
            </div>

          </div>
        </div>
        <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 flex-shrink-0">
          <button onClick={handleClear} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Limpiar
          </button>
          <button onClick={handleApply} className="flex-1 px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors">
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFiltersModal;

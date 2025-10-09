import { useState, useMemo } from "react";

const useSubjectFilters = (subjects = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    area: "",
  });

  // Función para aplicar filtros y búsqueda
  const filteredSubjects = useMemo(() => {
    let filtered = [...subjects];

    // Aplicar búsqueda por texto
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((subject) => {
        const nombre = subject.nombre?.toLowerCase() || "";
        const codigo = subject.codigo?.toLowerCase() || "";
        return nombre.includes(searchLower) || codigo.includes(searchLower);
      });
    }

    // Aplicar filtro por tipo
    if (filters.tipo) {
      filtered = filtered.filter((subject) => {
        return subject.tipo?.toLowerCase() === filters.tipo.toLowerCase();
      });
    }

    // Aplicar filtro por área
    if (filters.area) {
      filtered = filtered.filter((subject) => {
        return subject.id_area === parseInt(filters.area);
      });
    }

    return filtered;
  }, [subjects, searchTerm, filters]);

  // Función para actualizar la búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Función para aplicar filtros
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({
      tipo: "",
      area: "",
    });
  };

  // Función para limpiar solo los filtros (no la búsqueda)
  const clearFilters = () => {
    setFilters({
      tipo: "",
      area: "",
    });
  };

  // Obtener información sobre filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (filters.tipo) count++;
    if (filters.area) count++;
    return count;
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = getActiveFiltersCount() > 0;

  return {
    // Estado
    searchTerm,
    filters,
    filteredSubjects,
    
    // Funciones
    handleSearch,
    handleApplyFilters,
    clearAllFilters,
    clearFilters,
    
    // Información
    hasActiveFilters,
    activeFiltersCount: getActiveFiltersCount(),
  };
};

export default useSubjectFilters;

import { useState, useMemo } from "react";

const useGroupFilters = (groups = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    area: "",
  });

  // Función para aplicar filtros y búsqueda
  const filteredGroups = useMemo(() => {
    let filtered = [...groups];

    // Aplicar búsqueda por texto
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((group) => {
        const nombreMateria = group.nombre_materia?.toLowerCase() || "";
        const nombreGrupo =
          group.nombre_grupo?.toLowerCase() ||
          group.nombre?.toLowerCase() ||
          "";
        const codigo =
          group.codigo_materia?.toLowerCase() ||
          group.codigo?.toLowerCase() ||
          "";
        const docente = group.docente?.toLowerCase() || "";

        return (
          nombreMateria.includes(searchLower) ||
          nombreGrupo.includes(searchLower) ||
          codigo.includes(searchLower) ||
          docente.includes(searchLower)
        );
      });
    }

    // Aplicar filtro por tipo
    if (filters.tipo) {
      filtered = filtered.filter((group) => {
        const tipoMateria = group.tipo_materia?.toLowerCase() || "";
        return tipoMateria === filters.tipo.toLowerCase();
      });
    }

    // Aplicar filtro por área
    if (filters.area) {
      filtered = filtered.filter((group) => {
        // filters.area viene como ID numérico del FilterModal
        return group.id_area === parseInt(filters.area);
      });
    }

    return filtered;
  }, [groups, searchTerm, filters]);

  // Función para actualizar la búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Función para aplicar filtros
  const handleApplyFilters = (newFilters) => {
    console.log("Filtros aplicados:", newFilters); // Para debugging
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
    filteredGroups,

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

export default useGroupFilters;
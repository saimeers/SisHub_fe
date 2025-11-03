import { useState, useMemo, useEffect } from "react";
import { listarTiposAlcance } from "../../../services/alcanceService";

const useProjectFilters = (projects, onSearchByStudent) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipoAlcance: "",
    tecnologia: "",
  });
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [tiposAlcanceBackend, setTiposAlcanceBackend] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  // Cargar tipos de alcance desde el backend
  useEffect(() => {
    const cargarTiposAlcance = async () => {
      setLoadingTipos(true);
      try {
        const data = await listarTiposAlcance();
        // Extraer solo los nombres de los tipos de alcance
        const nombres = data.map((tipo) => tipo.nombre);
        setTiposAlcanceBackend(nombres);
      } catch (error) {
        console.error("Error al cargar tipos de alcance:", error);
        setTiposAlcanceBackend([]);
      } finally {
        setLoadingTipos(false);
      }
    };

    cargarTiposAlcance();
  }, []);

  // Detectar si es un código de estudiante (solo números, típicamente 7-10 dígitos)
  const isStudentCode = (value) => {
    const trimmed = value.trim();
    return /^\d{7,10}$/.test(trimmed);
  };

  // Efecto para buscar por estudiante cuando se detecta un código
  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (isStudentCode(trimmed)) {
      setIsSearchingStudent(true);
      // Llamar al endpoint de búsqueda por estudiante
      if (onSearchByStudent) {
        onSearchByStudent(trimmed);
      }
    } else {
      setIsSearchingStudent(false);
    }
  }, [searchTerm, onSearchByStudent]);

  // Obtener todas las opciones únicas de los proyectos
  const filterOptions = useMemo(() => {
    const allTags = new Set();

    projects.forEach((project) => {
      if (Array.isArray(project.tags)) {
        project.tags.forEach((tag) => allTags.add(tag));
      }
    });

    return {
      // Usar los tipos de alcance del backend en lugar de extraerlos de los proyectos
      tiposAlcance: tiposAlcanceBackend,
      tecnologias: Array.from(allTags).sort(),
    };
  }, [projects, tiposAlcanceBackend]);

  // Aplicar filtros y búsqueda
  const filteredProjects = useMemo(() => {
    // Si está buscando por estudiante, no filtrar aquí
    // (los proyectos ya vienen filtrados del backend)
    if (isSearchingStudent) {
      return projects;
    }

    let result = [...projects];

    // Filtrar por búsqueda (título, descripción, tecnologías)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      result = result.filter(
        (project) =>
          project.title?.toLowerCase().includes(search) ||
          project.description?.toLowerCase().includes(search) ||
          project.tags?.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Filtrar por tipo de alcance
    if (filters.tipoAlcance) {
      result = result.filter(
        (project) => project.tipoAlcance === filters.tipoAlcance
      );
    }

    // Filtrar por tecnología
    if (filters.tecnologia) {
      result = result.filter((project) =>
        project.tags?.includes(filters.tecnologia)
      );
    }

    return result;
  }, [projects, searchTerm, filters, isSearchingStudent]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({
      tipoAlcance: "",
      tecnologia: "",
    });
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || filters.tipoAlcance || filters.tecnologia;

  return {
    searchTerm,
    filters,
    filteredProjects,
    filterOptions,
    handleSearch,
    handleApplyFilters,
    clearAllFilters,
    hasActiveFilters,
    isSearchingStudent,
    loadingTipos,
  };
};

export default useProjectFilters;

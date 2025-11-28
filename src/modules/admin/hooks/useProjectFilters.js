import { useState, useMemo, useEffect, useCallback } from "react";
import { listarTiposAlcance } from "../../../services/alcanceService";

const useProjectFilters = (
  projects,
  onSearchByStudent,
  onClearStudentSearch
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [filters, setFilters] = useState({
    tipoAlcance: "",
    tecnologia: "",
    estado: "",
    avance: "",
    año: "",
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

  // Obtener todas las opciones únicas de los proyectos
  const filterOptions = useMemo(() => {
    const allTags = new Set();
    const allEstados = new Set();
    const allAños = new Set();

    projects.forEach((project) => {
      if (Array.isArray(project.tags)) {
        project.tags.forEach((tag) => allTags.add(tag));
      }
      
      if (project.status) {
        allEstados.add(project.status);
      }
      
      // Extraer año de la fecha de creación o usar año actual como fallback
      const currentYear = new Date().getFullYear();
      if (project.createdAt) {
        const projectYear = new Date(project.createdAt).getFullYear();
        allAños.add(projectYear.toString());
      } else {
        allAños.add(currentYear.toString());
      }
    });

    // Generar años desde el más antiguo hasta el actual
    const añosArray = Array.from(allAños);
    const currentYear = new Date().getFullYear();
    const minYear = añosArray.length > 0 ? Math.min(...añosArray.map(Number)) : currentYear;
    const allYears = [];
    for (let year = currentYear; year >= minYear; year--) {
      allYears.push(year.toString());
    }

    return {
      tiposAlcance: tiposAlcanceBackend,
      tecnologias: Array.from(allTags).sort(),
      estados: Array.from(allEstados).sort(),
      años: allYears,
    };
  }, [projects, tiposAlcanceBackend]);


  const filteredProjects = useMemo(() => {

    if (isSearchingStudent) {
      return projects;
    }

    let result = [...projects];

    // Filtrar por búsqueda general (título, descripción, tecnologías y palabras clave)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      result = result.filter(
        (project) =>
          project.title?.toLowerCase().includes(search) ||
          project.description?.toLowerCase().includes(search) ||
          project.tags?.some((tag) => tag.toLowerCase().includes(search)) ||
          project.keywords?.toLowerCase().includes(search)
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

    // Filtrar por estado del proyecto
    if (filters.estado) {
      result = result.filter(
        (project) => project.status === filters.estado
      );
    }

    // Filtrar por avance del proyecto
    if (filters.avance) {
      const [min, max] = filters.avance.split('-').map(Number);
      result = result.filter((project) => {
        const progress = project.progress || 0;
        return progress >= min && progress <= max;
      });
    }

    // Filtrar por año
    if (filters.año) {
      const filterYear = parseInt(filters.año);
      result = result.filter((project) => {
        if (project.createdAt) {
          const projectYear = new Date(project.createdAt).getFullYear();
          return projectYear === filterYear;
        }
        const currentYear = new Date().getFullYear();
        return currentYear === filterYear;
      });
    }

    return result;
  }, [projects, searchTerm, filters, isSearchingStudent]);

  const handleSearch = useCallback(
    (value) => {
      setSearchTerm(value);
      if (isSearchingStudent) {
        setIsSearchingStudent(false);
        setStudentCode("");
      }
    },
    [isSearchingStudent]
  );

  const handleSearchByStudentCode = useCallback(
    (code) => {
      setStudentCode(code);
      setIsSearchingStudent(true);
     
      setSearchTerm("");
      setFilters({
        tipoAlcance: "",
        tecnologia: "",
        estado: "",
        avance: "",
        año: "",
      });
      if (onSearchByStudent) {
        onSearchByStudent(code);
      }
    },
    [onSearchByStudent]
  );

  const handleApplyFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      if (isSearchingStudent) {

        setIsSearchingStudent(false);
        setStudentCode("");
        if (onClearStudentSearch) {
          onClearStudentSearch();
        }
      }
    },
    [isSearchingStudent, onClearStudentSearch]
  );

  const clearAllFilters = useCallback(() => {
    const wasSearchingStudent = isSearchingStudent;

    setSearchTerm("");
    setStudentCode("");
    setFilters({
      tipoAlcance: "",
      tecnologia: "",
      estado: "",
      avance: "",
      año: "",
    });
    setIsSearchingStudent(false);

    if (wasSearchingStudent && onClearStudentSearch) {
      onClearStudentSearch();
    }
  }, [isSearchingStudent, onClearStudentSearch]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    studentCode.trim() !== "" ||
    filters.tipoAlcance ||
    filters.tecnologia ||
    filters.estado ||
    filters.avance ||
    filters.año;

  return {
    searchTerm,
    studentCode,
    filters,
    filteredProjects,
    filterOptions,
    handleSearch,
    handleSearchByStudentCode,
    handleApplyFilters,
    clearAllFilters,
    hasActiveFilters,
    isSearchingStudent,
    loadingTipos,
  };
};

export default useProjectFilters;

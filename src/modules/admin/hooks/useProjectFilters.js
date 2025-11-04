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
      
      // Agregar estados únicos
      if (project.status) {
        allEstados.add(project.status);
      }
      
      // Extraer año de la fecha de creación o usar año actual como fallback
      const currentYear = new Date().getFullYear();
      if (project.createdAt) {
        const projectYear = new Date(project.createdAt).getFullYear();
        allAños.add(projectYear.toString());
      } else {
        // Si no hay fecha, agregar año actual
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

  // Aplicar filtros y búsqueda
  const filteredProjects = useMemo(() => {
    console.log(
      "🔧 Aplicando filtros. isSearchingStudent:",
      isSearchingStudent
    );

    // Si está buscando por estudiante, devolver los proyectos tal cual
    // (ya vienen filtrados del backend)
    if (isSearchingStudent) {
      console.log(
        "✅ Modo búsqueda por estudiante, retornando",
        projects.length,
        "proyectos"
      );
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
        // Si no hay fecha, considerar año actual
        const currentYear = new Date().getFullYear();
        return currentYear === filterYear;
      });
    }

    console.log("✅ Filtros aplicados, retornando", result.length, "proyectos");
    return result;
  }, [projects, searchTerm, filters, isSearchingStudent]);

  const handleSearch = useCallback(
    (value) => {
      console.log("🔎 Búsqueda general actualizada:", value);
      setSearchTerm(value);
      // Si había búsqueda por estudiante, limpiarla
      if (isSearchingStudent) {
        setIsSearchingStudent(false);
        setStudentCode("");
      }
    },
    [isSearchingStudent]
  );

  const handleSearchByStudentCode = useCallback(
    (code) => {
      console.log("👨‍🎓 Buscando por código de estudiante:", code);
      setStudentCode(code);
      setIsSearchingStudent(true);
      // Limpiar búsqueda general y filtros
      setSearchTerm("");
      setFilters({
        tipoAlcance: "",
        tecnologia: "",
        estado: "",
        avance: "",
        año: "",
      });
      // Llamar a la función de búsqueda del padre
      if (onSearchByStudent) {
        onSearchByStudent(code);
      }
    },
    [onSearchByStudent]
  );

  const handleApplyFilters = useCallback(
    (newFilters) => {
      console.log("🎯 Filtros aplicados:", newFilters);
      setFilters(newFilters);
      // Si había una búsqueda por estudiante, limpiarla y recargar proyectos
      if (isSearchingStudent) {
        console.log(
          "🔄 Limpiando búsqueda por estudiante y recargando todos los proyectos"
        );
        setIsSearchingStudent(false);
        setStudentCode("");
        // Llamar a la función para recargar todos los proyectos
        if (onClearStudentSearch) {
          onClearStudentSearch();
        }
      }
    },
    [isSearchingStudent, onClearStudentSearch]
  );

  const clearAllFilters = useCallback(() => {
    console.log("🧹 Limpiando todos los filtros");
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

    // Si estaba buscando por estudiante, recargar todos los proyectos
    if (wasSearchingStudent && onClearStudentSearch) {
      console.log(
        "🔄 Recargando todos los proyectos después de limpiar búsqueda de estudiante"
      );
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

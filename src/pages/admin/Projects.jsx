import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import ApprovedProjectCard from "../../components/ui/ProjectCard";
import ProjectFilters from "../../modules/admin/components/ProjectFilters";
import useProjectFilters from "../../modules/admin/hooks/useProjectFilters";
import {
  listarProyectosParaDirector,
  listarProyectosParaEstudiante,
} from "../../services/projectServices";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchError, setSearchError] = useState(null);

  // Función para buscar proyectos por código de estudiante (memoizada)
  const handleSearchByStudent = useCallback(async (codigo) => {
    console.log("🔍 Buscando proyectos para estudiante:", codigo);
    setIsLoading(true);
    setSearchError(null);
    try {
      const data = await listarProyectosParaEstudiante(codigo);
      console.log("📦 Datos recibidos del backend:", data);

      const mapped = Array.isArray(data)
        ? data.map((p) => {
            console.log("🗺️ Mapeando proyecto:", p.id_proyecto, p.Idea?.titulo);
            return {
              id: p.id_proyecto,
              title: p.Idea?.titulo || `Proyecto ${p.id_proyecto}`,
              description: p.Idea?.objetivo_general || "",
              tags: (p.tecnologias || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              keywords: p.palabras_clave || "",
              status: p.Estado?.descripcion || "EN_CURSO",
              progress: 0,
              logo: null,
              tipoAlcance: p.Tipo_alcance?.nombre,
            };
          })
        : [];

      console.log("✅ Proyectos mapeados:", mapped.length, mapped);
      setProjects(mapped);

      // Mostrar mensaje si no hay resultados
      if (mapped.length === 0) {
        setSearchError(
          `No se encontraron proyectos para el estudiante con código ${codigo}`
        );
      }
    } catch (e) {
      console.error("❌ Error al buscar proyectos por estudiante:", e);
      setSearchError("Error al buscar proyectos del estudiante");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Sin dependencias porque no usa ningún estado externo

  // Función para recargar todos los proyectos
  const reloadAllProjects = useCallback(async () => {
    console.log("🔄 Recargando todos los proyectos...");
    setIsLoading(true);
    setSearchError(null);
    try {
      const data = await listarProyectosParaDirector();
      console.log("📦 Proyectos recargados:", data);

      const mapped = Array.isArray(data)
        ? data.map((p) => ({
            id: p.id_proyecto,
            title: p.Idea?.titulo || `Proyecto ${p.id_proyecto}`,
            description: p.Idea?.objetivo_general || "",
            tags: (p.tecnologias || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            keywords: p.palabras_clave || "",
            status: p.Estado?.descripcion || "EN_CURSO",
            progress: 0,
            logo: null,
            tipoAlcance: p.Tipo_alcance?.nombre,
          }))
        : [];

      console.log("✅ Proyectos recargados:", mapped.length);
      setProjects(mapped);
    } catch (e) {
      console.error("❌ Error al recargar proyectos:", e);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hook para manejar filtros y búsqueda
  const {
    searchTerm,
    studentCode,
    filters,
    filteredProjects,
    filterOptions,
    handleSearch,
    handleSearchByStudentCode,
    handleApplyFilters,
    clearAllFilters: clearFilters,
    hasActiveFilters,
    isSearchingStudent,
    loadingTipos,
  } = useProjectFilters(projects, handleSearchByStudent);

  // Función para limpiar filtros y recargar proyectos
  const handleClearAll = useCallback(() => {
    clearFilters();
    setSearchError(null); // Limpiar el error también
    // Si estaba buscando por estudiante, recargar todos los proyectos
    if (isSearchingStudent) {
      reloadAllProjects();
    }
  }, [clearFilters, isSearchingStudent, reloadAllProjects]);

  // Cargar todos los proyectos inicialmente
  useEffect(() => {
    let mounted = true;

    const fetchProjects = async () => {
      console.log("📋 Cargando todos los proyectos...");
      setIsLoading(true);
      setSearchError(null);
      try {
        const data = await listarProyectosParaDirector();
        if (!mounted) return;
        console.log("📦 Proyectos del director:", data);

        const mapped = Array.isArray(data)
          ? data.map((p) => ({
              id: p.id_proyecto,
              title: p.Idea?.titulo || `Proyecto ${p.id_proyecto}`,
              description: p.Idea?.objetivo_general || "",
              tags: (p.tecnologias || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              keywords: p.palabras_clave || "",
              status: p.Estado?.descripcion || "EN_CURSO",
              progress: 0,
              logo: null,
              tipoAlcance: p.Tipo_alcance?.nombre,
            }))
          : [];

        console.log("✅ Proyectos iniciales cargados:", mapped.length);
        setProjects(mapped);
      } catch (e) {
        console.error("❌ Error al cargar proyectos:", e);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const handleProjectClick = (project) => {
    console.log("Proyecto seleccionado:", project);
    // Aquí se abrirá el detalle del proyecto
  };

  const handleDocumentsClick = (projectId, e) => {
    e?.stopPropagation();
    console.log("Ver documentos del proyecto:", projectId);
    // Aquí se abrirá la vista de documentos
  };

  const handleCodeClick = (projectId, e) => {
    e?.stopPropagation();
    console.log("Ver código del proyecto:", projectId);
    // Aquí se abrirá el repositorio o código
  };

  const handleVersionsClick = (projectId, e) => {
    e?.stopPropagation();
    console.log("Ver versiones del proyecto:", projectId);
    // Aquí se abrirá la gestión de versiones
  };

  console.log("🎯 Estado actual:", {
    isLoading,
    projectsCount: projects.length,
    filteredCount: filteredProjects.length,
    isSearchingStudent,
    searchTerm,
    searchError,
  });

  return (
    <AdminLayout title="Proyectos">
      <div className="w-full max-w-6xl mx-auto py-8 px-6">
        <div className="flex flex-col gap-4">
          {/* Componente de filtros */}
          <ProjectFilters
            onSearch={handleSearch}
            onSearchByStudent={handleSearchByStudentCode}
            onApplyFilters={handleApplyFilters}
            onClearAll={handleClearAll}
            searchTerm={searchTerm}
            studentCode={studentCode}
            filters={filters}
            filterOptions={filterOptions}
            isSearchingStudent={isSearchingStudent}
            loadingTipos={loadingTipos}
          />

          {/* Error de búsqueda - diseño mejorado centrado */}
          {searchError && (
            <div className="text-center py-16 px-6">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No se encontraron proyectos
                </h3>
                <p className="text-gray-500">{searchError}</p>
              </div>
            </div>
          )}

          {/* Indicador de resultados */}
          {hasActiveFilters && !isSearchingStudent && (
            <div className="text-sm text-gray-600">
              Mostrando {filteredProjects.length} de {projects.length} proyectos
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Cargando proyectos...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && projects.length === 0 && !searchError && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-lg">
                No hay proyectos registrados.
              </p>
            </div>
          )}

          {/* No results after filtering */}
          {!isLoading &&
            projects.length > 0 &&
            filteredProjects.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <p className="text-gray-500 text-lg">
                  No se encontraron proyectos con los filtros aplicados.
                </p>
              </div>
            )}

          {/* Projects list */}
          {!isLoading && filteredProjects.length > 0 && (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div key={project.id}>
                  <ApprovedProjectCard
                    title={project.title}
                    description={project.description}
                    tags={project.tags}
                    logo={project.logo}
                    status={project.status}
                    progress={project.progress}
                    tipoAlcance={project.tipoAlcance}
                    onClick={() => handleProjectClick(project)}
                    onDocumentsClick={(e) =>
                      handleDocumentsClick(project.id, e)
                    }
                    onCodeClick={(e) => handleCodeClick(project.id, e)}
                    onVersionsClick={(e) => handleVersionsClick(project.id, e)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Projects;

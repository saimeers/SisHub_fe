import React, { useEffect, useState } from "react";
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

  // Función para buscar proyectos por código de estudiante
  const handleSearchByStudent = async (codigo) => {
    setIsLoading(true);
    setSearchError(null);
    try {
      const data = await listarProyectosParaEstudiante(codigo);
      const mapped = Array.isArray(data)
        ? data.map((p) => ({
            id: p.id_proyecto,
            title: p.Idea?.titulo || `Proyecto ${p.id_proyecto}`,
            description: p.Idea?.objetivo_general || "",
            tags: (p.tecnologias || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            status: undefined,
            progress: 0,
            logo: null,
            tipoAlcance: p.Tipo_alcance?.nombre,
          }))
        : [];

      setProjects(mapped);

      // Mostrar mensaje si no hay resultados
      if (mapped.length === 0) {
        setSearchError(
          `No se encontraron proyectos para el estudiante con código ${codigo}`
        );
      }
    } catch (e) {
      console.error("Error al buscar proyectos por estudiante:", e);
      setSearchError("Error al buscar proyectos del estudiante");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hook para manejar filtros y búsqueda
  const {
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
  } = useProjectFilters(projects, handleSearchByStudent);

  // Cargar todos los proyectos inicialmente
  useEffect(() => {
    let mounted = true;

    const fetchProjects = async () => {
      setIsLoading(true);
      setSearchError(null);
      try {
        const data = await listarProyectosParaDirector();
        if (!mounted) return;
        const mapped = Array.isArray(data)
          ? data.map((p) => ({
              id: p.id_proyecto,
              title: p.Idea?.titulo || `Proyecto ${p.id_proyecto}`,
              description: p.Idea?.objetivo_general || "",
              tags: (p.tecnologias || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              status: undefined,
              progress: 0,
              logo: null,
              tipoAlcance: p.Tipo_alcance?.nombre,
            }))
          : [];
        setProjects(mapped);
      } catch (e) {
        console.error(e);
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

  return (
    <AdminLayout title="Proyectos">
      <div className="w-full max-w-6xl mx-auto py-8 px-6">
        <div className="flex flex-col gap-4">
          {/* Componente de filtros */}
          <ProjectFilters
            onSearch={handleSearch}
            onApplyFilters={handleApplyFilters}
            onClearAll={clearAllFilters}
            searchTerm={searchTerm}
            filters={filters}
            filterOptions={filterOptions}
            isSearchingStudent={isSearchingStudent}
            loadingTipos={loadingTipos}
          />

          {/* Indicador de búsqueda por estudiante */}
          {isSearchingStudent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              🔍 Buscando proyectos del estudiante con código:{" "}
              <strong>{searchTerm}</strong>
            </div>
          )}

          {/* Error de búsqueda */}
          {searchError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
              ⚠️ {searchError}
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

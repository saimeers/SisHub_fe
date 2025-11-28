import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import ApprovedProjectCard from "../../components/ui/ProjectCard";
import ProjectFilters from "../../modules/admin/components/ProjectFilters";
import useProjectFilters from "../../modules/admin/hooks/useProjectFilters";
import ProjectVersionsView from "../../components/ui/ProjectVersionsView";
import ProjectDocumentsView from "../../components/ui/ProjectDocumentsView";
import ProjectDevelopmentView from "../../components/ui/ProjectDevelopmentView";
import ProjectDetailsView from "../../components/ui/ProjectDetailsView";
import {
  listarProyectosParaDirector,
  listarProyectosParaEstudiante,
  exportarProyectosExcel,
  exportarProyectosPDF,
} from "../../services/projectServices";
import ExportProjectsModal from "../../modules/admin/components/ExportProjectsModal";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchError, setSearchError] = useState(null);

  const [currentView, setCurrentView] = useState("list");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Función para buscar proyectos por código de estudiante
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
              progress: p.porcentaje || 0,
              logo: null,
              tipoAlcance: p.Tipo_alcance?.nombre || p.TipoAlcance?.nombre,
            };
          })
        : [];

      console.log("✅ Proyectos mapeados:", mapped.length, mapped);
      setProjects(mapped);

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
  }, []); 

  // Función para recargar todos los proyectos
  const reloadAllProjects = useCallback(async () => {
    setIsLoading(true);
    setSearchError(null);
    try {
      const data = await listarProyectosParaDirector();

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
            progress: p.porcentaje || 0,
            logo: null,
            tipoAlcance: p.Tipo_alcance?.nombre || p.TipoAlcance?.nombre,
          }))
        : [];

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
    setSearchError(null); 
    if (isSearchingStudent) {
      reloadAllProjects();
    }
  }, [clearFilters, isSearchingStudent, reloadAllProjects]);

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
              keywords: p.palabras_clave || "",
              status: p.Estado?.descripcion || "EN_CURSO",
              progress: p.porcentaje || 0,
              logo: null,
              tipoAlcance: p.Tipo_alcance?.nombre || p.TipoAlcance?.nombre,
            }))
          : [];

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
    setSelectedProjectId(project.id);
    setCurrentView("details");
  };

  const handleDocumentsClick = (projectId, e) => {
    e?.stopPropagation();
    setSelectedProjectId(projectId);
    setCurrentView("documents");
  };

  const handleCodeClick = (projectId, e) => {
    e?.stopPropagation();
    setSelectedProjectId(projectId);
    setCurrentView("development");
  };

  const handleVersionsClick = (projectId, e) => {
    e?.stopPropagation();
    setSelectedProjectId(projectId);
    setCurrentView("versions");
  };

  // Función para manejar la exportación
  const handleExport = async (formato, tipoFiltro, filtros) => {
    try {
      let blob;
      const nombreArchivo = formato === "excel" ? "proyectos.xlsx" : "proyectos.pdf";
      
      if (formato === "excel") {
        blob = await exportarProyectosExcel(tipoFiltro, filtros);
      } else {
        blob = await exportarProyectosPDF(tipoFiltro, filtros);
      }

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar:", error);
      throw error;
    }
  };

  

  const renderContent = () => {
    if (currentView === "details" && selectedProjectId) {
      return (
        <ProjectDetailsView
          projectId={selectedProjectId}
          onBack={() => setCurrentView("list")}
        />
      );
    }
    if (currentView === "versions" && selectedProjectId) {
      return (
        <ProjectVersionsView
          projectId={selectedProjectId}
          onBack={() => setCurrentView("list")}
        />
      );
    }
    if (currentView === "documents" && selectedProjectId) {
      return (
        <ProjectDocumentsView
          projectId={selectedProjectId}
          onBack={() => setCurrentView("list")}
        />
      );
    }
    if (currentView === "development" && selectedProjectId) {
      return (
        <ProjectDevelopmentView
          projectId={selectedProjectId}
          onBack={() => setCurrentView("list")}
        />
      );
    }

    return (
      <>
        {/* Botón de exportar y filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex-1">
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
          </div>
          
          {/* Botón de exportar */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="bg-[#B70000] hover:bg-red-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exportar Proyectos
          </button>
        </div>

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
        {!isLoading && projects.length > 0 && filteredProjects.length === 0 && (
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
                  onDocumentsClick={(e) => handleDocumentsClick(project.id, e)}
                  onCodeClick={(e) => handleCodeClick(project.id, e)}
                  onVersionsClick={(e) => handleVersionsClick(project.id, e)}
                />
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <AdminLayout title="Proyectos">
      <div className="w-full max-w-6xl mx-auto py-8 px-6">
        <div className="flex flex-col gap-4">
          {renderContent()}
          
          {/* Modal de exportación */}
          <ExportProjectsModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onExport={handleExport}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Projects;

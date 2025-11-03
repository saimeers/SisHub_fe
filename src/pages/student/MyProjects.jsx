import React, { useEffect, useMemo, useState } from "react";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import ApprovedProjectCard from "../../components/ui/ProjectCard";
import ProjectVersionsView from "../../components/ui/ProjectVersionsView";
import ProjectDocumentsView from "../../components/ui/ProjectDocumentsView";
import ProjectDevelopmentView from "../../components/ui/ProjectDevelopmentView";
import ProjectDetailsView from "../../components/ui/ProjectDetailsView";
import ProjectFilters from "../../modules/admin/components/ProjectFilters";
import useProjectFilters from "../../modules/admin/hooks/useProjectFilters";
import { useAuth } from "../../contexts/AuthContext";
import { listarProyectosParaEstudiante } from "../../services/projectServices";

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const { userData } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!userData?.codigo) return;
      try {
        const data = await listarProyectosParaEstudiante(userData.codigo);
        const mapped = Array.isArray(data)
          ? data.map((p) => ({
              id: p.id_proyecto,
              title: p.Idea?.titulo || `Proyecto ${p.id_proyecto}`,
              description: p.Idea?.objetivo_general || "",
              tags: (p.tecnologias || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              status: p.Estado?.descripcion || "EN_CURSO",
              logo: null,
              tipoAlcance: p.Tipo_alcance?.nombre || p.TipoAlcance?.nombre,
              progress: p.porcentaje || 0,
            }))
          : [];
        setProjects(mapped);
      } catch (e) {
        console.error(e);
        setProjects([]);
      }
    };
    load();
  }, [userData]);

  // Filtros similares a admin
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
  } = useProjectFilters(projects, async () => {});

  // Vistas
  const [currentView, setCurrentView] = useState("list");
  const [selectedProjectId, setSelectedProjectId] = useState(null);

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
        <div className="mb-6">
          <ProjectFilters
            onSearch={handleSearch}
            onSearchByStudent={handleSearchByStudentCode}
            onApplyFilters={handleApplyFilters}
            onClearAll={clearFilters}
            searchTerm={searchTerm}
            studentCode={studentCode}
            filters={filters}
            filterOptions={filterOptions}
            isSearchingStudent={isSearchingStudent}
            loadingTipos={loadingTipos}
          />
        </div>

        {hasActiveFilters && (
          <div className="text-sm text-gray-600 mb-2">
            Mostrando {filteredProjects.length} de {projects.length} proyectos
          </div>
        )}

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-100 rounded-2xl">
            <p className="text-gray-500 text-lg">No se encontraron proyectos.</p>
          </div>
        ) : (
          <div className="space-y-4 ">
            {filteredProjects.map((project) => (
              <ApprovedProjectCard
                key={project.id}
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
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <StudentLayout title="Mis Proyectos">
      <div className="w-full max-w-6xl mx-auto py-8 px-6">{renderContent()}</div>
    </StudentLayout>
  );
};

export default MyProjects;

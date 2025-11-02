import React, { useEffect, useState } from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import ApprovedProjectCard from "../../components/ui/ProjectCard";
import { listarProyectosParaDirector } from "../../services/projectServices";

const Projects = () => {
  // Estado para proyectos - cargados desde el backend
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchProjects = async () => {
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
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg">
              No hay proyectos registrados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
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
                {/* Información adicional para el admin
                {project.grupo && (
                  <div className="mt-2 ml-32 text-sm text-gray-600">
                    <span className="font-semibold">Grupo:</span> {project.grupo}
                    {project.docente && (
                      <>
                        {" • "}
                        <span className="font-semibold">Docente:</span>{" "}
                        {project.docente}
                      </>
                    )}
                  </div>
                )} */}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Projects;

import React, { useEffect, useState } from "react";
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import ApprovedProjectCard from "../../components/ui/ProjectCard";
import { useAuth } from "../../contexts/AuthContext";
import { listarProyectosParaDocente } from "../../services/projectServices";

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const { userData } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!userData?.codigo) return;
      try {
        const data = await listarProyectosParaDocente(userData.codigo);
        const mapped = Array.isArray(data)
          ? data.map((p) => ({
              id: p.id_proyecto,
              title: p.Idea?.titulo || `Proyecto ${p.id_proyecto}`,
              description: p.Idea?.objetivo_general || "",
              secondaryText: Array.isArray(p.materias)
                ? p.materias.map((m) => m?.nombre).filter(Boolean).join(" • ")
                : "",
              tags: (p.tecnologias || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              status: undefined,
              logo: null,
              tipoAlcance: p.Tipo_alcance?.nombre,
              progress: 0,
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

  const handleProjectClick = (project) => {
    console.log("Proyecto seleccionado para evaluar:", project);
    // Aquí se abrirá el detalle del proyecto para evaluar
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

  return (
    <ProfessorLayout title="Mis Proyectos">
      <div className="w-full max-w-6xl mx-auto py-8 px-6">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg">No hay proyectos pendientes de evaluación.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id}>
                <ApprovedProjectCard
                  title={project.title}
                  description={project.description}
                  secondaryText={project.secondaryText}
                  tags={project.tags}
                  logo={project.logo}
                  status={project.status}
                  progress={project.progress}
                  tipoAlcance={project.tipoAlcance}
                  onClick={() => handleProjectClick(project)}
                  onDocumentsClick={(e) => handleDocumentsClick(project.id, e)}
                  onCodeClick={(e) => handleCodeClick(project.id, e)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfessorLayout>
  );
};

export default MyProjects;

import React, { useEffect, useMemo, useState } from "react";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import ApprovedProjectCard from "../../components/ui/ProjectCard";
import SearchBar from "../../components/ui/SearchBar";
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
              title: `Proyecto ${p.id_proyecto}`,
              description: p.Idea?.objetivo_general || "",
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

  const [query, setQuery] = useState("");
  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => {
      const inTitle = (p.title || "").toLowerCase().includes(q);
      const inTags = (p.tags || []).some((t) => String(t).toLowerCase().includes(q));
      return inTitle || inTags;
    });
  }, [projects, query]);

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

  return (
    <StudentLayout title="Mis Proyectos">
      <div className="w-full max-w-6xl mx-auto py-8 px-6">
        <div className="mb-4 flex items-center">
          <SearchBar placeholder="Buscar por nombre o tecnología" onSearch={setQuery} />
        </div>
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
              />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default MyProjects;

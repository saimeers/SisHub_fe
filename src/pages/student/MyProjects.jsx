import React, { useState, useMemo } from "react";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import ApprovedProjectCard from "../../components/ui/ProjectCard";
import SearchBar from "../../components/ui/SearchBar";

const MyProjects = () => {
  // Estado para proyectos - luego se cargará desde el backend
  const [projects] = useState([
    {
      id: 1,
      title: "Software gimnasio klisman",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      tags: ["Node.js", "React.jsx"],
      status: "aprobado",
      logo: null,
    },
    {
      id: 2,
      title: "Aplicativo web para rendimiento estudiantil",
      description:
        "Sistema web para gestionar y analizar el rendimiento académico de los estudiantes.",
      tags: ["React", "Express", "MongoDB"],
      status: "en revisión",
      logo: null,
    },
    {
      id: 3,
      title: "Software para optimizar la toma de decisiones",
      description:
        "Herramienta de apoyo para la toma de decisiones empresariales basada en datos.",
      tags: ["Python", "Django", "PostgreSQL"],
      status: "corregido",
      logo: null,
    },
  ]);

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

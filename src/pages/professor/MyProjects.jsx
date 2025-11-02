import React, { useState } from "react";
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import ApprovedProjectCard from "../../components/ui/ProjectCard";

const MyProjects = () => {
  // Estado para proyectos a evaluar - luego se cargará desde el backend
  const [projects] = useState([
    {
      id: 1,
      title: "Software gimnasio klisman",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      tags: ["Node.js", "React.jsx"],
      status: "en revisión",
      logo: null,
      grupo: "Fisica Mecanica | Grupo A | 2025-1",
      estudiantes: ["Andres Lopez", "Saimer Adrian Saavedra Rojas"],
    },
    {
      id: 2,
      title: "Aplicativo web para rendimiento estudiantil",
      description:
        "Sistema web para gestionar y analizar el rendimiento académico de los estudiantes.",
      tags: ["React", "Express", "MongoDB"],
      status: "corregido",
      logo: null,
      grupo: "Matemáticas Discretas | Grupo B | 2025-1",
      estudiantes: ["Henry Alexander Blanco Rolon"],
    },
    {
      id: 3,
      title: "Software para optimizar la toma de decisiones",
      description:
        "Herramienta de apoyo para la toma de decisiones empresariales basada en datos.",
      tags: ["Python", "Django", "PostgreSQL"],
      status: "en revisión",
      logo: null,
      grupo: "Algoritmos y Estructuras | Grupo C | 2025-1",
      estudiantes: ["Estudiante 1", "Estudiante 2", "Estudiante 3"],
    },
  ]);

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
            <p className="text-gray-500 text-lg">
              No hay proyectos pendientes de evaluación.
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

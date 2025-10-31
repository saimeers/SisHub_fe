import React, { useState } from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import ApprovedProjectCard from "../../components/ui/ApprovedProjectCard";

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
      grupo: "Fisica Mecanica | Grupo A | 2025-1",
      docente: "Profesor Ejemplo",
    },
    {
      id: 2,
      title: "Aplicativo web para rendimiento estudiantil",
      description:
        "Sistema web para gestionar y analizar el rendimiento académico de los estudiantes.",
      tags: ["React", "Express", "MongoDB"],
      status: "en revisión",
      logo: null,
      grupo: "Matemáticas Discretas | Grupo B | 2025-1",
      docente: "Profesor Ejemplo 2",
    },
  ]);

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
    <AdminLayout title="Proyectos">
      <div className="w-full max-w-6xl mx-auto py-8 px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proyectos</h1>
          <p className="text-gray-600">
            Vista general de todos los proyectos del sistema.
          </p>
        </div>

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
                  onClick={() => handleProjectClick(project)}
                  onDocumentsClick={(e) => handleDocumentsClick(project.id, e)}
                  onCodeClick={(e) => handleCodeClick(project.id, e)}
                />
                {/* Información adicional para el admin */}
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MyProjects;


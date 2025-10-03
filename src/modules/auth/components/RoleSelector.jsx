import React from "react";
import ButtonGoogle from "../../../components/ButtonGoogle";

function RoleSelector({ onRoleSelect, loading }) {
  const roles = [
    {
      id: "ESTUDIANTE",
      title: "Estudiante",
      description: "Entra para registrar proyectos, y ver la evolución de tu perfil.",
    },
    {
      id: "DOCENTE",
      title: "Profesor",
      description: "Entra crea grupos, y gestiona los proyectos de tus estudiantes.",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 mb-16">
      {roles.map((role, index) => (
        <React.Fragment key={role.id}>
          <div className="flex flex-col items-center text-center max-w-xs">
            <h2 className="text-xl font-semibold mb-2">{role.title}</h2>
            <p className="text-gray-500 mb-4">{role.description}</p>
            <ButtonGoogle
              onClick={() => onRoleSelect(role.id)}
              text={`Como ${role.title.toLowerCase()}`}
              disabled={loading}
            />
          </div>

          {index < roles.length - 1 && (
            <div className="hidden md:block w-px bg-gray-300"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default RoleSelector;
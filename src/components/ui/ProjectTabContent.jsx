import React from "react";
import Button from "./Button";

const MENSAJES = {
  estudiante: "No hay ideas de proyecto creadas",
  default: "No hay actividades creadas para este grupo"
};

const ProjectTabContent = ({ perfil, onCrearActividad }) => {
  const esEstudiante = perfil === "estudiante";
  return (
    <div className="text-center py-12 text-gray-500 flex flex-col gap-4 items-center">
      <p>{esEstudiante ? MENSAJES.estudiante : MENSAJES.default}</p>
      <Button
        text={esEstudiante ? "Proponer idea" : "+ crear actividad"}
        onClick={onCrearActividad}
      />
    </div>
  );
};

export default ProjectTabContent;

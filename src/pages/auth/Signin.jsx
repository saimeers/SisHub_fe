import React from "react";
import ButtonGoogle from "../../components/ButtonGoogle";

function Signin() {
  const handleGoogleLoginStudent = () => {
    console.log("Registro como estudiante...");
  };

  const handleGoogleLoginTeacher = () => {
    console.log("Registro como profesor...");
  };

  return (
    <div className="flex h-screen bg-[#7DABF7]">
      <div className="hidden md:flex w-1/2 bg-[#7DABF7] justify-center items-center">
        <img
          src="/img/logo.png"
          alt="Logo SisHub"
          className="w-60 md:w-72 object-contain"
        />
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-6 md:px-12 rounded-tl-4xl rounded-bl-4xl shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-12">Registro</h1>
        <p className="text-gray-600 text-center mb-8">
          Elige el rol para continuar con el registro en el sistema
        </p>

        <div className="flex flex-col md:flex-row gap-8 mb-16">
          <div className="flex flex-col items-center text-center max-w-xs">
            <h2 className="text-xl font-semibold mb-2">Estudiante</h2>
            <p className="text-gray-500 mb-4">
              Entra y resuelve los cuestionarios de perfiles de aprendizaje
              asignados por tu profesor
            </p>
            <ButtonGoogle
              onClick={handleGoogleLoginStudent}
              text="Como estudiante"
            />
          </div>

          <div className="hidden md:block w-px bg-gray-300"></div>

          <div className="flex flex-col items-center text-center max-w-xs">
            <h2 className="text-xl font-semibold mb-2">Profesor</h2>
            <p className="text-gray-500 mb-4">
              Entra y crea grupos, asígnales cuestionarios y analiza sus
              resultados
            </p>
            <ButtonGoogle
              onClick={handleGoogleLoginTeacher}
              text="Como profesor"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;

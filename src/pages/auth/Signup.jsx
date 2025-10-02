import React from "react";
import { useNavigate } from "react-router-dom";
import ButtonGoogle from "../../components/ButtonGoogle";
import { signInWithGoogle } from "../../services/authService";

function Signup() {
  const navigate = useNavigate();

  const handleGoogleLogin = async (rol) => {
    try {
      const { user, token } = await signInWithGoogle();
      
      // Guardar datos en localStorage
      localStorage.setItem("firebaseToken", token);
      localStorage.setItem("rolSeleccionado", rol); // "ESTUDIANTE" o "DOCENTE"
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.displayName);
      
      // Redirigir al formulario de completar datos
      navigate("/registro/completar-datos");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión con Google. Por favor intenta de nuevo.");
    }
  };

  return (
    <div className="flex h-screen bg-[#C03030]">
      {/* Logo izquierdo */}
      <div className="hidden md:flex w-1/2 bg-[#C03030] justify-center items-center">
        <img
          src="/img/logo.png"
          alt="Logo SisHub"
          className="w-60 md:w-72 object-contain"
        />
      </div>

      {/* Formulario derecho */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-6 md:px-12 rounded-tl-4xl rounded-bl-4xl shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-12">Registro</h1>
        <p className="text-gray-600 text-center mb-8">
          Elige el rol para continuar con el registro en el sistema
        </p>

        <div className="flex flex-col md:flex-row gap-8 mb-16">
          {/* Opción Estudiante */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <h2 className="text-xl font-semibold mb-2">Estudiante</h2>
            <p className="text-gray-500 mb-4">
              Entra para registrar proyectos, y ver la evolución de tu perfil.
            </p>
            <ButtonGoogle
              onClick={() => handleGoogleLogin("ESTUDIANTE")}
              text="Como estudiante"
            />
          </div>

          {/* Divisor */}
          <div className="hidden md:block w-px bg-gray-300"></div>

          {/* Opción Profesor */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <h2 className="text-xl font-semibold mb-2">Profesor</h2>
            <p className="text-gray-500 mb-4">
              Entra crea grupos, y gestiona los proyectos de tus estudiantes. 
            </p>
            <ButtonGoogle
              onClick={() => handleGoogleLogin("DOCENTE")}
              text="Como profesor"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
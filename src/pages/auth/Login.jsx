import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonGoogle from "../../components/ButtonGoogle";
import Button from "../../components/Button";
import FieldText from "../../components/FieldText";
import FieldPassword from "../../components/FieldPassword";
import { signInWithGoogle, signInWithEmail } from "../../services/authService";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { user, token } = await signInWithEmail(
        formData.email,
        formData.password
      );

      localStorage.setItem("firebaseToken", token);
      localStorage.setItem("userName", user.displayName || "");
      localStorage.setItem("userEmail", user.email);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error login:", err);
      
      // Manejo de errores específicos de Firebase
      if (err.code === "auth/user-not-found") {
        setError("No existe una cuenta con ese correo");
      } else if (err.code === "auth/wrong-password") {
        setError("Contraseña incorrecta");
      } else if (err.code === "auth/invalid-credential") {
        setError("Credenciales inválidas. ¿Registraste una contraseña?");
      } else if (err.code === "auth/invalid-email") {
        setError("El formato del correo es inválido");
      } else if (err.code === "auth/missing-password") {
        setError("Por favor ingresa tu contraseña");
      } else if (err.code === "auth/too-many-requests") {
        setError("Demasiados intentos fallidos. Intenta más tarde");
      } else {
        setError("Error al iniciar sesión. Verifica tus credenciales");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const { user, token } = await signInWithGoogle();

      localStorage.setItem("firebaseToken", token);
      localStorage.setItem("userName", user.displayName || "");
      localStorage.setItem("userEmail", user.email);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error Google login:", err);
      
      // Manejo de errores específicos de Google
      if (err.code === "auth/popup-closed-by-user") {
        setError("Cerraste la ventana de inicio de sesión");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Operación cancelada");
      } else if (err.code === "auth/popup-blocked") {
        setError("El navegador bloqueó la ventana emergente");
      } else {
        setError("No se pudo iniciar sesión con Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#7DABF7]">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-6 md:px-12 rounded-tr-4xl rounded-br-4xl shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Iniciar Sesión</h1>

        {error && (
          <div className="w-full max-w-sm bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          className="w-full max-w-sm flex flex-col"
          onSubmit={handleEmailLogin}
        >
          <label className="text-sm font-medium mb-1" htmlFor="email">
            Correo electrónico
          </label>
          <FieldText
            type="email"
            id="email"
            name="email"
            placeholder="Introduzca su correo aquí"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="text-sm font-medium mt-4 mb-1" htmlFor="password">
            Contraseña
          </label>
          <FieldPassword
            id="password"
            name="password"
            placeholder="••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="flex justify-end">
            <a
              href="#"
              className="text-xs text-gray-500 mt-1 hover:underline"
            >
              ¿Olvidó su contraseña?
            </a>
          </div>

          <div className="mt-6 flex justify-center">
            <Button text={loading ? "Ingresando..." : "Iniciar"} disabled={loading} />
          </div>
        </form>

        <p className="text-sm text-gray-600 text-center mt-2">
          ¿No tienes cuenta?{" "}
          <a href="/registro" className="text-[#4285F4] font-medium hover:underline">
            Regístrate
          </a>
        </p>

        <div className="flex items-center my-4 w-full max-w-sm">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-sm text-gray-500">o</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="flex justify-center">
          <ButtonGoogle onClick={handleGoogleLogin} text="Continuar con Google" />
        </div>
      </div>

      <div className="hidden md:flex w-1/2 bg-[#7DABF7] justify-center items-center">
        <img
          src="/img/logo.png"
          alt="Logo SisHub"
          className="w-60 md:w-72 object-contain"
        />
      </div>
    </div>
  );
}

export default Login;
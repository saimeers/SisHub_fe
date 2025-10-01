import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FieldText from "../../components/FieldText";
import Button from "../../components/Button";
import { registrarUsuario } from "../../services/userServices";

function FormRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    codigo: "",
    fechaNacimiento: "",
    documento: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verificar que exista token de Firebase, si no redirigir a registro
    const token = localStorage.getItem("firebaseToken");
    if (!token) {
      alert("Debes iniciar sesión primero");
      navigate("/registro");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error al escribir
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validaciones básicas
    if (!formData.documento || !formData.telefono || !formData.codigo) {
      setError("Por favor completa todos los campos obligatorios (*)");
      return;
    }

    setLoading(true);

    try {
      // Obtener datos guardados en localStorage
      const rol = localStorage.getItem("rolSeleccionado");
      const nombre = localStorage.getItem("userName");

      // Llamar al servicio de registro
      const data = await registrarUsuario({
        documento: formData.documento,
        telefono: formData.telefono,
        codigo: formData.codigo,
        rol: rol,
        nombre: nombre,
        fechaNacimiento: formData.fechaNacimiento || null,
      });

      if (data.ok) {
        alert(`¡Registro exitoso! Bienvenido ${data.usuario.nombre}`);
        
        // Limpiar datos temporales del localStorage
        localStorage.removeItem("rolSeleccionado");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        
        // Redirigir al dashboard o home
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Error al registrar usuario. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#7DABF7]">
      {/* Logo izquierdo */}
      <div className="hidden md:flex w-1/2 bg-[#7DABF7] justify-center items-center">
        <img
          src="/img/logo.png"
          alt="Logo SisHub"
          className="w-60 md:w-72 object-contain"
        />
      </div>

      {/* Formulario derecho */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-6 md:px-12 rounded-tl-4xl rounded-bl-4xl shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Completa tus datos</h1>

        {/* Mensaje de error */}
        {error && (
          <div className="w-full max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-4"
        >
          {/* Código y Fecha de nacimiento */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block" htmlFor="codigo">
                Código *
              </label>
              <FieldText
                type="text"
                id="codigo"
                name="codigo"
                placeholder="Ingrese su código"
                value={formData.codigo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block" htmlFor="fechaNacimiento">
                Fecha de nacimiento
              </label>
              <FieldText
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Documento */}
          <div>
            <label className="text-sm font-medium mb-1 block" htmlFor="documento">
              Documento de identidad *
            </label>
            <FieldText
              type="text"
              id="documento"
              name="documento"
              placeholder="Ingrese su documento"
              value={formData.documento}
              onChange={handleChange}
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-sm font-medium mb-1 block" htmlFor="telefono">
              Teléfono *
            </label>
            <FieldText
              type="tel"
              id="telefono"
              name="telefono"
              placeholder="Ingrese su teléfono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>

          {/* Botón de registro */}
          <div className="mt-4 flex justify-center">
            <Button 
              text={loading ? "Registrando..." : "Registrar"} 
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormRegister;
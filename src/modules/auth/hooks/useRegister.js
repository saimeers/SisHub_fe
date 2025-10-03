import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registrarUsuario } from "../../../services/userServices";
import { linkPassword } from "../../../services/authService";
import { validateRegistrationForm } from "../utils/formValidator";
import { useToast } from "../../../hooks/useToast";

export const useRegister = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    codigo: "",
    fechaNacimiento: "",
    documento: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("firebaseToken");
    if (!token) {
      toast.error("Debes iniciar sesión primero");
      navigate("/registro");
    }
  }, [navigate, toast]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      toast.error(validation.firstError);
      return;
    }

    setLoading(true);

    const registroPromise = async () => {
      const rol = localStorage.getItem("rolSeleccionado");
      const nombre = localStorage.getItem("userName");

      const data = await registrarUsuario({
        documento: formData.documento,
        telefono: formData.telefono,
        codigo: formData.codigo,
        rol: rol,
        nombre: nombre,
        fechaNacimiento: formData.fechaNacimiento || null,
      });

      if (!data.ok) {
        throw new Error(data.message || "Error al registrar usuario");
      }

      if (formData.password) {
        try {
          await linkPassword(formData.password);
          console.log("Contraseña vinculada exitosamente");
        } catch (firebaseError) {
          console.error("Error al vincular contraseña:", firebaseError);
        }
      }

      return data;
    };

    try {
      const data = await toast.promise(
        registroPromise(),
        {
          loading: 'Registrando usuario...',
          success: `¡Registro exitoso! Bienvenido ${localStorage.getItem("userName")}`,
          error: 'Error al registrar usuario',
        }
      );

      if (data.ok) {
        localStorage.removeItem("rolSeleccionado");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");

        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleChange,
    handleSubmit,
  };
};
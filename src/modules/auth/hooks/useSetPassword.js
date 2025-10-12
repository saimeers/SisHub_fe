import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { linkPassword } from "../../../services/authService";
import { obtenerUsuario } from "../../../services/userServices";
import { userHasPasswordProvider } from "../utils/passwordValidator";
import { useToast } from "../../../hooks/useToast";

const useSetPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const auth = getAuth();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verificarEstado = async () => {
      const user = auth.currentUser;

      // Si no hay usuario autenticado, redirigir a login
      if (!user) {
        toast.error("Debes iniciar sesión primero");
        navigate("/login");
        return;
      }

      // Si ya tiene contraseña, redirigir al dashboard
      if (userHasPasswordProvider()) {
        try {
          const res = await obtenerUsuario();
          const usuario = res?.data?.usuario || res?.data || res?.usuario || res;
          const rol = usuario?.Rol?.descripcion;

          if (rol) {
            navigate(`/${rol.toLowerCase()}/dashboard`, { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } catch (error) {
          console.error("Error al verificar usuario:", error);
        }
      }
    };

    verificarEstado();
  }, []); // ✅ Dependencias vacías para que solo se ejecute una vez

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePasswordStrength = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(password),
    };

    const allValid = Object.values(validations).every((v) => v === true);
    return { validations, allValid };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar fortaleza de contraseña
    const { allValid } = validatePasswordStrength(formData.password);
    if (!allValid) {
      toast.error("La contraseña no cumple con todos los requisitos de seguridad");
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await toast.promise(
        linkPassword(formData.password),
        {
          loading: "Estableciendo contraseña...",
          success: "¡Contraseña establecida exitosamente!",
          error: "Error al establecer contraseña",
        }
      );

      // Obtener información del usuario
      const res = await obtenerUsuario();
      const usuario = res?.data?.usuario || res?.data || res?.usuario || res;
      const rol = usuario?.Rol?.descripcion;

      // ✅ Recargar completamente para actualizar el AuthContext
      if (rol) {
        window.location.href = `/${rol.toLowerCase()}/dashboard`;
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error al establecer contraseña:", error);
      
      if (error.code === "auth/provider-already-linked") {
        toast.error("Ya tienes una contraseña establecida");
      } else if (error.code === "auth/weak-password") {
        toast.error("La contraseña es muy débil");
      } else {
        toast.error("Error al establecer la contraseña");
      }
      
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

export default useSetPassword;
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../../hooks/useToast";
import { verifyResetCode, confirmNewPassword } from "../../../services/authService";

export const useResetPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [oobCode, setOobCode] = useState(null);
  const [codeUsed, setCodeUsed] = useState(false); 


  useEffect(() => {
    if (codeUsed) return; 

    const code = searchParams.get("oobCode");
    const mode = searchParams.get("mode");

    if (!code || mode !== "resetPassword") {
      toast.error("El enlace no es válido o ha expirado");
      navigate("/login");
      return;
    }

    setOobCode(code);

    // Verificar código en Firebase
    verifyResetCode(code)
      .then((email) => {
        setUserEmail(email);
      })
      .catch((err) => {
        console.error("Error verificando código:", err);
        toast.error("El enlace de restablecimiento no es válido o expiró");
        navigate("/login");
      })
      .finally(() => setVerifyingCode(false));
  }, [searchParams, navigate, toast, codeUsed]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password) => {
    const validations = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(password),
    };

    const allValid = Object.values(validations).every((v) => v === true);
    return { validations, allValid };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const { allValid } = validatePassword(formData.newPassword);
    if (!allValid) {
      toast.error("La contraseña no cumple con los requisitos de seguridad");
      return;
    }

    setLoading(true);
    try {
      await confirmNewPassword(oobCode, formData.newPassword);

      setCodeUsed(true); 
      toast.success("¡Contraseña actualizada exitosamente!");

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      toast.error("Error al restablecer la contraseña. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    verifyingCode,
    userEmail,
    handleChange,
    handleSubmit,
  };
};

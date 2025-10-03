import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../../../services/authService";
import { isEmailDomainAllowed } from "../utils/emailValidator";
import { getAuthErrorMessage } from "../utils/authErrorHandler";
import { useToast } from "../../../hooks/useToast";

export const useSignup = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const ALLOWED_DOMAINS = ['ufps.edu.co'];

  const saveUserData = (user, token, rol) => {
    localStorage.setItem("firebaseToken", token);
    localStorage.setItem("rolSeleccionado", rol);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userName", user.displayName);
  };

  const handleRoleSelection = async (rol) => {
    setLoading(true);

    try {
      const { user, token } = await signInWithGoogle();

      if (!isEmailDomainAllowed(user.email, ALLOWED_DOMAINS)) {
        toast.warning(
          `Solo se permiten correos institucionales`,
          { autoClose: 5000 }
        );
        setLoading(false);
        return;
      }

      saveUserData(user, token, rol);
      
      toast.info('Completa tu registro para continuar');
      
      navigate("/registro/completar-datos");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      
      toast.error(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleRoleSelection,
    allowedDomains: ALLOWED_DOMAINS,
  };
};
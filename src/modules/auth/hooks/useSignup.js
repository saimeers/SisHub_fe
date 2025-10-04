import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, deleteCurrentUser } from "../../../services/authService";
import { isEmailDomainAllowed } from "../utils/emailValidator";
import { getAuthErrorMessage } from "../utils/authErrorHandler";
import { useToast } from "../../../hooks/useToast";
import { signOutAccount } from "../../../services/authService";
import { obtenerUsuario } from "../../../services/userServices";

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
      const { user, token, isNewUser } = await signInWithGoogle();

      // Validar dominio del correo
      if (!isEmailDomainAllowed(user.email, ALLOWED_DOMAINS)) {
        await deleteCurrentUser(user);
        toast.warning("Solo se permiten correos institucionales", { autoClose: 5000 });
        setLoading(false);
        return;
      }

      if (isNewUser) {
        // Caso: usuario nuevo -> siempre va a completar perfil
        saveUserData(user, token, rol);
        navigate("/complete-profile");
      } else {
        // Caso: ya existe en Firebase, verificar si está en la BD
        try {
          const usuario = await obtenerUsuario();

          if (usuario) {
            toast.info("Esta cuenta ya existe. Por favor inicia sesión.");
            await signOutAccount();
            localStorage.clear();
            navigate("/login");
          } else {
            saveUserData(user, token, rol);
            navigate("/complete-profile");
          }
        } catch (error) {
          saveUserData(user, token, rol);
          navigate("/complete-profile");
        }
      }
    } catch (err) {
      console.error("Error al registrar:", err);
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
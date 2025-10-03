import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOutAccount, signInWithGoogle, signInWithEmail, deleteCurrentUser } from "../../../services/authService";
import { getAuthErrorMessage } from "../utils/authErrorHandler";
import { isEmailDomainAllowed } from "../utils/emailValidator";
import { useToast } from "../../../hooks/useToast";
import { formatShortName } from "../../../utils/nameFormatter";


export const useAuth = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const ALLOWED_DOMAINS = ['ufps.edu.co'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveUserData = (user, token) => {
    localStorage.setItem("firebaseToken", token);
    localStorage.setItem("userName", user.displayName || "");
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userPhoto", user.photoURL || "");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, token } = await signInWithEmail(
        formData.email,
        formData.password
      );

      if (!isEmailDomainAllowed(user.email, ALLOWED_DOMAINS)) {
        await deleteCurrentUser();

        toast.warning(
          `Solo se permiten correos institucionales.`,
          { autoClose: 5000 }
        );
        setLoading(false);
        return;
      }

      saveUserData(user, token);

      toast.success(`¡Bienvenido${formatShortName(user.displayName) ? ' ' + formatShortName(user.displayName) : ''}!`);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error login:", err);

      toast.error(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const { user, token } = await signInWithGoogle();

      // Validar dominio del correo
      if (!isEmailDomainAllowed(user.email, ALLOWED_DOMAINS)) {
        await deleteCurrentUser();

        toast.warning(
          `Solo se permiten correos institucionales.`,
          { autoClose: 5000 }
        );
        setLoading(false);
        return;
      }

      saveUserData(user, token);

      toast.success(`¡Bienvenido${formatShortName(user.displayName) ? ' ' + formatShortName(user.displayName) : ''}!`);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error Google login:", err);

      toast.error(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const userName = localStorage.getItem("userName") || "";
      toast.success(`¡Hasta luego${formatShortName(userName) ? ' ' + formatShortName(userName) : ''}!`);

      await signOutAccount();
      localStorage.clear(); 
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión. Intenta de nuevo.");
    }
  };

  return {
    formData,
    loading,
    handleChange,
    handleEmailLogin,
    handleGoogleLogin,
    handleSignOut,
  };
};
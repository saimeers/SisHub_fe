import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOutAccount, signInWithGoogle, signInWithEmail, deleteCurrentUser } from "../../../services/authService";
import { obtenerUsuario } from "../../../services/userServices";
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

  const verificarEstadoUsuario = (usuario, userName) => {
    const estado = usuario.Estado?.descripcion;

    if (estado === "STAND_BY") {
      toast.warning(
        "Tu cuenta está en espera de aprobación. Un administrador revisará tu solicitud pronto.",
        { autoClose: 6000 }
      );
      navigate("/cuenta-pendiente");
      return false;
    }

    if (estado === "RECHAZADO") {
      toast.error(
        "Tu solicitud ha sido rechazada. Contacta con el administrador para más información.",
        { autoClose: 6000 }
      );
      signOutAccount();
      localStorage.clear();
      navigate("/login");
      return false;
    }

    if (estado === "INHABILITADO") {
      toast.error(
        "Tu cuenta ha sido deshabilitada. Contacta con el administrador.",
        { autoClose: 6000 }
      );
      signOutAccount();
      localStorage.clear();
      navigate("/login");
      return false;
    }

    toast.success(`¡Bienvenido ${formatShortName(userName) || ''}!`);
    navigate(`/${usuario.Rol.descripcion.toLowerCase()}/dashboard`);
    return true;
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

      try {
        const usuario = await obtenerUsuario();

        if (usuario) {
          verificarEstadoUsuario(usuario, user.displayName);
        } else {
          toast.warning("Debes completar tu registro antes de continuar.");
          navigate("/signup");
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        toast.warning("Debes completar tu registro antes de continuar.");
        navigate("/signup");
      }

    } catch (err) {
      localStorage.clear();
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

      try {
        const usuario = await obtenerUsuario();

        if (usuario) {
          verificarEstadoUsuario(usuario, user.displayName);
        } else {
          toast.warning("Debes completar tu registro antes de continuar.");
          navigate("/signup");
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        toast.warning("Debes completar tu registro antes de continuar.");
        navigate("/signup");
      }

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
      toast.error("Error al cerrar sesión. Intenta de nuevo.");
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
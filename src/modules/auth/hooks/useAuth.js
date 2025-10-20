import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signOutAccount,
  signInWithGoogle,
  signInWithEmail,
  deleteCurrentUser,
} from "../../../services/authService";
import { obtenerUsuario } from "../../../services/userServices";
import { getAuthErrorMessage } from "../utils/authErrorHandler";
import { isEmailDomainAllowed } from "../utils/emailValidator";
import { userHasPasswordProvider } from "../utils/passwordValidator";
import { useToast } from "../../../hooks/useToast";
import { formatShortName } from "../../../utils/nameFormatter";

export const useAuthForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const ALLOWED_DOMAINS = ["ufps.edu.co"];

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
    const rol = usuario.Rol?.descripcion;

    if (estado === "STAND_BY") {
      toast.warning(
        "Tu cuenta está en espera de aprobación. Un administrador revisará tu solicitud pronto.",
        { autoClose: 6000 }
      );
      navigate("/cuenta-pendiente");
      return { valido: false, rol };
    }

    if (estado === "RECHAZADO") {
      toast.error(
        "Tu solicitud ha sido rechazada. Contacta con el administrador para más información.",
        { autoClose: 6000 }
      );
      signOutAccount();
      localStorage.clear();
      navigate("/login");
      return { valido: false, rol };
    }

    if (estado === "INHABILITADO") {
      toast.error(
        "Tu cuenta ha sido deshabilitada. Contacta con el administrador.",
        { autoClose: 6000 }
      );
      signOutAccount();
      localStorage.clear();
      navigate("/login");
      return { valido: false, rol };
    }

    if (rol === "DOCENTE" && !userHasPasswordProvider()) {
      toast.warning(
        "Como docente, debes establecer una contraseña para continuar.",
        { autoClose: 6000 }
      );
      navigate("/establecer-contrasena");
      return { valido: false, rol };
    }

    if (rol === "ESTUDIANTE" && !userHasPasswordProvider()) {
      toast.warning("Debes establecer una contraseña para continuar.", {
        autoClose: 6000,
      });
      navigate("/establecer-contrasena");
      return { valido: false, rol };
    }

    return { valido: true, rol };
  };

  const validarYRedirigirUsuario = async (user, token) => {
    saveUserData(user, token);

    try {
      const res = await obtenerUsuario();
      const usuario = res?.data?.usuario || res?.data || res?.usuario || res;

      // ✅ Verificar si el usuario existe realmente en la BD
      if (usuario && (usuario.id || usuario.IdUsuario || usuario.Rol)) {
        const { valido, rol } = verificarEstadoUsuario(usuario, user.displayName);
        if (!valido) return;

        const pendingJoin = localStorage.getItem("pendingJoinGroup");
        localStorage.setItem("userData", JSON.stringify(usuario));

        toast.success(`¡Bienvenido ${formatShortName(user.displayName) || ""}!`);

        if (pendingJoin) {
          if (rol?.toUpperCase() === "ESTUDIANTE") {
            localStorage.removeItem("intentionalLogoutForJoin");
            navigate(`/join-group${pendingJoin}`);
          } else {
            localStorage.removeItem("pendingJoinGroup");
            localStorage.removeItem("intentionalLogoutForJoin");
            toast.warning(
              "Solo los estudiantes pueden unirse a grupos mediante código de acceso."
            );
            navigate(`/${rol?.toLowerCase()}/dashboard`);
          }
        } else {
          navigate(`/${rol?.toLowerCase()}/dashboard`);
        }
      } else {
        // 🚫 Usuario autenticado en Firebase pero NO registrado en BD
        await deleteCurrentUser();
        toast.error(
          "Tu cuenta no está registrada en el sistema. Acceso denegado.",
          { autoClose: 6000 }
        );
        localStorage.clear();
        navigate("/login");
        return;
      }
    } catch (error) {
      console.error("Error al obtener usuario:", error);

      if (error.response?.status === 404) {
        await deleteCurrentUser();
        toast.error(
          "Tu cuenta no está registrada en el sistema. Acceso denegado.",
          { autoClose: 6000 }
        );
        localStorage.clear();
        navigate("/login");
      } else {
        toast.error("Error al validar tu cuenta. Intenta de nuevo.");
        await signOutAccount();
        localStorage.clear();
        navigate("/login");
      }
    }
  };


  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, token } = await signInWithEmail(
        formData.email,
        formData.password
      );

      // Preservar pendingJoinGroup si existe (venga de donde venga)
      const pendingJoin = localStorage.getItem("pendingJoinGroup");
      const intentionalLogout = localStorage.getItem(
        "intentionalLogoutForJoin"
      );

      localStorage.clear();

      // Restaurar pendingJoinGroup si existe
      if (pendingJoin) {
        localStorage.setItem("pendingJoinGroup", pendingJoin);
      }
      // Restaurar flag si existía
      if (intentionalLogout === "true") {
        localStorage.setItem("intentionalLogoutForJoin", "true");
      }

      if (!isEmailDomainAllowed(user.email, ALLOWED_DOMAINS)) {
        await deleteCurrentUser();
        toast.warning(`Solo se permiten correos institucionales.`, {
          autoClose: 5000,
        });
        setLoading(false);
        return;
      }

      await validarYRedirigirUsuario(user, token);
    } catch (err) {
      // En caso de error también preservar si es necesario
      const pendingJoin = localStorage.getItem("pendingJoinGroup");
      const intentionalLogout = localStorage.getItem(
        "intentionalLogoutForJoin"
      );

      localStorage.clear();

      if (pendingJoin) {
        localStorage.setItem("pendingJoinGroup", pendingJoin);
      }

      if (intentionalLogout === "true") {
        localStorage.setItem("intentionalLogoutForJoin", "true");
      }

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

      // Preservar pendingJoinGroup si existe (venga de donde venga)
      const pendingJoin = localStorage.getItem("pendingJoinGroup");
      const intentionalLogout = localStorage.getItem(
        "intentionalLogoutForJoin"
      );

      localStorage.clear();

      // Restaurar pendingJoinGroup si existe
      if (pendingJoin) {
        localStorage.setItem("pendingJoinGroup", pendingJoin);
      } else {
        console.log("Login normal, sin pendingJoinGroup");
      }

      // Restaurar flag si existía
      if (intentionalLogout === "true") {
        localStorage.setItem("intentionalLogoutForJoin", "true");
      }

      if (!isEmailDomainAllowed(user.email, ALLOWED_DOMAINS)) {
        await deleteCurrentUser();
        toast.warning(`Solo se permiten correos institucionales.`, {
          autoClose: 5000,
        });
        setLoading(false);
        return;
      }

      await validarYRedirigirUsuario(user, token);
    } catch (err) {
      console.error("Error Google login:", err);

      const pendingJoin = localStorage.getItem("pendingJoinGroup");
      const intentionalLogout = localStorage.getItem(
        "intentionalLogoutForJoin"
      );

      localStorage.clear();

      if (pendingJoin) {
        localStorage.setItem("pendingJoinGroup", pendingJoin);
      }

      if (intentionalLogout === "true") {
        localStorage.setItem("intentionalLogoutForJoin", "true");
      }

      toast.error(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const userName = localStorage.getItem("userName") || "";
      toast.success(
        `¡Hasta luego${formatShortName(userName) ? " " + formatShortName(userName) : ""
        }!`
      );

      await signOutAccount();

      await new Promise(resolve => setTimeout(resolve, 100));

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

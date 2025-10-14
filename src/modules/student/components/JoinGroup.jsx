import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { joinGroupByAccessKey } from "../../../services/groupUserServices";
import { useAuth } from "../../../contexts/AuthContext";
import { Loader2, CheckCircle, XCircle, LogIn, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOutAccount } from "../../../services/authService";

const JoinGroup = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const hasExecuted = useRef(false);

  const [status, setStatus] = useState("Verificando sesión...");
  const [statusType, setStatusType] = useState("loading");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Evitar ejecuciones múltiples
    if (hasExecuted.current) return;

    const ejecutarJoin = async () => {
      try {
        // PASO 1: Obtener parámetros
        const pendingJoin = localStorage.getItem("pendingJoinGroup");
        const search = pendingJoin || window.location.search;
        const params = new URLSearchParams(search);

        const codigo_materia = params.get("codigo_materia");
        const nombre = params.get("nombre");
        const periodo = params.get("periodo");
        const anio = params.get("anio");
        const clave_acceso = params.get("clave");

        // PASO 2: Validar parámetros
        if (!codigo_materia || !nombre || !periodo || !anio || !clave_acceso) {
          setStatus("Enlace inválido o datos incompletos.");
          setStatusType("error");
          hasExecuted.current = true;
          return;
        }

        // PASO 3: Verificar si hay token (sesión activa)
        const firebaseToken = localStorage.getItem("firebaseToken");

        // Si hay token pero userData es null, esperar más tiempo
        if (firebaseToken && !userData) {
          setStatus("Cargando información del usuario...");
          // No marcar como ejecutado para que se reintente
          return;
        }

        // PASO 4: Crear clave única para evitar duplicados
        const joinKey = `join_${codigo_materia}_${nombre}_${periodo}_${anio}_${clave_acceso}`;
        const alreadyAttempted = sessionStorage.getItem(joinKey);

        if (
          alreadyAttempted === "processing" ||
          alreadyAttempted === "completed"
        ) {
          console.log("Ya procesado anteriormente");
          setStatus("Ya procesado. Redirigiendo...");
          setStatusType("success");
          localStorage.removeItem("pendingJoinGroup");
          localStorage.removeItem("intentionalLogoutForJoin");
          setTimeout(
            () => navigate("/student/my-groups", { replace: true }),
            1200
          );
          return;
        }

        // PASO 5: Si no hay token ni userData, redirigir a login
        if (!firebaseToken && !userData) {
          console.log("🔒 Sin sesión - Guardando en pendingJoinGroup");
          setStatus("🔒 Debes iniciar sesión para unirte al grupo.");
          setStatusType("warning");
          hasExecuted.current = true;

          // Guardar los parámetros para después del login
          if (!pendingJoin) {
            localStorage.setItem("pendingJoinGroup", window.location.search);
          }

          setTimeout(() => navigate("/login", { replace: true }), 1500);
          return;
        }

        // PASO 6: Validar que userData esté disponible
        if (!userData || !userData.codigo) {
          // No marcar como ejecutado, permitir que se reintente
          return;
        }

        // PASO 7: Validar que es estudiante
        const rol = userData.Rol?.descripcion || userData.rol;
        const userName =
          userData.nombre || localStorage.getItem("userName") || "";
        console.log("Rol detectado:", rol);

        if (rol && rol.toUpperCase() !== "ESTUDIANTE") {
          console.log("Usuario no es estudiante - Rol:", rol);
          setStatus(
            `Solo los estudiantes pueden unirse a grupos.\n\nEstás conectado como: ${userName}\nRol: ${rol}`
          );
          setStatusType("error");
          hasExecuted.current = true;
          // NO limpiar pendingJoinGroup aquí para que persista si hace logout
          return;
        }

        // PASO 8: Marcar como procesando
        sessionStorage.setItem(joinKey, "processing");
        hasExecuted.current = true;

        setStatus("Uniéndose al grupo...");
        setStatusType("loading");

        // PASO 9: Intentar unirse al grupo
        const payload = {
          codigo_usuario: userData.codigo,
          codigo_materia,
          nombre_grupo: nombre,
          periodo,
          anio,
          clave_acceso,
        };

        const response = await joinGroupByAccessKey(payload);

        // Marcar como completado
        sessionStorage.setItem(joinKey, "completed");
        setStatus("Te has unido correctamente al grupo.");
        setStatusType("success");

        // Limpiar pendingJoinGroup y la flag
        localStorage.removeItem("pendingJoinGroup");
        localStorage.removeItem("intentionalLogoutForJoin");

        setTimeout(
          () => navigate("/student/my-groups", { replace: true }),
          2000
        );
      } catch (error) {
        console.error("Error en ejecutarJoin:", error);

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;

        // Si ya está inscrito, considéralo éxito
        if (
          error.response?.status === 409 ||
          errorMessage?.includes("ya está")
        ) {
          const params = new URLSearchParams(
            localStorage.getItem("pendingJoinGroup") || window.location.search
          );
          const joinKey = `join_${params.get("codigo_materia")}_${params.get(
            "nombre"
          )}_${params.get("periodo")}_${params.get("anio")}_${params.get(
            "clave"
          )}`;
          sessionStorage.setItem(joinKey, "completed");

          setStatus(" Ya estás inscrito en este grupo.");
          setStatusType("warning");

          localStorage.removeItem("pendingJoinGroup");
          localStorage.removeItem("intentionalLogoutForJoin");
          setTimeout(
            () => navigate("/student/my-groups", { replace: true }),
            2000
          );
        } else {
          // Error real
          setStatus(` Error: ${errorMessage || "No se pudo unir al grupo"}`);
          setStatusType("error");

          // Permitir reintentar
          const params = new URLSearchParams(
            localStorage.getItem("pendingJoinGroup") || window.location.search
          );
          const joinKey = `join_${params.get("codigo_materia")}_${params.get(
            "nombre"
          )}_${params.get("periodo")}_${params.get("anio")}_${params.get(
            "clave"
          )}`;
          sessionStorage.removeItem(joinKey);
          hasExecuted.current = false;
        }
      }
    };

    // Ejecutar con un pequeño delay para dar tiempo al AuthContext
    const timer = setTimeout(() => {
      ejecutarJoin();
    }, 500);

    return () => clearTimeout(timer);
  }, [userData, navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Guardar pendingJoin y marcar que viene de un logout intencional para join
      const pendingJoin =
        localStorage.getItem("pendingJoinGroup") || window.location.search;

      await signOutAccount();
      localStorage.clear();

      // Restaurar con una flag especial
      if (pendingJoin) {
        localStorage.setItem("pendingJoinGroup", pendingJoin);
        localStorage.setItem("intentionalLogoutForJoin", "true");
      }
      navigate("/login", { replace: true });
    } catch (error) {
      setIsLoggingOut(false);
    }
  };

  const handleGoToDashboard = () => {
    const rol = userData?.Rol?.descripcion || userData?.rol;
    if (rol) {
      localStorage.removeItem("pendingJoinGroup");
      localStorage.removeItem("intentionalLogoutForJoin");
      const dashboardRoute = `/${rol.toLowerCase()}/dashboard`;
      navigate(dashboardRoute, { replace: true });
    }
  };

  const getIcon = () => {
    switch (statusType) {
      case "success":
        return <CheckCircle className="text-green-500 w-10 h-10 mb-3" />;
      case "error":
        return <XCircle className="text-red-600 w-10 h-10 mb-3" />;
      case "warning":
        return <LogIn className="text-orange-500 w-10 h-10 mb-3" />;
      default:
        return <Loader2 className="animate-spin text-red-500 w-10 h-10 mb-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md text-center border border-red-100"
      >
        <div className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={statusType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {getIcon()}
            </motion.div>
          </AnimatePresence>

          <h1 className="text-2xl font-extrabold text-red-700 mb-2">
            Unirse al grupo
          </h1>
          <p
            className={`text-base mb-4 whitespace-pre-line ${
              statusType === "error"
                ? "text-red-600"
                : statusType === "success"
                ? "text-green-600"
                : statusType === "warning"
                ? "text-orange-600"
                : "text-gray-700"
            }`}
          >
            {status}
          </p>

          {statusType === "error" && userData && (
            <div className="flex flex-col gap-3 w-full mt-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={isLoggingOut}
                className="w-full px-5 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cerrando sesión...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full px-5 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                onClick={handleGoToDashboard}
              >
                Ir al dashboard
              </motion.button>
            </div>
          )}

          {statusType === "error" && !userData && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-5 py-2 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default JoinGroup;

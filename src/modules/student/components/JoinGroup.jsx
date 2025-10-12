import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { joinGroupByAccessKey } from "../../../services/groupUserServices";
import { useAuth } from "../../../contexts/AuthContext";
import { Loader2, CheckCircle, XCircle, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const JoinGroup = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const hasExecuted = useRef(false);

  const [status, setStatus] = useState("Verificando sesión...");
  const [statusType, setStatusType] = useState("loading");

  useEffect(() => {
    if (hasExecuted.current) return;

    const ejecutarJoin = async () => {
      const pendingJoin = localStorage.getItem("pendingJoinGroup");
      const search = pendingJoin || window.location.search;
      const params = new URLSearchParams(search);

      const codigo_materia = params.get("codigo_materia");
      const nombre = params.get("nombre");
      const periodo = params.get("periodo");
      const anio = params.get("anio");
      const clave_acceso = params.get("clave");

      const joinKey = `join_${codigo_materia}_${nombre}_${periodo}_${anio}_${clave_acceso}`;
      const alreadyAttempted = sessionStorage.getItem(joinKey);

      if (
        alreadyAttempted === "processing" ||
        alreadyAttempted === "completed"
      ) {
        setStatus("✅ Ya procesado. Redirigiendo...");
        setStatusType("success");
        localStorage.removeItem("pendingJoinGroup");
        setTimeout(
          () => navigate("/student/my-groups", { replace: true }),
          1200
        );
        return;
      }

      if (!codigo_materia || !nombre || !periodo || !anio || !clave_acceso) {
        setStatus("❌ Enlace inválido o datos incompletos.");
        setStatusType("error");
        hasExecuted.current = true;
        return;
      }

      if (!userData || !userData.codigo) {
        setStatus("🔒 Debes iniciar sesión para unirte al grupo.");
        setStatusType("warning");
        hasExecuted.current = true;
        if (!pendingJoin)
          localStorage.setItem("pendingJoinGroup", window.location.search);
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      sessionStorage.setItem(joinKey, "processing");
      hasExecuted.current = true;

      setStatus("Uniéndose al grupo...");
      setStatusType("loading");

      const payload = {
        codigo_usuario: userData.codigo,
        codigo_materia,
        nombre_grupo: nombre,
        periodo,
        anio,
        clave_acceso,
      };

      try {
        const response = await joinGroupByAccessKey(payload);
        sessionStorage.setItem(joinKey, "completed");
        setStatus("🎉 Te has unido correctamente al grupo.");
        setStatusType("success");
        localStorage.removeItem("pendingJoinGroup");
        setTimeout(
          () => navigate("/student/my-groups", { replace: true }),
          2000
        );
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;

        if (
          error.response?.status === 409 ||
          errorMessage?.includes("ya está")
        ) {
          sessionStorage.setItem(joinKey, "completed");
          setStatus("⚠️ Ya estás inscrito en este grupo.");
          setStatusType("warning");
          localStorage.removeItem("pendingJoinGroup");
          setTimeout(
            () => navigate("/student/my-groups", { replace: true }),
            2000
          );
        } else {
          setStatus(`❌ Error: ${errorMessage || "No se pudo unir al grupo"}`);
          setStatusType("error");
          sessionStorage.removeItem(joinKey);
          hasExecuted.current = false;
        }
      }
    };

    ejecutarJoin();
  }, [userData, navigate]);

  const getIcon = () => {
    switch (statusType) {
      case "success":
        return <CheckCircle className="text-red-500 w-10 h-10 mb-3" />;
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
            className={`text-base mb-4 ${
              statusType === "error"
                ? "text-red-600"
                : statusType === "success"
                ? "text-green-600"
                : "text-gray-700"
            }`}
          >
            {status}
          </p>

          {statusType === "error" && (
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

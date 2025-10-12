import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { joinGroupByAccessKey } from "../../../services/groupUserServices";
import { useAuth } from "../../../contexts/AuthContext";

const JoinGroup = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const hasExecuted = useRef(false); // 🔥 Ref para controlar ejecución

  const [status, setStatus] = useState("Verificando sesión...");

  useEffect(() => {
    // 🔥 BLOQUEO ABSOLUTO: Si ya se ejecutó, salir inmediatamente
    if (hasExecuted.current) {
      console.log("⏹️ useEffect bloqueado - ya se ejecutó");
      return;
    }

    const ejecutarJoin = async () => {
      // Obtener parámetros
      const pendingJoin = localStorage.getItem("pendingJoinGroup");
      const search = pendingJoin || window.location.search;
      const params = new URLSearchParams(search);

      const codigo_materia = params.get("codigo_materia");
      const nombre = params.get("nombre");
      const periodo = params.get("periodo");
      const anio = params.get("anio");
      const clave_acceso = params.get("clave");

      // Crear una clave única para este intento de join específico
      const joinKey = `join_${codigo_materia}_${nombre}_${periodo}_${anio}_${clave_acceso}`;

      // 🔥 VERIFICAR SI YA SE INTENTÓ ESTE JOIN ESPECÍFICO EN SESSIONSTORAGE
      const alreadyAttempted = sessionStorage.getItem(joinKey);
      if (
        alreadyAttempted === "processing" ||
        alreadyAttempted === "completed"
      ) {
        console.log(
          "⏹️ Este join ya está siendo procesado o completado:",
          alreadyAttempted
        );
        setStatus("✅ Ya procesado. Redirigiendo...");

        // Limpiar y redirigir
        localStorage.removeItem("pendingJoinGroup");
        setTimeout(() => {
          navigate("/student/my-groups", { replace: true });
        }, 1000);
        return;
      }

      console.log("🔍 Estado actual:", {
        userData: userData ? "Sí" : "No",
        codigo: userData?.codigo,
        joinKey,
      });

      console.log("📋 Parámetros extraídos:", {
        codigo_materia,
        nombre,
        periodo,
        anio,
        clave_acceso,
      });

      // Validar parámetros primero
      if (!codigo_materia || !nombre || !periodo || !anio || !clave_acceso) {
        console.error("❌ Parámetros inválidos");
        setStatus("❌ Enlace inválido o datos incompletos.");
        hasExecuted.current = true; // 🔥 Marcar como ejecutado
        return;
      }

      // Si no hay userData, redirigir a login
      if (!userData || !userData.codigo) {
        console.log("🔒 Sin userData, redirigiendo a login");

        if (!pendingJoin) {
          localStorage.setItem("pendingJoinGroup", window.location.search);
          console.log("💾 Join guardado en localStorage");
        }

        setStatus("🔒 Debes iniciar sesión para unirte al grupo.");
        hasExecuted.current = true; // 🔥 Marcar como ejecutado
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      // 🔥 MARCAR COMO "PROCESSING" ANTES DE LA PETICIÓN
      sessionStorage.setItem(joinKey, "processing");
      hasExecuted.current = true; // 🔥 Marcar como ejecutado
      console.log("🔒 Join marcado como PROCESSING:", joinKey);

      setStatus("Uniéndose al grupo...");

      const payload = {
        codigo_usuario: userData.codigo,
        codigo_materia,
        nombre_grupo: nombre,
        periodo,
        anio,
        clave_acceso,
      };

      console.log("🚀 Enviando petición con:", payload);

      try {
        const response = await joinGroupByAccessKey(payload);

        console.log("✅ Respuesta exitosa:", response);

        // 🔥 MARCAR COMO COMPLETADO
        sessionStorage.setItem(joinKey, "completed");

        setStatus("🎉 Te has unido correctamente al grupo.");

        // Limpiar pendingJoinGroup
        localStorage.removeItem("pendingJoinGroup");
        console.log("🗑️ pendingJoinGroup eliminado");

        setTimeout(() => {
          console.log("➡️ Navegando a my-groups");
          navigate("/student/my-groups", { replace: true });
        }, 2000);
      } catch (error) {
        console.error("❌ Error completo:", error);
        console.error("📄 Error response:", error.response);
        console.error("📄 Error data:", error.response?.data);
        console.error("📄 Error status:", error.response?.status);

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;

        if (
          error.response?.status === 409 ||
          errorMessage?.includes("ya está")
        ) {
          sessionStorage.setItem(joinKey, "completed"); // Ya estaba inscrito
          setStatus("⚠️ Ya estás inscrito en este grupo.");
          localStorage.removeItem("pendingJoinGroup");
          setTimeout(
            () => navigate("/student/my-groups", { replace: true }),
            2000
          );
        } else {
          setStatus(`❌ Error: ${errorMessage || "No se pudo unir al grupo"}`);
          // 🔥 Si falla, permitir reintentar eliminando la marca
          sessionStorage.removeItem(joinKey);
          hasExecuted.current = false; // Permitir reintentar
        }
      }
    };

    ejecutarJoin();
  }, [userData, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow text-center w-96">
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          Unirse al grupo
        </h1>
        <p className="text-gray-600 mb-4">{status}</p>

        {/* Debug info */}
        <div className="text-xs text-gray-400 text-left mt-4 p-2 bg-gray-50 rounded">
          <p>Usuario: {userData?.codigo || "No disponible"}</p>
          <p>Ejecutado: {hasExecuted.current ? "Sí" : "No"}</p>
        </div>

        {status.includes("❌") && (
          <button
            onClick={() => {
              console.log("🔄 Recargando página...");
              // Limpiar el intento previo para permitir reintentar
              const params = new URLSearchParams(window.location.search);
              const joinKey = `join_${params.get(
                "codigo_materia"
              )}_${params.get("nombre")}_${params.get("periodo")}_${params.get(
                "anio"
              )}_${params.get("clave")}`;
              sessionStorage.removeItem(joinKey);
              hasExecuted.current = false;
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default JoinGroup;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinGroupByAccessKey } from "../../services/groupUserServices";
import { useAuth } from "../../contexts/AuthContext";

const JoinGroup = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Verificando sesión...");

  useEffect(() => {
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
      if (alreadyAttempted === "true") {
        localStorage.removeItem("pendingJoinGroup");
        setTimeout(() => {
          navigate("/student/my-groups", { replace: true });
        }, 1000);
        return;
      }

      if (!codigo_materia || !nombre || !periodo || !anio || !clave_acceso) {
        return;
      }
      if (!userData || !userData.codigo) {
        console.log("🔒 Sin userData, redirigiendo a login");

        if (!pendingJoin) {
          localStorage.setItem("pendingJoinGroup", window.location.search);
        }
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      sessionStorage.setItem(joinKey, "true");
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

        setTimeout(() => {
          console.log("➡️ Navegando a my-groups");
          navigate("/student/my-groups", { replace: true });
        }, 2000);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;

        if (
          error.response?.status === 409 ||
          errorMessage?.includes("ya está")
        ) {
          setStatus("Ya estás inscrito en este grupo.");
          localStorage.removeItem("pendingJoinGroup");
          setTimeout(
            () => navigate("/student/my-groups", { replace: true }),
            2000
          );
        } else {
          setStatus(`❌ Error: ${errorMessage || "No se pudo unir al grupo"}`);
          sessionStorage.removeItem(joinKey);
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
        </div>

        {status.includes("❌") && (
          <button
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              const joinKey = `join_${params.get(
                "codigo_materia"
              )}_${params.get("nombre")}_${params.get("periodo")}_${params.get(
                "anio"
              )}_${params.get("clave")}`;
              sessionStorage.removeItem(joinKey);
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

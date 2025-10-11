import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import GroupParticipants from "../../components/ui/GroupParticipants";
import { listarParticipantesGrupo } from "../../services/groupUserServices";
import { useToast } from "../../hooks/useToast";

const GroupDetail = () => {
  const { codigo_materia, nombre, periodo, anio } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("participantes");
  const [groupInfo, setGroupInfo] = useState(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const loadGroupData = async () => {
      if (hasLoaded.current) return;
      hasLoaded.current = true;
      
      console.log("Parámetros recibidos en GroupDetail:", { codigo_materia, nombre, periodo, anio });
      
      if (!codigo_materia || !nombre || !periodo || !anio) {
        console.error("Faltan parámetros requeridos:", { codigo_materia, nombre, periodo, anio });
        return;
      }

      setIsLoading(true);
      try {
        const participantsData = await listarParticipantesGrupo(codigo_materia, nombre, periodo, anio);
        setParticipants(
          Array.isArray(participantsData) ? participantsData : []
        );
        setGroupInfo({
          codigo_materia,
          nombre,
          periodo,
          anio,
          grupo: nombre,
          periodo_display: `${periodo}-${anio}`,
        });
      } catch (err) {
        console.error("❌ Error al cargar datos del grupo:", err);
        error("No se pudieron cargar los datos del grupo");
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupData();
  }, [codigo_materia, nombre, periodo, anio, error]);

  const tabs = [
    { id: "proyecto", label: "Proyecto" },
    { id: "equipo", label: "Equipo" },
    { id: "participantes", label: "Participantes" },
  ];

  return (
    <AdminLayout
      title={
        groupInfo
          ? `${groupInfo.nombre} | ${groupInfo.grupo} | ${groupInfo.periodo_display}`
          : "Cargando grupo..."
      }
    >
      <div className="w-full max-w-5xl mx-auto py-10 px-6 bg-white rounded-2xl shadow-sm">
        {/* Tabs centradas */}
        <div className="flex justify-center mb-8">
          <div className="flex justify-center space-x-2 bg-gray-100 p-1 rounded-full w-fit mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="rounded-xl">
          {activeTab === "participantes" && (
            <div className="mt-8">
              <div className="mb-4 grid grid-cols-2 text-sm font-semibold text-gray-600 px-4">
                <span>Código</span>
                <span>Nombre</span>
              </div>

              <div className="flex flex-col gap-3">
                {isLoading ? (
                  <p className="text-gray-500 text-center py-6">
                    Cargando participantes...
                  </p>
                ) : participants.length > 0 ? (
                  <GroupParticipants participants={participants} />
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    No hay participantes registrados
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "proyecto" && (
            <div className="text-center py-12 text-gray-500">
              <p>Contenido del proyecto próximamente...</p>
            </div>
          )}

          {activeTab === "equipo" && (
            <div className="text-center py-12 text-gray-500">
              <p>Información del equipo próximamente...</p>
            </div>
          )}
        </div>

        {/* Botón volver 
        <div className="mt-10">
          <button
            onClick={() => {
              navigate("/admin/groups");
              window.location.reload();
            }}
            className="inline-flex items-center px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition"
          >
            ← Volver a Grupos
          </button>
        </div>
        */}
      </div>
    </AdminLayout>
  );
};

export default GroupDetail;

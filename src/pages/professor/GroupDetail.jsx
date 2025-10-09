import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import GroupParticipants from "../../modules/admin/components/GroupParticipants";
import { listarParticipantesGrupo } from "../../services/groupServices";
import { useToast } from "../../hooks/useToast";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("participantes");
  const [groupInfo, setGroupInfo] = useState(null);

  useEffect(() => {
    const loadGroupData = async () => {
      setIsLoading(true);
      try {
        // Cargar participantes del grupo
        const participantsData = await listarParticipantesGrupo(id);
        setParticipants(Array.isArray(participantsData) ? participantsData : []);
        
        // Por ahora usamos datos mock para la información del grupo
        // En el futuro esto podría venir de otro endpoint
        setGroupInfo({
          nombre: "Fisica Mecanica",
          grupo: "Grupo A",
          periodo: "2025-1"
        });
      } catch (err) {
        console.error("Error al cargar datos del grupo:", err);
        error("No se pudieron cargar los datos del grupo");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadGroupData();
    }
  }, [id, error]);

  const tabs = [
    { id: "proyecto", label: "Proyecto" },
    { id: "equipo", label: "Equipo" },
    { id: "participantes", label: "Participantes" }
  ];

  return (
    <AdminLayout title="Detalle del Grupo">
      <div className="w-full max-w-6xl mx-auto py-8">
        {/* Header del grupo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 italic mb-6">
            {groupInfo ? `${groupInfo.nombre} | ${groupInfo.grupo} | ${groupInfo.periodo}` : "Cargando..."}
          </h1>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de las tabs */}
        <div className="mt-6">
          {activeTab === "participantes" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Participantes</h2>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      <div>Código</div>
                      <div>Nombre</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {isLoading ? (
                      <div className="p-6">
                        <GroupParticipants participants={[]} isLoading={true} />
                      </div>
                    ) : (
                      <div className="p-6">
                        <GroupParticipants participants={participants} />
                      </div>
                    )}
                  </div>
                </div>
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

        {/* Botón de regreso */}
        <div className="mt-8 flex justify-start">
          <button
            onClick={() => navigate("/professor/groups")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ← Volver a Grupos
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GroupDetail;

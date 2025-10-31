import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import GroupParticipants from "../../components/ui/GroupParticipants";
import AccessDenied from "../../components/ui/AccessDenied";
import { listarParticipantesGrupo } from "../../services/groupUserServices";
import { listarGruposPorUsuario } from "../../services/groupServices";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";
import ProjectTabContent from "../../components/ui/ProjectTabContent";

const GroupDetail = () => {
  // 🔹 Los nombres aquí DEBEN coincidir con los definidos en la ruta:
  // /professor/my-group/:codigo_materia/:nombre/:periodo/:anio
  const { codigo_materia, nombre, periodo, anio } = useParams();

  const navigate = useNavigate();
  const { error } = useToast();
  const { userData } = useAuth();

  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("participantes");
  const [groupInfo, setGroupInfo] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const loadGroupData = async () => {
      if (hasLoaded.current) return;
      hasLoaded.current = true;

      if (!codigo_materia || !nombre || !periodo || !anio || !userData?.codigo)
        return;

      setIsLoading(true);
      setValidationError(null);

      try {
        // 🔹 Verificar si el profesor está asignado a este grupo
        const professorGroups = await listarGruposPorUsuario(userData.codigo);

        console.log("📘 Grupos del profesor:", professorGroups);
        console.log("📥 Parámetros de la URL:", {
          codigo_materia,
          nombre,
          periodo,
          anio,
        });

        const isAssignedToGroup = professorGroups.some((group) => {
          const match =
            String(group.codigo_materia) === String(codigo_materia) &&
            String(group.nombre_grupo) === String(nombre) &&
            String(group.periodo_grupo) === String(periodo) &&
            String(group.anio_grupo) === String(anio);

          return match;
        });

        console.log("✅ ¿Profesor asignado al grupo?", isAssignedToGroup);

        if (!isAssignedToGroup) {
          setValidationError(
            "No estás asignado a este grupo o la materia no existe en el catálogo."
          );
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // 🔹 Si está asignado, cargar los participantes desde el backend
        const participantsData = await listarParticipantesGrupo(
          codigo_materia,
          nombre,
          periodo,
          anio
        );

        console.log("📥 Participantes del grupo:", participantsData);

        setParticipants(
          Array.isArray(participantsData) ? participantsData : []
        );
        setGroupInfo({
          nombre: codigo_materia,
          grupo: nombre,
          periodo: `${periodo}-${anio}`,
        });
        setIsAuthorized(true);
      } catch (err) {
        console.error("❌ Error al cargar datos del grupo:", err);
        if (err.response?.status === 404) {
          setValidationError(
            "Esta materia no existe en el catálogo o no estás asignado a este grupo."
          );
        } else {
          setValidationError(
            "Error al cargar los datos del grupo. Por favor, intenta nuevamente."
          );
        }
        setIsAuthorized(false);
        error("No se pudieron cargar los datos del grupo");
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupData();
  }, [codigo_materia, nombre, periodo, anio, userData, error]);

  const tabs = [
    { id: "proyecto", label: "Proyecto" },
    { id: "equipo", label: "Equipo" },
    { id: "participantes", label: "Participantes" },
  ];

  // 🔹 Mostrar mensaje de error si no está autorizado
  if (validationError && !isAuthorized && !isLoading) {
    return (
      <ProfessorLayout title="Acceso Denegado">
        <AccessDenied
          message={validationError}
          primaryButtonText="Volver a Mis Grupos"
          primaryButtonPath="/professor/my-groups"
          secondaryButtonText="Ver Catálogo de Materias"
          secondaryButtonPath="/professor/subjects"
          showSecondaryButton={true}
          additionalInfo="Si crees que esto es un error, contacta al administrador."
        />
      </ProfessorLayout>
    );
  }

  return (
    <ProfessorLayout
      title={
        groupInfo
          ? `${groupInfo.nombre} | ${groupInfo.grupo} | ${groupInfo.periodo}`
          : "Cargando grupo..."
      }
    >
      <div className="w-full max-w-5xl mx-auto py-10 px-6 bg-white rounded-2xl shadow-sm">
        {/* 🔹 Tabs */}
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

        {/* 🔹 Contenido */}
        {isAuthorized && (
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
              <ProjectTabContent perfil="docente" onCrearActividad={() => {}} />
            )}

            {activeTab === "equipo" && (
              <div className="text-center py-12 text-gray-500">
                <p>Información del equipo próximamente...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProfessorLayout>
  );
};

export default GroupDetail;

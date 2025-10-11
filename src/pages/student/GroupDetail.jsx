import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import GroupParticipants from "../../components/ui/GroupParticipants";
import AccessDenied from "../../components/ui/AccessDenied";
import { listarParticipantesGrupo } from "../../services/groupUserServices";
import { listarGruposPorUsuario } from "../../services/groupServices";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";

const GroupDetail = () => {
  const { codigo_materia, nombre_grupo, periodo_grupo, anio_grupo } = useParams();
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
      if (!codigo_materia || !nombre_grupo || !periodo_grupo || !anio_grupo || !userData?.codigo) return;

      setIsLoading(true);
      setValidationError(null);
      
      try {
        // Primero verificar si el estudiante está registrado en este grupo
        const studentGroups = await listarGruposPorUsuario(userData.codigo);
        console.log("🔍 Grupos del estudiante:", studentGroups);
        console.log("🔍 Parámetros de la URL:", { codigo_materia, nombre_grupo, periodo_grupo, anio_grupo });
        
        const isRegisteredInGroup = studentGroups.some(group => {
          // Convertir a string para comparación más robusta
          const match = String(group.codigo_materia) === String(codigo_materia) &&
            String(group.nombre_grupo) === String(nombre_grupo) &&
            String(group.periodo_grupo) === String(periodo_grupo) &&
            String(group.anio_grupo) === String(anio_grupo);
          console.log("🔍 Comparando grupo:", {
            group: {
              codigo_materia: group.codigo_materia,
              nombre_grupo: group.nombre_grupo,
              periodo_grupo: group.periodo_grupo,
              anio_grupo: group.anio_grupo
            },
            url: { codigo_materia, nombre_grupo, periodo_grupo, anio_grupo },
            match
          });
          return match;
        });
        
        console.log("🔍 ¿Está registrado en el grupo?", isRegisteredInGroup);

        if (!isRegisteredInGroup) {
          setValidationError("No estás registrado en este grupo o la materia no existe en el catálogo.");
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Si está registrado, cargar los datos del grupo
        const participantsData = await listarParticipantesGrupo(
          codigo_materia, 
          nombre_grupo, 
          periodo_grupo, 
          anio_grupo
        );
        setParticipants(
          Array.isArray(participantsData) ? participantsData : []
        );
        setGroupInfo({
          nombre: codigo_materia,
          grupo: nombre_grupo,
          periodo: `${periodo_grupo}-${anio_grupo}`,
        });
        setIsAuthorized(true);
      } catch (err) {
        console.error("❌ Error al cargar datos del grupo:", err);
        if (err.response?.status === 404) {
          setValidationError("Esta materia no existe en el catálogo o no estás registrado en este grupo.");
        } else {
          setValidationError("Error al cargar los datos del grupo. Por favor, intenta nuevamente.");
        }
        setIsAuthorized(false);
        error("No se pudieron cargar los datos del grupo");
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupData();
  }, [codigo_materia, nombre_grupo, periodo_grupo, anio_grupo, userData, error]);

  const tabs = [
    { id: "proyecto", label: "Proyecto" },
    { id: "equipo", label: "Equipo" },
    { id: "participantes", label: "Participantes" },
  ];

  // Si hay error de validación y no está autorizado, mostrar mensaje de error
  if (validationError && !isAuthorized && !isLoading) {
    return (
      <StudentLayout title="Acceso Denegado">
        <AccessDenied
          message={validationError}
          primaryButtonText="Volver a Mis Grupos"
          primaryButtonPath="/student/my-groups"
          secondaryButtonText="Ver Catálogo de Materias"
          secondaryButtonPath="/student/subjects"
          showSecondaryButton={true}
          additionalInfo="Si crees que esto es un error, contacta a tu profesor o administrador."
        />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      title={
        groupInfo
          ? `${groupInfo.nombre} | ${groupInfo.grupo} | ${groupInfo.periodo}`
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

        {/* Contenido - Solo mostrar si está autorizado */}
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
        )}

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
    </StudentLayout>
  );
};

export default GroupDetail;

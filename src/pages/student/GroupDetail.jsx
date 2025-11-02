import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import GroupParticipants from "../../components/ui/GroupParticipants";
import AccessDenied from "../../components/ui/AccessDenied";
import { listarParticipantesGrupo } from "../../services/groupUserServices";
import { listarGruposPorUsuario } from "../../services/groupServices";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";
import IdeasBank from "../../components/ui/IdeasBank";
import Button from "../../components/ui/Button";
import IdeaForm from "../../components/ui/IdeaForm";
import ActivityCard from "../../components/ui/ActivityCard";
import {
  crearIdea,
  actualizarIdea,
  obtenerIdea,
  listarIdeasLibres,
  listarIdeasGrupo,
  adoptarIdea,
  moverIdeaAlBanco,
} from "../../services/ideaServices";

const GroupDetail = () => {
  // Deben coincidir con lo que definiste en las rutas: :codigo_materia/:nombre/:periodo/:anio
  const { codigo_materia, nombre, periodo, anio } = useParams();

  const navigate = useNavigate();
  const { error, success } = useToast();
  const { userData } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("participantes");
  const [groupInfo, setGroupInfo] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const hasLoaded = useRef(false);

  // Estado para actividades e ideas
  const [showIdeasView, setShowIdeasView] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Estado para formulario de ideas
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [ideaReadOnly, setIdeaReadOnly] = useState(false);
  const [ideaInitialData, setIdeaInitialData] = useState({ titulo: "", problematica: "", justificacion: "", objetivos: "" });
  const [defaultSelectedMembers, setDefaultSelectedMembers] = useState([]);
  const [ideaHasCorrections, setIdeaHasCorrections] = useState(false);
  const [currentIdeaId, setCurrentIdeaId] = useState(null);
  
  // Estado para bancos de ideas
  const [ideasLibres, setIdeasLibres] = useState([]);
  const [ideasGrupo, setIdeasGrupo] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  useEffect(() => {
    const loadGroupData = async () => {
      if (hasLoaded.current) return;
      hasLoaded.current = true;

      if (
        !codigo_materia ||
        !nombre ||
        !periodo ||
        !anio ||
        !userData?.codigo
      ) {
        console.log("GroupDetail: faltan params o userData", {
          codigo_materia,
          nombre,
          periodo,
          anio,
          userData,
        });
        return;
      }

      setIsLoading(true);
      setValidationError(null);

      try {
        // Verificar si el estudiante está registrado en este grupo
        const studentGroups = await listarGruposPorUsuario(userData.codigo);
        console.log("🔍 Grupos del estudiante:", studentGroups);
        console.log("🔍 Parámetros de la URL:", {
          codigo_materia,
          nombre,
          periodo,
          anio,
        });

        const isRegisteredInGroup = studentGroups.some((group) => {
          const match =
            String(group.codigo_materia) === String(codigo_materia) &&
            String(group.nombre_grupo) === String(nombre) &&
            String(group.periodo_grupo) === String(periodo) &&
            String(group.anio_grupo) === String(anio);

          console.log("🔍 Comparando grupo:", {
            group: {
              codigo_materia: group.codigo_materia,
              nombre_grupo: group.nombre_grupo,
              periodo_grupo: group.periodo_grupo,
              anio_grupo: group.anio_grupo,
            },
            url: { codigo_materia, nombre, periodo, anio },
            match,
          });

          return match;
        });

        console.log("🔍 ¿Está registrado en el grupo?", isRegisteredInGroup);

        if (!isRegisteredInGroup) {
          setValidationError(
            "No estás registrado en este grupo o la materia no existe en el catálogo."
          );
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Si está registrado, cargar participantes
        const participantsData = await listarParticipantesGrupo(
          codigo_materia,
          nombre,
          periodo,
          anio
        );

        console.log("📥 Participantes recibidos:", participantsData);

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
            "Esta materia no existe en el catálogo o no estás registrado en este grupo."
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

  // Resetear vista de ideas cuando se cambia de tab
  useEffect(() => {
    if (activeTab !== "proyecto") {
      setShowIdeasView(false);
      setSelectedActivity(null);
      setShowIdeaForm(false);
    }
  }, [activeTab]);

  const tabs = [
    { id: "proyecto", label: "Proyecto" },
    { id: "equipo", label: "Equipo" },
    { id: "participantes", label: "Participantes" },
  ];

  const groupParams = { codigo_materia, nombre, periodo, anio };

  // Cargar ideas del grupo y libres cuando se muestra la vista
  useEffect(() => {
    if (showIdeasView && isAuthorized && groupParams.codigo_materia) {
      loadIdeas();
    }
  }, [showIdeasView, isAuthorized, codigo_materia, nombre, periodo, anio]);

  const loadIdeas = async () => {
    setLoadingIdeas(true);
    try {
      // Cargar ideas del grupo
      const grupoIdeas = await listarIdeasGrupo(groupParams);
      const grupoData = Array.isArray(grupoIdeas.data) ? grupoIdeas.data : [];
      
      // Separar por estado
      const propuestas = grupoData.filter(
        (idea) => idea.Estado?.descripcion === "REVISION" || idea.Estado?.descripcion === "STAND_BY"
      );
      const ideasBanco = grupoData.filter(
        (idea) => idea.Estado?.descripcion === "LIBRE"
      );
      
      setIdeasGrupo(propuestas);
      
      // Cargar ideas libres del banco general
      const libresResponse = await listarIdeasLibres();
      const libresData = Array.isArray(libresResponse.data) ? libresResponse.data : [];
      setIdeasLibres([...ideasBanco, ...libresData]);
    } catch (err) {
      console.error("Error al cargar ideas:", err);
      error("Error al cargar las ideas");
    } finally {
      setLoadingIdeas(false);
    }
  };

  // Función para abrir vista de ideas al seleccionar una actividad
  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowIdeasView(true);
    setShowIdeaForm(false);
  };

  // Función para volver a la vista de actividades
  const backToActivities = () => {
    setShowIdeasView(false);
    setSelectedActivity(null);
    setShowIdeaForm(false);
    setCurrentIdeaId(null);
  };

  const openCreateIdea = () => {
    setIdeaInitialData({ titulo: "", problematica: "", justificacion: "", objetivos: "" });
    setDefaultSelectedMembers([]);
    setIdeaReadOnly(false);
    setCurrentIdeaId(null);
    setIdeaHasCorrections(false);
    setShowIdeaForm(true);
  };

  const openViewIdea = async (item) => {
    try {
      // Si el item tiene id_idea, cargar datos completos
      if (item.id_idea) {
        const ideaCompleta = await obtenerIdea(item.id_idea);
        const ideaData = ideaCompleta.data || ideaCompleta;
        
        // Mapear campos del backend al formulario
        const estado = ideaData.Estado?.descripcion;
        const tieneCorrecciones = estado === "STAND_BY";
        
        // Obtener integrantes del equipo si existe
        const integrantes = ideaData.equipo?.Integrante_Equipos || [];
        const preselected = integrantes
          .filter((int) => int.codigo_usuario !== ideaData.codigo_usuario)
          .map((int) => ({
            value: int.Usuario?.codigo || int.codigo_usuario,
            label: int.Usuario?.nombre || "",
          }));

        setIdeaInitialData({
          titulo: ideaData.titulo || "",
          problematica: ideaData.problema || "",
          justificacion: ideaData.justificacion || "",
          objetivos: `${ideaData.objetivo_general || ""}\n${ideaData.objetivos_especificos || ""}`.trim(),
        });
        setDefaultSelectedMembers(preselected);
        setCurrentIdeaId(ideaData.id_idea);
        setIdeaReadOnly(true);
        setIdeaHasCorrections(tieneCorrecciones);
      } else {
        // Datos básicos del item
        const preselected = (participants || []).map((p) => ({ value: p.codigo, label: p.nombre }));
        setIdeaInitialData({
          titulo: item.titulo || item.title || "",
          problematica: item.problema || item.problematica || "",
          justificacion: item.justificacion || "",
          objetivos: item.objetivos_especificos || item.objetivos || "",
        });
        setDefaultSelectedMembers(preselected);
        setCurrentIdeaId(item.id_idea || null);
        setIdeaReadOnly(true);
        setIdeaHasCorrections(!!item.hasCorrections || item.Estado?.descripcion === "STAND_BY");
      }
      setShowIdeaForm(true);
    } catch (err) {
      console.error("Error al cargar idea:", err);
      error("Error al cargar la idea");
    }
  };

  const handleAdoptIdea = async (item) => {
    if (!userData?.codigo) {
      error("No se pudo obtener tu información de usuario");
      return;
    }

    try {
      await adoptarIdea(item.id_idea, userData.codigo, groupParams);
      success("Idea adoptada exitosamente");
      loadIdeas();
      openViewIdea(item);
    } catch (err) {
      error(err.message || "Error al adoptar la idea");
    }
  };

  const handleSubmitIdea = async (payload) => {
    if (!userData?.codigo) {
      error("No se pudo obtener tu información de usuario");
      return;
    }

    try {
      // Separar objetivos en general y específicos (primer línea = general, resto = específicos)
      const objetivosLines = (payload.objetivos || "").split("\n").filter((l) => l.trim());
      const objetivo_general = objetivosLines[0] || "";
      const objetivos_especificos = objetivosLines.slice(1).join("\n") || objetivo_general;

      // Preparar integrantes (solo códigos para el backend)
      const integrantes = payload.integrantes
        ? payload.integrantes.map((m) => (typeof m === "string" ? m : m.codigo || m.value))
        : [];

      if (currentIdeaId) {
        // Actualizar idea existente
        const datosActualizacion = {
          codigo_usuario: userData.codigo,
          titulo: payload.titulo,
          problema: payload.problematica,
          justificacion: payload.justificacion,
          objetivo_general,
          objetivos_especificos,
        };

        await actualizarIdea(currentIdeaId, datosActualizacion);
        success("Idea actualizada exitosamente");
      } else {
        // Crear nueva idea
        const datosIdea = {
          codigo_usuario: userData.codigo,
          titulo: payload.titulo,
          problema: payload.problematica,
          justificacion: payload.justificacion,
          objetivo_general,
          objetivos_especificos,
          grupo: groupParams,
          integrantes,
        };

        await crearIdea(datosIdea);
        success("Idea creada y enviada a revisión");
      }

      setShowIdeaForm(false);
      setCurrentIdeaId(null);
      loadIdeas();
    } catch (err) {
      error(err.message || "Error al guardar la idea");
    }
  };

  const closeIdeaForm = () => {
    setShowIdeaForm(false);
    setCurrentIdeaId(null);
  };

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
              <div>
                {!showIdeasView ? (
                  // Vista de actividades asignadas por el docente
                  <div className="max-w-4xl mx-auto space-y-6">
                    <ActivityCard
                      title="Actividad 1"
                      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco."
                      onClick={() => handleActivityClick({ id: 1, title: "Actividad 1", description: "Lorem ipsum..." })}
                    />
                  </div>
                ) : !showIdeaForm ? (
                  // Vista de banco de ideas
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <button
                        type="button"
                        onClick={backToActivities}
                        className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50"
                      >
                        ← Volver a Actividades
                      </button>
                      <Button text={"+ Proponer Idea"} onClick={openCreateIdea} />
                    </div>
                    {loadingIdeas ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">Cargando ideas...</p>
                      </div>
                    ) : (
                      <>
                        <IdeasBank
                          title="Banco de Propuestas"
                          items={ideasGrupo.map((idea) => ({
                            id_idea: idea.id_idea,
                            title: idea.titulo,
                            titulo: idea.titulo,
                            problema: idea.problema,
                            problematica: idea.problema,
                            justificacion: idea.justificacion,
                            objetivos_especificos: idea.objetivos_especificos,
                            hasCorrections: idea.Estado?.descripcion === "STAND_BY",
                            Estado: idea.Estado,
                          }))}
                          onView={openViewIdea}
                        />
                        <IdeasBank
                          title="Banco de ideas"
                          items={ideasLibres.map((idea) => ({
                            id_idea: idea.id_idea,
                            title: idea.titulo,
                            titulo: idea.titulo,
                            problema: idea.problema,
                            problematica: idea.problema,
                            justificacion: idea.justificacion,
                            objetivos_especificos: idea.objetivos_especificos,
                            Estado: idea.Estado,
                          }))}
                          onView={(item) => handleAdoptIdea(item)}
                        />
                      </>
                    )}
                  </>
                ) : (
                  // Vista de formulario de idea
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <button
                        type="button"
                        onClick={closeIdeaForm}
                        className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50"
                      >
                        ← Volver
                      </button>
                      {ideaReadOnly && ideaHasCorrections && (
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            Esta idea tiene correcciones
                          </span>
                          <Button 
                            text="Tomar idea" 
                            onClick={() => {
                              setIdeaReadOnly(false);
                              setIdeaHasCorrections(false);
                            }} 
                          />
                        </div>
                      )}
                    </div>
                    <IdeaForm
                      groupParams={groupParams}
                      initialData={ideaInitialData}
                      readOnly={ideaReadOnly}
                      defaultSelectedMembers={defaultSelectedMembers}
                      onSubmit={handleSubmitIdea}
                      role="ESTUDIANTE"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "equipo" && (
              <div className="text-center py-12 text-gray-500">
                <p>Información del equipo próximamente...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default GroupDetail;

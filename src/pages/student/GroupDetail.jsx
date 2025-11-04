import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import GroupParticipants from "../../components/ui/GroupParticipants";
import CorregirProyecto from "../../modules/student/components/CorregirProyecto";
import ProyectoCalificado from "../../components/ui/ProyectoCalificado";
import AccessDenied from "../../components/ui/AccessDenied";
import { listarParticipantesGrupo } from "../../services/groupUserServices";
import { listarGruposPorUsuario } from "../../services/groupServices";
import {
  verificarActividadGrupo,
  obtenerActividadById,
} from "../../services/actividadService";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";
import IdeasBank from "../../components/ui/IdeasBank";
import Button from "../../components/ui/Button";
import IdeaForm from "../../components/ui/IdeaForm";
import CompletarDatos from "../../modules/student/components/ProjectForm";
import SuggestionReview from "../../modules/student/components/SuggestionReview";
import ProyectoEnCurso from "../../modules/student/components/ProyectoEnCurso";
import RejectedIdea from "../../modules/student/components/RejectedIdea";
import {
  crearIdea,
  actualizarIdea,
  obtenerIdea,
  listarIdeasLibres,
  adoptarIdea,
  verificarIdeaYProyecto,
} from "../../services/ideaServices";
import {
  listarPropuestasLibres,
  obtenerProyectosContinuables,
  adoptarPropuesta,
  continuarProyecto,
  crearProyectoDesdeIdea,
} from "../../services/proyectoServices";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const GroupDetail = () => {
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

  // Estado para vistas
  const [currentView, setCurrentView] = useState("activities");
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Estado para actividad del grupo
  const [actividad, setActividad] = useState(null);
  const [esquemaInfo, setEsquemaInfo] = useState(null);
  const [tieneActividad, setTieneActividad] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Estado para formulario de ideas
  const [ideaInitialData, setIdeaInitialData] = useState({
    titulo: "",
    problematica: "",
    justificacion: "",
    objetivo_general: "",
    objetivos_especificos: [""],
  });
  const [defaultSelectedMembers, setDefaultSelectedMembers] = useState([]);
  const [currentIdeaId, setCurrentIdeaId] = useState(null);
  const [currentIdeaData, setCurrentIdeaData] = useState(null);
  const [currentProyecto, setCurrentProyecto] = useState(null);
  const [currentEquipo, setCurrentEquipo] = useState(null);

  // Estado para bancos de ideas
  const [ideasLibres, setIdeasLibres] = useState([]);
  const [ideasGrupo, setIdeasGrupo] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [proyectosContinuables, setProyectosContinuables] = useState([]);
  const [viewMode, setViewMode] = useState(null); // 'idea', 'propuesta', 'proyecto'
  const [selectedItem, setSelectedItem] = useState(null);
  const [ideaReadOnly, setIdeaReadOnly] = useState(false);

  const groupParams = { codigo_materia, nombre, periodo, anio };

  // Verificar actividad del grupo
  const checkActivity = async () => {
    setLoadingActivity(true);
    try {
      const tiene = await verificarActividadGrupo(
        codigo_materia,
        nombre,
        periodo,
        anio
      );

      if (tiene.tieneActividad) {
        const response = await obtenerActividadById(tiene.id_actividad);
        setActividad(response.actividad);
        setEsquemaInfo(response.esquema);
        setTieneActividad(true);
      } else {
        setTieneActividad(false);
        setActividad(null);
        setEsquemaInfo(null);
      }
    } catch (err) {
      console.error("Error al verificar actividad:", err);
      setTieneActividad(false);
    } finally {
      setLoadingActivity(false);
    }
  };

  const loadIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const [propuestasResponse, libresResponse, continuablesResponse] =
        await Promise.all([
          listarPropuestasLibres(),
          listarIdeasLibres(),
          obtenerProyectosContinuables(userData.codigo),
        ]);

      const propuestasData = Array.isArray(propuestasResponse.data)
        ? propuestasResponse.data
        : propuestasResponse;

      const libresData = Array.isArray(libresResponse.data)
        ? libresResponse.data
        : libresResponse;

      const continuablesData = Array.isArray(continuablesResponse.data)
        ? continuablesResponse.data
        : continuablesResponse;

      setIdeasGrupo(propuestasData);
      setIdeasLibres(libresData);
      setProyectosContinuables(continuablesData);
    } catch (err) {
      console.error("Error al cargar bancos:", err);
      toast.error("Error al cargar el banco de propuestas o ideas");
    } finally {
      setLoadingIdeas(false);
    }
  };

const handleViewItem = async (item, type) => {
  try {
    let itemData;

    if (type === "idea" && item.id_idea) {
      const ideaCompleta = await obtenerIdea(item.id_idea);
      itemData = ideaCompleta.data || ideaCompleta;
    } else {
      itemData = item;
    }

    console.log("datos del proyecto a continuar", itemData);

    // Tomar siempre la fuente de la idea, ya sea directa o dentro de Proyecto
    const idea = itemData.Idea || itemData;

    // Convertir objetivos_especificos en array (por salto de línea o coma)
    const objetivosArray =
      Array.isArray(idea.objetivos_especificos)
        ? idea.objetivos_especificos
        : typeof idea.objetivos_especificos === "string"
          ? idea.objetivos_especificos
              .split(/\r?\n|,/)
              .map((line) => line.trim())
              .filter(Boolean)
          : [""];

    setIdeaInitialData({
      titulo: idea.titulo || "",
      problematica: idea.problema || "",
      justificacion: idea.justificacion || "",
      objetivo_general: idea.objetivo_general || "",
      objetivos_especificos: objetivosArray,
    });

    setSelectedItem(item);
    setViewMode(type);
    setIdeaReadOnly(true);
    setCurrentView("ideaForm");
  } catch (err) {
    console.error("Error al cargar item:", err);
    toast.error("Error al cargar la información");
  }
};


  const handleAdoptIdea = async () => {
    if (!selectedItem || !userData?.codigo) return;

    const result = await Swal.fire({
      title: "¿Adoptar esta idea?",
      text: "La idea se asignará a tu equipo en este grupo",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, adoptar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await adoptarIdea(selectedItem.id_idea, userData.codigo, groupParams);
        toast.success("Idea adoptada exitosamente. Ahora puedes actualizarla.");

        // Cargar datos completos de la idea adoptada
        const ideaCompleta = await obtenerIdea(selectedItem.id_idea);
        const ideaData = ideaCompleta.data || ideaCompleta;

        setCurrentIdeaId(ideaData.id_idea);
        setCurrentIdeaData(ideaData);
        setViewMode(null);
        setSelectedItem(null);
        setIdeaReadOnly(false);
      } catch (err) {
        toast.error(err.message || "Error al adoptar la idea");
      }
    }
  };

  const handleAdoptPropuesta = async () => {
    if (!selectedItem || !userData?.codigo) return;

    const result = await Swal.fire({
      title: "¿Adoptar esta propuesta?",
      text: "La propuesta se convertirá en tu proyecto en este grupo",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, adoptar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await adoptarPropuesta(
          selectedItem.id_proyecto,
          userData.codigo,
          groupParams
        );
        toast.success("Propuesta adoptada exitosamente");
        backToActivities();
        loadIdeas();
      } catch (err) {
        toast.error(err.message || "Error al adoptar la propuesta");
      }
    }
  };

  const handleContinuarProyecto = async () => {
    if (!selectedItem || !userData?.codigo) return;

    const result = await Swal.fire({
      title: "¿Continuar con este proyecto?",
      text: "El proyecto se asociará a tu equipo en este grupo",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        response = await continuarProyecto(selectedItem.id_proyecto, userData.codigo, groupParams);
        toast.success("Proyecto continuado exitosamente");
        backToActivities();
        loadIdeas();
      } catch (err) {
        toast.error(err.message || "Error al continuar el proyecto");
      } 
    }
  };

  const handleActivityClick = async (activity) => {
    // Si no hay actividad asignada, mostrar mensaje
    console.log("el proyecto es:", currentProyecto);
    if (!tieneActividad) {
      toast.info("Aún no hay una actividad asignada a este grupo. Por favor espera.");
      return;
    }

    try {
      if (!userData?.codigo) {
        error("No se pudo obtener tu información de usuario");
        return;
      }

      const response = await verificarIdeaYProyecto(userData.codigo, groupParams);
      const { proyecto, idea, equipo } = response.data || response;
      console.log("codigo del estudiante:",userData.codigo, groupParams);
      console.log("📋 Estado del estudiante:", { proyecto, idea, equipo });

      // ✅ CASO 1: No tiene ni idea ni proyecto → Mostrar banco de ideas
      if (!proyecto && !idea) {
        console.log("✅ Sin idea ni proyecto → Banco de ideas");
        setSelectedActivity(activity);
        setCurrentView("ideas");
        return;
      }

      // ✅ CASO 2: Tiene idea, verificar su estado
      if (idea && idea.id_idea) {
        const estadoIdea = idea.estado;
        const estadoProyecto = proyecto?.estado || null;

        console.log("📌 Estado de la idea:", estadoIdea);
        console.log("📦 Estado del proyecto:", estadoProyecto);

        // ========== NUEVOS CASOS ==========

        // REVISION - null: En espera de revisión inicial
        if (estadoIdea === "REVISION" && !estadoProyecto) {
          toast.info("Tu idea está en revisión. Por favor espera la respuesta del docente.");
          return;
        }

        // STAND_BY - null: Corregir la idea
        if (estadoIdea === "STAND_BY" && !estadoProyecto) {
          if (!idea.id_idea) {
            console.error("❌ Idea en STAND_BY sin ID");
            toast.error("Error: Idea sin identificador válido");
            return;
          }
          setCurrentIdeaId(idea.id_idea);
          setCurrentIdeaData(idea);
          setCurrentView("suggestion");
          return;
        }

        // APROBADO - null: Completar datos del proyecto
        if (estadoIdea === "APROBADO" && !estadoProyecto) {
          setCurrentIdeaId(idea.id_idea);
          setCurrentIdeaData(idea);
          setCurrentView("completarDatos");
          return;
        }

        // REVISION - SELECCIONADO: Proyecto adoptado en revisión
        if (estadoIdea === "REVISION" && estadoProyecto === "SELECCIONADO") {
          toast.info("Tu proyecto adoptado está en revisión. Por favor espera la respuesta del docente.");
          return;
        }

        // REVISION - CALIFICADO: Proyecto propio en revisión
        if (estadoIdea === "REVISION" && estadoProyecto === "CALIFICADO") {
          toast.info("Tu proyecto está en revisión. Por favor espera la respuesta del docente.");
          return;
        }

        // STAND_BY - SELECCIONADO: Corregir proyecto adoptado
        if (estadoIdea === "STAND_BY" && estadoProyecto === "SELECCIONADO") {
          setCurrentIdeaId(idea.id_idea);
          setCurrentProyecto(proyecto);
          setCurrentIdeaData(idea);
          setCurrentView("corregirProyecto");
          return;
        }

        // STAND_BY - CALIFICADO: Corregir proyecto propio
        if (estadoIdea === "STAND_BY" && estadoProyecto === "CALIFICADO") {
          setCurrentIdeaId(idea.id_idea);
          setCurrentProyecto(proyecto);
          setCurrentIdeaData(idea);
          setCurrentView("corregirProyecto");
          return;
        }

        // APROBADO - EN_CURSO: Subir entregables
        if (estadoIdea === "APROBADO" && estadoProyecto === "EN_CURSO") {
          setCurrentProyecto(proyecto);
          setCurrentEquipo(equipo);
          setCurrentIdeaData(idea);
          setCurrentView("proyectoEnCurso");
          console.log("pre",actividad.id_actividad, proyecto.id_proyecto);
          return;
        }

        // REVISION - EN_CURSO: Proyecto enviado para calificar
        if (estadoIdea === "REVISION" && estadoProyecto === "EN_CURSO") {
          toast.info("Tu proyecto ha sido enviado para calificación. Por favor espera.");
          return;
        }

        // APROBADO - CALIFICADO: Ver calificaciones
        if (estadoIdea === "APROBADO" && estadoProyecto === "CALIFICADO") {
          setCurrentProyecto(proyecto);
          setCurrentIdeaData(idea);
          setCurrentView("proyectoCalificado");
          return;
        }

        // ========== FIN NUEVOS CASOS ==========

        // RECHAZADO (sin proyecto): Idea rechazada
        if (estadoIdea === "RECHAZADO" && !estadoProyecto) {
          setCurrentIdeaId(idea.id_idea);
          setCurrentView("rejected");
          return;
        }

        // Estado no manejado → volver al banco
        console.warn("⚠️ Estado no manejado:", { estadoIdea, estadoProyecto });
        setSelectedActivity(activity);
        setCurrentView("ideas");
        return;
      }

      // ✅ CASO 3: Tiene proyecto pero no idea (caso raro)
      if (proyecto && !idea) {
        console.log("📦 Tiene proyecto sin idea");
        toast.info("Situación inesperada detectada. Contacta al docente.");
        return;
      }

      // ✅ CASO DEFAULT
      console.log("🔄 Caso por defecto → Banco de ideas");
      setSelectedActivity(activity);
      setCurrentView("ideas");

    } catch (err) {
      console.error("❌ Error al verificar estado del estudiante:", err);

      if (err.response?.status === 404) {
        console.log("✅ 404 → Sin idea/proyecto, mostrar banco");
        setSelectedActivity(activity);
        setCurrentView("ideas");
        return;
      }

      error("No fue posible verificar tu estado actual");
    }
  };


  const backToActivities = () => {
    setCurrentView("activities");
    setSelectedActivity(null);
    setCurrentIdeaId(null);
    setCurrentIdeaData(null);
    setCurrentProyecto(null);
    setViewMode(null);
    setSelectedItem(null);
    setIdeaReadOnly(false);
  };

  const openCreateIdea = () => {
    setIdeaInitialData({
      titulo: "",
      problematica: "",
      justificacion: "",
      objetivo_general: "",
      objetivos_especificos: [""],
      integrantes: [],
    });
    setIdeaReadOnly(false);
    setCurrentIdeaId(null);
    setViewMode(null);
    setSelectedItem(null);
    setCurrentView("ideaForm");
  };

  const handleSubmitIdea = async (payload) => {
    if (!userData?.codigo) {
      error("No se pudo obtener tu información de usuario");
      return;
    }

    try {
      const objetivo_general = payload.objetivo_general || "";
      const objetivos_especificos =
        payload.objetivos_especificos?.join("\n") || "";

      const integrantes = payload.integrantes
        ? payload.integrantes.map((m) =>
          typeof m === "string" ? m : m.codigo || m.value
        )
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
          integrantes,
        };

        await actualizarIdea(currentIdeaId, datosActualizacion);
        success("Idea actualizada y enviada a revisión");
        backToActivities();
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
        backToActivities();
      }
    } catch (err) {
      error(err.message || "Error al guardar la idea");
    }
  };

  const handleSubmitCompletarDatos = async (datosProyecto) => {
    try {
      await crearProyectoDesdeIdea(currentIdeaId, datosProyecto);
      toast.success("Proyecto creado exitosamente");
      backToActivities();
    } catch (err) {
      toast.error(err.message || "Error al crear el proyecto");
    }
  };

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
        return;
      }

      setIsLoading(true);
      setValidationError(null);

      try {
        const studentGroups = await listarGruposPorUsuario(userData.codigo);

        const isRegisteredInGroup = studentGroups.some(
          (group) =>
            String(group.codigo_materia) === String(codigo_materia) &&
            String(group.nombre_grupo) === String(nombre) &&
            String(group.periodo_grupo) === String(periodo) &&
            String(group.anio_grupo) === String(anio)
        );

        if (!isRegisteredInGroup) {
          setValidationError(
            "No estás registrado en este grupo o la materia no existe en el catálogo."
          );
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const participantsData = await listarParticipantesGrupo(
          codigo_materia,
          nombre,
          periodo,
          anio
        );

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
        console.error("Error al cargar datos del grupo:", err);
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

  // Verificar actividad cuando se selecciona la pestaña proyecto
  useEffect(() => {
    if (activeTab === "proyecto" && isAuthorized) {
      checkActivity();
    } else if (activeTab !== "proyecto") {
      setCurrentView("activities");
      setSelectedActivity(null);
    }
  }, [activeTab, isAuthorized]);

  useEffect(() => {
    if (currentView === "ideas" && isAuthorized && groupParams.codigo_materia) {
      loadIdeas();
    }
  }, [currentView, isAuthorized, codigo_materia, nombre, periodo, anio]);

  const tabs = [
    { id: "proyecto", label: "Actividad" },
    { id: "participantes", label: "Participantes" },
  ];

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
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === tab.id
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
                {loadingActivity ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Verificando actividad...</p>
                  </div>
                ) : currentView === "activities" ? (
                  <div className="max-w-4xl mx-auto space-y-6">
                    {tieneActividad && actividad ? (
                      <ActivityDetailStudent
                        actividad={actividad}
                        esquemaInfo={esquemaInfo}
                        onStartActivity={() =>
                          handleActivityClick({ id: actividad.id_actividad })
                        }
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                          <div className="mb-6">
                            <svg
                              className="mx-auto h-16 w-16 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            En espera de actividad
                          </h3>
                          <p className="text-gray-500">
                            Aún no hay una actividad asignada a este grupo. Por
                            favor espera a que tu profesor cree una actividad.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : currentView === "ideas" ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <button
                        type="button"
                        onClick={backToActivities}
                        className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50"
                      >
                        ← Volver a Actividad
                      </button>
                      <Button text="+ Proponer Idea" onClick={openCreateIdea} />
                    </div>
                    {loadingIdeas ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">Cargando...</p>
                      </div>
                    ) : (
                      <>
                        <IdeasBank
                          title="Proyectos por Continuar"
                          items={proyectosContinuables.map((proyecto) => ({
                            id_proyecto: proyecto.id_proyecto,
                            title:
                              proyecto.Idea?.titulo ||
                              proyecto.linea_investigacion,
                            ...proyecto,
                          }))}
                          onView={(item) => handleViewItem(item, "proyecto")}
                        />
                        <IdeasBank
                          title="Banco de Propuestas"
                          items={ideasGrupo.map((idea) => ({
                            id_proyecto: idea.id_proyecto,
                            title: idea.Idea?.titulo || idea.titulo,
                            ...idea,
                          }))}
                          onView={(item) => handleViewItem(item, "propuesta")}
                        />
                        <IdeasBank
                          title="Banco de Ideas"
                          items={ideasLibres.map((idea) => ({
                            id_idea: idea.id_idea,
                            title: idea.titulo,
                            ...idea,
                          }))}
                          onView={(item) => handleViewItem(item, "idea")}
                        />
                      </>
                    )}
                  </>
                ) : currentView === "ideaForm" ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentView(viewMode ? "ideas" : "ideas")
                        }
                        className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50"
                      >
                        ← Volver
                      </button>
                    </div>
                    <IdeaForm
                      groupParams={groupParams}
                      initialData={ideaInitialData}
                      readOnly={ideaReadOnly}
                      defaultSelectedMembers={defaultSelectedMembers}
                      onSubmit={handleSubmitIdea}
                      currentUserCode={userData?.codigo}
                      showAdoptButton={viewMode !== null}
                      onAdopt={
                        viewMode === "idea"
                          ? handleAdoptIdea
                          : viewMode === "propuesta"
                            ? handleAdoptPropuesta
                            : viewMode === "proyecto"
                              ? handleContinuarProyecto
                              : null
                      }
                    />
                  </div>
                ) : currentView === "rejected" ? (
                  <RejectedIdea
                    idIdea={currentIdeaId}
                    currentUserCode={userData?.codigo}
                    onBack={backToActivities}
                  />
                ) : currentView === "suggestion" ? (
                  <SuggestionReview
                    idIdea={currentIdeaId}
                    ideaData={currentIdeaData}
                    groupParams={groupParams}
                    currentUserCode={userData?.codigo}
                    onBack={backToActivities}
                  />
                ) : currentView === "proyectoEnCurso" ? (
                  <ProyectoEnCurso
                    proyecto={currentProyecto}
                    equipo={currentEquipo}
                    actividad={actividad}
                    esquemaInfo={esquemaInfo}
                    currentUserCode={userData?.codigo}
                    onBack={backToActivities}
                  />
                ) : currentView === "corregirProyecto" ? (
                  <CorregirProyecto
                    idIdea={currentIdeaId}
                    idProyecto={currentProyecto?.id_proyecto}
                    groupParams={groupParams}
                    currentUserCode={userData?.codigo}
                    onBack={backToActivities}
                    esProyectoSeleccionado={currentProyecto?.estado === "SELECCIONADO"}
                  />
                ) : currentView === "proyectoCalificado" ? (
                  <ProyectoCalificado
                    projectId={currentProyecto.id_proyecto}
                    onBack={backToActivities}
                  />
                ) : currentView === "completarDatos" ? (
                  <CompletarDatos
                    idIdea={currentIdeaId}
                    ideaData={currentIdeaData}
                    onSubmit={handleSubmitCompletarDatos}
                    onBack={backToActivities}
                    userData={userData}
                  />
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

const ActivityDetailStudent = ({ actividad, esquemaInfo, onStartActivity }) => {
  // Construir estructura jerárquica de items
  const buildItemsHierarchy = () => {
    if (!actividad.Actividad_items || !esquemaInfo?.Items) return [];

    const selectedItemIds = actividad.Actividad_items.map(
      (ai) => ai.Item.id_item
    );
    const allItems = esquemaInfo.Items;

    const itemsMap = {};
    allItems.forEach((item) => {
      if (selectedItemIds.includes(item.id_item)) {
        itemsMap[item.id_item] = { ...item, subitems: [] };
      }
    });

    const rootItems = [];
    Object.values(itemsMap).forEach((item) => {
      if (item.super_item === null) {
        rootItems.push(item);
      } else if (itemsMap[item.super_item]) {
        itemsMap[item.super_item].subitems.push(item);
      }
    });

    return rootItems;
  };

  const selectedItemsHierarchy = buildItemsHierarchy();

  return (
    <div
      onClick={onStartActivity}
      className="rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] overflow-hidden bg-white cursor-pointer hover:shadow-xl transition-shadow"
    >
      <div
        className="relative px-6 py-10 text-center text-white"
        style={{
          background:
            "linear-gradient(90deg, #ed3a3aff 0%, #d94228ff 50%, #b62121ff 100%)",
        }}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide mb-4">
          {actividad.titulo}
        </h2>
      </div>
      <div className="px-8 py-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            DESCRIPCIÓN
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {actividad.descripcion}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              FECHA INICIO
            </h3>
            <p className="text-gray-900 font-medium">
              {new Date(actividad.fecha_inicio).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              FECHA CIERRE
            </h3>
            <p className="text-gray-900 font-medium">
              {new Date(actividad.fecha_cierre).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            MAX. INTEGRANTE POR EQUIPO
          </h3>
          <p className="text-gray-900 font-medium">
            {actividad.maximo_integrantes} estudiantes
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            TIPO DE ALCANCE
          </h3>
          <p className="text-gray-900 font-medium">
            {actividad.id_tipo_alcance === 1 ? "Investigativo" : "Desarrollo"}
          </p>
        </div>

        {esquemaInfo && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              ESQUEMA
            </h3>
            <p className="text-gray-900 font-medium">
              {esquemaInfo.id_esquema}
            </p>
          </div>
        )}

        {selectedItemsHierarchy.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              ÍTEMS SELECCIONADOS ({actividad.Actividad_items?.length || 0})
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <ItemsDisplayTree items={selectedItemsHierarchy} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ItemsDisplayTree = ({ items, level = 0 }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`space-y-2 ${level > 0 ? "ml-6" : ""}`}>
      {items.map((item) => (
        <div key={item.id_item}>
          <div className="flex items-center gap-2 py-1">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            <span
              className={`${level === 0 ? "font-semibold text-gray-900" : "text-gray-700"
                }`}
            >
              {item.nombre}
            </span>
          </div>
          {item.subitems && item.subitems.length > 0 && (
            <ItemsDisplayTree items={item.subitems} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupDetail;

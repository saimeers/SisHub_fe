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
import CompletarDatos from "../../modules/student/components/ProjectForm";
import SuggestionReview from "../../modules/student/components/SuggestionReview";
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
} from "../../services/ProyectoServices";
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

  // Estado para bancos de ideas
  const [ideasLibres, setIdeasLibres] = useState([]);
  const [ideasGrupo, setIdeasGrupo] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [proyectosContinuables, setProyectosContinuables] = useState([]);
  const [viewMode, setViewMode] = useState(null); // 'idea', 'propuesta', 'proyecto'
  const [selectedItem, setSelectedItem] = useState(null);
  const [ideaReadOnly, setIdeaReadOnly] = useState(false);

  const groupParams = { codigo_materia, nombre, periodo, anio };

  const loadIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const [propuestasResponse, libresResponse, continuablesResponse] = await Promise.all([
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
      } else if (type === "propuesta" || type === "proyecto") {
        itemData = item;
      } else {
        itemData = item;
      }

      const objetivosArray = Array.isArray(itemData.objetivos_especificos)
        ? itemData.objetivos_especificos
        : typeof itemData.objetivos_especificos === "string"
          ? itemData.objetivos_especificos.split(/\r?\n/).filter((line) => line.trim())
          : [""];

      setIdeaInitialData({
        titulo: itemData.titulo || itemData.Idea?.titulo || "",
        problematica: itemData.problema || itemData.Idea?.problema || "",
        justificacion: itemData.justificacion || itemData.Idea?.justificacion || "",
        objetivo_general: itemData.objetivo_general || itemData.Idea?.objetivo_general || "",
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
        // Ya está en ideaForm, solo cambiar a modo edición
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
        await adoptarPropuesta(selectedItem.id_proyecto, userData.codigo, groupParams);
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
        await continuarProyecto(selectedItem.id_proyecto, userData.codigo);
        toast.success("Proyecto continuado exitosamente");
        backToActivities();
        loadIdeas();
      } catch (err) {
        toast.error(err.message || "Error al continuar el proyecto");
      }
    }
  };

  const handleActivityClick = async (activity) => {
    try {
      if (!userData?.codigo) {
        error("No se pudo obtener tu información de usuario");
        return;
      }

      const response = await verificarIdeaYProyecto(userData.codigo, groupParams);
      const { proyecto, idea } = response.data || response;

      // Si no tiene idea ni proyecto, mostrar banco de ideas
      if (!proyecto && !idea) {
        setSelectedActivity(activity);
        setCurrentView("ideas");
        return;
      }

      // Si tiene idea, verificar estado
      if (idea) {
        const estadoIdea = idea.estado;

        if (estadoIdea === "REVISION") {
          toast.info("Tu idea está en revisión. Por favor espera la respuesta del docente.");
          return;
        }

        if (estadoIdea === "RECHAZADO") {
          setCurrentIdeaId(idea.id_idea);
          setCurrentView("rejected");
          return;
        }

        if (estadoIdea === "STAND_BY") {
          setCurrentIdeaId(idea.id_idea);
          setCurrentIdeaData(idea);
          setCurrentView("suggestion");
          return;
        }

        if (estadoIdea === "APROBADO") {
          // Si está aprobada pero no tiene proyecto, mostrar completar datos
          if (!proyecto || !proyecto.estado) {
            setCurrentIdeaId(idea.id_idea);
            setCurrentIdeaData(idea);
            setCurrentView("completarDatos");
            return;
          }

          // Si tiene proyecto EN_CURSO
          if (proyecto.estado === "EN_CURSO") {
            // Por ahora dejamos vacío como indicaste
            toast.info("Proyecto en curso. Vista próximamente...");
            return;
          }
        }
      }

      // Si no cae en ninguno de los casos anteriores, mostrar banco de ideas
      setSelectedActivity(activity);
      setCurrentView("ideas");
    } catch (err) {
      console.error("Error al verificar estado del estudiante:", err);
      error("No fue posible verificar tu estado actual");
    }
  };

  const backToActivities = () => {
    setCurrentView("activities");
    setSelectedActivity(null);
    setCurrentIdeaId(null);
    setCurrentIdeaData(null);
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
      const objetivos_especificos = payload.objetivos_especificos?.join("\n") || "";

      const integrantes = payload.integrantes
        ? payload.integrantes.map((m) => (typeof m === "string" ? m : m.codigo || m.value))
        : [];

      if (currentIdeaId) {
        // Actualizar idea existente (adoptada o con correcciones)
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

      if (!codigo_materia || !nombre || !periodo || !anio || !userData?.codigo) {
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

        setParticipants(Array.isArray(participantsData) ? participantsData : []);
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
          setValidationError("Error al cargar los datos del grupo. Por favor, intenta nuevamente.");
        }
        setIsAuthorized(false);
        error("No se pudieron cargar los datos del grupo");
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupData();
  }, [codigo_materia, nombre, periodo, anio, userData, error]);

  useEffect(() => {
    if (activeTab !== "proyecto") {
      setCurrentView("activities");
      setSelectedActivity(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (currentView === "ideas" && isAuthorized && groupParams.codigo_materia) {
      loadIdeas();
    }
  }, [currentView, isAuthorized, codigo_materia, nombre, periodo, anio]);

  const tabs = [
    { id: "proyecto", label: "Proyecto" },
    { id: "equipo", label: "Equipo" },
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
                    <p className="text-gray-500 text-center py-6">Cargando participantes...</p>
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
                {currentView === "activities" && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <ActivityCard
                      title="Actividad 1"
                      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                      onClick={() =>
                        handleActivityClick({
                          id: 1,
                          title: "Actividad 1",
                        })
                      }
                    />
                  </div>
                )}

                {currentView === "ideas" && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <button
                        type="button"
                        onClick={backToActivities}
                        className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50"
                      >
                        ← Volver a Actividades
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
                            title: proyecto.Idea?.titulo || proyecto.linea_investigacion,
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
                )}

                {currentView === "ideaForm" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <button
                        type="button"
                        onClick={() => setCurrentView(viewMode ? "ideas" : "ideas")}
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
                )}

                {currentView === "rejected" && (
                  <RejectedIdea
                    idIdea={currentIdeaId}
                    currentUserCode={userData?.codigo}
                    onBack={backToActivities}
                  />
                )}

                {currentView === "suggestion" && (
                  <SuggestionReview
                    idIdea={currentIdeaId}
                    ideaData={currentIdeaData}
                    groupParams={groupParams}
                    currentUserCode={userData?.codigo}
                    onBack={backToActivities}
                  />
                )}

                {currentView === "completarDatos" && (
                  <CompletarDatos
                    idIdea={currentIdeaId}
                    ideaData={currentIdeaData}
                    onSubmit={handleSubmitCompletarDatos}
                    onBack={backToActivities}
                    userData={userData}
                  />
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
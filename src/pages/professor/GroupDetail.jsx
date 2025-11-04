import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import ReviewIdea from "../../modules/professor/components/ReviewIdea";
import GroupParticipants from "../../components/ui/GroupParticipants";
import AccessDenied from "../../components/ui/AccessDenied";
import { listarParticipantesGrupo } from "../../services/groupUserServices";
import { listarGruposPorUsuario } from "../../services/groupServices";
import {
  verificarActividadGrupo,
  obtenerActividadById,
  crearActividad,
  editarActividad,
} from "../../services/actividadService";
import {
  listarEsquemasPorTipo,
  listarItemsPorEsquema,
} from "../../services/esquemaService";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";
import { listarIdeasGrupo } from "../../services/ideaServices";
import ProjectCard from "../../components/ui/ProjectCard";
import ProjectDetailsView from "../../components/ui/ProjectDetailsView";
import ProjectDocumentsView from "../../components/ui/ProjectDocumentsView";
import ProjectDevelopmentView from "../../components/ui/ProjectDevelopmentView";
import ProjectVersionsView from "../../components/ui/ProjectVersionsView";
import CalificarProyecto from "../../modules/professor/components/CalificarProyecto";
import ReviewProyecto from "../../modules/professor/components/ReviewProyecto";
import ProyectoCalificado from "../../components/ui/ProyectoCalificado";
import { listarProyectosPorGrupo } from "../../services/projectServices";
import { toast } from "react-toastify";

const GroupDetail = () => {
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

  const [currentView, setCurrentView] = useState("checkActivity"); // checkActivity | activityDetail | createActivity | editActivity | ideasList
  const [tieneActividad, setTieneActividad] = useState(null);
  const [actividad, setActividad] = useState(null);
  const [esquemaInfo, setEsquemaInfo] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [selectedIdeaForReview, setSelectedIdeaForReview] = useState(null);

  const [groupIdeas, setGroupIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [groupProjects, setGroupProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const groupParams = { codigo_materia, nombre, periodo, anio };
  // Cargar datos del grupo
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
        const professorGroups = await listarGruposPorUsuario(userData.codigo);

        const isAssignedToGroup = professorGroups.some(
          (group) =>
            String(group.codigo_materia) === String(codigo_materia) &&
            String(group.nombre_grupo) === String(nombre) &&
            String(group.periodo_grupo) === String(periodo) &&
            String(group.anio_grupo) === String(anio)
        );

        if (!isAssignedToGroup) {
          setValidationError(
            "No estás asignado a este grupo o la materia no existe en el catálogo."
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

  // Verificar actividad cuando se selecciona la pestaña proyecto
  useEffect(() => {
    if (activeTab === "proyecto" && isAuthorized) {
      checkActivity();
    }
  }, [activeTab, isAuthorized]);

  const checkActivity = async () => {
    setLoadingActivity(true);
    try {
      const tiene = await verificarActividadGrupo(
        codigo_materia,
        nombre,
        periodo,
        anio
      );

      console.log("📦 Respuesta verificar actividad:", tiene);

      if (tiene.tieneActividad) {
        const response = await obtenerActividadById(tiene.id_actividad);
        console.log("✅ Actividad obtenida:", response);

        setActividad(response.actividad);
        console.log("Actividad de la actividad:", response.actividad);
        setEsquemaInfo(response.esquema);
        console.log("Esquema de la actividad:", response.esquema);
        setTieneActividad(true);
        setCurrentView("activityDetail");
      } else {
        setTieneActividad(false);
        setActividad(null);
        setEsquemaInfo(null);
        setCurrentView("createActivity");
      }
    } catch (err) {
      console.error("Error al verificar actividad:", err);
      toast.error("Error al verificar la actividad del grupo");
      setTieneActividad(false);
      setActividad(null);
      setEsquemaInfo(null);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleActivityCreated = async (newActivity) => {
    console.log("🎉 Actividad creada:", newActivity);

    // Recargar la actividad completa desde el servidor
    try {
      setLoadingActivity(true);

      // Si newActivity tiene id_actividad, usarlo directamente
      const activityId =
        newActivity.id_actividad || newActivity.data?.id_actividad;

      if (activityId) {
        const response = await obtenerActividadById(activityId);
        console.log("✅ Actividad recargada:", response);

        setActividad(response.actividad);
        setEsquemaInfo(response.esquema);
        setTieneActividad(true);
        setCurrentView("activityDetail");
        toast.success("Actividad creada exitosamente");
      } else {
        // Si no hay id, hacer checkActivity para obtener la actividad
        await checkActivity();
      }
    } catch (err) {
      console.error("❌ Error al cargar actividad creada:", err);
      // Como fallback, verificar la actividad del grupo
      await checkActivity();
      toast.success("Actividad creada exitosamente");
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleActivityUpdated = async (updatedActivity) => {
    console.log("🔄 Actividad actualizada:", updatedActivity);

    // Recargar la actividad completa desde el servidor
    try {
      setLoadingActivity(true);

      const activityId =
        updatedActivity.id_actividad || initialData?.id_actividad;

      if (activityId) {
        const response = await obtenerActividadById(activityId);
        console.log("✅ Actividad recargada:", response);

        setActividad(response.actividad);
        setEsquemaInfo(response.esquema);
        setCurrentView("activityDetail");
        toast.success("Actividad actualizada exitosamente");
      } else {
        // Si no hay id, hacer checkActivity
        await checkActivity();
      }
    } catch (err) {
      console.error("❌ Error al cargar actividad actualizada:", err);
      // Como fallback, verificar la actividad del grupo
      await checkActivity();
      toast.success("Actividad actualizada exitosamente");
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleEditActivity = () => {
    setCurrentView("editActivity");
  };

  // Cambiar a vista de ideas y proyectos al hacer click en el card de la actividad
  const handleViewIdeas = async () => {
    setLoadingIdeas(true);
    setLoadingProjects(true);
    try {
      const [ideasResp, projectsResp] = await Promise.all([
        listarIdeasGrupo(groupParams),
        listarProyectosPorGrupo(groupParams),
      ]);
      console.log("idea principal:",ideasResp);
      console.log("proyecto principal:", projectsResp);
      // Ideas retorna: { total, grupo, data: [...] }
      const ideas = ideasResp?.data ?? [];
      setGroupIdeas(Array.isArray(ideas) ? ideas : []);

      // Proyectos retorna: [...] (array directo)
      setGroupProjects(Array.isArray(projectsResp) ? projectsResp : []);

      setCurrentView("ideasList");
    } catch (err) {
      console.error("Error al listar ideas/proyectos del grupo:", err);
      toast.error("No se pudieron cargar las ideas/proyectos del grupo");
    } finally {
      setLoadingIdeas(false);
      setLoadingProjects(false);
    }
  };

  const handleBackToActivity = () => {
    setCurrentView("activityDetail");
  };

  const handleReviewIdea = (ideaId) => {
    setSelectedIdeaForReview(ideaId);
    setCurrentView("reviewIdea");
  };

  const handleBackFromReview = () => {
    setSelectedIdeaForReview(null);
    setCurrentView("ideasList");
  };

  const handleReviewComplete = async () => {
    setLoadingIdeas(true);
    try {
      const ideasResp = await listarIdeasGrupo(groupParams);
      const ideas = ideasResp?.data ?? [];
      console.log("ideas secundarias:", ideas)
      setGroupIdeas(Array.isArray(ideas) ? ideas : []);
      toast.success("Las ideas han sido actualizadas");
    } catch (err) {
      console.error("Error al recargar ideas:", err);
      toast.error("Error al actualizar las ideas");
    } finally {
      setLoadingIdeas(false);
    }

    setSelectedIdeaForReview(null);
    setCurrentView("ideasList");
  };

  const tabs = [
    { id: "proyecto", label: "Actividad" },
    { id: "participantes", label: "Participantes" },
  ];

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
      <div className="w-full max-w-7xl mx-auto py-10 px-6 bg-white rounded-2xl shadow-sm">
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
                ) : currentView === "createActivity" ? (
                  <ActivityForm
                    groupParams={groupParams}
                    onSubmit={handleActivityCreated}
                    onCancel={() => setCurrentView("checkActivity")}
                  />
                ) : currentView === "editActivity" ? (
                  <ActivityForm
                    groupParams={groupParams}
                    initialData={actividad}
                    esquemaInfo={esquemaInfo}
                    isEditing={true}
                    onSubmit={handleActivityUpdated}
                    onCancel={() => setCurrentView("activityDetail")}
                  />
                ) : currentView === "activityDetail" && actividad ? (
                  <ActivityDetail
                    actividad={actividad}
                    esquemaInfo={esquemaInfo}
                    onEdit={handleEditActivity}
                    onViewIdeas={handleViewIdeas}
                  />
                ) : currentView === "reviewIdea" ? (
                  <ReviewIdea
                    idIdea={selectedIdeaForReview}
                    currentUserCode={userData?.codigo}
                    onBack={handleBackFromReview}
                    onReviewComplete={handleReviewComplete}
                  />
                ) : currentView === "ideasList" ? (
                  <IdeasListView
                    loadingIdeas={loadingIdeas}
                    loadingProjects={loadingProjects}
                    ideas={groupIdeas}
                    projects={groupProjects}
                    onBack={handleBackToActivity}
                    onReviewIdea={handleReviewIdea}
                    userData={userData}
                    groupParams={groupParams}
                  />
                ) : null}
              </div>
            )}

          </div>
        )}
      </div>
    </ProfessorLayout>
  );
};
const IdeasListView = ({
  loadingIdeas,
  loadingProjects,
  ideas,
  projects,
  onBack,
  onReviewIdea,
   userData,
  groupParams,
}) => {
  const [currentView, setCurrentView] = useState("list"); // list | details | documents | development | versions
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [statusInfoMessage, setStatusInfoMessage] = useState("");
  const [documentsInfoMessage, setDocumentsInfoMessage] = useState("");
  const [developmentInfoMessage, setDevelopmentInfoMessage] = useState("");
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const hasIdeas = ideas && ideas.length > 0;
  const hasProjects = projects && projects.length > 0;
  const isLoading = loadingIdeas || loadingProjects;
  const isEmpty = !hasIdeas && !hasProjects && !isLoading;
  console.log(projects);
  // Removed long descriptive status mapping; we now use concise labels via getProjectShortStatus

  const getProjectShortStatus = (ideaStatusRaw, projectStatusRaw) => {
    const idea = ideaStatusRaw ? ideaStatusRaw : null;
    const proj = projectStatusRaw ? projectStatusRaw : null;

    if (idea === "REVISION" && proj === null) return "A revisar";
    if (idea === "STAND_BY" && proj === null) return "En espera de corrección del estudiante";
    if (idea === "APROBADO" && proj === null) return "En espera de que el estudiante datos";
    if (idea === "REVISION" && proj === "SELECCIONADO") return "A revisar";
    if (idea === "REVISION" && proj === "CALIFICADO") return "A revisar";
    if (idea === "STAND_BY" && proj === "SELECCIONADO") return "En espera de corrección del estudiante.";
    if (idea === "STAND_BY" && proj === "CALIFICADO") return "En espera de corrección del estudiante.";
    if (idea === "APROBADO" && proj === "EN_CURSO") return "Esperando entregables";
    if (idea === "REVISION" && proj === "EN_CURSO") return "A calificar";
    if (idea === "APROBADO" && proj === "CALIFICADO") return "Calificado";
    if (idea === "LIBRE" && proj === "CALIFICADO") return "Propuesta libre";
    if (idea === "LIBRE" && proj === null) return "Idea libre";

    return proj || idea || "EN_CURSO";
  };

  const getAllStatuses = () => {
    const set = new Set();
    (projects || []).forEach((proy) => {
      const txt = getProjectShortStatus(
        proy?.Idea?.estado,
        proy?.estado
      );
      if (txt) set.add(txt);
    });
    return Array.from(set);
  };

  const filteredProjects = (projects || []).filter((proy) => {
    const title = proy?.Idea?.titulo || "Proyecto";
    const description = proy?.Idea?.objetivo_general || proy?.linea_investigacion || "";
    const technologies = Array.isArray(proy?.tecnologias)
      ? proy.tecnologias.join(", ")
      : (proy?.tecnologias || "");
    const statusText = getProjectShortStatus(
      proy?.Idea?.estado,
      proy?.estado
    );

    const textOk = filterText
      ? [title, description, technologies]
        .join(" ")
        .toLowerCase()
        .includes(filterText.toLowerCase())
      : true;
    const statusOk = filterStatus && filterStatus !== "__IDEAS_REVISION__"
      ? statusText === filterStatus
      : !filterStatus || filterStatus === "";
    return textOk && statusOk;
  });

  const renderProjects = () => {
    const getSelectedProject = () =>
      projects.find((p) => p?.id_proyecto === selectedProjectId);

    if (currentView === "calificarProyecto" && selectedProjectId) {
      return (
        <CalificarProyecto
          projectId={selectedProjectId}
          activityId={selectedActivityId}
          currentUserCode={userData?.codigo}
          onBack={() => setCurrentView("list")}
          onCalificacionComplete={async () => {
            // Recargar proyectos después de calificar
            setLoadingProjects(true);
            try {
              const projectsResp = await listarProyectosPorGrupo(groupParams);
              setGroupProjects(Array.isArray(projectsResp) ? projectsResp : []);
              toast.success("Proyecto calificado exitosamente");
            } catch (err) {
              console.error("Error al recargar proyectos:", err);
            } finally {
              setLoadingProjects(false);
            }
            setCurrentView("list");
          }}
        />
      );
    }

    if (currentView === "reviewProyecto" && selectedProjectId) {
      return (
        <ReviewProyecto
          projectId={selectedProjectId}
          currentUserCode={userData?.codigo}
          onBack={() => setCurrentView("list")}
          onReviewComplete={async () => {
            // Recargar proyectos después de revisar
            setLoadingProjects(true);
            try {
              const projectsResp = await listarProyectosPorGrupo(groupParams);
              setGroupProjects(Array.isArray(projectsResp) ? projectsResp : []);
              toast.success("Proyecto revisado exitosamente");
            } catch (err) {
              console.error("Error al recargar proyectos:", err);
            } finally {
              setLoadingProjects(false);
            }
            setCurrentView("list");
          }}
        />
      );
    }

    // Vista: ProyectoCalificado
    if (currentView === "proyectoCalificado" && selectedProjectId) {
      return (
        <ProyectoCalificado
          projectId={selectedProjectId}
          onBack={() => setCurrentView("list")}
        />
      );
    }

    if (currentView === "statusInfo" && selectedProjectId) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Estado del proyecto</h3>
            <button
              onClick={() => setCurrentView("list")}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              ← Volver
            </button>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-700 whitespace-pre-line">{statusInfoMessage}</p>
          </div>
        </div>
      );
    }
    if (currentView === "documentsInfo" && selectedProjectId) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Entregables</h3>
            <button
              onClick={() => setCurrentView("list")}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              ← Volver
            </button>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-700">{documentsInfoMessage || "Entregables enviados a calificar"}</p>
          </div>
        </div>
      );
    }
    if (currentView === "developmentInfo" && selectedProjectId) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Desarrollo</h3>
            <button
              onClick={() => setCurrentView("list")}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              ← Volver
            </button>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-700">{developmentInfoMessage || "Entregables enviados a calificar"}</p>
          </div>
        </div>
      );
    }

    if (currentView === "details" && selectedProjectId) {
      const sel = getSelectedProject();
      const idea = sel?.Idea?.estado
        ? sel.Idea.estado
        : null;
      const proj = sel?.estado
        ? sel.estado
        : null;

      const showSentForReviewNotice = idea === "REVISION" && proj === "EN_CURSO";

      return (
        <div className="space-y-4">
          {showSentForReviewNotice && (
            <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800">
              Proyectos entregados para calificación
            </div>
          )}
          <ProjectDetailsView
            projectId={selectedProjectId}
            onBack={() => setCurrentView("list")}
          />
        </div>
      );
    }
    if (currentView === "documents" && selectedProjectId) {
      return (
        <ProjectDocumentsView
          projectId={selectedProjectId}
          activityId={selectedActivityId}
          onBack={() => setCurrentView("list")}
        />
      );
    }
    if (currentView === "development" && selectedProjectId) {
      return (
        <ProjectDevelopmentView
          projectId={selectedProjectId}
          activityId={selectedActivityId}
          onBack={() => setCurrentView("list")}
        />
      );
    }
    if (currentView === "versions" && selectedProjectId) {
      return (
        <ProjectVersionsView
          projectId={selectedProjectId}
          onBack={() => setCurrentView("list")}
        />
      );
    }

    return (
      <div className="space-y-4">
        {(filteredProjects.length > 0 ? filteredProjects : []).map((proy, idx) => {
          const tags = Array.isArray(proy?.tecnologias)
            ? proy.tecnologias
            : typeof proy?.tecnologias === "string"
              ? proy.tecnologias
                .split(",")
                .map((t) => t)
                .filter(Boolean)
              : proy?.tags || [];

          const progress = typeof proy?.porcentaje === "number" ? proy.porcentaje : 0;
          console.log("proyecto",proy)
          const alcanceTexto = proy?.Tipo_alcance?.nombre || proy?.tipo_alcance || undefined;
          const statusTexto = getProjectShortStatus(
            proy?.Idea?.estado,
            proy?.estado
          );

          const handleProjectClick = () => {
            const ideaState = proy?.Idea?.estado || null;
            const projectState = proy?.estado || null;
            const idea = ideaState ? ideaState : null;
            const proj = projectState ? projectState : null;
            console.log("estado proyecto v1:", proj);
            console.log("estado idea v1:", idea);
            console.log("id_actividad:", proy.id_actividad);
            
            setSelectedProjectId(proy.id_proyecto);

            // 📍 REEMPLAZAR toda esta lógica con:

            // CASO 1: REVISION + SELECCIONADO/CALIFICADO → ReviewProyecto
            if (idea === "REVISION" && (proj === "SELECCIONADO" || proj === "CALIFICADO")) {
              setCurrentView("reviewProyecto");
              return;
            }

            // CASO 2: STAND_BY + SELECCIONADO/CALIFICADO → Toast
            if (idea === "STAND_BY" && (proj === "SELECCIONADO" || proj === "CALIFICADO")) {
              toast.info("El estudiante debe corregir las observaciones antes de continuar");
              return;
            }

            // CASO 3: APROBADO + EN_CURSO → Toast
            if (idea === "APROBADO" && proj === "EN_CURSO") {
              toast.info("Esperando que el estudiante suba entregables");
              return;
            }

            // CASO 4: REVISION + EN_CURSO → CalificarProyecto
            if (idea === "REVISION" && proj === "EN_CURSO") {
              // Necesitamos obtener el id_actividad del proyecto
              setSelectedActivityId(proy.id_actividad); 
              setCurrentView("calificarProyecto");
              return;
            }

            // CASO 5: APROBADO + CALIFICADO → ProyectoCalificado
            if (idea === "APROBADO" && proj === "CALIFICADO") {
              setCurrentView("proyectoCalificado");
              return;
            }

            // CASO 6: SELECCIONADO o CALIFICADO sin REVISION → StatusInfo
            if (proj === "SELECCIONADO" || proj === "CALIFICADO") {
              setStatusInfoMessage(statusTexto);
              setCurrentView("statusInfo");
              return;
            }

            // CASO DEFAULT: Mostrar detalles
            setCurrentView("details");
          };

          return (
            <ProjectCard
              key={proy?.id_proyecto || proy?.id || idx}
              title={proy?.Idea?.titulo || "Proyecto"}
              description={
                proy?.Idea?.objetivo_general || proy?.linea_investigacion || ""
              }
              status={statusTexto}
              progress={progress}
              tags={tags}
              tipoAlcance={alcanceTexto}
              onDocumentsClick={() => {
                const ideaState = proy?.Idea?.estado || null;
                const projectState = proy?.estado || null;
                const idea = ideaState ? ideaState : null;
                const proj = projectState ? projectState : null;

                setSelectedProjectId(proy.id_proyecto);
                if (idea === "REVISION" && proj === "EN_CURSO") {
                  setDocumentsInfoMessage("Entregables enviados a calificar. Usa el botón principal para calificar.");
                  setCurrentView("documentsInfo");
                } else {
                  setSelectedActivityId(proy.id_actividad); 
                  setCurrentView("documents");
                }
              }}
              onCodeClick={() => {
                const idea = proy?.Idea?.estado || null;
                const proj = proy?.estado || null;
                console.log("estado idea v2:", idea);
                console.log("estado projecto v2:", proj);
                setSelectedProjectId(proy.id_proyecto);

                if (idea === "REVISION" && proj === "EN_CURSO") {
                  setDevelopmentInfoMessage("Entregables enviados a calificar. Usa el botón principal para calificar.");
                  setCurrentView("developmentInfo");
                } else {
                  setSelectedActivityId(proy.id_actividad); 
                  setCurrentView("development");
                }
              }}
              onVersionsClick={() => {
                setSelectedProjectId(proy.id_proyecto);
                setCurrentView("versions");
              }}
              onClick={() => {
                handleProjectClick();
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">


      {currentView === "list" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Buscar por título, descripción o tecnología"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="__IDEAS_REVISION__">Ideas en revisión</option>
              {getAllStatuses().map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div></div>
          </div>
          {(filterText || filterStatus) && (
            <div className="flex justify-end mt-3">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900 underline"
                onClick={() => {
                  setFilterText("");
                  setFilterStatus("");
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mensaje cuando no hay ni ideas ni proyectos */}
      {isEmpty && (
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 text-lg font-medium mb-2">
            No hay ideas ni proyectos registrados
          </p>
        </div>
      )}

      {/* Contenido cuando hay ideas o proyectos */}
      {!isEmpty && (
        <div className="space-y-8">
          {/* Sección de Ideas - Solo mostrar si hay ideas */}
          {currentView === "list" && (hasIdeas || loadingIdeas) && (filterStatus === "" || filterStatus === "__IDEAS_REVISION__") && (
            <section>
              {loadingIdeas ? (
                <div className="flex items-center justify-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Cargando ideas...</span>
                </div>
              ) : hasIdeas ? (
                <div className="space-y-4">
                  {(filterStatus === "__IDEAS_REVISION__"
                    ? ideas.filter(
                      (i) =>
                        (i?.estado || "") === "REVISION" &&
                        (!filterText ||
                          ((i?.titulo || "") + " " + (i?.objetivo_general || ""))
                            .toLowerCase()
                            .includes(filterText.toLowerCase()))
                    )
                    : ideas.filter(
                      (i) =>
                        !filterText ||
                        ((i?.titulo || "") + " " + (i?.objetivo_general || ""))
                          .toLowerCase()
                          .includes(filterText.toLowerCase())
                    )
                  ).map((idea, idx) => {
                    const isEnRevision =
                      idea?.estado === "REVISION";

                    return (
                      <div
                        key={idea?.id_idea || idea?.id || idx}
                        onClick={() => {
                          console.log(
                            "🖱️ Click en idea:",
                            idea.id_idea,
                            "Estado:",
                            idea?.estado
                          );
                          if (isEnRevision && onReviewIdea) {
                            onReviewIdea(idea.id_idea);
                          } else if (!isEnRevision) {
                            console.log("⚠️ Idea no está en revisión");
                          }
                        }}
                        className={`${isEnRevision
                          ? "cursor-pointer hover:shadow-lg hover:border-red-300"
                          : "cursor-default opacity-60"
                          } transition-all`}
                      >
                        <ProjectCard
                          title={idea?.titulo || "Idea"}
                          description={idea?.objetivo_general || ""}
                          status={(() => {
                            const st = (idea?.estado || "");
                            if (st === "REVISION") return "A revisar";
                            if (st === "STAND_BY") return "Corrección estudiante";
                            if (st === "APROBADO") return "Completar datos";
                            if (st === "LIBRE") return "Idea libre";
                            return st || "REVISION";
                          })()}
                          progress={0}
                          hideTags
                          hideActions
                          hideProgress
                          hideAlcance
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          )}

          {/* Sección de Proyectos - Solo mostrar si hay proyectos */}
          {(hasProjects || loadingProjects) && (filterStatus !== "__IDEAS_REVISION__") && (
            <section>
              {loadingProjects ? (
                <div className="flex items-center justify-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="ml-3 text-gray-500">
                    Cargando proyectos...
                  </span>
                </div>
              ) : hasProjects ? (
                renderProjects()
              ) : null}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

console.log("🔧 Handlers definidos:", {
  handleReviewIdea: typeof handleReviewIdea,
  handleBackFromReview: typeof handleBackFromReview,
  handleReviewComplete: typeof handleReviewComplete,
});

const ActivityDetail = ({ actividad, esquemaInfo, onEdit, onViewIdeas }) => {
  const buildItemsHierarchy = () => {
    if (!actividad.Actividad_items || !esquemaInfo?.Items) return [];

    const selectedItemIds = actividad.Actividad_items.map(
      (ai) => ai.Item.id_item
    );
    const allItems = esquemaInfo.Items;
    
    // Filtrar solo los items seleccionados y construir jerarquía
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
      className="rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] overflow-hidden bg-white"
      onClick={onViewIdeas}
    >
      <div
        className="relative px-6 py-10 text-center text-white"
        style={{
          background:
            "linear-gradient(90deg, #ed3a3aff 0%, #d94228ff 50%, #b62121ff 100%)",
        }}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide">
          {actividad.titulo}
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute right-6 top-6 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          title="Editar actividad"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
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
            <ItemsDisplayTree items={selectedItemsHierarchy} />
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

const ActivityForm = ({
  groupParams,
  initialData = null,
  esquemaInfo = null,
  isEditing = false,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState({
    titulo: initialData?.titulo || "",
    descripcion: initialData?.descripcion || "",
    fecha_inicio: initialData?.fecha_inicio || "",
    fecha_cierre: initialData?.fecha_cierre || "",
    maximo_integrantes: initialData?.maximo_integrantes || 2,
    id_tipo_alcance: initialData?.id_tipo_alcance || "",
  });

  const [selectedEsquema, setSelectedEsquema] = useState(null);
  const [esquemas, setEsquemas] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingEsquemas, setLoadingEsquemas] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const tiposAlcance = [
    { id: 1, nombre: "Investigativo" },
    { id: 2, nombre: "Desarrollo" },
  ];

  // Cargar datos iniciales al editar
  useEffect(() => {
    if (isEditing && initialData && esquemaInfo) {
      const loadInitialData = async () => {
        try {
          // Cargar esquemas del tipo de alcance
          const esquemasData = await listarEsquemasPorTipo(
            initialData.id_tipo_alcance
          );
          setEsquemas(Array.isArray(esquemasData) ? esquemasData : []);

          // Establecer el esquema seleccionado
          setSelectedEsquema(esquemaInfo.id_esquema);

          // Cargar todos los items del esquema
          const itemsData = await listarItemsPorEsquema(esquemaInfo.id_esquema);
          setItems(Array.isArray(itemsData) ? itemsData : []);

          // Establecer items seleccionados
          const idsSeleccionados = initialData.Actividad_items.map(
            (ai) => ai.Item.id_item
          );
          setSelectedItems(idsSeleccionados);
          console.log("✅ Datos cargados en edición:", {
            esquema: esquemaInfo.id_esquema,
            itemsCount: itemsData.length,
            selectedCount: idsSeleccionados.length,
          });
        } catch (error) {
          console.error("❌ Error al cargar datos iniciales:", error);
          toast.error("Error al cargar los datos del esquema");
        }
      };

      loadInitialData();
    }
  }, [isEditing, initialData, esquemaInfo]);

  useEffect(() => {
    if (form.id_tipo_alcance) {
      loadEsquemas(form.id_tipo_alcance);
    }
  }, [form.id_tipo_alcance]);

  useEffect(() => {
    if (selectedEsquema) {
      loadItems(selectedEsquema);
    }
  }, [selectedEsquema]);

  const loadEsquemas = async (tipoId) => {
    console.log("🔍 Cargando esquemas para tipo:", tipoId);
    setLoadingEsquemas(true);
    setSelectedEsquema(null);
    setItems([]);
    setSelectedItems([]);
    try {
      const data = await listarEsquemasPorTipo(tipoId);
      setEsquemas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error al cargar esquemas:", error);
      toast.error("Error al cargar esquemas");
      setEsquemas([]);
    } finally {
      setLoadingEsquemas(false);
    }
  };

  const loadItems = async (esquemaId) => {
    setLoadingItems(true);
    setSelectedItems([]);

    try {
      const data = await listarItemsPorEsquema(esquemaId);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error al cargar items:", error);
      toast.error("Error al cargar items del esquema");
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "id_tipo_alcance" && !isEditing) {
      setSelectedEsquema(null);
      setItems([]);
      setSelectedItems([]);
    }
  };

  // Función para obtener todos los descendientes de un item
  const getAllDescendants = (itemId, allItems) => {
    const descendants = [];
    const findChildren = (parentId) => {
      allItems.forEach((item) => {
        if (item.super_item === parentId) {
          descendants.push(item.id_item);
          findChildren(item.id_item);
        }
      });
    };
    findChildren(itemId);
    return descendants;
  };

  // Función para obtener todos los ancestros de un item
  const getAllAncestors = (itemId, allItems) => {
    const ancestors = [];
    const item = allItems.find((i) => i.id_item === itemId);
    if (item && item.super_item) {
      ancestors.push(item.super_item);
      const parentAncestors = getAllAncestors(item.super_item, allItems);
      ancestors.push(...parentAncestors);
    }
    return ancestors;
  };

  // Función para obtener todos los items de forma plana
  const flattenItems = (itemsList) => {
    const flat = [];
    const flatten = (items) => {
      items.forEach((item) => {
        flat.push(item);
        if (item.subitems && item.subitems.length > 0) {
          flatten(item.subitems);
        }
      });
    };
    flatten(itemsList);
    return flat;
  };

  const toggleItem = (itemId) => {
    const allItemsFlat = flattenItems(items);

    setSelectedItems((prev) => {
      const isCurrentlySelected = prev.includes(itemId);
      let newSelection = [...prev];

      if (isCurrentlySelected) {
        // Deseleccionar: quitar el item y todos sus descendientes
        const descendants = getAllDescendants(itemId, allItemsFlat);
        newSelection = newSelection.filter(
          (id) => id !== itemId && !descendants.includes(id)
        );
      } else {
        // Seleccionar: agregar el item, sus ancestros y todos sus descendientes
        const ancestors = getAllAncestors(itemId, allItemsFlat);
        const descendants = getAllDescendants(itemId, allItemsFlat);

        newSelection.push(itemId);
        ancestors.forEach((ancestorId) => {
          if (!newSelection.includes(ancestorId)) {
            newSelection.push(ancestorId);
          }
        });
        descendants.forEach((descendantId) => {
          if (!newSelection.includes(descendantId)) {
            newSelection.push(descendantId);
          }
        });
      }

      return newSelection;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      ...groupParams,
      items_seleccionados: selectedItems,
    };

    try {
      if (isEditing) {
        const result = await editarActividad(initialData.id_actividad, payload);
        onSubmit({
          ...initialData,
          ...result,
          id_actividad: initialData.id_actividad,
        });
      } else {
        const result = await crearActividad(payload);
        onSubmit(result);
      }
    } catch (error) {
      console.error("Error al guardar actividad:", error);
      toast.error("Error al guardar la actividad");
    }
  };

  const hasChanges = isEditing
    ? form.titulo !== initialData?.titulo ||
    form.descripcion !== initialData?.descripcion ||
    form.fecha_inicio !== initialData?.fecha_inicio ||
    form.fecha_cierre !== initialData?.fecha_cierre ||
    form.maximo_integrantes !== initialData?.maximo_integrantes ||
    form.id_tipo_alcance !== initialData?.id_tipo_alcance ||
    JSON.stringify(selectedItems.sort()) !==
    JSON.stringify(
      (initialData?.Actividad_items || [])
        .map((ai) => ai.Item.id_item)
        .sort()
    )
    : true;

  const canSubmit =
    form.titulo &&
    form.descripcion &&
    form.fecha_inicio &&
    form.fecha_cierre &&
    form.maximo_integrantes &&
    form.id_tipo_alcance &&
    selectedItems.length > 0 &&
    hasChanges;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Título
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Título de la actividad"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Descripción
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Describe la actividad"
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                value={form.fecha_inicio}
                onChange={(e) => handleChange("fecha_inicio", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                Fecha Cierre
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                value={form.fecha_cierre}
                onChange={(e) => handleChange("fecha_cierre", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Máximo de Integrantes
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              value={form.maximo_integrantes}
              onChange={(e) =>
                handleChange("maximo_integrantes", parseInt(e.target.value))
              }
            />
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Tipo de Alcance
            </label>
            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              value={form.id_tipo_alcance}
              onChange={(e) =>
                handleChange("id_tipo_alcance", parseInt(e.target.value))
              }
            >
              <option value="">Seleccionar tipo</option>
              {tiposAlcance.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {form.id_tipo_alcance && (
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                Esquema
              </label>
              {loadingEsquemas ? (
                <p className="text-gray-500 text-sm">Cargando esquemas...</p>
              ) : (
                <select
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={selectedEsquema || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedEsquema(value || null);
                  }}
                >
                  <option value="">Seleccionar esquema</option>
                  {esquemas.map((esq) => (
                    <option key={esq.id_esquema} value={esq.id_esquema}>
                      {esq.id_esquema}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedEsquema && (
            <div>
              <label className="block text-gray-800 font-semibold mb-3">
                Ítems del Esquema
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({selectedItems.length} seleccionados)
                </span>
              </label>
              <div className="border border-gray-300 rounded-xl p-4 max-h-[400px] overflow-y-auto bg-gray-50">
                {loadingItems ? (
                  <p className="text-gray-500 text-sm">Cargando ítems...</p>
                ) : (
                  <ItemsTree
                    items={items}
                    selectedItems={selectedItems}
                    onToggle={toggleItem}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Botones */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isEditing ? "Actualizar Actividad" : "Crear Actividad"}
        </button>
      </div>
    </div>
  );
};

const ItemsTree = ({ items, selectedItems, onToggle, level = 0 }) => {
  if (!items || items.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">No hay ítems disponibles</p>
    );
  }

  return (
    <div className={`space-y-2 ${level > 0 ? "ml-6" : ""}`}>
      {items.map((item) => {
        const isSelected = selectedItems.includes(item.id_item);
        const hasSelectedChildren =
          item.subitems &&
          item.subitems.some((sub) => selectedItems.includes(sub.id_item));
        return (
          <div key={item.id_item}>
            <label className="flex items-start gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(item.id_item)}
                className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
              />
              <span
                className={`flex-1 ${level === 0 ? "font-semibold text-gray-900" : "text-gray-700"
                  } ${hasSelectedChildren && !isSelected ? "text-red-600" : ""}`}
              >
                {item.nombre}
              </span>
            </label>
            {item.subitems && item.subitems.length > 0 && (
              <ItemsTree
                items={item.subitems}
                selectedItems={selectedItems}
                onToggle={onToggle}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GroupDetail;

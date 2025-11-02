import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import GroupParticipants from "../../components/ui/GroupParticipants";
import AccessDenied from "../../components/ui/AccessDenied";
import { listarParticipantesGrupo } from "../../services/groupUserServices";
import { listarGruposPorUsuario } from "../../services/groupServices";
import {
  verificarActividadGrupo,
  obtenerActividadById,
  crearActividad,
  editarActividad
} from "../../services/actividadService";
import {
  listarEsquemasPorTipo,
  listarItemsPorEsquema
} from "../../services/esquemaService";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";
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

  const [currentView, setCurrentView] = useState("checkActivity");
  const [tieneActividad, setTieneActividad] = useState(null);
  const [actividad, setActividad] = useState(null);
  const [esquemaInfo, setEsquemaInfo] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const groupParams = { codigo_materia, nombre, periodo, anio };

  // Cargar datos del grupo
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
      const tiene = await verificarActividadGrupo(codigo_materia, nombre, periodo, anio);

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
        setCurrentView("createActivity");
      }
    } catch (err) {
      console.error("Error al verificar actividad:", err);
      toast.error("Error al verificar la actividad del grupo");
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleActivityCreated = async (newActivity) => {
    // Recargar la actividad completa desde el servidor
    try {
      const response = await obtenerActividadById(newActivity.id_actividad);
      setActividad(response.actividad);
      setEsquemaInfo(response.esquema);
      setTieneActividad(true);
      setCurrentView("activityDetail");
      toast.success("Actividad creada exitosamente");
    } catch (err) {
      console.error("Error al cargar actividad creada:", err);
      setActividad(newActivity);
      setCurrentView("activityDetail");
      toast.success("Actividad creada exitosamente");
    }
  };

  const handleEditActivity = () => {
    setCurrentView("editActivity");
  };

  const handleActivityUpdated = async (updatedActivity) => {
    // Recargar la actividad completa desde el servidor
    try {
      const response = await obtenerActividadById(updatedActivity.id_actividad);
      setActividad(response.actividad);
      setEsquemaInfo(response.esquema);
      setCurrentView("activityDetail");
      toast.success("Actividad actualizada exitosamente");
    } catch (err) {
      console.error("Error al cargar actividad actualizada:", err);
      setActividad(updatedActivity);
      setCurrentView("activityDetail");
      toast.success("Actividad actualizada exitosamente");
    }
  };

  const tabs = [
    { id: "proyecto", label: "Proyecto" },
    { id: "equipo", label: "Equipo" },
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
                  />
                ) : null}
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
    </ProfessorLayout>
  );
};

const ActivityDetail = ({ actividad, esquemaInfo, onEdit }) => {
  // Construir estructura jerárquica de items
  const buildItemsHierarchy = () => {
    if (!actividad.Actividad_items || !esquemaInfo?.Items) return [];

    const selectedItemIds = actividad.Actividad_items.map(ai => ai.Item.id_item);
    const allItems = esquemaInfo.Items;

    // Filtrar solo los items seleccionados y construir jerarquía
    const itemsMap = {};
    allItems.forEach(item => {
      if (selectedItemIds.includes(item.id_item)) {
        itemsMap[item.id_item] = { ...item, subitems: [] };
      }
    });

    const rootItems = [];
    Object.values(itemsMap).forEach(item => {
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
    <div className="rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] overflow-hidden bg-white">
      <div
        className="relative px-6 py-10 text-center text-white"
        style={{
          background: "linear-gradient(90deg, #ed3a3aff 0%, #d94228ff 50%, #b62121ff 100%)",
        }}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide">
          {actividad.titulo}
        </h2>
        <button
          onClick={onEdit}
          className="absolute right-6 top-6 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          title="Editar actividad"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <h3 className="text-sm font-semibold text-gray-500 mb-2">DESCRIPCIÓN</h3>
          <p className="text-gray-700 leading-relaxed">{actividad.descripcion}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">FECHA INICIO</h3>
            <p className="text-gray-900 font-medium">
              {new Date(actividad.fecha_inicio).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">FECHA CIERRE</h3>
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
          <h3 className="text-sm font-semibold text-gray-500 mb-2">TIPO DE ALCANCE</h3>
          <p className="text-gray-900 font-medium">
            {actividad.id_tipo_alcance === 1 ? "Investigativo" : "Desarrollo"}
          </p>
        </div>

        {esquemaInfo && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">ESQUEMA</h3>
            <p className="text-gray-900 font-medium">{esquemaInfo.id_esquema}</p>
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
            <span className={`${level === 0 ? "font-semibold text-gray-900" : "text-gray-700"}`}>
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
          const esquemasData = await listarEsquemasPorTipo(initialData.id_tipo_alcance);
          setEsquemas(Array.isArray(esquemasData) ? esquemasData : []);

          // Establecer el esquema seleccionado
          setSelectedEsquema(esquemaInfo.id_esquema);

          // Cargar todos los items del esquema
          const itemsData = await listarItemsPorEsquema(esquemaInfo.id_esquema);
          setItems(Array.isArray(itemsData) ? itemsData : []);

          // Establecer items seleccionados
          const idsSeleccionados = initialData.Actividad_items.map(ai => ai.Item.id_item);
          setSelectedItems(idsSeleccionados);

          console.log("✅ Datos cargados en edición:", {
            esquema: esquemaInfo.id_esquema,
            itemsCount: itemsData.length,
            selectedCount: idsSeleccionados.length
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
    console.log("🔍 Cargando items para esquema:", esquemaId);
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
      allItems.forEach(item => {
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
    const item = allItems.find(i => i.id_item === itemId);
    if (item && item.super_item) {
      ancestors.push(item.super_item);
      ancestors.push(...getAllAncestors(item.super_item, allItems));
    }
    return ancestors;
  };

  // Función para obtener todos los items de forma plana
  const flattenItems = (itemsList) => {
    const flat = [];
    const flatten = (items) => {
      items.forEach(item => {
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
        newSelection = newSelection.filter(id => id !== itemId && !descendants.includes(id));
      } else {
        // Seleccionar: agregar el item, sus ancestros y todos sus descendientes
        const ancestors = getAllAncestors(itemId, allItemsFlat);
        const descendants = getAllDescendants(itemId, allItemsFlat);
        
        newSelection.push(itemId);
        ancestors.forEach(ancestorId => {
          if (!newSelection.includes(ancestorId)) {
            newSelection.push(ancestorId);
          }
        });
        descendants.forEach(descendantId => {
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
        onSubmit({ ...initialData, ...result, id_actividad: initialData.id_actividad });
      } else {
        const result = await crearActividad(payload);
        onSubmit(result);
      }
    } catch (error) {
      console.error("Error al guardar actividad:", error);
      toast.error("Error al guardar la actividad");
    }
  };

  const hasChanges = isEditing ? (
    form.titulo !== initialData?.titulo ||
    form.descripcion !== initialData?.descripcion ||
    form.fecha_inicio !== initialData?.fecha_inicio ||
    form.fecha_cierre !== initialData?.fecha_cierre ||
    form.maximo_integrantes !== initialData?.maximo_integrantes ||
    form.id_tipo_alcance !== initialData?.id_tipo_alcance ||
    JSON.stringify(selectedItems.sort()) !== JSON.stringify(
      (initialData?.Actividad_items || []).map(ai => ai.Item.id_item).sort()
    )
  ) : true;

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
            <label className="block text-gray-800 font-semibold mb-2">Título</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Título de la actividad"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Descripción</label>
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
              onChange={(e) => handleChange("id_tipo_alcance", parseInt(e.target.value))}
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
              <label className="block text-gray-800 font-semibold mb-2">Esquema</label>
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
        const hasSelectedChildren = item.subitems && item.subitems.some(
          sub => selectedItems.includes(sub.id_item)
        );
        
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
                className={`flex-1 ${
                  level === 0 
                    ? "font-semibold text-gray-900" 
                    : "text-gray-700"
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